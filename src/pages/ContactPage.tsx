import { useEffect, useState } from 'react';
import { Mail, MapPin, Twitter, Github, Linkedin, Send, CheckCircle2 } from 'lucide-react';
import { SkeletonBlock } from '@/components/ui/Skeleton';
import { fetchProfile } from '@/services/api';
import type { Profile } from '@/types';

export function ContactPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetchProfile().then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm({ name: '', email: '', message: '' });
    }, 3000);
  };

  if (loading || !profile) {
    return (
      <div className="space-y-4 animate-fade-in">
        <SkeletonBlock className="h-32 w-full" />
        <SkeletonBlock className="h-64 w-full" />
      </div>
    );
  }

  const channels = [
    { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { icon: Github, label: 'GitHub', value: `@${profile.github}`, href: `https://github.com/${profile.github}` },
    { icon: Twitter, label: 'Twitter', value: `@${profile.twitter}`, href: `https://twitter.com/${profile.twitter}` },
    { icon: Linkedin, label: 'LinkedIn', value: `@${profile.linkedin}`, href: `https://linkedin.com/in/${profile.linkedin}` },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-github-fg">Get in touch</h1>
        <p className="mt-1 text-sm text-github-fg-muted">
          Have a project, question, or just want to say hi? I respond to all messages.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map((ch) => (
          <a
            key={ch.label}
            href={ch.href}
            target={ch.href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="group rounded-md border border-github-border bg-github-canvas p-4 transition-all hover:border-github-border-muted hover:shadow-github-sm focus:outline-none focus:ring-2 focus:ring-github-accent"
          >
            <ch.icon className="h-5 w-5 text-github-fg-muted group-hover:text-github-accent" />
            <p className="mt-2 text-xs text-github-fg-subtle">{ch.label}</p>
            <p className="text-sm font-medium text-github-fg truncate">{ch.value}</p>
          </a>
        ))}
      </div>

      <div className="rounded-md border border-github-border bg-github-canvas p-6">
        <h2 className="text-sm font-semibold text-github-fg">Send a message</h2>
        {sent ? (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-github-success-fg animate-slide-up">
            <CheckCircle2 className="h-5 w-5" />
            Message sent! I will get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-github-fg">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-github-border bg-github-canvas px-3 py-1.5 text-sm text-github-fg focus:border-github-accent focus:outline-none focus:ring-1 focus:ring-github-accent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-github-fg">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-md border border-github-border bg-github-canvas px-3 py-1.5 text-sm text-github-fg focus:border-github-accent focus:outline-none focus:ring-1 focus:ring-github-accent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-github-fg">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1 w-full rounded-md border border-github-border bg-github-canvas px-3 py-2 text-sm text-github-fg focus:border-github-accent focus:outline-none focus:ring-1 focus:ring-github-accent resize-y"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-github-success-emphasis px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-github-success-fg focus:outline-none focus:ring-2 focus:ring-github-accent focus:ring-offset-2"
            >
              <Send className="h-4 w-4" />
              Send message
            </button>
          </form>
        )}
      </div>

      <div className="rounded-md border border-github-border bg-github-subtle p-4 text-sm text-github-fg-muted">
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Based in {profile.location} · Available for freelance and collaboration
        </span>
      </div>
    </div>
  );
}
