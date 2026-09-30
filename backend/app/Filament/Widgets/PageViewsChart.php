<?php

namespace App\Filament\Widgets;

use App\Models\PageView;
use Filament\Widgets\ChartWidget;

class PageViewsChart extends ChartWidget
{
    protected static ?int $sort = 2;

    protected ?string $heading = 'Page views, last 30 days';

    protected int|string|array $columnSpan = 'full';

    protected ?string $maxHeight = '260px';

    protected function getData(): array
    {
        $start = now()->subDays(29)->startOfDay();
        $totals = PageView::where('day', '>=', $start->toDateString())
            ->selectRaw('day, sum(views) as total')->groupBy('day')->pluck('total', 'day');

        $labels = [];
        $data = [];
        for ($d = $start->copy(); $d->lte(now()); $d->addDay()) {
            $labels[] = $d->format('M j');
            $data[] = (int) ($totals[$d->toDateString()] ?? 0);
        }

        return [
            'datasets' => [[
                'label' => 'Views',
                'data' => $data,
                'fill' => true,
                'borderColor' => '#0969da',
                'backgroundColor' => 'rgba(9, 105, 218, 0.1)',
                'tension' => 0.3,
            ]],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
