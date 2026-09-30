import { useEffect, useState } from 'react';
import { Pin, Search, Grid3x3, List } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { fetchProjects } from '@/services/api';
import type { Project, BadgeType } from '@/types';

const FILTER_OPTIONS: (BadgeType | 'All')[] = ['All', 'Free', 'Open Source', 'Paid/SaaS', 'CLI', 'Library'];

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTER_OPTIONS)[number]>('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const filtered = projects.filter((p) => {
    const matchesFilter = filter === 'All' || p.badges.includes(filter as BadgeType);
    const matchesQuery =
      query === '' ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const pinned = filtered.filter((p) => p.pinned);
  const rest = filtered.filter((p) => !p.pinned);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold text-github-fg">Projects</h1>
        <p className="mt-1 text-sm text-github-fg-muted">
          {loading ? 'Loading…' : `${projects.length} repositories`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-github-fg-subtle" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a repository…"
            className="w-full rounded-md border border-github-border bg-github-canvas py-1.5 pl-8 pr-3 text-sm text-github-fg placeholder:text-github-fg-subtle focus:border-github-accent focus:outline-none focus:ring-1 focus:ring-github-accent"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                filter === opt
                  ? 'border-github-accent bg-github-accent/10 text-github-accent'
                  : 'border-github-border bg-github-canvas text-github-fg-muted hover:bg-github-subtle'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} height="h-44" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-github-border py-16 text-center">
          <Grid3x3 className="mx-auto h-8 w-8 text-github-fg-subtle" />
          <p className="mt-3 text-sm text-github-fg-muted">No repositories match your search.</p>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-github-fg">
                <Pin className="h-4 w-4 text-github-fg-muted" />
                Pinned repositories
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {pinned.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-github-fg">
                <List className="h-4 w-4 text-github-fg-muted" />
                All repositories
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {rest.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
