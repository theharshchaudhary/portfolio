import { Mail, MapPin, Building, Link as LinkIcon, Users, Eye } from 'lucide-react';
import { GithubIcon, LinkedinIcon, XIcon } from '@/components/icons/brands';
import type { Profile } from '@/types';
import { formatMonthYear, formatNumber } from '@/lib/format';

const AVATAR_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0969da"/>
      <stop offset="100%" stop-color="#1f883d"/>
    </linearGradient>
  </defs>
  <rect width="260" height="260" fill="url(#bg)"/>
  <text x="130" y="155" font-family="system-ui, sans-serif" font-size="110" font-weight="bold" fill="white" text-anchor="middle">HC</text>
</svg>
`)}`;

export function Sidebar({ profile }: { profile: Profile }) {
  const socialLinks = [
    { icon: Building, text: profile.company, href: undefined },
    { icon: MapPin, text: profile.location, href: undefined },
    { icon: LinkIcon, text: profile.website.replace('https://', ''), href: profile.website },
    { icon: XIcon, text: `@${profile.twitter}`, href: `https://x.com/${profile.twitter}` },
    { icon: GithubIcon, text: `@${profile.github}`, href: `https://github.com/${profile.github}` },
    { icon: LinkedinIcon, text: `@${profile.linkedin}`, href: `https://linkedin.com/in/${profile.linkedin}` },
    { icon: Mail, text: profile.email, href: `mailto:${profile.email}` },
  ];

  return (
    <aside className="hidden md:block w-[296px] flex-shrink-0 px-4 pt-6">
      <div className="sticky top-4">
        <div className="overflow-hidden rounded-lg border border-github-border bg-github-canvas">
          <div className="h-3 bg-gradient-to-r from-github-accent to-github-success-fg" />
          <div className="p-4">
            <img
              src={AVATAR_SVG}
              alt={profile.name}
              className="h-[260px] w-full max-w-[260px] rounded-full border border-github-border-muted object-cover"
              width={260}
              height={260}
            />
            <h2 className="mt-4 text-xl font-semibold text-github-fg">{profile.name}</h2>
            <p className="text-base text-github-fg-muted">{profile.username}</p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-github-border bg-github-subtle px-3 py-1 text-sm text-github-fg-muted">
              <span className="text-base">{profile.status.emoji}</span>
              <span>{profile.status.message}</span>
            </div>

            <p className="mt-3 text-sm text-github-fg">{profile.bio}</p>

            <a
              href={`https://github.com/${profile.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block w-full rounded-md border border-github-border bg-github-subtle px-3 py-1.5 text-center text-sm font-medium text-github-fg transition-colors hover:bg-github-inset focus:outline-none focus:ring-2 focus:ring-github-accent focus:ring-offset-1"
            >
              Follow
            </a>

            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-github-fg-muted">
                <Users className="h-4 w-4" />
                <strong className="text-github-fg">{formatNumber(profile.followers)}</strong> followers
              </span>
              <span className="text-github-fg-muted">
                <strong className="text-github-fg">{profile.following}</strong> following
              </span>
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              {socialLinks.map((link, i) => (
                <li key={i} className="flex items-center gap-2 text-github-fg-muted">
                  <link.icon className="h-4 w-4 flex-shrink-0 text-github-fg-subtle" />
                  {link.href ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-github-accent hover:underline focus:outline-none focus:ring-2 focus:ring-github-accent focus:ring-offset-2 rounded"
                    >
                      {link.text}
                    </a>
                  ) : (
                    <span>{link.text}</span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t border-github-border pt-3 text-sm text-github-fg-muted">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                Joined {formatMonthYear(profile.joinedDate)}
              </span>
            </div>

            <div className="mt-4 border-t border-github-border pt-3">
              <h3 className="mb-2 text-sm font-semibold text-github-fg">Top languages</h3>
              <div className="flex h-2 overflow-hidden rounded-full">
                {profile.languages.map((lang) => (
                  <div
                    key={lang.name}
                    className="h-full"
                    style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                    title={`${lang.name} ${lang.percentage}%`}
                  />
                ))}
              </div>
              <ul className="mt-2 space-y-1">
                {profile.languages.map((lang) => (
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
          </div>
        </div>
      </div>
    </aside>
  );
}
