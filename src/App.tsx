import { lazy, Suspense, useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TabNav } from '@/components/layout/TabNav';
import { MobileProfileHeader } from '@/components/layout/MobileProfileHeader';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { fetchProfile } from '@/services/api';
import type { Profile } from '@/types';
import { useRouter } from '@/hooks/useRouter';
import { SkeletonBlock } from '@/components/ui/Skeleton';

const OverviewPage = lazy(() => import('@/pages/OverviewPage').then(m => ({ default: m.OverviewPage })));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const NotesPage = lazy(() => import('@/pages/NotesPage').then(m => ({ default: m.NotesPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const BlogPage = lazy(() => import('@/pages/BlogPage').then(m => ({ default: m.BlogPage })));
const ReleasesPage = lazy(() => import('@/pages/ReleasesPage').then(m => ({ default: m.ReleasesPage })));
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage').then(m => ({ default: m.ResourcesPage })));
const SupportPage = lazy(() => import('@/pages/SupportPage').then(m => ({ default: m.SupportPage })));

function PageFallback() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="h-32 w-full" />
      <div className="grid gap-3 sm:grid-cols-2">
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
      </div>
    </div>
  );
}

function App() {
  const { route, navigate } = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    fetchProfile().then((p) => {
      setProfile(p);
      setProfileLoading(false);
    });
  }, []);

  const validRoutes = [
    'overview', 'projects', 'notes', 'about', 'contact',
    'blog', 'releases', 'resources', 'support',
  ];
  const isValid = validRoutes.includes(route);

  return (
    <div className="min-h-screen bg-github-canvas">
      <TopBar />
      <MobileProfileHeader profile={profile} />
      <div className="mx-auto flex max-w-github">
        <Sidebar profile={profile} loading={profileLoading} />
        <main className="min-w-0 flex-1 px-4 pb-12 pt-4 md:px-6">
          <TabNav activeRoute={route} onNavigate={navigate} />
          <div className="mt-6">
            <Suspense fallback={<PageFallback />}>
              {!isValid ? (
                <NotFoundPage onNavigate={navigate} />
              ) : route === 'overview' ? (
                <OverviewPage onNavigate={navigate} />
              ) : route === 'projects' ? (
                <ProjectsPage />
              ) : route === 'notes' ? (
                <NotesPage />
              ) : route === 'about' ? (
                <AboutPage />
              ) : route === 'contact' ? (
                <ContactPage />
              ) : route === 'blog' ? (
                <BlogPage />
              ) : route === 'releases' ? (
                <ReleasesPage />
              ) : route === 'resources' ? (
                <ResourcesPage />
              ) : route === 'support' ? (
                <SupportPage />
              ) : null}
            </Suspense>
          </div>
        </main>
      </div>
      <footer className="border-t border-github-border py-6">
        <div className="mx-auto flex max-w-github flex-col items-center gap-2 px-4 text-xs text-github-fg-subtle sm:flex-row sm:justify-between">
          <span>© 2026 Harsh Chaudhary · Built with React, TypeScript & Tailwind CSS</span>
          <span className="flex items-center gap-2">
            <a
              href="https://github.com/theharshchaudhary"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-github-accent focus:outline-none focus:ring-2 focus:ring-github-accent rounded"
            >
              @theharshchaudhary
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
