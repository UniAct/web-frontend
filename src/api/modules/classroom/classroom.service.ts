import { classroomApi } from './classroom.api';
import type { Classroom, ClassroomCreateInput, ClassroomUpdateInput } from '../../types';

export const ClassroomService = {
  async getAll(): Promise<Classroom[]> {
    const res = await classroomApi.getClassrooms();
    if (!res.data) throw new Error(res.message || 'Failed to fetch classrooms');
    return res.data;
  },

  async getById(id: number): Promise<Classroom> {
    const res = await classroomApi.getClassroomById(id);
    if (!res.data) throw new Error(res.message || 'Classroom not found');
    return res.data;
  },

  async create(data: ClassroomCreateInput): Promise<Classroom> {
    const res = await classroomApi.createClassroom(data);
    if (!res.data) throw new Error(res.message || 'Failed to create classroom');
    return res.data;
  },

  async update(id: number, data: ClassroomUpdateInput): Promise<Classroom> {
    const res = await classroomApi.updateClassroom(id, data);
    if (!res.data) throw new Error(res.message || 'Failed to update classroom');
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await classroomApi.deleteClassroom(id);
  },
};
