import { lazy, Suspense, useCallback, useEffect, useState } from 'react';

const HeroParticles = lazy(() => import('./HeroParticles'));

/** Particles are a progressive enhancement: skipped for reduced motion, data saver and low-end devices. */
function canAnimate(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency ?? 4) < 4 || (nav.deviceMemory ?? 4) < 2) return false;
  return true;
}

/**
 * Decorative banner. The prerendered HTML shows a static gradient version of the text (no layout
 * shift, nothing blocking LCP); once the page is idle the particle canvas loads and takes over.
 */
export function HeroBanner({ text, imageUrl }: { text: string; imageUrl?: string | null }) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (!canAnimate()) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => setEnabled(true), { timeout: 2000 });
    return () => cancel(handle);
  }, []);

  return (
    <div
      className="relative h-36 overflow-hidden rounded-t-lg border-b border-github-border bg-[radial-gradient(ellipse_at_top,_#f6f8fa,_#ffffff)] sm:h-48"
      style={{ containerType: 'inline-size' }}
      aria-hidden="true"
    >
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* Same sizing rule as the canvas: fit ~92% of the width, capped by the banner height. */}
        <span
          className="hero-static-text select-none whitespace-nowrap font-extrabold leading-none"
          style={{ fontSize: `min(5.5rem, calc(92cqw / ${Math.max(text.length * 0.56, 1).toFixed(2)}))` }}
        >
          {text}
        </span>
      </div>
      {enabled && (
        <Suspense fallback={null}>
          <HeroParticles text={text} imageUrl={imageUrl} onReady={onReady} />
        </Suspense>
      )}
      {ready && (
        <p className="pointer-events-none absolute bottom-2 right-3 text-xxs text-github-fg-subtle animate-fade-in">
          {window.matchMedia('(hover: hover)').matches ? 'Move your cursor · click to scatter' : 'Tap to scatter'}
        </p>
      )}
    </div>
  );
}
