import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  AssignCourseAssessmentInput,
  Course,
  CourseAssessment,
  CreateCourseAssessmentInput,
  CourseCreateInput,
  CourseStudentGrades,
  CourseUpdateInput,
  UpdateCourseAssessmentInput,
  UpdateStudentGradeInput,
  CourseStudentGrade,
} from '../../types';

export const courseApi = {
  createCourse(data: CourseCreateInput): Promise<ApiResponse<Course>> {
    return httpClient.request<Course>('POST', '/course', data, {
      requireResolvedTenant: true,
    });
  },

  getCourses(): Promise<ApiResponse<Course[]>> {
    return httpClient.request<Course[]>('GET', '/course', undefined, {
      requireResolvedTenant: true,
    });
  },

  getCourseById(id: number): Promise<ApiResponse<Course>> {
    return httpClient.request<Course>('GET', `/course/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  updateCourse(id: number, data: CourseUpdateInput): Promise<ApiResponse<Course>> {
    return httpClient.request<Course>('PUT', `/course/${id}`, data, {
      requireResolvedTenant: true,
    });
  },

  deleteCourse(id: number): Promise<ApiResponse<void>> {
    return httpClient.request<void>('DELETE', `/course/${id}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getCourseAssessments(courseId: number): Promise<ApiResponse<CourseAssessment[]>> {
    return httpClient.request<CourseAssessment[]>('GET', `/course/${courseId}/course-assessments`, undefined, {
      requireResolvedTenant: true,
    });
  },

  assignCourseAssessments(courseId: number, data: AssignCourseAssessmentInput): Promise<ApiResponse<CourseAssessment[]>> {
    return httpClient.request<CourseAssessment[]>('POST', `/course/${courseId}/assign-course-assessments`, data, {
      requireResolvedTenant: true,
    });
  },

  createCourseAssessment(courseId: number, data: CreateCourseAssessmentInput): Promise<ApiResponse<CourseAssessment>> {
    return httpClient.request<CourseAssessment>('POST', `/course/${courseId}/course-assessments`, data, {
      requireResolvedTenant: true,
    });
  },

  updateCourseAssessments(courseId: number, data: UpdateCourseAssessmentInput): Promise<ApiResponse<CourseAssessment[]>> {
    return httpClient.request<CourseAssessment[]>('PATCH', `/course/${courseId}/course-assessments`, data, {
      requireResolvedTenant: true,
    });
  },

  getCourseStudents(courseId: number): Promise<ApiResponse<CourseStudentGrades[]>> {
    return httpClient.request<CourseStudentGrades[]>('GET', `/course/${courseId}/students`, undefined, {
      requireResolvedTenant: true,
    });
  },

  updateStudentGrade(gradeId: number, data: UpdateStudentGradeInput): Promise<ApiResponse<CourseStudentGrade>> {
    return httpClient.request<CourseStudentGrade>('PATCH', `/course/grade/${gradeId}`, data, {
      requireResolvedTenant: true,
    });
  },

  deleteCourseAssessment(assessmentId: number): Promise<ApiResponse<CourseAssessment>> {
    return httpClient.request<CourseAssessment>('DELETE', `/course/course-assessments/${assessmentId}`, undefined, {
      requireResolvedTenant: true,
    });
  },
};
