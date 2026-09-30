import { MapPin, Building, FileDown } from 'lucide-react';
import type { SiteData } from '@/types';
import { Avatar } from '@/components/Avatar';

export function MobileProfileHeader({ site }: { site: SiteData }) {
  const { profile } = site;
  return (
    <div className="px-4 pt-4 md:hidden">
      <div className="rounded-lg border border-github-border bg-github-canvas p-4">
        <div className="flex items-start gap-3">
          <Avatar name={profile.name} src={profile.avatar} size={72} />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-github-fg">{profile.name}</p>
            {profile.headline && <p className="text-sm text-github-fg-muted">{profile.headline}</p>}
            {profile.openToWork && (
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-github-success-fg">
                <span className="h-1.5 w-1.5 rounded-full bg-github-success-emphasis" />
                Open to work
              </span>
            )}
          </div>
        </div>
        {profile.shortBio && <p className="mt-3 text-sm text-github-fg">{profile.shortBio}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-github-fg-muted">
          {profile.company && (
            <span className="flex items-center gap-1">
              <Building className="h-3.5 w-3.5" /> {profile.company}
            </span>
          )}
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {profile.location}
            </span>
          )}
          {profile.cvUrl && (
            <a href={profile.cvUrl} download className="flex items-center gap-1 font-medium text-github-accent hover:underline">
              <FileDown className="h-3.5 w-3.5" /> Resume
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
