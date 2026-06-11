import { facultyApi } from './faculty.api';
import type { Faculty, FacultyCreateInput, FacultyUpdateInput, Program } from '../../types';

export const FacultyService = {
  async getAll(): Promise<Faculty[]> {
    const res = await facultyApi.getFaculties();
    if (!res.data) throw new Error(res.message || 'Failed to fetch faculties');
    return res.data;
  },

  async getPublicFaculties(schema: string): Promise<Array<{
    id: number;
    name: string;
    description?: string;
    programs: string[];
    students: number;
    years: number;
  }>> {
    const res = await facultyApi.getPublicFaculties(schema);
    return res.data ?? [];
  },

  async getById(id: number): Promise<Faculty> {
    const res = await facultyApi.getFacultyById(id);
    if (!res.data) throw new Error(res.message || 'Faculty not found');
    return res.data;
  },

  async getProgramsByFacultyId(faclutyId: number): Promise<Program[]> {
    const res = await facultyApi.getProgramsByFacultyId(faclutyId);
    if (!res.data) throw new Error (res.message || 'failed to fetch programs');
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
