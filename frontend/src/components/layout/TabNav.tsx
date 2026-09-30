import { NavLink } from 'react-router';
import type { NavItem } from '@/types';
import { Icon } from '@/components/icons';

export function TabNav({ items }: { items: NavItem[] }) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-github-border bg-github-canvas scrollbar-none"
      aria-label="Site navigation"
    >
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          prefetch="intent"
          viewTransition
          className={({ isActive }) =>
            `group relative flex flex-shrink-0 items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-github-accent focus-visible:ring-offset-2 ${
              isActive ? 'text-github-fg' : 'text-github-fg-muted hover:bg-github-subtle'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                name={item.icon}
                className={`h-4 w-4 ${isActive ? 'text-github-fg' : 'text-github-fg-subtle group-hover:text-github-fg-muted'}`}
              />
              <span>{item.label}</span>
              {item.badge !== null && (
                <span
                  className={`min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-xs font-medium ${
                    isActive ? 'bg-github-accent/10 text-github-accent' : 'bg-github-subtle text-github-fg-muted'
                  }`}
                >
                  {item.badge}
                </span>
              )}
              <span
                className={`absolute -bottom-px left-0 right-0 h-0.5 origin-center bg-github-danger transition-transform duration-200 ${
                  isActive ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
