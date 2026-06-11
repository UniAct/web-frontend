import { httpClient } from '../../core/http-client';
import type { Announcement, AnnouncementInput, ApiResponse } from '../../types';

export const announcementApi = {
  getAll(): Promise<ApiResponse<Announcement[]>> {
    return httpClient.request<Announcement[]>('GET', '/announcement', undefined, {
      requireResolvedTenant: true,
    });
  },

  getPublic(schema: string): Promise<ApiResponse<Announcement[]>> {
    return httpClient.request<Announcement[]>('GET', `/announcement/public/${encodeURIComponent(schema)}`);
  },

  create(data: AnnouncementInput): Promise<ApiResponse<Announcement>> {
    return httpClient.request<Announcement>('POST', '/announcement', data, {
      requireResolvedTenant: true,
    });
  },

  update(id: number, data: AnnouncementInput): Promise<ApiResponse<Announcement>> {
    return httpClient.request<Announcement>('PUT', `/announcement/${id}`, data, {
      requireResolvedTenant: true,
    });
  },

  delete(id: number): Promise<ApiResponse<void>> {
    return httpClient.request<void>('DELETE', `/announcement/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },
};
