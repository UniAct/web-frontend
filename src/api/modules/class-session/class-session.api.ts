import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  TimetableLevelResponse,
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

export const classSessionApi = {
  getLevelTimetable(
    programId: number,
    academicLevel: number,
    semesterId: number,
  ): Promise<ApiResponse<TimetableLevelResponse>> {
    const query = new URLSearchParams({
      programId: String(programId),
      academicLevel: String(academicLevel),
    });

    return httpClient.request<TimetableLevelResponse>(
      'GET',
      `/class-session/level?${query.toString()}`,
      undefined,
      withSemesterHeader(semesterId),
    );
  },

  saveLevelTimetable(
    payload: TimetableSaveLevelInput,
    semesterId: number,
  ): Promise<ApiResponse<TimetableSaveResult>> {
    return httpClient.request<TimetableSaveResult>(
      'PUT',
      '/class-session/level',
      payload,
      withSemesterHeader(semesterId),
    );
  },
};
