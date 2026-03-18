import { httpClient } from '../../core/http-client';
import type { ApiResponse, Course, CourseCreateInput, CourseUpdateInput } from '../../types';

export const courseApi = {
  createCourse(data: CourseCreateInput): Promise<ApiResponse<Course>> {
    return httpClient.request<Course>('POST', '/course', data, {
      requireResolvedTenant: true,
    });
  },

  getCourses(): Promise<ApiResponse<Course[]>> {
    return httpClient.request<Course[]>('GET', '/course', undefined, {
      requireResolvedTenant: true,
    });
  },

  getCourseById(id: number): Promise<ApiResponse<Course>> {
    return httpClient.request<Course>('GET', `/course/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  updateCourse(id: number, data: CourseUpdateInput): Promise<ApiResponse<Course>> {
    return httpClient.request<Course>('PUT', `/course/${id}`, data, {
      requireResolvedTenant: true,
    });
  },

  deleteCourse(id: number): Promise<ApiResponse<void>> {
    return httpClient.request<void>('DELETE', `/course/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },
};
