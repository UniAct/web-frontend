import { httpClient } from '../../core/http-client';
import type { ApiResponse, PublicTenantProfile, University, UniversityCreateInput } from '../../types';

export const universityApi = {
  createUniversity(data: UniversityCreateInput): Promise<ApiResponse<University>> {
    return httpClient.request<University>('POST', '/university/create', data);
  },

  listUniversities(): Promise<ApiResponse<string[]>> {
    return httpClient.request<string[]>('GET', '/university/list');
  },

  getPublicTenantProfile(tenantKey: string): Promise<ApiResponse<PublicTenantProfile>> {
    return httpClient.request<PublicTenantProfile>(
      'GET',
      `/university/public/${encodeURIComponent(tenantKey)}`,
    );
  },

  getUniversities(): Promise<ApiResponse<University[]>> {
    return httpClient.request<University[]>('GET', '/university');
  },

  getTenants(): Promise<ApiResponse<University[]>> {
    return this.getUniversities();
  },

  getUniversityById(id: number): Promise<ApiResponse<University>> {
    return httpClient.request<University>('GET', `/university/${id}`);
  },

  activateUniversity(id: number): Promise<ApiResponse<University>> {
    return httpClient.request<University>('PUT', `/university/${id}/activate`);
  },

  deactivateUniversity(id: number): Promise<ApiResponse<University>> {
    return httpClient.request<University>('PUT', `/university/${id}/deactivate`);
  },

  deleteUniversity(id: number): Promise<ApiResponse<void>> {
    return httpClient.request<void>('DELETE', `/university/${id}`);
  },
};
