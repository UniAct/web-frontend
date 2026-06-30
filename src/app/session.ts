import { isJwtExpired } from '../api/core/jwt';
import type { User, UserRole } from './types';

export const FRONTEND_ROLE_STORAGE_KEY = 'role';

export function isUserRole(value: unknown): value is UserRole {
  return value === 'student' || value === 'faculty' || value === 'admin' || value === 'alumni' || value === 'superadmin';
}

export function readStoredFrontendRole(): UserRole | undefined {
  try {
    const raw = localStorage.getItem(FRONTEND_ROLE_STORAGE_KEY);
    return isUserRole(raw) ? raw : undefined;
  } catch {
    return undefined;
  }
}

export function persistFrontendRole(role: UserRole): void {
  localStorage.setItem(FRONTEND_ROLE_STORAGE_KEY, role);
}

export function clearStoredSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem(FRONTEND_ROLE_STORAGE_KEY);
  localStorage.removeItem('tenantId');
}

function resolveFrontendRoleFromBackendRoles(rawRoles: unknown): UserRole {
  if (!Array.isArray(rawRoles) || rawRoles.length === 0) return 'student';

  const normalizedRoles = rawRoles
    .filter((role): role is string => typeof role === 'string')
    .map((role) => role.toLowerCase());

  if (normalizedRoles.some((role) => role.includes('superadmin'))) return 'superadmin';
  if (normalizedRoles.some((role) => role.includes('admin') || role.includes('root'))) return 'admin';
  if (normalizedRoles.some((role) => role.includes('staff') || role.includes('faculty'))) return 'faculty';
  if (normalizedRoles.some((role) => role.includes('alumni'))) return 'alumni';
  if (normalizedRoles.some((role) => role.includes('student'))) return 'student';

  return 'student';
}

export function resolveUserRole(parsed: any, fallbackRole: UserRole = 'student'): UserRole {
  const roles = Array.isArray(parsed?.roles) ? parsed.roles : [];
  const roleFromRoles = roles.length > 0 ? resolveFrontendRoleFromBackendRoles(roles) : fallbackRole;

  if (roleFromRoles === 'superadmin' || roleFromRoles === 'admin') return roleFromRoles;
  if (parsed?.isStaff === true || parsed?.isStaffAccount === true) return 'faculty';
  if (parsed?.isStudent === true) return 'student';

  return roleFromRoles;
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function parseOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildUserFromSession(parsed: any, role: UserRole): User {
  const firstName = parseOptionalString(parsed?.firstName);
  const lastName = parseOptionalString(parsed?.lastName);

  const resolvedName =
    parseOptionalString(parsed?.studentFullname) ||
    parseOptionalString(parsed?.student_fullname) ||
    parseOptionalString(parsed?.['student Fullname']) ||
    parseOptionalString(parsed?.student?.fullname) ||
    (firstName ? `${firstName} ${lastName ?? ''}`.trim() : undefined) ||
    parseOptionalString(parsed?.username) ||
    parseOptionalString(parsed?.email) ||
    'Unknown User';

  const resolvedEmail =
    parseOptionalString(parsed?.email) ||
    parseOptionalString(parsed?.username) ||
    'unknown@example.com';

  return {
    id:
      parsed?.id !== undefined && parsed?.id !== null
        ? String(parsed.id)
        : parseOptionalString(parsed?.username) || resolvedEmail || 'unknown',
    name: resolvedName,
    email: resolvedEmail,
    role,
    facultyName:
      parseOptionalString(parsed?.department) ||
      parseOptionalString(parsed?.university) ||
      parseOptionalString(parsed?.university_name) ||
      undefined,
    studentId:
      (parsed?.universityStudentId !== undefined && parsed?.universityStudentId !== null
        ? String(parsed.universityStudentId)
        : undefined) ||
      (parsed?.student?.universityStudentId !== undefined && parsed?.student?.universityStudentId !== null
        ? String(parsed.student.universityStudentId)
        : undefined) ||
      (parsed?.id !== undefined && parsed?.id !== null ? String(parsed.id) : undefined),
    facultyId: parseOptionalNumber(
      parsed?.facultyId ??
      parsed?.facultyID ??
      parsed?.faculty?.id ??
      parsed?.program?.facultyId ??
      parsed?.student?.facultyId ??
      parsed?.student?.program?.facultyId,
    ),
    programId: parseOptionalNumber(
      parsed?.programId ??
      parsed?.programID ??
      parsed?.program?.id ??
      parsed?.student?.programId ??
      parsed?.student?.program?.id,
    ),
    programName:
      parseOptionalString(parsed?.programName) ||
      parseOptionalString(parsed?.program_name) ||
      parseOptionalString(parsed?.program) ||
      parseOptionalString(parsed?.program?.programName) ||
      parseOptionalString(parsed?.program?.name) ||
      parseOptionalString(parsed?.student?.program?.name) ||
      undefined,
    programLevelId: parseOptionalNumber(
      parsed?.programLevelId ??
      parsed?.programLevelID ??
      parsed?.programLevel?.id ??
      parsed?.student?.programLevelId ??
      parsed?.student?.programLevel?.id,
    ),
    programLevel: parseOptionalNumber(
      parsed?.programLevel?.level ??
      parsed?.programLevel ??
      parsed?.programLEVEL ??
      parsed?.programLevelNumber ??
      parsed?.program_level ??
      parsed?.student?.programLevel?.level,
    ),
    currentSemesterId: parseOptionalNumber(
      parsed?.semester?.id ??
      parsed?.currentSemesterId ??
      parsed?.currentSemesterID ??
      parsed?.semesterId ??
      parsed?.semesterID ??
      parsed?.student?.currentSemesterId,
    ),
    currentSemesterType: (() => {
      const semesterType =
        parseOptionalString(parsed?.semester?.type) ||
        parseOptionalString(parsed?.currentSemesterType) ||
        parseOptionalString(parsed?.currentSemesterTYPE) ||
        parseOptionalString(parsed?.student?.currentSemesterType);

      return semesterType === 'Fall' || semesterType === 'Spring' || semesterType === 'Summer'
        ? semesterType
        : undefined;
    })(),
    currentSemesterYear: parseOptionalNumber(
      parsed?.semester?.year ??
      parsed?.currentSemesterYear ??
      parsed?.currentSemesterYEAR ??
      parsed?.student?.currentSemesterYear,
    ),
    currentSemesterTerm: parseOptionalNumber(
      parsed?.semester?.term ??
      parsed?.currentSemesterTerm ??
      parsed?.currentSemesterTERM ??
      parsed?.student?.currentSemesterTerm,
    ),
  };
}

export function readStoredSessionUser(): User | null {
  try {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');

    if (!token || !userJson) {
      return null;
    }

    if (isJwtExpired(token)) {
      clearStoredSession();
      return null;
    }

    const parsed = JSON.parse(userJson);
    const restoredRole = resolveUserRole(parsed, readStoredFrontendRole() ?? 'student');
    return buildUserFromSession(parsed, restoredRole);
  } catch {
    clearStoredSession();
    console.warn('Failed to restore session, cleared localStorage.');
    return null;
  }
}

