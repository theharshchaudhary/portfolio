import { Link, useRouteLoaderData } from 'react-router';
import { Pin, ArrowRight } from 'lucide-react';
import type { Route } from './+types/home';
import { ContributionHeatmap } from '@/components/ContributionHeatmap';
import { StreakStats } from '@/components/StreakStats';
import { LanguageStats } from '@/components/LanguageStats';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { ProjectCard } from '@/components/ProjectCard';
import { getHome } from '@/lib/content.server';
import { rootData, seo } from '@/lib/seo';
import type { loader as rootLoader } from '@/root';

export async function loader() {
  return getHome();
}

export function meta({ matches }: Route.MetaArgs) {
  return seo(rootData(matches)?.site, { path: '/', type: 'profile' });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { contributions, streak, activities, pinned } = loaderData;
  const { site } = useRouteLoaderData<typeof rootLoader>('root')!;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="sr-only">{site.settings.defaultTitle}</h1>
      <ContributionHeatmap data={contributions} />
      <StreakStats stats={streak} />
      <LanguageStats languages={site.profile.languages} />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-github-fg">
            <Pin className="h-4 w-4 text-github-fg-muted" />
            Pinned
          </h2>
          <Link
            to="/projects"
            className="flex items-center gap-1 text-sm font-medium text-github-accent hover:underline focus:outline-none focus:ring-2 focus:ring-github-accent rounded"
          >
            All projects
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {pinned.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      <div>
        <ActivityTimeline activities={activities} now={site.builtAt} />
      </div>
    </div>
  );
}
