import { enrollmentApi } from './enrollment.api';
import type {
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
}
