// schema.org JSON-LD builders. Rendered into each page's <head> via `meta` ({ 'script:ld+json': … }).
import type { MetaDescriptor } from 'react-router';
import type { Faq, Post, Project, Service, SiteData } from '@/types';
import { absoluteUrl } from './seo';

type Thing = Record<string, unknown>;

export function ldJson(...items: (Thing | null | undefined | false)[]): MetaDescriptor[] {
  return items.filter(Boolean).map((item) => ({ 'script:ld+json': { '@context': 'https://schema.org', ...(item as Thing) } }));
}

const personId = (site: SiteData) => `${absoluteUrl(site, '/')}#person`;
const websiteId = (site: SiteData) => `${absoluteUrl(site, '/')}#website`;

/** The site owner. Referenced by @id from every other entity so Google links them together. */
export function person(site: SiteData): Thing {
  const { profile, socials } = site;
  return {
    '@type': 'Person',
    '@id': personId(site),
    name: profile.name,
    url: absoluteUrl(site, '/'),
    ...(profile.avatar && { image: profile.avatar }),
    ...(profile.headline && { jobTitle: profile.headline }),
    ...(profile.shortBio && { description: profile.shortBio }),
    ...(profile.company && { worksFor: { '@type': 'Organization', name: profile.company } }),
    ...(profile.location && { address: { '@type': 'PostalAddress', addressLocality: profile.location } }),
    ...(site.settings.contactEmail && { email: `mailto:${site.settings.contactEmail}` }),
    sameAs: socials.filter((s) => s.url.startsWith('http')).map((s) => s.url),
  };
}

export function website(site: SiteData): Thing {
  return {
    '@type': 'WebSite',
    '@id': websiteId(site),
    name: site.settings.siteName,
    url: absoluteUrl(site, '/'),
    description: site.settings.description,
    inLanguage: 'en',
    publisher: { '@id': personId(site) },
  };
}

export function breadcrumbs(site: SiteData, trail: { name: string; path: string }[]): Thing {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(site, crumb.path),
    })),
  };
}

export function profilePage(site: SiteData): Thing {
  return {
    '@type': 'ProfilePage',
    url: absoluteUrl(site, '/about'),
    mainEntity: person(site),
    isPartOf: { '@id': websiteId(site) },
  };
}

export function blogPosting(site: SiteData, post: Omit<Post, 'body'>, image: string): Thing {
  const url = absoluteUrl(site, `/blog/${post.slug}`);
  return {
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: url,
    image: absoluteUrl(site, image),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@id': personId(site), '@type': 'Person', name: site.profile.name, url: absoluteUrl(site, '/about') },
    publisher: { '@id': personId(site) },
    keywords: post.tags.map((t) => t.name).join(', '),
    timeRequired: `PT${post.readingTime}M`,
    inLanguage: 'en',
    isPartOf: { '@type': 'Blog', '@id': `${absoluteUrl(site, '/blog')}#blog` },
  };
}

export function blog(site: SiteData, posts: Omit<Post, 'body'>[]): Thing {
  return {
    '@type': 'Blog',
    '@id': `${absoluteUrl(site, '/blog')}#blog`,
    name: `${site.profile.name}'s blog`,
    url: absoluteUrl(site, '/blog'),
    author: { '@id': personId(site) },
    blogPost: posts.slice(0, 20).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: absoluteUrl(site, `/blog/${p.slug}`),
      datePublished: p.publishedAt,
    })),
  };
}

export function projectEntity(site: SiteData, project: Omit<Project, 'body'>, image: string): Thing {
  const url = absoluteUrl(site, `/projects/${project.slug}`);
  const base = {
    name: project.title,
    description: project.summary,
    url,
    image: absoluteUrl(site, project.coverImage ?? image),
    author: { '@id': personId(site) },
    dateModified: project.updatedAt,
    ...(project.startedAt && { dateCreated: project.startedAt }),
    keywords: project.tech.join(', '),
  };
  // Open-source work with a repo is SoftwareSourceCode; everything else a CreativeWork case study.
  return project.repoUrl
    ? { '@type': 'SoftwareSourceCode', ...base, codeRepository: project.repoUrl, ...(project.language && { programmingLanguage: project.language }) }
    : { '@type': 'CreativeWork', ...base, ...(project.liveUrl && { sameAs: project.liveUrl }) };
}

export function itemList(site: SiteData, name: string, items: { name: string; path: string }[]): Thing {
  return {
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, url: absoluteUrl(site, item.path) })),
  };
}

export function services(site: SiteData, list: Service[]): Thing[] {
  return list.map((s) => ({
    '@type': 'Service',
    name: s.title,
    description: s.summary,
    url: `${absoluteUrl(site, '/services')}#${s.slug}`,
    provider: { '@id': personId(site) },
    ...(site.profile.location && { areaServed: [site.profile.location, 'Worldwide'] }),
    ...(s.price && {
      offers: {
        '@type': 'Offer',
        priceCurrency: s.price.currency,
        price: s.price.amount,
        ...(s.price.unit && { description: [s.price.prefix, s.price.unit].filter(Boolean).join(' ') }),
      },
    }),
  }));
}

export function faqPage(faqs: Faq[]): Thing | null {
  if (!faqs.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  };
}
