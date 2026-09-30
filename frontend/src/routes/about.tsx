import { Link, useRouteLoaderData } from 'react-router';
import { Activity, Briefcase, FileDown, FolderGit2, GraduationCap, MapPin, Star } from 'lucide-react';
import type { Route } from './+types/about';
import { PageHeader, Prose } from '@/components/ui';
import { getAbout } from '@/lib/content.server';
import { formatMonthYear, formatNumber } from '@/lib/format';
import { rootData, seo } from '@/lib/seo';
import type { loader as rootLoader } from '@/root';
import type { Experience, Skill } from '@/types';

export async function loader() {
  return getAbout();
}

export function meta({ matches, loaderData }: Route.MetaArgs) {
  const site = rootData(matches)?.site;
  return seo(site, {
    title: loaderData?.page.heading ?? `About ${site?.profile.name ?? ''}`,
    description: loaderData?.page.intro ?? site?.profile.shortBio,
    path: '/about',
    type: 'profile',
    image: site?.profile.avatar,
    overrides: loaderData?.page.seo,
  });
}

function Timeline({ items }: { items: Experience[] }) {
  return (
    <ol className="relative space-y-6 border-l border-github-border pl-6">
      {items.map((item) => {
        const ItemIcon = item.type === 'education' ? GraduationCap : Briefcase;
        return (
          <li key={`${item.organization}-${item.startedAt}`} className="relative">
            <span className="absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full border border-github-border bg-github-canvas">
              {item.logo ? <img src={item.logo} alt="" className="h-4 w-4 rounded-full object-cover" /> : <ItemIcon className="h-3.5 w-3.5 text-github-fg-muted" />}
            </span>
            <h3 className="text-sm font-semibold text-github-fg">{item.title}</h3>
            <p className="text-sm text-github-fg-muted">
              {item.organizationUrl ? (
                <a href={item.organizationUrl} target="_blank" rel="noopener noreferrer" className="text-github-accent hover:underline">{item.organization}</a>
              ) : item.organization}
              {item.location && ` · ${item.location}`}
            </p>
            <p className="mt-0.5 text-xs text-github-fg-subtle">
              <time dateTime={item.startedAt}>{formatMonthYear(item.startedAt)}</time> –{' '}
              {item.endedAt ? <time dateTime={item.endedAt}>{formatMonthYear(item.endedAt)}</time> : 'Present'}
            </p>
            {item.description && <p className="mt-2 whitespace-pre-line text-sm text-github-fg-muted">{item.description}</p>}
          </li>
        );
      })}
    </ol>
  );
}

function groupSkills(skills: Skill[]) {
  const groups = new Map<string, Skill[]>();
  for (const skill of skills) {
    const key = skill.category ?? 'Other';
    groups.set(key, [...(groups.get(key) ?? []), skill]);
  }
  return [...groups];
}

export default function About({ loaderData }: Route.ComponentProps) {
  const { page, bio, experiences, skills, stats } = loaderData;
  const { profile } = useRouteLoaderData<typeof rootLoader>('root')!.site;
  const work = experiences.filter((e) => e.type === 'work');
  const education = experiences.filter((e) => e.type === 'education');

  const statCards = [
    { icon: FolderGit2, label: 'Projects', value: stats.projects, color: 'text-github-accent', bg: 'bg-blue-50' },
    { icon: Star, label: 'GitHub stars', value: stats.stars, color: 'text-github-attention', bg: 'bg-amber-50' },
    { icon: Activity, label: 'Contributions this year', value: stats.contributions, color: 'text-github-success-fg', bg: 'bg-green-50' },
  ].filter((s) => s.value);

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <PageHeader title={page.heading ?? `About ${profile.name}`} intro={page.intro ?? profile.headline}>
        {profile.cvUrl && (
          <a
            href={profile.cvUrl}
            download
            className="inline-flex items-center gap-1.5 rounded-md bg-github-success-emphasis px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-github-success-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent focus-visible:ring-offset-2"
          >
            <FileDown className="h-4 w-4" />
            Download resume
          </a>
        )}
      </PageHeader>

      <section className="rounded-md border border-github-border bg-github-canvas p-6">
        {bio.html ? <Prose html={bio.html} /> : <p className="text-base text-github-fg">{profile.shortBio}</p>}
        {profile.location && (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-github-fg-muted">
            <MapPin className="h-4 w-4" /> Based in {profile.location}
          </p>
        )}
      </section>

      {statCards.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-md border border-github-border bg-github-canvas p-4">
              <span className={`flex h-8 w-8 items-center justify-center rounded-md ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </span>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-github-fg">{formatNumber(s.value!)}</p>
              <p className="text-xs text-github-fg-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {work.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-semibold text-github-fg">Experience</h2>
          <Timeline items={work} />
        </section>
      )}

      {education.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-semibold text-github-fg">Education</h2>
          <Timeline items={education} />
        </section>
      )}

      {skills.length > 0 && (
        <section className="rounded-md border border-github-border bg-github-canvas p-6">
          <h2 className="text-base font-semibold text-github-fg">Skills & technologies</h2>
          <div className="mt-4 space-y-4">
            {groupSkills(skills).map(([category, items]) => (
              <div key={category}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-github-fg-subtle">{category}</h3>
                <ul className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <li key={skill.name} className="rounded-md border border-github-border bg-github-subtle px-2.5 py-1 text-xs font-medium text-github-fg-muted">
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-sm text-github-fg-muted">
        Want to work together? <Link to="/contact" className="font-medium text-github-accent hover:underline">Get in touch</Link>.
      </p>
    </div>
  );
}
