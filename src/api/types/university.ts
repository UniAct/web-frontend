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
  settings?: UniversitySettings;
}

export interface UniversitySettings {
  id: number;
  university_id: number;
  primary_color: string;
  secondary_color: string;
  tab_name?: string | null;
  logo_url?: string | null;
  hero_images: string[];
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
  settings: UniversitySettings;
}
