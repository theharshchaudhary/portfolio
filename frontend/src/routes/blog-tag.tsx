import { Link, data } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import type { Route } from './+types/blog-tag';
import { PageHeader, PostCard } from '@/components/ui';
import { getTag } from '@/lib/content.server';
import { rootData, seo } from '@/lib/seo';
import { breadcrumbs, itemList, ldJson } from '@/lib/schema';

export async function loader({ params }: Route.LoaderArgs) {
  const result = await getTag(params.tag);
  if (!result) throw data(null, { status: 404 });
  return result;
}

export function meta({ matches, loaderData }: Route.MetaArgs) {
  if (!loaderData) return [];
  const { tag, posts } = loaderData;
  const site = rootData(matches)?.site;
  const path = `/blog/tag/${tag.slug}`;
  return [
    ...seo(site, { title: `${tag.name} articles`, description: tag.description ?? `Articles about ${tag.name}.`, path }),
    ...(site
      ? ldJson(
          itemList(site, `${tag.name} articles`, posts.map((p) => ({ name: p.title, path: `/blog/${p.slug}` }))),
          breadcrumbs(site, [{ name: 'Blog', path: '/blog' }, { name: tag.name, path }]),
        )
      : []),
  ];
}

export default function BlogTag({ loaderData }: Route.ComponentProps) {
  const { tag, posts } = loaderData;

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb">
        <Link to="/blog" viewTransition className="inline-flex items-center gap-1 rounded text-sm font-medium text-github-accent hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Blog
        </Link>
      </nav>
      <PageHeader title={`Posts about ${tag.name}`} intro={tag.description}>
        <span className="rounded-full border border-github-border bg-github-subtle px-3 py-1 text-xs font-medium text-github-fg-muted">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </span>
      </PageHeader>
      <div className="space-y-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
