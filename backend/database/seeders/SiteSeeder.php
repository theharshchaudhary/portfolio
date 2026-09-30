<?php

namespace Database\Seeders;

use App\Models\NavItem;
use App\Models\PageContent;
use App\Models\Profile;
use App\Models\SiteSetting;
use App\Models\SocialLink;
use Illuminate\Database\Seeder;

/** Minimal, real starting content. Safe to re-run: existing rows are never overwritten. */
class SiteSeeder extends Seeder
{
    public function run(): void
    {
        if (! SiteSetting::exists()) {
            SiteSetting::create([
                'site_name' => 'Harsh Chaudhary',
                'tagline' => 'Full-stack developer',
                'site_url' => 'https://harshchaudhary.com.np',
                'title_template' => '%s · {site}',
                'default_title' => 'Harsh Chaudhary — Full-stack Developer in Kathmandu, Nepal',
                'default_description' => 'Harsh Chaudhary is a full-stack developer in Kathmandu, Nepal, building web apps and tools with Laravel, React and TypeScript.',
                'footer_text' => '© {year} Harsh Chaudhary',
                'github_username' => 'theharshchaudhary',
                'analytics_enabled' => true,
                'auto_rebuild' => true,
                'hero' => [
                    'particleText' => 'Harsh Chaudhary',
                    'mode' => 'text',
                    'introLines' => ['Full-stack developer', 'Laravel · React · TypeScript', 'Based in Kathmandu, Nepal'],
                    'ctas' => [
                        ['label' => 'View projects', 'href' => '/projects', 'style' => 'primary'],
                        ['label' => 'Get in touch', 'href' => '/contact', 'style' => 'secondary'],
                    ],
                ],
            ]);
        }

        if (! Profile::exists()) {
            Profile::create([
                'name' => 'Harsh Chaudhary',
                'username' => 'theharshchaudhary',
                'headline' => 'Full-stack developer',
                'short_bio' => 'Full-stack developer building products and tools for the web.',
                'location' => 'Kathmandu, Nepal',
            ]);
        }

        if (! SocialLink::exists()) {
            SocialLink::create([
                'platform' => 'github',
                'label' => 'GitHub',
                'handle' => 'theharshchaudhary',
                'url' => 'https://github.com/theharshchaudhary',
                'sort' => 1,
            ]);
        }

        if (! NavItem::exists()) {
            $nav = [
                ['Overview', '/', 'book-open', 'none'],
                ['Projects', '/projects', 'folder-git-2', 'projects'],
                ['Blog', '/blog', 'rss', 'posts'],
                ['About', '/about', 'info', 'none'],
                ['Services', '/services', 'briefcase', 'none'],
                ['Contact', '/contact', 'mail', 'none'],
                ['Support', '/support', 'heart', 'none'],
            ];
            foreach ($nav as $i => [$label, $path, $icon, $badge]) {
                NavItem::create(['label' => $label, 'path' => $path, 'icon' => $icon, 'badge_source' => $badge, 'sort' => $i + 1]);
            }
        }

        $pages = [
            'home' => [null, null],
            'projects' => ['Projects', 'Open-source tools, client work and side projects.'],
            'blog' => ['Blog', 'Articles on web development, architecture and the craft of building software.'],
            'about' => ['About', null],
            'services' => ['Services', 'Web development services for businesses and startups.'],
            'contact' => ['Get in touch', 'Have a project, question, or just want to say hi? I respond to all messages.'],
            'support' => ['Support my work', 'If my open-source work has helped you, consider supporting it.'],
        ];
        foreach ($pages as $key => [$heading, $intro]) {
            PageContent::firstOrCreate(['key' => $key], ['heading' => $heading, 'intro' => $intro]);
        }
    }
}
