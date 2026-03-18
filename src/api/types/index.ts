export type { ApiResponse, JSendStatus } from './common';
export type { LoginInput, LoginResponse } from './auth';
export type { User, StaffAccountCreateInput, StaffAccountUpdateInput, StaffDirectoryEntry } from './user';
export type {
  SuperAdmin,
  SuperAdminCreateInput,
  AssignRootAccountInput,
} from './superadmin';
export type { University, UniversityCreateInput, PublicTenantProfile } from './university';
export type { Faculty, FacultyCreateInput, FacultyUpdateInput } from './faculty';
export type {
  Program,
  ProgramCreateInput,
  ProgramUpdateInput,
  ProgramType,
  ResultDisplayType,
  BlockReasonType,
  FeeType,
  ProgramLevel,
  ProgramLevelInput,
  ProgramFee,
  ProgramFeeInput,
  ProgramTranscriptDefinition,
  ProgramTranscriptDefinitionInput,
  AcademicLoadSemester,
  AcademicLoadSemesterInput,
  AcademicLoadGPA,
  AcademicLoadGPAInput,
} from './program';
export type { Course, CourseCreateInput, CourseUpdateInput, CourseType, CoursePrerequisite } from './course';
export type { Role, RoleCreateInput, Permission } from './rbac';
