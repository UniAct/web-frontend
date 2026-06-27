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

export interface UniversityAnalyticsSummary {
  students: number;
  staff: number;
  admins: number;
  activeTeams: number;
}

export interface UniversityAnalyticsAbsenceLevel {
  id: number;
  name: string;
  absences: number;
}

export interface UniversityAnalyticsProgramAbsence {
  id: number;
  name: string;
  absences: number;
  levels: UniversityAnalyticsAbsenceLevel[];
}

export interface UniversityAnalyticsItem {
  id: number;
  title: string;
  description: string;
  type: 'ANNOUNCEMENT' | 'EVENT';
  date: string;
  location?: string | null;
}

export interface UniversityAnalytics {
  summary: UniversityAnalyticsSummary;
  todayAbsences: UniversityAnalyticsProgramAbsence[];
  upcomingItems: UniversityAnalyticsItem[];
  generatedAt: string;
}
