export type DayOfWeek =
  | 'Saturday'
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday';

export interface TimetableCourseLookup {
  id: number;
  code: string;
  name: string;
  credits: number;
}

export interface TimetableClassroomLookup {
  id: number;
  roomNumber: string;
  building: string;
  capacity: number;
  type: 'Lecture' | 'Lab' | 'Auditorium' | 'Other';
}

export interface TimetableStaffLookup {
  id: number;
  position: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
}

export interface TimetableSession {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  teacherId: number;
  instructorName: string;
  classroomId: number;
  classroomCode: string;
  classroomLabel: string;
  roomId: number;
  roomName: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface TimetableLevelResponse {
  meta: {
    programId: number;
    programName: string;
    academicLevel: number;
    semesterId: number;
  };
  lookups: {
    courses: TimetableCourseLookup[];
    classrooms: TimetableClassroomLookup[];
    staff: TimetableStaffLookup[];
  };
  sessions: TimetableSession[];
}

export interface TimetableSaveSessionInput {
  courseId: number;
  teacherId: number;
  classroomId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface TimetableSaveLevelInput {
  programId: number;
  academicLevel: number;
  sessions: TimetableSaveSessionInput[];
}

export interface TimetableSaveResult {
  message: string;
  meta: {
    programId: number;
    academicLevel: number;
    semesterId: number;
    savedSessions: number;
  };
}
