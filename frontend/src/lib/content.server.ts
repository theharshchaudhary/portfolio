// Build-time content layer. Route loaders call these while prerendering; results are baked into each
// page's HTML (and `.data` files for client-side navigation). Nothing here ships to the browser.
//
// Source: the Laravel content API (CONTENT_API_URL). CONTENT_SOURCE=fixture reads fixtures/content.json
// instead (CI and offline work). There is deliberately no automatic fallback, so a production build can
// never silently publish fixture content.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Post, Project, SearchEntry, SiteContent, SiteData } from '@/types';
import { renderMarkdown } from './markdown.server';

const API_URL = process.env.CONTENT_API_URL ?? 'http://localhost:8000/api/v1/content';
const USE_FIXTURE = process.env.CONTENT_SOURCE === 'fixture';
// One fetch per build; in dev, refetch every couple of seconds so admin edits show on refresh.
const TTL_MS = process.env.NODE_ENV === 'production' ? Infinity : 2000;

let cache: { at: number; data: Promise<SiteContent> } | null = null;

async function load(): Promise<SiteContent> {
  if (USE_FIXTURE) {
    return JSON.parse(await readFile(resolve(process.cwd(), 'fixtures/content.json'), 'utf8'));
  }
  const res = await fetch(API_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Content API ${API_URL} responded ${res.status}`);
  return res.json();
}

export function getContent(): Promise<SiteContent> {
  if (!cache || Date.now() - cache.at > TTL_MS) {
    const data = load();
    cache = { at: Date.now(), data };
    data.catch(() => (cache = null));
  }
  return cache.data;
}

export async function getSite(): Promise<SiteData> {
  const c = await getContent();
  const search: SearchEntry[] = [
    ...c.nav.map((n) => ({ type: 'page' as const, title: n.label, path: n.path })),
    ...c.projects.map((p) => ({ type: 'project' as const, title: p.title, path: `/projects/${p.slug}`, hint: p.summary })),
    ...c.posts.map((p) => ({ type: 'post' as const, title: p.title, path: `/blog/${p.slug}`, hint: p.excerpt })),
  ];
  return {
    settings: c.settings,
    profile: c.profile,
    socials: c.socials,
    nav: c.nav,
    languages: c.github?.languages ?? [],
    search,
    builtAt: c.generatedAt,
  };
}

export async function getPage(key: string) {
  const c = await getContent();
  return c.pages[key] ?? { heading: null, intro: null, seo: { title: null, description: null, ogImage: null } };
}

/** Lists don't need markdown bodies; stripping them keeps the per-page data small. */
const projectCard = ({ body: _body, ...p }: Project) => p;
const postCard = ({ body: _body, ...p }: Post) => p;

export async function getHome() {
  const c = await getContent();
  const pinned = c.projects.filter((p) => p.pinned);
  return {
    page: await getPage('home'),
    github: c.github,
    pinned: (pinned.length ? pinned : c.projects).slice(0, 6).map(projectCard),
    latestPosts: c.posts.slice(0, 3).map(postCard),
  };
}

export async function getProjects() {
  const c = await getContent();
  return { page: await getPage('projects'), projects: c.projects.map(projectCard) };
}

export async function getProject(slug: string) {
  const c = await getContent();
  const project = c.projects.find((p) => p.slug === slug);
  if (!project) return null;
  const related = c.projects
    .filter((p) => p.slug !== slug)
    .map((p) => ({ p, score: p.tech.filter((t) => project.tech.includes(t)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ p }) => projectCard(p));
  return {
    project: projectCard(project),
    body: await renderMarkdown(project.body),
    testimonials: c.testimonials.filter((t) => t.project?.slug === slug),
    related,
  };
}

export async function getPosts() {
  const c = await getContent();
  return { page: await getPage('blog'), posts: c.posts.map(postCard), tags: c.tags };
}

export async function getPost(slug: string) {
  const c = await getContent();
  const index = c.posts.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const post = c.posts[index];
  const tagSlugs = post.tags.map((t) => t.slug);
  const related = c.posts
    .filter((p) => p.slug !== slug && p.tags.some((t) => tagSlugs.includes(t.slug)))
    .slice(0, 3)
    .map(postCard);
  return {
    post: postCard(post),
    body: await renderMarkdown(post.body),
    newer: index > 0 ? postCard(c.posts[index - 1]) : null,
    older: index < c.posts.length - 1 ? postCard(c.posts[index + 1]) : null,
    related,
  };
}

export async function getTag(slug: string) {
  const c = await getContent();
  const tag = c.tags.find((t) => t.slug === slug);
  if (!tag) return null;
  return { tag, posts: c.posts.filter((p) => p.tags.some((t) => t.slug === slug)).map(postCard) };
}

export async function getAbout() {
  const c = await getContent();
  return {
    page: await getPage('about'),
    bio: await renderMarkdown(c.profile.longBio),
    experiences: c.experiences,
    skills: c.skills,
    stats: {
      projects: c.projects.length,
      stars: c.projects.reduce((sum, p) => sum + p.stars, 0),
      contributions: c.github?.streak.total ?? null,
    },
  };
}

export async function getServices() {
  const c = await getContent();
  return {
    page: await getPage('services'),
    services: await Promise.all(
      c.services.map(async (s) => ({ ...s, description: (await renderMarkdown(s.description)).html })),
    ),
    faqs: c.faqs.filter((f) => f.page === 'services'),
    testimonials: c.testimonials,
  };
}

export async function getContact() {
  const c = await getContent();
  return {
    page: await getPage('contact'),
    email: c.settings.contactEmail,
    socials: c.socials.filter((s) => s.showOnContact),
    turnstileSiteKey: c.settings.turnstileSiteKey,
    faqs: c.faqs.filter((f) => f.page === 'contact'),
  };
}

export async function getSupport() {
  const c = await getContent();
  return {
    page: await getPage('support'),
    methods: c.support,
    faqs: c.faqs.filter((f) => f.page === 'support'),
  };
}

/** Dynamic URLs that `getStaticPaths()` can't discover on its own. */
export async function getPrerenderPaths(): Promise<string[]> {
  const c = await getContent();
  return [
    '/404',
    ...c.projects.map((p) => `/projects/${p.slug}`),
    ...c.posts.map((p) => `/blog/${p.slug}`),
    ...c.tags.map((t) => `/blog/tag/${t.slug}`),
  ];
}
