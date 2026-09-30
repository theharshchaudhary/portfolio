<?php

namespace App\Filament\Resources\PageContents;

use App\Filament\Resources\PageContents\Pages\ManagePageContents;
use App\Filament\Support\SeoSection;
use App\Models\PageContent;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

/** Heading, intro and SEO overrides for each fixed page. Pages themselves are defined in code. */
class PageContentResource extends Resource
{
    protected static ?string $model = PageContent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentText;

    protected static string|UnitEnum|null $navigationGroup = 'Site';

    protected static ?string $navigationLabel = 'Page text & SEO';

    protected static ?int $navigationSort = 4;

    protected static ?string $recordTitleAttribute = 'key';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('key')->label('Page')->disabled(),
            TextInput::make('heading'),
            Textarea::make('intro')->rows(3),
            SeoSection::make()->collapsed(false),
        ])->columns(1);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('key')->label('Page')->formatStateUsing(fn (string $state) => ucfirst($state)),
                TextColumn::make('heading')->placeholder('—'),
                TextColumn::make('seo_title')->label('SEO title')->placeholder('auto'),
            ])
            ->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManagePageContents::route('/')];
    }
}
