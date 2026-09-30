// Runs after `react-router build`. Reads the prerendered HTML (the single source of truth for titles and
// descriptions) and writes SEO assets next to it in build/client:
//   og/**.png      1200×630 social card per indexable page (satori → resvg)
//   sitemap.xml    every indexable page with lastmod
//   robots.txt
//   rss.xml        full-content feed, plus blog/tag/<slug>/rss.xml per tag
//   <key>.txt      IndexNow key file (when a key is set in the admin)
//   seo-urls.json  URL + lastmod list the deploy workflow diffs to ping IndexNow
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getContent } from '../src/lib/content.server';
import { renderMarkdown } from '../src/lib/markdown.server';
import { ogImagePath } from '../src/lib/seo';
import type { SiteContent } from '../src/types';

const OUT = join(process.cwd(), 'build', 'client');

interface Page {
  path: string;
  title: string;
  description: string;
  noindex: boolean;
  ogImage: string | null;
}

async function findPages(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => (e.isDirectory() ? findPages(join(dir, e.name)) : e.name === 'index.html' ? [join(dir, e.name)] : [])),
  );
  return files.flat();
}

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const meta = (html: string, attr: string, name: string) =>
  html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1];

async function readPage(file: string): Promise<Page> {
  const html = await readFile(file, 'utf8');
  const rel = relative(OUT, dirname(file)).split(sep).join('/');
  return {
    path: rel ? `/${rel}` : '/',
    title: decode(meta(html, 'property', 'og:title') ?? html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''),
    description: decode(meta(html, 'name', 'description') ?? ''),
    noindex: /<meta name="robots" content="[^"]*noindex/.test(html),
    ogImage: meta(html, 'property', 'og:image') ?? null,
  };
}

// ---------------------------------------------------------------- social cards

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Node | string | null)[]): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.filter((c) => c !== null) },
});

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

function sectionLabel(path: string): string {
  if (path.startsWith('/blog/tag/')) return 'Topic';
  if (path.startsWith('/blog/')) return 'Blog post';
  if (path.startsWith('/projects/')) return 'Project';
  return 'Portfolio';
}

async function imageDataUri(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? 'image/png';
    if (!/png|jpe?g/.test(type)) return null; // resvg/satori can't decode webp/avif avatars
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {
    return null;
  }
}

function card(page: Page, content: SiteContent, avatar: string | null, stripSuffix: string): Node {
  const { profile, settings } = content;
  const title = truncate(page.title.endsWith(stripSuffix) ? page.title.slice(0, -stripSuffix.length) : page.title, 110);
  const titleSize = title.length > 80 ? 48 : title.length > 50 ? 58 : 68;
  const host = new URL(settings.url).host;
  const initials = profile.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const greens = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

  return h('div', { width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: '#ffffff', fontFamily: 'Inter' },
    h('div', { height: 14, width: '100%', backgroundImage: 'linear-gradient(90deg, #0969da, #8250df, #1f883d)' }),
    h('div', { display: 'flex', flexDirection: 'column', flex: 1, padding: '56px 72px' },
      h('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        h('div', { display: 'flex', padding: '8px 20px', borderRadius: 999, border: '2px solid #d0d7de', background: '#f6f8fa', color: '#656d76', fontSize: 24, fontWeight: 700 }, sectionLabel(page.path)),
        h('div', { display: 'flex', color: '#656d76', fontSize: 26 }, host),
      ),
      h('div', { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' },
        h('div', { display: 'flex', fontSize: titleSize, fontWeight: 800, color: '#1f2328', lineHeight: 1.12, letterSpacing: -1 }, title),
        page.description
          ? h('div', { display: 'flex', marginTop: 24, fontSize: 28, color: '#656d76', lineHeight: 1.4 }, truncate(page.description, 140))
          : null,
      ),
      h('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
        h('div', { display: 'flex', alignItems: 'center' },
          avatar
            ? { type: 'img', props: { src: avatar, width: 76, height: 76, style: { borderRadius: 999, border: '3px solid #d8dee4' } } }
            : h('div', { display: 'flex', width: 76, height: 76, borderRadius: 999, alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 30, fontWeight: 800, backgroundImage: 'linear-gradient(135deg, #0969da, #1f883d)' }, initials),
          h('div', { display: 'flex', flexDirection: 'column', marginLeft: 20 },
            h('div', { display: 'flex', fontSize: 30, fontWeight: 700, color: '#1f2328' }, profile.name),
            profile.headline ? h('div', { display: 'flex', fontSize: 22, color: '#656d76' }, profile.headline) : null,
          ),
        ),
        // A small contribution-graph motif.
        h('div', { display: 'flex' },
          ...Array.from({ length: 12 }, (_, col) =>
            h('div', { display: 'flex', flexDirection: 'column', marginLeft: 5 },
              ...Array.from({ length: 5 }, (_, row) =>
                h('div', { width: 16, height: 16, marginTop: 5, borderRadius: 3, background: greens[(col * 7 + row * 3 + col * row) % 5] }),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

// ---------------------------------------------------------------- feeds and sitemap

async function rss(content: SiteContent, posts: SiteContent['posts'], selfPath: string, title: string, description: string) {
  const { settings } = content;
  const items = await Promise.all(
    posts.map(async (p) => {
      const url = `${settings.url}/blog/${p.slug}`;
      const { html } = await renderMarkdown(p.body);
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
      <content:encoded><![CDATA[${html.replaceAll(']]>', ']]]]><![CDATA[>')}]]></content:encoded>
${p.tags.map((t) => `      <category>${escapeXml(t.name)}</category>`).join('\n')}
    </item>`;
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${settings.url}/blog</link>
    <description>${escapeXml(description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date(posts[0]?.updatedAt ?? content.generatedAt).toUTCString()}</lastBuildDate>
    <atom:link href="${settings.url}${selfPath}" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>
`;
}

function lastmodFor(path: string, content: SiteContent): string {
  const latest = (dates: string[]) => dates.sort().at(-1) ?? content.generatedAt;
  const post = content.posts.find((p) => path === `/blog/${p.slug}`);
  if (post) return post.updatedAt;
  const project = content.projects.find((p) => path === `/projects/${p.slug}`);
  if (project) return project.updatedAt;
  const tag = content.tags.find((t) => path === `/blog/tag/${t.slug}`);
  if (tag) return latest(content.posts.filter((p) => p.tags.some((t) => t.slug === tag.slug)).map((p) => p.updatedAt));
  if (path === '/blog') return latest(content.posts.map((p) => p.updatedAt));
  if (path === '/projects') return latest(content.projects.map((p) => p.updatedAt));
  return content.generatedAt;
}

// ---------------------------------------------------------------- server config

/**
 * LiteSpeed/Apache config for public/ (the static site plus Laravel's front controller).
 * SITE_ENV=staging adds noindex everywhere and skips the canonical-host redirect.
 */
function htaccess(content: SiteContent, env: 'production' | 'staging'): string {
  const canonicalHost = new URL(content.settings.url).host;
  const escapeRegex = (s: string) => s.replace(/^\/+|\/+$/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const redirects = content.redirects
    .filter((r) => r.from.startsWith('/') && r.from !== '/')
    .map((r) => `    RewriteRule ^${escapeRegex(r.from)}/?$ ${r.to} [R=${r.status === 302 ? 302 : 301},L]`)
    .join('\n');

  return `# Generated by frontend/scripts/postbuild.ts. Do not edit on the server; it is replaced on every deploy.

# PHP 8.4 for this vhost. cPanel normally writes this block itself; deploys replace the file.
# php -- BEGIN cPanel-generated handler, do not edit
<IfModule mime_module>
  AddHandler application/x-httpd-ea-php84 .php .php8 .phtml
</IfModule>
# php -- END cPanel-generated handler, do not edit

Options -MultiViews -Indexes
DirectoryIndex index.html index.php
# /projects is served from projects/index.html without a trailing-slash redirect.
DirectorySlash Off
ErrorDocument 404 /404/index.html

# LSAPI ignores .user.ini, so PHP settings live here.
<IfModule Litespeed>
    php_value upload_max_filesize 8M
    php_value post_max_size 16M
    php_value memory_limit 256M
    php_value max_execution_time 120
    # The host default (17) prints 4.3 as 4.2999999999999998 in JSON.
    php_value serialize_precision -1
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On

    RewriteCond %{HTTPS} !=on
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
${env === 'production' ? `
    # One canonical host: www and any alias → ${canonicalHost}
    RewriteCond %{HTTP_HOST} !^${escapeRegex(canonicalHost)}$ [NC]
    RewriteRule ^ https://${canonicalHost}%{REQUEST_URI} [L,R=301]
` : ''}
    # Pass auth headers through to PHP.
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
${redirects ? `\n    # Redirects managed in the admin panel\n${redirects}\n` : ''}
    # Laravel: admin panel, API, Livewire, health check
    RewriteRule ^(admin|api|filament|livewire-[a-z0-9]+|up)(/|$) index.php [L]

    # One URL per page: drop trailing slashes (except the home page).
    RewriteCond %{REQUEST_URI} !^/$
    RewriteRule ^(.+)/$ /$1 [R=301,L]

    # Pretty URLs: /projects → projects/index.html
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteCond %{REQUEST_FILENAME}/index.html -f
    RewriteRule ^(.+)$ $1/index.html [L]

    # Anything else that isn't a real file falls through to ErrorDocument 404.
</IfModule>

<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
${env === 'production' ? '    Header always set Strict-Transport-Security "max-age=31536000"\n' : '    Header always set X-Robots-Tag "noindex, nofollow"\n'}
    # HTML and route data change on every rebuild: always revalidate.
    <FilesMatch "\\.(html|data)$">
        Header set Cache-Control "no-cache"
    </FilesMatch>
    <FilesMatch "\\.(xml|txt|json)$">
        Header set Cache-Control "public, max-age=3600"
    </FilesMatch>
    <FilesMatch "\\.(png|jpe?g|webp|avif|gif|svg|ico)$">
        Header set Cache-Control "public, max-age=86400"
    </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/javascript application/json application/xml application/rss+xml image/svg+xml
</IfModule>
`;
}

// Content-hashed build assets never change: cache them for a year.
const ASSETS_HTACCESS = `<IfModule mod_headers.c>
    Header set Cache-Control "public, max-age=31536000, immutable"
</IfModule>
`;

// ---------------------------------------------------------------- main

async function main() {
  const started = Date.now();
  const content = await getContent();
  const { settings } = content;
  const pages = (await Promise.all((await findPages(OUT)).map(readPage))).filter((p) => p.path !== '/404');
  const indexable = pages.filter((p) => !p.noindex);

  // Social cards
  const fontDir = join(process.cwd(), 'node_modules', '@fontsource', 'inter', 'files');
  const fonts = await Promise.all(
    ([[400, 'normal'], [700, 'normal'], [800, 'normal']] as const).map(async ([weight, style]) => ({
      name: 'Inter',
      data: await readFile(join(fontDir, `inter-latin-${weight}-${style}.woff`)),
      weight,
      style,
    })),
  );
  const avatar = await imageDataUri(content.profile.avatar);
  const suffix = settings.titleTemplate.replace('%s', '');
  let cards = 0;
  for (const page of indexable) {
    const target = ogImagePath(page.path);
    if (!page.ogImage?.endsWith(target)) continue; // page uses an uploaded image instead
    const svg = await satori(card(page, content, avatar, suffix) as never, { width: 1200, height: 630, fonts: fonts as never });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    const file = join(OUT, target);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, png);
    cards++;
  }

  // Sitemap, robots, IndexNow URL list
  const urls = indexable
    .map((p) => ({ loc: p.path === '/' ? `${settings.url}/` : `${settings.url}${p.path}`, lastmod: lastmodFor(p.path, content) }))
    .sort((a, b) => a.loc.localeCompare(b.loc));
  await writeFile(
    join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`)
      .join('\n')}\n</urlset>\n`,
  );
  const siteEnv = process.env.SITE_ENV === 'staging' ? 'staging' : 'production';
  await writeFile(
    join(OUT, 'robots.txt'),
    siteEnv === 'staging'
      ? 'User-agent: *\nDisallow: /\n'
      : `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${settings.url}/sitemap.xml\n`,
  );
  await writeFile(join(OUT, 'seo-urls.json'), JSON.stringify({ indexNowKey: settings.indexNowKey, urls }, null, 2));

  // RSS
  const blogTitle = `${content.profile.name} — Blog`;
  await writeFile(join(OUT, 'rss.xml'), await rss(content, content.posts, '/rss.xml', blogTitle, content.pages.blog?.intro ?? settings.description));
  for (const tag of content.tags) {
    const posts = content.posts.filter((p) => p.tags.some((t) => t.slug === tag.slug));
    const file = join(OUT, 'blog', 'tag', tag.slug, 'rss.xml');
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, await rss(content, posts, `/blog/tag/${tag.slug}/rss.xml`, `${blogTitle}: ${tag.name}`, tag.description ?? `Posts about ${tag.name}`));
  }

  // IndexNow key file (https://www.indexnow.org/documentation)
  if (settings.indexNowKey && /^[a-zA-Z0-9-]{8,128}$/.test(settings.indexNowKey)) {
    await writeFile(join(OUT, `${settings.indexNowKey}.txt`), settings.indexNowKey);
  }

  // Server config + the manifest deploy/unpack.php uses to tell site files from Laravel's.
  await writeFile(join(OUT, '.htaccess'), htaccess(content, siteEnv));
  await writeFile(join(OUT, 'assets', '.htaccess'), ASSETS_HTACCESS);
  const entries = (await readdir(OUT)).filter((name) => name !== '.site-files');
  await writeFile(join(OUT, '.site-files'), `${entries.join('\n')}\n`);

  console.log(
    `postbuild (${siteEnv}): ${cards} social cards, ${urls.length} sitemap URLs, ${content.tags.length + 1} RSS feeds in ${Date.now() - started} ms`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
