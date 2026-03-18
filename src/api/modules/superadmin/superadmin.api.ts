import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  AssignRootAccountInput,
  SuperAdmin,
  SuperAdminCreateInput,
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
};
