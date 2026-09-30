<?php

namespace App\Models\Concerns;

use App\Services\SiteBuilder;

/** Any change to public content asks CI to rebuild the static site. */
trait TriggersSiteRebuild
{
    public static function bootTriggersSiteRebuild(): void
    {
        $trigger = fn ($model) => app(SiteBuilder::class)->request(class_basename($model).' changed');

        static::saved($trigger);
        static::deleted($trigger);
    }
}
