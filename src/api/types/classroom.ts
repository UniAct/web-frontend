export type ClassroomType = 'Lecture' | 'Lab' | 'Auditorium' | 'Other';

export interface ClassSessionSummary {
  id: number;
}

export interface Classroom {
  id: number;
  roomNumber: string;
  building: string;
  capacity: number;
  type: ClassroomType;
  isAvailable: boolean;
  classSessions?: ClassSessionSummary[];
}

export interface ClassroomCreateInput {
  roomNumber: string;
  building: string;
  capacity: number;
  type: ClassroomType;
  isAvailable?: boolean;
}

export interface ClassroomUpdateInput extends ClassroomCreateInput { }
