import { Link } from 'react-router';
import { Rss } from 'lucide-react';
import type { Route } from './+types/blog';
import { EmptyState, PageHeader, PostCard } from '@/components/ui';
import { getPosts } from '@/lib/content.server';
import { rootData, seo } from '@/lib/seo';

export async function loader() {
  return getPosts();
}

export function meta({ matches, loaderData }: Route.MetaArgs) {
  return seo(rootData(matches)?.site, {
    title: loaderData?.page.heading ?? 'Blog',
    description: loaderData?.page.intro,
    path: '/blog',
    overrides: loaderData?.page.seo,
  });
}

export default function Blog({ loaderData }: Route.ComponentProps) {
  const { page, posts, tags } = loaderData;

  return (
    <div className="space-y-6">
      <PageHeader title={page.heading ?? 'Blog'} intro={page.intro}>
        <span className="rounded-full border border-github-border bg-github-subtle px-3 py-1 text-xs font-medium text-github-fg-muted">
          {posts.length} posts
        </span>
      </PageHeader>

      {tags.length > 0 && (
        <nav aria-label="Topics" className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              to={`/blog/tag/${tag.slug}`}
              prefetch="intent" viewTransition
              className="rounded-full border border-github-border bg-github-canvas px-3 py-1 text-xs font-medium text-github-fg-muted transition-colors hover:border-github-accent hover:text-github-accent"
            >
              {tag.name} <span className="text-github-fg-subtle">{tag.count}</span>
            </Link>
          ))}
        </nav>
      )}

      {posts.length === 0 ? (
        <EmptyState icon={Rss}>No posts yet. Check back soon.</EmptyState>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
