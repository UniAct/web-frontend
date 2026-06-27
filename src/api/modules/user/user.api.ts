import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  StaffAccountCreateInput,
  StaffAccountUpdateInput,
  StaffDirectoryEntry,
  CurrentUserProfile,
  CurrentUserProfileUpdateInput,
  ChangePasswordInput,
} from '../../types';

export const userApi = {
  createStaffAccount(data: StaffAccountCreateInput): Promise<ApiResponse<StaffDirectoryEntry>> {
    return httpClient.request<StaffDirectoryEntry>('POST', '/user/account/staff', data, {
      requireResolvedTenant: true,
    });
  },

  getStaffDirectory(): Promise<ApiResponse<StaffDirectoryEntry[]>> {
    return httpClient.request<StaffDirectoryEntry[]>('GET', '/user/account/staff', undefined, {
      requireResolvedTenant: true,
    });
  },

  updateStaffAccount(id: number, data: StaffAccountUpdateInput): Promise<ApiResponse<StaffDirectoryEntry>> {
    return httpClient.request<StaffDirectoryEntry>('PATCH', `/user/account/staff/${id}`, data, {
      requireResolvedTenant: true,
    });
  },

  deleteStaffAccount(id: number): Promise<ApiResponse<void>> {
    return httpClient.request<void>('DELETE', `/user/account/staff/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getCurrentUserProfile(): Promise<ApiResponse<CurrentUserProfile>> {
    return httpClient.request<CurrentUserProfile>('GET', '/user/me', undefined, {
      requireResolvedTenant: true,
    });
  },

  updateCurrentUserProfile(data: CurrentUserProfileUpdateInput): Promise<ApiResponse<CurrentUserProfile>> {
    return httpClient.request<CurrentUserProfile>('PATCH', '/user/me', data, {
      requireResolvedTenant: true,
    });
  },

  changeCurrentUserPassword(data: ChangePasswordInput): Promise<ApiResponse<void>> {
    return httpClient.request<void>('PATCH', '/user/me/password', data, {
      requireResolvedTenant: true,
    });
  },
};
