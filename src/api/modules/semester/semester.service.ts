import { semesterApi } from './semester.api';
import type { Semester, SemesterCreateInput, SemesterUpdateInput } from '../../types';

export const SemesterService = {
  async getAll(): Promise<Semester[]> {
    const res = await semesterApi.getSemesters();
    if (!res.data) throw new Error(res.message || 'Failed to fetch semesters');
    return res.data;
  },

  async getById(id: number): Promise<Semester> {
    const res = await semesterApi.getSemesterById(id);
    if (!res.data) throw new Error(res.message || 'Semester not found');
    return res.data;
  },

  async create(data: SemesterCreateInput): Promise<Semester> {
    const res = await semesterApi.createSemester(data);
    if (!res.data) throw new Error(res.message || 'Failed to create semester');
    return res.data;
  },

  async update(id: number, data: SemesterUpdateInput): Promise<Semester> {
    const res = await semesterApi.updateSemester(id, data);
    if (!res.data) throw new Error(res.message || 'Failed to update semester');
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await semesterApi.deleteSemester(id);
  },
};
