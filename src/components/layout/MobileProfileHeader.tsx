import { MapPin, Link as LinkIcon, Building, Users } from 'lucide-react';
import type { Profile } from '@/types';
import { formatNumber } from '@/hooks/useRouter';

const AVATAR_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <defs>
    <linearGradient id="bgm" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0969da"/>
      <stop offset="100%" stop-color="#1f883d"/>
    </linearGradient>
  </defs>
  <rect width="80" height="80" rx="40" fill="url(#bgm)"/>
  <text x="40" y="50" font-family="system-ui, sans-serif" font-size="34" font-weight="bold" fill="white" text-anchor="middle">HC</text>
</svg>
`)}`;

export function MobileProfileHeader({ profile }: { profile: Profile | null }) {
  if (!profile) {
    return (
      <div className="px-4 pt-4 md:hidden">
        <div className="animate-pulse rounded-lg border border-github-border bg-github-canvas p-4">
          <div className="h-20 w-20 animate-pulse rounded-full bg-github-subtle" />
          <div className="mt-3 h-5 w-32 animate-pulse rounded bg-github-subtle" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-github-subtle" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 md:hidden">
      <div className="rounded-lg border border-github-border bg-github-canvas p-4">
        <div className="flex items-start gap-3">
          <img
            src={AVATAR_SVG}
            alt={profile.name}
            className="h-20 w-20 rounded-full border border-github-border-muted"
            width={80}
            height={80}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-github-fg">{profile.name}</h2>
            <p className="text-sm text-github-fg-muted">{profile.username}</p>
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-github-border bg-github-subtle px-2 py-0.5 text-xs text-github-fg-muted">
              <span>{profile.status.emoji}</span>
              <span>{profile.status.message}</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-github-fg">{profile.bio}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-github-fg-muted">
          <span className="flex items-center gap-1">
            <Building className="h-3.5 w-3.5" /> {profile.company}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {profile.location}
          </span>
          <span className="flex items-center gap-1">
            <LinkIcon className="h-3.5 w-3.5" /> {profile.website.replace('https://', '')}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {formatNumber(profile.followers)} followers
          </span>
        </div>
      </div>
    </div>
  );
}
