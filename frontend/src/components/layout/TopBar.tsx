import { Link } from 'react-router';
import { Search } from 'lucide-react';

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-github-border bg-github-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-github items-center gap-4 px-4 py-2.5">
        <Link
          to="/"
          aria-label="Home"
          className="flex items-center gap-2 text-github-fg focus:outline-none focus:ring-2 focus:ring-github-accent rounded"
        >
          <svg viewBox="0 0 16 16" className="h-6 w-6 fill-current" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span className="hidden text-sm font-medium text-github-fg-muted sm:inline">
            harshchaudhary.com.np
          </span>
        </Link>

        <div className="relative hidden flex-1 max-w-xs sm:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-github-fg-subtle" />
          <input
            type="text"
            placeholder="Type / to search"
            aria-label="Search"
            className="w-full rounded-md border border-github-border bg-github-subtle py-1 pl-8 pr-3 text-sm text-github-fg placeholder:text-github-fg-subtle focus:border-github-accent focus:bg-github-canvas focus:outline-none focus:ring-1 focus:ring-github-accent"
          />
        </div>

      </div>
    </header>
  );
}
