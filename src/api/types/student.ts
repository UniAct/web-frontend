export type StudentStatus = 'New' | 'Repeat' | 'SingleChance' | 'ExternalReenrollment' | 'Deactivate';
export type StudentGender = 'M' | 'F';
export type StudentReligion = 'M' | 'C';
export type StudentSortOrder = 'asc' | 'desc';

export interface StudentRecord {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  nationalId: string;
  isVerified: boolean;
  isBlocked: boolean;
  universityStudentId: number;
  status: StudentStatus;
  gender: StudentGender;
  religion: StudentReligion;
  cgpa: number | null;
  enrollmentDate: string;
  programId: number;
  programName: string;
  programType: string;
  programLevelId: number;
  programLevelName: string;
}

export interface StudentListQuery {
  page?: number;
  limit?: number;
  studentId?: number;
  universityStudentId?: number;
  nationalId?: string;
  status?: StudentStatus;
  programId?: number;
  semesterId?: number;
  isVerified?: boolean;
  isBlocked?: boolean;
  sortOrder?: StudentSortOrder;
}

export interface StudentListPagination {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface StudentListResponse {
  students: StudentRecord[];
  pagination: StudentListPagination;
}

export interface CreateStudentInput {
  username: string;
  firstName: string;
  lastName: string;
  fullname: string;
  universityStudentId: number;
  nationalId: string;
  programId: number;
  programLevelId: number;
  semesterNumber: number;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  status: StudentStatus;
  enrollmentDate: string;
  religion: StudentReligion;
  gender: StudentGender;
  homePhone?: string;
  previousQualification?: string;
  secondarySchoolName?: string;
  totalHighSchoolGrades?: number;
  highSchoolSeatNumber?: string;
}

export interface UpdateStudentInput {
  username?: string;
  firstName?: string;
  lastName?: string;
  fullname?: string;
  universityStudentId?: number;
  nationalId?: string;
  programId?: number;
  programLevelId?: number;
  cgpa?: number;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  status?: StudentStatus;
  enrollmentDate?: string;
  religion?: StudentReligion;
  gender?: StudentGender;
  homePhone?: string;
  previousQualification?: string;
  secondarySchoolName?: string;
  totalHighSchoolGrades?: number;
  highSchoolSeatNumber?: string;
}

export interface StudentImportRequest {
  file: File;
  programId: number;
  programLevelId: number;
  semesterId: number;
}

export interface StudentImportStartResponse {
  message: string;
  jobId: string;
}

export interface StudentImportErrorRow {
  row: number;
  username?: string;
  reason: string;
}

export type StudentImportStatus = 'Pending' | 'Processing' | 'Completed' | 'CompletedWithErrors' | 'Failed';

export interface StudentImportStatusResponse {
  status: StudentImportStatus;
  message: string;
  error?: StudentImportErrorRow[];
}

export interface StudentWriteResponse {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  nationalId: string;
  fullname: string;
  universityStudentId: number;
  programId: number;
  programLevelId: number;
  status: StudentStatus;
  enrollmentDate: string;
  cgpa: number | null;
  religion: StudentReligion;
  gender: StudentGender;
  homePhone?: string | null;
  previousQualification?: string | null;
  secondarySchoolName?: string | null;
  totalHighSchoolGrades?: number | null;
  highSchoolSeatNumber?: string | null;
  isBlocked?: boolean;
}
