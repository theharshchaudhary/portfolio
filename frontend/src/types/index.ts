export type BadgeType = 'Free' | 'Open Source' | 'Paid/SaaS' | 'CLI' | 'Library';

export type LanguageKey =
  | 'TypeScript'
  | 'JavaScript'
  | 'Python'
  | 'Rust'
  | 'Go'
  | 'PHP'
  | 'Dart'
  | 'Shell'
  | 'HTML'
  | 'CSS';

export interface LanguageStat {
  name: LanguageKey;
  percentage: number;
  color: string;
}

export interface Profile {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  location: string;
  company: string;
  website: string;
  twitter: string;
  github: string;
  linkedin: string;
  email: string;
  followers: number;
  following: number;
  status: {
    emoji: string;
    message: string;
  };
  joinedDate: string;
  languages: LanguageStat[];
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
  bestDay: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  language: LanguageKey;
  languageColor: string;
  stars: number;
  forks: number;
  badges: BadgeType[];
  liveDemoUrl?: string;
  docsUrl?: string;
  repoUrl: string;
  releaseVersion?: string;
  updatedAt: string;
  pinned: boolean;
}

export type ActivityType =
  | 'pr_merged'
  | 'release'
  | 'note_published'
  | 'package_update'
  | 'star'
  | 'commit';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  repo?: string;
  url?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  content: string;
}

export interface SponsorTier {
  name: string;
  amount: string;
  benefits: string[];
  url: string;
}

export interface SiteSettings {
  siteName: string;
  url: string;
  /** `%s` is replaced by the page title. */
  titleTemplate: string;
  defaultTitle: string;
  description: string;
  defaultOgImage?: string;
  footerText: string;
}

export interface NavCounts {
  projects: number;
  posts: number;
}

/** Site-wide data loaded once by the root route and shared by every page. */
export interface SiteData {
  settings: SiteSettings;
  profile: Profile;
  counts: NavCounts;
  /** Build timestamp; used as "now" so relative times match between prerender and hydration. */
  builtAt: string;
}
