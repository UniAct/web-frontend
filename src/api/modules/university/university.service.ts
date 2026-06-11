import { universityApi } from './university.api';
import { httpClient } from '../../core/http-client';
import type { PublicTenantProfile, University, UniversityCreateInput, UniversitySettings } from '../../types';

const publicTenantProfileRequests = new Map<string, Promise<PublicTenantProfile>>();
const publicTenantProfileCache = new Map<string, PublicTenantProfile>();
const publicTenantProfileFailures = new Map<string, number>();
const PUBLIC_TENANT_FAILURE_COOLDOWN_MS = 5000;

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
    const normalizedKey = tenantKey.trim().toLowerCase();
    if (!normalizedKey) throw new Error('Tenant key is required');

    const currentTenant = httpClient.getTenantContext();
    if (!currentTenant.isSuperAdmin && currentTenant.subdomain?.toLowerCase() === normalizedKey) {
      return httpClient.getCurrentTenantProfile();
    }

    const cachedProfile = publicTenantProfileCache.get(normalizedKey);
    if (cachedProfile) return cachedProfile;

    const pendingRequest = publicTenantProfileRequests.get(normalizedKey);
    if (pendingRequest) return pendingRequest;

    const lastFailureAt = publicTenantProfileFailures.get(normalizedKey) ?? 0;
    if (lastFailureAt > 0 && Date.now() - lastFailureAt < PUBLIC_TENANT_FAILURE_COOLDOWN_MS) {
      throw new Error('Tenant profile lookup is temporarily unavailable. Please try again in a moment.');
    }

    const request = (async () => {
      const res = await universityApi.getPublicTenantProfile(normalizedKey);
      if (!res.data) throw new Error(res.message || 'Tenant not found');
      publicTenantProfileCache.set(normalizedKey, res.data);
      publicTenantProfileFailures.delete(normalizedKey);
      return res.data;
    })();

    publicTenantProfileRequests.set(normalizedKey, request);

    try {
      return await request;
    } catch (error) {
      publicTenantProfileFailures.set(normalizedKey, Date.now());
      throw error;
    } finally {
      publicTenantProfileRequests.delete(normalizedKey);
    }
  },

  async getPublicStats(tenantKey: string): Promise<{ students: number; staff: number; programs: number }> {
    const res = await universityApi.getPublicStats(tenantKey.trim().toLowerCase());
    return res.data ?? { students: 0, staff: 0, programs: 0 };
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

  async getSettings(): Promise<UniversitySettings> {
    const res = await universityApi.getSettings();
    if (!res.data) throw new Error(res.message || 'Failed to load settings');
    return res.data;
  },

  async updateSettings(
    data: Partial<Pick<UniversitySettings, 'primary_color' | 'secondary_color' | 'tab_name' | 'logo_url'>>,
  ): Promise<UniversitySettings> {
    const res = await universityApi.updateSettings(data);
    if (!res.data) throw new Error(res.message || 'Failed to save settings');
    return res.data;
  },

  async uploadLogo(file: File): Promise<string> {
    const res = await universityApi.uploadLogo(file);
    if (!res.data) throw new Error(res.message || 'Logo upload failed');
    return res.data.logo_url;
  },

  async uploadHeroImage(file: File): Promise<string[]> {
    const res = await universityApi.uploadHeroImage(file);
    if (!res.data) throw new Error(res.message || 'Hero image upload failed');
    return res.data.hero_images;
  },

  async deleteHeroImage(url: string): Promise<string[]> {
    const res = await universityApi.deleteHeroImage(url);
    return res.data?.hero_images ?? [];
  },
};
