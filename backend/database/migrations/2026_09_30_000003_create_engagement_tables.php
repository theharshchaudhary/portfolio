<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('subject')->nullable();
            $table->text('body');
            $table->string('ip_hash', 64)->nullable();
            $table->string('user_agent')->nullable();
            $table->boolean('is_spam')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        // Cookieless analytics: one row per day, path and referrer host.
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->date('day');
            $table->string('path');
            $table->string('referrer_host')->default('');
            $table->unsignedInteger('views')->default(0);
            $table->unique(['day', 'path', 'referrer_host']);
        });

        // Cached GitHub API results (contributions, repos, languages, activity).
        Schema::create('github_snapshots', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('payload');
            $table->timestamp('fetched_at');
            $table->timestamps();
        });

        Schema::create('site_builds', function (Blueprint $table) {
            $table->id();
            $table->string('reason');
            $table->string('status'); // dispatched | failed | skipped
            $table->text('error')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_builds');
        Schema::dropIfExists('github_snapshots');
        Schema::dropIfExists('page_views');
        Schema::dropIfExists('messages');
    }
};
