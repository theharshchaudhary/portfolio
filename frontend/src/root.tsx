import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteLoaderData,
} from 'react-router';
import type { Route } from './+types/root';
import { getSite } from '@/lib/content.server';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TabNav } from '@/components/layout/TabNav';
import { MobileProfileHeader } from '@/components/layout/MobileProfileHeader';
import type { SiteData } from '@/types';
import './index.css';

export async function loader() {
  return { site: await getSite() };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function Shell({ site, children }: { site: SiteData | undefined; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-github-canvas">
      <TopBar />
      {site && <MobileProfileHeader profile={site.profile} />}
      <div className="mx-auto flex max-w-github">
        {site && <Sidebar profile={site.profile} />}
        <main className="min-w-0 flex-1 px-4 pb-12 pt-4 md:px-6">
          <TabNav counts={site?.counts} />
          <div className="mt-6">{children}</div>
        </main>
      </div>
      <footer className="border-t border-github-border py-6">
        <div className="mx-auto flex max-w-github flex-col items-center gap-2 px-4 text-xs text-github-fg-subtle sm:flex-row sm:justify-between">
          <span>{site?.settings.footerText}</span>
          {site && (
            <a
              href={`https://github.com/${site.profile.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded hover:text-github-accent focus:outline-none focus:ring-2 focus:ring-github-accent"
            >
              @{site.profile.github}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <Shell site={loaderData.site}>
      <Outlet />
    </Shell>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const data = useRouteLoaderData<typeof loader>('root');
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <Shell site={data?.site}>
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-semibold text-github-fg">{notFound ? '404' : 'Something went wrong'}</h1>
        <p className="mt-2 text-sm text-github-fg-muted">
          {notFound ? 'This page does not exist.' : 'Please try again in a moment.'}
        </p>
        <Link to="/" className="mt-6 text-sm font-medium text-github-accent hover:underline">
          Back to home
        </Link>
      </div>
    </Shell>
  );
}
