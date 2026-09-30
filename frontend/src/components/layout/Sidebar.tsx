import { MapPin, Building, Users, CalendarDays, FileDown } from 'lucide-react';
import type { SiteData } from '@/types';
import { formatMonthYear, formatNumber } from '@/lib/format';
import { Avatar } from '@/components/Avatar';
import { PlatformIcon } from '@/components/icons';

export function Sidebar({ site }: { site: SiteData }) {
  const { profile, languages } = site;
  const socials = site.socials.filter((s) => s.showInSidebar);
  const github = site.socials.find((s) => s.platform === 'github')?.url
    ?? (site.settings.githubUsername ? `https://github.com/${site.settings.githubUsername}` : null);

  return (
    <aside className="hidden w-[296px] flex-shrink-0 px-4 pt-6 md:block" aria-label="Profile">
      <div className="sticky top-16">
        <div className="overflow-hidden rounded-lg border border-github-border bg-github-canvas">
          <div className="h-3 bg-gradient-to-r from-github-accent to-github-success-fg" />
          <div className="p-4">
            <Avatar name={profile.name} src={profile.avatar} size={230} className="mx-auto" />
            <p className="mt-4 text-xl font-semibold text-github-fg">{profile.name}</p>
            {profile.headline && <p className="text-base text-github-fg-muted">{profile.headline}</p>}

            {(profile.status || profile.openToWork) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.openToWork && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-github-success-fg">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-github-success-emphasis" />
                    Open to work
                  </span>
                )}
                {profile.status && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-github-border bg-github-subtle px-3 py-1 text-sm text-github-fg-muted">
                    {profile.status.emoji && <span>{profile.status.emoji}</span>}
                    <span>{profile.status.message}</span>
                  </span>
                )}
              </div>
            )}

            {profile.shortBio && <p className="mt-3 text-sm text-github-fg">{profile.shortBio}</p>}

            <div className="mt-4 flex gap-2">
              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="flex-1 rounded-md border border-github-border bg-github-subtle px-3 py-1.5 text-center text-sm font-medium text-github-fg transition-colors hover:bg-github-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent"
                >
                  Follow
                </a>
              )}
              {profile.cvUrl && (
                <a
                  href={profile.cvUrl}
                  download
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-github-success-emphasis px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-github-success-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent focus-visible:ring-offset-1"
                >
                  <FileDown className="h-4 w-4" />
                  Resume
                </a>
              )}
            </div>

            {profile.followers !== null && (
              <p className="mt-4 flex items-center gap-1 text-sm text-github-fg-muted">
                <Users className="h-4 w-4" />
                <strong className="text-github-fg">{formatNumber(profile.followers)}</strong> followers ·{' '}
                <strong className="text-github-fg">{profile.following ?? 0}</strong> following
              </p>
            )}

            <ul className="mt-4 space-y-2 text-sm">
              {profile.company && (
                <li className="flex items-center gap-2 text-github-fg-muted">
                  <Building className="h-4 w-4 flex-shrink-0 text-github-fg-subtle" />
                  {profile.company}
                </li>
              )}
              {profile.location && (
                <li className="flex items-center gap-2 text-github-fg-muted">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-github-fg-subtle" />
                  {profile.location}
                </li>
              )}
              {socials.map((link) => (
                <li key={link.url} className="flex items-center gap-2">
                  <PlatformIcon platform={link.platform} className="h-4 w-4 flex-shrink-0 text-github-fg-subtle" />
                  <a
                    href={link.url}
                    target={link.url.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer me"
                    className="truncate rounded text-github-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent"
                  >
                    {link.handle ? `@${link.handle}` : link.label}
                  </a>
                </li>
              ))}
            </ul>

            {profile.joinedAt && (
              <p className="mt-4 flex items-center gap-1 border-t border-github-border pt-3 text-sm text-github-fg-muted">
                <CalendarDays className="h-4 w-4" />
                Joined {formatMonthYear(profile.joinedAt)}
              </p>
            )}

            {languages.length > 0 && (
              <div className="mt-4 border-t border-github-border pt-3">
                <p className="mb-2 text-sm font-semibold text-github-fg">Top languages</p>
                <div className="flex h-2 overflow-hidden rounded-full">
                  {languages.map((lang) => (
                    <div
                      key={lang.name}
                      className="h-full"
                      style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                      title={`${lang.name} ${lang.percentage}%`}
                    />
                  ))}
                </div>
                <ul className="mt-2 space-y-1">
                  {languages.map((lang) => (
                    <li key={lang.name} className="flex items-center justify-between text-xs text-github-fg-muted">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                        {lang.name}
                      </span>
                      <span>{lang.percentage}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
