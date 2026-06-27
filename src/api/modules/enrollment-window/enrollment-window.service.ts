import { enrollmentWindowApi } from './enrollment-window.api';
import type {
  EnrollmentWindowLookupQuery,
  EnrollmentWindowPayload,
  EnrollmentWindowRecord,
} from '../../types';

export const EnrollmentWindowService = {
  async findConfigured(query: EnrollmentWindowLookupQuery): Promise<EnrollmentWindowRecord | null> {
    const response = await enrollmentWindowApi.findConfigured(query);
    return response.data ?? null;
  },

  async save(
    currentId: number | null,
    payload: EnrollmentWindowPayload,
  ): Promise<EnrollmentWindowRecord> {
    const response = currentId
      ? await enrollmentWindowApi.update(currentId, payload)
      : await enrollmentWindowApi.create(payload);

    if (!response.data) {
      throw new Error(response.message || 'Failed to save enrollment window');
    }

    return response.data;
  },
};
