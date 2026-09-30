import { useEffect, useState } from 'react';
import { FileText, Clock, ArrowLeft, Tag } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { fetchNotes } from '@/services/api';
import type { Note } from '@/types';
import { formatDate } from '@/hooks/useRouter';

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes().then((data) => {
      setNotes(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} height="h-28" />
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
          All notes
        </button>

        <div className="rounded-md border border-github-border bg-github-canvas p-6 sm:p-8">
          <div className="flex flex-wrap gap-1.5">
            {selected.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-github-border bg-github-subtle px-2 py-0.5 text-xs font-medium text-github-fg-muted"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-github-fg">{selected.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-github-fg-muted">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {selected.readingTime} min read
            </span>
            <span>·</span>
            <span>{formatDate(selected.publishedAt)}</span>
          </div>

          <p className="mt-4 text-base font-medium text-github-fg">{selected.summary}</p>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-github-fg-muted">
            <p>{selected.content}</p>
            <p>
              This is a living document. I update these notes as my understanding evolves, so check
              back if a topic interests you. The full version will be published as a blog post soon.
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold text-github-fg">Notes</h1>
        <p className="mt-1 text-sm text-github-fg-muted">
          Short-form technical notes and dev journal entries.
        </p>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-md border border-dashed border-github-border py-16 text-center">
          <FileText className="mx-auto h-8 w-8 text-github-fg-subtle" />
          <p className="mt-3 text-sm text-github-fg-muted">No notes yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelected(note)}
              className="block w-full rounded-md border border-github-border bg-github-canvas p-4 text-left transition-all hover:border-github-border-muted hover:shadow-github-sm focus:outline-none focus:ring-2 focus:ring-github-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-github-fg group-hover:text-github-accent">
                  {note.title}
                </h2>
                <span className="flex-shrink-0 text-xs text-github-fg-subtle">
                  {formatDate(note.publishedAt)}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm text-github-fg-muted">{note.summary}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-github-border bg-github-subtle px-2 py-0.5 text-xs text-github-fg-muted"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="ml-auto flex items-center gap-1 text-xs text-github-fg-subtle">
                  <Clock className="h-3.5 w-3.5" />
                  {note.readingTime} min
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
