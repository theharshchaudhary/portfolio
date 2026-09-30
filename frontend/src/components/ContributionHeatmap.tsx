import { useState, useMemo, useRef } from 'react';
import type { ContributionDay } from '@/types';

const LEVEL_COLORS: Record<number, string> = {
  0: '#ebedf0',
  1: '#9be9a8',
  2: '#40c463',
  3: '#30a14e',
  4: '#216e39',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Mon', 'Wed', 'Fri'];

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  text: string;
}

export function ContributionHeatmap({ data }: { data: ContributionDay[] }) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    text: '',
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const { weeks, monthLabels } = useMemo(() => {
    const weeks: ContributionDay[][] = [];
    for (let i = 0; i < data.length; i += 7) {
      weeks.push(data.slice(i, i + 7));
    }

    const monthLabels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      if (week.length > 0) {
        const firstDay = new Date(week[0].date);
        const month = firstDay.getUTCMonth();
        if (month !== lastMonth) {
          // Like GitHub: drop a leading partial month whose label would collide with the next one.
          const prev = monthLabels[monthLabels.length - 1];
          if (prev && col - prev.col < 3) monthLabels.pop();
          monthLabels.push({ col, label: MONTH_NAMES[month] });
          lastMonth = month;
        }
      }
    });

    return { weeks, monthLabels };
  }, [data]);

  const handleMouseEnter = (day: ContributionDay, e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
      text: formatTooltip(day),
    });
  };

  const handleMouseMove = (day: ContributionDay, e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip((prev) => ({
      ...prev,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
      text: formatTooltip(day),
    }));
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const cellSize = 11;
  const gap = 3;
  const colWidth = cellSize + gap;

  return (
    <div className="rounded-md border border-github-border bg-github-canvas p-4 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-github-fg">
        {total.toLocaleString('en-US')} contributions in the last year
      </h2>

      <div className="overflow-x-auto scrollbar-thin" ref={containerRef}>
        <div
          className="relative inline-block min-w-full"
          style={{ minWidth: '700px' }}
          role="img"
          aria-label={`Contribution graph: ${total} contributions in the last year`}
        >
          {tooltip.visible && (
            <div
              className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-github-border bg-github-canvas px-2.5 py-1.5 text-xs shadow-github-md animate-fade-in"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translate(-50%, -100%)',
              }}
            >
              {tooltip.text}
            </div>
          )}

          <div className="flex">
            <div className="mr-1 flex flex-col gap-[3px] pt-[22px]" style={{ width: '28px' }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="text-xxs text-github-fg-subtle"
                  style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }}
                >
                  {i % 2 === 0 ? DAY_LABELS[Math.floor(i / 2)] : ''}
                </div>
              ))}
            </div>

            <div className="flex-1">
              <div className="relative flex" style={{ height: '22px' }}>
                {monthLabels.map((ml, i) => (
                  <div
                    key={i}
                    className="absolute text-xs text-github-fg-muted"
                    style={{ left: `${ml.col * colWidth}px` }}
                  >
                    {ml.label}
                  </div>
                ))}
              </div>

              <div className="flex gap-[3px]">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3px]">
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      const day = week[dayIdx];
                      if (!day) {
                        return (
                          <div
                            key={dayIdx}
                            style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                          />
                        );
                      }
                      return (
                        <div
                          key={dayIdx}
                          className={`heat-cell l${day.level}`}
                          style={{ ['--w' as string]: weekIdx }}
                          onMouseEnter={(e) => handleMouseEnter(day, e)}
                          onMouseMove={(e) => handleMouseMove(day, e)}
                          onMouseLeave={handleMouseLeave}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 text-xs text-github-fg-muted">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="rounded-[2px]"
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  backgroundColor: LEVEL_COLORS[level],
                }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTooltip(day: ContributionDay): string {
  const date = new Date(day.date);
  const formatted = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  if (day.count === 0) return `No contributions on ${formatted}`;
  return `${day.count} contribution${day.count > 1 ? 's' : ''} on ${formatted}`;
}
