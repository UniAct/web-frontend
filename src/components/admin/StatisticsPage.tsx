import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Layers3,
  Network,
  RefreshCcw,
  School,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  UniversityService,
  type UniversityAnalytics,
  type UniversityAnalyticsFacultyBreakdown,
  type UniversityAnalyticsItem,
  type UniversityAnalyticsProgramBreakdown,
} from '../../api';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const CHART_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be123c', '#4f46e5'];

interface StatisticsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

type EventTab = 'ANNOUNCEMENT' | 'EVENT';

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatDecimal(value: number, digits = 2) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: value > 0 ? digits : 0,
  }).format(value);
}

function toDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function sameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function itemTypeLabel(type: EventTab) {
  return type === 'EVENT' ? 'Events' : 'Announcements';
}

export function StatisticsPage({ selectedUniversity }: StatisticsPageProps) {
  const [analytics, setAnalytics] = useState<UniversityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPrograms, setExpandedPrograms] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeEventTab, setActiveEventTab] = useState<EventTab>('ANNOUNCEMENT');

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await UniversityService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, [selectedUniversity]);

  const summary = analytics?.summary;
  const attendance = analytics?.attendance.last30Days;
  const totalAbsences = analytics?.todayAbsences.reduce((total, program) => total + program.absences, 0) ?? 0;
  const avgStudentsPerProgram = summary?.programs ? Math.round((summary.students / summary.programs) * 10) / 10 : 0;
  const avgCapacityPerRoom = analytics?.resources.classrooms
    ? Math.round(analytics.resources.totalCapacity / analytics.resources.classrooms)
    : 0;

  const headlineStats = [
    { label: 'Students', value: summary?.students ?? 0, icon: Users, tone: 'text-blue-700 bg-blue-50 border-blue-100' },
    {
      label: 'Faculties',
      value: summary?.faculties ?? 0,
      icon: School,
      tone: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Programs',
      value: summary?.programs ?? 0,
      icon: Layers3,
      tone: 'text-violet-700 bg-violet-50 border-violet-100',
    },
    {
      label: 'Courses',
      value: summary?.courses ?? 0,
      icon: BookOpen,
      tone: 'text-amber-700 bg-amber-50 border-amber-100',
    },
  ];

  const facultyPieData = useMemo(
    () =>
      analytics?.facultyBreakdown.map((faculty, index) => ({
        name: faculty.name,
        value: faculty.students,
        secondary: `${faculty.programs} programs`,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })) ?? [],
    [analytics],
  );

  const programPieData = useMemo(
    () =>
      analytics?.programBreakdown.slice(0, 8).map((program, index) => ({
        name: program.name,
        value: program.students,
        secondary: program.facultyName,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })) ?? [],
    [analytics],
  );

  const topPrograms = useMemo(() => analytics?.programBreakdown.slice(0, 7) ?? [], [analytics]);

  const attendanceData = useMemo(
    () =>
      attendance
        ? [
            { name: 'Present', value: attendance.present, color: '#059669' },
            { name: 'Late', value: attendance.late, color: '#d97706' },
            { name: 'Absent', value: attendance.absent, color: '#dc2626' },
            { name: 'Excused', value: attendance.excused, color: '#2563eb' },
            { name: 'Medical', value: attendance.medical, color: '#7c3aed' },
          ]
        : [],
    [attendance],
  );

  const visibleItems = useMemo(
    () => analytics?.upcomingItems.filter((item) => item.type === activeEventTab) ?? [],
    [activeEventTab, analytics],
  );

  const selectedItems = useMemo(() => {
    if (!selectedDate) return [];
    return visibleItems.filter((item) => sameCalendarDay(toDate(item.date), selectedDate));
  }, [selectedDate, visibleItems]);

  const hasItemOnDate = (date: Date) => visibleItems.some((item) => sameCalendarDay(toDate(item.date), date));

  const toggleProgram = (programId: number) => {
    setExpandedPrograms((prev) =>
      prev.includes(programId) ? prev.filter((id) => id !== programId) : [...prev, programId],
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-slate-50 text-slate-700">
                Live tenant analytics
              </Badge>
              {analytics?.generatedAt && (
                <span className="text-xs text-slate-500">
                  Updated {new Date(analytics.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">
              {selectedUniversity ?? 'University'} Statistics
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              A real-time snapshot of academic structure, attendance activity, learning groups, facilities, and
              communications for this tenant.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={loading} className="w-fit gap-2">
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {headlineStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    {loading ? (
                      <Skeleton className="mt-3 h-8 w-24" />
                    ) : (
                      <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
                        {formatNumber(stat.value)}
                      </p>
                    )}
                  </div>
                  <div className={`rounded-lg border p-3 ${stat.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InsightTile
          icon={GraduationCap}
          label="Staff & Admins"
          value={`${formatNumber(summary?.staff ?? 0)} / ${formatNumber(summary?.admins ?? 0)}`}
          helper="staff accounts / admin roles"
          loading={loading}
        />
        <InsightTile
          icon={Network}
          label="Learning Groups"
          value={formatNumber(summary?.learningGroups ?? 0)}
          helper={`${formatNumber(summary?.activeRegistrations ?? 0)} active enrollments`}
          loading={loading}
        />
        <InsightTile
          icon={Building2}
          label="Room Capacity"
          value={formatNumber(analytics?.resources.totalCapacity ?? 0)}
          helper={`${formatNumber(avgCapacityPerRoom)} avg seats / room`}
          loading={loading}
        />
        <InsightTile
          icon={TrendingUp}
          label="Attendance Rate"
          value={`${attendance?.attendanceRate ?? 0}%`}
          helper={`${formatNumber(attendance?.total ?? 0)} records in 30 days`}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DistributionCard
          title="Students By Faculty"
          description="Pie distribution based on active student records connected to programs."
          data={facultyPieData}
          loading={loading}
          emptyLabel="No faculty student distribution yet"
        />
        <DistributionCard
          title="Students By Program"
          description="Top programs by student count, grouped from the tenant academic structure."
          data={programPieData}
          loading={loading}
          emptyLabel="No program student distribution yet"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-950">Program Scale</CardTitle>
                <CardDescription>Largest programs by enrolled students with course and level depth.</CardDescription>
              </div>
              <Badge variant="secondary" className="w-fit bg-slate-100 text-slate-700">
                {formatDecimal(avgStudentsPerProgram, 1)} students/program
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : topPrograms.length > 0 ? (
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <ResponsiveContainer width="100%" height={310}>
                  <BarChart data={topPrograms} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} height={58} />
                    <YAxis tick={{ fontSize: 11 }} width={38} />
                    <Tooltip formatter={(value: number) => [formatNumber(value), 'Students']} />
                    <Bar dataKey="students" radius={[6, 6, 0, 0]} fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {topPrograms.slice(0, 5).map((program) => (
                    <ProgramCompactRow key={program.id} program={program} maxStudents={topPrograms[0]?.students ?? 1} />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState title="No programs yet" description="Programs will appear here once created." />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-950">Attendance Health</CardTitle>
            <CardDescription>Last 30 days across submitted attendance sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-56 w-full" />
              </div>
            ) : attendance && attendance.total > 0 ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-semibold tracking-normal text-slate-950">
                        {attendance.attendanceRate}%
                      </p>
                      <p className="mt-1 text-sm text-slate-500">present or late</p>
                    </div>
                    <Badge variant="outline">{formatNumber(totalAbsences)} absent today</Badge>
                  </div>
                  <Progress value={attendance.attendanceRate} className="mt-3 h-2 bg-slate-100" />
                </div>

                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={attendanceData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={84}>
                      {attendanceData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatNumber(value), 'Records']} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-2">
                  {attendanceData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="text-sm font-medium text-slate-950">{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState title="No attendance records" description="Attendance insights appear after sessions are recorded." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-950">Today's Absence Drilldown</CardTitle>
              <CardDescription>Program and level detail from recorded absences today.</CardDescription>
            </div>
            <Badge variant="secondary" className="w-fit bg-slate-100 text-slate-700">
              {formatNumber(totalAbsences)} total
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : analytics && analytics.todayAbsences.length > 0 ? (
              <div className="space-y-2">
                {analytics.todayAbsences.map((program) => {
                  const expanded = expandedPrograms.includes(program.id);

                  return (
                    <Collapsible key={program.id} open={expanded} onOpenChange={() => toggleProgram(program.id)}>
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50">
                          <div className="flex min-w-0 items-center gap-3">
                            {expanded ? (
                              <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
                            )}
                            <span className="truncate text-sm font-medium text-slate-900">{program.name}</span>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {formatNumber(program.absences)}
                          </Badge>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-7 mt-2 grid gap-2 sm:grid-cols-2">
                          {program.levels.map((level) => (
                            <div
                              key={level.id}
                              className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
                            >
                              <span className="text-sm text-slate-700">{level.name}</span>
                              <span className="text-sm font-medium text-slate-900">
                                {formatNumber(level.absences)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No absences recorded today" description="This panel updates as attendance is submitted." />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-950">Communications</CardTitle>
                <CardDescription>Published announcements and events by date.</CardDescription>
              </div>
              <Badge variant="outline">
                {formatNumber(analytics?.communications.announcements ?? 0)} /{' '}
                {formatNumber(analytics?.communications.events ?? 0)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeEventTab} onValueChange={(value) => setActiveEventTab(value as EventTab)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ANNOUNCEMENT" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Announcements
                </TabsTrigger>
                <TabsTrigger value="EVENT" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Events
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-5 flex justify-center overflow-x-auto">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-slate-200"
                modifiers={{ hasItem: hasItemOnDate }}
                modifiersClassNames={{ hasItem: 'font-semibold text-blue-700 underline underline-offset-4' }}
              />
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="text-sm font-medium text-slate-900">
                  {selectedDate ? `${itemTypeLabel(activeEventTab)} on ${selectedDate.toLocaleDateString()}` : 'Select a date'}
                </h4>
                <Badge variant="outline">{selectedItems.length}</Badge>
              </div>

              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {loading ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : selectedItems.length > 0 ? (
                  selectedItems.map((item) => <CalendarItem key={`${item.type}-${item.id}`} item={item} />)
                ) : (
                  <EmptyState title="Nothing scheduled" description="Choose an underlined day to view details." compact />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InsightTile({
  icon: Icon,
  label,
  value,
  helper,
  loading,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  helper: string;
  loading: boolean;
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-500">{label}</p>
            {loading ? (
              <Skeleton className="mt-3 h-7 w-24" />
            ) : (
              <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{value}</p>
            )}
            <p className="mt-1 truncate text-xs text-slate-500">{helper}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-700">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DistributionCard({
  title,
  description,
  data,
  loading,
  emptyLabel,
}: {
  title: string;
  description: string;
  data: { name: string; value: number; secondary: string; color: string }[];
  loading: boolean;
  emptyLabel: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-950">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <Skeleton className="h-64 w-full" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : total > 0 ? (
          <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={2}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [formatNumber(value), 'Students']} />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {data.slice(0, 6).map((item) => {
                const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-800">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="shrink-0 text-sm text-slate-500">{percent}%</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span className="truncate">{item.secondary}</span>
                      <span>{formatNumber(item.value)} students</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState title={emptyLabel} description="This chart will populate when student records are linked." />
        )}
      </CardContent>
    </Card>
  );
}

function ProgramCompactRow({
  program,
  maxStudents,
}: {
  program: UniversityAnalyticsProgramBreakdown;
  maxStudents: number;
}) {
  const width = maxStudents > 0 ? Math.max(6, Math.round((program.students / maxStudents) * 100)) : 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-950">{program.name}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{program.facultyName}</p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {formatNumber(program.students)}
        </Badge>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${width}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{program.levels} levels</span>
        <span>{program.courses} courses</span>
        <span>CGPA {formatDecimal(program.averageCgpa)}</span>
      </div>
    </div>
  );
}

function EmptyState({ title, description, compact = false }: { title: string; description: string; compact?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center ${
        compact ? 'px-4 py-7' : 'min-h-52 px-6 py-10'
      }`}
    >
      <BarChart3 className="h-7 w-7 text-slate-400" />
      <p className="mt-3 text-sm font-medium text-slate-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}

function CalendarItem({ item }: { item: UniversityAnalyticsItem }) {
  const itemDate = toDate(item.date);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h5 className="line-clamp-2 text-sm font-medium text-slate-950">{item.title}</h5>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>
        </div>
        <Badge variant={item.type === 'EVENT' ? 'default' : 'secondary'} className="shrink-0">
          {item.type === 'EVENT' ? 'Event' : 'Notice'}
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>
          {itemDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        {item.location && <span>{item.location}</span>}
      </div>
    </div>
  );
}
