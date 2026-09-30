<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Singleton: one row holds all site-wide settings.
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name');
            $table->string('tagline')->nullable();
            $table->string('site_url');
            $table->string('title_template')->default('%s · {site}');
            $table->string('default_title');
            $table->text('default_description');
            $table->string('default_og_image')->nullable();
            $table->string('footer_text')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('notify_email')->nullable();
            $table->string('github_username')->nullable();
            $table->string('turnstile_site_key')->nullable();
            $table->text('turnstile_secret_key')->nullable();
            $table->string('indexnow_key')->nullable();
            $table->boolean('analytics_enabled')->default(true);
            $table->boolean('auto_rebuild')->default(true);
            $table->json('hero')->nullable();
            $table->timestamps();
        });

        // Singleton: the person the site is about.
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->nullable();
            $table->string('headline')->nullable();
            $table->text('short_bio')->nullable();
            $table->longText('long_bio')->nullable();
            $table->string('avatar')->nullable();
            $table->string('location')->nullable();
            $table->string('company')->nullable();
            $table->string('status_emoji', 16)->nullable();
            $table->string('status_message')->nullable();
            $table->boolean('open_to_work')->default(false);
            $table->string('cv_file')->nullable();
            $table->date('joined_at')->nullable();
            $table->timestamps();
        });

        Schema::create('social_links', function (Blueprint $table) {
            $table->id();
            $table->string('platform');
            $table->string('label')->nullable();
            $table->string('handle')->nullable();
            $table->string('url');
            $table->boolean('show_in_sidebar')->default(true);
            $table->boolean('show_in_footer')->default(true);
            $table->boolean('show_on_contact')->default(true);
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('nav_items', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('path');
            $table->string('icon')->nullable();
            $table->string('badge_source')->default('none'); // none | projects | posts | manual
            $table->unsignedInteger('badge_value')->nullable();
            $table->boolean('visible')->default(true);
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        // Per-page heading, intro and SEO overrides, keyed by route (home, projects, blog, ...).
        Schema::create('page_contents', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('heading')->nullable();
            $table->text('intro')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('og_image')->nullable();
            $table->timestamps();
        });

        Schema::create('redirects', function (Blueprint $table) {
            $table->id();
            $table->string('from_path')->unique();
            $table->string('to_path');
            $table->unsignedSmallInteger('status_code')->default(301);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('redirects');
        Schema::dropIfExists('page_contents');
        Schema::dropIfExists('nav_items');
        Schema::dropIfExists('social_links');
        Schema::dropIfExists('profiles');
        Schema::dropIfExists('site_settings');
    }
};
