function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

/** Profile photo from the admin panel, or a gradient with initials until one is uploaded. */
export function Avatar({ name, src, size, className = '' }: { name: string; src: string | null; size: number; className?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full border border-github-border-muted object-cover ${className}`}
        fetchPriority="high"
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={name}
      className={`flex items-center justify-center rounded-full border border-github-border-muted bg-gradient-to-br from-github-accent to-github-success-fg font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </div>
  );
}
