import { useEffect, useState } from 'react';
import { Rss, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { fetchBlogPosts } from '@/services/api';
import type { BlogPost } from '@/types';
import { formatDate } from '@/hooks/useRouter';

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchBlogPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} height="h-32" />
        ))}
      </div>
    );
  }

  if (selected) {
    return (
      <article className="animate-fade-in max-w-3xl">
        <button
          onClick={() => setSelected(null)}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-github-accent hover:underline focus:outline-none focus:ring-2 focus:ring-github-accent rounded"
        >
          <ArrowLeft className="h-4 w-4" />
          All posts
        </button>
        <div className="rounded-md border border-github-border bg-github-canvas p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-github-fg">{selected.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-github-fg-muted">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {selected.readingTime} min read
            </span>
            <span>·</span>
            <span>{formatDate(selected.publishedAt)}</span>
          </div>
          <p className="mt-4 text-base font-medium text-github-fg">{selected.excerpt}</p>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-github-fg-muted">
            <p>{selected.content}</p>
            <p>The full article is being written. Subscribe to get notified when it is published.</p>
          </div>
        </div>
      </article>
    );
  }

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
            <button
              key={post.id}
              onClick={() => setSelected(post)}
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
