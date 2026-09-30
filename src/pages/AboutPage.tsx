import { useEffect, useState } from 'react';
import { MapPin, Building, Calendar, Link as LinkIcon, Code2, Rocket, Heart } from 'lucide-react';
import { SkeletonBlock } from '@/components/ui/Skeleton';
import { fetchProfile, fetchProjects } from '@/services/api';
import type { Profile, Project } from '@/types';
import { formatNumber } from '@/hooks/useRouter';

export function AboutPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchProjects()]).then(([p, projs]) => {
      setProfile(p);
      setProjects(projs);
      setLoading(false);
    });
  }, []);

  if (loading || !profile) {
    return (
      <div className="space-y-4 animate-fade-in">
        <SkeletonBlock className="h-48 w-full" />
        <SkeletonBlock className="h-64 w-full" />
      </div>
    );
  }

  const totalStars = projects.reduce((s, p) => s + p.stars, 0);
  const totalForks = projects.reduce((s, p) => s + p.forks, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-github-fg">About</h1>
      </div>

      <div className="rounded-md border border-github-border bg-github-canvas p-6">
        <p className="text-base leading-relaxed text-github-fg">{profile.bio}</p>
        <p className="mt-3 text-sm leading-relaxed text-github-fg-muted">
          I am a full-stack developer based in {profile.location}. I build products and tools for
          the web — from developer CLIs to SaaS platforms. My focus is on developer experience,
          performance, and clean architecture. I write about what I learn in my notes and blog, and
          I maintain several open-source projects used by developers worldwide.
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoRow icon={Building} label="Company" value={profile.company} />
          <InfoRow icon={MapPin} label="Location" value={profile.location} />
          <InfoRow icon={LinkIcon} label="Website" value={profile.website.replace('https://', '')} link={profile.website} />
          <InfoRow icon={Calendar} label="Joined" value={new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Code2} label="Repositories" value={projects.length.toString()} color="text-github-accent" bg="bg-blue-50" />
        <StatCard icon={Rocket} label="Total stars" value={formatNumber(totalStars)} color="text-github-attention" bg="bg-amber-50" />
        <StatCard icon={Heart} label="Total forks" value={formatNumber(totalForks)} color="text-github-danger" bg="bg-red-50" />
      </div>

      <div className="rounded-md border border-github-border bg-github-canvas p-6">
        <h2 className="text-sm font-semibold text-github-fg">Skills & technologies</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            'TypeScript', 'React', 'Node.js', 'Laravel', 'PHP', 'Rust', 'Go', 'Python',
            'PostgreSQL', 'Supabase', 'Docker', 'Tailwind CSS', 'Vite', 'Git',
            'REST APIs', 'GraphQL', 'CI/CD', 'Testing',
          ].map((skill) => (
            <span
              key={skill}
              className="rounded-md border border-github-border bg-github-subtle px-2.5 py-1 text-xs font-medium text-github-fg-muted"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-github-border bg-github-canvas p-6">
        <h2 className="text-sm font-semibold text-github-fg">What I am working on</h2>
        <ul className="mt-3 space-y-3 text-sm text-github-fg-muted">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-github-success-fg" />
            <span>Building <strong className="text-github-fg">devbox-saas</strong> — cloud development environments in your browser.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-github-accent" />
            <span>Maintaining <strong className="text-github-fg">lensify</strong> and <strong className="text-github-fg">react-flow-table</strong> open-source projects.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-github-done-fg" />
            <span>Exploring Rust for web services with <strong className="text-github-fg">forge-rs</strong>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-github-attention" />
            <span>Writing about architecture and developer experience.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, link }: { icon: typeof MapPin; label: string; value: string; link?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 flex-shrink-0 text-github-fg-subtle" />
      <span className="text-github-fg-muted">{label}:</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-github-accent hover:underline">
          {value}
        </a>
      ) : (
        <span className="font-medium text-github-fg">{value}</span>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: typeof Code2; label: string; value: string; color: string; bg: string }) {
  return (
    <div className="rounded-md border border-github-border bg-github-canvas p-4">
      <span className={`flex h-8 w-8 items-center justify-center rounded-md ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </span>
      <p className="mt-3 text-2xl font-semibold text-github-fg tabular-nums">{value}</p>
      <p className="text-xs text-github-fg-muted">{label}</p>
    </div>
  );
}
