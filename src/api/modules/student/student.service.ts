import { studentApi } from './student.api';
import type {
  CreateStudentInput,
  StudentImportErrorRow,
  StudentImportRequest,
  StudentImportStartResponse,
  StudentImportStatusResponse,
  StudentListQuery,
  StudentListResponse,
  StudentRecord,
  StudentWriteResponse,
  UpdateStudentInput,
} from '../../types';

interface StudentListApiData {
  students?: unknown[];
  pagination?: StudentListResponse['pagination'];
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNumberOrZero(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toStringValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
}

function normalizeStudentRecord(raw: unknown): StudentRecord {
  const record = (raw ?? {}) as Record<string, unknown>;
  const firstName = toStringValue(record.firstName).trim();
  const lastName = toStringValue(record.lastName).trim();
  const combinedName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const fullName = toStringValue(record.fullName).trim() || combinedName || toStringValue(record.username, 'Unknown Student');

  return {
    id: toNumberOrZero(record.id),
    username: toStringValue(record.username),
    firstName,
    lastName,
    fullName,
    email: toStringValue(record.email),
    phone: toStringValue(record.phone),
    city: toStringValue(record.city),
    country: toStringValue(record.country),
    nationalId: toStringValue(record.nationalId),
    isVerified: Boolean(record.isVerified),
    isBlocked: Boolean(record.isBlocked),
    universityStudentId: toNumberOrZero(record.universityStudentId),
    status: (toStringValue(record.status, 'New') as StudentRecord['status']),
    gender: (toStringValue(record.gender, 'M') as StudentRecord['gender']),
    religion: (toStringValue(record.religion, 'M') as StudentRecord['religion']),
    cgpa: toNumberOrNull(record.cgpa),
    enrollmentDate: toStringValue(record.enrollmentDate),
    programId: toNumberOrZero(record.programId),
    programName: toStringValue(record.programName),
    programType: toStringValue(record.programType),
    programLevelId: toNumberOrZero(record.programLevelId),
    programLevelName: toStringValue(record.programLevelName, 'Unknown Level'),
  };
}

function normalizeListResponse(data?: StudentListApiData): StudentListResponse {
  return {
    students: (data?.students ?? []).map(normalizeStudentRecord),
    pagination: data?.pagination ?? {
      totalCount: 0,
      pageNumber: 1,
      pageSize: 20,
      totalPages: 0,
    },
  };
}

function normalizeWriteResponse(payload: any): StudentWriteResponse {
  const direct = payload?.data ?? payload;
  if (!direct) {
    throw new Error('Student payload is missing from server response');
  }

  return direct as StudentWriteResponse;
}

function normalizeImportStatus(payload: StudentImportStatusResponse | undefined): StudentImportStatusResponse {
  return {
    status: payload?.status ?? 'Pending',
    message: payload?.message ?? 'Import status is not available yet.',
    error: (payload?.error as StudentImportErrorRow[] | undefined) ?? undefined,
  };
}

export const StudentService = {
  async getStudents(query?: StudentListQuery): Promise<StudentListResponse> {
    const res = await studentApi.getStudents(query);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Failed to fetch students');
    }

    return normalizeListResponse(res.data as StudentListApiData);
  },

  async createStudent(data: CreateStudentInput): Promise<StudentWriteResponse> {
    const res = await studentApi.createStudent(data);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Failed to create student');
    }

    // Backend currently returns "date.student" instead of "data" in this endpoint.
    const payload = res.data ?? (res as any).date?.student;
    return normalizeWriteResponse(payload);
  },

  async updateStudent(id: number, data: UpdateStudentInput): Promise<StudentWriteResponse> {
    const res = await studentApi.updateStudent(id, data);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Failed to update student');
    }

    return normalizeWriteResponse(res.data);
  },

  async softDeleteStudent(id: number): Promise<StudentWriteResponse> {
    const res = await studentApi.deleteStudent(id);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Failed to deactivate student');
    }

    return normalizeWriteResponse(res.data?.student);
  },

  async activateStudent(id: number): Promise<void> {
    const res = await studentApi.activateStudent(id);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Failed to activate student');
    }
  },

  async startImport(request: StudentImportRequest): Promise<StudentImportStartResponse> {
    const res = await studentApi.importStudents(request.file, {
      programId: request.programId,
      programLevelId: request.programLevelId,
      semesterId: request.semesterId,
    });

    if (res.status !== 'success' || !res.data) {
      throw new Error(res.message || 'Failed to start import');
    }

    return res.data;
  },

  async getImportStatus(jobId: string): Promise<StudentImportStatusResponse> {
    const res = await studentApi.getImportStatus(jobId);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Failed to load import status');
    }

    return normalizeImportStatus(res.data);
  },
};
