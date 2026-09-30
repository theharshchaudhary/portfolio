import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * One-shot fade-in for `.reveal` elements. Content is visible by default (no JS, crawlers, LCP);
 * after each navigation, only elements still below the fold are hidden, and each animates in the
 * first time it enters the viewport. Unlike scroll-linked animation it always completes.
 */
export function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pending = [...document.querySelectorAll<HTMLElement>('.reveal:not(.reveal-done)')].filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight,
    );
    if (!pending.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer.unobserve(el);
          el.classList.replace('reveal-pending', 'reveal-in');
          el.addEventListener('animationend', () => el.classList.replace('reveal-in', 'reveal-done'), { once: true });
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    for (const el of pending) {
      el.classList.add('reveal-pending');
      observer.observe(el);
    }
    return () => {
      observer.disconnect();
      // Never leave anything hidden if the page changes mid-way.
      for (const el of pending) el.classList.remove('reveal-pending');
    };
  }, [pathname]);
}
