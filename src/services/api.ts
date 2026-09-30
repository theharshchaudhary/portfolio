import type {
  Profile,
  Project,
  ContributionDay,
  Note,
  Activity,
  Release,
  BlogPost,
  Resource,
  SponsorTier,
  StreakStats,
} from '@/types';
import {
  mockProfile,
  mockProjects,
  mockContributionData,
  mockStreakStats,
  mockNotes,
  mockActivities,
  mockReleases,
  mockBlogPosts,
  mockResources,
  mockSponsorTiers,
} from './mockData';

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export async function fetchProfile(): Promise<Profile> {
  return delay(mockProfile);
}

export async function fetchProjects(): Promise<Project[]> {
  return delay(mockProjects, 400);
}

export async function fetchPinnedProjects(): Promise<Project[]> {
  return delay(mockProjects.filter((p) => p.pinned), 350);
}

export async function fetchContributions(): Promise<ContributionDay[]> {
  return delay(mockContributionData, 400);
}

export async function fetchStreakStats(): Promise<StreakStats> {
  return delay(mockStreakStats, 350);
}

export async function fetchNotes(): Promise<Note[]> {
  return delay(mockNotes, 400);
}

export async function fetchActivities(limit?: number): Promise<Activity[]> {
  return delay(limit ? mockActivities.slice(0, limit) : mockActivities, 400);
}

export async function fetchReleases(): Promise<Release[]> {
  return delay(mockReleases, 400);
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  return delay(mockBlogPosts, 400);
}

export async function fetchResources(): Promise<Resource[]> {
  return delay(mockResources, 400);
}

export async function fetchSponsorTiers(): Promise<SponsorTier[]> {
  return delay(mockSponsorTiers, 350);
}
