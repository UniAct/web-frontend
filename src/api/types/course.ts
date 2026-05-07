export type CourseType = 'Mandatory' | 'Elective' | 'Project';

export interface CoursePrerequisite {
  courseId: number;
  prerequisiteId: number;
  prerequisiteCode?: string;
  prerequisiteName?: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  description?: string;
  credits: number;
  syllabus?: string;
  successPercentage?: number;
  minFinalSuccessPercentage?: number;
  totalFail?: boolean;
  programId: number;
  programLevelId?: number;
  courseType: CourseType;
  prerequisites: CoursePrerequisite[];
}

export interface CourseCreateInput {
  name: string;
  code: string;
  description?: string;
  credits: number;
  syllabus?: string;
  successPercentage?: number;
  minFinalSuccessPercentage?: number;
  totalFail?: boolean;
  programId: number;
  programLevelId: number;
  courseType: CourseType;
  prerequisiteIds?: number[];
}

export interface CourseUpdateInput extends CourseCreateInput {}
