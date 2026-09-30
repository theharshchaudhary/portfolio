<?php

namespace App\Filament\Widgets;

use App\Models\PageView;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Database\Eloquent\Builder;

class TopReferrers extends TableWidget
{
    protected static ?int $sort = 4;

    protected static ?string $heading = 'Top referrers, last 30 days';

    public function table(Table $table): Table
    {
        return $table
            ->query(fn (): Builder => PageView::query()
                ->where('day', '>=', now()->subDays(29)->toDateString())
                ->where('referrer_host', '!=', '')
                ->selectRaw('min(id) as id, referrer_host, sum(views) as total')
                ->groupBy('referrer_host'))
            ->defaultSort('total', 'desc')
            ->paginated([10])
            ->emptyStateHeading('No referrals yet')
            ->columns([
                TextColumn::make('referrer_host')->label('Source'),
                TextColumn::make('total')->label('Views')->numeric(),
            ]);
    }
}
