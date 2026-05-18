import { courseApi } from './course.api';
import type {
  AssignCourseAssessmentInput,
  Course,
  CourseAssessment,
  CreateCourseAssessmentInput,
  CourseCreateInput,
  CourseStudentGrade,
  CourseStudentGrades,
  CourseUpdateInput,
  UpdateCourseAssessmentInput,
  UpdateStudentGradeInput,
} from '../../types';

interface RawCourse {
  id: number;
  name: string;
  code: string;
  description?: string;
  credits: number;
  syllabus?: string;
  successPercentage?: number | string | null;
  minFinalSuccessPercentage?: number | string | null;
  totalFail?: boolean;
  programCourses?: Array<{
    programId: number;
    programLevelId?: number;
    type: Course['courseType'];
  }>;
  coursePrerequisites?: Array<{
    courseId: number;
    prerequisiteId: number;
    prerequisite?: {
      code?: string;
      name?: string;
    };
  }>;
}

function toNumber(value: number | string | undefined | null): number | undefined {
  if (value === undefined || value === null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function mapCourse(raw: RawCourse): Course {
  const firstProgram = raw.programCourses?.[0];

  return {
    id: raw.id,
    name: raw.name,
    code: raw.code,
    description: raw.description,
    credits: raw.credits,
    syllabus: raw.syllabus,
    successPercentage: toNumber(raw.successPercentage),
    minFinalSuccessPercentage: toNumber(raw.minFinalSuccessPercentage),
    totalFail: raw.totalFail,
    programId: firstProgram?.programId ?? 0,
    programLevelId: firstProgram?.programLevelId,
    courseType: firstProgram?.type ?? 'Mandatory',
    prerequisites: (raw.coursePrerequisites ?? []).map((item) => ({
      courseId: item.courseId,
      prerequisiteId: item.prerequisiteId,
      prerequisiteCode: item.prerequisite?.code,
      prerequisiteName: item.prerequisite?.name,
    })),
  };
}

export const CourseService = {
  async getAll(): Promise<Course[]> {
    const res = await courseApi.getCourses();
    if (!res.data) throw new Error(res.message || 'Failed to fetch courses');
    return (res.data as unknown as RawCourse[]).map(mapCourse);
  },

  async getById(id: number): Promise<Course> {
    const res = await courseApi.getCourseById(id);
    if (!res.data) throw new Error(res.message || 'Course not found');
    return mapCourse(res.data as unknown as RawCourse);
  },

  async create(data: CourseCreateInput): Promise<Course> {
    const res = await courseApi.createCourse(data);
    if (!res.data) throw new Error(res.message || 'Failed to create course');
    return mapCourse(res.data as unknown as RawCourse);
  },

  async update(id: number, data: CourseUpdateInput): Promise<Course> {
    const res = await courseApi.updateCourse(id, data);
    if (!res.data) throw new Error(res.message || 'Failed to update course');
    return mapCourse(res.data as unknown as RawCourse);
  },

  async delete(id: number): Promise<void> {
    await courseApi.deleteCourse(id);
  },

  async getAssessments(courseId: number): Promise<CourseAssessment[]> {
    const res = await courseApi.getCourseAssessments(courseId);
    if (!res.data) return [];
    return res.data;
  },

  async assignAssessments(courseId: number, data: AssignCourseAssessmentInput): Promise<CourseAssessment[]> {
    const res = await courseApi.assignCourseAssessments(courseId, data);
    if (!res.data) throw new Error(res.message || 'Failed to assign assessments');
    return res.data;
  },

  async createAssessment(courseId: number, data: CreateCourseAssessmentInput): Promise<CourseAssessment> {
    const res = await courseApi.createCourseAssessment(courseId, data);
    if (!res.data) throw new Error(res.message || 'Failed to create assessment');
    return res.data;
  },

  async updateAssessments(courseId: number, data: UpdateCourseAssessmentInput): Promise<CourseAssessment[]> {
    const res = await courseApi.updateCourseAssessments(courseId, data);
    if (!res.data) throw new Error(res.message || 'Failed to update assessments');
    return res.data;
  },

  async getStudents(courseId: number): Promise<CourseStudentGrades[]> {
    const res = await courseApi.getCourseStudents(courseId);
    if (!res.data) return [];
    return res.data;
  },

  async updateStudentGrade(gradeId: number, data: UpdateStudentGradeInput): Promise<CourseStudentGrade> {
    const res = await courseApi.updateStudentGrade(gradeId, data);
    if (!res.data) throw new Error(res.message || 'Failed to update grade');
    return res.data;
  },

  async deleteAssessment(assessmentId: number): Promise<CourseAssessment> {
    const res = await courseApi.deleteCourseAssessment(assessmentId);
    if (!res.data) throw new Error(res.message || 'Failed to delete assessment');
    return res.data;
  },
};
