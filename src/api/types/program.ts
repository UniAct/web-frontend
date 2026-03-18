export type ProgramType = 'Bachelor' | 'Master' | 'Diploma' | 'PhD';
export type ResultDisplayType = 'CourseGrade' | 'DetailedEstimate';
export type BlockReasonType = 'NonPaymentCurrent' | 'NonPaymentOld';
export type FeeType =
  | 'ConstantYear'
  | 'ConstantSemester'
  | 'PerCreditHour'
  | 'PerCourse'
  | 'Administrative'
  | 'Other';

export interface ProgramFee {
  id: number;
  feeType: FeeType;
  semesterId?: number | null;
  semesterNumber?: number | null;
  amount: number;
  description?: string | null;
}

export interface ProgramLevel {
  id: number;
  level: number;
  minCredits: number;
  maxCredits: number;
  fees: ProgramFee[];
}

export interface ProgramTranscriptDefinition {
  id: number;
  minScore: number;
  maxScore: number;
  minGPA: number;
  maxGPA: number;
  gradeLetter: string;
  equivalentEstimate?: string | null;
}

export interface AcademicLoadSemester {
  id: number;
  level: number;
  semester: number;
  minCredits: number;
  maxCredits: number;
}

export interface AcademicLoadGPA {
  id: number;
  minGPA: number;
  maxGPA: number;
  minCredits: number;
  maxCredits: number;
}

export interface Program {
  id: number;
  name: string;
  description?: string;
  facultyId: number;
  headId?: number | null;
  phone?: string;
  universityCreditHours: number;
  facultyCreditHours: number;
  programCreditHours: number;
  programType: ProgramType;
  resultDisplay: ResultDisplayType;
  blockReason?: BlockReasonType | null;
  levelsNumber: number;
  levels: ProgramLevel[];
  transcriptDefinition: ProgramTranscriptDefinition[];
  academicLoadSemester: AcademicLoadSemester[];
  academicLoadGPA: AcademicLoadGPA[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramFeeInput {
  feeType: FeeType;
  semesterNumber?: number;
  amount: number;
  description?: string;
}

export interface ProgramLevelInput {
  level: number;
  minCredits: number;
  maxCredits: number;
  fees?: ProgramFeeInput[];
  semesterFees?: {
    semester1?: ProgramFeeInput[];
    semester2?: ProgramFeeInput[];
  };
  summerFees?: ProgramFeeInput[];
}

export interface ProgramTranscriptDefinitionInput {
  minScore: number;
  maxScore: number;
  minGPA: number;
  maxGPA: number;
  gradeLetter: string;
  equivalentEstimate?: string;
}

export interface AcademicLoadSemesterInput {
  level: number;
  semester: number;
  minCredits: number;
  maxCredits: number;
}

export interface AcademicLoadGPAInput {
  minGPA: number;
  maxGPA: number;
  minCredits: number;
  maxCredits: number;
}

export interface ProgramCreateInput {
  name: string;
  facultyId: number;
  description?: string;
  headId?: number;
  phone?: string;
  universityCreditHours?: number;
  facultyCreditHours?: number;
  programCreditHours?: number;
  programType: ProgramType;
  resultDisplay?: ResultDisplayType;
  blockReason?: BlockReasonType;
  levelsNumber?: number;
  levels?: ProgramLevelInput[];
  transcriptDefinition?: ProgramTranscriptDefinitionInput[];
  academicLoadSemester?: AcademicLoadSemesterInput[];
  academicLoadGPA?: AcademicLoadGPAInput[];
}

export interface ProgramUpdateInput extends ProgramCreateInput {}
