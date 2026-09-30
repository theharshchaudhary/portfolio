<?php

namespace App\Filament\Resources\Posts\Schemas;

use App\Filament\Support\SeoSection;
use App\Filament\Support\Slug;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\MarkdownEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class PostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(3)
            ->components([
                Group::make([
                    Section::make('Post')->schema([
                        Slug::title('title'),
                        Slug::field('slug', prefix: '/blog/'),
                        Textarea::make('excerpt')->required()->rows(2)->maxLength(300)
                            ->helperText('Shown in lists and used as the meta description if SEO description is empty.'),
                        MarkdownEditor::make('body')->required()->minHeight('32rem')
                            ->fileAttachmentsDisk('public')->fileAttachmentsDirectory('posts/attachments'),
                    ]),
                    SeoSection::make(),
                ])->columnSpan(2),

                Group::make([
                    Section::make('Publishing')->schema([
                        Select::make('status')->options(['draft' => 'Draft', 'published' => 'Published'])->default('draft')->required(),
                        DateTimePicker::make('published_at')->default(now())
                            ->helperText('A future date schedules the post; it appears on the next rebuild after that time.'),
                    ]),
                    Section::make('Organise')->schema([
                        Select::make('tags')->relationship('tags', 'name')->multiple()->preload()->searchable()
                            ->createOptionForm([
                                TextInput::make('name')->required()->live(onBlur: true)
                                    ->afterStateUpdated(fn ($set, ?string $state) => $set('slug', Str::slug((string) $state))),
                                TextInput::make('slug')->required()->unique('tags', 'slug'),
                            ]),
                        FileUpload::make('cover_image')->image()->disk('public')->directory('posts')->maxSize(4096),
                    ]),
                ])->columnSpan(1),
            ]);
    }
}
