import { facultyApi } from './faculty.api';
import type { Faculty, FacultyCreateInput, FacultyUpdateInput } from '../../types';

export const FacultyService = {
  async getAll(): Promise<Faculty[]> {
    const res = await facultyApi.getFaculties();
    if (!res.data) throw new Error(res.message || 'Failed to fetch faculties');
    return res.data;
  },

  async getById(id: number): Promise<Faculty> {
    const res = await facultyApi.getFacultyById(id);
    if (!res.data) throw new Error(res.message || 'Faculty not found');
    return res.data;
  },

  async create(data: FacultyCreateInput): Promise<Faculty> {
    const res = await facultyApi.createFaculty(data);
    if (!res.data) throw new Error(res.message || 'Failed to create faculty');
    return res.data;
  },

  async update(id: number, data: FacultyUpdateInput): Promise<Faculty> {
    const res = await facultyApi.updateFaculty(id, data);
    if (!res.data) throw new Error(res.message || 'Failed to update faculty');
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await facultyApi.deleteFaculty(id);
  },
};
