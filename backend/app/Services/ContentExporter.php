<?php

namespace App\Services;

use App\Models\Experience;
use App\Models\Faq;
use App\Models\GithubSnapshot;
use App\Models\NavItem;
use App\Models\PageContent;
use App\Models\Post;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Redirect;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\Skill;
use App\Models\SocialLink;
use App\Models\SupportMethod;
use App\Models\Tag;
use App\Models\Testimonial;
use chillerlan\QRCode\Output\QRMarkupSVG;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Support\Facades\Storage;

/**
 * Everything the static frontend needs, as one JSON document. The frontend build fetches
 * it once and prerenders every page from it. Drafts and scheduled posts are excluded.
 * Keys are camelCase to match the TypeScript types in frontend/src/types.
 */
class ContentExporter
{
    public function export(): array
    {
        $settings = SiteSetting::current();
        $github = GithubSnapshot::all()->mapWithKeys(fn ($s) => [$s->key => $s->payload]);
        $projects = Project::published()->orderByDesc('pinned')->orderBy('sort')->latest('updated_at')->get();
        $posts = Post::published()->with('tags')->latest('published_at')->get();

        return [
            'generatedAt' => now()->toIso8601String(),
            'settings' => $this->settings($settings),
            'profile' => $this->profile(Profile::current(), $github->get('profile')),
            'socials' => SocialLink::orderBy('sort')->get()->map(fn (SocialLink $s) => [
                'platform' => $s->platform,
                'label' => $s->label ?: ucfirst($s->platform),
                'handle' => $s->handle,
                'url' => $s->url,
                'showInSidebar' => $s->show_in_sidebar,
                'showInFooter' => $s->show_in_footer,
                'showOnContact' => $s->show_on_contact,
            ]),
            'nav' => NavItem::where('visible', true)->orderBy('sort')->get()->map(fn (NavItem $n) => [
                'label' => $n->label,
                'path' => $n->path,
                'icon' => $n->icon,
                'badge' => match ($n->badge_source) {
                    'projects' => $projects->count(),
                    'posts' => $posts->count(),
                    'manual' => $n->badge_value,
                    default => null,
                },
            ]),
            'pages' => PageContent::all()->mapWithKeys(fn (PageContent $p) => [$p->key => [
                'heading' => $p->heading,
                'intro' => $p->intro,
                'seo' => $this->seo($p),
            ]]),
            'redirects' => Redirect::all()->map(fn (Redirect $r) => [
                'from' => $r->from_path, 'to' => $r->to_path, 'status' => $r->status_code,
            ]),
            'experiences' => Experience::orderBy('sort')->orderByDesc('started_at')->get()->map(fn (Experience $e) => [
                'type' => $e->type,
                'title' => $e->title,
                'organization' => $e->organization,
                'organizationUrl' => $e->organization_url,
                'logo' => $this->url($e->logo),
                'location' => $e->location,
                'startedAt' => $e->started_at->toDateString(),
                'endedAt' => $e->ended_at?->toDateString(),
                'description' => $e->description,
            ]),
            'skills' => Skill::orderBy('sort')->get(['name', 'category', 'icon']),
            'projects' => $projects->map(fn (Project $p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'title' => $p->title,
                'summary' => $p->summary,
                'body' => $p->body,
                'coverImage' => $this->url($p->cover_image),
                'gallery' => array_map($this->url(...), $p->gallery ?? []),
                'tech' => $p->tech ?? [],
                'badges' => $p->badges ?? [],
                'language' => $p->language,
                'languageColor' => $p->language_color,
                'liveUrl' => $p->live_url,
                'docsUrl' => $p->docs_url,
                'repoUrl' => $p->repo_url,
                'stars' => $p->stars,
                'forks' => $p->forks,
                'releaseVersion' => $p->release_version,
                'pinned' => $p->pinned,
                'startedAt' => $p->started_at?->toDateString(),
                'updatedAt' => $p->updated_at->toIso8601String(),
                'seo' => $this->seo($p),
            ]),
            'posts' => $posts->map(fn (Post $p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'title' => $p->title,
                'excerpt' => $p->excerpt,
                'body' => $p->body,
                'coverImage' => $this->url($p->cover_image),
                'publishedAt' => $p->published_at->toIso8601String(),
                'updatedAt' => $p->updated_at->toIso8601String(),
                'readingTime' => $p->readingTime(),
                'tags' => $p->tags->map(fn (Tag $t) => ['name' => $t->name, 'slug' => $t->slug])->values(),
                'seo' => $this->seo($p),
            ]),
            'tags' => Tag::whereHas('posts', fn ($q) => $q->published())
                ->withCount(['posts' => fn ($q) => $q->published()])->orderBy('name')->get()
                ->map(fn (Tag $t) => ['name' => $t->name, 'slug' => $t->slug, 'description' => $t->description, 'count' => $t->posts_count]),
            'services' => Service::where('visible', true)->orderBy('sort')->get()->map(fn (Service $s) => [
                'slug' => $s->slug,
                'title' => $s->title,
                'icon' => $s->icon,
                'summary' => $s->summary,
                'description' => $s->description,
                'deliverables' => $s->deliverables ?? [],
                'price' => $s->quote_only ? null : [
                    'amount' => (float) $s->price_amount,
                    'currency' => $s->price_currency,
                    'prefix' => $s->price_prefix,
                    'unit' => $s->price_unit,
                ],
            ]),
            'faqs' => Faq::orderBy('sort')->get(['page', 'question', 'answer']),
            'testimonials' => Testimonial::where('visible', true)->with('project:id,slug,title')->orderBy('sort')->get()
                ->map(fn (Testimonial $t) => [
                    'name' => $t->name,
                    'role' => $t->role,
                    'company' => $t->company,
                    'photo' => $this->url($t->photo),
                    'quote' => $t->quote,
                    'project' => $t->project ? ['slug' => $t->project->slug, 'title' => $t->project->title] : null,
                ]),
            'support' => SupportMethod::where('visible', true)->orderBy('sort')->get()->map(fn (SupportMethod $m) => [
                'type' => $m->type,
                'label' => $m->label,
                'description' => $m->description,
                'url' => $m->url,
                'crypto' => $m->type === 'crypto' && $m->crypto_address ? [
                    'coin' => $m->crypto_coin,
                    'network' => $m->crypto_network,
                    'address' => $m->crypto_address,
                    'qrSvg' => $this->qr($m->crypto_address),
                ] : null,
            ]),
            'github' => $github->has('contributions') ? [
                'contributions' => $github->get('contributions'),
                'streak' => $github->get('streak'),
                'languages' => $github->get('languages', []),
                'activity' => $github->get('activity', []),
                'fetchedAt' => GithubSync::lastSyncedAt()?->toIso8601String(),
            ] : null,
        ];
    }

    private function settings(SiteSetting $s): array
    {
        return [
            'siteName' => $s->site_name,
            'tagline' => $s->tagline,
            'url' => rtrim($s->site_url, '/'),
            'titleTemplate' => str_replace('{site}', $s->site_name, $s->title_template),
            'defaultTitle' => $s->default_title,
            'description' => $s->default_description,
            'defaultOgImage' => $this->url($s->default_og_image),
            'footerText' => str_replace('{year}', (string) now()->year, (string) $s->footer_text),
            'contactEmail' => $s->contact_email,
            'githubUsername' => $s->github_username,
            'turnstileSiteKey' => $s->turnstile_site_key,
            'indexNowKey' => $s->indexnow_key,
            'analyticsEnabled' => $s->analytics_enabled,
            'hero' => $s->hero ?? (object) [],
        ];
    }

    private function profile(Profile $p, ?array $github): array
    {
        return [
            'name' => $p->name,
            'username' => $p->username,
            'headline' => $p->headline,
            'shortBio' => $p->short_bio,
            'longBio' => $p->long_bio,
            'avatar' => $this->url($p->avatar),
            'location' => $p->location,
            'company' => $p->company,
            'status' => $p->status_message ? ['emoji' => $p->status_emoji, 'message' => $p->status_message] : null,
            'openToWork' => $p->open_to_work,
            'cvUrl' => $this->url($p->cv_file),
            'joinedAt' => $p->joined_at?->toDateString() ?? ($github['joinedAt'] ?? null),
            'followers' => $github['followers'] ?? null,
            'following' => $github['following'] ?? null,
        ];
    }

    private function seo(object $model): array
    {
        return [
            'title' => $model->seo_title,
            'description' => $model->seo_description,
            'ogImage' => $this->url($model->og_image),
        ];
    }

    private function url(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        return str_starts_with($path, 'http') ? $path : Storage::disk('public')->url($path);
    }

    private function qr(string $data): string
    {
        return (new QRCode(new QROptions([
            'outputInterface' => QRMarkupSVG::class,
            'outputBase64' => false,
            'svgAddXmlHeader' => false,
            'connectPaths' => true,
            'drawLightModules' => false,
        ])))->render($data);
    }
}
