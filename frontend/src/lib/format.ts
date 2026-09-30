// Dates are formatted in UTC so prerendered HTML matches what the browser hydrates.
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatMonthYear(iso: string, month: 'short' | 'long' = 'short'): string {
  return new Date(iso).toLocaleDateString('en-US', { month, year: 'numeric', timeZone: 'UTC' });
}

// Relative to `now`, which callers pass from build-time data so output is stable.
export function formatRelativeTime(iso: string, now: string): string {
  const diff = new Date(now).getTime() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(iso);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}
