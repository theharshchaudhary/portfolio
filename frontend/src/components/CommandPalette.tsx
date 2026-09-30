import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { CornerDownLeft, FileText, FolderGit2, Hash, Search } from 'lucide-react';
import type { SearchEntry } from '@/types';

const TYPE_ICON = { page: Hash, project: FolderGit2, post: FileText } as const;
const TYPE_LABEL = { page: 'Pages', project: 'Projects', post: 'Blog posts' } as const;

function score(entry: SearchEntry, query: string): number {
  const title = entry.title.toLowerCase();
  if (!query) return 1;
  if (title.startsWith(query)) return 3;
  if (title.includes(query)) return 2;
  return entry.hint?.toLowerCase().includes(query) ? 1 : 0;
}

export default function CommandPalette({ entries, onClose }: { entries: SearchEntry[]; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .map((entry) => ({ entry, s: score(entry, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((r) => r.entry);
  }, [entries, query]);

  useEffect(() => {
    inputRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (entry: SearchEntry | undefined) => {
    if (!entry) return;
    onClose();
    navigate(entry.path);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-github-fg/30 p-4 pt-[12vh] backdrop-blur-[2px] animate-fade-in" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
        className="w-full max-w-xl overflow-hidden rounded-xl border border-github-border bg-github-canvas shadow-github-lg animate-slide-up"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-github-border px-4">
          <Search className="h-4 w-4 text-github-fg-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, projects and posts…"
            className="h-12 flex-1 bg-transparent text-sm text-github-fg placeholder:text-github-fg-subtle focus:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `palette-${active}` : undefined}
          />
          <kbd className="rounded border border-github-border bg-github-subtle px-1.5 py-0.5 text-xxs text-github-fg-muted">Esc</kbd>
        </div>
        <ul id="palette-results" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-github-fg-muted">No results for “{query}”</li>}
          {results.map((entry, i) => {
            const TypeIcon = TYPE_ICON[entry.type];
            const showHeader = i === 0 || results[i - 1].type !== entry.type;
            return (
              <li key={entry.path} role="presentation">
                {showHeader && (
                  <p className="px-3 pb-1 pt-2 text-xxs font-semibold uppercase tracking-wide text-github-fg-subtle">{TYPE_LABEL[entry.type]}</p>
                )}
                <div
                  id={`palette-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(entry)}
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 ${i === active ? 'bg-github-accent/10' : ''}`}
                >
                  <TypeIcon className="h-4 w-4 flex-shrink-0 text-github-fg-subtle" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-github-fg">{entry.title}</p>
                    {entry.hint && <p className="truncate text-xs text-github-fg-muted">{entry.hint}</p>}
                  </div>
                  {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-github-fg-subtle" />}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
