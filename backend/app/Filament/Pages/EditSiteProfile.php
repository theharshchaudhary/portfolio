<?php

namespace App\Filament\Pages;

use App\Filament\Support\SingletonPage;
use App\Models\Profile;
use BackedEnum;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\MarkdownEditor;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/** The public profile shown across the site (not the admin login account). */
class EditSiteProfile extends SingletonPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUserCircle;

    protected static string|UnitEnum|null $navigationGroup = 'About me';

    protected static ?int $navigationSort = 0;

    protected static ?string $navigationLabel = 'Profile';

    protected static ?string $title = 'Profile';

    protected static ?string $slug = 'site-profile';

    protected function record(): Model
    {
        return Profile::current();
    }

    public function form(Schema $schema): Schema
    {
        return $schema->columns(3)->components([
            Group::make([
                Section::make('About')->schema([
                    TextInput::make('name')->required(),
                    TextInput::make('username')->prefix('@'),
                    TextInput::make('headline')->placeholder('Full-stack developer')->columnSpanFull(),
                    Textarea::make('short_bio')->rows(3)->maxLength(300)->columnSpanFull()
                        ->helperText('Sidebar and cards. One or two sentences.'),
                    MarkdownEditor::make('long_bio')->label('About page text')->columnSpanFull(),
                ])->columns(2),
                Section::make('Details')->schema([
                    TextInput::make('location'),
                    TextInput::make('company'),
                    DatePicker::make('joined_at')->helperText('Defaults to your GitHub join date.'),
                ])->columns(3),
            ])->columnSpan(2),

            Group::make([
                Section::make('Photo')->schema([
                    FileUpload::make('avatar')->image()->avatar()->imageEditor()->disk('public')->directory('profile')->maxSize(2048),
                ]),
                Section::make('Status')->schema([
                    TextInput::make('status_emoji')->maxLength(8)->placeholder('🚀'),
                    TextInput::make('status_message')->placeholder('Building something new'),
                    Toggle::make('open_to_work')->label('Open to work'),
                ]),
                Section::make('Resume / CV')->schema([
                    FileUpload::make('cv_file')->label('PDF')->acceptedFileTypes(['application/pdf'])
                        ->disk('public')->directory('cv')->maxSize(5120)->downloadable()->openable(),
                ]),
            ])->columnSpan(1),
        ]);
    }
}
