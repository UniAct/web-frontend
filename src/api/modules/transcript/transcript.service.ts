import { transcriptApi } from './transcript.api';

export const TranscriptService = {
  async getStudentTranscripts(studentId: number) {
    const res = await transcriptApi.getStudentTranscripts(studentId);
    if (!res.data) throw new Error(res.message || 'Failed to load transcripts');
    return res.data;
  },

  async generateStudentTranscripts(studentId: number) {
    const res = await transcriptApi.generateStudentTranscripts(studentId);
    if (!res.data) throw new Error(res.message || 'Failed to generate transcripts');
    return res.data;
  },

  async getStudentSemesterTranscript(studentId: number, semesterId: number) {
    const res = await transcriptApi.getStudentSemesterTranscript(studentId, semesterId);
    if (!res.data) throw new Error(res.message || 'Failed to load semester transcript');
    return res.data;
  },

  async generateFacultySemesterTranscripts(semesterId: number, facultyId: number) {
    const res = await transcriptApi.generateFacultySemesterTranscripts(semesterId, facultyId);
    if (!res.data) throw new Error(res.message || 'Failed to start transcript job');
    return res.data;
  },

  async getTranscriptGenerationJob(jobId: string) {
    const res = await transcriptApi.getTranscriptGenerationJob(jobId);
    if (!res.data) throw new Error(res.message || 'Failed to load transcript generation job');
    return res.data;
  },
};
