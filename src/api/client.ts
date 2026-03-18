import { httpClient } from './core/http-client';
import { authApi } from './modules/auth/auth.api';
import { courseApi } from './modules/course/course.api';
import { facultyApi } from './modules/faculty/faculty.api';
import { programApi } from './modules/program/program.api';
import { rbacApi } from './modules/rbac/rbac.api';
import { superAdminApi } from './modules/superadmin/superadmin.api';
import { universityApi } from './modules/university/university.api';
import { userApi } from './modules/user/user.api';

export const apiClient = {
  ...authApi,
  ...superAdminApi,
  ...universityApi,
  ...userApi,
  ...courseApi,
  ...facultyApi,
  ...programApi,
  ...rbacApi,
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
  User,
} from './types/index';
