export type ClassroomType = 'Hall' | 'Lab' | 'Auditorium' | 'Other';

export interface ClassSessionSummary {
  id: number;
}

export interface Classroom {
  id: number;
  classroomNumber: string;
  building: string;
  capacity: number;
  type: ClassroomType;
  underMaintenance?: boolean;
  scheduleSlot?: ClassSessionSummary[];
}

export interface ClassroomCreateInput {
  classroomNumber: string;
  building: string;
  capacity: number;
  type: ClassroomType;
}

export interface ClassroomUpdateInput extends ClassroomCreateInput { }
