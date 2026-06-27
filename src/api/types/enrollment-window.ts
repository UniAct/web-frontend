export interface EnrollmentWindowRecord {
  id: number;
  name: string | null;
  facultyId: number;
  programId: number | null;
  semesterId: number;
  programLevelId: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnrollmentWindowPayload {
  name?: string | null;
  facultyId: number;
  programId?: number | null;
  semesterId: number;
  programLevelId: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface EnrollmentWindowLookupQuery {
  facultyId: number;
  programId?: number;
  semesterId: number;
  programLevelId: number;
}
