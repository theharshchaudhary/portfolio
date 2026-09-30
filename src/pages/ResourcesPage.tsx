import { useEffect, useState } from 'react';
import {
  BookMarked,
  Terminal,
  Package,
  Settings,
  ListChecks,
  GitPullRequest,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { fetchResources } from '@/services/api';
import type { Resource } from '@/types';

const ICON_MAP: Record<string, LucideIcon> = {
  BookMarked,
  Terminal,
  Package,
  Settings,
  ListChecks,
  GitPullRequest,
};

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources().then((data) => {
      setResources(data);
      setLoading(false);
    });
  }, []);

  const categories = Array.from(new Set(resources.map((r) => r.category)));

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 animate-fade-in">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} height="h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-github-fg">
          <BookMarked className="h-5 w-5 text-github-fg-muted" />
          Resources
        </h1>
        <p className="mt-1 text-sm text-github-fg-muted">
          Templates, tools, libraries, and guides I have built and shared.
        </p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h2 className="mb-3 text-sm font-semibold text-github-fg">{category}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {resources
              .filter((r) => r.category === category)
              .map((resource) => {
                const Icon = ICON_MAP[resource.icon] || Package;
                return (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target={resource.url.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="group rounded-md border border-github-border bg-github-canvas p-4 transition-all hover:border-github-border-muted hover:shadow-github-sm focus:outline-none focus:ring-2 focus:ring-github-accent"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-github-subtle">
                        <Icon className="h-4 w-4 text-github-fg-muted" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-github-fg group-hover:text-github-accent">
                            {resource.title}
                          </h3>
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-github-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <p className="mt-1 text-sm text-github-fg-muted">{resource.description}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
