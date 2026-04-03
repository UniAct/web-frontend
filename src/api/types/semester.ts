export interface Semester {
  id: number;
  year: number;
  term: number;
  type: 'Fall' | 'Spring' | 'Summer';
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SemesterCreateInput {
  year: number;
  term: number;
  startDate: string;
  endDate: string;
}

export interface SemesterUpdateInput {
  year?: number;
  term?: number;
  startDate?: string;
  endDate?: string;
}
