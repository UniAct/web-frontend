export type AttendanceMode = 'Manual' | 'QRCode' | 'Biometric' | 'Geofencing' | 'Hotspot' | 'Online';

export interface CreateAttendanceSessionDto {
  scheduleSlotId: number;
  facultyMemberId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  attendanceMode: AttendanceMode;
  hotspotSsid?: string;
  qrCode?: string;
  sessionNotes?: string;
}

export interface EnrolledStudent {
  id: number;
  studentId: number;
  student: { user: { id: number; firstName?: string; lastName?: string; email?: string } };
}

export interface AttendanceCourseOption {
  id: number;
  programId: number;
  academicLevel: number;
  program: {
    id: number;
    name: string;
  };
  slot: {
    id: number;
    teacherId: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    type: string;
    course: {
      id: number;
      code: string;
      name: string;
    };
  };
}

export interface AttendanceCourseSummary {
  courseId: number;
  teacherId: number;
  course: {
    id: number;
    code: string;
    name: string;
    credits: number;
    description?: string | null;
  };
}

export interface StaffAttendanceCourse {
  courseId: number;
  courseName: string;
  courseCode: string;
  courseCredits: number;
  description?: string | null;
}

export interface AttendanceSessionRecord {
  id: number;
  studentId: number;
  status: 'Present' | 'Absent' | 'Late' | 'Excused' | 'Medical';
  notes?: string | null;
}

export interface AttendanceSession {
  id: number;
  scheduleSlotId: number;
  facultyMemberId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  attendanceMode: AttendanceMode;
  attendance?: AttendanceSessionRecord[];
}

export interface UpsertAttendancesDto {
  attendanceSessionId: number;
  records: Array<{ studentId: number; status: 'present'|'absent'|'late'; deviceIp?: string; deviceMac?: string; notes?: string }>;
}

export interface StudentAttendanceTimelineItem {
  id: number;
  status: 'Present' | 'Absent' | 'Late' | 'Excused' | 'Medical';
  recordedAt: string;
  attendanceSession: {
    id: number;
    sessionDate: string;
    attendanceMode: AttendanceMode;
    scheduleSlot: {
      id: number;
      course: {
        id: number;
        code: string;
        name: string;
      };
    };
  };
}

export interface StudentAttendanceStatus {
  semesterId: number;
  timeline: StudentAttendanceTimelineItem[];
  qrPayload: string;
}

export interface MobileTimetableCourse {
  id: number;
  code: string;
  name: string;
  credits?: number;
  description?: string | null;
  type?: string | null;
}

export interface MobileTimetableClassroom {
  id: number;
  building?: string | null;
  classroomNumber?: string | null;
  label?: string | null;
  capacity?: number | null;
}

export interface MobileTimetableTeacher {
  name?: string | null;
  email?: string | null;
}

export interface MobileTimetableItem {
  id: number;
  slotId: number;
  slotContextId: number | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  type: string;
  registrationStatus: string | null;
  course: MobileTimetableCourse | null;
  classroom: MobileTimetableClassroom | null;
  teacher: MobileTimetableTeacher | null;
  program?: { id: number; name: string } | null;
  academicLevel?: number | null;
}

export interface MobileTimetableData {
  role: 'student' | 'staff';
  semesterId: number;
  timetable: MobileTimetableItem[];
}

export interface DashboardCourse {
  id: number;
  code: string;
  name: string;
  credits?: number;
}

export interface DashboardClassroom {
  id: number;
  building?: string | null;
  classroomNumber?: string | null;
}

export interface StudentDashboardScheduleItem {
  id: number;
  status: string;
  scheduleSlotContext?: {
    id: number;
    slot?: {
      id: number;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      course: DashboardCourse;
      classroom?: DashboardClassroom | null;
      teacher?: {
        user?: {
          firstName?: string | null;
          lastName?: string | null;
        } | null;
      } | null;
    } | null;
  } | null;
}

export interface StaffDashboardScheduleItem {
  id: number;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  course: DashboardCourse;
  classroom?: DashboardClassroom | null;
  slotContext: Array<{
    id: number;
    academicLevel: number;
    program: {
      id: number;
      name: string;
    };
  }>;
}

export interface StudentDashboardCreditSegment {
  label: string;
  completedCreditHours: number;
  requiredCreditHours: number;
  remainingCreditHours: number;
  percent: number;
}

export interface StudentDashboardData {
  role: 'student';
  semesterId: number;
  dayOfWeek: string;
  stats: {
    registeredCourses: number;
    registeredCreditHours: number;
    completedCourses: number;
    completedCreditHours: number;
  };
  creditProgress: {
    completedCourses: number;
    completedCreditHours: number;
    totalRequiredCreditHours: number;
    remainingCreditHours: number;
    percent: number;
    requirements: {
      university: number;
      faculty: number;
      program: number;
      total: number;
    };
    program: { id: number; name: string } | null;
    faculty: { id: number; name: string } | null;
    segments: StudentDashboardCreditSegment[];
  };
  todaySchedule: StudentDashboardScheduleItem[];
}

export interface StaffDashboardData {
  role: 'staff';
  semesterId: number;
  dayOfWeek: string;
  stats: {
    totalSessions: number;
    distinctCourseCount: number;
    enrolledStudents: number;
  };
  todaySchedule: StaffDashboardScheduleItem[];
}

export interface GenericDashboardData {
  role: 'user';
  semesterId: number;
  dayOfWeek: string;
  stats: Record<string, never>;
  todaySchedule: [];
}

export type AttendanceDashboardData =
  | StudentDashboardData
  | StaffDashboardData
  | GenericDashboardData;
