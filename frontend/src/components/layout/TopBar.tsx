import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import type { SiteData } from '@/types';
import { Avatar } from '@/components/Avatar';

// Loaded on first open, so the palette costs nothing on initial page load.
const CommandPalette = lazy(() => import('@/components/CommandPalette'));

export function TopBar({ site }: { site: SiteData | undefined }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const host = site ? new URL(site.settings.url).host : '';

  return (
    <header className="sticky top-0 z-50 border-b border-github-border bg-github-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-github items-center gap-4 px-4 py-2.5">
        <Link
          to="/"
          className="flex items-center gap-2 rounded text-github-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent"
        >
          {site ? <Avatar name={site.profile.name} src={site.profile.avatar} size={28} /> : <span className="h-7 w-7" />}
          <span className="hidden text-sm font-medium text-github-fg-muted sm:inline">{host}</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group ml-auto flex h-8 w-full max-w-[18rem] items-center gap-2 rounded-md border border-github-border bg-github-subtle px-2.5 text-sm text-github-fg-subtle transition-colors hover:border-github-fg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent sm:ml-0"
          aria-haspopup="dialog"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">
            Type <kbd className="rounded border border-github-border bg-github-canvas px-1 text-xxs">/</kbd> to search
          </span>
          <kbd className="hidden rounded border border-github-border bg-github-canvas px-1.5 text-xxs sm:inline">Ctrl K</kbd>
        </button>
      </div>

      {open && site && (
        <Suspense fallback={null}>
          <CommandPalette entries={site.search} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </header>
  );
}
