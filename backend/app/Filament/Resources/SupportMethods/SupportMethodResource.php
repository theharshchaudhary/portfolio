<?php

namespace App\Filament\Resources\SupportMethods;

use App\Filament\Resources\SupportMethods\Pages\ManageSupportMethods;
use App\Models\SupportMethod;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use UnitEnum;

class SupportMethodResource extends Resource
{
    public const TYPES = [
        'github_sponsors' => 'GitHub Sponsors', 'kofi' => 'Ko-fi', 'buymeacoffee' => 'Buy Me a Coffee',
        'paypal' => 'PayPal', 'crypto' => 'Crypto', 'other' => 'Other link',
    ];

    protected static ?string $model = SupportMethod::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedHeart;

    protected static string|UnitEnum|null $navigationGroup = 'About me';

    protected static ?string $navigationLabel = 'Donation methods';

    protected static ?int $navigationSort = 4;

    protected static ?string $recordTitleAttribute = 'label';

    public static function form(Schema $schema): Schema
    {
        $isCrypto = fn (Get $get) => $get('type') === 'crypto';

        return $schema->components([
            Select::make('type')->options(self::TYPES)->required()->live(),
            TextInput::make('label')->required()->placeholder('e.g. Buy me a coffee'),
            Textarea::make('description')->rows(2)->columnSpanFull(),
            TextInput::make('url')->url()->label('Link')->columnSpanFull()
                ->required(fn (Get $get) => ! $isCrypto($get))->hidden($isCrypto),
            Section::make('Crypto wallet')->schema([
                TextInput::make('crypto_coin')->label('Coin')->placeholder('BTC, ETH, USDT…')->required($isCrypto),
                TextInput::make('crypto_network')->label('Network')->placeholder('Bitcoin, Ethereum, TRC20…')->required($isCrypto),
                TextInput::make('crypto_address')->label('Address')->required($isCrypto)->columnSpanFull()
                    ->helperText('A QR code is generated automatically. Double-check the address: payments can\'t be reversed.'),
            ])->columns(2)->columnSpanFull()->visible($isCrypto),
            Toggle::make('visible')->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('sort')
            ->defaultSort('sort')
            ->columns([
                TextColumn::make('label'),
                TextColumn::make('type')->badge()->formatStateUsing(fn (string $state) => self::TYPES[$state] ?? $state),
                TextColumn::make('url')->state(fn (SupportMethod $r) => $r->type === 'crypto' ? "{$r->crypto_coin} · {$r->crypto_address}" : $r->url)->limit(40),
                ToggleColumn::make('visible'),
            ])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageSupportMethods::route('/')];
    }
}
