import { Flame, TrendingUp, CalendarDays, Activity } from 'lucide-react';
import type { StreakStats as Stats } from '@/types';
import { CountUp } from '@/components/CountUp';

const days = (n: number) => `${n.toLocaleString('en-US')} day${n === 1 ? '' : 's'}`;

export function StreakStats({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'Current streak', value: <CountUp value={stats.current} format={days} />, icon: Flame, color: 'text-github-danger', bg: 'bg-orange-50' },
    { label: 'Longest streak', value: <CountUp value={stats.longest} format={days} />, icon: TrendingUp, color: 'text-github-success-fg', bg: 'bg-green-50' },
    { label: 'Total contributions', value: <CountUp value={stats.total} />, icon: Activity, color: 'text-github-accent', bg: 'bg-blue-50' },
    {
      label: 'Best day',
      value: stats.bestDay
        ? new Date(stats.bestDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
        : '—',
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
          className="rounded-md border border-github-border bg-github-canvas p-4 transition-all hover:-translate-y-0.5 hover:shadow-github-md"
        >
          <span className={`flex h-8 w-8 items-center justify-center rounded-md ${card.bg}`}>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </span>
          <p className="mt-3 text-xl font-semibold text-github-fg">{card.value}</p>
          <p className="text-xs text-github-fg-muted">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
