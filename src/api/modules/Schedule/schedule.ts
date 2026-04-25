import { GetScheduleResponse } from 'src/api/types/schedule';
import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  TimetableSaveLevelInput,
  TimetableSaveResult,
} from '../../types';

function withSemesterHeader(semesterId: number) {
  return {
    requireResolvedTenant: true,
    extraHeaders: {
      'semester-id': String(semesterId),
    },
  } as const;
}

export const scheduleApi = {
  getSchedule(
    programId: number,
    academicLevel: number,
    semesterId: number,
    facultyId: number,
  ): Promise<ApiResponse<GetScheduleResponse>> {
    const query = new URLSearchParams({
      programId: String(programId),
      academicLevel: String(academicLevel),
      facultyId: String(facultyId),
    });

    return httpClient.request<GetScheduleResponse>(
      'GET',
      `/schedule?${query.toString()}`,
      undefined,
      withSemesterHeader(semesterId),
    );
  },

  saveSchedule(
    payload: TimetableSaveLevelInput,
    semesterId: number,
  ): Promise<ApiResponse<TimetableSaveResult>> {
    return httpClient.request<TimetableSaveResult>(
      'PUT',
      '/schedule',
      payload,
      withSemesterHeader(semesterId),
    );
  },
};
