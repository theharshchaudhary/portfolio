import { Link } from 'react-router';
import { Star, GitFork, ExternalLink, BookOpen, Tag } from 'lucide-react';
import type { Project } from '@/types';
import { formatDate, formatNumber } from '@/lib/format';

const BADGE_STYLES: Record<string, string> = {
  'Free': 'bg-green-50 text-github-success-fg border-green-200',
  'Open Source': 'bg-blue-50 text-github-accent border-blue-200',
  'Paid/SaaS': 'bg-amber-50 text-github-attention border-amber-200',
  'CLI': 'bg-purple-50 text-github-done-fg border-purple-200',
};
const DEFAULT_BADGE = 'bg-gray-50 text-github-fg-muted border-gray-200';

export type ProjectSummary = Omit<Project, 'body'>;

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <article className="reveal group relative flex flex-col rounded-md border border-github-border bg-github-canvas p-4 transition-all hover:-translate-y-0.5 hover:border-github-border-muted hover:shadow-github-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2">
          <FolderIcon />
          <Link
            to={`/projects/${project.slug}`}
            prefetch="intent" viewTransition
            className="truncate rounded font-semibold text-github-accent after:absolute after:inset-0 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent"
          >
            {project.title}
          </Link>
        </h3>
        {project.releaseVersion && (
          <span className="flex flex-shrink-0 items-center gap-1 rounded-full border border-github-border bg-github-subtle px-2 py-0.5 text-xs font-medium text-github-fg-muted">
            <Tag className="h-3 w-3" />
            {project.releaseVersion}
          </span>
        )}
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-github-fg-muted">{project.summary}</p>

      {project.badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.badges.map((badge) => (
            <span
              key={badge}
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[badge] ?? DEFAULT_BADGE}`}
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-github-fg-muted">
        {project.language && (
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.languageColor ?? '#8b949e' }} />
            {project.language}
          </span>
        )}
        {project.stars > 0 && (
          <span className="flex items-center gap-1" title="Stars">
            <Star className="h-3.5 w-3.5" />
            {formatNumber(project.stars)}
          </span>
        )}
        {project.forks > 0 && (
          <span className="flex items-center gap-1" title="Forks">
            <GitFork className="h-3.5 w-3.5" />
            {formatNumber(project.forks)}
          </span>
        )}
      </div>

      <div className="flex-1" />
      <div className="mt-3 flex items-center gap-3 border-t border-github-border pt-3">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex items-center gap-1 rounded text-xs font-medium text-github-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Live
          </a>
        )}
        {project.docsUrl && (
          <a
            href={project.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex items-center gap-1 rounded text-xs font-medium text-github-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Docs
          </a>
        )}
        <span className="ml-auto text-xs text-github-fg-subtle">Updated {formatDate(project.updatedAt)}</span>
      </div>
    </article>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 flex-shrink-0 text-github-fg-subtle" aria-hidden="true">
      <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3h-6.586a.25.25 0 01-.177-.073L4.573 1.073A1.75 1.75 0 003.336 1H1.75z" fill="currentColor" />
    </svg>
  );
}
