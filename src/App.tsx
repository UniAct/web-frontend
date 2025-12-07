import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import { AcademicRegistrationPage } from './pages/AcademicRegistrationPage';
import { TimetablePage } from './pages/TimetablePage';
import { Navigation } from './components/layout/Navigation';
import { Header } from './components/layout/Header';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import { Toaster } from './components/ui/sonner';
import { TenantDetectionService } from './services/TenantDetectionService';
import { apiClient } from './api/client';

export type UserRole = 'student' | 'faculty' | 'admin' | 'alumni' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  year?: number;
}

export default function App() {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [tenantNotFound, setTenantNotFound] = useState(false);
  const [tenantSubdomain, setTenantSubdomain] = useState<string>('');
  const [isCheckingTenant, setIsCheckingTenant] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New Assignment Posted', message: 'Data Structures Assignment 3 is now available', time: '2 hours ago', read: false },
    { id: '2', title: 'Team Meeting Reminder', message: 'Project team meeting scheduled for tomorrow at 2 PM', time: '1 day ago', read: false },
    { id: '3', title: 'Career Fair Registration', message: 'Register for the upcoming career fair by March 15th', time: '2 days ago', read: true }
  ]);

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
          
          // Make a request to check if tenant exists
          // The backend will return error if tenant not found
          try {
            const response = await fetch(`/api/tenant`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            });

            const data = await response.json();
            console.log('[App] Tenant check response:', data);

            // Check if we got a tenant error response
            if (data?.status === 'error') {
              // Check if it's a tenant not found error
              if (data?.message?.includes('not found') || data?.error?.includes('not found')) {
                console.error('[App] Tenant not found:', data.message);
                setTenantNotFound(true);
                setIsCheckingTenant(false);
                return;
              }
            }

            // If tenant exists or we got success response, continue normally
            console.log('[App] Tenant validation passed');
            setIsCheckingTenant(false);
          } catch (error) {
            // Network errors - log but continue (tenant might exist but API unreachable)
            console.warn('[App] Could not verify tenant (network error):', error);
            setIsCheckingTenant(false);
          }
        }
      } catch (err) {
        console.error('[App] Error checking tenant:', err);
        setIsCheckingTenant(false);
      }
    };

    checkTenant();
  }, []);

  // Try to restore session from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      if (token && userJson) {
        const parsed = JSON.parse(userJson);
        
        // Determine role from parsed data
        let restoredRole: UserRole = 'student'; // default
        if (parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0) {
          const backendRole = parsed.roles[0].toLowerCase();
          // Map backend role to frontend role
          if (backendRole.includes('superadmin')) restoredRole = 'superadmin';
          else if (backendRole.includes('admin') || backendRole.includes('root')) restoredRole = 'admin';
          else if (backendRole.includes('staff') || backendRole.includes('faculty')) restoredRole = 'faculty';
          else if (backendRole.includes('student')) restoredRole = 'student';
          else if (backendRole.includes('alumni')) restoredRole = 'alumni';
        } else if (parsed.role) {
          restoredRole = parsed.role as UserRole;
        }
        
        const restoredUser: User = {
          id: parsed.id ? String(parsed.id) : parsed.username || parsed.email || 'unknown',
          name: parsed.firstName ? `${parsed.firstName} ${parsed.lastName}` : parsed.username || parsed.email || 'Unknown User',
          email: parsed.email || parsed.username || 'unknown@example.com',
          role: restoredRole,
          department: parsed.department || parsed.university || undefined,
        };
        setUser(restoredUser);
        
        // Route based on role
        if (restoredRole === 'superadmin' || restoredRole === 'admin') {
          setCurrentPage('superadmin');
        } else {
          setCurrentPage('dashboard');
        }
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
        // The backend returns roles array, we take the first role
        let finalRole = role;
        if (parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0) {
          const backendRole = parsed.roles[0].toLowerCase();
          console.log(`[App] Backend returned role: ${backendRole}`);
          
          // Map backend role names to frontend role types
          if (backendRole.includes('superadmin')) finalRole = 'superadmin';
          else if (backendRole.includes('admin') || backendRole.includes('root')) finalRole = 'admin';
          else if (backendRole.includes('staff') || backendRole.includes('faculty')) finalRole = 'faculty';
          else if (backendRole.includes('student')) finalRole = 'student';
          else if (backendRole.includes('alumni')) finalRole = 'alumni';
          else finalRole = 'student'; // Default to student if role not recognized
        }

        const sessionUser: User = {
          id: parsed.id ? String(parsed.id) : parsed.username || parsed.email || 'unknown',
          name: parsed.firstName ? `${parsed.firstName} ${parsed.lastName}` : parsed.username || parsed.email || 'Unknown User',
          email: parsed.email || parsed.username || 'unknown@example.com',
          role: finalRole,
          department: parsed.department || parsed.university || undefined,
        };
        setUser(sessionUser);
        
        // Route based on role and tenant context
        const tenantContext = TenantDetectionService.detectTenant();
        if (tenantContext.isSuperAdmin) {
          // SuperAdmin: show only tenant management page
          console.log('[App] Routing to SuperAdminPanel (SuperAdmin context)');
          setCurrentPage('superadmin');
        } else {
          // Tenant users: route based on role
          if (finalRole === 'admin') {
            console.log('[App] Routing to SuperAdminPanel (Admin role at tenant)');
            setCurrentPage('superadmin'); // Admin gets admin panel (RBAC Management)
          } else {
            console.log(`[App] Routing to Dashboard (${finalRole} role at tenant)`);
            setCurrentPage('dashboard'); // Students, staff, alumni see dashboard
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
      setCurrentPage('superadmin');
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
      setCurrentPage('superadmin');
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
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
    // clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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

  // Show loading state while checking tenant
  if (isCheckingTenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Loading tenant...</p>
        </div>
      </div>
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

  // Show tenant not found page if tenant doesn't exist
  if (tenantNotFound) {
    return (
      <TenantNotFoundPage
        subdomain={tenantSubdomain}
        onGoHome={() => {
          // Navigate to localhost (superadmin)
          window.location.href = 'http://localhost:5173';
        }}
      />
    );
  }

  // Show homepage when not logged in
  if (!user) {
    return <HomePage onLogin={handleLogin} />;
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
        onNavigate={setCurrentPage}
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
