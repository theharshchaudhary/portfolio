// Icons chosen by name in the admin panel. A curated map (not all of lucide) keeps the bundle small;
// unknown names fall back to a neutral icon.
import {
  BookOpen,
  Briefcase,
  Code,
  FileText,
  FolderGit2,
  Gauge,
  Globe,
  GraduationCap,
  Heart,
  Home,
  Info,
  Layers,
  Link as LinkIcon,
  Mail,
  Megaphone,
  Palette,
  Rocket,
  Rss,
  Search,
  Server,
  Smartphone,
  Sparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, XIcon } from './brands';

type IconComponent = LucideIcon | typeof GithubIcon;

const ICONS: Record<string, IconComponent> = {
  'book-open': BookOpen,
  briefcase: Briefcase,
  code: Code,
  'file-text': FileText,
  'folder-git-2': FolderGit2,
  gauge: Gauge,
  globe: Globe,
  'graduation-cap': GraduationCap,
  heart: Heart,
  home: Home,
  info: Info,
  layers: Layers,
  link: LinkIcon,
  mail: Mail,
  megaphone: Megaphone,
  palette: Palette,
  rocket: Rocket,
  rss: Rss,
  search: Search,
  server: Server,
  smartphone: Smartphone,
  sparkles: Sparkles,
  wrench: Wrench,
};

const PLATFORM_ICONS: Record<string, IconComponent> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  x: XIcon,
  email: Mail,
  website: Globe,
};

export function Icon({ name, className }: { name: string | null | undefined; className?: string }) {
  const Component = (name && ICONS[name]) || LinkIcon;
  return <Component className={className} aria-hidden="true" />;
}

export function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const Component = PLATFORM_ICONS[platform] ?? LinkIcon;
  return <Component className={className} aria-hidden="true" />;
}
