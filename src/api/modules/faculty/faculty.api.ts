import { httpClient } from '../../core/http-client';
import type { ApiResponse, Faculty, FacultyCreateInput, FacultyUpdateInput } from '../../types';

export const facultyApi = {
  createFaculty(data: FacultyCreateInput): Promise<ApiResponse<Faculty>> {
    return httpClient.request<Faculty>('POST', '/faculty', data, {
      requireResolvedTenant: true,
    });
  },

  getFaculties(): Promise<ApiResponse<Faculty[]>> {
    return httpClient.request<Faculty[]>('GET', '/faculty', undefined, {
      requireResolvedTenant: true,
    });
  },

  getFacultyById(id: number): Promise<ApiResponse<Faculty>> {
    return httpClient.request<Faculty>('GET', `/faculty/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  updateFaculty(id: number, data: FacultyUpdateInput): Promise<ApiResponse<Faculty>> {
    return httpClient.request<Faculty>('PUT', `/faculty/${id}`, data, {
      requireResolvedTenant: true,
    });
  },

  deleteFaculty(id: number): Promise<ApiResponse<void>> {
    return httpClient.request<void>('DELETE', `/faculty/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },
};
