<?php

namespace App\Filament\Resources\Projects\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ProjectsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->reorderable('sort')
            ->defaultSort('sort')
            ->columns([
                ImageColumn::make('cover_image')->disk('public')->label('')->width(64),
                TextColumn::make('title')->searchable()->description(fn ($record) => $record->slug),
                TextColumn::make('status')->badge()->color(fn (string $state) => $state === 'published' ? 'success' : 'gray'),
                ToggleColumn::make('pinned'),
                TextColumn::make('language')->toggleable(),
                TextColumn::make('stars')->numeric()->sortable()->toggleable(),
                TextColumn::make('updated_at')->since()->sortable()->label('Updated'),
            ])
            ->filters([
                SelectFilter::make('status')->options(['draft' => 'Draft', 'published' => 'Published']),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
