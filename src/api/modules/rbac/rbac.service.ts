import { rbacApi } from './rbac.api';
import type { Permission, Role, RoleCreateInput } from '../../types';

export const RBACService = {
  async getAllRoles(): Promise<Role[]> {
    try {
      const res = await rbacApi.getRoles();
      if (!res.data) throw new Error(res.message || 'Failed to fetch roles');
      return res.data;
    } catch (error: any) {
      if (error.message?.includes('No roles found')) return [];
      throw error;
    }
  },

  async getRoleById(id: number): Promise<Role> {
    const res = await rbacApi.getRoleById(id);
    if (!res.data) throw new Error(res.message || 'Role not found');
    return res.data;
  },

  async createRole(data: RoleCreateInput): Promise<Role> {
    const res = await rbacApi.createRole(data);
    if (!res.data) throw new Error(res.message || 'Failed to create role');
    return res.data;
  },

  async updateRole(id: number, data: Partial<RoleCreateInput>): Promise<Role> {
    const res = await rbacApi.updateRole(id, data);
    if (!res.data) throw new Error(res.message || 'Failed to update role');
    return res.data;
  },

  async deleteRole(id: number): Promise<void> {
    await rbacApi.deleteRole(id);
  },

  async getAllPermissions(): Promise<Permission[]> {
    try {
      const res = await rbacApi.getPermissions();
      if (!res.data) throw new Error(res.message || 'Failed to fetch permissions');
      return res.data;
    } catch (error: any) {
      if (error.message?.includes('No permissions found')) return [];
      throw error;
    }
  },

  async getPermissionById(id: number): Promise<Permission> {
    const res = await rbacApi.getPermissionById(id);
    if (!res.data) throw new Error(res.message || 'Permission not found');
    return res.data;
  },

  async assignPermissionsToRole(roleId: number, permissions: string[]): Promise<Role> {
    const res = await rbacApi.assignPermissionsToRole(roleId, permissions);
    if (!res.data) throw new Error(res.message || 'Failed to assign permissions');
    return res.data;
  },

  async assignRoleToUser(userId: number, roleNames: string[]): Promise<void> {
    await rbacApi.assignRoleToUser(userId, roleNames);
  },
};
