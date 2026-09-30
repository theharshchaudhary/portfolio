import { Link, data } from 'react-router';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import type { Route } from './+types/blog-post';
import { PostCard, Prose } from '@/components/ui';
import { getPost } from '@/lib/content.server';
import { formatDate } from '@/lib/format';
import { rootData, seo } from '@/lib/seo';

export async function loader({ params }: Route.LoaderArgs) {
  const result = await getPost(params.slug);
  if (!result) throw data(null, { status: 404 });
  return result;
}

export function meta({ matches, loaderData }: Route.MetaArgs) {
  if (!loaderData) return [];
  const { post } = loaderData;
  return [
    ...seo(rootData(matches)?.site, {
      title: post.title,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      image: post.coverImage,
      type: 'article',
      overrides: post.seo,
    }),
    { property: 'article:published_time', content: post.publishedAt },
    { property: 'article:modified_time', content: post.updatedAt },
    ...post.tags.map((t) => ({ property: 'article:tag', content: t.name })),
  ];
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post, body, newer, older, related } = loaderData;

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb">
        <Link to="/blog" viewTransition className="inline-flex items-center gap-1 rounded text-sm font-medium text-github-accent hover:underline">
          <ArrowLeft className="h-4 w-4" />
          All posts
        </Link>
      </nav>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_200px]">
        <article className="min-w-0">
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-github-fg sm:text-4xl">{post.title}</h1>
            <p className="mt-3 text-lg text-github-fg-muted">{post.excerpt}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-github-fg-muted">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime} min read
              </span>
              <span className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    to={`/blog/tag/${tag.slug}`}
                    className="rounded-full border border-github-border bg-github-subtle px-2 py-0.5 text-xs transition-colors hover:border-github-accent hover:text-github-accent"
                  >
                    {tag.name}
                  </Link>
                ))}
              </span>
            </div>
          </header>

          {post.coverImage && (
            <img src={post.coverImage} alt="" className="mt-6 w-full rounded-lg border border-github-border object-cover" fetchPriority="high" />
          )}

          <Prose html={body.html} className="mt-8" />

          {(newer || older) && (
            <nav aria-label="More posts" className="mt-10 grid gap-3 border-t border-github-border pt-6 sm:grid-cols-2">
              {older ? (
                <Link to={`/blog/${older.slug}`} viewTransition className="group rounded-md border border-github-border p-4 transition-colors hover:border-github-accent">
                  <span className="flex items-center gap-1 text-xs text-github-fg-subtle"><ArrowLeft className="h-3 w-3" /> Older</span>
                  <span className="mt-1 block text-sm font-medium text-github-fg group-hover:text-github-accent">{older.title}</span>
                </Link>
              ) : <span />}
              {newer && (
                <Link to={`/blog/${newer.slug}`} viewTransition className="group rounded-md border border-github-border p-4 text-right transition-colors hover:border-github-accent">
                  <span className="flex items-center justify-end gap-1 text-xs text-github-fg-subtle">Newer <ArrowRight className="h-3 w-3" /></span>
                  <span className="mt-1 block text-sm font-medium text-github-fg group-hover:text-github-accent">{newer.title}</span>
                </Link>
              )}
            </nav>
          )}
        </article>

        {body.toc.length > 1 && (
          <aside className="hidden xl:block">
            <nav aria-label="On this page" className="sticky top-20">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-github-fg-subtle">On this page</h2>
              <ul className="space-y-1.5 border-l border-github-border text-sm">
                {body.toc.map((item) => (
                  <li key={item.id} className={item.depth === 3 ? 'pl-6' : 'pl-3'}>
                    <a href={`#${item.id}`} className="text-github-fg-muted transition-colors hover:text-github-accent">{item.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-github-fg">Related posts</h2>
          <div className="space-y-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
