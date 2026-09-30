<?php

namespace App\Filament\Resources\Projects\Schemas;

use App\Filament\Support\SeoSection;
use App\Filament\Support\Slug;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\MarkdownEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ProjectForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(3)
            ->components([
                Group::make([
                    Section::make('Project')->schema([
                        Slug::title('title'),
                        Slug::field('slug', prefix: '/projects/'),
                        Textarea::make('summary')->required()->rows(3)->maxLength(300)
                            ->helperText('Shown on cards and used as the meta description if SEO description is empty.'),
                        MarkdownEditor::make('body')->label('Case study')->fileAttachmentsDisk('public')->fileAttachmentsDirectory('projects/attachments'),
                    ]),
                    Section::make('Media')->schema([
                        FileUpload::make('cover_image')->image()->disk('public')->directory('projects')->maxSize(4096),
                        FileUpload::make('gallery')->image()->multiple()->reorderable()->disk('public')->directory('projects/gallery')->maxSize(4096),
                    ])->collapsible(),
                    SeoSection::make(),
                ])->columnSpan(2),

                Group::make([
                    Section::make('Publishing')->schema([
                        Select::make('status')->options(['draft' => 'Draft', 'published' => 'Published'])->default('draft')->required(),
                        Toggle::make('pinned')->helperText('Pinned projects appear on the home page.'),
                        DatePicker::make('started_at'),
                    ]),
                    Section::make('Details')->schema([
                        TagsInput::make('tech')->placeholder('Laravel, React…'),
                        TagsInput::make('badges')->suggestions(['Open Source', 'Free', 'Paid/SaaS', 'CLI', 'Library', 'Client work']),
                        TextInput::make('language'),
                        ColorPicker::make('language_color'),
                    ]),
                    Section::make('Links')->schema([
                        TextInput::make('live_url')->url(),
                        TextInput::make('docs_url')->url(),
                        TextInput::make('repo_url')->url(),
                        TextInput::make('github_repo')->placeholder('owner/name')
                            ->helperText('When set, stars, forks, language and latest release sync from GitHub.'),
                    ]),
                    Section::make('Stats')->schema([
                        TextInput::make('stars')->numeric()->default(0),
                        TextInput::make('forks')->numeric()->default(0),
                        TextInput::make('release_version'),
                    ])->collapsed(),
                ])->columnSpan(1),
            ]);
    }
}
