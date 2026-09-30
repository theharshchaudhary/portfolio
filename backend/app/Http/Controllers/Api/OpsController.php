<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GithubSnapshot;
use App\Models\SiteBuild;
use App\Services\GithubSync;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Throwable;

/**
 * CI-only endpoints (Bearer OPS_TOKEN). The host has no SSH or queue worker, so long work replies
 * 202 and runs after the response; CI polls status/{run} until it's done or failed.
 */
class OpsController extends Controller
{
    /** After a code deploy: migrate, seed the basics, link uploads, rebuild caches. */
    public function deploy(): JsonResponse
    {
        return $this->runInBackground('deploy', function (Closure $log) {
            // Cached config would hide new .env values from the steps below.
            Artisan::call('optimize:clear');
            $log('migrate', Artisan::call('migrate', ['--force' => true]));
            // Idempotent: creates settings/profile/nav and the admin account only if missing.
            $log('seed', Artisan::call('db:seed', ['--force' => true]));
            $this->linkUploads($log);
            $log('optimize', Artisan::call('optimize'));
            $log('filament:optimize', Artisan::call('filament:optimize'));
        });
    }

    public function githubSync(Request $request, GithubSync $sync): JsonResponse
    {
        // CI's scheduled build passes rebuild=0 because it builds right after syncing anyway.
        $rebuild = $request->boolean('rebuild', true);

        return $this->runInBackground('github-sync', fn (Closure $log) => $log('synced', $sync->run(rebuild: $rebuild)));
    }

    public function runStatus(string $run): JsonResponse
    {
        return response()->json(Cache::get("ops:run:$run", ['state' => 'unknown']));
    }

    public function status(): JsonResponse
    {
        return response()->json([
            'githubFetchedAt' => GithubSnapshot::query()->max('fetched_at'),
            'lastBuild' => SiteBuild::query()->latest('id')->first(['reason', 'status', 'error', 'created_at']),
        ]);
    }

    private function runInBackground(string $task, Closure $work): JsonResponse
    {
        $run = Str::lower(Str::random(16));
        $key = "ops:run:$run";
        $steps = [];
        Cache::put($key, ['task' => $task, 'state' => 'running', 'steps' => []], 3600);

        defer(function () use ($key, $task, $work, &$steps) {
            @set_time_limit(900);
            $log = function (string $step, mixed $result) use ($key, $task, &$steps) {
                $steps[] = ['step' => $step, 'result' => $result];
                Cache::put($key, ['task' => $task, 'state' => 'running', 'steps' => $steps], 3600);
            };
            try {
                $work($log);
                Cache::put($key, ['task' => $task, 'state' => 'done', 'steps' => $steps], 86400);
            } catch (Throwable $e) {
                report($e);
                Cache::put($key, ['task' => $task, 'state' => 'failed', 'steps' => $steps, 'error' => $e->getMessage()], 86400);
            }
        });

        return response()->json(['run' => $run, 'state' => 'running'], 202);
    }

    /** public/uploads → storage/app/public, recreated when a deploy replaces public/. */
    private function linkUploads(Closure $log): void
    {
        $link = public_path('uploads');
        $target = storage_path('app/public');
        if (! is_dir($target)) {
            mkdir($target, 0755, true);
        }
        if (! is_link($link)) {
            if (file_exists($link)) {
                throw new \RuntimeException('public/uploads exists and is not a symlink');
            }
            symlink($target, $link);
        }
        $log('uploads-link', readlink($link));
    }
}
