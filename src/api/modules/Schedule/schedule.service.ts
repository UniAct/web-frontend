import { scheduleApi } from './schedule';
import { ProgramService } from '../program/program.service';
import type {
  GetScheduleResponse,
  ScheduleSlot,
  TimetableSaveLevelInput,
  TimetableSaveResult,
} from '../../types';

const programFacultyCache = new Map<number, number>();
const programListFacultyCache = new Map<number, number>();

function toPositiveInt(value: unknown): number | null {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

async function resolveFacultyId(programId: number, facultyId?: number): Promise<number> {
  const explicitFacultyId = toPositiveInt(facultyId);
  if (explicitFacultyId !== null) {
    return explicitFacultyId;
  }

  const cachedFacultyId = programFacultyCache.get(programId);
  if (cachedFacultyId) {
    return cachedFacultyId;
  }

  const program = await ProgramService.getById(programId);
  const resolvedFacultyId = toPositiveInt(program.facultyId);

  if (resolvedFacultyId !== null) {
    programFacultyCache.set(programId, resolvedFacultyId);
    return resolvedFacultyId;
  }

  const cachedListFacultyId = programListFacultyCache.get(programId);
  if (cachedListFacultyId) {
    programFacultyCache.set(programId, cachedListFacultyId);
    return cachedListFacultyId;
  }

  const programs = await ProgramService.getAll();
  const programFromList = programs.find((item) => item.id === programId);
  const listFacultyId = toPositiveInt(programFromList?.facultyId);

  if (listFacultyId === null) {
    throw new Error('Unable to resolve faculty context for schedule request.');
  }

  programFacultyCache.set(programId, listFacultyId);
  programListFacultyCache.set(programId, listFacultyId);
  return listFacultyId;
}

export const ScheduleService = {
  async getSchedule(
    programId: number,
    academicLevel: number,
    semesterId: number,
    facultyId?: number,
  ): Promise<GetScheduleResponse> {
    const resolvedFacultyId = await resolveFacultyId(programId, facultyId);
    const res = await scheduleApi.getSchedule(programId, academicLevel, semesterId, resolvedFacultyId);
    if (!res.data) throw new Error(res.message || 'Failed to load timetable');
    return res.data;
  },

  async getScheduleSlots(
    programId: number,
    academicLevel: number,
    semesterId: number,
    facultyId?: number,
  ): Promise<ScheduleSlot[]> {
    const resolvedFacultyId = await resolveFacultyId(programId, facultyId);
    const res = await scheduleApi.getSchedule(programId, academicLevel, semesterId, resolvedFacultyId);
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
