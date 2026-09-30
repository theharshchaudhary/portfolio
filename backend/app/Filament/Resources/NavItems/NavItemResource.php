<?php

namespace App\Filament\Resources\NavItems;

use App\Filament\Resources\NavItems\Pages\ManageNavItems;
use App\Models\NavItem;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use UnitEnum;

class NavItemResource extends Resource
{
    protected static ?string $model = NavItem::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBars3;

    protected static string|UnitEnum|null $navigationGroup = 'Site';

    protected static ?string $navigationLabel = 'Navigation';

    protected static ?int $navigationSort = 3;

    protected static ?string $recordTitleAttribute = 'label';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('label')->required(),
            TextInput::make('path')->required()->startsWith('/')->placeholder('/projects'),
            TextInput::make('icon')->placeholder('folder-git-2')
                ->helperText('A Lucide icon name (lucide.dev/icons).'),
            Select::make('badge_source')->label('Badge')->live()->default('none')->options([
                'none' => 'None', 'projects' => 'Number of projects', 'posts' => 'Number of posts', 'manual' => 'Fixed number',
            ]),
            TextInput::make('badge_value')->numeric()->visible(fn (Get $get) => $get('badge_source') === 'manual'),
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
                TextColumn::make('path')->fontFamily('mono'),
                TextColumn::make('badge_source')->label('Badge')->badge()->color('gray'),
                ToggleColumn::make('visible'),
            ])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageNavItems::route('/')];
    }
}
