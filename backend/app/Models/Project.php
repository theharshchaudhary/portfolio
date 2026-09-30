<?php

namespace App\Models;

use App\Models\Concerns\TriggersSiteRebuild;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Project extends Model
{
    use TriggersSiteRebuild;

    protected function casts(): array
    {
        return [
            'gallery' => 'array',
            'tech' => 'array',
            'badges' => 'array',
            'pinned' => 'boolean',
            'started_at' => 'date',
        ];
    }

    public function scopePublished(Builder $query): void
    {
        $query->where('status', 'published');
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }
}
