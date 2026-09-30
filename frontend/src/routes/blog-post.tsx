import { Link, data } from 'react-router';
import { ArrowLeft, Clock } from 'lucide-react';
import type { Route } from './+types/blog-post';
import { getPost } from '@/lib/content.server';
import { formatDate } from '@/lib/format';
import { rootData, seo } from '@/lib/seo';

export async function loader({ params }: Route.LoaderArgs) {
  const post = await getPost(params.slug);
  if (!post) throw data(null, { status: 404 });
  return { post };
}

export function meta({ matches, loaderData }: Route.MetaArgs) {
  if (!loaderData) return [];
  const { post } = loaderData;
  return seo(rootData(matches)?.site, {
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: 'article',
  });
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;
  return (
    <article className="max-w-3xl animate-fade-in">
      <Link
        to="/blog"
        className="mb-4 inline-flex items-center gap-1 rounded text-sm font-medium text-github-accent hover:underline focus:outline-none focus:ring-2 focus:ring-github-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        All posts
      </Link>
      <div className="rounded-md border border-github-border bg-github-canvas p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-github-fg">{post.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-github-fg-muted">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime} min read
          </span>
          <span>·</span>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-github-border bg-github-subtle px-2 py-0.5 text-xs text-github-fg-muted"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-4 text-base font-medium text-github-fg">{post.excerpt}</p>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-github-fg-muted">
          <p>{post.content}</p>
        </div>
      </div>
    </article>
  );
}
