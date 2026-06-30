import type { PublicTenantProfile } from '../api';

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function safeHexColor(value: unknown): string | undefined {
  return typeof value === 'string' && HEX_COLOR.test(value.trim()) ? value.trim() : undefined;
}

function safeDocumentText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > 0 ? normalized.slice(0, 80) : undefined;
}

function safeAssetUrl(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith('/')) return trimmed;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function applyTenantDocumentBranding(profile: PublicTenantProfile | null): void {
  const settings = profile?.settings;
  const tabName =
    safeDocumentText(settings?.tab_name) ||
    safeDocumentText(profile?.name) ||
    'UniAct';
  const logoUrl = safeAssetUrl(settings?.logo_url, '/favicon.png');

  document.title = tabName;

  const icon =
    document.querySelector<HTMLLinkElement>("link[rel~='icon']") ??
    document.createElement('link');
  icon.rel = 'icon';
  icon.href = logoUrl;
  document.head.appendChild(icon);

  const primaryColor = safeHexColor(settings?.primary_color);
  const secondaryColor = safeHexColor(settings?.secondary_color);

  document.documentElement.setAttribute('data-tenant-theme', profile ? 'true' : 'false');
  document.documentElement.style.setProperty('--primary', primaryColor ?? '#2563eb');
  document.documentElement.style.setProperty('--secondary', secondaryColor ?? '#7c3aed');
  document.documentElement.style.setProperty('--brand-primary', primaryColor ?? '#2563eb');
  document.documentElement.style.setProperty('--brand-secondary', secondaryColor ?? '#7c3aed');
}
