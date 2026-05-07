import { courseApi } from './course.api';
import type { Course, CourseCreateInput, CourseUpdateInput } from '../../types';

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
};
