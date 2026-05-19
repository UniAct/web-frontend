/**
 * TENANT DETECTION SERVICE
 * 
 * Detects current tenant from browser hostname and configures API accordingly.
 * Supports multi-tenant architecture via subdomain-based routing:
 * 
 * SUPERADMIN (no tenant):
 *   - http://localhost:5173 → SuperAdmin dashboard
 *   - http://127.0.0.1:5173 → SuperAdmin dashboard
 *   - https://public.uniact.website → SuperAdmin dashboard
 * 
 * TENANT-SPECIFIC:
 *   - https://anu.uniact.website → ANU tenant (reads from anu schema)
 *   - https://auc.uniact.website → AUC tenant (reads from auc schema)
 *   - http://anu:5173 (dev) → ANU tenant (reads from anu schema)
 * 
 * IMPORTANT: All requests to backend automatically include university-name header
 * which backend uses to:
 * 1. Resolve subdomain to university name
 * 2. Switch to appropriate database schema
 * 3. Authorize based on tenant + user role
 */

export interface TenantContext {
  subdomain?: string;
  isSuperAdmin: boolean;
  apiBaseUrl: string;
  displayName?: string;
}

export class TenantDetectionService {
  private static readonly universityDirectoryKey = 'universityDirectory';

  /**
   * Detects current tenant from window.location.hostname
   * Uses pure subdomain-based detection via *.uniact.website or local dev hosts
   * Returns configuration for API calls and UI routing
   */
  static detectTenant(): TenantContext {
    const hostname = window.location.hostname.toLowerCase();
    
    // Extract the first part (subdomain) from hostname
    const tenantSlug = hostname.split('.')[0];
    
    // SuperAdmin if running on localhost/127.0.0.1 or public subdomain
    const isSuperAdmin = hostname === 'localhost' || hostname === '127.0.0.1' || tenantSlug === 'public';

    console.log(`[TenantDetectionService] Hostname: ${hostname}`);
    console.log(`[TenantDetectionService] Tenant slug: ${tenantSlug}`);
    console.log(`[TenantDetectionService] IsSuperAdmin: ${isSuperAdmin}`);

    return {
      subdomain: tenantSlug,
      isSuperAdmin,
      apiBaseUrl: import.meta.env.VITE_API_BASE,
      displayName: isSuperAdmin ? 'System Administrator' : tenantSlug.toUpperCase(),
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
    const hostname = window.location.hostname.toLowerCase();
    
    // Development: use localhost with port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const port = window.location.port ? `:${window.location.port}` : '';
      return `${protocol}//${normalizedKey}${port}/`;
    }
    
    // Production: use subdomain on uniact.website
    return `${protocol}//${normalizedKey}.uniact.website/`;
  }

  /**
   * Navigates to a different tenant subdomain
   * @param subdomain Target tenant subdomain (e.g., "anu", "auc")
   */
  static navigateToTenant(subdomain: string): void {
    window.location.href = this.buildTenantUrl(subdomain);
  }

  /**
   * Navigates to superadmin (public subdomain or localhost)
   */
  static navigateToSuperAdmin(): void {
    const hostname = window.location.hostname.toLowerCase();
    const protocol = window.location.protocol;
    
    // Development: use localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const port = window.location.port ? `:${window.location.port}` : '';
      window.location.href = `${protocol}//public${port}/`;
      return;
    }
    
    // Production: use public subdomain on uniact.website
    window.location.href = `${protocol}//public.uniact.website/`;
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
