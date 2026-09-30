import { useState } from 'react';
import { Check, Coffee, Copy, ExternalLink, Heart, Wallet } from 'lucide-react';
import type { Route } from './+types/support';
import { GithubIcon } from '@/components/icons/brands';
import { EmptyState, Faqs, PageHeader } from '@/components/ui';
import { getSupport } from '@/lib/content.server';
import { rootData, seo } from '@/lib/seo';
import type { SupportMethod } from '@/types';

export async function loader() {
  return getSupport();
}

export function meta({ matches, loaderData }: Route.MetaArgs) {
  return seo(rootData(matches)?.site, {
    title: loaderData?.page.heading ?? 'Support my work',
    description: loaderData?.page.intro ?? 'Sponsor or tip to support open-source projects and free developer tools.',
    path: '/support',
    overrides: loaderData?.page.seo,
  });
}

const TYPE_ICON: Record<SupportMethod['type'], React.ComponentType<{ className?: string }>> = {
  github_sponsors: GithubIcon,
  kofi: Coffee,
  buymeacoffee: Coffee,
  paypal: Wallet,
  crypto: Wallet,
  other: Heart,
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })}
      className="inline-flex items-center gap-1 rounded-md border border-github-border bg-github-subtle px-2 py-1 text-xs font-medium text-github-fg transition-colors hover:bg-github-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-github-success-fg" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy address'}
    </button>
  );
}

export default function Support({ loaderData }: Route.ComponentProps) {
  const { page, methods, faqs } = loaderData;
  const links = methods.filter((m) => !m.crypto);
  const wallets = methods.filter((m) => m.crypto);

  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader title={page.heading ?? 'Support my work'} intro={page.intro} />

      {methods.length === 0 && <EmptyState icon={Heart}>Support options are coming soon.</EmptyState>}

      {links.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((m) => {
            const TypeIcon = TYPE_ICON[m.type];
            return (
              <a
                key={m.label}
                href={m.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-lg border border-github-border bg-github-canvas p-5 transition-all hover:-translate-y-0.5 hover:shadow-github-md focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                  <TypeIcon className="h-5 w-5 text-github-danger" />
                </span>
                <h2 className="mt-3 text-base font-semibold text-github-fg">{m.label}</h2>
                {m.description && <p className="mt-1 text-sm text-github-fg-muted">{m.description}</p>}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-github-accent group-hover:underline">
                  Open <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </a>
            );
          })}
        </div>
      )}

      {wallets.length > 0 && (
        <section aria-labelledby="crypto-heading">
          <h2 id="crypto-heading" className="mb-3 text-base font-semibold text-github-fg">Crypto</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {wallets.map((m) => (
              <div key={m.crypto!.address} className="flex gap-4 rounded-lg border border-github-border bg-github-canvas p-4">
                <div
                  className="h-28 w-28 flex-shrink-0 rounded-md border border-github-border bg-white p-1.5 [&_svg]:h-full [&_svg]:w-full"
                  role="img"
                  aria-label={`QR code for ${m.crypto!.coin} address`}
                  dangerouslySetInnerHTML={{ __html: m.crypto!.qrSvg }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-github-fg">{m.label}</h3>
                  <p className="text-xs text-github-fg-muted">{m.crypto!.coin} · {m.crypto!.network} network</p>
                  <code className="mt-2 block break-all rounded bg-github-subtle px-2 py-1 font-mono text-xs text-github-fg">{m.crypto!.address}</code>
                  <div className="mt-2"><CopyButton value={m.crypto!.address} /></div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-github-fg-subtle">Only send the listed coin on the listed network. Crypto payments can’t be reversed.</p>
        </section>
      )}

      <Faqs faqs={faqs} />
    </div>
  );
}
