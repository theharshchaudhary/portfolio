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

export interface Note {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
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

export interface Release {
  id: string;
  project: string;
  version: string;
  tag: string;
  notes: string;
  publishedAt: string;
  isLatest: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  content: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  icon: string;
}

export interface SponsorTier {
  name: string;
  amount: string;
  benefits: string[];
  url: string;
}
