import { httpClient } from '../../core/http-client';
import { clearStoredSession, setStoredSession } from '../../core/session-storage';
import type { LoginResponse } from '../../types';

export const authApi = {
  async loginStaff(email: string, password: string): Promise<LoginResponse> {
    if (httpClient.isSuperAdmin()) {
      throw new Error('Staff login is only available from a university tenant domain.');
    }

    const response = await httpClient.request<LoginResponse>(
      'POST',
      '/user/login',
      { email, password },
      { requireResolvedTenant: true },
    );

    if (!response.data) {
      throw new Error(response.message || 'Login failed: no session data received');
    }

    setStoredSession(response.data);
    httpClient.syncResolvedTenantFromSession();
    return response.data;
  },

  async loginSuperAdmin(email: string, password: string): Promise<LoginResponse> {
    const response = await httpClient.request<LoginResponse>('POST', '/superadmin/login', {
      email,
      password,
    });

    if (!response.data) {
      throw new Error(response.message || 'Login failed: no session data received');
    }

    setStoredSession(response.data, 'superadmin');
    httpClient.syncResolvedTenantFromSession();
    return response.data;
  },

  logout(): void {
    clearStoredSession();
    httpClient.clearResolvedTenant();
  },
};
