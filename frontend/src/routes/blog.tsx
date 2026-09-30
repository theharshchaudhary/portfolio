import { Link } from 'react-router';
import { Rss, Clock, ArrowRight } from 'lucide-react';
import type { Route } from './+types/blog';
import { getPosts } from '@/lib/content.server';
import { formatDate } from '@/lib/format';
import { rootData, seo } from '@/lib/seo';

export async function loader() {
  return { posts: await getPosts() };
}

export function meta({ matches }: Route.MetaArgs) {
  return seo(rootData(matches)?.site, {
    title: 'Blog',
    description: 'Articles on web development, architecture, Laravel, React and the craft of building software.',
    path: '/blog',
  });
}

export default function Blog({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold text-github-fg">
            <Rss className="h-5 w-5 text-github-fg-muted" />
            Blog
          </h1>
          <p className="mt-1 text-sm text-github-fg-muted">
            Long-form articles on architecture, tools, and the craft of building software.
          </p>
        </div>
        <span className="hidden rounded-full border border-github-border bg-github-subtle px-3 py-1 text-xs font-medium text-github-fg-muted sm:inline-flex">
          {posts.length} posts
        </span>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-md border border-dashed border-github-border py-16 text-center">
          <Rss className="mx-auto h-8 w-8 text-github-fg-subtle" />
          <p className="mt-3 text-sm text-github-fg-muted">No blog posts yet. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              prefetch="intent"
              className="group block w-full rounded-md border border-github-border bg-github-canvas p-5 text-left transition-all hover:border-github-border-muted hover:shadow-github-sm focus:outline-none focus:ring-2 focus:ring-github-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-github-fg group-hover:text-github-accent">
                  {post.title}
                </h2>
                <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-github-fg-subtle transition-transform group-hover:translate-x-1 group-hover:text-github-accent" />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-github-fg-muted">{post.excerpt}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-github-border bg-github-subtle px-2 py-0.5 text-xs text-github-fg-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="ml-auto flex items-center gap-1 text-xs text-github-fg-subtle">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readingTime} min · {formatDate(post.publishedAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
