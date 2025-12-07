/**
 * API CLIENT - TENANT-AWARE
 * 
 * Automatically detects tenant from browser hostname and routes requests appropriately.
 * Handles all backend API calls with proper authentication and tenant isolation.
 * 
 * Features:
 * - Automatic JWT token management
 * - Automatic tenant detection via subdomain
 * - Request/response logging
 * - Error handling with user-friendly messages
 * - Type-safe response types
 */

import { TenantDetectionService, type TenantContext } from '../services/TenantDetectionService';

// ==================== RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  permissions?: string[];
  tenant_id?: number;
}

export interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  db_schema: string;
  is_active: boolean;
  created_at?: string;
  university_id?: number;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  name: string;
  description?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SuperAdmin {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

// ==================== API CLIENT ====================

class ApiClient {
  private tenantContext: TenantContext;

  constructor() {
    this.tenantContext = TenantDetectionService.detectTenant();
    console.log('[ApiClient] Initialized with context:', this.tenantContext);
    console.log(`[ApiClient] Using /api prefix (proxied by Vite to ${this.tenantContext.apiBaseUrl})`);
  }

  // ==================== PRIVATE METHODS ====================

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add JWT token if available
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Host header is automatically sent by browser, but we can ensure it
    // The browser will send the current host based on what domain is being accessed
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!isJson) {
      // Handle non-JSON responses (error pages, etc)
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      return {
        status: 'success',
        data: text as any as T,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.message || `HTTP ${response.status}`;
      console.error(`[ApiClient] Error response:`, data);
      throw new Error(errorMessage);
    }

    return data;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    isFormData: boolean = false
  ): Promise<ApiResponse<T>> {
    // Use /api prefix which Vite Dev Server will proxy to the correct backend
    // For http://localhost:5173 → proxies to http://localhost:3000
    // For http://anu:5173 → proxies to http://anu:3000
    // For http://auc:5173 → proxies to http://auc:3000
    const url = `/api${endpoint}`;
    
    console.log(`[ApiClient] ${method} ${url}`);

    try {
      const options: RequestInit = {
        method,
        headers: isFormData ? {} : this.getHeaders(),
      };

      // Add JWT token
      const token = localStorage.getItem('token');
      if (token && !isFormData) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        };
      }

      if (body) {
        if (isFormData) {
          // For FormData, let browser set Content-Type
          options.body = body;
        } else {
          options.body = JSON.stringify(body);
        }
      }

      const response = await fetch(url, options);
      const result = await this.handleResponse<T>(response);
      
      console.log(`[ApiClient] Response (${response.status}):`, result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ApiClient] Request failed:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Staff login with email and password
   * Only available in tenant-specific context (not superadmin)
   */
  async loginStaff(email: string, password: string): Promise<LoginResponse> {
    if (this.tenantContext.isSuperAdmin) {
      throw new Error('Staff login only available in tenant context. Access via tenant subdomain.');
    }

    const response = await this.request<LoginResponse>(
      'POST',
      '/user/login',
      { email, password }
    );

    if (!response.data) {
      throw new Error('Login failed: No token received');
    }

    // Store token and user
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  }

  /**
   * SuperAdmin login
   * Only available from superadmin context (localhost)
   */
  async loginSuperAdmin(email: string, password: string): Promise<LoginResponse> {
    if (!this.tenantContext.isSuperAdmin) {
      throw new Error('SuperAdmin login only available from main domain');
    }

    const response = await this.request<LoginResponse>(
      'POST',
      '/superadmin/login',
      { email, password }
    );

    if (!response.data) {
      throw new Error('Login failed: No token received');
    }

    // Store token and user
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('role', 'superadmin');

    return response.data;
  }

  /**
   * Logout user (valid for both staff and superadmin)
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('availableTenants');
    console.log('[ApiClient] User logged out');
  }

  // ==================== SUPERADMIN ENDPOINTS ====================
  // Available only when accessing from superadmin context (localhost)

  /**
   * Create new tenant (SuperAdmin only)
   */
  async createTenant(data: {
    name: string;
    subdomain: string;
    db_schema: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  }): Promise<ApiResponse<Tenant>> {
    return this.request<Tenant>('POST', '/tenant/create', data);
  }

  /**
   * Get all tenants (SuperAdmin only)
   */
  async getTenants(): Promise<ApiResponse<Tenant[]>> {
    return this.request<Tenant[]>('GET', '/tenant');
  }

  /**
   * Get tenant by ID (SuperAdmin only)
   */
  async getTenantById(id: number): Promise<ApiResponse<Tenant>> {
    return this.request<Tenant>('GET', `/tenant/${id}`);
  }

  /**
   * Update tenant (SuperAdmin only)
   */
  async updateTenant(id: number, data: Partial<Tenant>): Promise<ApiResponse<Tenant>> {
    return this.request<Tenant>('PUT', `/tenant/${id}`, data);
  }

  /**
   * Delete tenant (SuperAdmin only)
   */
  async deleteTenant(id: number): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/tenant/${id}`);
  }

  /**
   * Create SuperAdmin user
   */
  async createSuperAdmin(data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse<SuperAdmin>> {
    return this.request<SuperAdmin>('POST', '/superadmin/register', data);
  }

  /**
   * Get all SuperAdmins
   */
  async getSuperAdmins(): Promise<ApiResponse<SuperAdmin[]>> {
    return this.request<SuperAdmin[]>('GET', '/superadmin');
  }

  /**
   * Verify root account with token
   * @param token Verification token sent to root admin email
   */
  async verifyRootAccount(token: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('GET', `/superadmin/verify-root-account/${token}`);
  }

  /**
   * Assign root account (create first admin for a university/tenant)
   * @param data Root account details including university name and personal info
   */
  async assignRootAccount(data: {
    university_name: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone?: string;
    date_of_birth?: string;
    address?: string;
    city?: string;
    country?: string;
    national_id?: string;
  }): Promise<ApiResponse<void>> {
    return this.request<void>('POST', '/superadmin/assign-root-account', data);
  }

  // ==================== STAFF ENDPOINTS ====================
  // Available in tenant-specific context

  /**
   * Create staff account with CV file
   * @param data Staff account details
   * @param cvFile PDF file for CV
   */
  async createStaffAccount(
    data: {
      username: string;
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      national_id?: string;
      address?: string;
      city?: string;
      country?: string;
      position?: string;
      hire_date?: string;
      salary?: number;
    },
    cvFile?: File
  ): Promise<ApiResponse<User>> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (cvFile) {
      formData.append('cv', cvFile);
    }

    return this.request<User>('POST', '/user', formData, true);
  }

  /**
   * Get all staff/users in tenant
   */
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('GET', '/user');
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<ApiResponse<User>> {
    return this.request<User>('GET', `/user/${id}`);
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/user/${id}`);
  }

  // ==================== RBAC ENDPOINTS ====================
  // Available in tenant-specific context

  /**
   * Create role
   */
  async createRole(data: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<Role>> {
    return this.request<Role>('POST', '/rbac/role', data);
  }

  /**
   * Get all roles
   */
  async getRoles(): Promise<ApiResponse<Role[]>> {
    return this.request<Role[]>('GET', '/rbac/role');
  }

  /**
   * Update role
   */
  async updateRole(id: number, data: Partial<Role>): Promise<ApiResponse<Role>> {
    return this.request<Role>('PUT', `/rbac/role/${id}`, data);
  }

  /**
   * Delete role
   */
  async deleteRole(id: number): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/rbac/role/${id}`);
  }

  /**
   * Assign permissions to role
   */
  async assignPermissionsToRole(
    roleId: number,
    permissions: string[]
  ): Promise<ApiResponse<Role>> {
    return this.request<Role>('POST', '/rbac/assign-permissions', {
      roleId,
      permissions,
    });
  }

  /**
   * Get all available permissions
   */
  async getPermissions(): Promise<ApiResponse<Permission[]>> {
    return this.request<Permission[]>('GET', '/rbac/permission');
  }

  /**
   * Assign roles to user
   */
  async assignRolesToUser(
    userId: number,
    roleIds: number[]
  ): Promise<ApiResponse<void>> {
    return this.request<void>('POST', '/rbac/assign-roles', {
      userId,
      roleIds,
    });
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: number): Promise<ApiResponse<Role[]>> {
    return this.request<Role[]>('GET', `/rbac/user-roles/${userId}`);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if currently in superadmin context
   */
  isSuperAdmin(): boolean {
    return this.tenantContext.isSuperAdmin;
  }

  /**
   * Get current tenant info
   */
  getTenantContext(): TenantContext {
    return this.tenantContext;
  }

  /**
   * Get API base URL
   */
  getApiBaseUrl(): string {
    return this.tenantContext.apiBaseUrl;
  }

  /**
   * Refresh tenant context (call if hostname changes)
   */
  refreshTenantContext(): void {
    this.tenantContext = TenantDetectionService.detectTenant();
    console.log('[ApiClient] Tenant context refreshed:', this.tenantContext);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | null {
    try {
      const userJson = localStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get JWT token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
