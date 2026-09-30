// Browser-side calls to the Laravel API. In production the site and API share one origin, so the base
// is empty; in development VITE_API_BASE points at `php artisan serve`.
const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE}/api/v1/${path}`;
}

export function trackPageView(path: string, referrer: string): void {
  fetch(apiUrl('views'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ path, referrer: referrer || null }),
    keepalive: true,
  }).catch(() => undefined);
}

export type ContactPayload = {
  name: string;
  email: string;
  subject?: string;
  message: string;
  website?: string;
  turnstileToken?: string;
};

export type ContactResult = { ok: true } | { ok: false; message: string; errors: Record<string, string[]> };

export async function sendContact(payload: ContactPayload): Promise<ContactResult> {
  try {
    const res = await fetch(apiUrl('contact'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true };
    if (res.status === 429) return { ok: false, message: 'Too many messages. Please try again later.', errors: {} };
    const body = await res.json().catch(() => ({}));
    return { ok: false, message: body.message ?? 'Something went wrong.', errors: body.errors ?? {} };
  } catch {
    return { ok: false, message: 'Network error. Please check your connection and try again.', errors: {} };
  }
}
