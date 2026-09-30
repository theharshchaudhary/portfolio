import type { MetaDescriptor } from 'react-router';
import type { SiteData } from '@/types';

interface SeoInput {
  title?: string;
  description?: string;
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
}

export function absoluteUrl(site: SiteData, path: string): string {
  return new URL(path, site.settings.url).toString();
}

/** Builds the full set of title, description, canonical, Open Graph and Twitter tags for a page. */
export function seo(site: SiteData | undefined, input: SeoInput): MetaDescriptor[] {
  if (!site) return [{ title: input.title ?? '' }];
  const { settings } = site;
  const title = input.title
    ? settings.titleTemplate.replace('%s', input.title)
    : settings.defaultTitle;
  const description = input.description ?? settings.description;
  const url = absoluteUrl(site, input.path);
  const image = input.image ?? settings.defaultOgImage;

  const tags: MetaDescriptor[] = [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:site_name', content: settings.siteName },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: input.type ?? 'website' },
    { property: 'og:url', content: url },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ];
  if (image) {
    const imageUrl = absoluteUrl(site, image);
    tags.push({ property: 'og:image', content: imageUrl }, { name: 'twitter:image', content: imageUrl });
  }
  if (input.noindex) tags.push({ name: 'robots', content: 'noindex, follow' });
  return tags;
}

/** Root loader data, available to every route's `meta` via `matches`. */
export function rootData(matches: ReadonlyArray<{ id: string; loaderData?: unknown } | undefined>) {
  return matches.find((m) => m?.id === 'root')?.loaderData as { site: SiteData } | undefined;
}
