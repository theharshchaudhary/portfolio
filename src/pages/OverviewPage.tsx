import { useEffect, useState } from 'react';
import { Pin, ArrowRight } from 'lucide-react';
import { ContributionHeatmap } from '@/components/ContributionHeatmap';
import { StreakStats } from '@/components/StreakStats';
import { LanguageStats } from '@/components/LanguageStats';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { ProjectCard } from '@/components/ProjectCard';
import { SkeletonBlock, SkeletonCard } from '@/components/ui/Skeleton';
import {
  fetchProfile,
  fetchContributions,
  fetchStreakStats,
  fetchActivities,
  fetchPinnedProjects,
} from '@/services/api';
import type { Profile, ContributionDay, StreakStats as StreakType, Activity, Project } from '@/types';

export function OverviewPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [streak, setStreak] = useState<StreakType | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pinned, setPinned] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchProfile(),
      fetchContributions(),
      fetchStreakStats(),
      fetchActivities(6),
      fetchPinnedProjects(),
    ]).then(([p, c, s, a, pin]) => {
      if (!active) return;
      setProfile(p);
      setContributions(c);
      setStreak(s);
      setActivities(a);
      setPinned(pin);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading || !profile || !streak) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-64 w-full" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-24" />
          ))}
        </div>
        <SkeletonBlock className="h-48 w-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ContributionHeatmap data={contributions} />
      <StreakStats stats={streak} />
      <LanguageStats languages={profile.languages} />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-github-fg">
            <Pin className="h-4 w-4 text-github-fg-muted" />
            Pinned
          </h2>
          <button
            onClick={() => onNavigate('projects')}
            className="flex items-center gap-1 text-sm font-medium text-github-accent hover:underline focus:outline-none focus:ring-2 focus:ring-github-accent rounded"
          >
            Customize your pins
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {pinned.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-github-fg">Recent activity</h2>
          <button
            onClick={() => onNavigate('notes')}
            className="flex items-center gap-1 text-sm font-medium text-github-accent hover:underline focus:outline-none focus:ring-2 focus:ring-github-accent rounded"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <ActivityTimeline activities={activities} />
      </div>
    </div>
  );
}
