export type DayOfWeek =
  | 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday'
  | 'Wednesday' | 'Thursday' | 'Friday';

export type SlotType = 'Lecture' | 'Lab' | 'Tutorial';

export interface TimetableCourseLookup {
  id: number;
  code: string;
  name: string;
}

export interface TimetableClassroomLookup {
  id: number;
  classroomNumber: string;
  building: string;
  capacity: number;
  type: 'Hall' | 'Lab' | 'Auditorium' | 'Other';
}

export interface TimetableStaffLookup {
  id: number;
  name: string;
  email: string;
  position: string | null;
}

export interface ScheduleSlot {
  id: number;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  type: SlotType;
  enrolledSeats?: number;

  course: {
    id: number;
    code: string;
    name: string;
  };

  teacher: {
    id: number;
    name: string;
  };

  classroom: {
    id: number;
    label: string; // e.g., "Building A / Room 101"
    capacity?: number;
  };

  learningGroup: {
    id: number;
    name: string;
  } | null;
}

export interface GetScheduleResponse {
  meta: {
    programId: number;
    programName: string;
    academicLevel: number;
    semesterId: number;
  };
  lookups?: {
    courses: TimetableCourseLookup[];
    classrooms: TimetableClassroomLookup[];
    staff: TimetableStaffLookup[];
  };
  scheduleSlots: ScheduleSlot[];
}


export interface TimetableSaveSessionInput {
  id?: number; // Optional: Backend uses this to distinguish Update from Create
  courseId: number;
  teacherId: number;
  classroomId: number;
  learningGroupId: number | null;

  // Mandatory Helpers for Backend Conflict Reporting
  teacherName: string;
  classroomName: string;

  dayOfWeek: DayOfWeek;
  startTime: string | Date; // Zod coerce.date() handles both
  endTime: string | Date;
  type: SlotType;
}

export interface TimetableSaveLevelInput {
  programId: number;
  academicLevel: number;
  scheduleSlots: TimetableSaveSessionInput[];
}

export interface TimetableSaveResult {
  deleted: number;
  created: number;
  updated: number;
  unchanged: number;
  scheduleSlots: Array<{
    id: number;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    type: SlotType;
    course: {
      id: number;
      code: string;
      name: string;
    };
    teacher: {
      id: number;
      name: string;
    };
    classroom: {
      id: number;
      label: string;
    };
    learningGroup: {
      id: number;
      name: string;
    } | null;
  }>;
}
