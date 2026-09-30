<?php

namespace App\Filament\Resources\Services;

use App\Filament\Resources\Services\Pages\ManageServices;
use App\Filament\Support\Slug;
use App\Models\Service;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\MarkdownEditor;
use Filament\Forms\Components\TagsInput;
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

class ServiceResource extends Resource
{
    protected static ?string $model = Service::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedWrenchScrewdriver;

    protected static string|UnitEnum|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 4;

    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Slug::title('title'),
            Slug::field('slug', prefix: '/services#'),
            TextInput::make('icon')->placeholder('code')->helperText('A Lucide icon name (lucide.dev/icons).'),
            Toggle::make('visible')->default(true)->inline(false),
            Textarea::make('summary')->required()->rows(2)->columnSpanFull(),
            MarkdownEditor::make('description')->columnSpanFull(),
            TagsInput::make('deliverables')->placeholder('Add a deliverable')->columnSpanFull(),
            Section::make('Pricing')->schema([
                Toggle::make('quote_only')->label('Contact for a quote (hide price)')->default(true)->live()->columnSpanFull(),
                TextInput::make('price_prefix')->placeholder('From')->hidden(fn (Get $get) => $get('quote_only')),
                TextInput::make('price_amount')->numeric()->minValue(0)
                    ->required(fn (Get $get) => ! $get('quote_only'))->hidden(fn (Get $get) => $get('quote_only')),
                TextInput::make('price_currency')->placeholder('USD')->length(3)
                    ->required(fn (Get $get) => ! $get('quote_only'))->hidden(fn (Get $get) => $get('quote_only')),
                TextInput::make('price_unit')->placeholder('per project')->hidden(fn (Get $get) => $get('quote_only')),
            ])->columns(4)->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('sort')
            ->defaultSort('sort')
            ->columns([
                TextColumn::make('title')->searchable(),
                TextColumn::make('price')->state(fn (Service $r) => $r->quote_only
                    ? 'Quote'
                    : trim("{$r->price_prefix} {$r->price_currency} ".number_format((float) $r->price_amount)." {$r->price_unit}")),
                ToggleColumn::make('visible'),
            ])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageServices::route('/')];
    }
}
