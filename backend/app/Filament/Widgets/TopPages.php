<?php

namespace App\Filament\Widgets;

use App\Models\PageView;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Database\Eloquent\Builder;

class TopPages extends TableWidget
{
    protected static ?int $sort = 3;

    protected static ?string $heading = 'Top pages, last 30 days';

    public function table(Table $table): Table
    {
        return $table
            ->query(fn (): Builder => PageView::query()
                ->where('day', '>=', now()->subDays(29)->toDateString())
                ->selectRaw('min(id) as id, path, sum(views) as total')
                ->groupBy('path'))
            ->defaultSort('total', 'desc')
            ->paginated([10])
            ->columns([
                TextColumn::make('path')->fontFamily('mono'),
                TextColumn::make('total')->label('Views')->numeric(),
            ]);
    }
}
