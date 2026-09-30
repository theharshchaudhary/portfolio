<?php

namespace App\Filament\Resources\Redirects;

use App\Filament\Resources\Redirects\Pages\ManageRedirects;
use App\Models\Redirect;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

class RedirectResource extends Resource
{
    protected static ?string $model = Redirect::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowsRightLeft;

    protected static string|UnitEnum|null $navigationGroup = 'Site';

    protected static ?int $navigationSort = 5;

    protected static ?string $recordTitleAttribute = 'from_path';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('from_path')->label('From')->required()->startsWith('/')->unique(ignoreRecord: true)->placeholder('/old-page'),
            TextInput::make('to_path')->label('To')->required()->placeholder('/new-page or https://…'),
            Select::make('status_code')->label('Type')->options([301 => '301 Permanent', 302 => '302 Temporary'])->default(301)->required(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('from_path')->label('From')->fontFamily('mono')->searchable(),
                TextColumn::make('to_path')->label('To')->fontFamily('mono')->searchable(),
                TextColumn::make('status_code')->label('Type')->badge(),
            ])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageRedirects::route('/')];
    }
}
