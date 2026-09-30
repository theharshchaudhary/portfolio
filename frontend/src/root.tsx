import { useEffect } from 'react';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
  useRouteLoaderData,
} from 'react-router';
import type { Route } from './+types/root';
import { getSite } from '@/lib/content.server';
import { trackPageView } from '@/lib/api';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TabNav } from '@/components/layout/TabNav';
import { MobileProfileHeader } from '@/components/layout/MobileProfileHeader';
import { PlatformIcon } from '@/components/icons';
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
        <a
          href="#main"
          className="sr-only z-[200] rounded-md bg-github-accent px-3 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/** Cookieless page-view count on first load and every client-side navigation. */
function usePageViews(enabled: boolean) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (enabled) trackPageView(pathname, document.referrer);
  }, [enabled, pathname]);
}

function Shell({ site, children }: { site: SiteData | undefined; children: React.ReactNode }) {
  const footerLinks = site?.socials.filter((s) => s.showInFooter) ?? [];
  return (
    <div className="min-h-screen bg-github-canvas">
      <TopBar site={site} />
      {site && <MobileProfileHeader site={site} />}
      <div className="mx-auto flex max-w-github">
        {site && <Sidebar site={site} />}
        <main id="main" className="min-w-0 flex-1 px-4 pb-12 pt-4 md:px-6">
          {site && <TabNav items={site.nav} />}
          <div className="mt-6">{children}</div>
        </main>
      </div>
      <footer className="border-t border-github-border py-6">
        <div className="mx-auto flex max-w-github flex-col items-center gap-3 px-4 text-xs text-github-fg-subtle sm:flex-row sm:justify-between">
          <span>{site?.settings.footerText}</span>
          {footerLinks.length > 0 && (
            <ul className="flex items-center gap-3">
              {footerLinks.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target={link.url.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer me"
                    aria-label={link.label}
                    className="block rounded p-1 transition-colors hover:text-github-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent"
                  >
                    <PlatformIcon platform={link.platform} className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </footer>
    </div>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  usePageViews(loaderData.site.settings.analyticsEnabled);
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
