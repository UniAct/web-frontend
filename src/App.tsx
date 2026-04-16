import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { Dashboard } from './pages/Dashboard';
import { TenantNotFoundPage } from './pages/TenantNotFoundPage';
import { AttendancePage } from './pages/AttendancePage';
import { TeamsPage } from './pages/TeamsPage';
import { GroupsPage } from './pages/GroupsPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AlumniHubPage } from './pages/AlumniHubPage';
import { CareerBoardPage } from './pages/CareerBoardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SuperAdminPanel } from './pages/SuperAdminPanel';
import VerifyRootAccountPage from './pages/VerifyRootAccountPage';
import VerifyStaffAccountPage from './pages/VerifyStaffAccountPage';
import { AcademicRegistrationPage } from './pages/AcademicRegistrationPage';
import { TimetablePage } from './pages/TimetablePage';
import { Navigation } from './components/layout/Navigation';
import { Header } from './components/layout/Header';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { BootstrapAnimation } from './components/bootstrap/BootstrapAnimation';
import { TenantDetectionService } from './services/TenantDetectionService';
import { apiClient } from './api';

export type UserRole = 'student' | 'faculty' | 'admin' | 'alumni' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  year?: number;
  studentId?: string;
  programId?: number;
  programName?: string;
  programLevelId?: number;
  programLevel?: number;
  currentSemesterId?: number;
  currentSemesterType?: 'Fall' | 'Spring' | 'Summer';
  currentSemesterYear?: number;
  currentSemesterTerm?: number;
}

function resolveFrontendRoleFromBackendRoles(rawRoles: unknown): UserRole {
  if (!Array.isArray(rawRoles) || rawRoles.length === 0) return 'student';

  const normalizedRoles = rawRoles
    .filter((role): role is string => typeof role === 'string')
    .map((role) => role.toLowerCase());

  // Priority matters for users with multiple roles.
  if (normalizedRoles.some((role) => role.includes('superadmin'))) return 'superadmin';
  if (normalizedRoles.some((role) => role.includes('admin') || role.includes('root'))) return 'admin';
  if (normalizedRoles.some((role) => role.includes('staff') || role.includes('faculty'))) return 'faculty';
  if (normalizedRoles.some((role) => role.includes('alumni'))) return 'alumni';
  if (normalizedRoles.some((role) => role.includes('student'))) return 'student';

  return 'student';
}

function resolveUserRole(parsed: any, fallbackRole: UserRole = 'student'): UserRole {
  const roles = Array.isArray(parsed?.roles) ? parsed.roles : [];
  const roleFromRoles = roles.length > 0 ? resolveFrontendRoleFromBackendRoles(roles) : fallbackRole;

  if (roleFromRoles === 'superadmin' || roleFromRoles === 'admin') return roleFromRoles;
  if (parsed?.isStaff === true || parsed?.isStaffAccount === true) return 'faculty';
  if (parsed?.isStudent === true) return 'student';

  return roleFromRoles;
}

function resolveDashboardPage(role: UserRole): string {
  if (role === 'admin' || role === 'superadmin') {
    return 'superadmin';
  }

  return 'dashboard';
}

function resolvePageFromQuery(page: string | null, role: UserRole): string {
  if (!page) return resolveDashboardPage(role);

  const allowedPages: Record<UserRole, string[]> = {
    student: ['dashboard', 'academic-registration', 'timetable', 'attendance', 'teams', 'groups', 'ai-assistant', 'alumni-hub', 'career-board', 'profile'],
    faculty: ['dashboard', 'attendance', 'teams', 'groups', 'ai-assistant', 'profile'],
    admin: ['superadmin'],
    alumni: ['dashboard', 'alumni-hub', 'career-board', 'profile'],
    superadmin: ['superadmin'],
  };

  const rolePages = allowedPages[role] ?? allowedPages.student;
  return rolePages.includes(page) ? page : resolveDashboardPage(role);
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function parseOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildUserFromSession(parsed: any, role: UserRole): User {
  const firstName = parseOptionalString(parsed?.firstName);
  const lastName = parseOptionalString(parsed?.lastName);

  const resolvedName =
    parseOptionalString(parsed?.studentFullname) ||
    parseOptionalString(parsed?.student_fullname) ||
    parseOptionalString(parsed?.['student Fullname']) ||
    parseOptionalString(parsed?.student?.fullname) ||
    (firstName ? `${firstName} ${lastName ?? ''}`.trim() : undefined) ||
    parseOptionalString(parsed?.username) ||
    parseOptionalString(parsed?.email) ||
    'Unknown User';

  const resolvedEmail =
    parseOptionalString(parsed?.email) ||
    parseOptionalString(parsed?.username) ||
    'unknown@example.com';

  return {
    id:
      parsed?.id !== undefined && parsed?.id !== null
        ? String(parsed.id)
        : parseOptionalString(parsed?.username) || resolvedEmail || 'unknown',
    name: resolvedName,
    email: resolvedEmail,
    role,
    department:
      parseOptionalString(parsed?.department) ||
      parseOptionalString(parsed?.university) ||
      parseOptionalString(parsed?.university_name) ||
      undefined,
    studentId:
      (parsed?.universityStudentId !== undefined && parsed?.universityStudentId !== null
        ? String(parsed.universityStudentId)
        : undefined) ||
      (parsed?.student?.universityStudentId !== undefined && parsed?.student?.universityStudentId !== null
        ? String(parsed.student.universityStudentId)
        : undefined) ||
      (parsed?.id !== undefined && parsed?.id !== null ? String(parsed.id) : undefined),
    programId: parseOptionalNumber(
      parsed?.programId ??
      parsed?.programID ??
      parsed?.program?.id ??
      parsed?.student?.programId ??
      parsed?.student?.program?.id,
    ),
    programName:
      parseOptionalString(parsed?.programName) ||
      parseOptionalString(parsed?.program_name) ||
      parseOptionalString(parsed?.program) ||
      parseOptionalString(parsed?.program?.programName) ||
      parseOptionalString(parsed?.program?.name) ||
      parseOptionalString(parsed?.student?.program?.name) ||
      undefined,
    programLevelId: parseOptionalNumber(
      parsed?.programLevelId ??
      parsed?.programLevelID ??
      parsed?.programLevel?.id ??
      parsed?.student?.programLevelId ??
      parsed?.student?.programLevel?.id,
    ),
    programLevel: parseOptionalNumber(
      parsed?.programLevel?.level ??
      parsed?.programLevel ??
      parsed?.programLEVEL ??
      parsed?.programLevelNumber ??
      parsed?.program_level ??
      parsed?.student?.programLevel?.level,
    ),
    currentSemesterId: parseOptionalNumber(
      parsed?.semester?.id ??
      parsed?.currentSemesterId ??
      parsed?.currentSemesterID ??
      parsed?.semesterId ??
      parsed?.semesterID ??
      parsed?.student?.currentSemesterId,
    ),
    currentSemesterType: (() => {
      const semesterType =
        parseOptionalString(parsed?.semester?.type) ||
        parseOptionalString(parsed?.currentSemesterType) ||
        parseOptionalString(parsed?.currentSemesterTYPE) ||
        parseOptionalString(parsed?.student?.currentSemesterType);

      return semesterType === 'Fall' || semesterType === 'Spring' || semesterType === 'Summer'
        ? semesterType
        : undefined;
    })(),
    currentSemesterYear: parseOptionalNumber(
      parsed?.semester?.year ??
      parsed?.currentSemesterYear ??
      parsed?.currentSemesterYEAR ??
      parsed?.student?.currentSemesterYear,
    ),
    currentSemesterTerm: parseOptionalNumber(
      parsed?.semester?.term ??
      parsed?.currentSemesterTerm ??
      parsed?.currentSemesterTERM ??
      parsed?.student?.currentSemesterTerm,
    ),
  };
}

export default function App() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [tenantNotFound, setTenantNotFound] = useState(false);
  const [tenantSubdomain, setTenantSubdomain] = useState<string>('');
  const [isCheckingTenant, setIsCheckingTenant] = useState(true);
  const [shouldShowBootstrap, setShouldShowBootstrap] = useState(true);
  const ANIMATION_MIN_DURATION = 3000; // Minimum 3 seconds for animation visibility
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New Assignment Posted', message: 'Data Structures Assignment 3 is now available', time: '2 hours ago', read: false },
    { id: '2', title: 'Team Meeting Reminder', message: 'Project team meeting scheduled for tomorrow at 2 PM', time: '1 day ago', read: false },
    { id: '3', title: 'Career Fair Registration', message: 'Register for the upcoming career fair by March 15th', time: '2 days ago', read: true }
  ]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authError = params.get('authError');

    if (!authError) return;

    toast.error(authError || 'You are not authorized to access this page.');
    params.delete('authError');

    const nextSearch = params.toString();
    const nextUrl = `${location.pathname}${nextSearch ? `?${nextSearch}` : ''}${location.hash}`;
    window.history.replaceState({}, '', nextUrl);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const roleKey = user?.role ?? 'guest';
    document.documentElement.setAttribute('data-user-role', roleKey);
  }, [user]);

  const currentPage = user ? resolvePageFromQuery(searchParams.get('page'), user.role) : 'home';

  const navigateToPage = (page: string) => {
    const next = new URLSearchParams(location.search);
    next.set('page', page);

    if (page !== 'superadmin') {
      next.delete('adminPage');
    }

    setSearchParams(next, { replace: true });
  };

  // Check tenant validity on mount
  useEffect(() => {
    const checkTenant = async () => {
      try {
        const tenantContext = TenantDetectionService.detectTenant();

        console.log('[App] Checking tenant context:', tenantContext);

        // SuperAdmin doesn't need tenant validation
        if (tenantContext.isSuperAdmin) {
          console.log('[App] SuperAdmin access detected, skipping tenant validation');
          setIsCheckingTenant(false);
          return;
        }

        // For tenant-specific access, validate the tenant exists
        if (tenantContext.subdomain) {
          console.log('[App] Tenant access detected, validating tenant:', tenantContext.subdomain);
          setTenantSubdomain(tenantContext.subdomain);

          try {
            const isValidTenant = await apiClient.validateCurrentTenant();

            if (!isValidTenant) {
              console.error('[App] Tenant not found or inactive:', tenantContext.subdomain);
              setTenantNotFound(true);
              setIsCheckingTenant(false);
              return;
            }

            console.log('[App] Tenant validation passed');
            setIsCheckingTenant(false);
          } catch (error) {
            console.warn('[App] Could not verify tenant:', error);
            setIsCheckingTenant(false);
          }
        }
      } catch (err) {
        console.error('[App] Error checking tenant:', err);
        setIsCheckingTenant(false);
      }
    };

    // Ensure animation plays for minimum duration
    const animationTimer = setTimeout(() => {
      setShouldShowBootstrap(false);
    }, ANIMATION_MIN_DURATION);

    checkTenant();

    return () => clearTimeout(animationTimer);
  }, []);

  // Try to restore session from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      if (token && userJson) {
        const parsed = JSON.parse(userJson);

        const restoredRole = resolveUserRole(parsed, 'student');
        const restoredUser = buildUserFromSession(parsed, restoredRole);
        setUser(restoredUser);
      }
    } catch (err) {
      // corrupted localStorage entries - clear them
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenantId');
      console.warn('Failed to restore session, cleared localStorage.');
    }
  }, []);

  // handleLogin: try to use stored session if available; otherwise fall back to mock logic
  const handleLogin = (email: string, role: UserRole) => {
    // If there is a full session in localStorage, restore it
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      try {
        const parsed = JSON.parse(userJson);

        // Extract role from backend response
        // The backend may return multiple roles; resolve with explicit priority.
        let finalRole = role;
        if (parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0) {
          finalRole = resolveUserRole(parsed, role);
          console.log(`[App] Backend returned roles: ${parsed.roles.join(', ')}; resolved role: ${finalRole}`);
        } else if (parsed?.isStaff === true || parsed?.isStaffAccount === true) {
          finalRole = 'faculty';
        } else if (parsed?.isStudent === true) {
          finalRole = 'student';
        }

        const sessionUser = buildUserFromSession(parsed, finalRole);
        setUser(sessionUser);

        // Route based on role and tenant context
        const tenantContext = TenantDetectionService.detectTenant();
        if (tenantContext.isSuperAdmin) {
          // SuperAdmin: show only tenant management page
          console.log('[App] Routing to SuperAdminPanel (SuperAdmin context)');
          navigateToPage(resolvePageFromQuery(new URLSearchParams(location.search).get('page'), 'superadmin'));
        } else {
          // Tenant users: route based on role
          if (finalRole === 'admin') {
            console.log('[App] Routing to SuperAdminPanel (Admin role at tenant)');
            navigateToPage(resolvePageFromQuery(new URLSearchParams(location.search).get('page'), 'admin')); // Admin gets admin panel (RBAC Management)
          } else {
            const nextPage = resolvePageFromQuery(new URLSearchParams(location.search).get('page'), finalRole);
            console.log(`[App] Routing to ${nextPage} (${finalRole} role at tenant)`);
            navigateToPage(nextPage);
          }
        }
        return;
      } catch (err) {
        console.warn('Failed to parse login response:', err);
        // fall through to mock fallback
      }
    }

    // --- fallback mock authentication (keeps previous behavior for demo/test) ---
    // Check for super admin login
    if (role === 'superadmin') {
      const superAdminUser: User = {
        id: 'superadmin',
        name: 'Super Administrator',
        email: email,
        role: 'superadmin',
        department: 'System Administration'
      };
      setUser(superAdminUser);
      navigateToPage(resolvePageFromQuery(new URLSearchParams(location.search).get('page'), 'superadmin'));
      return;
    }

    // Check for admin login - redirect to admin panel
    if (role === 'admin') {
      const adminUser: User = {
        id: 'admin',
        name: 'Administrator',
        email,
        role: 'admin',
        department: 'Alexandria National University'
      };
      setUser(adminUser);
      navigateToPage(resolvePageFromQuery(new URLSearchParams(location.search).get('page'), 'admin'));
      return;
    }

    // Other roles (student, faculty, alumni)
    const mockUser: User = {
      id: '1',
      name: role === 'student' ? 'John Doe' : role === 'faculty' ? 'Dr. Sarah Wilson' : 'Alumni Jane',
      email,
      role,
      department: 'Computer Science',
      year: role === 'student' ? 2024 : undefined
    };
    setUser(mockUser);
    navigateToPage(resolvePageFromQuery(new URLSearchParams(location.search).get('page'), role));
  };

  const handleLogout = () => {
    setUser(null);
    // clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantId');
    setSearchParams(new URLSearchParams(), { replace: true });
    // keep tenantId for dev convenience if you want; remove if you prefer full logout
    // localStorage.removeItem('tenantId');
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // Show bootstrapping animation while checking tenant (forced minimum duration)
  if (shouldShowBootstrap || isCheckingTenant) {
    return (
      <BootstrapAnimation
        message="Initializing tenant infrastructure..."
        phaseDuration={1200}
        onComplete={() => {
          // Animation sequence complete, but still showing until minimum duration reached
          console.log('[App] Bootstrap animation sequence complete');
        }}
      />
    );
  }

  // Routes that don't require authentication
  if (location.pathname.startsWith('/verify-root-account')) {
    return (
      <>
        <VerifyRootAccountPage />
        <Toaster />
      </>
    );
  }

  if (location.pathname.startsWith('/verify-staff-account')) {
    return (
      <>
        <VerifyStaffAccountPage />
        <Toaster />
      </>
    );
  }

  // Show tenant not found page if tenant doesn't exist
  if (tenantNotFound) {
    return (
      <TenantNotFoundPage
        subdomain={tenantSubdomain}
        onGoHome={() => {
          TenantDetectionService.navigateToSuperAdmin();
        }}
      />
    );
  }

  // Show homepage when not logged in
  if (!user) {
    return (
      <>
        <HomePage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'superadmin':
        return <SuperAdminPanel user={user} onLogout={handleLogout} />;
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'academic-registration':
        return <AcademicRegistrationPage user={user} />;
      case 'timetable':
        return <TimetablePage user={user} />;
      case 'attendance':
        return <AttendancePage user={user} />;
      case 'teams':
        return <TeamsPage user={user} />;
      case 'groups':
        return <GroupsPage user={user} />;
      case 'ai-assistant':
        return <AIAssistantPage user={user} />;
      case 'alumni-hub':
        return <AlumniHubPage user={user} />;
      case 'career-board':
        return <CareerBoardPage user={user} />;
      case 'profile':
        return <ProfilePage user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  // Super admin gets their own layout
  if (user?.role === 'superadmin') {
    return (
      <>
        {renderPage()}
        <Toaster />
      </>
    );
  }

  // Admin also uses super admin panel (unified interface)
  if (user?.role === 'admin') {
    return (
      <>
        {renderPage()}
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Navigation
        user={user}
        currentPage={currentPage}
        onNavigate={navigateToPage}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="lg:ml-20 min-h-screen transition-all duration-300">
        <Header
          user={user}
          notifications={notifications}
          onNotificationRead={markNotificationAsRead}
        />
        <main className="pt-28 lg:pt-32 px-4 md:px-6 lg:px-8 pb-8">
          {renderPage()}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
