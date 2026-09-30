# Portfolio Build Plan

Personal portfolio for **harshchaudhary.com.np**: React frontend, Laravel backend, hosted on cPanel.
Top priorities are **SEO** and **speed** (Lighthouse 95+ across the board).

## 1. Decisions

| Area | Decision |
|---|---|
| Rendering | React pages built into static HTML at deploy time (full HTML for crawlers), then taken over by React in the browser |
| Backend | Laravel 11 JSON API + Filament admin panel at `/admin` |
| Content editing | **Everything dynamic:** all content, links, pricing, media and settings are edited in the admin panel (see §4). Saving triggers a site rebuild automatically |
| Design | GitHub-profile theme, polished. Light mode only |
| Animation | Showpiece: interactive **particle name/avatar hero**, plus scroll-reveal and micro-interactions |
| Speed budget | Lighthouse 95+ in all four categories, ≤100 KB JS on first load, checked in CI |
| SEO | Technical core + JSON-LD structured data + auto-generated OG images + RSS + IndexNow |
| Target queries | Name, local hiring (Nepal/Kathmandu), technical topics, freelance clients |
| GitHub data | Live from the GitHub API, synced on a schedule and cached by Laravel |
| Contact | Saved to DB, emailed to me, protected by Turnstile + hidden trap field + rate limit |
| Analytics | Self-hosted page-view counts in Laravel, no cookies, no banner |
| Language | English only |
| Domain | Replaces the existing CMS template on `harshchaudhary.com.np` at launch. The CMS is deleted with no backup (per Harsh) |

## 2. Sitemap (real paths, no `#`)

| URL | Purpose | Structured data (JSON-LD) |
|---|---|---|
| `/` | Particle hero, intro, pinned projects, contribution heatmap, latest posts, CTA | Person, WebSite |
| `/projects` | All projects, filterable by stack/type | CollectionPage |
| `/projects/{slug}` | Case study: problem, solution, stack, screenshots, links, results | SoftwareSourceCode / CreativeWork, Breadcrumb |
| `/blog` | Posts list with tags | Blog |
| `/blog/{slug}` | Post with code highlighting, table of contents, reading time, related posts | BlogPosting, Breadcrumb |
| `/blog/tag/{tag}` | Tag archive | CollectionPage |
| `/about` | Story, experience timeline, skills, CV download | ProfilePage + Person |
| `/services` | Freelance offerings: what, process, FAQ, CTA (targets hiring queries) | Service, FAQPage |
| `/contact` | Form + social channels | ContactPage |
| `/support` | GitHub Sponsors, Buy Me a Coffee / Ko-fi, PayPal, crypto | WebPage |
| `/404` | Real 404 status | none |

Global: Ctrl+K command palette (pages, projects, posts), social links (GitHub, LinkedIn, X, etc.) in the sidebar and footer.

## 3. Architecture

```text
repo/
├── frontend/     React 18 + TS + Vite + Tailwind + React Router (prerender mode)
├── backend/      Laravel 11 + Filament 3, MySQL
└── .github/workflows/
    ├── deploy-backend.yml   composer install → FTPS upload → migrate via token-guarded endpoint
    ├── deploy-frontend.yml  fetch content from API → prerender all routes → FTPS upload
    └── lighthouse.yml       budgets + Lighthouse CI on every PR/push
```

**Serving on cPanel (no SSH, no long-running Node process):**
- `public_html/` holds the prebuilt static site. `.htaccess` sends `/api/*` and `/admin/*` to Laravel's `index.php` and serves everything else as static files.
- Laravel code lives outside `public_html` (under `~/apps/portfolio`). It runs as normal PHP under LiteSpeed, so no extra processes stay running (the account allows only ~12).
- **Content rebuilds:** publishing in the admin panel makes Laravel call GitHub's `repository_dispatch`. Actions then rebuilds and uploads the site (~2–3 min). A scheduled Action also rebuilds daily to refresh GitHub stats.
- **GitHub sync:** a scheduled GitHub Action calls a token-guarded Laravel endpoint that fetches from the GitHub GraphQL API (contributions, repos, languages, activity) and caches the results in the DB.
- **Migrations:** the DB accepts only local connections, so CI calls a token-guarded `/api/_ops/migrate` endpoint after each backend deploy.

## 4. Data model (backend): everything editable

**Rule: no personal content is hard-coded in the frontend.** Every text, link, image, list, and setting comes from the admin panel. The frontend holds only layout, components and neutral fallbacks, so a fresh install still builds. Saving anything in the admin panel triggers a rebuild.

| Admin section | What's editable |
|---|---|
| **Site settings** (singleton) | Site name, tagline, domain, default SEO title template + description, default OG image, footer text, public contact email, notification email, Turnstile keys, GitHub username (for sync), IndexNow key, analytics on/off |
| **Profile** (singleton) | Name, headline, short + long bio (markdown), avatar, location, company, status emoji + message, "open to work" toggle, CV/resume PDF upload |
| **Hero** | Particle text (name or custom), whether particles form the avatar or the text, colours, intro lines, CTA buttons (label + link) |
| **Navigation** | Tab/menu items: label, icon, route, order, visible toggle, badge (manual number or auto-count) |
| **Social links** | Platform, handle, URL, icon, order, show in sidebar/footer/contact. Feeds JSON-LD `sameAs` |
| **Experience / Education** | Role, org, logo, dates, description, order |
| **Skills** | Name, category, icon, level/order |
| **Projects** | Title, slug, summary, case-study body (markdown), cover + gallery images, tech tags, badges, links (live/docs/repo), linked GitHub repo (auto stars/forks/release), pinned, order, status |
| **Blog posts / Tags** | Title, slug, excerpt, markdown body, cover, tags, status (draft/scheduled/published), publish date |
| **Services** | Title, icon, description, deliverables, price (amount + currency + "from/per" unit) **or** "contact for a quote" toggle, order |
| **FAQs** | Question, answer, which page (Services/Contact/Support), order |
| **Testimonials** | Name, role, photo, quote, linked project |
| **Support methods** | Type (GitHub Sponsors / Ko-fi / Buy Me a Coffee / PayPal / crypto / other), label, URL, **crypto coin + network + address + auto-generated QR**, order, visible |
| **Page content** | For each page: heading, intro text, and optional sections, plus SEO overrides (title, description, OG image) |
| **Redirects** | Old path → new path, 301/302. Written into `.htaccess` at build |
| **Messages** (read-only inbox) | Contact submissions: read/unread, reply via mailto, spam flag |
| **Analytics** (read-only) | Page views, top pages, referrers, by day |
| **GitHub cache** (automatic) | Contributions, repos, languages, activity, streaks. Refreshed on a schedule, with a "sync now" button |

Every content model has optional `seo_title`, `seo_description`, and `og_image` overrides, falling back to the auto-generated values.

## 5. SEO checklist

- [ ] Unique `<title>` + meta description per page, rendered into the prebuilt HTML
- [ ] Canonical URLs; `www.` → bare domain and `http` → `https` 301 redirects in `.htaccess`
- [ ] `sitemap.xml` generated at build (with `lastmod`) + `robots.txt`
- [ ] JSON-LD per the table above; Person includes `sameAs` (GitHub, LinkedIn, X…)
- [ ] **Auto OG images:** a branded 1200×630 image generated at build time for every page, project, post and tag (Satori + resvg in CI, so no server load), with page title, type, tags and avatar. Used for `og:image` and `twitter:image`, with an optional override uploaded in the admin panel
- [ ] **RSS:** `/rss.xml` (full blog feed) + `/blog/tag/{tag}/rss.xml`, linked via `<link rel="alternate">`
- [ ] **IndexNow:** key file at the root. After each deploy, CI sends the changed URLs (from the sitemap diff) to IndexNow (Bing, Yandex, Seznam, Naver)
- [ ] Semantic HTML: one `h1` per page, correct heading order, landmarks, alt text
- [ ] Breadcrumbs on detail pages; internal linking between related posts and projects
- [ ] Real 404 status for unknown routes (not a soft 404)
- [ ] Staging subdomain served with `X-Robots-Tag: noindex`
- [ ] Google Search Console + Bing Webmaster verification, sitemap submitted
- [ ] Keyword plan: name → `/` + `/about`; local hiring → `/services` + `/about` ("Laravel/React developer in Kathmandu, Nepal"); technical topics → blog; freelance → `/services` + case studies

## 6. Performance plan

- Particle hero: a **custom canvas/WebGL** script (~5–10 KB), not full Three.js (~150 KB). It loads after the page first displays and after the browser is idle, with a static placeholder first. It's skipped for visitors whose system setting reduces motion and on low-power devices, and pauses when off-screen or when the tab is hidden.
- Each page's code loads only when needed (route-level code splitting); the command palette loads on first Ctrl+K press
- Images: AVIF/WebP with multiple sizes generated when uploaded, explicit width/height, lazy below the fold
- Fonts: system font stack (already), or one self-hosted font file cut down to the characters used, preloaded
- Syntax highlighting done at build time (Shiki), so no highlighter JavaScript ships to the browser
- Scroll animations use CSS and an in-view observer (existing `useInView`). No large animation library
- Lighthouse CI budget fails the build on regressions

## 7. Phases

| # | Phase | Output |
|---|---|---|
| 0 | **Foundation** | Monorepo split, React Router with real paths, prerender pipeline working on mock data, design tokens tidy-up |
| 1 | **Backend** | Laravel + Filament, models above, public API, contact endpoint, analytics, GitHub sync |
| 2 | **Pages** | All pages from the sitemap wired to the API, project/post detail pages, Services, Support, CV download, Ctrl+K |
| 3 | **Showpiece** | Particle hero, scroll/hover animations, heatmap fill-in, number count-ups |
| 4 | **SEO** | Everything in §5 |
| 5 | **CI/CD + staging** | Workflows, staging subdomain (noindex), Lighthouse CI green |
| 6 | **Launch** | Delete the CMS template (files + its DB) → deploy to `public_html` → Search Console/Bing + IndexNow → monitor |

## 8. Open items

All personal content (photo, bio, experience, projects, CV, services/pricing, social handles, email, donation links, crypto addresses) is entered by Harsh through the admin panel after Phase 1; nothing is needed up front. Still to set up:

- Email sending: cPanel mail account (e.g. `noreply@harshchaudhary.com.np`) is the default
- Cloudflare Turnstile keys (free account; entered in Site settings)

## 9. Parked ideas (not in scope unless requested)

Dark mode · `/uses` page (setup & tools) · `/now` page · testimonials on Services · "Open to work" status badge driven from admin · post view counters · reading progress bar.
