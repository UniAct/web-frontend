import type { LoginResponse } from '../api';

export type UserRole = 'student' | 'faculty' | 'admin' | 'alumni' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  facultyName?: string;
  year?: number;
  studentId?: string;
  facultyId?: number;
  programId?: number;
  programName?: string;
  programLevelId?: number;
  programLevel?: number;
  currentSemesterId?: number;
  currentSemesterType?: 'Fall' | 'Spring' | 'Summer';
  currentSemesterYear?: number;
  currentSemesterTerm?: number;
}

export type SessionLoginPayload = Pick<LoginResponse, 'token' | 'user'>;

