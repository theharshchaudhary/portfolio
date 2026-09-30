<?php

namespace App\Filament\Resources\SocialLinks;

use App\Filament\Resources\SocialLinks\Pages\ManageSocialLinks;
use App\Models\SocialLink;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Fieldset;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use UnitEnum;

class SocialLinkResource extends Resource
{
    public const PLATFORMS = [
        'github' => 'GitHub', 'linkedin' => 'LinkedIn', 'x' => 'X (Twitter)', 'facebook' => 'Facebook',
        'instagram' => 'Instagram', 'youtube' => 'YouTube', 'dev' => 'DEV', 'medium' => 'Medium',
        'stackoverflow' => 'Stack Overflow', 'dribbble' => 'Dribbble', 'email' => 'Email', 'website' => 'Website', 'other' => 'Other',
    ];

    protected static ?string $model = SocialLink::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedAtSymbol;

    protected static string|UnitEnum|null $navigationGroup = 'About me';

    protected static ?int $navigationSort = 3;

    protected static ?string $recordTitleAttribute = 'label';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('platform')->options(self::PLATFORMS)->required()->searchable(),
            TextInput::make('label')->helperText('Defaults to the platform name.'),
            TextInput::make('handle')->prefix('@'),
            TextInput::make('url')->required()->maxLength(255)
                ->helperText('Full URL, or mailto:you@example.com for email.'),
            Fieldset::make('Show in')->schema([
                Toggle::make('show_in_sidebar')->label('Sidebar')->default(true),
                Toggle::make('show_in_footer')->label('Footer')->default(true),
                Toggle::make('show_on_contact')->label('Contact page')->default(true),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('sort')
            ->defaultSort('sort')
            ->columns([
                TextColumn::make('platform')->formatStateUsing(fn (string $state) => self::PLATFORMS[$state] ?? $state),
                TextColumn::make('url')->limit(40),
                ToggleColumn::make('show_in_sidebar')->label('Sidebar'),
                ToggleColumn::make('show_in_footer')->label('Footer'),
                ToggleColumn::make('show_on_contact')->label('Contact'),
            ])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageSocialLinks::route('/')];
    }
}
