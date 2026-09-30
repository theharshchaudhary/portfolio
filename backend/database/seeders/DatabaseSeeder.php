<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(SiteSeeder::class);

        if (filled(env('ADMIN_EMAIL')) && filled(env('ADMIN_PASSWORD'))) {
            User::firstOrCreate(
                ['email' => env('ADMIN_EMAIL')],
                ['name' => env('ADMIN_NAME', 'Admin'), 'password' => env('ADMIN_PASSWORD')],
            );
        }

        // Invented sample content for local development only; never seeded in production.
        if (app()->environment('local', 'testing')) {
            $this->call(DemoContentSeeder::class);
        }
    }
}
