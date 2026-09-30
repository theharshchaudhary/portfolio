import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('projects', 'routes/projects.tsx'),
  route('projects/:slug', 'routes/project.tsx'),
  route('blog', 'routes/blog.tsx'),
  route('blog/:slug', 'routes/blog-post.tsx'),
  route('blog/tag/:tag', 'routes/blog-tag.tsx'),
  route('about', 'routes/about.tsx'),
  route('services', 'routes/services.tsx'),
  route('contact', 'routes/contact.tsx'),
  route('support', 'routes/support.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
