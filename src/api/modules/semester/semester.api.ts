import { httpClient } from '../../core/http-client';
import type { ApiResponse, Semester, SemesterCreateInput, SemesterUpdateInput } from '../../types';

export const semesterApi = {
  createSemester(data: SemesterCreateInput): Promise<ApiResponse<Semester>> {
    return httpClient.request<Semester>('POST', '/semester', data, {
      requireResolvedTenant: true,
    });
  },

  getSemesters(): Promise<ApiResponse<Semester[]>> {
    return httpClient.request<Semester[]>('GET', '/semester', undefined, {
      requireResolvedTenant: true,
    });
  },

  getSemesterById(id: number): Promise<ApiResponse<Semester>> {
    return httpClient.request<Semester>('GET', `/semester/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  updateSemester(id: number, data: SemesterUpdateInput): Promise<ApiResponse<Semester>> {
    return httpClient.request<Semester>('PUT', `/semester/${id}`, data, {
      requireResolvedTenant: true,
    });
  },

  deleteSemester(id: number): Promise<ApiResponse<void>> {
    return httpClient.request<void>('DELETE', `/semester/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },
};
