export interface TranscriptCourse {
  registrationId: number;
  courseCode: string | null;
  courseName: string | null;
  credits: number;
  grade: string | null;
  gradePoints: number | null;
  status: string;
  totalMarks: number;
  totalMaxMarks: number;
  scorePercentage: number | null;
}

export interface TranscriptSemesterInfo {
  id: number;
  year: number;
  term: number;
  type: string;
  startDate: string;
  endDate: string;
}

export interface TranscriptRecord {
  id: number;
  studentId: number;
  semesterId: number;
  semester: TranscriptSemesterInfo | null;
  year: number;
  semesterGpa: number;
  cumulativeGpa: number;
  totalCredits: number;
  generatedDate: string;
  courses: TranscriptCourse[];
}

export interface StudentTranscripts {
  studentId: number;
  semesters: TranscriptRecord[];
}

export interface TranscriptBatchGenerationSummary {
  jobId: string;
  totalStudents: number;
}

export type TranscriptGenerationJobStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Partial_failure';

export interface TranscriptGenerationJobResultItem {
  studentId: number;
  semesterId: number;
  transcript?: TranscriptRecord;
  error?: string;
}

export interface TranscriptGenerationJobResult {
  facultyId?: number;
  semesterId?: number;
  totalStudents?: number;
  completedCount?: number;
  failedCount?: number;
  error?: string;
  items?: TranscriptGenerationJobResultItem[] | null;
}

export interface TranscriptGenerationJob {
  jobId: string;
  status: TranscriptGenerationJobStatus;
  facultyId: number;
  semesterId: number;
  result: TranscriptGenerationJobResult | null;
  items: TranscriptGenerationJobResultItem[] | null;
  isCompleted: boolean;
  hasError: boolean;
}
