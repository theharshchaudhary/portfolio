export function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-github-subtle ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ height = 'h-32' }: { height?: string }) {
  return (
    <div
      className={`rounded-md border border-github-border bg-github-canvas p-4 ${height}`}
      aria-hidden="true"
    >
      <div className="flex items-start gap-3">
        <SkeletonBlock className="h-4 w-4 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonSidebar() {
  return (
    <div className="flex flex-col items-center text-center" aria-hidden="true">
      <SkeletonBlock className="h-full w-full max-w-[260px] rounded-full aspect-square" />
      <SkeletonBlock className="mt-4 h-6 w-48" />
      <SkeletonBlock className="mt-2 h-4 w-32" />
      <div className="mt-4 w-full space-y-2">
        <SkeletonText lines={3} />
      </div>
      <div className="mt-4 flex w-full justify-center gap-3">
        <SkeletonBlock className="h-8 w-16" />
        <SkeletonBlock className="h-8 w-16" />
      </div>
      <div className="mt-4 w-full space-y-2">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-3/4" />
        <SkeletonBlock className="h-3 w-5/6" />
      </div>
    </div>
  );
}
