<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PageView;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

/** Cookieless page-view counter: aggregates per day, path and referrer host. No personal data is stored. */
class PageViewController extends Controller
{
    private const BOT_PATTERN = '/bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|embedly|monitor/i';

    public function __invoke(Request $request): Response
    {
        $data = $request->validate([
            'path' => ['required', 'string', 'max:255', 'starts_with:/'],
            'referrer' => ['nullable', 'string', 'max:2048'],
        ]);

        if (preg_match(self::BOT_PATTERN, (string) $request->userAgent()) || ! SiteSetting::query()->value('analytics_enabled')) {
            return response()->noContent();
        }

        PageView::query()->upsert(
            [[
                'day' => now()->toDateString(),
                'path' => strtok($data['path'], '?#'),
                'referrer_host' => $this->referrerHost($data['referrer'] ?? null, $request),
                'views' => 1,
            ]],
            ['day', 'path', 'referrer_host'],
            ['views' => DB::raw('views + 1')],
        );

        return response()->noContent();
    }

    private function referrerHost(?string $referrer, Request $request): string
    {
        $host = $referrer ? parse_url($referrer, PHP_URL_HOST) : null;
        if (! $host) {
            return '';
        }
        $host = preg_replace('/^www\./', '', strtolower($host));

        return $host === preg_replace('/^www\./', '', $request->getHost()) ? '' : substr($host, 0, 190);
    }
}
