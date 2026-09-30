// Mirrors the Laravel content API (backend/app/Services/ContentExporter.php).

export interface Seo {
  title: string | null;
  description: string | null;
  ogImage: string | null;
}

export interface HeroSettings {
  particleText?: string;
  mode?: 'text' | 'avatar';
  introLines?: string[];
  ctas?: { label: string; href: string; style: 'primary' | 'secondary' }[];
}

export interface SiteSettings {
  siteName: string;
  tagline: string | null;
  url: string;
  /** `%s` is replaced by the page title. */
  titleTemplate: string;
  defaultTitle: string;
  description: string;
  defaultOgImage: string | null;
  footerText: string;
  contactEmail: string | null;
  githubUsername: string | null;
  turnstileSiteKey: string | null;
  indexNowKey: string | null;
  analyticsEnabled: boolean;
  hero: HeroSettings;
}

export interface Profile {
  name: string;
  username: string | null;
  headline: string | null;
  shortBio: string | null;
  longBio: string | null;
  avatar: string | null;
  location: string | null;
  company: string | null;
  status: { emoji: string | null; message: string } | null;
  openToWork: boolean;
  cvUrl: string | null;
  joinedAt: string | null;
  followers: number | null;
  following: number | null;
}

export interface SocialLink {
  platform: string;
  label: string;
  handle: string | null;
  url: string;
  showInSidebar: boolean;
  showInFooter: boolean;
  showOnContact: boolean;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string | null;
  badge: number | null;
}

export interface PageContent {
  heading: string | null;
  intro: string | null;
  seo: Seo;
}

export interface Redirect {
  from: string;
  to: string;
  status: number;
}

export interface Experience {
  type: 'work' | 'education';
  title: string;
  organization: string;
  organizationUrl: string | null;
  logo: string | null;
  location: string | null;
  startedAt: string;
  endedAt: string | null;
  description: string | null;
}

export interface Skill {
  name: string;
  category: string | null;
  icon: string | null;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  summary: string;
  /** Markdown source. */
  body: string | null;
  coverImage: string | null;
  gallery: string[];
  tech: string[];
  badges: string[];
  language: string | null;
  languageColor: string | null;
  liveUrl: string | null;
  docsUrl: string | null;
  repoUrl: string | null;
  stars: number;
  forks: number;
  releaseVersion: string | null;
  pinned: boolean;
  startedAt: string | null;
  updatedAt: string;
  seo: Seo;
}

export interface TagRef {
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown source. */
  body: string;
  coverImage: string | null;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  tags: TagRef[];
  seo: Seo;
}

export interface Tag extends TagRef {
  description: string | null;
  count: number;
}

export interface Service {
  slug: string;
  title: string;
  icon: string | null;
  summary: string;
  description: string | null;
  deliverables: string[];
  price: { amount: number; currency: string; prefix: string | null; unit: string | null } | null;
}

export interface Faq {
  page: 'services' | 'contact' | 'support';
  question: string;
  answer: string;
}

export interface Testimonial {
  name: string;
  role: string | null;
  company: string | null;
  photo: string | null;
  quote: string;
  project: { slug: string; title: string } | null;
}

export interface SupportMethod {
  type: 'github_sponsors' | 'kofi' | 'buymeacoffee' | 'paypal' | 'crypto' | 'other';
  label: string;
  description: string | null;
  url: string | null;
  crypto: { coin: string; network: string; address: string; qrSvg: string } | null;
}

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  date: string;
  count: number;
  level: ContributionLevel;
}

export interface StreakStats {
  current: number;
  longest: number;
  total: number;
  bestDay: string | null;
}

export interface LanguageStat {
  name: string;
  percentage: number;
  color: string;
}

export type ActivityType = 'pr_merged' | 'release' | 'star' | 'commit';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  repo: string | null;
  url: string | null;
}

export interface GithubData {
  contributions: ContributionDay[];
  streak: StreakStats;
  languages: LanguageStat[];
  activity: Activity[];
  fetchedAt: string | null;
}

/** The full document returned by GET /api/v1/content. */
export interface SiteContent {
  generatedAt: string;
  settings: SiteSettings;
  profile: Profile;
  socials: SocialLink[];
  nav: NavItem[];
  pages: Record<string, PageContent>;
  redirects: Redirect[];
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  posts: Post[];
  tags: Tag[];
  services: Service[];
  faqs: Faq[];
  testimonials: Testimonial[];
  support: SupportMethod[];
  github: GithubData | null;
}

/** Entry in the Ctrl+K command palette index. */
export interface SearchEntry {
  type: 'page' | 'project' | 'post';
  title: string;
  path: string;
  hint?: string;
}

/** Site-wide data loaded once by the root route and shared by every page. */
export interface SiteData {
  settings: SiteSettings;
  profile: Profile;
  socials: SocialLink[];
  nav: NavItem[];
  languages: LanguageStat[];
  search: SearchEntry[];
  /** Content timestamp; used as "now" so relative times match between prerender and hydration. */
  builtAt: string;
}

/** Markdown rendered to HTML at build time, with its table of contents. */
export interface RenderedMarkdown {
  html: string;
  toc: { id: string; text: string; depth: number }[];
}
