<?php

namespace App\Models;

use App\Models\Concerns\TriggersSiteRebuild;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class SocialLink extends Model
{
    use TriggersSiteRebuild;

    protected function casts(): array
    {
        return [
            'show_in_sidebar' => 'boolean',
            'show_in_footer' => 'boolean',
            'show_on_contact' => 'boolean',
        ];
    }
}
