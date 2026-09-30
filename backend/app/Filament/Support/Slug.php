<?php

namespace App\Filament\Support;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Illuminate\Support\Str;

/** Title + slug pair: typing a title fills the slug until the slug is edited by hand. */
class Slug
{
    public static function title(string $name = 'title'): TextInput
    {
        return TextInput::make($name)
            ->required()
            ->maxLength(190)
            ->live(onBlur: true)
            ->afterStateUpdated(function (Get $get, Set $set, ?string $old, ?string $state) {
                if (blank($get('slug')) || $get('slug') === Str::slug((string) $old)) {
                    $set('slug', Str::slug((string) $state));
                }
            });
    }

    public static function field(string $name = 'slug', string $prefix = '/'): TextInput
    {
        return TextInput::make($name)
            ->required()
            ->maxLength(190)
            ->prefix($prefix)
            ->alphaDash()
            ->unique(ignoreRecord: true);
    }
}
