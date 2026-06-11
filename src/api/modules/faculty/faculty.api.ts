import { httpClient } from '../../core/http-client';
import type { ApiResponse, Faculty, FacultyCreateInput, FacultyUpdateInput, Program } from '../../types';

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

  getPublicFaculties(schema: string): Promise<ApiResponse<Array<{
    id: number;
    name: string;
    description?: string;
    programs: string[];
    students: number;
    years: number;
  }>>> {
    return httpClient.request<Array<{
      id: number;
      name: string;
      description?: string;
      programs: string[];
      students: number;
      years: number;
    }>>('GET', `/faculty/public/${encodeURIComponent(schema)}/faculties`);
  },

  getFacultyById(id: number): Promise<ApiResponse<Faculty>> {
    return httpClient.request<Faculty>('GET', `/faculty/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getProgramsByFacultyId(faclutyId: number): Promise<ApiResponse<Program[]>> {
    return httpClient.request<Program[]>('GET', `/faculty/${faclutyId}/programs`, undefined, {
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
