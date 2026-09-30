<?php

namespace App\Filament\Resources\Experiences;

use App\Filament\Resources\Experiences\Pages\ManageExperiences;
use App\Models\Experience;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
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

class ExperienceResource extends Resource
{
    protected static ?string $model = Experience::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBriefcase;

    protected static string|UnitEnum|null $navigationGroup = 'About me';

    protected static ?string $navigationLabel = 'Experience & education';

    protected static ?int $navigationSort = 1;

    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('type')->options(['work' => 'Work', 'education' => 'Education'])->default('work')->required(),
            TextInput::make('title')->required()->label('Role / degree'),
            TextInput::make('organization')->required(),
            TextInput::make('organization_url')->url(),
            TextInput::make('location'),
            FileUpload::make('logo')->image()->disk('public')->directory('logos')->maxSize(1024),
            DatePicker::make('started_at')->required(),
            DatePicker::make('ended_at')->helperText('Leave empty if current.'),
            Textarea::make('description')->rows(4)->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('sort')
            ->defaultSort('sort')
            ->columns([
                TextColumn::make('title')->description(fn (Experience $r) => $r->organization),
                TextColumn::make('type')->badge(),
                TextColumn::make('started_at')->date('M Y')->label('From'),
                TextColumn::make('ended_at')->date('M Y')->label('To')->placeholder('Present'),
            ])
            ->filters([SelectFilter::make('type')->options(['work' => 'Work', 'education' => 'Education'])])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageExperiences::route('/')];
    }
}
