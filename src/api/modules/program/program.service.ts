import { programApi } from './program.api';
import type {
  AcademicLoadGPA,
  AcademicLoadSemester,
  Program,
  ProgramCreateInput,
  ProgramFee,
  ProgramLevel,
  ProgramTranscriptDefinition,
  ProgramUpdateInput,
} from '../../types';

interface RawProgram {
  id: number;
  name: string;
  description?: string;
  facultyId: number;
  headId?: number | null;
  phone?: string;
  universityCreditHours?: number;
  facultyCreditHours?: number;
  programCreditHours?: number;
  programType: Program['programType'];
  resultDisplay?: Program['resultDisplay'];
  blockReason?: Program['blockReason'];
  createdAt?: string;
  updatedAt?: string;
  programLevels?: Array<{
    id: number;
    level: number;
    minCredits: number;
    maxCredits: number;
    fees?: Array<{
      id: number;
      feeType: ProgramFee['feeType'];
      semesterId?: number | null;
      semester?: { number?: number } | null;
      amount: number | string;
      description?: string | null;
    }>;
  }>;
  programTranscriptDefs?: Array<{
    id: number;
    minScore: number | string;
    maxScore: number | string;
    minGpa: number | string;
    maxGpa: number | string;
    gradeLetter: string;
    equivalentEstimate?: string | null;
  }>;
  academicLoadSemesters?: Array<{
    id: number;
    minCredits: number;
    maxCredits: number;
    semester?: { number?: number } | null;
    programLevel?: { level?: number } | null;
  }>;
  academicLoadGPAs?: Array<{
    id: number;
    minGpa: number | string;
    maxGpa: number | string;
    minCredits: number;
    maxCredits: number;
  }>;
}

function toNumber(value: number | string | undefined | null): number {
  if (value === undefined || value === null) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mapProgramLevel(raw: NonNullable<RawProgram['programLevels']>[number]): ProgramLevel {
  return {
    id: raw.id,
    level: raw.level,
    minCredits: raw.minCredits,
    maxCredits: raw.maxCredits,
    fees: (raw.fees ?? []).map((fee) => ({
      id: fee.id,
      feeType: fee.feeType,
      semesterId: fee.semesterId ?? undefined,
      semesterNumber: fee.semester?.number ?? undefined,
      amount: toNumber(fee.amount),
      description: fee.description ?? undefined,
    })),
  };
}

function mapTranscriptDefinition(
  raw: NonNullable<RawProgram['programTranscriptDefs']>[number],
): ProgramTranscriptDefinition {
  return {
    id: raw.id,
    minScore: toNumber(raw.minScore),
    maxScore: toNumber(raw.maxScore),
    minGPA: toNumber(raw.minGpa),
    maxGPA: toNumber(raw.maxGpa),
    gradeLetter: raw.gradeLetter,
    equivalentEstimate: raw.equivalentEstimate ?? undefined,
  };
}

function mapAcademicLoadSemester(
  raw: NonNullable<RawProgram['academicLoadSemesters']>[number],
): AcademicLoadSemester {
  return {
    id: raw.id,
    level: raw.programLevel?.level ?? 0,
    semester: raw.semester?.number ?? 0,
    minCredits: raw.minCredits,
    maxCredits: raw.maxCredits,
  };
}

function mapAcademicLoadGPA(raw: NonNullable<RawProgram['academicLoadGPAs']>[number]): AcademicLoadGPA {
  return {
    id: raw.id,
    minGPA: toNumber(raw.minGpa),
    maxGPA: toNumber(raw.maxGpa),
    minCredits: raw.minCredits,
    maxCredits: raw.maxCredits,
  };
}

function mapProgram(raw: RawProgram): Program {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    facultyId: raw.facultyId,
    headId: raw.headId ?? undefined,
    phone: raw.phone,
    universityCreditHours: raw.universityCreditHours ?? 0,
    facultyCreditHours: raw.facultyCreditHours ?? 0,
    programCreditHours: raw.programCreditHours ?? 0,
    programType: raw.programType,
    resultDisplay: raw.resultDisplay ?? 'CourseGrade',
    blockReason: raw.blockReason ?? undefined,
    levelsNumber: raw.programLevels?.length ?? 0,
    levels: (raw.programLevels ?? []).map(mapProgramLevel),
    transcriptDefinition: (raw.programTranscriptDefs ?? []).map(mapTranscriptDefinition),
    academicLoadSemester: (raw.academicLoadSemesters ?? []).map(mapAcademicLoadSemester),
    academicLoadGPA: (raw.academicLoadGPAs ?? []).map(mapAcademicLoadGPA),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const ProgramService = {
  async getAll(): Promise<Program[]> {
    const res = await programApi.getPrograms();
    if (!res.data) throw new Error(res.message || 'Failed to fetch programs');
    return (res.data as unknown as RawProgram[]).map(mapProgram);
  },

  async getById(id: number): Promise<Program> {
    const res = await programApi.getProgramById(id);
    if (!res.data) throw new Error(res.message || 'Program not found');
    return mapProgram(res.data as unknown as RawProgram);
  },

  async create(data: ProgramCreateInput): Promise<Program> {
    const res = await programApi.createProgram(data);
    if (!res.data) throw new Error(res.message || 'Failed to create program');
    return mapProgram(res.data as unknown as RawProgram);
  },

  async update(id: number, data: ProgramUpdateInput): Promise<Program> {
    const res = await programApi.updateProgram(id, data);
    if (!res.data) throw new Error(res.message || 'Failed to update program');
    return mapProgram(res.data as unknown as RawProgram);
  },

  async delete(id: number): Promise<void> {
    await programApi.deleteProgram(id);
  },
};
