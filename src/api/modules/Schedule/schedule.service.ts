import { scheduleApi } from './schedule';
import type {
  GetScheduleResponse,
  ScheduleSlot,
  TimetableSaveLevelInput,
  TimetableSaveResult,
} from '../../types';

export const ScheduleService = {
  async getSchedule(
    programId: number,
    academicLevel: number,
    semesterId: number,
  ): Promise<GetScheduleResponse> {
    const res = await scheduleApi.getSchedule(programId, academicLevel, semesterId);
    if (!res.data) throw new Error(res.message || 'Failed to load timetable');
    return res.data;
  },

  async getScheduleSlots(
    programId: number,
    academicLevel: number,
    semesterId: number,
  ): Promise<ScheduleSlot[]> {
    const res = await scheduleApi.getSchedule(programId, academicLevel, semesterId);
    if (!res.data) throw new Error(res.message || 'Failed to load timetable');

    const payload = res.data as unknown;

    if (Array.isArray(payload)) {
      return payload as ScheduleSlot[];
    }

    const maybeObject = payload as { scheduleSlots?: unknown };
    if (Array.isArray(maybeObject?.scheduleSlots)) {
      return maybeObject.scheduleSlots as ScheduleSlot[];
    }

    return [];
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
