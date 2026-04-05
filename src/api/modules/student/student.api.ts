import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  CreateStudentInput,
  StudentImportStartResponse,
  StudentImportStatusResponse,
  StudentListQuery,
  StudentListResponse,
  StudentWriteResponse,
  UpdateStudentInput,
} from '../../types';

function appendQueryParams(endpoint: string, query?: StudentListQuery): string {
  if (!query) return endpoint;

  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });

  const qs = searchParams.toString();
  return qs ? `${endpoint}?${qs}` : endpoint;
}

export const studentApi = {
  getStudents(query?: StudentListQuery): Promise<ApiResponse<StudentListResponse>> {
    return httpClient.request<StudentListResponse>(
      'GET',
      appendQueryParams('/user/account/student', query),
      undefined,
      { requireResolvedTenant: true },
    );
  },

  createStudent(data: CreateStudentInput): Promise<ApiResponse<StudentWriteResponse>> {
    return httpClient.request<StudentWriteResponse>('POST', '/user/account/student', data, {
      requireResolvedTenant: true,
    });
  },

  updateStudent(id: number, data: UpdateStudentInput): Promise<ApiResponse<StudentWriteResponse>> {
    return httpClient.request<StudentWriteResponse>('PATCH', `/user/account/student/${id}`, data, {
      requireResolvedTenant: true,
    });
  },

  deleteStudent(id: number): Promise<ApiResponse<{ student: StudentWriteResponse }>> {
    return httpClient.request<{ student: StudentWriteResponse }>(
      'DELETE',
      `/user/account/student/${id}`,
      undefined,
      { requireResolvedTenant: true },
    );
  },

  activateStudent(id: number): Promise<ApiResponse<void>> {
    return httpClient.request<void>('PATCH', `/user/account/student/${id}/activate`, undefined, {
      requireResolvedTenant: true,
    });
  },

  importStudents(file: File, payload: { programId: number; programLevelId: number; semesterId: number }): Promise<ApiResponse<StudentImportStartResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('programId', String(payload.programId));
    formData.append('programLevelId', String(payload.programLevelId));
    formData.append('semesterId', String(payload.semesterId));

    return httpClient.request<StudentImportStartResponse>('POST', '/user/account/student/import', formData, {
      includeJsonContentType: false,
      requireResolvedTenant: true,
    });
  },

  getImportStatus(jobId: string): Promise<ApiResponse<StudentImportStatusResponse>> {
    return httpClient.request<StudentImportStatusResponse>('GET', `/job/student-import/${jobId}`, undefined, {
      requireResolvedTenant: true,
    });
  },
};
