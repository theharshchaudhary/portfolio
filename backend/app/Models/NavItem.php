<?php

namespace App\Models;

use App\Models\Concerns\TriggersSiteRebuild;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class NavItem extends Model
{
    use TriggersSiteRebuild;

    protected function casts(): array
    {
        return [
            'visible' => 'boolean',
        ];
    }
}
