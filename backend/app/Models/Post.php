<?php

namespace App\Models;

use App\Models\Concerns\TriggersSiteRebuild;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Unguarded]
class Post extends Model
{
    use TriggersSiteRebuild;

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    /** Published and not scheduled for the future. */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', 'published')->where('published_at', '<=', now());
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function readingTime(): int
    {
        return max(1, (int) ceil(str_word_count(strip_tags($this->body)) / 220));
    }
}
