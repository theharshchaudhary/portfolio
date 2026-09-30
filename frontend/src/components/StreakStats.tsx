import { Flame, TrendingUp, CalendarDays, Activity } from 'lucide-react';
import type { StreakStats } from '@/types';

export function StreakStats({ stats }: { stats: StreakStats }) {
  const cards = [
    {
      label: 'Current streak',
      value: `${stats.current} days`,
      icon: Flame,
      color: 'text-github-danger',
      bg: 'bg-orange-50',
    },
    {
      label: 'Longest streak',
      value: `${stats.longest} days`,
      icon: TrendingUp,
      color: 'text-github-success-fg',
      bg: 'bg-green-50',
    },
    {
      label: 'Total contributions',
      value: stats.total.toLocaleString(),
      icon: Activity,
      color: 'text-github-accent',
      bg: 'bg-blue-50',
    },
    {
      label: 'Best day',
      value: new Date(stats.bestDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      icon: CalendarDays,
      color: 'text-github-done-fg',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-md border border-github-border bg-github-canvas p-4 transition-shadow hover:shadow-github-sm"
        >
          <div className="flex items-center gap-2">
            <span className={`flex h-8 w-8 items-center justify-center rounded-md ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </span>
          </div>
          <p className="mt-3 text-xl font-semibold text-github-fg tabular-nums">{card.value}</p>
          <p className="text-xs text-github-fg-muted">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
