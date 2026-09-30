import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile failed to load'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Cloudflare Turnstile, loaded only once the visitor starts filling in the form so it
 * costs nothing on page load. Disabled (token stays empty) when no site key is configured.
 */
export function useTurnstile(siteKey: string | null) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState('');
  const [active, setActive] = useState(false);

  const activate = useCallback(() => setActive(true), []);

  useEffect(() => {
    if (!siteKey || !active || widgetId.current) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (t: string) => setToken(t),
          'expired-callback': () => setToken(''),
          'error-callback': () => setToken(''),
          appearance: 'interaction-only',
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [siteKey, active]);

  useEffect(
    () => () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
    },
    [],
  );

  const reset = useCallback(() => {
    setToken('');
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, []);

  return { containerRef, token, activate, reset, enabled: Boolean(siteKey) };
}
