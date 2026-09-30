<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(SiteSeeder::class);

        $admin = config('services.admin');
        if (filled($admin['email']) && filled($admin['password'])) {
            User::firstOrCreate(
                ['email' => $admin['email']],
                ['name' => $admin['name'], 'password' => $admin['password']],
            );
        }

        // Invented sample content for local development only; never seeded in production.
        if (app()->environment('local', 'testing')) {
            $this->call(DemoContentSeeder::class);
        }
    }
}
