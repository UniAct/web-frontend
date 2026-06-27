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

export type CourseAssessmentType = 'Quiz' | 'Assignment' | 'Midterm' | 'Final' | 'Project';

export interface CourseAssessment {
  assessmentId: number;
  label: string;
  assessmentType: CourseAssessmentType;
  maxMarks: number;
}

export interface CourseStudentGrade {
  gradeId: number;
  assessmentId: number;
  label: string;
  assessmentType?: CourseAssessmentType;
  maxMarks: number;
  obtainedMarks: number;
}

export interface CourseStudentGrades {
  studentName: string;
  universityStudentId: string;
  grades: CourseStudentGrade[];
}

export interface AssignCourseAssessmentInput {
  assessments: Array<{
    label: string;
    assessmentType: CourseAssessmentType;
    marks: number;
  }>;
}

export interface UpdateCourseAssessmentInput {
  assessments: Array<{
    assessmentId: number;
    label: string;
    assessmentType?: CourseAssessmentType;
    marks: number;
  }>;
}

export interface CreateCourseAssessmentInput {
  label: string;
  assessmentType: CourseAssessmentType;
  marks: number;
}

export interface UpdateStudentGradeInput {
  marks: number;
}
