import { useMemo, useState } from 'react';
import { Pin, Search, Grid3x3, List } from 'lucide-react';
import type { Route } from './+types/projects';
import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState, PageHeader } from '@/components/ui';
import { getProjects } from '@/lib/content.server';
import { rootData, seo } from '@/lib/seo';

export async function loader() {
  return getProjects();
}

export function meta({ matches, loaderData }: Route.MetaArgs) {
  return seo(rootData(matches)?.site, {
    title: loaderData?.page.heading ?? 'Projects',
    description: loaderData?.page.intro,
    path: '/projects',
    overrides: loaderData?.page.seo,
  });
}

export default function Projects({ loaderData }: Route.ComponentProps) {
  const { page, projects } = loaderData;
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const filters = useMemo(() => ['All', ...new Set(projects.flatMap((p) => [...p.badges, ...p.tech]))].slice(0, 10), [projects]);

  const q = query.trim().toLowerCase();
  const filtered = projects.filter(
    (p) =>
      (filter === 'All' || p.badges.includes(filter) || p.tech.includes(filter)) &&
      (!q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)),
  );
  const pinned = filtered.filter((p) => p.pinned);
  const rest = filtered.filter((p) => !p.pinned);

  return (
    <div className="space-y-6">
      <PageHeader title={page.heading ?? 'Projects'} intro={page.intro}>
        <span className="rounded-full border border-github-border bg-github-subtle px-3 py-1 text-xs font-medium text-github-fg-muted">
          {projects.length} projects
        </span>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-github-fg-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a project…"
            aria-label="Filter projects"
            className="w-full rounded-md border border-github-border bg-github-canvas py-1.5 pl-8 pr-3 text-sm text-github-fg placeholder:text-github-fg-subtle focus:border-github-accent focus:outline-none focus:ring-1 focus:ring-github-accent"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-none" role="group" aria-label="Filter by type">
          {filters.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilter(opt)}
              aria-pressed={filter === opt}
              className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent ${
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

      {filtered.length === 0 ? (
        <EmptyState icon={Grid3x3}>{projects.length ? 'No projects match your search.' : 'Projects are coming soon.'}</EmptyState>
      ) : (
        <>
          {pinned.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-github-fg">
                <Pin className="h-4 w-4 text-github-fg-muted" />
                Pinned
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {pinned.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-github-fg">
                <List className="h-4 w-4 text-github-fg-muted" />
                {pinned.length ? 'More projects' : 'All projects'}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {rest.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
