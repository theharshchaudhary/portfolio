<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GithubSnapshot;
use App\Models\SiteBuild;
use App\Services\GithubSync;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Throwable;

/**
 * CI-only endpoints (Bearer OPS_TOKEN). Long work replies 202 and runs after the response,
 * because the host has no SSH or queue worker; CI polls status() for the outcome.
 */
class OpsController extends Controller
{
    public function githubSync(GithubSync $sync): JsonResponse
    {
        Cache::put('ops:github-sync', ['state' => 'running', 'at' => now()->toIso8601String()], 3600);

        defer(function () use ($sync) {
            try {
                $result = $sync->run();
                Cache::put('ops:github-sync', ['state' => 'done', 'at' => now()->toIso8601String(), 'result' => $result], 86400);
            } catch (Throwable $e) {
                report($e);
                Cache::put('ops:github-sync', ['state' => 'failed', 'at' => now()->toIso8601String(), 'error' => $e->getMessage()], 86400);
            }
        });

        return response()->json(['accepted' => true], 202);
    }

    public function status(): JsonResponse
    {
        return response()->json([
            'githubSync' => Cache::get('ops:github-sync'),
            'githubFetchedAt' => GithubSnapshot::query()->max('fetched_at'),
            'lastBuild' => SiteBuild::query()->latest('id')->first(['reason', 'status', 'error', 'created_at']),
        ]);
    }
}
