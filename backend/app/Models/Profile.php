<?php

namespace App\Models;

use App\Models\Concerns\TriggersSiteRebuild;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/** Singleton row describing the site owner. */
#[Unguarded]
class Profile extends Model
{
    use TriggersSiteRebuild;

    protected function casts(): array
    {
        return [
            'open_to_work' => 'boolean',
            'joined_at' => 'date',
        ];
    }

    public static function current(): static
    {
        return static::query()->firstOrFail();
    }
}
