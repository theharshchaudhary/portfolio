import type {
  Profile,
  Project,
  ContributionDay,
  Note,
  Activity,
  Release,
  BlogPost,
  Resource,
  SponsorTier,
  StreakStats,
} from '@/types';

export const mockProfile: Profile = {
  name: 'Harsh Chaudhary',
  username: 'theharshchaudhary',
  bio: 'Full-stack developer building products and tools for the web. Open-source contributor, Laravel enthusiast, and React craftsman.',
  avatarUrl: '',
  location: 'Kathmandu, Nepal',
  company: '@theharshchaudhary',
  website: 'https://harshchaudhary.com.np',
  twitter: 'theharshchaudhary',
  github: 'theharshchaudhary',
  linkedin: 'theharshchaudhary',
  email: 'harsh@harshchaudhary.com.np',
  followers: 248,
  following: 73,
  status: {
    emoji: '🚀',
    message: 'Building something new',
  },
  joinedDate: '2020-03-15',
  languages: [
    { name: 'TypeScript', percentage: 42, color: '#3178c6' },
    { name: 'PHP', percentage: 24, color: '#4F5D95' },
    { name: 'Python', percentage: 15, color: '#3572A5' },
    { name: 'Go', percentage: 8, color: '#00ADD8' },
    { name: 'Rust', percentage: 6, color: '#dea584' },
    { name: 'Shell', percentage: 5, color: '#89e051' },
  ],
};

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'lensify',
    description: 'AI-powered image optimization pipeline for web apps. Automatically converts, compresses, and serves responsive images with srcset generation.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 1247,
    forks: 89,
    badges: ['Open Source', 'CLI', 'Library'],
    liveDemoUrl: 'https://lensify.dev',
    docsUrl: 'https://docs.lensify.dev',
    repoUrl: 'https://github.com/theharshchaudhary/lensify',
    releaseVersion: 'v2.4.1',
    updatedAt: '2026-09-28',
    pinned: true,
  },
  {
    id: '2',
    name: 'pulse-db',
    description: 'Real-time database monitoring dashboard for Laravel applications. Query analysis, slow-log detection, and N+1 alerts in one clean interface.',
    language: 'PHP',
    languageColor: '#4F5D95',
    stars: 892,
    forks: 56,
    badges: ['Open Source', 'Paid/SaaS'],
    liveDemoUrl: 'https://pulsedb.io',
    docsUrl: 'https://docs.pulsedb.io',
    repoUrl: 'https://github.com/theharshchaudhary/pulse-db',
    releaseVersion: 'v1.8.0',
    updatedAt: '2026-09-20',
    pinned: true,
  },
  {
    id: '3',
    name: 'shipkit',
    description: 'Zero-config deployment CLI for static sites and SPAs. Push to deploy with built-in edge caching, preview branches, and instant rollbacks.',
    language: 'Go',
    languageColor: '#00ADD8',
    stars: 534,
    forks: 32,
    badges: ['Open Source', 'CLI'],
    repoUrl: 'https://github.com/theharshchaudhary/shipkit',
    releaseVersion: 'v0.9.3',
    updatedAt: '2026-09-25',
    pinned: true,
  },
  {
    id: '4',
    name: 'react-flow-table',
    description: 'Headless, performant data table component for React. Virtualized rows, column pinning, sorting, and filtering with full keyboard navigation.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 318,
    forks: 21,
    badges: ['Free', 'Library', 'Open Source'],
    liveDemoUrl: 'https://react-flow-table.vercel.app',
    docsUrl: 'https://rft.dev/docs',
    repoUrl: 'https://github.com/theharshchaudhary/react-flow-table',
    releaseVersion: 'v1.2.0',
    updatedAt: '2026-09-22',
    pinned: true,
  },
  {
    id: '5',
    name: 'forge-rs',
    description: 'Minimal, fast HTTP framework for Rust with middleware support, type-safe routing, and built-in OpenAPI documentation generation.',
    language: 'Rust',
    languageColor: '#dea584',
    stars: 412,
    forks: 28,
    badges: ['Open Source', 'Free'],
    repoUrl: 'https://github.com/theharshchaudhary/forge-rs',
    releaseVersion: 'v0.3.0',
    updatedAt: '2026-09-15',
    pinned: false,
  },
  {
    id: '6',
    name: 'devbox-saas',
    description: 'Cloud development environments in your browser. Pre-configured runtimes, live collaboration, and zero local setup. Currently in private beta.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 203,
    forks: 12,
    badges: ['Paid/SaaS'],
    liveDemoUrl: 'https://devbox.app',
    repoUrl: 'https://github.com/theharshchaudhary/devbox-saas',
    releaseVersion: 'v0.1.0-beta',
    updatedAt: '2026-09-30',
    pinned: false,
  },
];

export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Why I stopped using Redux for everything',
    summary: 'After three years of reaching for Redux on every React project, I switched to a simpler approach. Here is what changed and what I learned.',
    content: 'Redux was the default state management library for years, but the React ecosystem has evolved. With the Context API, useReducer, and tools like Zustand, most apps do not need the ceremony Redux brings...',
    tags: ['React', 'State Management', 'Architecture'],
    publishedAt: '2026-09-28',
    readingTime: 7,
  },
  {
    id: '2',
    title: 'Building a contribution heatmap from scratch with SVG',
    summary: 'A deep dive into how the contribution graph on this site was built — date math, responsive grids, and tooltip positioning without any external library.',
    content: 'The GitHub contribution graph is one of the most iconic visualizations in developer culture. Here is how I rebuilt it as a pure React + SVG component...',
    tags: ['SVG', 'React', 'Frontend'],
    publishedAt: '2026-09-22',
    readingTime: 12,
  },
  {
    id: '3',
    title: 'Laravel Pulse: profiling slow queries in production',
    summary: 'How I built a real-time monitoring layer for Laravel apps that surfaces N+1 queries and slow endpoints without adding overhead to request handling.',
    content: 'Production profiling is hard. You cannot run Blackfire on every request, and log-based analysis is reactive. Pulse-DB was born out of the need to catch performance regressions as they happen...',
    tags: ['Laravel', 'PHP', 'Performance'],
    publishedAt: '2026-09-14',
    readingTime: 9,
  },
  {
    id: '4',
    title: 'Type-safe routing without a framework',
    summary: 'A pattern for building type-safe client-side routing in React using only the platform APIs — no react-router, no framework, just the URL and TypeScript.',
    content: 'Most React apps reach for react-router or a framework like Next.js. But sometimes you want full control over the routing layer. Here is a pattern I use for lightweight apps...',
    tags: ['TypeScript', 'Routing', 'React'],
    publishedAt: '2026-09-05',
    readingTime: 5,
  },
  {
    id: '5',
    title: 'Shipping a Rust web framework: lessons from forge-rs',
    summary: 'What I learned building a production HTTP framework in Rust — async lifetimes, middleware ergonomics, and why documentation matters more than features.',
    content: 'Building a web framework in Rust teaches you humility. The type system is powerful but unforgiving, and async lifetimes will humble you. Here are the key lessons from six months of forge-rs...',
    tags: ['Rust', 'Web', 'Open Source'],
    publishedAt: '2026-08-28',
    readingTime: 11,
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'pr_merged',
    title: 'Merged PR #142: Add virtualized row rendering to react-flow-table',
    description: 'Implemented windowed rendering for tables with 10k+ rows. Reduces DOM nodes by 95% and keeps scroll at 60fps.',
    timestamp: '2026-09-30T10:30:00Z',
    repo: 'theharshchaudhary/react-flow-table',
    url: 'https://github.com/theharshchaudhary/react-flow-table/pull/142',
  },
  {
    id: '2',
    type: 'release',
    title: 'Released lensify v2.4.1',
    description: 'Patch release fixing AVIF output on Safari 18 and adding support for animated WebP.',
    timestamp: '2026-09-28T14:00:00Z',
    repo: 'theharshchaudhary/lensify',
    url: 'https://github.com/theharshchaudhary/lensify/releases/tag/v2.4.1',
  },
  {
    id: '3',
    type: 'note_published',
    title: 'Published a new note: "Why I stopped using Redux for everything"',
    description: 'Reflections on state management after three years of defaulting to Redux.',
    timestamp: '2026-09-28T09:15:00Z',
    url: '#/notes',
  },
  {
    id: '4',
    type: 'package_update',
    title: 'Published @theharshchaudhary/shipkit v0.9.3 on npm',
    description: 'Added support for Cloudflare Pages deploy targets and fixed environment variable injection.',
    timestamp: '2026-09-25T16:45:00Z',
    repo: 'theharshchaudhary/shipkit',
    url: 'https://www.npmjs.com/package/shipkit',
  },
  {
    id: '5',
    type: 'commit',
    title: 'Pushed 3 commits to pulse-db',
    description: 'Refactored query profiler middleware and added integration tests for MySQL 8.4 support.',
    timestamp: '2026-09-24T11:20:00Z',
    repo: 'theharshchaudhary/pulse-db',
  },
  {
    id: '6',
    type: 'star',
    title: 'Starred vercel/next.js',
    description: 'Keep an eye on the App Router evolution.',
    timestamp: '2026-09-23T08:00:00Z',
    url: 'https://github.com/vercel/next.js',
  },
  {
    id: '7',
    type: 'release',
    title: 'Released react-flow-table v1.2.0',
    description: 'Major release with column pinning, drag-to-reorder, and full keyboard navigation support.',
    timestamp: '2026-09-22T13:30:00Z',
    repo: 'theharshchaudhary/react-flow-table',
    url: 'https://github.com/theharshchaudhary/react-flow-table/releases/tag/v1.2.0',
  },
  {
    id: '8',
    type: 'pr_merged',
    title: 'Merged PR #87: Add OpenAPI generation to forge-rs',
    description: 'Automatic spec generation from route definitions with macro-derived schemas.',
    timestamp: '2026-09-20T15:10:00Z',
    repo: 'theharshchaudhary/forge-rs',
    url: 'https://github.com/theharshchaudhary/forge-rs/pull/87',
  },
];

export const mockReleases: Release[] = [
  {
    id: '1',
    project: 'lensify',
    version: 'v2.4.1',
    tag: 'latest',
    notes: 'Patch release: Fixed AVIF output on Safari 18, added animated WebP support, improved memory usage by 30% on large batches.',
    publishedAt: '2026-09-28',
    isLatest: true,
  },
  {
    id: '2',
    project: 'react-flow-table',
    version: 'v1.2.0',
    tag: 'latest',
    notes: 'Column pinning, drag-to-reorder, keyboard navigation, and a new virtualized renderer for large datasets.',
    publishedAt: '2026-09-22',
    isLatest: true,
  },
  {
    id: '3',
    project: 'pulse-db',
    version: 'v1.8.0',
    tag: 'latest',
    notes: 'MySQL 8.4 support, redesigned slow query panel, and configurable alert thresholds.',
    publishedAt: '2026-09-20',
    isLatest: true,
  },
  {
    id: '4',
    project: 'shipkit',
    version: 'v0.9.3',
    tag: 'latest',
    notes: 'Cloudflare Pages deploy target, fixed env var injection for preview branches.',
    publishedAt: '2026-09-25',
    isLatest: true,
  },
  {
    id: '5',
    project: 'forge-rs',
    version: 'v0.3.0',
    tag: 'latest',
    notes: 'OpenAPI spec generation, middleware improvements, and async streaming responses.',
    publishedAt: '2026-09-15',
    isLatest: true,
  },
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The architecture of a developer portfolio that scales',
    excerpt: 'How I structured my personal site as a type-safe, data-driven application that can swap mock data for a real API without touching components.',
    publishedAt: '2026-09-26',
    readingTime: 8,
    tags: ['Architecture', 'TypeScript', 'DX'],
    content: 'When building a personal site, the temptation is to hardcode everything...',
  },
  {
    id: '2',
    title: 'Designing for the Primer aesthetic without copying GitHub',
    excerpt: 'Borrowing visual language from GitHub is fine — but you need to make it your own. Here is the design system behind this site.',
    publishedAt: '2026-09-18',
    readingTime: 6,
    tags: ['Design', 'CSS', 'Tailwind'],
    content: 'GitHub Light is one of the most refined design systems in developer tooling...',
  },
  {
    id: '3',
    title: 'From mock data to Laravel API: a migration story',
    excerpt: 'The data layer on this site was designed to be swappable. This post walks through replacing the mock services with a real Laravel backend.',
    publishedAt: '2026-09-10',
    readingTime: 10,
    tags: ['Laravel', 'API', 'Migration'],
    content: 'The key to a clean migration is a well-typed service layer...',
  },
];

export const mockResources: Resource[] = [
  {
    id: '1',
    title: 'React + TypeScript Starter Kit',
    description: 'A production-ready starter with Vite, Tailwind, testing, and CI pre-configured.',
    category: 'Templates',
    url: 'https://github.com/theharshchaudhary/react-ts-starter',
    icon: 'BookMarked',
  },
  {
    id: '2',
    title: 'Laravel API Scaffolding Generator',
    description: 'CLI tool that generates controllers, requests, resources, and tests from a schema definition.',
    category: 'Tools',
    url: 'https://github.com/theharshchaudhary/laravel-scaffold',
    icon: 'Terminal',
  },
  {
    id: '3',
    title: 'Type-Safe Fetch Wrapper',
    description: 'A tiny wrapper around fetch with automatic retry, type inference, and error normalization.',
    category: 'Libraries',
    url: 'https://github.com/theharshchaudhary/safe-fetch',
    icon: 'Package',
  },
  {
    id: '4',
    title: 'VSCode Setup for Full-Stack Dev',
    description: 'My extensions, snippets, and settings — exported as a dotfiles repo for quick setup.',
    category: 'Configs',
    url: 'https://github.com/theharshchaudhary/dotfiles',
    icon: 'Settings',
  },
  {
    id: '5',
    title: 'Deploy Checklist for SPAs',
    description: 'A comprehensive checklist for deploying single-page apps to production.',
    category: 'Guides',
    url: '#/resources',
    icon: 'ListChecks',
  },
  {
    id: '6',
    title: 'Open Source Maintainer Guide',
    description: 'Templates for issues, PRs, contributing guides, and release notes that I use across my projects.',
    category: 'Guides',
    url: '#/resources',
    icon: 'GitPullRequest',
  },
];

export const mockSponsorTiers: SponsorTier[] = [
  {
    name: 'Supporter',
    amount: '$5/month',
    benefits: [
      'Name in the supporters list',
      'Access to supporter-only notes',
      'Early access to open-source releases',
    ],
    url: 'https://github.com/sponsors/theharshchaudhary',
  },
  {
    name: 'Backer',
    amount: '$15/month',
    benefits: [
      'Everything in Supporter',
      'Priority issue triage on my open-source projects',
      'Monthly behind-the-scenes update',
      'Discord supporter role',
    ],
    url: 'https://github.com/sponsors/theharshchaudhary',
  },
  {
    name: 'Sponsor',
    amount: '$50/month',
    benefits: [
      'Everything in Backer',
      '1:1 office hours — 30 min/month',
      'Feature request prioritization',
      'Logo on project READMEs',
    ],
    url: 'https://github.com/sponsors/theharshchaudhary',
  },
];

function generateContributionData(): ContributionDay[] {
  const days: ContributionDay[] = [];
  const today = new Date('2026-09-30');
  const start = new Date(today);
  const dayOfWeek = start.getDay();
  start.setDate(start.getDate() - 364 - dayOfWeek);

  for (let i = 0; i < 365; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    const dayOfMonth = date.getDate();
    const month = date.getMonth();
    const dow = date.getDay();

    let level: ContributionDay['level'] = 0;
    const rand = Math.sin(i * 12.9898 + month * 78.233) * 43758.5453;
    const frac = rand - Math.floor(rand);

    if (dow === 0 || dow === 6) {
      level = frac < 0.6 ? 0 : frac < 0.85 ? 1 : 2;
    } else if (month >= 5 && month <= 8) {
      if (frac < 0.15) level = 0;
      else if (frac < 0.35) level = 1;
      else if (frac < 0.65) level = 2;
      else if (frac < 0.85) level = 3;
      else level = 4;
    } else {
      if (frac < 0.35) level = 0;
      else if (frac < 0.6) level = 1;
      else if (frac < 0.8) level = 2;
      else if (frac < 0.92) level = 3;
      else level = 4;
    }

    if (dayOfMonth <= 3 && frac > 0.5) level = 0;
    if (i > 350 && frac > 0.4) level = Math.max(level, 2) as ContributionDay['level'];

    const count = level === 0 ? 0 : level * 3 + Math.floor(frac * 4);
    days.push({
      date: date.toISOString().split('T')[0],
      count,
      level,
    });
  }

  return days;
}

export const mockContributionData: ContributionDay[] = generateContributionData();

export const mockStreakStats: StreakStats = {
  current: 23,
  longest: 47,
  total: mockContributionData.reduce((sum, d) => sum + d.count, 0),
  bestDay: '2026-07-22',
};
