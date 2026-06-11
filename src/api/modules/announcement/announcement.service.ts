import { announcementApi } from './announcement.api';
import type { Announcement, AnnouncementInput } from '../../types';

export const AnnouncementService = {
  async getAll(): Promise<Announcement[]> {
    const res = await announcementApi.getAll();
    if (!res.data) throw new Error(res.message || 'Failed to fetch announcements');
    return res.data;
  },

  async getPublic(schema: string): Promise<Announcement[]> {
    const res = await announcementApi.getPublic(schema);
    return res.data ?? [];
  },

  async create(data: AnnouncementInput): Promise<Announcement> {
    const res = await announcementApi.create(data);
    if (!res.data) throw new Error(res.message || 'Failed to create announcement');
    return res.data;
  },

  async update(id: number, data: AnnouncementInput): Promise<Announcement> {
    const res = await announcementApi.update(id, data);
    if (!res.data) throw new Error(res.message || 'Failed to update announcement');
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await announcementApi.delete(id);
  },
};
