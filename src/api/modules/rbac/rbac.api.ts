import { httpClient } from '../../core/http-client';
import type { ApiResponse, Permission, Role } from '../../types';

export const rbacApi = {
  createRole(data: { name: string; description?: string }): Promise<ApiResponse<Role>> {
    return httpClient.request<Role>('POST', '/rbac/role', data);
  },

  getRoles(): Promise<ApiResponse<Role[]>> {
    return httpClient.request<Role[]>('GET', '/rbac/role');
  },

  getRoleById(id: number): Promise<ApiResponse<Role>> {
    return httpClient.request<Role>('GET', `/rbac/role/${id}`);
  },

  updateRole(id: number, data: Partial<Role>): Promise<ApiResponse<Role>> {
    return httpClient.request<Role>('PUT', `/rbac/role/${id}`, data);
  },

  deleteRole(id: number): Promise<ApiResponse<void>> {
    return httpClient.request<void>('DELETE', `/rbac/role/${id}`);
  },

  getPermissions(): Promise<ApiResponse<Permission[]>> {
    return httpClient.request<Permission[]>('GET', '/rbac/permission');
  },

  getPermissionById(id: number): Promise<ApiResponse<Permission>> {
    return httpClient.request<Permission>('GET', `/rbac/permission/${id}`);
  },

  assignPermissionsToRole(roleId: number, permissions: string[]): Promise<ApiResponse<Role>> {
    return httpClient.request<Role>('POST', `/rbac/assign-permissions-to-role/${roleId}`, {
      permissions,
    });
  },

  assignRoleToUser(userId: number, roleNames: string[]): Promise<ApiResponse<void>> {
    return httpClient.request<void>('POST', `/rbac/assign-role-to-user/${userId}`, {
      role_names: roleNames,
    });
  },
};
