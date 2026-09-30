import { Link, useRouteLoaderData } from 'react-router';
import { Pin, ArrowRight, Rss } from 'lucide-react';
import type { Route } from './+types/home';
import { ContributionHeatmap } from '@/components/ContributionHeatmap';
import { StreakStats } from '@/components/StreakStats';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { ProjectCard } from '@/components/ProjectCard';
import { PostCard } from '@/components/ui';
import { HeroBanner } from '@/components/hero/HeroBanner';
import { getHome } from '@/lib/content.server';
import { rootData, seo } from '@/lib/seo';
import { ldJson, person, website } from '@/lib/schema';
import type { loader as rootLoader } from '@/root';

export async function loader() {
  return getHome();
}

export function meta({ matches, loaderData }: Route.MetaArgs) {
  const site = rootData(matches)?.site;
  return [
    ...seo(site, { path: '/', type: 'profile', overrides: loaderData?.page.seo }),
    ...(site ? ldJson(person(site), website(site)) : []),
  ];
}

function SectionTitle({ icon: Icon, title, to, linkLabel }: { icon: typeof Pin; title: string; to: string; linkLabel: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-base font-semibold text-github-fg">
        <Icon className="h-4 w-4 text-github-fg-muted" />
        {title}
      </h2>
      <Link to={to} viewTransition className="flex items-center gap-1 rounded text-sm font-medium text-github-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent">
        {linkLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { page, github, pinned, latestPosts } = loaderData;
  const { site } = useRouteLoaderData<typeof rootLoader>('root')!;
  const { profile, settings } = site;
  const hero = settings.hero;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-github-border bg-github-canvas" aria-labelledby="hero-heading">
        <HeroBanner
          text={hero.particleText || profile.name}
          imageUrl={hero.mode === 'avatar' ? profile.avatar : null}
        />
        <div className="p-6 sm:p-8">
          <p className="text-sm font-medium text-github-accent">Hi, I’m</p>
          <h1 id="hero-heading" className="mt-1 text-3xl font-bold tracking-tight text-github-fg sm:text-4xl">
            {page.heading ?? profile.name}
          </h1>
          {(page.intro ?? profile.headline) && (
            <p className="mt-2 text-lg text-github-fg-muted">{page.intro ?? profile.headline}</p>
          )}
          {hero.introLines && hero.introLines.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {hero.introLines.map((line) => (
                <li key={line} className="rounded-full border border-github-border bg-github-canvas px-3 py-1 text-sm text-github-fg-muted">
                  {line}
                </li>
              ))}
            </ul>
          )}
          {hero.ctas && hero.ctas.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {hero.ctas.map((cta) => (
                <Link
                  key={cta.href}
                  to={cta.href}
                  prefetch="intent" viewTransition
                  className={
                    cta.style === 'primary'
                      ? 'rounded-md bg-github-success-emphasis px-4 py-2 text-sm font-medium text-white shadow-github-sm transition-colors hover:bg-github-success-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent focus-visible:ring-offset-2'
                      : 'rounded-md border border-github-border bg-github-canvas px-4 py-2 text-sm font-medium text-github-fg transition-colors hover:bg-github-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent focus-visible:ring-offset-2'
                  }
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {github && (
        <>
          <ContributionHeatmap data={github.contributions} />
          <StreakStats stats={github.streak} />
        </>
      )}

      {pinned.length > 0 && (
        <section className="reveal">
          <SectionTitle icon={Pin} title="Pinned projects" to="/projects" linkLabel="All projects" />
          <div className="grid gap-3 sm:grid-cols-2">
            {pinned.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {latestPosts.length > 0 && (
        <section className="reveal">
          <SectionTitle icon={Rss} title="Latest writing" to="/blog" linkLabel="All posts" />
          <div className="space-y-3">
            {latestPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {github && github.activity.length > 0 && <ActivityTimeline activities={github.activity.slice(0, 8)} now={site.builtAt} />}
    </div>
  );
}
