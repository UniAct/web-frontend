import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  FileUp,
  MessageSquare,
  Settings,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { AnnouncementService, LearningGroupService, UniversityService } from '../api';
import { AttendanceService } from '../api/modules/attendance/attendance.service';
import type {
  Announcement,
  AttendanceDashboardData,
  LearningGroupPost,
  LearningGroupSummary,
  StaffDashboardData,
  StaffDashboardScheduleItem,
  StudentDashboardData,
  StudentDashboardScheduleItem,
  UniversityAnalytics,
} from '../api';
import type { User as AppUser } from '../App';

interface DashboardProps {
  user: AppUser;
}

type DashboardLoadState = {
  dashboard: AttendanceDashboardData | null;
  analytics: UniversityAnalytics | null;
  groups: LearningGroupSummary[];
  deadlines: Array<LearningGroupPost & { groupName: string }>;
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
};

const initialState: DashboardLoadState = {
  dashboard: null,
  analytics: null,
  groups: [],
  deadlines: [],
  announcements: [],
  loading: true,
  error: null,
};

function formatNumber(value: number | undefined | null) {
  return new Intl.NumberFormat().format(value ?? 0);
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || 'there';
}

function formatTime(value: string | undefined | null) {
  if (!value) return 'TBA';
  const match = /(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;

  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDate(value: string | undefined | null) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function daysUntil(value: string | undefined | null) {
  if (!value) return 'No due date';
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return formatDate(value);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);

  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  return `Due in ${diff} days`;
}

function roomLabel(room?: { building?: string | null; classroomNumber?: string | null } | null) {
  if (!room) return 'Room TBA';
  return [room.building, room.classroomNumber].filter(Boolean).join(' / ') || 'Room TBA';
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">
      {message}
    </div>
  );
}

function LoadingCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <Card key={item} className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: 'blue' | 'emerald' | 'purple' | 'orange';
  icon: typeof Users;
}) {
  const tones = {
    blue: 'text-blue-600 bg-blue-100',
    emerald: 'text-emerald-600 bg-emerald-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
  };

  return (
    <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className={`mt-1 text-3xl ${tones[tone].split(' ')[0]}`}>{value}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tones[tone]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function studentSlot(item: StudentDashboardScheduleItem) {
  return item.scheduleSlotContext?.slot ?? null;
}

function StudentScheduleList({ items }: { items: StudentDashboardScheduleItem[] }) {
  if (items.length === 0) {
    return <EmptyState message="No classes are scheduled for today." />;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const slot = studentSlot(item);
        const teacher = slot?.teacher?.user;
        const teacherName = [teacher?.firstName, teacher?.lastName].filter(Boolean).join(' ');
        const palette =
          index % 2 === 0
            ? 'from-blue-50 to-indigo-50 border-blue-100 hover:border-blue-200 text-blue-700 bg-blue-100'
            : 'from-emerald-50 to-teal-50 border-emerald-100 hover:border-emerald-200 text-emerald-700 bg-emerald-100';

        return (
          <div
            key={item.id}
            className={`flex items-center justify-between gap-4 rounded-lg border bg-gradient-to-r p-4 transition-colors ${palette}`}
          >
            <div>
              <p className="text-sm font-medium text-slate-900">
                {slot?.course.code ? `${slot.course.code} - ` : ''}
                {slot?.course.name ?? 'Scheduled class'}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {roomLabel(slot?.classroom)}
                {teacherName ? ` • ${teacherName}` : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {formatTime(slot?.startTime)} - {formatTime(slot?.endTime)}
              </p>
              <Badge className="mt-1 border-transparent text-xs capitalize">{item.status.toLowerCase()}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StaffScheduleList({ items }: { items: StaffDashboardScheduleItem[] }) {
  if (items.length === 0) {
    return <EmptyState message="No teaching sessions are scheduled for today." />;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
        >
          <div>
            <p className="text-sm font-medium text-slate-900">
              {item.course.code} - {item.course.name}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {roomLabel(item.classroom)} • {item.slotContext.length} group
              {item.slotContext.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {item.dayOfWeek}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Dashboard({ user }: DashboardProps) {
  const [state, setState] = useState<DashboardLoadState>(initialState);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const shouldLoadTeachingDashboard = user.role === 'student' || user.role === 'faculty';
        const [dashboard, analytics, groups, announcements] = await Promise.all([
          shouldLoadTeachingDashboard ? AttendanceService.getDashboard() : Promise.resolve(null),
          user.role === 'admin' ? UniversityService.getAnalytics() : Promise.resolve(null),
          shouldLoadTeachingDashboard ? LearningGroupService.getMyGroups(user.currentSemesterId) : Promise.resolve([]),
          AnnouncementService.getAll().catch(() => []),
        ]);

        const deadlineGroups = groups.slice(0, 6);
        const deadlinePages = await Promise.all(
          deadlineGroups.map(async (group) => {
            try {
              const page = await LearningGroupService.getPosts(group.groupId, 'ASSIGNMENT');
              return page.items
                .filter((post) => post.dueDate)
                .map((post) => ({ ...post, groupName: group.groupName }));
            } catch {
              return [];
            }
          }),
        );

        if (!isMounted) return;

        setState({
          dashboard,
          analytics,
          groups,
          deadlines: deadlinePages
            .flat()
            .sort((left, right) => new Date(left.dueDate ?? '').getTime() - new Date(right.dueDate ?? '').getTime())
            .slice(0, 5),
          announcements,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (!isMounted) return;
        setState({
          ...initialState,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load dashboard data',
        });
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [user.currentSemesterId, user.role]);

  const studentDashboard = state.dashboard?.role === 'student' ? state.dashboard : null;
  const staffDashboard = state.dashboard?.role === 'staff' ? state.dashboard : null;

  const publishedAnnouncements = useMemo(
    () =>
      state.announcements
        .filter((item) => item.status === 'PUBLISHED')
        .filter((item) => item.audience === 'ALL' || item.audience === 'STUDENTS' || item.audience === 'FACULTY')
        .slice(0, 4),
    [state.announcements],
  );

  const renderStudentDashboard = (dashboard: StudentDashboardData | null) => (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="space-y-2">
        <h1 className="text-slate-900">Welcome back, {getFirstName(user.name)}!</h1>
        <p className="text-slate-600">Here's what's happening with your studies today.</p>
      </div>

      {state.error ? (
        <EmptyState message={state.error} />
      ) : state.loading ? (
        <LoadingCards />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Registered Courses"
            value={formatNumber(dashboard?.stats.registeredCourses)}
            tone="blue"
            icon={BookOpen}
          />
          <StatCard
            label="Registered Hours"
            value={`${formatNumber(dashboard?.stats.registeredCreditHours)} hrs`}
            tone="emerald"
            icon={UserCheck}
          />
          <StatCard
            label="Today's Classes"
            value={formatNumber(dashboard?.todaySchedule.length)}
            tone="purple"
            icon={Calendar}
          />
          <StatCard
            label="Learning Groups"
            value={formatNumber(state.groups.length)}
            tone="orange"
            icon={Users}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Calendar className="h-5 w-5 text-blue-600" />
              Today's Schedule
            </CardTitle>
            <CardDescription>{dashboard?.dayOfWeek ?? 'Current day'} classes from your enrollment</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {state.loading ? <EmptyState message="Loading today's schedule..." /> : <StudentScheduleList items={dashboard?.todaySchedule ?? []} />}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Credit Hours Progress
            </CardTitle>
            <CardDescription>{dashboard?.creditProgress.program?.name ?? 'Track your academic progress'}</CardDescription>
          </CardHeader>
          <CardContent>
            {state.loading ? (
              <EmptyState message="Loading credit progress..." />
            ) : dashboard ? (
              <div className="space-y-5">
                {dashboard.creditProgress.segments.map((segment) => (
                  <div key={segment.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{segment.label} Hours</span>
                      <span className="font-medium text-gray-900">
                        {segment.completedCreditHours} / {segment.requiredCreditHours} hrs
                      </span>
                    </div>
                    <Progress value={segment.percent} className="h-2" />
                  </div>
                ))}
                <div className="space-y-2 border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">Total Hours</span>
                    <span className="font-medium text-blue-600">
                      {dashboard.creditProgress.completedCreditHours} / {dashboard.creditProgress.totalRequiredCreditHours} hrs
                    </span>
                  </div>
                  <Progress value={dashboard.creditProgress.percent} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {dashboard.creditProgress.remainingCreditHours} hours remaining
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState message="Credit progress is not available for this account." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Learning Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.loading ? (
              <EmptyState message="Loading groups..." />
            ) : state.groups.length > 0 ? (
              <div className="space-y-4">
                {state.groups.slice(0, 4).map((group) => (
                  <div key={group.groupId} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{group.groupName}</p>
                      <p className="text-xs text-slate-500">
                        {group.course.code} • {group.course.name}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {group.myRole}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="You are not in any learning groups for this semester yet." />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.loading ? (
              <EmptyState message="Loading assignment deadlines..." />
            ) : state.deadlines.length > 0 ? (
              <div className="space-y-3">
                {state.deadlines.map((post) => (
                  <div key={post.postId} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-900">{post.content || 'Assignment'}</p>
                      <p className="text-xs text-slate-500">
                        {post.groupName} • {formatDate(post.dueDate)}
                      </p>
                    </div>
                    <Badge variant={daysUntil(post.dueDate) === 'Overdue' ? 'destructive' : 'secondary'} className="text-xs">
                      {daysUntil(post.dueDate)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No assignment deadlines are posted in your learning groups." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFacultyDashboard = (dashboard: StaffDashboardData | null) => (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-2xl text-slate-900">Good morning, {getFirstName(user.name)}!</h1>
        <p className="text-slate-600">Here's an overview of your classes and students today.</p>
      </div>

      {state.error ? (
        <EmptyState message={state.error} />
      ) : state.loading ? (
        <LoadingCards />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Enrolled Students"
            value={formatNumber(dashboard?.stats.enrolledStudents)}
            tone="blue"
            icon={Users}
          />
          <StatCard
            label="Assigned Courses"
            value={formatNumber(dashboard?.stats.distinctCourseCount)}
            tone="emerald"
            icon={BookOpen}
          />
          <StatCard
            label="Teaching Sessions"
            value={formatNumber(dashboard?.stats.totalSessions)}
            tone="purple"
            icon={Calendar}
          />
          <StatCard
            label="Learning Groups"
            value={formatNumber(state.groups.length)}
            tone="orange"
            icon={MessageSquare}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Today's Classes
            </CardTitle>
            <CardDescription>{dashboard?.dayOfWeek ?? 'Current day'} teaching schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {state.loading ? <EmptyState message="Loading today's classes..." /> : <StaffScheduleList items={dashboard?.todaySchedule ?? []} />}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <UserCheck className="mr-2 h-4 w-4" />
                Take Attendance
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileUp className="mr-2 h-4 w-4" />
                Upload Materials
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Announcement
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teaching Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.groups.length > 0 ? (
              <div className="space-y-3">
                {state.groups.slice(0, 5).map((group) => (
                  <div key={group.groupId} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{group.groupName}</p>
                      <p className="text-xs text-slate-500">
                        {group.course.code} • {group.course.name}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">{group.myRole}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No learning groups are assigned to this account yet." />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Published Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {publishedAnnouncements.length > 0 ? (
              <div className="space-y-3">
                {publishedAnnouncements.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No published updates are available right now." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdminDashboard = () => {
    const analytics = state.analytics;
    const summary = analytics?.summary;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-2xl text-slate-900">System Overview</h1>
          <p className="text-slate-600">Monitor and manage the university's digital ecosystem.</p>
        </div>

        {state.loading ? (
          <LoadingCards />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Users" value={formatNumber((summary?.students ?? 0) + (summary?.staff ?? 0) + (summary?.admins ?? 0))} tone="blue" icon={UserCog} />
            <StatCard label="Active Registrations" value={formatNumber(summary?.activeRegistrations)} tone="emerald" icon={TrendingUp} />
            <StatCard label="Attendance Rate" value={`${analytics?.attendance.last30Days.attendanceRate ?? 0}%`} tone="purple" icon={CheckCircle} />
            <StatCard label="Today's Absences" value={formatNumber(analytics?.todayAbsences.reduce((total, item) => total + item.absences, 0))} tone="orange" icon={AlertTriangle} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Upcoming Items</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.upcomingItems.length ? (
                <div className="space-y-3">
                  {analytics.upcomingItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{formatDate(item.date)}{item.location ? ` • ${item.location}` : ''}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No upcoming announcements or events are published." />
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>System Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <UserCog className="mr-2 h-4 w-4" />
                  User Management
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileUp className="mr-2 h-4 w-4" />
                  Bulk Data Import
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics Dashboard
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderAlumniDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl text-slate-900">Welcome back to your alma mater!</h1>
        <p className="text-slate-600">Alumni dashboard data is not connected to backend services yet.</p>
      </div>
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <EmptyState message="No alumni metrics are available from the backend right now." />
        </CardContent>
      </Card>
    </div>
  );

  switch (user.role) {
    case 'student':
      return renderStudentDashboard(studentDashboard);
    case 'faculty':
      return renderFacultyDashboard(staffDashboard);
    case 'admin':
      return renderAdminDashboard();
    case 'alumni':
      return renderAlumniDashboard();
    default:
      return renderStudentDashboard(studentDashboard);
  }
}
