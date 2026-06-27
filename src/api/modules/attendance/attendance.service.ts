import { attendanceApi } from './attendance.api';
import type {
  AttendanceCourseOption,
  AttendanceCourseSummary,
  AttendanceDashboardData,
  AttendanceSessionRecord,
  AttendanceSession,
  CreateAttendanceSessionDto,
  MobileTimetableData,
  StaffAttendanceCourse,
  StudentAttendanceStatus,
  UpsertAttendancesDto,
} from '../../types/attendance';
import type { EnrolledStudent } from '../../types/attendance';

export const AttendanceService = {
  async getCourseOptions(params: {
    semesterId: number;
    teacherId?: number;
    programId?: number;
    academicLevel?: number;
    courseId?: number;
  }): Promise<AttendanceCourseOption[]> {
    const res = await attendanceApi.getCourseOptions(params);
    if (!res.data) return [];
    return res.data as AttendanceCourseOption[];
  },

  async getCourseSummaries(params: { semesterId: number }): Promise<AttendanceCourseSummary[]> {
    const res = await attendanceApi.getCourseSummaries(params);
    if (!res.data) return [];
    return res.data as AttendanceCourseSummary[];
  },

  async getStaffCourses(staffId: number): Promise<StaffAttendanceCourse[]> {
    const res = await attendanceApi.getStaffCourses(staffId);
    if (!res.data) return [];
    return res.data as StaffAttendanceCourse[];
  },

  async getDashboard(): Promise<AttendanceDashboardData> {
    const res = await attendanceApi.getDashboard();
    if (!res.data) throw new Error(res.message || 'Failed to fetch dashboard data');
    return res.data as AttendanceDashboardData;
  },

  async getMobileTimetable(): Promise<MobileTimetableData> {
    const res = await attendanceApi.getMobileTimetable();
    if (!res.data) throw new Error(res.message || 'Failed to fetch timetable');
    return res.data as MobileTimetableData;
  },

  async createSession(data: CreateAttendanceSessionDto): Promise<any> {
    const res = await attendanceApi.createSession(data as any);
    if (!res.data) throw new Error(res.message || 'Failed to create attendance session');
    return res.data;
  },

  async getSession(id: number) {
    const res = await attendanceApi.getSession(id);
    if (!res.data) throw new Error(res.message || 'Failed to fetch session');
    return res.data;
  },

  async getSessionBySlotAndDate(scheduleSlotId: number, date: string): Promise<AttendanceSession | null> {
    const res = await attendanceApi.getSessionBySlotAndDate(scheduleSlotId, date);
    return (res.data as AttendanceSession | null) ?? null;
  },

  async getEnrolled(slotContextId: number): Promise<EnrolledStudent[]> {
    const res = await attendanceApi.getEnrolled(slotContextId);
    if (!res.data) throw new Error(res.message || 'Failed to fetch enrolled students');
    return res.data;
  },

  async getEnrolledByCourse(courseId: number, semesterId?: number): Promise<EnrolledStudent[]> {
    const res = await attendanceApi.getEnrolledByCourse(courseId, semesterId);
    if (!res.data) throw new Error(res.message || 'Failed to fetch enrolled students');
    return res.data;
  },


  async saveAttendances(sessionId: number, data: UpsertAttendancesDto): Promise<AttendanceSessionRecord[]> {
    const res = await attendanceApi.saveAttendances(sessionId, data as any);
    if (res.status !== 'success') throw new Error(res.message || 'Failed to save attendances');
    return (res.data as AttendanceSessionRecord[] | undefined) ?? [];
  },

  async getStudentAttendanceStatus(semesterId?: number): Promise<StudentAttendanceStatus> {
    const res = await attendanceApi.getStudentAttendanceStatus(semesterId);
    if (!res.data) throw new Error(res.message || 'Failed to fetch attendance status');
    return res.data as StudentAttendanceStatus;
  }
};
