import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  AssignRootAccountInput,
  SuperAdmin,
  SuperAdminCreateInput,
  TenantRootAdmin,
} from '../../types';

export const superAdminApi = {
  createSuperAdmin(data: SuperAdminCreateInput): Promise<ApiResponse<SuperAdmin>> {
    return httpClient.request<SuperAdmin>('POST', '/superadmin/register', data);
  },

  getSuperAdmins(): Promise<ApiResponse<SuperAdmin[]>> {
    return httpClient.request<SuperAdmin[]>('GET', '/superadmin');
  },

  deleteSuperAdmin(username: string): Promise<ApiResponse<void>> {
    return httpClient.request<void>('DELETE', `/superadmin/${encodeURIComponent(username)}`);
  },

  verifyRootAccount(token: string): Promise<ApiResponse<{ message: string }>> {
    return httpClient.request<{ message: string }>('GET', `/superadmin/verify-root-account/${token}`);
  },

  assignRootAccount(data: AssignRootAccountInput): Promise<ApiResponse<void>> {
    return httpClient.request<void>('POST', '/user/assign-root-account', data);
  },

  getTenantRootAdmins(schema: string): Promise<ApiResponse<TenantRootAdmin[]>> {
    return httpClient.request<TenantRootAdmin[]>(
      'GET',
      `/superadmin/tenants/${encodeURIComponent(schema)}/root-admins`,
    );
  },

  updateTenantRootAdminStatus(
    schema: string,
    userId: number,
    data: { isVerified?: boolean; isBlocked?: boolean },
  ): Promise<ApiResponse<TenantRootAdmin>> {
    return httpClient.request<TenantRootAdmin>(
      'PATCH',
      `/superadmin/tenants/${encodeURIComponent(schema)}/root-admins/${userId}/status`,
      data,
    );
  },

  resetTenantRootAdminPassword(
    schema: string,
    userId: number,
    password: string,
  ): Promise<ApiResponse<void>> {
    return httpClient.request<void>(
      'PATCH',
      `/superadmin/tenants/${encodeURIComponent(schema)}/root-admins/${userId}/password`,
      { password },
    );
  },

  resendTenantRootAdminVerification(schema: string, userId: number): Promise<ApiResponse<void>> {
    return httpClient.request<void>(
      'POST',
      `/superadmin/tenants/${encodeURIComponent(schema)}/root-admins/${userId}/resend-verification`,
    );
  },
};
