import { scheduleApi } from './schedule';
import type {
  getScheduleResponse,
  TimetableSaveLevelInput,
  TimetableSaveResult,
} from '../../types';

export const ScheduleService = {
  async getSchedule(
    programId: number,
    academicLevel: number,
    semesterId: number,
  ): Promise<getScheduleResponse> {
    const res = await scheduleApi.getSchedule(programId, academicLevel, semesterId);
    if (!res.data) throw new Error(res.message || 'Failed to load timetable');
    return res.data;
  },

  async saveSchedule(
    payload: TimetableSaveLevelInput,
    semesterId: number,
  ): Promise<TimetableSaveResult> {
    const res = await scheduleApi.saveSchedule(payload, semesterId);
    if (!res.data) throw new Error(res.message || 'Failed to save timetable');
    return res.data;
  },
};
