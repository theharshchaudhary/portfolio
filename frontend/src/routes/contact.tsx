import { useEffect, useState } from 'react';
import { useRouteLoaderData, useSearchParams } from 'react-router';
import { CheckCircle2, Loader2, Mail, MapPin, Send } from 'lucide-react';
import type { Route } from './+types/contact';
import { PlatformIcon } from '@/components/icons';
import { Faqs, PageHeader } from '@/components/ui';
import { useTurnstile } from '@/hooks/useTurnstile';
import { sendContact } from '@/lib/api';
import { getContact } from '@/lib/content.server';
import { rootData, seo } from '@/lib/seo';
import type { loader as rootLoader } from '@/root';

export async function loader() {
  return getContact();
}

export function meta({ matches, loaderData }: Route.MetaArgs) {
  const site = rootData(matches)?.site;
  return seo(site, {
    title: loaderData?.page.heading ?? 'Contact',
    description: loaderData?.page.intro ?? (site ? `Get in touch with ${site.profile.name} for freelance work, collaboration or questions.` : undefined),
    path: '/contact',
    overrides: loaderData?.page.seo,
  });
}

const inputClass =
  'mt-1 w-full rounded-md border border-github-border bg-github-canvas px-3 py-1.5 text-sm text-github-fg transition-colors focus:border-github-accent focus:outline-none focus:ring-1 focus:ring-github-accent aria-[invalid=true]:border-github-danger';

type Status = { state: 'idle' | 'sending' | 'sent' } | { state: 'error'; message: string };

export default function Contact({ loaderData }: Route.ComponentProps) {
  const { page, email, socials, turnstileSiteKey, faqs } = loaderData;
  const { profile } = useRouteLoaderData<typeof rootLoader>('root')!.site;
  const [params] = useSearchParams();
  const service = params.get('service');

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  // Prefilled after hydration: the prerendered HTML has no query string.
  useEffect(() => {
    if (service) setForm((f) => ({ ...f, subject: f.subject || `Enquiry: ${service}` }));
  }, [service]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const turnstile = useTurnstile(turnstileSiteKey);

  const channels = [
    ...(email ? [{ platform: 'email', label: 'Email', value: email, href: `mailto:${email}` }] : []),
    ...socials.map((s) => ({ platform: s.platform, label: s.label, value: s.handle ? `@${s.handle}` : s.url.replace(/^https?:\/\/(www\.)?/, ''), href: s.url })),
  ];

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (turnstile.enabled && !turnstile.token) {
      setStatus({ state: 'error', message: 'Please complete the verification below.' });
      return;
    }
    setStatus({ state: 'sending' });
    setErrors({});
    const result = await sendContact({ ...form, turnstileToken: turnstile.token || undefined });
    if (result.ok) {
      setStatus({ state: 'sent' });
      setForm({ name: '', email: '', subject: '', message: '', website: '' });
    } else {
      setErrors(result.errors);
      setStatus({ state: 'error', message: result.message });
      turnstile.reset();
    }
  };

  const fieldError = (field: string) => errors[field]?.[0];

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={page.heading ?? 'Get in touch'} intro={page.intro} />

      {channels.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((ch) => (
            <li key={ch.href}>
              <a
                href={ch.href}
                target={ch.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer me"
                className="group block rounded-md border border-github-border bg-github-canvas p-4 transition-all hover:-translate-y-0.5 hover:shadow-github-md focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent"
              >
                <PlatformIcon platform={ch.platform} className="h-5 w-5 text-github-fg-muted group-hover:text-github-accent" />
                <p className="mt-2 text-xs text-github-fg-subtle">{ch.label}</p>
                <p className="truncate text-sm font-medium text-github-fg">{ch.value}</p>
              </a>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-md border border-github-border bg-github-canvas p-6" aria-labelledby="form-heading">
        <h2 id="form-heading" className="text-base font-semibold text-github-fg">Send a message</h2>
        {status.state === 'sent' ? (
          <div role="status" className="mt-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-github-success-fg animate-slide-up">
            <CheckCircle2 className="h-5 w-5" />
            Thanks! Your message is on its way. I’ll reply as soon as I can.
          </div>
        ) : (
          <form onSubmit={handleSubmit} onFocus={turnstile.activate} className="mt-4 space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-github-fg">Name</label>
                <input id="name" autoComplete="name" required maxLength={100} value={form.name} onChange={update('name')} aria-invalid={!!fieldError('name')} className={inputClass} />
                {fieldError('name') && <p className="mt-1 text-xs text-github-danger">{fieldError('name')}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-github-fg">Email</label>
                <input id="email" type="email" autoComplete="email" required value={form.email} onChange={update('email')} aria-invalid={!!fieldError('email')} className={inputClass} />
                {fieldError('email') && <p className="mt-1 text-xs text-github-danger">{fieldError('email')}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-github-fg">Subject <span className="font-normal text-github-fg-subtle">(optional)</span></label>
              <input id="subject" maxLength={150} value={form.subject} onChange={update('subject')} className={inputClass} />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-github-fg">Message</label>
              <textarea id="message" rows={6} required minLength={10} maxLength={5000} value={form.message} onChange={update('message')} aria-invalid={!!fieldError('message')} className={`${inputClass} resize-y`} />
              {fieldError('message') && <p className="mt-1 text-xs text-github-danger">{fieldError('message')}</p>}
            </div>
            {/* Honeypot: hidden from people, irresistible to bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="website">Website</label>
              <input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
            </div>
            {turnstile.enabled && <div ref={turnstile.containerRef} />}
            {status.state === 'error' && <p role="alert" className="text-sm text-github-danger">{status.message}</p>}
            <button
              type="submit"
              disabled={status.state === 'sending'}
              className="inline-flex items-center gap-2 rounded-md bg-github-success-emphasis px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-github-success-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {status.state === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {status.state === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </section>

      {(profile.location || profile.openToWork) && (
        <p className="flex items-center gap-2 rounded-md border border-github-border bg-github-subtle p-4 text-sm text-github-fg-muted">
          {profile.location ? <MapPin className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          {profile.location && `Based in ${profile.location}`}
          {profile.location && profile.openToWork && ' · '}
          {profile.openToWork && 'Available for freelance and full-time work'}
        </p>
      )}

      <Faqs faqs={faqs} />
    </div>
  );
}
