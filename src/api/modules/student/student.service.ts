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
  students?: StudentRecord[];
  pagination?: StudentListResponse['pagination'];
}

function normalizeListResponse(data?: StudentListApiData): StudentListResponse {
  return {
    students: data?.students ?? [],
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
