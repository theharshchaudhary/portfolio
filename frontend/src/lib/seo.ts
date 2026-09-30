import type { MetaDescriptor } from 'react-router';
import type { Seo, SiteData } from '@/types';

interface SeoInput {
  title?: string | null;
  description?: string | null;
  path: string;
  image?: string | null;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  /** Admin-entered overrides; each non-empty field wins over the generated value. */
  overrides?: Seo | null;
}

export function absoluteUrl(site: SiteData, path: string): string {
  return new URL(path, site.settings.url).toString();
}

/** Where the post-build step writes each page's generated social image (scripts/postbuild.ts). */
export function ogImagePath(path: string): string {
  const clean = path.replace(/\/+$/, '');
  return `/og${clean === '' ? '/index' : clean}.png`;
}

/** Builds the full set of title, description, canonical, Open Graph and Twitter tags for a page. */
export function seo(site: SiteData | undefined, input: SeoInput): MetaDescriptor[] {
  if (!site) return [{ title: input.title ?? '' }];
  const { settings } = site;
  const rawTitle = input.overrides?.title || input.title;
  const title = rawTitle ? settings.titleTemplate.replace('%s', rawTitle) : settings.defaultTitle;
  const description = input.overrides?.description || input.description || settings.description;
  const url = absoluteUrl(site, input.path);
  // Admin override → explicit image → auto-generated card. (noindex pages keep the site default.)
  const image = input.overrides?.ogImage || input.image || (input.noindex ? settings.defaultOgImage : ogImagePath(input.path));

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
    if (image === ogImagePath(input.path)) {
      tags.push(
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: title },
      );
    }
  }
  tags.push({ name: 'author', content: site.profile.name });
  if (input.noindex) tags.push({ name: 'robots', content: 'noindex, follow' });
  return tags;
}

/** Root loader data, available to every route's `meta` via `matches`. */
export function rootData(matches: ReadonlyArray<{ id: string; loaderData?: unknown } | undefined>) {
  return matches.find((m) => m?.id === 'root')?.loaderData as { site: SiteData } | undefined;
}
