<?php

namespace App\Models;

use App\Models\Concerns\TriggersSiteRebuild;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/** Singleton row with site-wide settings. */
#[Unguarded]
class SiteSetting extends Model
{
    use TriggersSiteRebuild;

    protected function casts(): array
    {
        return [
            'turnstile_secret_key' => 'encrypted',
            'analytics_enabled' => 'boolean',
            'auto_rebuild' => 'boolean',
            'hero' => 'array',
        ];
    }

    public static function current(): static
    {
        return static::query()->firstOrFail();
    }
}
