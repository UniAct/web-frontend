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
