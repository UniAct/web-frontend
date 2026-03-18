export interface University {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  established_date?: string;
  accreditation?: string;
  db_schema: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UniversityCreateInput {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  established_date: string;
  accreditation: string;
  db_schema: string;
}

export interface PublicTenantProfile {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  accreditation?: string;
  db_schema: string;
  is_active: boolean;
}
