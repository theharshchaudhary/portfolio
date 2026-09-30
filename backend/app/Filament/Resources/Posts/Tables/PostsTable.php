<?php

namespace App\Filament\Resources\Posts\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('published_at', 'desc')
            ->columns([
                TextColumn::make('title')->searchable()->description(fn ($record) => $record->slug)->wrap(),
                TextColumn::make('status')->badge()
                    ->state(fn ($record) => $record->status === 'published' && $record->published_at?->isFuture() ? 'scheduled' : $record->status)
                    ->color(fn (string $state) => match ($state) {
                        'published' => 'success',
                        'scheduled' => 'warning',
                        default => 'gray',
                    }),
                TextColumn::make('tags.name')->badge()->toggleable(),
                TextColumn::make('published_at')->dateTime('M j, Y H:i')->sortable(),
                TextColumn::make('updated_at')->since()->sortable()->label('Updated')->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')->options(['draft' => 'Draft', 'published' => 'Published']),
                SelectFilter::make('tags')->relationship('tags', 'name')->multiple()->preload(),
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
