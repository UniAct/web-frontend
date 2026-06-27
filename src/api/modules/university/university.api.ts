import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  PublicTenantProfile,
  University,
  UniversityAnalytics,
  UniversityCreateInput,
  UniversitySettings,
} from '../../types';

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

  getPublicStats(tenantKey: string): Promise<ApiResponse<{ students: number; staff: number; programs: number }>> {
    return httpClient.request<{ students: number; staff: number; programs: number }>(
      'GET',
      `/university/public/${encodeURIComponent(tenantKey)}/stats`,
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

  getSettings(): Promise<ApiResponse<UniversitySettings>> {
    return httpClient.request<UniversitySettings>('GET', '/university/settings', undefined, {
      requireResolvedTenant: true,
    });
  },

  getAnalytics(): Promise<ApiResponse<UniversityAnalytics>> {
    return httpClient.request<UniversityAnalytics>('GET', '/university/analytics', undefined, {
      requireResolvedTenant: true,
    });
  },

  updateSettings(
    data: Partial<Pick<UniversitySettings, 'primary_color' | 'secondary_color' | 'tab_name' | 'logo_url'>>,
  ): Promise<ApiResponse<UniversitySettings>> {
    return httpClient.request<UniversitySettings>('PATCH', '/university/settings', data, {
      requireResolvedTenant: true,
    });
  },

  uploadLogo(file: File): Promise<ApiResponse<{ logo_url: string }>> {
    const form = new FormData();
    form.append('image', file);
    return httpClient.request<{ logo_url: string }>('POST', '/university/settings/logo', form, {
      requireResolvedTenant: true,
      includeJsonContentType: false,
    });
  },

  uploadHeroImage(file: File): Promise<ApiResponse<{ hero_images: string[] }>> {
    const form = new FormData();
    form.append('image', file);
    return httpClient.request<{ hero_images: string[] }>('POST', '/university/settings/hero', form, {
      requireResolvedTenant: true,
      includeJsonContentType: false,
    });
  },

  deleteHeroImage(url: string): Promise<ApiResponse<{ hero_images: string[] }>> {
    return httpClient.request<{ hero_images: string[] }>('DELETE', '/university/settings/hero', { url }, {
      requireResolvedTenant: true,
    });
  },
};
