export interface EnrollmentSubmitInput {
  scheduleSlots: EnrollmentScheduleSlot[];
}

export interface EnrollmentScheduleSlot {
  id: number;
  start_time: string;
  end_time: string;
  type: string;
  course: {
    id: number;
    code: string;
    name: string;
    credits: number;
  };
  teacher: {
    id: number;
    name: string;
  };
  classroom: {
    id: number;
    label: string;
    capacity: number;
  };
}

export interface EnrollmentSubmitResponse {
  jobId: string;
  message?: string;
  totalCredits?: number;
}

export type EnrollmentJobStatus = 'Pending' | 'Processing' | 'Done';

export interface EnrollmentJobSlotResult {
  slotId: number;
  courseCode?: string;
  courseName?: string;
  status: 'enrolled' | 'failed';
  reason?: string;
}

export interface EnrollmentJobResult {
  error?: string;
  slots: EnrollmentJobSlotResult[];
}

export interface EnrollmentStatusResponse {
  jobId: string;
  status: EnrollmentJobStatus;
  studentId: number;
  result: EnrollmentJobResult | null;
  isCompleted: boolean;
  hasError: boolean;
}

export type AdminEnrollmentStatus = 'Enrolled' | 'Withdrawn' | 'Completed' | 'Failed' | 'InProgress';

export interface AdminEnrollmentCourse {
  id: number;
  code: string;
  name: string;
  credits: number;
  prerequisites?: Array<{ id: number; code: string; name: string }>;
  learningGroup?: { id: number; groupName: string; semesterId?: number } | null;
}

export interface AdminEnrollmentSchedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  type: string;
  allowedCapacity: number;
  enrolledSeats: number;
  remainingSeats: number;
}

export interface AdminEnrollmentRecord {
  id: number;
  studentId: number;
  universityStudentId: number;
  studentName: string;
  studentEmail: string;
  programName: string;
  academicLevel: number;
  semesterId: number;
  semesterLabel: string;
  enrollmentDate: string;
  status: AdminEnrollmentStatus;
  grade: string | null;
  gradePoints: number | null;
  slotContextId: number | null;
  scheduleSlotId: number | null;
  course: AdminEnrollmentCourse | null;
  teacher: { id: number; name: string; email: string } | null;
  classroom: { id: number; label: string; capacity: number; type: string } | null;
  schedule: AdminEnrollmentSchedule | null;
  grades: Array<{
    id: number;
    marks: number;
    maxMarks: number;
    assessmentDate: string | null;
    label: string;
    assessmentMaxMarks: number;
    comments: string | null;
  }>;
}

export interface AdminEnrollmentSlotOption {
  slotContextId: number;
  scheduleSlotId: number;
  semesterId: number;
  semesterLabel: string;
  programId: number;
  programName: string;
  academicLevel: number;
  course: AdminEnrollmentCourse;
  teacher: { id: number; name: string; email: string };
  classroom: { id: number; label: string; capacity: number; type: string };
  schedule: AdminEnrollmentSchedule;
}

export interface AdminEnrollmentListQuery {
  search?: string;
  status?: AdminEnrollmentStatus;
  semesterId?: number;
  courseId?: number;
  studentId?: number;
}

export interface AdminEnrollmentListResponse {
  enrollments: AdminEnrollmentRecord[];
  summary: {
    total: number;
    activeSeats: number;
    byStatus: Record<string, number>;
  };
}

export interface AdminEnrollmentOptionsResponse {
  semesters: Array<{ id: number; label: string; year: number; term: number; type: string }>;
  courses: Array<{ id: number; code: string; name: string }>;
  students: Array<{
    id: number;
    universityStudentId: number;
    name: string;
    programName: string;
    academicLevel: number;
  }>;
  availableSlots: AdminEnrollmentSlotOption[];
}

export interface AdminEnrollmentStudentTrackResponse {
  student: {
    id: number;
    universityStudentId: number;
    name: string;
    email: string;
    username: string;
    cgpa: number;
    status: string;
    enrollmentDate: string;
    program: { id: number; name: string };
    programLevel: { id: number; level: number };
  };
  enrollments: AdminEnrollmentRecord[];
  availableSlots: AdminEnrollmentSlotOption[];
}

export interface AdminEnrollmentCreateInput {
  studentId: number;
  slotContextId: number;
  status?: AdminEnrollmentStatus;
}

export interface AdminEnrollmentUpdateInput {
  status?: AdminEnrollmentStatus;
  slotContextId?: number;
}
