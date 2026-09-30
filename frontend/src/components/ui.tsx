import { Link } from 'react-router';
import { ChevronDown, Clock } from 'lucide-react';
import type { Faq, Post } from '@/types';
import { formatDate } from '@/lib/format';

export function PageHeader({ title, intro, children }: { title: string; intro?: string | null; children?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-github-fg">{title}</h1>
        {intro && <p className="mt-1 max-w-2xl text-sm text-github-fg-muted">{intro}</p>}
      </div>
      {children}
    </header>
  );
}

/** Build-time rendered markdown. The HTML comes from our own admin-authored content. */
export function Prose({ html, className = '' }: { html: string; className?: string }) {
  return (
    <div
      className={`prose prose-sm max-w-none prose-headings:scroll-mt-20 prose-headings:font-semibold prose-a:text-github-accent prose-a:no-underline hover:prose-a:underline prose-pre:rounded-md prose-pre:border prose-pre:border-github-border prose-code:before:content-none prose-code:after:content-none sm:prose-base ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function Faqs({ faqs, title = 'Frequently asked questions' }: { faqs: Faq[]; title?: string }) {
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-3 text-base font-semibold text-github-fg">{title}</h2>
      <div className="divide-y divide-github-border rounded-md border border-github-border bg-github-canvas">
        {faqs.map((faq) => (
          <details key={faq.question} className="group px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-github-fg">
              {faq.question}
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-github-fg-subtle transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 whitespace-pre-line text-sm text-github-fg-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export type PostSummary = Omit<Post, 'body'>;

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="group relative rounded-md border border-github-border bg-github-canvas p-5 transition-all hover:-translate-y-0.5 hover:border-github-border-muted hover:shadow-github-md">
      <h3 className="text-base font-semibold text-github-fg">
        <Link
          to={`/blog/${post.slug}`}
          prefetch="intent"
          className="rounded after:absolute after:inset-0 group-hover:text-github-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent"
        >
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-github-fg-muted">{post.excerpt}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Link
              key={tag.slug}
              to={`/blog/tag/${tag.slug}`}
              className="relative z-10 rounded-full border border-github-border bg-github-subtle px-2 py-0.5 text-xs text-github-fg-muted transition-colors hover:border-github-accent hover:text-github-accent"
            >
              {tag.name}
            </Link>
          ))}
        </div>
        <span className="ml-auto flex items-center gap-1 text-xs text-github-fg-subtle">
          <Clock className="h-3.5 w-3.5" />
          {post.readingTime} min · <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        </span>
      </div>
    </article>
  );
}

export function EmptyState({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-github-border py-16 text-center">
      <Icon className="mx-auto h-8 w-8 text-github-fg-subtle" />
      <p className="mt-3 text-sm text-github-fg-muted">{children}</p>
    </div>
  );
}
