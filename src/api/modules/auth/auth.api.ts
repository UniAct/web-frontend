import { httpClient } from '../../core/http-client';
import { decodeJwtPayload } from '../../core/jwt';
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

    const sessionUser = decodeJwtPayload(response.data.token) ?? {};
    setStoredSession({ token: response.data.token, user: sessionUser as any });
    httpClient.syncResolvedTenantFromSession();
    return { token: response.data.token, user: sessionUser as any };
  },

  async loginSuperAdmin(email: string, password: string): Promise<LoginResponse> {
    const response = await httpClient.request<LoginResponse>('POST', '/superadmin/login', {
      email,
      password,
    });

    if (!response.data) {
      throw new Error(response.message || 'Login failed: no session data received');
    }

    const sessionUser = decodeJwtPayload(response.data.token) ?? {};
    setStoredSession({ token: response.data.token, user: sessionUser as any }, 'superadmin');
    httpClient.syncResolvedTenantFromSession();
    return { token: response.data.token, user: sessionUser as any };
  },

  logout(): void {
    clearStoredSession();
    httpClient.clearResolvedTenant();
  },
};
