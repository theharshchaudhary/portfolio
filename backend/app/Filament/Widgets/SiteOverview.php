<?php

namespace App\Filament\Widgets;

use App\Models\Message;
use App\Models\PageView;
use App\Models\Post;
use App\Models\Project;
use App\Models\SiteBuild;
use App\Services\GithubSync;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class SiteOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $views = fn (int $days) => (int) PageView::where('day', '>=', now()->subDays($days - 1)->toDateString())->sum('views');
        $daily = PageView::where('day', '>=', now()->subDays(13)->toDateString())
            ->selectRaw('day, sum(views) as total')->groupBy('day')->orderBy('day')->pluck('total')->all();
        $unread = Message::whereNull('read_at')->where('is_spam', false)->count();
        $build = SiteBuild::latest('id')->first();
        $synced = GithubSync::lastSyncedAt();

        return [
            Stat::make('Views (7 days)', number_format($views(7)))
                ->description(number_format($views(30)).' in the last 30 days')
                ->chart($daily ?: [0])->color('primary'),
            Stat::make('Unread messages', $unread)
                ->description('Contact form inbox')
                ->color($unread ? 'warning' : 'gray')
                ->url(route('filament.admin.resources.messages.index')),
            Stat::make('Published', Project::published()->count().' projects')
                ->description(Post::published()->count().' blog posts'),
            Stat::make('Last site build', $build ? ucfirst($build->status) : 'Never')
                ->description($build ? $build->created_at->diffForHumans().' · '.$build->reason : 'Rebuilds run after each change')
                ->color(match ($build?->status) {
                    'dispatched' => 'success',
                    'failed' => 'danger',
                    default => 'gray',
                }),
            Stat::make('GitHub data', $synced ? $synced->diffForHumans() : 'Not synced')
                ->description('Contributions, repos and activity'),
        ];
    }
}
