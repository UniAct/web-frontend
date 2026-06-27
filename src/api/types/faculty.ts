export interface Faculty {
  id: number;
  name: string;
  description?: string;
  universityId: number;
  deanId?: number;
  establishedDate?: string;
  regulations?: FacultyRegulation[];
}

export interface FacultyRegulation {
  id?: number;
  name: string;
  roundToWholeNumber: boolean;
  approximateFractions: boolean;
  maxAbsence: number;
  minGradeExcellent: number;
  minGradeVeryGood: number;
  minGradeGood: number;
  minGradeAcceptable: number;
  minGradeVeryWeak: number;
  enableMercyRules: boolean;
}

export interface FacultyCreateInput {
  name: string;
  universityId: number;
  description?: string;
  deanId?: number;
  establishedDate?: string;
  regulations: FacultyRegulation[];
}

export interface FacultyUpdateInput {
  universityId?: number;
  name?: string;
  description?: string;
  deanId?: number;
  establishedDate?: string;
  regulations?: FacultyRegulation[];
}
