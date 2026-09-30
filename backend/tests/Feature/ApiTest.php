<?php

namespace Tests\Feature;

use App\Mail\ContactMessageReceived;
use App\Models\Message;
use App\Models\PageView;
use App\Models\Post;
use App\Models\SiteSetting;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_content_endpoint_returns_the_full_contract(): void
    {
        $this->getJson('/api/v1/content')
            ->assertOk()
            ->assertJsonStructure([
                'generatedAt',
                'settings' => ['siteName', 'url', 'titleTemplate', 'defaultTitle', 'description', 'hero'],
                'profile' => ['name', 'shortBio', 'avatar', 'status', 'followers'],
                'socials', 'nav' => [['label', 'path', 'badge']], 'pages', 'redirects', 'experiences', 'skills',
                'projects' => [['slug', 'title', 'summary', 'tech', 'seo' => ['title', 'description', 'ogImage']]],
                'posts' => [['slug', 'title', 'body', 'publishedAt', 'readingTime', 'tags']],
                'tags', 'services', 'faqs', 'testimonials', 'support',
                'github' => ['contributions', 'streak', 'languages', 'activity'],
            ])
            ->assertJsonPath('settings.titleTemplate', '%s · Harsh Chaudhary');
    }

    public function test_drafts_and_scheduled_posts_are_excluded(): void
    {
        Post::first()->update(['status' => 'draft']);
        Post::skip(1)->first()->update(['published_at' => now()->addWeek()]);

        $this->getJson('/api/v1/content')->assertJsonCount(1, 'posts');
    }

    public function test_quote_only_services_have_no_price(): void
    {
        $services = collect($this->getJson('/api/v1/content')->json('services'))->keyBy('slug');

        $this->assertNull($services['maintenance-support']['price']);
        $this->assertSame('USD', $services['web-application-development']['price']['currency']);
    }

    public function test_contact_stores_message_and_notifies(): void
    {
        Mail::fake();
        SiteSetting::current()->update(['notify_email' => 'me@example.com']);

        $this->postJson('/api/v1/contact', ['name' => 'Ada', 'email' => 'ada@example.com', 'message' => 'I would like a website.'])
            ->assertCreated();

        $this->assertDatabaseHas('messages', ['email' => 'ada@example.com', 'is_spam' => false]);
        Mail::assertSent(ContactMessageReceived::class, fn ($mail) => $mail->hasTo('me@example.com'));
    }

    public function test_contact_honeypot_marks_spam_without_telling_the_bot(): void
    {
        Mail::fake();
        SiteSetting::current()->update(['notify_email' => 'me@example.com']);

        $this->postJson('/api/v1/contact', ['name' => 'Bot', 'email' => 'bot@example.com', 'message' => 'Cheap followers here', 'website' => 'http://spam'])
            ->assertCreated();

        $this->assertTrue(Message::first()->is_spam);
        Mail::assertNothingSent();
    }

    public function test_contact_requires_turnstile_when_configured(): void
    {
        SiteSetting::current()->update(['turnstile_secret_key' => 'secret']);
        Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => false])]);

        $this->postJson('/api/v1/contact', ['name' => 'Ada', 'email' => 'ada@example.com', 'message' => 'Hello, is this working?', 'turnstileToken' => 'bad'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('turnstileToken');
        $this->assertSame(0, Message::count());
    }

    public function test_contact_validation(): void
    {
        $this->postJson('/api/v1/contact', ['name' => '', 'email' => 'nope', 'message' => 'short'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'message']);
    }

    public function test_contact_is_rate_limited(): void
    {
        $payload = ['name' => 'Ada', 'email' => 'ada@example.com', 'message' => 'Hello, is this working?'];
        $this->postJson('/api/v1/contact', $payload)->assertCreated();
        $this->postJson('/api/v1/contact', $payload)->assertCreated();
        $this->postJson('/api/v1/contact', $payload)->assertTooManyRequests();
    }

    public function test_page_views_aggregate_and_skip_bots(): void
    {
        $this->postJson('/api/v1/views', ['path' => '/blog?utm=x', 'referrer' => 'https://www.google.com/'])->assertNoContent();
        $this->postJson('/api/v1/views', ['path' => '/blog', 'referrer' => 'https://google.com/'])->assertNoContent();
        $this->withHeader('User-Agent', 'Googlebot/2.1')->postJson('/api/v1/views', ['path' => '/blog'])->assertNoContent();

        $this->assertSame(1, PageView::count());
        $this->assertSame(2, (int) PageView::first()->views);
        $this->assertSame('google.com', PageView::first()->referrer_host);
    }

    public function test_ops_endpoints_require_the_token(): void
    {
        config(['services.ops.token' => 'ops-secret']);

        $this->getJson('/api/ops/status')->assertUnauthorized();
        $this->withToken('wrong')->getJson('/api/ops/status')->assertUnauthorized();
        $this->withToken('ops-secret')->getJson('/api/ops/status')->assertOk();
    }

    public function test_ops_endpoints_do_not_exist_without_a_token(): void
    {
        config(['services.ops.token' => null]);

        $this->getJson('/api/ops/status')->assertNotFound();
    }
}
