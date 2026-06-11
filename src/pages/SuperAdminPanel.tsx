import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import {
  Search,
  Bell,
  Settings,
  LogOut,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  UserCog,
  FileSpreadsheet,
  BarChart3,
  Shield,
  Globe,
  Database,
  Clock,
  ChevronRight,
  Plus,
  MapPin,
  ClipboardCheck,
  Award,
  Menu,
  X,
  AlertCircle,
  CalendarDays
} from 'lucide-react';
import type { User as AppUser } from '../App';

// Admin pages
import { UniversitiesListPage } from '../components/admin/UniversitiesListPage';
import { UniversitySettingsPage } from '../components/admin/UniversitySettingsPage';
import { UniversityAdminsPage } from '../components/admin/UniversityAdminsPage';
import { ProgramsFacultiesPage } from '../components/admin/ProgramsFacultiesPage';

import { RoomsPage } from '../components/admin/RoomsPage';
import { RoomsTimetablingPage } from '../components/admin/RoomsTimetablingPage';
import { StaffManagementPage } from '../components/admin/StaffManagementPage';
import { StudentsPage } from '../components/admin/StudentsPage';
import { EnrollmentPage } from '../components/admin/EnrollmentPage';
import { LevelYearTablePage } from '../components/admin/LevelYearTablePage';
import { AnnouncementsPage } from '../components/admin/AnnouncementsPage';
import { StatisticsPage } from '../components/admin/StatisticsPage';
import { AuditLogsPage } from '../components/admin/AuditLogsPage';
import { AdminAttendancePage } from '../components/admin/AdminAttendancePage';
import { AdminGradesPage } from '../components/admin/AdminGradesPage';
import { apiClient, UniversityService } from '../api';
import { SemesterService } from '../api';
import type { Semester } from '../api';
import type { PublicTenantProfile } from '../api';
import { ACTIVE_SEMESTER_EVENT, writeActiveSemesterId } from '../contexts/SemesterContext';

interface SuperAdminPanelProps {
  user: AppUser;
  onLogout: () => void;
  tenantProfile?: PublicTenantProfile | null;
}

type AdminPage =
  | 'universities'
  | 'statistics'
  | 'settings'
  | 'admins'
  | 'programs'
  | 'rooms'
  | 'timetabling'
  | 'staff'
  | 'students'
  | 'enrollment'
  | 'level-tables'
  | 'attendance'
  | 'grades'
  | 'announcements'
  | 'audit';

const navigationItems = [
  { id: 'universities', label: 'Universities', icon: Building2, description: 'Manage institutions' },
  { id: 'statistics', label: 'Statistics', icon: BarChart3, description: 'Visual insights & analytics' },
  { id: 'admins', label: 'Admins', icon: Shield, description: 'Administrator management' },
  { id: 'staff', label: 'Staff', icon: Users, description: 'Faculty & TAs' },
  { id: 'students', label: 'Students', icon: UserCog, description: 'Student management' },
  { id: 'programs', label: 'Programs', icon: GraduationCap, description: 'Academic programs' },
  { id: 'rooms', label: 'Rooms', icon: MapPin, description: 'Room management' },
  { id: 'timetabling', label: 'Timetabling', icon: Calendar, description: 'Schedule management' },
  { id: 'enrollment', label: 'Enrollment', icon: FileSpreadsheet, description: 'Program enrollment' },
  { id: 'level-tables', label: 'Level Tables', icon: Database, description: 'Room & schedule tables' },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, description: 'Track student attendance' },
  { id: 'grades', label: 'Grades', icon: Award, description: 'Manage student grades' },
  { id: 'announcements', label: 'Announcements', icon: Bell, description: 'Events & attendance' },
  { id: 'audit', label: 'Audit Logs', icon: Clock, description: 'System activity' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'System configuration' }
] as const;

function resolveAdminPageFromQuery(raw: string | null, isSuperAdmin: boolean, isAdmin: boolean): AdminPage {
  if (isSuperAdmin) return 'universities';

  const allowedPages: AdminPage[] = isAdmin
    ? [
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
    ]
    : ['universities'];

  if (!raw) return isAdmin ? 'statistics' : 'universities';
  return allowedPages.includes(raw as AdminPage) ? (raw as AdminPage) : (isAdmin ? 'statistics' : 'universities');
}

export function SuperAdminPanel({ user, onLogout, tenantProfile: tenantProfileProp }: SuperAdminPanelProps) {
  const isSuperAdmin = user.role === 'superadmin';
  const isAdmin = user.role === 'admin';
  const tenantContext = useMemo(() => apiClient.getTenantContext(), []);
  const isTenantAdmin = isAdmin && !tenantContext.isSuperAdmin;
  const tenantScopeId = isTenantAdmin ? `tenant:${tenantContext.subdomain ?? 'current'}` : null;
  const tenantDisplayName =
    user.facultyName ||
    tenantContext.displayName ||
    tenantContext.subdomain?.toUpperCase() ||
    'Current University';
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = resolveAdminPageFromQuery(new URLSearchParams(location.search).get('adminPage'), isSuperAdmin, isAdmin);

  const setCurrentPage = (page: AdminPage) => {
    const next = new URLSearchParams(location.search);
    next.set('page', 'superadmin');
    next.set('adminPage', isSuperAdmin ? 'universities' : page);
    setSearchParams(next, { replace: true });
  };

  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(tenantScopeId);
  const [universities, setUniversities] = useState<Array<{ id: string; name: string }>>(
    tenantScopeId ? [{ id: tenantScopeId, name: tenantDisplayName }] : [],
  );
  const [tenantBootstrapStatus, setTenantBootstrapStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    isSuperAdmin ? 'ready' : tenantScopeId ? 'ready' : 'idle',
  );
  const tenantBootstrapStartedRef = useRef(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [tenantProfile, setTenantProfile] = useState<PublicTenantProfile | null>(tenantProfileProp ?? null);
  const shellLogoUrl = tenantProfile?.settings?.logo_url?.trim() || '/favicon.png';
  const shellDisplayName =
    tenantProfile?.settings?.tab_name?.trim() ||
    tenantProfile?.name?.trim() ||
    (isSuperAdmin ? 'UniAct' : tenantDisplayName);

  useEffect(() => {
    if (tenantProfileProp) {
      setTenantProfile(tenantProfileProp);
    }
  }, [tenantProfileProp]);

  useEffect(() => {
    if (tenantProfile || isSuperAdmin) return;

    let isMounted = true;
    apiClient.getCurrentPublicTenantProfile()
      .then((profile) => {
        if (isMounted) setTenantProfile(profile);
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [isSuperAdmin, tenantProfile]);

  useEffect(() => {
    if (tenantBootstrapStartedRef.current) return;
    tenantBootstrapStartedRef.current = true;

    let isMounted = true;

    const syncTenantSelection = async () => {
      setTenantBootstrapStatus('loading');

      try {
        if (isSuperAdmin) {
          const list = await UniversityService.getAll();
          if (!isMounted) return;

          setUniversities(list.map((item) => ({ id: String(item.id), name: item.name })));
          setTenantBootstrapStatus('ready');
          return;
        }

        if (!isTenantAdmin) {
          setTenantBootstrapStatus('ready');
          return;
        }

        const profile = await apiClient.getCurrentPublicTenantProfile();
        if (!isMounted) return;

        setUniversities([{ id: tenantScopeId ?? `tenant:${profile.db_schema}`, name: profile.name }]);
        setSelectedUniversity((current) => current ?? tenantScopeId ?? `tenant:${profile.db_schema}`);
        apiClient.setTenantOverrideName(profile.name);
        setTenantBootstrapStatus('ready');
      } catch (error) {
        if (!isMounted) return;
        console.warn('Failed to initialize tenant selection for admin shell:', error);
        if (isTenantAdmin) {
          setUniversities((current) => current.length > 0 ? current : [{ id: tenantScopeId ?? 'tenant:current', name: tenantDisplayName }]);
          setSelectedUniversity((current) => current ?? tenantScopeId ?? 'tenant:current');
          apiClient.syncResolvedTenantFromSession();
          setTenantBootstrapStatus('ready');
        } else {
          setTenantBootstrapStatus('error');
        }
      }
    };

    void syncTenantSelection();

    return () => {
      isMounted = false;
    };
  }, [isSuperAdmin, isTenantAdmin, tenantDisplayName, tenantScopeId]);

  useEffect(() => {
    if (!selectedUniversity) {
      if (isSuperAdmin) apiClient.clearTenantOverrideName();
      return;
    }

    const selected = universities.find((item) => item.id === selectedUniversity);
    if (selected) {
      apiClient.setTenantOverrideName(selected.name);
    }
  }, [isSuperAdmin, selectedUniversity, universities]);

  // Education Year Settings
  const [educationDialogOpen, setEducationDialogOpen] = useState(false);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<number | null>(null);
  const [semesterLoading, setSemesterLoading] = useState(false);
  const [semesterLoadStatus, setSemesterLoadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [semesterSubmitting, setSemesterSubmitting] = useState(false);
  const [semesterError, setSemesterError] = useState<string | null>(null);
  const [semesterForm, setSemesterForm] = useState({
    year: '2025',
    term: '1',
    startDate: '',
    endDate: '',
  });

  // Helper function to get university name from ID
  const getUniversityName = (universityId: string | null): string => {
    if (!universityId) return '';
    const university = universities.find((uni) => uni.id === universityId);
    if (university) return university.name;

    // Keep the badge human-readable even before the universities list is fully loaded.
    const cachedTenantName = localStorage.getItem('tenantId')?.trim();
    if (cachedTenantName) return cachedTenantName;

    const detectedSubdomain = apiClient.getTenantContext().subdomain?.trim();
    if (detectedSubdomain) {
      return detectedSubdomain
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }

    return 'Selected University';
  };

  const semesterTerms = [
    { value: '1', label: '1 - Fall' },
    { value: '2', label: '2 - Spring' },
    { value: '3', label: '3 - Summer' },
  ];

  const selectedUniversityName = useMemo(() => {
    if (!selectedUniversity) return undefined;
    return universities.find((item) => item.id === selectedUniversity)?.name;
  }, [selectedUniversity, universities]);

  const semesterCacheKey = selectedUniversity ? `semesterCache:${selectedUniversity}` : null;

  const readSemesterCache = useCallback((): Semester[] => {
    if (!semesterCacheKey) return [];
    try {
      const raw = localStorage.getItem(semesterCacheKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed as Semester[] : [];
    } catch {
      return [];
    }
  }, [semesterCacheKey]);

  const writeSemesterCache = useCallback((items: Semester[]) => {
    if (!semesterCacheKey) return;
    localStorage.setItem(semesterCacheKey, JSON.stringify(items));
  }, [semesterCacheKey]);

  const resolveSemesterTenant = useCallback((): boolean => {
    if (!selectedUniversity && isSuperAdmin) {
      setSemesterError('Select a university before managing semesters.');
      setSemesterLoadStatus('idle');
      return false;
    }

    if (selectedUniversityName) {
      apiClient.setTenantOverrideName(selectedUniversityName);
      return true;
    }

    if (isTenantAdmin) {
      apiClient.syncResolvedTenantFromSession();
      return true;
    }

    setSemesterLoadStatus('loading');
    return false;
  }, [isSuperAdmin, isTenantAdmin, selectedUniversity, selectedUniversityName]);

  const loadSemesters = useCallback(async (options?: { preserveExisting?: boolean }) => {
    if (!resolveSemesterTenant()) {
      const cached = readSemesterCache();
      if (cached.length > 0) {
        setSemesters(cached);
      }
      return;
    }

    setSemesterLoading(true);
    setSemesterLoadStatus('loading');
    setSemesterError(null);

    try {
      const items = await SemesterService.getAll();
      const sortedSemesters = items.sort((left, right) => (right.year - left.year) || (right.term - left.term));
      setSemesters(sortedSemesters);
      writeSemesterCache(sortedSemesters);
      setSemesterLoadStatus('success');

      setActiveSemesterId((current) => {
        if (current && sortedSemesters.some((item) => item.id === current)) {
          return current;
        }

        if (selectedUniversity) {
          const stored = localStorage.getItem(`activeSemester:${selectedUniversity}`);
          const parsed = stored ? Number(stored) : NaN;
          if (Number.isFinite(parsed) && sortedSemesters.some((item) => item.id === parsed)) {
            return parsed;
          }
        }

        return sortedSemesters[0]?.id ?? null;
      });
    } catch (error) {
      const cached = readSemesterCache();
      if (cached.length > 0) {
        setSemesters(cached);
      } else if (!options?.preserveExisting) {
        setSemesters((current) => current);
      }
      setSemesterLoadStatus('error');
      setSemesterError(error instanceof Error ? error.message : 'Failed to load semesters');
    } finally {
      setSemesterLoading(false);
    }
  }, [readSemesterCache, resolveSemesterTenant, selectedUniversity, writeSemesterCache]);

  useEffect(() => {
    if (!selectedUniversity) {
      if (!isAdmin) {
        setSemesters([]);
      }
      setActiveSemesterId(null);
      setSemesterLoadStatus('idle');
      return;
    }

    const cached = readSemesterCache();
    if (cached.length > 0) {
      setSemesters(cached);
    }

    void loadSemesters({ preserveExisting: true });
  }, [selectedUniversity, selectedUniversityName, isSuperAdmin, isAdmin, loadSemesters, readSemesterCache]);

  useEffect(() => {
    if (!educationDialogOpen || !selectedUniversity) return;
    void loadSemesters({ preserveExisting: true });
  }, [educationDialogOpen, selectedUniversity, loadSemesters]);

  useEffect(() => {
    if (!selectedUniversity) {
      setActiveSemesterId(null);
      return;
    }

    const key = `activeSemester:${selectedUniversity}`;
    const syncActiveSemester = () => {
      const stored = localStorage.getItem(key);
      const parsed = stored ? Number(stored) : NaN;
      if (Number.isFinite(parsed)) {
        setActiveSemesterId(parsed);
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      syncActiveSemester();
    };

    const onActiveSemesterChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ universityId?: string }>;
      if (customEvent.detail?.universityId && customEvent.detail.universityId !== selectedUniversity) return;
      syncActiveSemester();
    };

    syncActiveSemester();
    window.addEventListener('storage', onStorage);
    window.addEventListener(ACTIVE_SEMESTER_EVENT, onActiveSemesterChanged as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(ACTIVE_SEMESTER_EVENT, onActiveSemesterChanged as EventListener);
    };
  }, [selectedUniversity]);

  useEffect(() => {
    if (!selectedUniversity || !activeSemesterId) return;
    writeActiveSemesterId(selectedUniversity, activeSemesterId);
  }, [selectedUniversity, activeSemesterId]);

  const handleCreateSemester = async () => {
    if (!semesterForm.year || !semesterForm.term || !semesterForm.startDate || !semesterForm.endDate) {
      setSemesterError('All semester fields are required.');
      return;
    }

    if (semesterForm.endDate <= semesterForm.startDate) {
      setSemesterError('End date must be after start date.');
      return;
    }

    setSemesterSubmitting(true);
    setSemesterError(null);

    try {
      await SemesterService.create({
        year: Number(semesterForm.year),
        term: Number(semesterForm.term),
        startDate: semesterForm.startDate,
        endDate: semesterForm.endDate,
      });

      await loadSemesters();
      setSemesterForm((current) => ({
        ...current,
        startDate: '',
        endDate: '',
      }));
    } catch (error) {
      setSemesterError(error instanceof Error ? error.message : 'Failed to create semester');
    } finally {
      setSemesterSubmitting(false);
    }
  };

  const handleDeleteSemester = async (semesterId: number) => {
    const confirmed = window.confirm('Delete this semester?');
    if (!confirmed) return;

    setSemesterSubmitting(true);
    setSemesterError(null);

    try {
      await SemesterService.delete(semesterId);

      if (activeSemesterId === semesterId) {
        setActiveSemesterId(null);
      }

      await loadSemesters();
    } catch (error) {
      setSemesterError(error instanceof Error ? error.message : 'Failed to delete semester');
    } finally {
      setSemesterSubmitting(false);
    }
  };

  const activeSemester = semesters.find((item) => item.id === activeSemesterId) ?? semesters[0];

  const handleNavigation = (page: AdminPage) => {
    setCurrentPage(page);
    setMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    setMobileSidebarOpen(false);
    onLogout();
  };

  const currentSemesterLabel = tenantBootstrapStatus === 'loading'
    ? 'Preparing tenant...'
    : semesterLoading
    ? 'Loading semesters...'
    : activeSemester
      ? `${activeSemester.year} | Semester ${activeSemester.term}`
      : semesterLoadStatus === 'success'
        ? 'No semesters yet'
        : 'Preparing semesters...';

  // Filter navigation items based on role
  const filteredNavigationItems = navigationItems.filter(item => {
    // SuperAdmins ONLY see Universities page
    if (isSuperAdmin && item.id !== 'universities') {
      return false;
    }
    // Admins can see all pages except Universities
    if (isAdmin && item.id === 'universities') {
      return false;
    }
    return true;
  });

  // Custom setSelectedUniversity wrapper to prevent admin from changing university
  const handleUniversityChange = (universityId: string | null) => {
    // Admin users cannot change university
    if (isAdmin) {
      return;
    }
    setSelectedUniversity(universityId);
  };

  const renderPage = () => {
    const commonProps = {
      user,
      selectedUniversity,
      setSelectedUniversity: handleUniversityChange
    };

    // Check if university is required for this page (all pages except universities)
    const requiresUniversity = currentPage !== 'universities';

    if (requiresUniversity && !selectedUniversity) {
      const isTenantPreparing = isTenantAdmin && tenantBootstrapStatus !== 'error';

      return (
        <div className="flex items-center justify-center min-h-[500px]">
          <Card className="max-w-md">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl text-slate-900 mb-2">
                {isTenantPreparing ? 'Preparing Tenant Data' : 'No University Selected'}
              </h3>
              <p className="text-slate-600 mb-6">
                {isTenantPreparing
                  ? 'Your university context is being resolved before loading this page.'
                  : 'Please select a university to manage its data and settings.'}
              </p>
              {!isAdmin && (
                <Button
                  onClick={() => setCurrentPage('universities')}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Go to Universities
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    switch (currentPage) {
      case 'universities':
        // Prevent admin from accessing universities page
        if (isAdmin) {
          return (
            <div className="flex items-center justify-center min-h-[500px]">
              <Card className="max-w-md">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl text-slate-900 mb-2">Access Restricted</h3>
                  <p className="text-slate-600 mb-6">
                    You do not have permission to access this page.
                  </p>
                  <Button
                    onClick={() => setCurrentPage('statistics')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Go to Statistics
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        }
        return <UniversitiesListPage {...commonProps} />;
      case 'settings':
        return <UniversitySettingsPage {...commonProps} />;
      case 'admins':
        return <UniversityAdminsPage {...commonProps} />;
      case 'programs':
        return <ProgramsFacultiesPage {...commonProps} />;
      case 'rooms':
        return <RoomsPage {...commonProps} />;
      case 'timetabling':
        return <RoomsTimetablingPage {...commonProps} />;
      case 'staff':
        return <StaffManagementPage {...commonProps} />;
      case 'students':
        return <StudentsPage {...commonProps} />;
      case 'enrollment':
        return <EnrollmentPage {...commonProps} />;
      case 'level-tables':
        return <LevelYearTablePage {...commonProps} />;
      case 'attendance':
        return <AdminAttendancePage {...commonProps} />;
      case 'grades':
        return <AdminGradesPage {...commonProps} />;
      case 'announcements':
        return <AnnouncementsPage {...commonProps} />;
      case 'statistics':
        return <StatisticsPage {...commonProps} />;
      case 'audit':
        return <AuditLogsPage {...commonProps} />;
      default:
        return <UniversitiesListPage {...commonProps} />;
    }
  };

  const currentNavItem = filteredNavigationItems.find(item => item.id === currentPage);

  return (
    <div className="admin-shell min-h-screen bg-slate-50">
      <style>
        {`
          .admin-shell main table {
            display: block;
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
          }

          .admin-shell main table thead,
          .admin-shell main table tbody,
          .admin-shell main table tr {
            width: max-content;
            min-width: 100%;
          }

          .admin-shell main table th,
          .admin-shell main table td {
            vertical-align: top;
          }

          @media (max-width: 640px) {
            .admin-shell main h1,
            .admin-shell main h2,
            .admin-shell main h3,
            .admin-shell main [data-slot="card-title"] {
              overflow-wrap: anywhere;
            }

            .admin-shell main button,
            .admin-shell header button {
              max-width: 100%;
            }
          }
        `}
      </style>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <div
          className={`hidden md:flex h-full flex-col flex-shrink-0 overflow-hidden bg-white border-r border-slate-200 transition-[width] duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-64'
            }`}
        >
          {/* Logo & Toggle */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'sr-only' : ''}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-primary/20 shadow-sm overflow-hidden">
                <img src={shellLogoUrl} alt={shellDisplayName} className="w-full h-full object-contain p-1" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h2 className="font-semibold text-slate-900 truncate max-w-40">{shellDisplayName}</h2>
                  <p className="text-xs text-slate-500">{isSuperAdmin ? 'Super Admin' : 'Administrator'}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 ${sidebarCollapsed ? 'mx-auto' : ''}`}
            >
              {sidebarCollapsed ? (
                <img src={shellLogoUrl} alt={shellDisplayName} className="w-6 h-6 object-contain" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 min-h-0 p-2 space-y-1 overflow-y-auto">
            {filteredNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id as AdminPage)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${isActive
                    ? 'border border-primary/20 bg-primary/10 text-primary shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{item.label}</div>
                      <div className="text-xs opacity-75 truncate">{item.description}</div>
                    </div>
                  )}
                  {!sidebarCollapsed && isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-3 border-t border-slate-200">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary">SA</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 text-slate-600"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full p-2"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="md:hidden shrink-0 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold text-slate-900 break-words">
                    {currentNavItem?.label}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1 break-words">
                    {currentNavItem?.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                {/* Education Year Settings */}
                <Dialog open={educationDialogOpen} onOpenChange={setEducationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 border-slate-200 hover:bg-slate-50 max-w-[92vw]"
                      disabled={isSuperAdmin && !selectedUniversity}
                    >
                      <CalendarDays className="w-4 h-4" />
                      <div className="text-left flex flex-col leading-tight">
                        <div className="text-xs text-slate-500">Semester Management</div>
                        <div className="text-sm font-medium text-slate-900">{currentSemesterLabel}</div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[min(96vw,760px)] h-[min(82vh,760px)] overflow-hidden p-0 flex flex-col">
                    <DialogHeader className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-200 shrink-0">
                      <DialogTitle>Semester Management</DialogTitle>
                      <DialogDescription>
                        Add and review semesters from the tenant database, then choose the active semester.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                      <div className="space-y-5">
                        <Card className="border-slate-200 shadow-sm">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Current Active Semester</CardTitle>
                            <CardDescription>Select one of the saved semesters.</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Select
                              value={activeSemesterId ? String(activeSemesterId) : ''}
                              onValueChange={(value) => setActiveSemesterId(Number(value))}
                              disabled={semesterLoading || semesters.length === 0}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={semesterLoading ? 'Loading semesters...' : 'Select active semester'} />
                              </SelectTrigger>
                              <SelectContent>
                                {semesters.map((item) => (
                                  <SelectItem key={item.id} value={String(item.id)}>
                                    {item.year} | Semester {item.term} ({item.type})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </CardContent>
                        </Card>

                        <div className="grid gap-4 2xl:grid-cols-[0.95fr_1.05fr]">
                          <Card className="border-slate-200 shadow-none">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Add Semester</CardTitle>
                              <CardDescription>
                                Saved through the backend semester create API.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="semester-year">Education Year</Label>
                                  <Input
                                    id="semester-year"
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    value={semesterForm.year}
                                    onChange={(event) => setSemesterForm((current) => ({ ...current, year: event.target.value }))}
                                    placeholder="2026"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="semester-term">Semester</Label>
                                  <Select value={semesterForm.term} onValueChange={(value) => setSemesterForm((current) => ({ ...current, term: value }))}>
                                    <SelectTrigger id="semester-term">
                                      <SelectValue placeholder="Select semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {semesterTerms.map((term) => (
                                        <SelectItem key={term.value} value={term.value}>
                                          {term.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="semester-start">Start Date</Label>
                                  <Input
                                    id="semester-start"
                                    type="date"
                                    value={semesterForm.startDate}
                                    onChange={(event) => setSemesterForm((current) => ({ ...current, startDate: event.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="semester-end">End Date</Label>
                                  <Input
                                    id="semester-end"
                                    type="date"
                                    value={semesterForm.endDate}
                                    onChange={(event) => setSemesterForm((current) => ({ ...current, endDate: event.target.value }))}
                                  />
                                </div>
                              </div>

                              {semesterError && (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                  {semesterError}
                                </div>
                              )}

                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => void loadSemesters()}
                                  disabled={semesterLoading || semesterSubmitting}
                                >
                                  Refresh
                                </Button>
                                <Button
                                  onClick={handleCreateSemester}
                                  disabled={semesterLoading || semesterSubmitting || (isSuperAdmin && !selectedUniversity)}
                                >
                                  {semesterSubmitting ? 'Saving...' : 'Add Semester'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-slate-200 shadow-none">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Current Semesters</CardTitle>
                              <CardDescription>Loaded from the tenant database.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {semesterLoading && semesters.length > 0 && (
                                <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                                  Refreshing semesters...
                                </div>
                              )}
                              {semesterLoading && semesters.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                  Loading semesters...
                                </div>
                              ) : semesterLoadStatus === 'error' && semesters.length === 0 ? (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                  Semester data is not ready yet. Check the selected university, then retry.
                                </div>
                              ) : semesterLoadStatus !== 'success' && semesters.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                  Preparing tenant semester data...
                                </div>
                              ) : semesters.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                  No semesters found yet.
                                </div>
                              ) : (
                                semesters.map((item) => (
                                  <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                      <div>
                                        <div className="font-medium text-slate-900">
                                          {item.year} | Semester {item.term}
                                        </div>
                                        <div className="text-sm text-slate-500">{item.type}</div>
                                        <div className="mt-1 text-xs text-slate-500">
                                          {item.startDate.slice(0, 10)} → {item.endDate.slice(0, 10)}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline">#{item.id}</Badge>
                                        {activeSemesterId === item.id ? (
                                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>
                                        ) : (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setActiveSemesterId(item.id)}
                                            disabled={semesterSubmitting}
                                          >
                                            Use
                                          </Button>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => void handleDeleteSemester(item.id)}
                                          disabled={semesterSubmitting}
                                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* University Selector */}
                {selectedUniversity && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1 px-3 py-1">
                      <Globe className="w-3 h-3" />
                      {getUniversityName(selectedUniversity)}
                    </Badge>
                    {/* Only super admin can clear university selection */}
                    {isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUniversityChange(null)}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-slate-50 p-3 min-w-0 sm:p-6">
            <div className="max-w-full">
              {renderPage()}
            </div>
          </main>
        </div>
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex h-full w-[min(18rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-2xl">
            <div className="flex h-full min-h-0 flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-primary/20 shadow-sm overflow-hidden">
                    <img src={shellLogoUrl} alt={shellDisplayName} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900 truncate max-w-40">{shellDisplayName}</h2>
                    <p className="text-xs text-slate-500">{isSuperAdmin ? 'Super Admin' : 'Administrator'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="shrink-0"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex-1 min-h-0 p-2 space-y-1 overflow-y-auto">
                {filteredNavigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id as AdminPage)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${isActive
                        ? 'border border-primary/20 bg-primary/10 text-primary shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{item.label}</div>
                        <div className="text-xs opacity-75 truncate">{item.description}</div>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary">SA</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 text-slate-600"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
