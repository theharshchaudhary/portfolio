import { useEffect, useState } from 'react';
import { Tag, Package, ArrowRight } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { fetchReleases } from '@/services/api';
import type { Release } from '@/types';
import { formatDate } from '@/hooks/useRouter';

export function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReleases().then((data) => {
      setReleases(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 animate-fade-in">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} height="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-github-fg">
          <Tag className="h-5 w-5 text-github-fg-muted" />
          Releases
        </h1>
        <p className="mt-1 text-sm text-github-fg-muted">
          Latest version releases across all projects.
        </p>
      </div>

      <div className="space-y-3">
        {releases.map((release) => (
          <div
            key={release.id}
            className="group rounded-md border border-github-border bg-github-canvas p-4 transition-all hover:border-github-border-muted hover:shadow-github-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-github-fg-muted" />
                <span className="font-semibold text-github-fg">{release.project}</span>
                <span className="rounded-full border border-github-border bg-github-subtle px-2 py-0.5 text-xs font-mono font-medium text-github-fg">
                  {release.version}
                </span>
                {release.isLatest && (
                  <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-github-success-fg">
                    Latest
                  </span>
                )}
              </div>
              <span className="text-xs text-github-fg-subtle">{formatDate(release.publishedAt)}</span>
            </div>
            <p className="mt-2 text-sm text-github-fg-muted">{release.notes}</p>
            <a
              href={`https://github.com/theharshchaudhary/${release.project}/releases/tag/${release.version}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-github-accent hover:underline focus:outline-none focus:ring-2 focus:ring-github-accent rounded"
            >
              View release notes
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
