<?php

namespace App\Models;

use App\Models\Concerns\TriggersSiteRebuild;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Unguarded]
class Tag extends Model
{
    use TriggersSiteRebuild;

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class);
    }
}
