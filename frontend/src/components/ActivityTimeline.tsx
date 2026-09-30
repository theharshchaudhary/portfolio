import { GitPullRequest, Tag, Star, GitCommit, type LucideIcon } from 'lucide-react';
import type { Activity, ActivityType } from '@/types';
import { formatRelativeTime } from '@/lib/format';

const ACTIVITY_CONFIG: Record<ActivityType, { icon: LucideIcon; color: string; bg: string }> = {
  pr_merged: { icon: GitPullRequest, color: 'text-github-done-fg', bg: 'bg-purple-50' },
  release: { icon: Tag, color: 'text-github-accent', bg: 'bg-blue-50' },
  star: { icon: Star, color: 'text-github-attention', bg: 'bg-amber-50' },
  commit: { icon: GitCommit, color: 'text-github-fg-muted', bg: 'bg-github-subtle' },
};

export function ActivityTimeline({ activities, now }: { activities: Activity[]; now: string }) {
  return (
    <section className="rounded-md border border-github-border bg-github-canvas" aria-labelledby="activity-heading">
      <div className="border-b border-github-border px-4 py-3">
        <h2 id="activity-heading" className="text-sm font-semibold text-github-fg">Recent activity</h2>
      </div>
      <ul className="divide-y divide-github-border">
        {activities.map((activity) => {
          const config = ACTIVITY_CONFIG[activity.type] ?? ACTIVITY_CONFIG.commit;
          return (
            <li key={activity.id} className="flex gap-3 px-4 py-3 transition-colors hover:bg-github-subtle/50">
              <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${config.bg}`}>
                <config.icon className={`h-4 w-4 ${config.color}`} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-github-fg">{activity.title}</p>
                <p className="mt-0.5 truncate text-sm text-github-fg-muted">{activity.description}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-github-fg-subtle">
                  {activity.repo && (
                    <>
                      <a
                        href={activity.url ?? `https://github.com/${activity.repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded font-mono text-github-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent"
                      >
                        {activity.repo}
                      </a>
                      <span aria-hidden="true">·</span>
                    </>
                  )}
                  <time dateTime={activity.timestamp}>{formatRelativeTime(activity.timestamp, now)}</time>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
