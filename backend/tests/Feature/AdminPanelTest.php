<?php

namespace Tests\Feature;

use App\Filament\Resources\Messages\MessageResource;
use App\Models\Message;
use App\Models\Post;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->actingAs(User::factory()->create());
    }

    public static function pages(): array
    {
        return array_map(fn ($p) => [$p], [
            '/admin', '/admin/site-settings', '/admin/site-profile', '/admin/profile',
            '/admin/projects', '/admin/projects/create', '/admin/posts', '/admin/posts/create',
            '/admin/messages', '/admin/tags', '/admin/services', '/admin/faqs', '/admin/testimonials',
            '/admin/experiences', '/admin/skills', '/admin/social-links', '/admin/support-methods',
            '/admin/nav-items', '/admin/page-contents', '/admin/redirects',
        ]);
    }

    #[DataProvider('pages')]
    public function test_admin_page_renders(string $path): void
    {
        $this->get($path)->assertOk();
    }

    public function test_edit_pages_render(): void
    {
        $this->get('/admin/projects/'.Project::first()->id.'/edit')->assertOk();
        $this->get('/admin/posts/'.Post::first()->id.'/edit')->assertOk();
    }

    public function test_guests_are_redirected_to_login(): void
    {
        auth()->logout();
        $this->get('/admin/projects')->assertRedirect('/admin/login');
    }

    public function test_messages_badge_counts_unread_non_spam(): void
    {
        Message::create(['name' => 'A', 'email' => 'a@example.com', 'body' => 'Hello there friend']);
        Message::create(['name' => 'B', 'email' => 'b@example.com', 'body' => 'Buy cheap stuff', 'is_spam' => true]);

        $this->assertSame('1', MessageResource::getNavigationBadge());
    }
}
