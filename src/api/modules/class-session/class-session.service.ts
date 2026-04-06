import { classSessionApi } from './class-session.api';
import type {
  TimetableLevelResponse,
  TimetableSaveLevelInput,
  TimetableSaveResult,
} from '../../types';

export const ClassSessionService = {
  async getLevelTimetable(
    programId: number,
    academicLevel: number,
    semesterId: number,
  ): Promise<TimetableLevelResponse> {
    const res = await classSessionApi.getLevelTimetable(programId, academicLevel, semesterId);
    if (!res.data) throw new Error(res.message || 'Failed to load timetable');
    return res.data;
  },

  async saveLevelTimetable(
    payload: TimetableSaveLevelInput,
    semesterId: number,
  ): Promise<TimetableSaveResult> {
    const res = await classSessionApi.saveLevelTimetable(payload, semesterId);
    if (!res.data) throw new Error(res.message || 'Failed to save timetable');
    return res.data;
  },
};
