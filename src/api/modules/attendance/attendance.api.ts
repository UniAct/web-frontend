import { httpClient } from '../../core/http-client';
import type { ApiResponse } from '../types';
import type { CreateAttendanceSessionDto, UpsertAttendancesDto } from '../../types/attendance';

export const attendanceApi = {
  getCourseOptions(params: {
    semesterId: number;
    teacherId?: number;
    programId?: number;
    academicLevel?: number;
    courseId?: number;
  }) {
    const query = new URLSearchParams({
      semesterId: String(params.semesterId),
    });

    if (params.teacherId) query.set('teacherId', String(params.teacherId));
    if (params.programId) query.set('programId', String(params.programId));
    if (params.academicLevel) query.set('academicLevel', String(params.academicLevel));
    if (params.courseId) query.set('courseId', String(params.courseId));

    return httpClient.request('GET', `/attendance/courses?${query.toString()}`, undefined, { requireResolvedTenant: true });
  },

  getCourseSummaries(params: { semesterId: number }) {
    const query = new URLSearchParams({
      semesterId: String(params.semesterId),
    });

    return httpClient.request('GET', `/attendance/course-summaries?${query.toString()}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getStaffCourses(staffId: number) {
    return httpClient.request('GET', `/course/staff/${staffId}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getDashboard() {
    return httpClient.request('GET', '/attendance/mobile/dashboard', undefined, {
      requireResolvedTenant: true,
    });
  },

  getMobileTimetable() {
    return httpClient.request('GET', '/attendance/mobile/timetable', undefined, {
      requireResolvedTenant: true,
    });
  },

  createSession(data: CreateAttendanceSessionDto) {
    return httpClient.request('POST', '/attendance/session', data, { requireResolvedTenant: true });
  },

  getSession(id: number) {
    return httpClient.request('GET', `/attendance/session/${id}`, undefined, { requireResolvedTenant: true });
  },

  getSessionBySlotAndDate(scheduleSlotId: number, date: string) {
    const query = new URLSearchParams({ date });
    return httpClient.request('GET', `/attendance/session/by-slot/${scheduleSlotId}?${query.toString()}`, undefined, { requireResolvedTenant: true });
  },

  getEnrolled(slotContextId: number) {
    return httpClient.request('GET', `/attendance/enrolled/${slotContextId}`, undefined, { requireResolvedTenant: true });
  },

  getEnrolledByCourse(courseId: number, semesterId?: number) {
    const query = semesterId ? `?semesterId=${semesterId}` : '';
    return httpClient.request('GET', `/attendance/enrolled/course/${courseId}${query}`, undefined, { requireResolvedTenant: true });
  },

  saveAttendances(sessionId: number, data: UpsertAttendancesDto) {
    return httpClient.request('POST', `/attendance/session/${sessionId}/attendances`, data, { requireResolvedTenant: true });
  },

  getStudentAttendanceStatus(semesterId?: number) {
    const query = semesterId ? `?semesterId=${semesterId}` : '';
    return httpClient.request('GET', `/attendance/mobile/student/my-status${query}`, undefined, { requireResolvedTenant: true });
  }
};
