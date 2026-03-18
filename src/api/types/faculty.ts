export interface Faculty {
  id: number;
  name: string;
  description?: string;
  universityId: number;
  deanId?: number;
  establishedDate?: string;
}

export interface FacultyCreateInput {
  name: string;
  universityId: number;
  description?: string;
  deanId?: number;
  establishedDate?: string;
}

export interface FacultyUpdateInput {
  universityId?: number;
  name?: string;
  description?: string;
  deanId?: number;
  establishedDate?: string;
}
