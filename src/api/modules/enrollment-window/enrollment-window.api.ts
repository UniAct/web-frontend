import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  EnrollmentWindowLookupQuery,
  EnrollmentWindowPayload,
  EnrollmentWindowRecord,
} from '../../types';

function withTenant() {
  return { requireResolvedTenant: true } as const;
}

function toQueryString(query: EnrollmentWindowLookupQuery): string {
  const params = new URLSearchParams({
    facultyId: String(query.facultyId),
    semesterId: String(query.semesterId),
    programLevelId: String(query.programLevelId),
  });

  if (query.programId) {
    params.set('programId', String(query.programId));
  }

  return params.toString();
}

export const enrollmentWindowApi = {
  findConfigured(query: EnrollmentWindowLookupQuery): Promise<ApiResponse<EnrollmentWindowRecord | null>> {
    return httpClient.request<EnrollmentWindowRecord | null>(
      'GET',
      `/enrollment-window/configured?${toQueryString(query)}`,
      undefined,
      withTenant(),
    );
  },

  create(payload: EnrollmentWindowPayload): Promise<ApiResponse<EnrollmentWindowRecord>> {
    return httpClient.request<EnrollmentWindowRecord>(
      'POST',
      '/enrollment-window',
      payload,
      withTenant(),
    );
  },

  update(id: number, payload: Partial<EnrollmentWindowPayload>): Promise<ApiResponse<EnrollmentWindowRecord>> {
    return httpClient.request<EnrollmentWindowRecord>(
      'PUT',
      `/enrollment-window/${id}`,
      payload,
      withTenant(),
    );
  },
};
