import { authApi } from './auth.api';
import { httpClient } from '../../core/http-client';
import type { LoginResponse } from '../../types';

export const AuthService = {
  loginStaff(email: string, password: string): Promise<LoginResponse> {
    return authApi.loginStaff(email, password);
  },

  loginSuperAdmin(email: string, password: string): Promise<LoginResponse> {
    return authApi.loginSuperAdmin(email, password);
  },

  logout(): void {
    authApi.logout();
  },

  isAuthenticated(): boolean {
    return httpClient.isAuthenticated();
  },

  isSuperAdmin(): boolean {
    return httpClient.isSuperAdmin();
  },
};
