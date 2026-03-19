import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
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
import { TenantDetectionService } from '../services/TenantDetectionService';

interface SuperAdminPanelProps {
  user: AppUser;
  onLogout: () => void;
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

export function SuperAdminPanel({ user, onLogout }: SuperAdminPanelProps) {
  const isSuperAdmin = user.role === 'superadmin';
  const isAdmin = user.role === 'admin';

  // Set initial page based on role
  const [currentPage, setCurrentPageState] = useState<AdminPage>(
    isSuperAdmin ? 'universities' : 'statistics'
  );

  // Wrapper to ensure SuperAdmins stay on universities page
  const setCurrentPage = (page: AdminPage) => {
    if (isSuperAdmin) {
      // SuperAdmins can only view universities page
      setCurrentPageState('universities');
    } else {
      setCurrentPageState(page);
    }
  };

  // Set initial university based on role
  // Admin users are locked to Alexandria National University
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(
    isAdmin ? '1' : null
  );
  const [universities, setUniversities] = useState<Array<{ id: string; name: string }>>([]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    const syncUniversities = async () => {
      try {
        const list = await UniversityService.getAll();
        setUniversities(list.map((item) => ({ id: String(item.id), name: item.name })));
      } catch (error) {
        console.warn('Failed to load universities for admin shell:', error);
      }
    };

    void syncUniversities();
  }, []);

  useEffect(() => {
    const syncAdminTenantSelection = async () => {
      if (!isAdmin) return;

      try {
        const tenantContext = TenantDetectionService.detectTenant();
        if (tenantContext.isSuperAdmin || !tenantContext.subdomain) return;

        const profile = await UniversityService.getPublicTenantProfile(tenantContext.subdomain);
        setSelectedUniversity(String(profile.id));
        apiClient.setTenantOverrideName(profile.name);
      } catch (error) {
        console.warn('Failed to resolve current admin tenant:', error);
      }
    };

    void syncAdminTenantSelection();
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedUniversity) {
      if (isSuperAdmin) {
        apiClient.clearTenantOverrideName();
      }
      return;
    }

    const selected = universities.find((item) => item.id === selectedUniversity);
    if (selected) {
      apiClient.setTenantOverrideName(selected.name);
    }
  }, [isSuperAdmin, selectedUniversity, universities]);

  // Education Year Settings
  const [educationYear, setEducationYear] = useState('2024-2025');
  const [semester, setSemester] = useState('2');
  const [educationDialogOpen, setEducationDialogOpen] = useState(false);
  const [tempEducationYear, setTempEducationYear] = useState(educationYear);
  const [tempSemester, setTempSemester] = useState(semester);

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

  const educationYears = [
    '2022-2023',
    '2023-2024',
    '2024-2025',
    '2025-2026'
  ];

  const semesters = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3 (Summer)' }
  ];

  const handleSaveEducationSettings = () => {
    setEducationYear(tempEducationYear);
    setSemester(tempSemester);
    setEducationDialogOpen(false);
  };

  const handleCancelEducationSettings = () => {
    setTempEducationYear(educationYear);
    setTempSemester(semester);
    setEducationDialogOpen(false);
  };

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
      selectedUniversity,
      setSelectedUniversity: handleUniversityChange
    };

    // Check if university is required for this page (all pages except universities)
    const requiresUniversity = currentPage !== 'universities';

    if (requiresUniversity && !selectedUniversity) {
      return (
        <div className="flex items-center justify-center min-h-[500px]">
          <Card className="max-w-md">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl text-slate-900 mb-2">No University Selected</h3>
              <p className="text-slate-600 mb-6">
                Please select a university to manage its data and settings.
              </p>
              <Button
                onClick={() => setCurrentPage('universities')}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Go to Universities
              </Button>
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
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen">
        {/* Sidebar Navigation */}
        <div
          className={`bg-white border-r border-slate-200 flex flex-col flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'
            }`}
        >
          {/* Logo & Toggle */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">UniAct</h2>
                  <p className="text-xs text-slate-500">{isSuperAdmin ? 'Super Admin' : 'Administrator'}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 ${sidebarCollapsed ? 'mx-auto' : ''}`}
            >
              {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {filteredNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as AdminPage)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200'
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
                    <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">SA</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
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
                onClick={onLogout}
                className="w-full p-2"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {currentNavItem?.label}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {currentNavItem?.description}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Education Year Settings */}
                <Dialog open={educationDialogOpen} onOpenChange={setEducationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 border-slate-200 hover:bg-slate-50"
                    >
                      <CalendarDays className="w-4 h-4" />
                      <div className="text-left">
                        <div className="text-xs text-slate-500">Academic Period</div>
                        <div className="text-sm font-medium">{educationYear} | Semester {semester}</div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Academic Period</DialogTitle>
                      <DialogDescription>
                        Choose the education year and semester for the system
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="education-year">Education Year</Label>
                        <Select value={tempEducationYear} onValueChange={setTempEducationYear}>
                          <SelectTrigger id="education-year">
                            <SelectValue placeholder="Select education year" />
                          </SelectTrigger>
                          <SelectContent>
                            {educationYears.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                        <Select value={tempSemester} onValueChange={setTempSemester}>
                          <SelectTrigger id="semester">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            {semesters.map((sem) => (
                              <SelectItem key={sem.value} value={sem.value}>
                                {sem.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={handleCancelEducationSettings}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveEducationSettings}
                      >
                        Apply
                      </Button>
                    </DialogFooter>
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
          <main className="flex-1 overflow-auto p-6 bg-slate-50 min-w-0">
            <div className="max-w-full">
              {renderPage()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
