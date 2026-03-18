export { AuthService } from './modules/auth/auth.service';
export { UniversityService } from './modules/university/university.service';
export { SuperAdminService } from './modules/superadmin/superadmin.service';
export { UserService } from './modules/user/user.service';
export { CourseService } from './modules/course/course.service';
export { FacultyService } from './modules/faculty/faculty.service';
export { ProgramService } from './modules/program/program.service';
export { RBACService } from './modules/rbac/rbac.service';

export { apiClient } from './client';

export type {
  ApiResponse,
  JSendStatus,
  LoginInput,
  LoginResponse,
  User,
  SuperAdmin,
  SuperAdminCreateInput,
  AssignRootAccountInput,
  University,
  UniversityCreateInput,
  PublicTenantProfile,
  Faculty,
  FacultyCreateInput,
  FacultyUpdateInput,
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
  Course,
  CourseCreateInput,
  CourseUpdateInput,
  CourseType,
  CoursePrerequisite,
  Role,
  RoleCreateInput,
  Permission,
  StaffAccountCreateInput,
  StaffAccountUpdateInput,
  StaffDirectoryEntry,
} from './types/index';
