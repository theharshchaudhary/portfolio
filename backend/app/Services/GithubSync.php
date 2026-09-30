<?php

namespace App\Services;

use App\Models\GithubSnapshot;
use App\Models\Project;
use App\Models\SiteSetting;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Pulls public GitHub data for the site owner and caches it in github_snapshots.
 * Runs on a schedule (CI calls the ops endpoint) and from the admin "Sync now" button.
 */
class GithubSync
{
    private const QUERY = <<<'GRAPHQL'
    query($login: String!) {
      user(login: $login) {
        login
        followers { totalCount }
        following { totalCount }
        createdAt
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount contributionLevel } }
          }
        }
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, orderBy: {field: PUSHED_AT, direction: DESC}) {
          nodes {
            nameWithOwner name description url homepageUrl stargazerCount forkCount pushedAt
            primaryLanguage { name color }
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } }
            latestRelease { tagName publishedAt url }
          }
        }
      }
    }
    GRAPHQL;

    private const LEVELS = [
        'NONE' => 0, 'FIRST_QUARTILE' => 1, 'SECOND_QUARTILE' => 2, 'THIRD_QUARTILE' => 3, 'FOURTH_QUARTILE' => 4,
    ];

    public function __construct(private SiteBuilder $builder) {}

    /** @return array<string, int> counts of what was stored, for logs and the admin notification */
    public function run(): array
    {
        $login = $this->username();
        $user = $this->client()
            ->post('https://api.github.com/graphql', ['query' => self::QUERY, 'variables' => ['login' => $login]])
            ->throw()
            ->json();

        if (! empty($user['errors'])) {
            throw new RuntimeException('GitHub GraphQL error: '.json_encode($user['errors']));
        }
        $user = $user['data']['user'] ?? throw new RuntimeException("GitHub user '{$login}' not found");

        $days = $this->contributionDays($user);
        $repos = $user['repositories']['nodes'];

        $this->store('profile', [
            'login' => $user['login'],
            'followers' => $user['followers']['totalCount'],
            'following' => $user['following']['totalCount'],
            'joinedAt' => $user['createdAt'],
        ]);
        $this->store('contributions', $days);
        $this->store('streak', $this->streak($days, $user['contributionsCollection']['contributionCalendar']['totalContributions']));
        $this->store('languages', $this->languages($repos));
        $this->store('repos', array_map(fn ($r) => Arr::except($r, ['languages']), $repos));
        $this->store('activity', $this->activity($login));

        $updated = $this->updateProjects($repos);
        $this->builder->request('GitHub data synced');

        return ['days' => count($days), 'repos' => count($repos), 'projects_updated' => $updated];
    }

    private function client(): PendingRequest
    {
        $token = config('services.github.token') ?: throw new RuntimeException('GITHUB_TOKEN is not set');

        return Http::withToken($token)->acceptJson()->timeout(20)->withUserAgent('harshchaudhary.com.np');
    }

    private function username(): string
    {
        return SiteSetting::query()->value('github_username')
            ?: config('services.github.username')
            ?: throw new RuntimeException('Set the GitHub username in Site settings');
    }

    private function store(string $key, array $payload): void
    {
        GithubSnapshot::updateOrCreate(['key' => $key], ['payload' => $payload, 'fetched_at' => now()]);
    }

    private function contributionDays(array $user): array
    {
        $weeks = $user['contributionsCollection']['contributionCalendar']['weeks'];

        return collect($weeks)->flatMap(fn ($w) => $w['contributionDays'])->map(fn ($d) => [
            'date' => $d['date'],
            'count' => $d['contributionCount'],
            'level' => self::LEVELS[$d['contributionLevel']] ?? 0,
        ])->values()->all();
    }

    private function streak(array $days, int $total): array
    {
        $longest = $run = 0;
        foreach ($days as $day) {
            $run = $day['count'] > 0 ? $run + 1 : 0;
            $longest = max($longest, $run);
        }

        // Current streak counts back from today; an empty today doesn't break it yet.
        $current = 0;
        $reversed = array_reverse($days);
        foreach ($reversed as $i => $day) {
            if ($day['count'] > 0) {
                $current++;
            } elseif ($i > 0) {
                break;
            }
        }

        $best = collect($days)->sortByDesc('count')->first();

        return [
            'current' => $current,
            'longest' => $longest,
            'total' => $total,
            'bestDay' => $best && $best['count'] > 0 ? $best['date'] : null,
        ];
    }

    /** Language share by bytes across all public repos, top 6. */
    private function languages(array $repos): array
    {
        $sizes = [];
        $colors = [];
        foreach ($repos as $repo) {
            foreach ($repo['languages']['edges'] as $edge) {
                $name = $edge['node']['name'];
                $sizes[$name] = ($sizes[$name] ?? 0) + $edge['size'];
                $colors[$name] = $edge['node']['color'] ?? '#8b949e';
            }
        }
        arsort($sizes);
        $total = array_sum($sizes) ?: 1;

        return collect(array_slice($sizes, 0, 6, true))
            ->map(fn ($size, $name) => [
                'name' => $name,
                'percentage' => round($size / $total * 100, 1),
                'color' => $colors[$name],
            ])->values()->all();
    }

    private function activity(string $login): array
    {
        $events = $this->client()->get("https://api.github.com/users/{$login}/events/public", ['per_page' => 50])->throw()->json();

        return collect($events)->map(function ($e) {
            $repo = $e['repo']['name'] ?? null;
            $url = $repo ? "https://github.com/{$repo}" : null;
            $base = ['id' => $e['id'], 'timestamp' => $e['created_at'], 'repo' => $repo, 'url' => $url];
            $p = $e['payload'] ?? [];

            return match ($e['type']) {
                'PushEvent' => $base + [
                    'type' => 'commit',
                    'title' => 'Pushed '.($n = $p['size'] ?? count($p['commits'] ?? [])).' commit'.($n === 1 ? '' : 's'),
                    'description' => Arr::get($p, 'commits.0.message') ? strtok($p['commits'][0]['message'], "\n") : 'to '.$repo,
                ],
                'PullRequestEvent' => ($p['action'] ?? '') === 'closed' && Arr::get($p, 'pull_request.merged')
                    ? $base + ['type' => 'pr_merged', 'title' => 'Merged a pull request', 'description' => $p['pull_request']['title'], 'url' => $p['pull_request']['html_url']]
                    : null,
                'ReleaseEvent' => $base + [
                    'type' => 'release',
                    'title' => 'Released '.Arr::get($p, 'release.tag_name'),
                    'description' => Arr::get($p, 'release.name') ?: $repo,
                    'url' => Arr::get($p, 'release.html_url', $url),
                ],
                'WatchEvent' => $base + ['type' => 'star', 'title' => 'Starred a repository', 'description' => $repo],
                'CreateEvent' => ($p['ref_type'] ?? '') === 'repository'
                    ? $base + ['type' => 'commit', 'title' => 'Created a repository', 'description' => $p['description'] ?? $repo]
                    : null,
                default => null,
            };
        })->filter()->take(15)->values()->all();
    }

    /** Fills stars/forks/release on projects linked to a GitHub repo. */
    private function updateProjects(array $repos): int
    {
        $byName = collect($repos)->keyBy(fn ($r) => strtolower($r['nameWithOwner']));
        $updated = 0;

        Project::query()->whereNotNull('github_repo')->each(function (Project $project) use ($byName, &$updated) {
            $repo = $byName->get(strtolower($project->github_repo));
            if (! $repo) {
                return;
            }
            $project->fill([
                'stars' => $repo['stargazerCount'],
                'forks' => $repo['forkCount'],
                'release_version' => Arr::get($repo, 'latestRelease.tagName', $project->release_version),
                'language' => Arr::get($repo, 'primaryLanguage.name', $project->language),
                'language_color' => Arr::get($repo, 'primaryLanguage.color', $project->language_color),
            ]);
            if ($project->isDirty()) {
                $project->saveQuietly(); // one rebuild is requested for the whole sync
                $updated++;
            }
        });

        return $updated;
    }

    public static function lastSyncedAt(): ?Carbon
    {
        return GithubSnapshot::query()->max('fetched_at') ? Carbon::parse(GithubSnapshot::query()->max('fetched_at')) : null;
    }
}
