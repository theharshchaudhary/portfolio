<?php

namespace App\Filament\Resources\Faqs;

use App\Filament\Resources\Faqs\Pages\ManageFaqs;
use App\Models\Faq;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

class FaqResource extends Resource
{
    private const PAGES = ['services' => 'Services', 'contact' => 'Contact', 'support' => 'Support'];

    protected static ?string $model = Faq::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedQuestionMarkCircle;

    protected static string|UnitEnum|null $navigationGroup = 'Content';

    protected static ?string $navigationLabel = 'FAQs';

    protected static ?int $navigationSort = 6;

    protected static ?string $recordTitleAttribute = 'question';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('page')->options(self::PAGES)->default('services')->required(),
            TextInput::make('question')->required(),
            Textarea::make('answer')->required()->rows(4),
        ])->columns(1);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('sort')
            ->defaultSort('sort')
            ->columns([
                TextColumn::make('question')->searchable()->wrap(),
                TextColumn::make('page')->badge()->formatStateUsing(fn (string $state) => self::PAGES[$state] ?? $state),
            ])
            ->filters([SelectFilter::make('page')->options(self::PAGES)])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageFaqs::route('/')];
    }
}
