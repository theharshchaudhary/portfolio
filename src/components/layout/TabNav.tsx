import {
  BookOpen,
  FolderGit2,
  FileText,
  Info,
  Mail,
  Rss,
  Tag,
  BookMarked,
  Heart,
  type LucideIcon,
} from 'lucide-react';

export interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  group: 'primary' | 'secondary';
}

export const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: BookOpen, group: 'primary' },
  { id: 'projects', label: 'Projects', icon: FolderGit2, badge: 6, group: 'primary' },
  { id: 'notes', label: 'Notes', icon: FileText, badge: 5, group: 'primary' },
  { id: 'about', label: 'About', icon: Info, group: 'primary' },
  { id: 'contact', label: 'Contact', icon: Mail, group: 'primary' },
  { id: 'blog', label: 'Blog', icon: Rss, badge: 3, group: 'secondary' },
  { id: 'releases', label: 'Releases', icon: Tag, badge: 5, group: 'secondary' },
  { id: 'resources', label: 'Resources', icon: BookMarked, group: 'secondary' },
  { id: 'support', label: 'Support / Sponsor', icon: Heart, group: 'secondary' },
];

interface TabNavProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export function TabNav({ activeRoute, onNavigate }: TabNavProps) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-github-border bg-github-canvas scrollbar-none"
      aria-label="Profile navigation"
    >
      {TABS.map((tab) => {
        const isActive = activeRoute === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`group relative flex flex-shrink-0 items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent focus-visible:ring-offset-2 ${
              isActive
                ? 'text-github-fg'
                : 'text-github-fg-muted hover:bg-github-subtle'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <tab.icon className={`h-4 w-4 ${isActive ? 'text-github-fg' : 'text-github-fg-subtle group-hover:text-github-fg-muted'}`} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-xs font-medium ${
                  isActive
                    ? 'bg-github-accent/10 text-github-accent'
                    : 'bg-github-subtle text-github-fg-muted'
                }`}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-github-danger" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
