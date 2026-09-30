<?php

namespace App\Filament\Resources\Messages;

use App\Filament\Resources\Messages\Pages\ListMessages;
use App\Models\Message;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;
use UnitEnum;

/** Read-only inbox for contact form submissions. */
class MessageResource extends Resource
{
    protected static ?string $model = Message::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedInbox;

    protected static string|UnitEnum|null $navigationGroup = 'Inbox';

    protected static ?string $recordTitleAttribute = 'name';

    public static function getNavigationBadge(): ?string
    {
        $unread = Message::whereNull('read_at')->where('is_spam', false)->count();

        return $unread ? (string) $unread : null;
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            TextEntry::make('name'),
            TextEntry::make('email')->copyable(),
            TextEntry::make('subject')->placeholder('—'),
            TextEntry::make('created_at')->dateTime()->label('Received'),
            TextEntry::make('body')->label('Message')->columnSpanFull()->prose(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                IconColumn::make('read_at')->label('')->boolean()
                    ->trueIcon(Heroicon::OutlinedEnvelopeOpen)->falseIcon(Heroicon::Envelope)
                    ->state(fn (Message $record) => $record->read_at !== null),
                TextColumn::make('name')->searchable()->weight(fn (Message $record) => $record->read_at ? null : 'bold'),
                TextColumn::make('email')->searchable(),
                TextColumn::make('subject')->limit(40)->placeholder('—'),
                TextColumn::make('body')->limit(60)->label('Message')->toggleable(),
                TextColumn::make('created_at')->since()->sortable()->label('Received'),
            ])
            ->filters([
                TernaryFilter::make('is_spam')->label('Spam')->default(false),
                TernaryFilter::make('read_at')->label('Read')->nullable(),
            ])
            ->recordActions([
                ViewAction::make()->after(fn (Message $record) => $record->read_at ?? $record->update(['read_at' => now()])),
                Action::make('reply')->icon(Heroicon::OutlinedArrowUturnLeft)
                    ->url(fn (Message $record) => 'mailto:'.$record->email.'?subject='.rawurlencode('Re: '.($record->subject ?: 'your message')))
                    ->openUrlInNewTab(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('markRead')->label('Mark as read')->icon(Heroicon::OutlinedEnvelopeOpen)
                        ->action(fn (Collection $records) => $records->each->update(['read_at' => now()])),
                    BulkAction::make('markSpam')->label('Mark as spam')->icon(Heroicon::OutlinedNoSymbol)
                        ->action(fn (Collection $records) => $records->each->update(['is_spam' => true])),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListMessages::route('/'),
        ];
    }
}
