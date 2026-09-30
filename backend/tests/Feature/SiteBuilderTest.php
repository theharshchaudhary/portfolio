<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\SiteBuild;
use App\Services\SiteBuilder;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Defer\DeferredCallbackCollection;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SiteBuilderTest extends TestCase
{
    use RefreshDatabase;

    public function test_dispatch_calls_github_repository_dispatch(): void
    {
        config(['services.site_build.token' => 't', 'services.site_build.repo' => 'owner/repo']);
        Http::fake(['api.github.com/*' => Http::response(null, 204)]);

        $build = app(SiteBuilder::class)->dispatch('test');

        $this->assertSame('dispatched', $build->status);
        Http::assertSent(fn ($request) => $request->url() === 'https://api.github.com/repos/owner/repo/dispatches'
            && $request['event_type'] === 'content-updated');
    }

    public function test_dispatch_is_skipped_without_token(): void
    {
        config(['services.site_build.token' => null]);

        $this->assertSame('skipped', app(SiteBuilder::class)->dispatch('test')->status);
    }

    public function test_content_changes_request_one_rebuild_per_request(): void
    {
        $this->seed(DatabaseSeeder::class);
        config(['services.site_build.token' => 't']);
        Http::fake(['api.github.com/*' => Http::response(null, 204)]);

        Project::first()->update(['title' => 'A']);
        Project::skip(1)->first()->update(['title' => 'B']);
        app(DeferredCallbackCollection::class)->invoke(); // what the kernel does after the response

        Http::assertSentCount(1);
        $this->assertSame(1, SiteBuild::where('status', 'dispatched')->count());
    }
}
