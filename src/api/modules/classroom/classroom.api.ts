import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  Classroom,
  ClassroomCreateInput,
  ClassroomUpdateInput,
} from '../../types';

export const classroomApi = {
  createClassroom(data: ClassroomCreateInput): Promise<ApiResponse<Classroom>> {
    return httpClient.request<Classroom>('POST', '/classroom', data, {
      requireResolvedTenant: true,
    });
  },

  getClassrooms(): Promise<ApiResponse<Classroom[]>> {
    return httpClient.request<Classroom[]>('GET', '/classroom', undefined, {
      requireResolvedTenant: true,
    });
  },

  getClassroomById(id: number): Promise<ApiResponse<Classroom>> {
    return httpClient.request<Classroom>('GET', `/classroom/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  updateClassroom(id: number, data: ClassroomUpdateInput): Promise<ApiResponse<Classroom>> {
    return httpClient.request<Classroom>('PUT', `/classroom/${id}`, data, {
      requireResolvedTenant: true,
    });
  },

  deleteClassroom(id: number): Promise<ApiResponse<void>> {
    return httpClient.request<void>('DELETE', `/classroom/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },
};
