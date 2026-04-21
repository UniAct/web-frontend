import { TenantDetectionService, type TenantContext } from '../../services/TenantDetectionService';
import { API_PREFIX, TENANT_HEADER, TENANT_OVERRIDE_STORAGE_KEY } from './constants';
import { decodeJwtPayload } from './jwt';
import { clearStoredSession, getStoredToken, getStoredUser } from './session-storage';
import {
  buildTenantSlug,
  readTenantDirectory,
  rememberTenantDirectoryEntry,
  writeTenantDirectory,
} from './tenant-directory';
import type { ApiResponse, User } from '../types';
import type { PublicTenantProfile } from '../types/university';

type HeadersMap = Record<string, string>;

class HttpRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'HttpRequestError';
    this.status = status;
  }
}

interface RequestOptions {
  extraHeaders?: HeadersMap;
  includeJsonContentType?: boolean;
  requireResolvedTenant?: boolean;
  bootstrapTenantName?: string;
}

class HttpClient {
  private tenantContext: TenantContext;
  private resolvedTenantName?: string;
  private tenantProfileRequest?: Promise<PublicTenantProfile>;
  private tenantProfileFailureAt = 0;
  private static readonly TENANT_PROFILE_RETRY_COOLDOWN_MS = 5000;

  private static readonly DEFAULT_AUTH_ERROR_MESSAGE = 'You are not authorized to access this page.';

  constructor() {
    this.tenantContext = TenantDetectionService.detectTenant();
  }

  private extractErrorMessage(data: any, fallback: string): string {
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.data?.message === 'string') return data.data.message;
    if (Array.isArray(data?.data) && data.data.length > 0) {
      return data.data
        .map((item: any) => item?.msg || item?.message || String(item))
        .join('; ');
    }

    return fallback;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');

    if (!isJson) {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      return { status: 'success', data: text as T };
    }

    const payload = await response.json();

    if (!response.ok) {
      const message = this.extractErrorMessage(payload, `Request failed (HTTP ${response.status})`);
      if (this.shouldRedirectForAuthFailure(response.status, message)) {
        this.redirectToHomeForAuthFailure(message);
      }

      throw new HttpRequestError(
        message,
        response.status,
      );
    }

    return payload;
  }

  private shouldRedirectForAuthFailure(status: number, message: string): boolean {
    if (status !== 401 && status !== 403) {
      return false;
    }

    if (!getStoredToken()) {
      return false;
    }

    const normalized = message.toLowerCase();
    const hasExplicitTokenFailure =
      normalized.includes('no token provided') ||
      normalized.includes('invalid token') ||
      normalized.includes('token expired') ||
      normalized.includes('expired token') ||
      normalized.includes('jwt expired');

    if (status === 403) {
      return hasExplicitTokenFailure;
    }

    return hasExplicitTokenFailure || normalized.includes('not authenticated') || normalized.includes('unauthenticated');
  }

  private redirectToHomeForAuthFailure(message: string): void {
    clearStoredSession();
    this.clearResolvedTenant();

    const redirectUrl = new URL(window.location.href);
    redirectUrl.pathname = '/';
    redirectUrl.searchParams.set(
      'authError',
      message || HttpClient.DEFAULT_AUTH_ERROR_MESSAGE,
    );
    window.location.assign(redirectUrl.toString());
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  private isRetriableError(error: unknown): boolean {
    if (error instanceof HttpRequestError) {
      return typeof error.status !== 'number' || error.status >= 500;
    }

    return error instanceof TypeError || error instanceof Error;
  }

  private async retry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === attempts || !this.isRetriableError(error)) {
          throw error;
        }

        await this.delay(200 * attempt);
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Request failed');
  }

  private getCachedTenantNameFromToken(): string | undefined {
    const token = getStoredToken();
    if (!token) return undefined;

    const payload = decodeJwtPayload(token);
    if (typeof payload?.university_name === 'string') return payload.university_name;
    return typeof payload?.tenant_name === 'string' ? payload.tenant_name : undefined;
  }

  private getStoredTenantOverride(): string | undefined {
    try {
      const raw = localStorage.getItem(TENANT_OVERRIDE_STORAGE_KEY);
      return raw?.trim() || undefined;
    } catch {
      return undefined;
    }
  }

  syncResolvedTenantFromSession(): void {
    this.resolvedTenantName = this.getCachedTenantNameFromToken() || this.getStoredTenantOverride();
  }

  clearResolvedTenant(): void {
    this.resolvedTenantName = undefined;
  }

  setTenantOverrideName(tenantName: string): void {
    const normalized = tenantName.trim();
    if (!normalized) return;

    localStorage.setItem(TENANT_OVERRIDE_STORAGE_KEY, normalized);
    this.resolvedTenantName = normalized;
  }

  clearTenantOverrideName(): void {
    localStorage.removeItem(TENANT_OVERRIDE_STORAGE_KEY);
    this.resolvedTenantName = this.getCachedTenantNameFromToken();
  }

  private async fetchUniversityNames(): Promise<string[]> {
    const response = await this.request<string[]>('GET', '/university/list');
    const names = response.data ?? [];
    writeTenantDirectory(names);
    return names;
  }

  private async resolveTenantName(): Promise<string | undefined> {
    if (this.resolvedTenantName) return this.resolvedTenantName;

    const tokenTenant = this.getCachedTenantNameFromToken();
    if (tokenTenant) {
      this.resolvedTenantName = tokenTenant;
      return tokenTenant;
    }

    const overrideTenant = this.getStoredTenantOverride();
    if (overrideTenant) {
      this.resolvedTenantName = overrideTenant;
      return overrideTenant;
    }

    if (this.tenantContext.isSuperAdmin || !this.tenantContext.subdomain) {
      return undefined;
    }

    const targetSlug = this.tenantContext.subdomain.toLowerCase();

    const cachedMatch = readTenantDirectory().find((entry) => entry.slug === targetSlug);
    if (cachedMatch) {
      this.resolvedTenantName = cachedMatch.name;
      return cachedMatch.name;
    }

    const names = await this.fetchUniversityNames();
    const matchedName = names.find((name) => buildTenantSlug(name) === targetSlug);

    if (matchedName) {
      this.resolvedTenantName = matchedName;
      return matchedName;
    }

    return undefined;
  }

  async getBootstrapUniversityName(): Promise<string | undefined> {
    const cached = readTenantDirectory()[0]?.name;
    if (cached) return cached;

    const names = await this.fetchUniversityNames();
    return names[0];
  }

  private async buildHeaders(options?: RequestOptions): Promise<HeadersMap> {
    const headers: HeadersMap = {};

    if (options?.includeJsonContentType !== false) {
      headers['Content-Type'] = 'application/json';
    }

    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const explicitTenant = options?.extraHeaders?.[TENANT_HEADER];
    if (explicitTenant) {
      headers[TENANT_HEADER] = explicitTenant;
      return { ...headers, ...options.extraHeaders };
    }

    if (options?.bootstrapTenantName) {
      headers[TENANT_HEADER] = options.bootstrapTenantName;
    } else if (options?.requireResolvedTenant) {
      const tenantName = await this.resolveTenantName();
      if (!tenantName) {
        throw new Error(
          'Could not resolve the current university. Make sure the tenant subdomain matches a real university name.',
        );
      }
      headers[TENANT_HEADER] = tenantName;
    }

    return { ...headers, ...options?.extraHeaders };
  }

  async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    const headers = await this.buildHeaders(options);
    let response: Response;

    try {
      response = await fetch(`${API_PREFIX}${endpoint}`, {
        method,
        cache: 'no-store',
        headers,
        body:
          body === undefined
            ? undefined
            : options?.includeJsonContentType === false
              ? (body as BodyInit)
              : JSON.stringify(body),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Network request failed';
      throw new HttpRequestError(message);
    }

    return this.handleResponse<T>(response);
  }

  async validateCurrentTenant(): Promise<boolean> {
    if (this.tenantContext.isSuperAdmin) return true;

    try {
      const profile = await this.getCurrentTenantProfile();
      return profile.is_active;
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 404) {
        return false;
      }

      throw error;
    }
  }

  async getCurrentTenantProfile(): Promise<PublicTenantProfile> {
    if (this.tenantContext.isSuperAdmin || !this.tenantContext.subdomain) {
      throw new Error('No tenant context detected for public tenant profile lookup.');
    }

    if (this.tenantProfileRequest) {
      return this.tenantProfileRequest;
    }

    const elapsedSinceLastFailure = Date.now() - this.tenantProfileFailureAt;
    if (
      this.tenantProfileFailureAt > 0 &&
      elapsedSinceLastFailure < HttpClient.TENANT_PROFILE_RETRY_COOLDOWN_MS
    ) {
      throw new Error('Tenant profile lookup is temporarily unavailable. Please try again in a moment.');
    }

    this.tenantProfileRequest = (async () => {
      const response = await this.retry(() =>
        this.request<PublicTenantProfile>(
          'GET',
          `/university/public/${encodeURIComponent(this.tenantContext.subdomain)}`,
        ),
      );

      if (!response.data) {
        throw new Error(response.message || 'Tenant not found');
      }

      rememberTenantDirectoryEntry(response.data.name, response.data.db_schema);
      this.resolvedTenantName = response.data.name;
      this.tenantProfileFailureAt = 0;

      return response.data;
    })();

    try {
      return await this.tenantProfileRequest;
    } catch (error) {
      this.tenantProfileFailureAt = Date.now();
      throw error;
    } finally {
      this.tenantProfileRequest = undefined;
    }
  }

  isSuperAdmin(): boolean {
    return this.tenantContext.isSuperAdmin;
  }

  getTenantContext(): TenantContext {
    return this.tenantContext;
  }

  getApiBaseUrl(): string {
    return this.tenantContext.apiBaseUrl;
  }

  isAuthenticated(): boolean {
    return !!getStoredToken();
  }

  getCurrentUser(): User | null {
    return getStoredUser();
  }

  getTokenValue(): string | null {
    return getStoredToken();
  }
}

export const httpClient = new HttpClient();
