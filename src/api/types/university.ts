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
  faculties: number;
  programs: number;
  courses: number;
  classrooms: number;
  learningGroups: number;
  activeRegistrations: number;
  attendanceSessions: number;
}

export interface UniversityAnalyticsResources {
  classrooms: number;
  totalCapacity: number;
  maintenanceClassrooms: number;
}

export interface UniversityAnalyticsCommunications {
  announcements: number;
  events: number;
}

export interface UniversityAnalyticsAttendanceWindow {
  present: number;
  absent: number;
  late: number;
  excused: number;
  medical: number;
  total: number;
  attendanceRate: number;
}

export interface UniversityAnalyticsAttendance {
  last30Days: UniversityAnalyticsAttendanceWindow;
}

export interface UniversityAnalyticsFacultyBreakdown {
  id: number;
  name: string;
  programs: number;
  students: number;
  staff: number;
  courses: number;
}

export interface UniversityAnalyticsProgramBreakdown {
  id: number;
  name: string;
  facultyName: string;
  programType: string;
  students: number;
  levels: number;
  courses: number;
  averageCgpa: number;
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
  resources: UniversityAnalyticsResources;
  communications: UniversityAnalyticsCommunications;
  attendance: UniversityAnalyticsAttendance;
  facultyBreakdown: UniversityAnalyticsFacultyBreakdown[];
  programBreakdown: UniversityAnalyticsProgramBreakdown[];
  todayAbsences: UniversityAnalyticsProgramAbsence[];
  upcomingItems: UniversityAnalyticsItem[];
  generatedAt: string;
}
