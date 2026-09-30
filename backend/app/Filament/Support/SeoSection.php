<?php

namespace App\Filament\Support;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;

/** Optional per-record SEO overrides; empty fields fall back to generated values. */
class SeoSection
{
    public static function make(): Section
    {
        return Section::make('SEO overrides')
            ->description('Leave empty to use the title, summary and an auto-generated social image.')
            ->schema([
                TextInput::make('seo_title')->maxLength(70)->helperText('Up to ~60 characters shows fully in Google.'),
                Textarea::make('seo_description')->rows(2)->maxLength(170)->helperText('Up to ~155 characters.'),
                FileUpload::make('og_image')->label('Social image (1200×630)')->image()->disk('public')->directory('og')->maxSize(2048),
            ])
            ->collapsed();
    }
}
