import { TENANT_DIRECTORY_STORAGE_KEY } from './constants';
import { TenantDetectionService } from '../../services/TenantDetectionService';

export interface TenantDirectoryEntry {
  name: string;
  slug: string;
}

export function buildTenantSlug(name: string): string {
  return TenantDetectionService.buildTenantKey(name);
}

export function readTenantDirectory(): TenantDirectoryEntry[] {
  try {
    const raw = localStorage.getItem(TENANT_DIRECTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeTenantDirectory(universities: string[]): void {
  const directory = universities.map((name) => ({
    name,
    slug: buildTenantSlug(name),
  }));

  localStorage.setItem(TENANT_DIRECTORY_STORAGE_KEY, JSON.stringify(directory));
}

export function rememberTenantDirectoryEntry(name: string, slug?: string): void {
  TenantDetectionService.rememberTenantMapping(name, slug);
}
