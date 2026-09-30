import { NavLink } from 'react-router';
import { BookOpen, FolderGit2, Info, Mail, Rss, Heart, type LucideIcon } from 'lucide-react';
import type { NavCounts } from '@/types';

interface TabConfig {
  to: string;
  label: string;
  icon: LucideIcon;
  count?: keyof NavCounts;
}

const TABS: TabConfig[] = [
  { to: '/', label: 'Overview', icon: BookOpen },
  { to: '/projects', label: 'Projects', icon: FolderGit2, count: 'projects' },
  { to: '/blog', label: 'Blog', icon: Rss, count: 'posts' },
  { to: '/about', label: 'About', icon: Info },
  { to: '/contact', label: 'Contact', icon: Mail },
  { to: '/support', label: 'Support', icon: Heart },
];

export function TabNav({ counts }: { counts?: NavCounts }) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-github-border bg-github-canvas scrollbar-none"
      aria-label="Site navigation"
    >
      {TABS.map((tab) => {
        const badge = tab.count && counts ? counts[tab.count] : undefined;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            prefetch="intent"
            className={({ isActive }) =>
              `group relative flex flex-shrink-0 items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent focus-visible:ring-offset-2 ${
                isActive ? 'text-github-fg' : 'text-github-fg-muted hover:bg-github-subtle'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon className={`h-4 w-4 ${isActive ? 'text-github-fg' : 'text-github-fg-subtle group-hover:text-github-fg-muted'}`} />
                <span>{tab.label}</span>
                {badge !== undefined && (
                  <span
                    className={`min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-xs font-medium ${
                      isActive ? 'bg-github-accent/10 text-github-accent' : 'bg-github-subtle text-github-fg-muted'
                    }`}
                  >
                    {badge}
                  </span>
                )}
                {isActive && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-github-danger" />}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
