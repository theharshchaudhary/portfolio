<?php

namespace Database\Seeders;

use App\Models\Experience;
use App\Models\Faq;
use App\Models\GithubSnapshot;
use App\Models\Post;
use App\Models\Project;
use App\Models\Service;
use App\Models\Skill;
use App\Models\SocialLink;
use App\Models\SupportMethod;
use App\Models\Tag;
use App\Models\Testimonial;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/** Invented sample content so every page has something to render during development. */
class DemoContentSeeder extends Seeder
{
    public function run(): void
    {
        if (Project::exists()) {
            return;
        }

        foreach ([
            ['x', 'X', 'https://x.com/theharshchaudhary', 2],
            ['linkedin', 'LinkedIn', 'https://www.linkedin.com/in/theharshchaudhary', 3],
        ] as [$platform, $label, $url, $sort]) {
            SocialLink::create(['platform' => $platform, 'label' => $label, 'handle' => 'theharshchaudhary', 'url' => $url, 'sort' => $sort]);
        }

        $projects = [
            ['lensify', 'AI-powered image optimization pipeline for web apps. Automatically converts, compresses, and serves responsive images with srcset generation.', 'TypeScript', '#3178c6', 1247, 89, ['Open Source', 'CLI', 'Library'], ['TypeScript', 'Node.js', 'Sharp'], 'https://lensify.dev', 'v2.4.1', true],
            ['pulse-db', 'Real-time database monitoring dashboard for Laravel applications. Query analysis, slow-log detection, and N+1 alerts in one clean interface.', 'PHP', '#4F5D95', 892, 56, ['Open Source', 'Paid/SaaS'], ['Laravel', 'Livewire', 'MySQL'], 'https://pulsedb.io', 'v1.8.0', true],
            ['shipkit', 'Zero-config deployment CLI for static sites and SPAs. Push to deploy with built-in edge caching, preview branches, and instant rollbacks.', 'Go', '#00ADD8', 534, 32, ['Open Source', 'CLI'], ['Go', 'Cobra'], null, 'v0.9.3', true],
            ['react-flow-table', 'Headless, performant data table component for React. Virtualized rows, column pinning, sorting, and filtering with full keyboard navigation.', 'TypeScript', '#3178c6', 318, 21, ['Free', 'Library', 'Open Source'], ['React', 'TypeScript'], 'https://react-flow-table.vercel.app', 'v1.2.0', true],
            ['forge-rs', 'Minimal, fast HTTP framework for Rust with middleware support, type-safe routing, and built-in OpenAPI documentation generation.', 'Rust', '#dea584', 412, 28, ['Open Source', 'Free'], ['Rust', 'Tokio'], null, 'v0.3.0', false],
            ['devbox-saas', 'Cloud development environments in your browser. Pre-configured runtimes, live collaboration, and zero local setup.', 'TypeScript', '#3178c6', 203, 12, ['Paid/SaaS'], ['React', 'Laravel', 'Docker'], 'https://devbox.app', 'v0.1.0-beta', false],
        ];
        foreach ($projects as $i => [$name, $summary, $lang, $color, $stars, $forks, $badges, $tech, $live, $release, $pinned]) {
            Project::create([
                'title' => $name,
                'slug' => $name,
                'summary' => $summary,
                'body' => "## The problem\n\n{$summary}\n\n## The approach\n\nA write-up of how it was built goes here.\n\n```ts\nexport const hello = (name: string) => `Hello, \${name}`;\n```\n",
                'language' => $lang,
                'language_color' => $color,
                'stars' => $stars,
                'forks' => $forks,
                'badges' => $badges,
                'tech' => $tech,
                'live_url' => $live,
                'repo_url' => "https://github.com/theharshchaudhary/{$name}",
                'release_version' => $release,
                'pinned' => $pinned,
                'status' => 'published',
                'sort' => $i + 1,
            ]);
        }

        $tags = collect(['Architecture', 'TypeScript', 'Design', 'Laravel', 'React'])
            ->mapWithKeys(fn ($t) => [$t => Tag::create(['name' => $t, 'slug' => Str::slug($t)])]);
        $posts = [
            ['The architecture of a developer portfolio that scales', 'How I structured my personal site as a type-safe, data-driven application.', '2026-09-26', ['Architecture', 'TypeScript']],
            ['Designing for the Primer aesthetic without copying GitHub', 'Borrowing visual language from GitHub is fine, but you need to make it your own.', '2026-09-18', ['Design', 'React']],
            ['From mock data to a Laravel API: a migration story', 'Replacing mock services with a real Laravel backend without touching components.', '2026-09-10', ['Laravel', 'Architecture']],
        ];
        foreach ($posts as [$title, $excerpt, $date, $postTags]) {
            $post = Post::create([
                'title' => $title,
                'slug' => Str::slug($title),
                'excerpt' => $excerpt,
                'body' => "{$excerpt}\n\n## Background\n\n".str_repeat('This is placeholder body text for local development. ', 40)."\n\n## Code\n\n```php\nRoute::get('/api/v1/content', ContentController::class);\n```\n",
                'status' => 'published',
                'published_at' => Carbon::parse($date),
            ]);
            $post->tags()->attach($tags->only($postTags)->pluck('id'));
        }

        foreach ([['work', 'Full-stack Developer', 'Freelance', '2023-01-01', null], ['work', 'Web Developer', 'Example Agency', '2021-06-01', '2022-12-31'], ['education', 'BE Computer Engineering', 'Example University', '2020-01-01', null]] as $i => [$type, $title, $org, $start, $end]) {
            Experience::create(['type' => $type, 'title' => $title, 'organization' => $org, 'location' => 'Kathmandu, Nepal', 'started_at' => $start, 'ended_at' => $end, 'description' => 'Placeholder description.', 'sort' => $i]);
        }

        foreach (['TypeScript' => 'Languages', 'PHP' => 'Languages', 'React' => 'Frontend', 'Tailwind CSS' => 'Frontend', 'Laravel' => 'Backend', 'Node.js' => 'Backend', 'MySQL' => 'Data', 'PostgreSQL' => 'Data', 'Docker' => 'Tools', 'Git' => 'Tools'] as $name => $category) {
            Skill::create(['name' => $name, 'category' => $category]);
        }

        foreach ([
            ['Web application development', 'code', 'Custom web apps with Laravel and React, from idea to launch.', false, 500, 'USD', 'From', 'per project'],
            ['Website performance & SEO', 'gauge', 'Speed audits, Core Web Vitals fixes and technical SEO.', false, 150, 'USD', 'From', null],
            ['Maintenance & support', 'wrench', 'Ongoing updates, monitoring and fixes for existing sites.', true, null, null, null, null],
        ] as $i => [$title, $icon, $summary, $quote, $amount, $currency, $prefix, $unit]) {
            Service::create(['title' => $title, 'slug' => Str::slug($title), 'icon' => $icon, 'summary' => $summary, 'deliverables' => ['Discovery call', 'Delivery', 'Two weeks of support'], 'quote_only' => $quote, 'price_amount' => $amount, 'price_currency' => $currency, 'price_prefix' => $prefix, 'price_unit' => $unit, 'sort' => $i]);
        }

        Faq::create(['page' => 'services', 'question' => 'How long does a typical project take?', 'answer' => 'Most projects take 2–6 weeks depending on scope.']);
        Faq::create(['page' => 'services', 'question' => 'Do you work with international clients?', 'answer' => 'Yes, remotely and across time zones.']);
        Testimonial::create(['name' => 'Sample Client', 'role' => 'Founder', 'company' => 'Example Co.', 'quote' => 'Placeholder testimonial for development.', 'project_id' => Project::first()->id]);

        SupportMethod::create(['type' => 'github_sponsors', 'label' => 'GitHub Sponsors', 'url' => 'https://github.com/sponsors/theharshchaudhary', 'sort' => 1]);
        SupportMethod::create(['type' => 'kofi', 'label' => 'Ko-fi', 'url' => 'https://ko-fi.com/example', 'sort' => 2]);
        SupportMethod::create(['type' => 'crypto', 'label' => 'Bitcoin', 'crypto_coin' => 'BTC', 'crypto_network' => 'Bitcoin', 'crypto_address' => 'bc1qexampleaddressfordevelopmentonly0000000', 'sort' => 3]);

        $this->fakeGithub();
    }

    /** Deterministic fake GitHub data (mirrors the original mock heatmap). */
    private function fakeGithub(): void
    {
        $days = [];
        $start = Carbon::today()->subDays(364)->startOfWeek(Carbon::SUNDAY);
        for ($i = 0; $i < 371; $i++) {
            $date = $start->copy()->addDays($i);
            if ($date->isFuture()) {
                break;
            }
            $rand = sin($i * 12.9898 + $date->month * 78.233) * 43758.5453;
            $frac = $rand - floor($rand);
            $level = $date->isWeekend() ? ($frac < 0.6 ? 0 : ($frac < 0.85 ? 1 : 2)) : ($frac < 0.3 ? 0 : ($frac < 0.55 ? 1 : ($frac < 0.8 ? 2 : ($frac < 0.92 ? 3 : 4))));
            $days[] = ['date' => $date->toDateString(), 'count' => $level === 0 ? 0 : $level * 3 + (int) floor($frac * 4), 'level' => $level];
        }
        $snapshots = [
            'profile' => ['login' => 'theharshchaudhary', 'followers' => 248, 'following' => 73, 'joinedAt' => '2020-03-15T00:00:00Z'],
            'contributions' => $days,
            'streak' => ['current' => 12, 'longest' => 47, 'total' => array_sum(array_column($days, 'count')), 'bestDay' => $days[array_search(max(array_column($days, 'count')), array_column($days, 'count'))]['date']],
            'languages' => [
                ['name' => 'TypeScript', 'percentage' => 42, 'color' => '#3178c6'],
                ['name' => 'PHP', 'percentage' => 24, 'color' => '#4F5D95'],
                ['name' => 'Python', 'percentage' => 15, 'color' => '#3572A5'],
                ['name' => 'Go', 'percentage' => 8, 'color' => '#00ADD8'],
                ['name' => 'Rust', 'percentage' => 6, 'color' => '#dea584'],
                ['name' => 'Shell', 'percentage' => 5, 'color' => '#89e051'],
            ],
            'activity' => [
                ['id' => '1', 'type' => 'release', 'title' => 'Released v2.4.1', 'description' => 'lensify', 'timestamp' => now()->subDays(2)->toIso8601String(), 'repo' => 'theharshchaudhary/lensify', 'url' => 'https://github.com/theharshchaudhary/lensify'],
                ['id' => '2', 'type' => 'pr_merged', 'title' => 'Merged a pull request', 'description' => 'Add AVIF output support', 'timestamp' => now()->subDays(3)->toIso8601String(), 'repo' => 'theharshchaudhary/lensify', 'url' => 'https://github.com/theharshchaudhary/lensify'],
                ['id' => '3', 'type' => 'commit', 'title' => 'Pushed 4 commits', 'description' => 'Refactor query analyzer', 'timestamp' => now()->subDays(5)->toIso8601String(), 'repo' => 'theharshchaudhary/pulse-db', 'url' => 'https://github.com/theharshchaudhary/pulse-db'],
                ['id' => '4', 'type' => 'star', 'title' => 'Starred a repository', 'description' => 'laravel/framework', 'timestamp' => now()->subDays(6)->toIso8601String(), 'repo' => 'laravel/framework', 'url' => 'https://github.com/laravel/framework'],
            ],
        ];
        foreach ($snapshots as $key => $payload) {
            GithubSnapshot::create(['key' => $key, 'payload' => $payload, 'fetched_at' => now()]);
        }
    }
}
