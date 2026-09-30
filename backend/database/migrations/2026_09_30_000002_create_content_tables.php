<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary');
            $table->longText('body')->nullable();
            $table->string('cover_image')->nullable();
            $table->json('gallery')->nullable();
            $table->json('tech')->nullable();
            $table->json('badges')->nullable();
            $table->string('language')->nullable();
            $table->string('language_color', 16)->nullable();
            $table->string('live_url')->nullable();
            $table->string('docs_url')->nullable();
            $table->string('repo_url')->nullable();
            // owner/name — when set, stars/forks/release are filled by the GitHub sync.
            $table->string('github_repo')->nullable();
            $table->unsignedInteger('stars')->default(0);
            $table->unsignedInteger('forks')->default(0);
            $table->string('release_version')->nullable();
            $table->boolean('pinned')->default(false);
            $table->string('status')->default('draft'); // draft | published
            $table->date('started_at')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('og_image')->nullable();
            $table->timestamps();
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt');
            $table->longText('body');
            $table->string('cover_image')->nullable();
            $table->string('status')->default('draft'); // draft | published (future published_at = scheduled)
            $table->timestamp('published_at')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('og_image')->nullable();
            $table->timestamps();
            $table->index(['status', 'published_at']);
        });

        Schema::create('post_tag', function (Blueprint $table) {
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['post_id', 'tag_id']);
        });

        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('work'); // work | education
            $table->string('title');
            $table->string('organization');
            $table->string('organization_url')->nullable();
            $table->string('logo')->nullable();
            $table->string('location')->nullable();
            $table->date('started_at');
            $table->date('ended_at')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->nullable();
            $table->string('icon')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->text('summary');
            $table->longText('description')->nullable();
            $table->json('deliverables')->nullable();
            $table->boolean('quote_only')->default(true);
            $table->decimal('price_amount', 10, 2)->nullable();
            $table->string('price_currency', 3)->nullable();
            $table->string('price_prefix')->nullable(); // e.g. "From"
            $table->string('price_unit')->nullable();   // e.g. "per project", "per hour"
            $table->boolean('visible')->default(true);
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('page')->default('services'); // services | contact | support
            $table->string('question');
            $table->text('answer');
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role')->nullable();
            $table->string('company')->nullable();
            $table->string('photo')->nullable();
            $table->text('quote');
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('visible')->default(true);
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('support_methods', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // github_sponsors | kofi | buymeacoffee | paypal | crypto | other
            $table->string('label');
            $table->text('description')->nullable();
            $table->string('url')->nullable();
            $table->string('crypto_coin')->nullable();
            $table->string('crypto_network')->nullable();
            $table->string('crypto_address')->nullable();
            $table->boolean('visible')->default(true);
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_methods');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('services');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('experiences');
        Schema::dropIfExists('post_tag');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('projects');
    }
};
