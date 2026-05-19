/**
 * TENANT DETECTION SERVICE
 * 
 * Detects current tenant from browser hostname and configures API accordingly.
 * Supports multi-tenant architecture:
 * 
 * SUPERADMIN (no tenant):
 *   - http://localhost:5173 → SuperAdmin dashboard
 *   - http://127.0.0.1:5173 → SuperAdmin dashboard
 *   - http://uniact.local:5173 → SuperAdmin dashboard
 * 
 * TENANT-SPECIFIC:
 *   - http://anu:5173 → ANU tenant (reads from anu schema)
 *   - http://auc:5173 → AUC tenant (reads from auc schema)
 *   - http://anu.uniact.edu.eg → ANU production (reads from anu schema)
 * 
 * IMPORTANT: All requests to backend automatically include Host header
 * which backend uses to:
 * 1. Detect which tenant is accessing (if any)
 * 2. Switch to appropriate database schema
 * 3. Authorize based on tenant + user role
 */

export interface TenantContext {
  isSuperAdmin: boolean;
  subdomain?: string;
  apiBaseUrl: string;
  displayName: string;
}

export class TenantDetectionService {
  private static readonly universityDirectoryKey = 'universityDirectory';

  /**
   * Detects current tenant from window.location.hostname
   * Returns configuration for API calls and UI routing
   */
  static detectTenant(): TenantContext {
    const hostname = window.location.pathname.toLowerCase();
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isMainDomain =
      hostname === 'public' ||
      hostname === 'uniact.local' ||
      hostname === 'uniact.edu.eg';

    console.log(`[TenantDetectionService] Hostname: ${hostname}`);

    // SUPERADMIN ACCESS: No tenant
    if (isLocalhost || isMainDomain) {
      console.log(`[TenantDetectionService] ✓ SuperAdmin access detected`);
      return {
        isSuperAdmin: true,
        apiBaseUrl: `${window.location.protocol}//${window.location.pathname}:3000`,
        displayName: 'System Administrator',
      };
    }

    // TENANT-SPECIFIC ACCESS: Extract subdomain
    const subdomain = this.extractSubdomain(hostname);

    if (!subdomain) {
      console.warn(`[TenantDetectionService] Could not extract subdomain from ${hostname}, defaulting to localhost`);
      return {
        isSuperAdmin: true,
        apiBaseUrl: `${window.location.protocol}//localhost:3000`,
        displayName: 'System Administrator',
      };
    }

    const displayName = subdomain.toUpperCase();
    console.log(`[TenantDetectionService] ✓ Tenant access: ${subdomain}`);

    return {
      isSuperAdmin: false,
      subdomain,
      apiBaseUrl: `${window.location.protocol}//${hostname}:3000`,
      displayName,
    };
  }

  /**
   * Extracts tenant subdomain from hostname
   * Supports formats:
   * - "anu" (simple, from hosts file)
   * - "www.anu.local" → "anu"
   * - "anu.uniact.edu.eg" → "anu"
   */
  private static extractSubdomain(hostname: string): string | null {
    const parts = hostname.split('.');

    // Single part: "anu" or "auc"
    if (parts.length === 1) {
      return parts[0];
    }

    // WWW prefix: "www.anu.local" → "anu"
    if (parts.length >= 3 && parts[0] === 'www') {
      return parts[1];
    }

    // Full domain: "anu.uniact.edu.eg" → "anu"
    if (parts.length >= 2) {
      return parts[0];
    }

    return null;
  }

  static buildTenantKey(identifier: string): string {
    const normalized = identifier.trim().toLowerCase();
    if (!normalized) return '';

    if (!normalized.includes('.') && !normalized.includes(' ') && /^[a-z0-9-]+$/.test(normalized)) {
      return normalized;
    }

    const words = normalized.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return words.map((word) => word[0]).join('').toLowerCase();
    }

    return normalized.replace(/[^a-z0-9-]/g, '');
  }

  static rememberTenantMapping(name: string, tenantKey?: string): void {
    const normalizedName = name.trim();
    const slug = this.buildTenantKey(tenantKey || name);

    if (!normalizedName || !slug) return;

    const current = this.readTenantMappings();
    const filtered = current.filter(
      (entry) =>
        entry.slug !== slug &&
        entry.name.toLowerCase() !== normalizedName.toLowerCase(),
    );

    filtered.push({ name: normalizedName, slug });
    localStorage.setItem(this.universityDirectoryKey, JSON.stringify(filtered));
  }

  static rememberTenantMappings(tenants: Array<{ name: string; tenantKey?: string }>): void {
    tenants.forEach((tenant) => this.rememberTenantMapping(tenant.name, tenant.tenantKey));
  }

  private static readTenantMappings(): Array<{ name: string; slug: string }> {
    try {
      const raw = localStorage.getItem(this.universityDirectoryKey);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static buildTenantUrl(tenantKey: string): string {
    const normalizedKey = this.buildTenantKey(tenantKey);
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    const hostname = window.location.pathname.toLowerCase();

    const rootDomain =
      hostname === 'uniact.edu.eg' || hostname.endsWith('.uniact.edu.eg')
        ? 'uniact.edu.eg'
        : null;

    if (rootDomain) {
      return `${protocol}//${normalizedKey}.${rootDomain}${port}/`;
    }

    return `${protocol}//${normalizedKey}${port}/`;
  }

  /**
   * Navigates to a different tenant subdomain
   * @param subdomain Target tenant subdomain (e.g., "anu", "auc")
   */
  static navigateToTenant(subdomain: string): void {
    window.location.href = this.buildTenantUrl(subdomain);
  }

  /**
   * Navigates to superadmin (localhost)
   */
  static navigateToSuperAdmin(): void {
    const port = window.location.port ? `:${window.location.port}` : '';
    const hostname = window.location.pathname.toLowerCase();
    const targetHost =
      hostname === 'public'
        ? 'public'
        : hostname === 'uniact.edu.eg' || hostname.endsWith('.uniact.edu.eg')
          ? 'uniact.edu.eg'
          : 'localhost';
    const targetUrl = `${window.location.protocol}//${targetHost}${port}/`;
    window.location.href = targetUrl;
  }

  /**
   * Gets list of available tenants from browser storage
   * (populated after login)
   */
  static getAvailableTenants(): Array<{ subdomain: string; name: string }> {
    try {
      const stored = localStorage.getItem('availableTenants');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Stores list of available tenants (called after login)
   */
  static setAvailableTenants(tenants: Array<{ subdomain: string; name: string }>): void {
    localStorage.setItem('availableTenants', JSON.stringify(tenants));
  }
}
