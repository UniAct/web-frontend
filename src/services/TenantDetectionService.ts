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
  /**
   * Detects current tenant from window.location.hostname
   * Returns configuration for API calls and UI routing
   */
  static detectTenant(): TenantContext {
    const hostname = window.location.hostname.toLowerCase();
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isMainDomain = hostname === 'uniact.local' || hostname === 'uniact.edu.eg';
    
    console.log(`[TenantDetectionService] Hostname: ${hostname}`);

    // SUPERADMIN ACCESS: No tenant
    if (isLocalhost || isMainDomain) {
      console.log(`[TenantDetectionService] ✓ SuperAdmin access detected`);
      return {
        isSuperAdmin: true,
        apiBaseUrl: `${window.location.protocol}//${window.location.hostname}:3000`,
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

  /**
   * Navigates to a different tenant subdomain
   * @param subdomain Target tenant subdomain (e.g., "anu", "auc")
   */
  static navigateToTenant(subdomain: string): void {
    const port = window.location.port ? `:${window.location.port}` : '';
    const targetUrl = `${window.location.protocol}//${subdomain}${port}/`;
    window.location.href = targetUrl;
  }

  /**
   * Navigates to superadmin (localhost)
   */
  static navigateToSuperAdmin(): void {
    const port = window.location.port ? `:${window.location.port}` : '';
    const targetUrl = `${window.location.protocol}//localhost${port}/`;
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
