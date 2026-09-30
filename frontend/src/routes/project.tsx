import { Link, data } from 'react-router';
import { ArrowLeft, BookOpen, ExternalLink, GitFork, Quote, Star, Tag } from 'lucide-react';
import type { Route } from './+types/project';
import { GithubIcon } from '@/components/icons/brands';
import { ProjectCard } from '@/components/ProjectCard';
import { Prose } from '@/components/ui';
import { getProject } from '@/lib/content.server';
import { formatDate, formatNumber } from '@/lib/format';
import { ogImagePath, rootData, seo } from '@/lib/seo';
import { breadcrumbs, ldJson, projectEntity } from '@/lib/schema';

export async function loader({ params }: Route.LoaderArgs) {
  const result = await getProject(params.slug);
  if (!result) throw data(null, { status: 404 });
  return result;
}

export function meta({ matches, loaderData }: Route.MetaArgs) {
  if (!loaderData) return [];
  const { project } = loaderData;
  const site = rootData(matches)?.site;
  const path = `/projects/${project.slug}`;
  return [
    ...seo(site, { title: project.title, description: project.summary, path, image: project.coverImage, type: 'article', overrides: project.seo }),
    ...(site
      ? ldJson(
          projectEntity(site, project, project.seo.ogImage ?? ogImagePath(path)),
          breadcrumbs(site, [{ name: 'Projects', path: '/projects' }, { name: project.title, path }]),
        )
      : []),
  ];
}

const linkClass =
  'inline-flex items-center gap-1.5 rounded-md border border-github-border bg-github-canvas px-3 py-1.5 text-sm font-medium text-github-fg transition-colors hover:bg-github-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent';

export default function ProjectDetail({ loaderData }: Route.ComponentProps) {
  const { project, body, testimonials, related } = loaderData;

  return (
    <article className="space-y-6">
      <nav aria-label="Breadcrumb">
        <Link to="/projects" viewTransition className="inline-flex items-center gap-1 rounded text-sm font-medium text-github-accent hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Projects
        </Link>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-github-fg">{project.title}</h1>
          {project.releaseVersion && (
            <span className="flex items-center gap-1 rounded-full border border-github-border bg-github-subtle px-2 py-0.5 text-xs font-medium text-github-fg-muted">
              <Tag className="h-3 w-3" />
              {project.releaseVersion}
            </span>
          )}
        </div>
        <p className="max-w-3xl text-lg text-github-fg-muted">{project.summary}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-github-fg-muted">
          {project.language && (
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.languageColor ?? '#8b949e' }} />
              {project.language}
            </span>
          )}
          {project.stars > 0 && (
            <span className="flex items-center gap-1"><Star className="h-4 w-4" />{formatNumber(project.stars)} stars</span>
          )}
          {project.forks > 0 && (
            <span className="flex items-center gap-1"><GitFork className="h-4 w-4" />{formatNumber(project.forks)} forks</span>
          )}
          <span>Updated <time dateTime={project.updatedAt}>{formatDate(project.updatedAt)}</time></span>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} border-transparent bg-github-success-emphasis text-white hover:bg-github-success-fg`}>
              <ExternalLink className="h-4 w-4" /> Visit live site
            </a>
          )}
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <GithubIcon className="h-4 w-4" /> Source code
            </a>
          )}
          {project.docsUrl && (
            <a href={project.docsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <BookOpen className="h-4 w-4" /> Documentation
            </a>
          )}
        </div>
      </header>

      {project.coverImage && (
        <img
          src={project.coverImage}
          alt={`${project.title} screenshot`}
          className="w-full rounded-lg border border-github-border object-cover"
          fetchPriority="high"
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
        <div className="min-w-0 space-y-6">
          {body.html ? (
            <div className="rounded-md border border-github-border bg-github-canvas p-6">
              <Prose html={body.html} />
            </div>
          ) : null}

          {project.gallery.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-semibold text-github-fg">Gallery</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {project.gallery.map((src, i) => (
                  <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-md border border-github-border">
                    <img src={src} alt={`${project.title} screenshot ${i + 1}`} loading="lazy" className="w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-md border border-github-border bg-github-subtle p-5">
              <Quote className="h-5 w-5 text-github-fg-subtle" />
              <blockquote className="mt-2 text-sm text-github-fg">{t.quote}</blockquote>
              <figcaption className="mt-3 text-xs text-github-fg-muted">
                <strong className="text-github-fg">{t.name}</strong>
                {[t.role, t.company].filter(Boolean).length > 0 && `, ${[t.role, t.company].filter(Boolean).join(', ')}`}
              </figcaption>
            </figure>
          ))}
        </div>

        <aside className="space-y-4">
          {project.tech.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-github-fg">Built with</h2>
              <ul className="flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <li key={t} className="rounded-md border border-github-border bg-github-subtle px-2 py-0.5 text-xs font-medium text-github-fg-muted">{t}</li>
                ))}
              </ul>
            </div>
          )}
          {body.toc.length > 1 && (
            <nav aria-label="On this page" className="hidden lg:block">
              <h2 className="mb-2 text-sm font-semibold text-github-fg">On this page</h2>
              <ul className="space-y-1 text-sm">
                {body.toc.map((item) => (
                  <li key={item.id} className={item.depth === 3 ? 'pl-3' : ''}>
                    <a href={`#${item.id}`} className="text-github-fg-muted hover:text-github-accent">{item.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-github-fg">More projects</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
