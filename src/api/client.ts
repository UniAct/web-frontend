import { httpClient } from './core/http-client';
import { authApi } from './modules/auth/auth.api';
import { classroomApi } from './modules/classroom/classroom.api';
import { courseApi } from './modules/course/course.api';
import { facultyApi } from './modules/faculty/faculty.api';
import { programApi } from './modules/program/program.api';
import { rbacApi } from './modules/rbac/rbac.api';
import { superAdminApi } from './modules/superadmin/superadmin.api';
import { studentApi } from './modules/student/student.api';
import { universityApi } from './modules/university/university.api';
import { userApi } from './modules/user/user.api';
import { announcementApi } from './modules/announcement/announcement.api';
import { aiApi } from './modules/ai/ai.api';
import { learningGroupApi } from './modules/learning-group/learning-group.api';
import { transcriptApi } from './modules/transcript/transcript.api';

export const apiClient = {
  ...authApi,
  ...superAdminApi,
  ...studentApi,
  ...universityApi,
  ...userApi,
  ...classroomApi,
  ...courseApi,
  ...facultyApi,
  ...programApi,
  ...rbacApi,
  ...announcementApi,
  ai: aiApi,
  learningGroups: learningGroupApi,
  transcripts: transcriptApi,
  validateCurrentTenant: () => httpClient.validateCurrentTenant(),
  getCurrentPublicTenantProfile: () => httpClient.getCurrentTenantProfile(),
  isSuperAdmin: () => httpClient.isSuperAdmin(),
  getTenantContext: () => httpClient.getTenantContext(),
  getApiBaseUrl: () => httpClient.getApiBaseUrl(),
  isAuthenticated: () => httpClient.isAuthenticated(),
  getCurrentUser: () => httpClient.getCurrentUser(),
  getTokenValue: () => httpClient.getTokenValue(),
  setTenantOverrideName: (tenantName: string) => httpClient.setTenantOverrideName(tenantName),
  clearTenantOverrideName: () => httpClient.clearTenantOverrideName(),
  syncResolvedTenantFromSession: () => httpClient.syncResolvedTenantFromSession(),
};

export type {
  ApiResponse,
  Course,
  LoginResponse,
  Permission,
  Role,
  SuperAdmin,
  PublicTenantProfile,
  StaffDirectoryEntry,
  University,
  UniversitySettings,
  Announcement,
  AnnouncementInput,
  LearningGroupSummary,
  LearningGroupDetails,
  LearningGroupPost,
  LearningGroupPostType,
  AiChatResponse,
  AiSyncResult,
  StudentTranscripts,
  User,
} from './types/index';
