import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  StudentTranscripts,
  TranscriptBatchGenerationSummary,
  TranscriptGenerationJob,
  TranscriptRecord,
} from '../../types';

export const transcriptApi = {
  getStudentTranscripts(studentId: number): Promise<ApiResponse<StudentTranscripts>> {
    return httpClient.request<StudentTranscripts>('GET', `/transcripts/students/${studentId}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  generateStudentTranscripts(studentId: number): Promise<ApiResponse<StudentTranscripts>> {
    return httpClient.request<StudentTranscripts>('POST', `/transcripts/students/${studentId}/generate`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getStudentSemesterTranscript(studentId: number, semesterId: number): Promise<ApiResponse<TranscriptRecord>> {
    return httpClient.request<TranscriptRecord>('GET', `/transcripts/students/${studentId}/semesters/${semesterId}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  generateFacultySemesterTranscripts(semesterId: number, facultyId: number): Promise<ApiResponse<TranscriptBatchGenerationSummary>> {
    return httpClient.request<TranscriptBatchGenerationSummary>('POST', `/transcripts/semesters/${semesterId}/faculties/${facultyId}/generate`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getTranscriptGenerationJob(jobId: string): Promise<ApiResponse<TranscriptGenerationJob>> {
    return httpClient.request<TranscriptGenerationJob>('GET', `/job/student-transcript/${jobId}`, undefined, {
      requireResolvedTenant: true,
    });
  },
};
