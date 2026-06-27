import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  AdminEnrollmentCreateInput,
  AdminEnrollmentListQuery,
  AdminEnrollmentListResponse,
  AdminEnrollmentOptionsResponse,
  AdminEnrollmentRecord,
  AdminEnrollmentStudentTrackResponse,
  AdminEnrollmentUpdateInput,
  EnrollmentStatusResponse,
  EnrollmentSubmitInput,
  EnrollmentSubmitResponse,
} from '../../types';

function appendQuery(endpoint: string, query?: AdminEnrollmentListQuery): string {
  if (!query) return endpoint;
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });
  const qs = searchParams.toString();
  return qs ? `${endpoint}?${qs}` : endpoint;
}

export const enrollmentApi = {
  submitEnrollment(data: EnrollmentSubmitInput): Promise<ApiResponse<EnrollmentSubmitResponse>> {
    return httpClient.request<EnrollmentSubmitResponse>('POST', '/schedule/enroll', data, {
      requireResolvedTenant: true,
    });
  },

  getEnrollmentStatus(jobId: string): Promise<ApiResponse<EnrollmentStatusResponse>> {
    return httpClient.request<EnrollmentStatusResponse>('GET', `/job/student-enrollment/${jobId}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getAdminEnrollments(query?: AdminEnrollmentListQuery): Promise<ApiResponse<AdminEnrollmentListResponse>> {
    return httpClient.request<AdminEnrollmentListResponse>(
      'GET',
      appendQuery('/schedule/admin/enrollments', query),
      undefined,
      { requireResolvedTenant: true },
    );
  },

  getAdminEnrollmentOptions(query?: AdminEnrollmentListQuery): Promise<ApiResponse<AdminEnrollmentOptionsResponse>> {
    return httpClient.request<AdminEnrollmentOptionsResponse>(
      'GET',
      appendQuery('/schedule/admin/enrollments/options', query),
      undefined,
      { requireResolvedTenant: true },
    );
  },

  getAdminStudentTrack(
    studentId: number,
    query?: AdminEnrollmentListQuery,
  ): Promise<ApiResponse<AdminEnrollmentStudentTrackResponse>> {
    return httpClient.request<AdminEnrollmentStudentTrackResponse>(
      'GET',
      appendQuery(`/schedule/admin/enrollments/students/${studentId}`, query),
      undefined,
      { requireResolvedTenant: true },
    );
  },

  createAdminEnrollment(data: AdminEnrollmentCreateInput): Promise<ApiResponse<AdminEnrollmentRecord>> {
    return httpClient.request<AdminEnrollmentRecord>('POST', '/schedule/admin/enrollments', data, {
      requireResolvedTenant: true,
    });
  },

  updateAdminEnrollment(id: number, data: AdminEnrollmentUpdateInput): Promise<ApiResponse<AdminEnrollmentRecord>> {
    return httpClient.request<AdminEnrollmentRecord>('PATCH', `/schedule/admin/enrollments/${id}`, data, {
      requireResolvedTenant: true,
    });
  },

  deleteAdminEnrollment(id: number): Promise<ApiResponse<AdminEnrollmentRecord>> {
    return httpClient.request<AdminEnrollmentRecord>('DELETE', `/schedule/admin/enrollments/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },
};
