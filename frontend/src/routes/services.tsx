import { Link } from 'react-router';
import { ArrowRight, Check, Quote, Wrench } from 'lucide-react';
import type { Route } from './+types/services';
import { Icon } from '@/components/icons';
import { EmptyState, Faqs, PageHeader } from '@/components/ui';
import { getServices } from '@/lib/content.server';
import { rootData, seo } from '@/lib/seo';
import { breadcrumbs, faqPage, ldJson, services as serviceSchema } from '@/lib/schema';
import type { Service } from '@/types';

export async function loader() {
  return getServices();
}

export function meta({ matches, loaderData }: Route.MetaArgs) {
  const site = rootData(matches)?.site;
  return [
    ...seo(site, {
      title: loaderData?.page.heading ?? 'Services',
      description: loaderData?.page.intro ?? (site ? `Hire ${site.profile.name} for web development.` : undefined),
      path: '/services',
      overrides: loaderData?.page.seo,
    }),
    ...(site && loaderData
      ? ldJson(...serviceSchema(site, loaderData.services), faqPage(loaderData.faqs), breadcrumbs(site, [{ name: 'Services', path: '/services' }]))
      : []),
  ];
}

function formatPrice(price: NonNullable<Service['price']>) {
  const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: price.currency, maximumFractionDigits: 0 }).format(price.amount);
  return { prefix: price.prefix, amount, unit: price.unit };
}

export default function Services({ loaderData }: Route.ComponentProps) {
  const { page, services, faqs, testimonials } = loaderData;

  return (
    <div className="space-y-8">
      <PageHeader title={page.heading ?? 'Services'} intro={page.intro} />

      {services.length === 0 ? (
        <EmptyState icon={Wrench}>Service details are coming soon. <Link to="/contact" viewTransition className="text-github-accent underline underline-offset-2">Get in touch</Link> in the meantime.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => {
            const price = service.price && formatPrice(service.price);
            return (
              <section key={service.slug} id={service.slug} className="flex scroll-mt-20 flex-col rounded-lg border border-github-border bg-github-canvas p-5 transition-shadow hover:shadow-github-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50">
                  <Icon name={service.icon} className="h-5 w-5 text-github-accent" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-github-fg">{service.title}</h2>
                <p className="mt-1 text-sm text-github-fg-muted">{service.summary}</p>
                {service.description && (
                  <div className="prose prose-sm mt-3 max-w-none text-github-fg-muted" dangerouslySetInnerHTML={{ __html: service.description }} />
                )}
                {service.deliverables.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {service.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-github-fg-muted">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-github-success-fg" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex-1" />
                <div className="mt-5 flex items-end justify-between gap-3 border-t border-github-border pt-4">
                  {price ? (
                    <p className="text-github-fg">
                      {price.prefix && <span className="text-xs text-github-fg-muted">{price.prefix} </span>}
                      <span className="text-2xl font-bold">{price.amount}</span>
                      {price.unit && <span className="text-xs text-github-fg-muted"> {price.unit}</span>}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-github-fg-muted">Custom quote</p>
                  )}
                  <Link
                    to={`/contact?service=${encodeURIComponent(service.title)}`}
                    className="inline-flex items-center gap-1 rounded-md bg-github-success-emphasis px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-github-success-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent focus-visible:ring-offset-2"
                  >
                    {price ? 'Get started' : 'Request a quote'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {testimonials.length > 0 && (
        <section aria-labelledby="testimonials-heading">
          <h2 id="testimonials-heading" className="mb-3 text-base font-semibold text-github-fg">What clients say</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {testimonials.map((t) => (
              <figure key={t.name + t.quote.slice(0, 20)} className="rounded-md border border-github-border bg-github-subtle p-5">
                <Quote className="h-5 w-5 text-github-fg-subtle" />
                <blockquote className="mt-2 text-sm text-github-fg">{t.quote}</blockquote>
                <figcaption className="mt-3 flex items-center gap-2 text-xs text-github-fg-muted">
                  {t.photo && <img src={t.photo} alt="" className="h-7 w-7 rounded-full object-cover" loading="lazy" />}
                  <span>
                    <strong className="text-github-fg">{t.name}</strong>
                    {[t.role, t.company].filter(Boolean).length > 0 && `, ${[t.role, t.company].filter(Boolean).join(', ')}`}
                    {t.project && (
                      <> · <Link to={`/projects/${t.project.slug}`} viewTransition className="text-github-accent underline underline-offset-2">{t.project.title}</Link></>
                    )}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <Faqs faqs={faqs} />
    </div>
  );
}
