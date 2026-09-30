<?php

namespace App\Services;

use App\Models\SiteBuild;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Asks GitHub Actions to rebuild and deploy the static frontend.
 *
 * Content edits call request(); the dispatch runs after the response is sent and is
 * de-duplicated per request (named defer) and across requests (short cache lock), since
 * one build picks up every change made before it fetches content.
 */
class SiteBuilder
{
    private const LOCK_SECONDS = 20;

    public function request(string $reason): void
    {
        if (! $this->configured() || ! (SiteSetting::query()->value('auto_rebuild') ?? true)) {
            return;
        }

        defer(function () use ($reason) {
            if (Cache::add('site-build:lock', true, self::LOCK_SECONDS)) {
                $this->dispatch($reason);
            }
        }, 'site-build');
    }

    /** Dispatches immediately (the admin's "Rebuild site" button). */
    public function dispatch(string $reason): SiteBuild
    {
        if (! $this->configured()) {
            return SiteBuild::create(['reason' => $reason, 'status' => 'skipped', 'error' => 'SITE_BUILD_TOKEN is not set']);
        }

        try {
            Http::withToken(config('services.site_build.token'))
                ->acceptJson()
                ->timeout(10)
                ->post('https://api.github.com/repos/'.config('services.site_build.repo').'/dispatches', [
                    'event_type' => config('services.site_build.event'),
                    'client_payload' => ['reason' => $reason],
                ])
                ->throw();

            return SiteBuild::create(['reason' => $reason, 'status' => 'dispatched']);
        } catch (Throwable $e) {
            report($e);

            return SiteBuild::create(['reason' => $reason, 'status' => 'failed', 'error' => $e->getMessage()]);
        }
    }

    public function configured(): bool
    {
        return filled(config('services.site_build.token'));
    }
}
