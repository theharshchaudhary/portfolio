import type { LanguageStat } from '@/types';

export function LanguageStats({ languages }: { languages: LanguageStat[] }) {
  return (
    <div className="rounded-md border border-github-border bg-github-canvas p-4">
      <h3 className="mb-3 text-sm font-semibold text-github-fg">Top languages</h3>

      <div className="flex h-2.5 overflow-hidden rounded-full">
        {languages.map((lang) => (
          <div
            key={lang.name}
            className="h-full transition-all duration-300"
            style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
            title={`${lang.name} ${lang.percentage}%`}
          />
        ))}
      </div>

      <ul className="mt-3 space-y-2">
        {languages.map((lang) => (
          <li key={lang.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 flex-shrink-0 rounded-full"
              style={{ backgroundColor: lang.color }}
            />
            <span className="font-medium text-github-fg">{lang.name}</span>
            <span className="text-github-fg-muted">{lang.percentage}%</span>
            <div className="flex-1" />
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-github-subtle">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
