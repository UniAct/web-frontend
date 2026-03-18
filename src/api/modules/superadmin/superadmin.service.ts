import { superAdminApi } from './superadmin.api';
import type { AssignRootAccountInput, SuperAdmin, SuperAdminCreateInput } from '../../types';

export const SuperAdminService = {
  async getAll(): Promise<SuperAdmin[]> {
    const res = await superAdminApi.getSuperAdmins();
    if (!res.data) throw new Error(res.message || 'Failed to fetch super admins');
    return res.data;
  },

  async create(data: SuperAdminCreateInput): Promise<SuperAdmin> {
    const res = await superAdminApi.createSuperAdmin(data);
    if (res.data) return res.data;

    return {
      id: 0,
      username: data.username,
      email: data.email,
    };
  },

  async delete(username: string): Promise<void> {
    await superAdminApi.deleteSuperAdmin(username);
  },

  async assignRootAccount(data: AssignRootAccountInput): Promise<void> {
    await superAdminApi.assignRootAccount(data);
  },

  async verifyRootAccount(token: string): Promise<string> {
    const res = await superAdminApi.verifyRootAccount(token);
    return res.data?.message ?? res.message ?? 'Verified';
  },
};
