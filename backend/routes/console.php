<?php

use App\Services\GithubSync;
use Illuminate\Support\Facades\Artisan;

Artisan::command('github:sync', function (GithubSync $sync) {
    $result = $sync->run();
    $this->info('Synced: '.json_encode($result));
})->purpose('Fetch GitHub contributions, repos, languages and activity');
