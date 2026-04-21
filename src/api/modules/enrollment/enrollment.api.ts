import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  EnrollmentStatusResponse,
  EnrollmentSubmitInput,
  EnrollmentSubmitResponse,
} from '../../types';

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
};
