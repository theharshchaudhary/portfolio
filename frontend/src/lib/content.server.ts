// Build-time content layer. Route loaders call these while prerendering, and the results are baked
// into each page's HTML (and `.data` files for client-side navigation). Nothing here ships to the browser.
// Phase 1 swaps the mock source for the Laravel API; the function signatures stay the same.
import type { BlogPost, Project, SiteData } from '@/types';
import {
  mockActivities,
  mockBlogPosts,
  mockContributionData,
  mockProfile,
  mockProjects,
  mockSponsorTiers,
  mockStreakStats,
} from './mock-data';

const SITE_URL = (process.env.SITE_URL ?? 'https://harshchaudhary.com.np').replace(/\/$/, '');
const builtAt = new Date().toISOString();

export async function getSite(): Promise<SiteData> {
  return {
    settings: {
      siteName: mockProfile.name,
      url: SITE_URL,
      titleTemplate: `%s · ${mockProfile.name}`,
      defaultTitle: `${mockProfile.name} — Full-stack Developer in Kathmandu, Nepal`,
      description: mockProfile.bio,
      footerText: `© ${new Date(builtAt).getUTCFullYear()} ${mockProfile.name}`,
    },
    profile: mockProfile,
    counts: { projects: mockProjects.length, posts: mockBlogPosts.length },
    builtAt,
  };
}

export async function getHome() {
  return {
    contributions: mockContributionData,
    streak: mockStreakStats,
    activities: mockActivities.slice(0, 6),
    pinned: mockProjects.filter((p) => p.pinned),
  };
}

export async function getProjects(): Promise<Project[]> {
  return mockProjects;
}

export async function getPosts(): Promise<BlogPost[]> {
  return [...mockBlogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  return mockBlogPosts.find((p) => p.slug === slug);
}

export async function getSupport() {
  return { tiers: mockSponsorTiers };
}

/** Dynamic URLs that `getStaticPaths()` can't discover on its own. */
export async function getPrerenderPaths(): Promise<string[]> {
  const posts = await getPosts();
  return ['/404', ...posts.map((p) => `/blog/${p.slug}`)];
}
