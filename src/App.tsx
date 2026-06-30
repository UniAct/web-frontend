import { Suspense, lazy, useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { TenantNotFoundPage } from './pages/TenantNotFoundPage';
import { Navigation } from './components/layout/Navigation';
import { Header } from './components/layout/Header';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { BootstrapAnimation } from './components/bootstrap/BootstrapAnimation';
import { TenantDetectionService } from './services/TenantDetectionService';
import { apiClient, UniversityService, type PublicTenantProfile } from './api';
import type { SessionLoginPayload, User, UserRole } from './app/types';
import { resolveAdminShellPage, resolvePageFromQuery } from './app/navigation-rules';
import {
  buildUserFromSession,
  clearStoredSession,
  persistFrontendRole,
  readStoredSessionUser,
  resolveUserRole,
} from './app/session';
import { applyTenantDocumentBranding } from './app/tenant-branding';
import { lazyNamed, RouteLoadingFallback } from './app/lazy';
import { logger } from './utils/logger';

export type { User, UserRole } from './app/types';

const HomePage = lazyNamed<typeof import('./pages/HomePage').HomePage>(
  () => import('./pages/HomePage'),
  'HomePage',
);
const Dashboard = lazyNamed<typeof import('./pages/Dashboard').Dashboard>(
  () => import('./pages/Dashboard'),
  'Dashboard',
);
const AttendancePage = lazyNamed<typeof import('./pages/AttendancePage').AttendancePage>(
  () => import('./pages/AttendancePage'),
  'AttendancePage',
);
const TeamsPage = lazyNamed<typeof import('./pages/TeamsPage').TeamsPage>(
  () => import('./pages/TeamsPage'),
  'TeamsPage',
);
const GroupsPage = lazyNamed<typeof import('./pages/GroupsPage').GroupsPage>(
  () => import('./pages/GroupsPage'),
  'GroupsPage',
);
const AIAssistantPage = lazyNamed<typeof import('./pages/AIAssistantPage').AIAssistantPage>(
  () => import('./pages/AIAssistantPage'),
  'AIAssistantPage',
);
const AlumniHubPage = lazyNamed<typeof import('./pages/AlumniHubPage').AlumniHubPage>(
  () => import('./pages/AlumniHubPage'),
  'AlumniHubPage',
);
const CareerBoardPage = lazyNamed<typeof import('./pages/CareerBoardPage').CareerBoardPage>(
  () => import('./pages/CareerBoardPage'),
  'CareerBoardPage',
);
const ProfilePage = lazyNamed<typeof import('./pages/ProfilePage').ProfilePage>(
  () => import('./pages/ProfilePage'),
  'ProfilePage',
);
const SuperAdminPanel = lazyNamed<typeof import('./pages/SuperAdminPanel').SuperAdminPanel>(
  () => import('./pages/SuperAdminPanel'),
  'SuperAdminPanel',
);
const AdminGradesPage = lazyNamed<typeof import('./components/admin/AdminGradesPage').AdminGradesPage>(
  () => import('./components/admin/AdminGradesPage'),
  'AdminGradesPage',
);
const AcademicRegistrationPage = lazyNamed<typeof import('./pages/AcademicRegistrationPage').AcademicRegistrationPage>(
  () => import('./pages/AcademicRegistrationPage'),
  'AcademicRegistrationPage',
);
const TimetablePage = lazyNamed<typeof import('./pages/TimetablePage').TimetablePage>(
  () => import('./pages/TimetablePage'),
  'TimetablePage',
);
const UniActBrandingPage = lazyNamed<typeof import('./pages/UniActBrandingPage').UniActBrandingPage>(
  () => import('./pages/UniActBrandingPage'),
  'UniActBrandingPage',
);
const SuperAdminLoginPage = lazyNamed<typeof import('./pages/SuperAdminLoginPage').SuperAdminLoginPage>(
  () => import('./pages/SuperAdminLoginPage'),
  'SuperAdminLoginPage',
);
const VerifyRootAccountPage = lazy(() => import('./pages/VerifyRootAccountPage'));
const VerifyStaffAccountPage = lazy(() => import('./pages/VerifyStaffAccountPage'));

export default function App() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(() => readStoredSessionUser());
  const [tenantNotFound, setTenantNotFound] = useState(false);
  const [tenantSubdomain, setTenantSubdomain] = useState<string>('');
  const [tenantProfile, setTenantProfile] = useState<PublicTenantProfile | null>(null);
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

  const effectiveUser = user ?? readStoredSessionUser();

  useEffect(() => {
    const roleKey = (effectiveUser ?? readStoredSessionUser())?.role ?? 'guest';
    document.documentElement.setAttribute('data-user-role', roleKey);
  }, [effectiveUser]);

  useEffect(() => {
    const tenantContext = TenantDetectionService.detectTenant();

    if (tenantContext.isBranding) {
      return;
    }

    if (tenantContext.isSuperAdmin || !tenantContext.subdomain) {
      setTenantProfile(null);
      applyTenantDocumentBranding(null);
      return;
    }

    let isMounted = true;

    UniversityService.getPublicTenantProfile(tenantContext.subdomain)
      .then((profile) => {
        if (!isMounted) return;
        setTenantProfile(profile);
        applyTenantDocumentBranding(profile);
      })
      .catch((error) => {
        logger.warn('[App] Failed to load tenant branding:', error);
        if (!isMounted) return;
        setTenantProfile(null);
        applyTenantDocumentBranding(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const tenantContext = TenantDetectionService.detectTenant();

    if (tenantContext.isBranding) {
      return;
    }

    if (tenantContext.isSuperAdmin || !tenantContext.subdomain) {
      applyTenantDocumentBranding(null);
      return;
    }

    applyTenantDocumentBranding(tenantProfile);
  }, [tenantProfile, user]);

  useEffect(() => {
    if (user) return;

    const restoredUser = readStoredSessionUser();
    if (restoredUser) {
      setUser(restoredUser);
    }
  }, [user, location.pathname, location.search]);

  useEffect(() => {
    if (!effectiveUser) return;

    const next = new URLSearchParams(location.search);
    let didChange = false;

    const resolvedPage = resolvePageFromQuery(searchParams.get('page'), effectiveUser.role);
    if (searchParams.get('page') !== resolvedPage) {
      next.set('page', resolvedPage);
      didChange = true;
    }

    if (effectiveUser.role === 'admin' || effectiveUser.role === 'superadmin') {
      const resolvedAdminPage = resolveAdminShellPage(
        searchParams.get('adminPage'),
        effectiveUser.role,
      );

      if (searchParams.get('adminPage') !== resolvedAdminPage) {
        next.set('adminPage', resolvedAdminPage);
        didChange = true;
      }
    } else if (next.has('adminPage')) {
      next.delete('adminPage');
      didChange = true;
    }

    if (didChange) {
      setSearchParams(next, { replace: true });
    }
  }, [effectiveUser, location.search, searchParams, setSearchParams]);

  const currentPage = effectiveUser ? resolvePageFromQuery(searchParams.get('page'), effectiveUser.role) : 'home';

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

        logger.debug('[App] Checking tenant context:', tenantContext);

        if (tenantContext.isBranding) {
          logger.debug('[App] Branding access detected, skipping tenant validation');
          setIsCheckingTenant(false);
          return;
        }

        // SuperAdmin doesn't need tenant validation
        if (tenantContext.isSuperAdmin) {
          logger.debug('[App] SuperAdmin access detected, skipping tenant validation');
          setIsCheckingTenant(false);
          return;
        }

        // For tenant-specific access, validate the tenant exists
        if (tenantContext.subdomain) {
          logger.debug('[App] Tenant access detected, validating tenant:', tenantContext.subdomain);
          setTenantSubdomain(tenantContext.subdomain);

          try {
            const isValidTenant = await apiClient.validateCurrentTenant();

            if (!isValidTenant) {
              logger.error('[App] Tenant not found or inactive:', tenantContext.subdomain);
              setTenantNotFound(true);
              setIsCheckingTenant(false);
              return;
            }

            logger.debug('[App] Tenant validation passed');
            setIsCheckingTenant(false);
          } catch (error) {
            logger.warn('[App] Could not verify tenant:', error);
            setIsCheckingTenant(false);
          }
        }
      } catch (err) {
        logger.error('[App] Error checking tenant:', err);
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

  // handleLogin: prefer the fresh session payload from login; otherwise fall back to stored session
  const handleLogin = (email: string, role: UserRole, session?: SessionLoginPayload) => {
    const sessionCandidate = session?.user
      ? session.user
      : (() => {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');
        if (!token || !userJson) return null;

        try {
          return JSON.parse(userJson);
        } catch {
          return null;
        }
      })();

    if (sessionCandidate) {
      try {
        const parsed = sessionCandidate;

        // Extract role from backend response
        // The backend may return multiple roles; resolve with explicit priority.
        let finalRole = role;
        if (parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0) {
          finalRole = resolveUserRole(parsed, role);
          logger.debug(`[App] Backend returned roles: ${parsed.roles.join(', ')}; resolved role: ${finalRole}`);
        } else if (parsed?.isStaff === true || parsed?.isStaffAccount === true) {
          finalRole = 'faculty';
        } else if (parsed?.isStudent === true) {
          finalRole = 'student';
        }

        const sessionUser = buildUserFromSession(parsed, finalRole);
        persistFrontendRole(finalRole);
        setUser(sessionUser);
        applyTenantDocumentBranding(tenantProfile);

        // Route based on role and tenant context
        const tenantContext = TenantDetectionService.detectTenant();
        if (tenantContext.isSuperAdmin) {
          // SuperAdmin: show only tenant management page
          logger.debug('[App] Routing to SuperAdminPanel (SuperAdmin context)');
          navigateToPage(resolvePageFromQuery(new URLSearchParams(location.search).get('page'), 'superadmin'));
        } else {
          // Tenant users: route based on role
          if (finalRole === 'admin') {
            logger.debug('[App] Routing to SuperAdminPanel (Admin role at tenant)');
            navigateToPage(resolvePageFromQuery(new URLSearchParams(location.search).get('page'), 'admin')); // Admin gets admin panel (RBAC Management)
          } else {
            const nextPage = resolvePageFromQuery(new URLSearchParams(location.search).get('page'), finalRole);
            logger.debug(`[App] Routing to ${nextPage} (${finalRole} role at tenant)`);
            navigateToPage(nextPage);
          }
        }
        return;
      } catch (err) {
        logger.warn('Failed to parse login response:', err);
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
        facultyName: 'System Administration'
      };
      persistFrontendRole('superadmin');
      setUser(superAdminUser);
      applyTenantDocumentBranding(tenantProfile);
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
        facultyName: 'Alexandria National University'
      };
      persistFrontendRole('admin');
      setUser(adminUser);
      applyTenantDocumentBranding(tenantProfile);
      navigateToPage(resolvePageFromQuery(new URLSearchParams(location.search).get('page'), 'admin'));
      return;
    }

    // Other roles (student, faculty, alumni)
    const mockUser: User = {
      id: '1',
      name: role === 'student' ? 'John Doe' : role === 'faculty' ? 'Dr. Sarah Wilson' : 'Alumni Jane',
      email,
      role,
      facultyName: 'Computer Science',
      year: role === 'student' ? 2024 : undefined
    };
    persistFrontendRole(role);
    setUser(mockUser);
    applyTenantDocumentBranding(tenantProfile);
    navigateToPage(resolvePageFromQuery(new URLSearchParams(location.search).get('page'), role));
  };

  const handleLogout = () => {
    setUser(null);
    clearStoredSession();
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // Routes that don't require authentication
  if (location.pathname.startsWith('/verify-root-account')) {
    return (
      <>
        <Suspense fallback={<RouteLoadingFallback label="Loading verification" />}>
          <VerifyRootAccountPage />
        </Suspense>
        <Toaster />
      </>
    );
  }

  if (location.pathname.startsWith('/verify-staff-account')) {
    return (
      <>
        <Suspense fallback={<RouteLoadingFallback label="Loading verification" />}>
          <VerifyStaffAccountPage />
        </Suspense>
        <Toaster />
      </>
    );
  }

  const tenantCtx = TenantDetectionService.detectTenant();
  if (tenantCtx.isBranding) {
    return (
      <>
        <Suspense fallback={<RouteLoadingFallback label="Loading UniAct" />}>
          <UniActBrandingPage />
        </Suspense>
        <Toaster />
      </>
    );
  }

  // Show bootstrapping animation while checking tenant (forced minimum duration)
  if (shouldShowBootstrap || isCheckingTenant) {
    return (
      <BootstrapAnimation
        message="Initializing tenant infrastructure..."
        phaseDuration={1200}
        onComplete={() => {
          // Animation sequence complete, but still showing until minimum duration reached
          logger.debug('[App] Bootstrap animation sequence complete');
        }}
      />
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
  if (!effectiveUser) {
    if (tenantCtx.isSuperAdmin) {
      return (
        <>
          <Suspense fallback={<RouteLoadingFallback label="Loading super admin" />}>
            <SuperAdminLoginPage onLogin={handleLogin} />
          </Suspense>
          <Toaster />
        </>
      );
    }

    return (
      <>
        <Suspense fallback={<RouteLoadingFallback label="Loading portal" />}>
          <HomePage onLogin={handleLogin} />
        </Suspense>
        <Toaster />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'superadmin':
        return <SuperAdminPanel user={effectiveUser} onLogout={handleLogout} tenantProfile={tenantProfile} />;
      case 'dashboard':
        return <Dashboard user={effectiveUser} />;
      case 'academic-registration':
        return <AcademicRegistrationPage user={effectiveUser} />;
      case 'timetable':
        return <TimetablePage user={effectiveUser} />;
      case 'attendance':
        return <AttendancePage user={effectiveUser} />;
      case 'grades':
        return <AdminGradesPage user={effectiveUser} selectedUniversity={null} setSelectedUniversity={() => undefined} />;
      case 'teams':
        return <TeamsPage user={effectiveUser} />;
      case 'groups':
        return <GroupsPage user={effectiveUser} />;
      case 'ai-assistant':
        return <AIAssistantPage user={effectiveUser} />;
      case 'alumni-hub':
        return <AlumniHubPage user={effectiveUser} />;
      case 'career-board':
        return <CareerBoardPage user={effectiveUser} />;
      case 'profile':
        return <ProfilePage user={effectiveUser} />;
      default:
        return <Dashboard user={effectiveUser} />;
    }
  };

  // Super admin gets their own layout
  if (effectiveUser?.role === 'superadmin') {
    return (
      <>
        <Suspense fallback={<RouteLoadingFallback label="Loading admin workspace" />}>
          {renderPage()}
        </Suspense>
        <Toaster />
      </>
    );
  }

  // Admin also uses super admin panel (unified interface)
  if (effectiveUser?.role === 'admin') {
    return (
      <>
        <Suspense fallback={<RouteLoadingFallback label="Loading admin workspace" />}>
          {renderPage()}
        </Suspense>
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <Navigation
          user={effectiveUser}
          currentPage={currentPage}
          onNavigate={navigateToPage}
          onLogout={handleLogout}
          tenantProfile={tenantProfile}
        />

      {/* Main Content */}
      <div className="lg:ml-20 min-h-screen transition-all duration-300">
        <Header
          user={effectiveUser}
          notifications={notifications}
          onNotificationRead={markNotificationAsRead}
        />
        <main className="pt-28 lg:pt-32 px-4 md:px-6 lg:px-8 pb-8">
          <Suspense fallback={<RouteLoadingFallback label="Loading page" />}>
            {renderPage()}
          </Suspense>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
