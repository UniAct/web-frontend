import { enrollmentApi } from './enrollment.api';
import type {
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

export class EnrollmentService {
  static async submitEnrollment(data: EnrollmentSubmitInput): Promise<EnrollmentSubmitResponse> {
    const response = await enrollmentApi.submitEnrollment(data);

    if (!response.data) {
      throw new Error(response.message || 'Failed to submit enrollment');
    }

    return {
      ...response.data,
      message: response.message,
    };
  }

  static async getEnrollmentStatus(jobId: string): Promise<EnrollmentStatusResponse> {
    const response = await enrollmentApi.getEnrollmentStatus(jobId);

    if (!response.data) {
      throw new Error(response.message || 'Failed to load enrollment status');
    }

    return response.data;
  }

  static async getAdminEnrollments(query?: AdminEnrollmentListQuery): Promise<AdminEnrollmentListResponse> {
    const response = await enrollmentApi.getAdminEnrollments(query);
    if (!response.data) {
      throw new Error(response.message || 'Failed to load enrollments');
    }
    return response.data;
  }

  static async getAdminEnrollmentOptions(query?: AdminEnrollmentListQuery): Promise<AdminEnrollmentOptionsResponse> {
    const response = await enrollmentApi.getAdminEnrollmentOptions(query);
    if (!response.data) {
      throw new Error(response.message || 'Failed to load enrollment options');
    }
    return response.data;
  }

  static async getAdminStudentTrack(
    studentId: number,
    query?: AdminEnrollmentListQuery,
  ): Promise<AdminEnrollmentStudentTrackResponse> {
    const response = await enrollmentApi.getAdminStudentTrack(studentId, query);
    if (!response.data) {
      throw new Error(response.message || 'Failed to load student enrollment track');
    }
    return response.data;
  }

  static async createAdminEnrollment(data: AdminEnrollmentCreateInput): Promise<AdminEnrollmentRecord> {
    const response = await enrollmentApi.createAdminEnrollment(data);
    if (!response.data) {
      throw new Error(response.message || 'Failed to create enrollment');
    }
    return response.data;
  }

  static async updateAdminEnrollment(id: number, data: AdminEnrollmentUpdateInput): Promise<AdminEnrollmentRecord> {
    const response = await enrollmentApi.updateAdminEnrollment(id, data);
    if (!response.data) {
      throw new Error(response.message || 'Failed to update enrollment');
    }
    return response.data;
  }

  static async deleteAdminEnrollment(id: number): Promise<AdminEnrollmentRecord> {
    const response = await enrollmentApi.deleteAdminEnrollment(id);
    if (!response.data) {
      throw new Error(response.message || 'Failed to delete enrollment');
    }
    return response.data;
  }
}
