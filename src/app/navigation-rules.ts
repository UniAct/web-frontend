import type { UserRole } from './types';

export function resolveDashboardPage(role: UserRole): string {
  if (role === 'admin' || role === 'superadmin') {
    return 'superadmin';
  }

  return 'dashboard';
}

export function resolvePageFromQuery(page: string | null, role: UserRole): string {
  if (!page) return resolveDashboardPage(role);

  const allowedPages: Record<UserRole, string[]> = {
    student: ['dashboard', 'academic-registration', 'timetable', 'attendance', 'teams', 'groups', 'ai-assistant', 'alumni-hub', 'career-board', 'profile'],
    faculty: ['dashboard', 'attendance', 'grades', 'teams', 'groups', 'ai-assistant', 'profile'],
    admin: ['superadmin'],
    alumni: ['dashboard', 'alumni-hub', 'career-board', 'profile'],
    superadmin: ['superadmin'],
  };

  const rolePages = allowedPages[role] ?? allowedPages.student;
  return rolePages.includes(page) ? page : resolveDashboardPage(role);
}

export function resolveAdminShellPage(page: string | null, role: Extract<UserRole, 'admin' | 'superadmin'>): string {
  if (role === 'superadmin') {
    return 'universities';
  }

  const allowedPages = [
    'statistics',
    'settings',
    'admins',
    'programs',
    'rooms',
    'timetabling',
    'staff',
    'students',
    'enrollment',
    'level-tables',
    'attendance',
    'grades',
    'announcements',
    'audit',
  ];

  if (!page) return 'statistics';
  return allowedPages.includes(page) ? page : 'statistics';
}

