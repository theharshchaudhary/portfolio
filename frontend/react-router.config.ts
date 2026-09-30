import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'src',
  // Static site: every route is rendered to HTML at build time, no Node server in production.
  ssr: false,
  async prerender({ getStaticPaths }) {
    const { getPrerenderPaths } = await import('./src/lib/content.server');
    return [...getStaticPaths(), ...(await getPrerenderPaths())];
  },
} satisfies Config;
