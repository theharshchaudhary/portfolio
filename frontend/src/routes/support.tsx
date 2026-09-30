import { Heart, Check, ExternalLink, Coffee, Sparkles } from 'lucide-react';
import type { Route } from './+types/support';
import { getSupport } from '@/lib/content.server';
import { rootData, seo } from '@/lib/seo';

export async function loader() {
  return getSupport();
}

export function meta({ matches }: Route.MetaArgs) {
  return seo(rootData(matches)?.site, {
    title: 'Support my work',
    description: 'Sponsor or tip to support open-source projects and free developer tools.',
    path: '/support',
  });
}

export default function Support({ loaderData }: Route.ComponentProps) {
  const { tiers } = loaderData;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-github-fg">
          <Heart className="h-5 w-5 text-github-danger" />
          Support / Sponsor
        </h1>
        <p className="mt-1 text-sm text-github-fg-muted">
          If my open-source work has helped you, consider becoming a sponsor. Every contribution
          helps me maintain projects and build new tools for the community.
        </p>
      </div>

      <div className="rounded-md border border-github-border bg-gradient-to-br from-github-subtle to-github-canvas p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <Coffee className="h-6 w-6 text-github-danger" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-github-fg">Why sponsor?</h2>
            <p className="mt-1 text-sm text-github-fg-muted">
              I maintain several open-source projects with thousands of monthly downloads. Sponsorship
              helps cover infrastructure costs and lets me dedicate more time to building and
              maintaining free tools for developers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {tiers.map((tier, idx) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-lg border bg-github-canvas p-5 transition-all hover:shadow-github-md ${
              idx === 1
                ? 'border-github-accent ring-1 ring-github-accent/20'
                : 'border-github-border'
            }`}
          >
            {idx === 1 && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-github-accent px-3 py-0.5 text-xs font-semibold text-white">
                Popular
              </span>
            )}
            <div className="flex items-center gap-2">
              {idx === 0 && <Coffee className="h-5 w-5 text-github-fg-muted" />}
              {idx === 1 && <Sparkles className="h-5 w-5 text-github-accent" />}
              {idx === 2 && <Heart className="h-5 w-5 text-github-danger" />}
              <h3 className="text-base font-semibold text-github-fg">{tier.name}</h3>
            </div>
            <p className="mt-2 text-2xl font-bold text-github-fg">{tier.amount}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {tier.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm text-github-fg-muted">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-github-success-fg" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <a
              href={tier.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-5 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent focus:ring-offset-2 ${
                idx === 1
                  ? 'bg-github-accent text-white hover:bg-github-accent/90'
                  : 'border border-github-border bg-github-subtle text-github-fg hover:bg-github-inset'
              }`}
            >
              Sponsor me
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-github-border bg-github-subtle p-4 text-center text-sm text-github-fg-muted">
        Prefer a one-time contribution? You can also{' '}
        <a
          href="https://github.com/sponsors/theharshchaudhary"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-github-accent hover:underline"
        >
          buy me a coffee
        </a>
        .
      </div>
    </div>
  );
}
