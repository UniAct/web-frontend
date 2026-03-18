import { universityApi } from './university.api';
import type { PublicTenantProfile, University, UniversityCreateInput } from '../../types';

export const UniversityService = {
  async create(data: UniversityCreateInput): Promise<University> {
    const res = await universityApi.createUniversity(data);
    if (!res.data) throw new Error(res.message || 'Failed to create university');
    return res.data;
  },

  async getAll(): Promise<University[]> {
    const res = await universityApi.getUniversities();
    if (!res.data) throw new Error(res.message || 'Failed to fetch universities');
    return res.data;
  },

  async listNames(): Promise<string[]> {
    const res = await universityApi.listUniversities();
    return res.data ?? [];
  },

  async getPublicTenantProfile(tenantKey: string): Promise<PublicTenantProfile> {
    const res = await universityApi.getPublicTenantProfile(tenantKey);
    if (!res.data) throw new Error(res.message || 'Tenant not found');
    return res.data;
  },

  async getById(id: number): Promise<University> {
    const res = await universityApi.getUniversityById(id);
    if (!res.data) throw new Error(res.message || 'University not found');
    return res.data;
  },

  async activate(id: number): Promise<University> {
    const res = await universityApi.activateUniversity(id);
    if (!res.data) throw new Error(res.message || 'Failed to activate university');
    return res.data;
  },

  async deactivate(id: number): Promise<University> {
    const res = await universityApi.deactivateUniversity(id);
    if (!res.data) throw new Error(res.message || 'Failed to deactivate university');
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await universityApi.deleteUniversity(id);
  },
};
