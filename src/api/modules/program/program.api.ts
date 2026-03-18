import { httpClient } from '../../core/http-client';
import type { ApiResponse, Program, ProgramCreateInput, ProgramUpdateInput } from '../../types';

export const programApi = {
  createProgram(data: ProgramCreateInput): Promise<ApiResponse<Program>> {
    return httpClient.request<Program>('POST', '/program/create', data, {
      requireResolvedTenant: true,
    });
  },

  getPrograms(): Promise<ApiResponse<Program[]>> {
    return httpClient.request<Program[]>('GET', '/program', undefined, {
      requireResolvedTenant: true,
    });
  },

  getProgramById(id: number): Promise<ApiResponse<Program>> {
    return httpClient.request<Program>('GET', `/program/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  updateProgram(id: number, data: ProgramUpdateInput): Promise<ApiResponse<Program>> {
    return httpClient.request<Program>('PUT', `/program/${id}`, data, {
      requireResolvedTenant: true,
    });
  },

  deleteProgram(id: number): Promise<ApiResponse<void>> {
    return httpClient.request<void>('DELETE', `/program/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },
};
