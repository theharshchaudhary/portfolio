<?php

namespace App\Models;

use App\Models\Concerns\TriggersSiteRebuild;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Service extends Model
{
    use TriggersSiteRebuild;

    protected function casts(): array
    {
        return [
            'deliverables' => 'array',
            'quote_only' => 'boolean',
            'price_amount' => 'decimal:2',
            'visible' => 'boolean',
        ];
    }
}
