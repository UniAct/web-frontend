import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
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
  type UniversityAnalyticsItem,
  type UniversityAnalyticsProgramBreakdown,
} from '../../api';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const CHART_COLORS = [
  '#2a78d6', '#1baf7a', '#eda100', '#008300',
  '#4a3aa7', '#e34948', '#e87ba4', '#eb6834',
];

interface StatisticsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

type EventTab = 'ANNOUNCEMENT' | 'EVENT';
type DistributionTab = 'faculty' | 'program';

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

// Custom active shape for PieChart — renders a highlighted sector with an outer ring
// and a centered label showing name + count in the donut hole.
export function StatisticsPage({ selectedUniversity }: StatisticsPageProps) {
  const [analytics, setAnalytics] = useState<UniversityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPrograms, setExpandedPrograms] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeEventTab, setActiveEventTab] = useState<EventTab>('ANNOUNCEMENT');
  const [distributionTab, setDistributionTab] = useState<DistributionTab>('faculty');
  const [activePieIndex, setActivePieIndex] = useState(0);

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
    setActivePieIndex(0);
  }, [selectedUniversity]);

  // Reset pie index when switching tabs
  useEffect(() => {
    setActivePieIndex(0);
  }, [distributionTab]);

  const summary = analytics?.summary;
  const attendance = analytics?.attendance.last30Days;
  const totalAbsences = analytics?.todayAbsences.reduce((t, p) => t + p.absences, 0) ?? 0;
  const avgStudentsPerProgram = summary?.programs
    ? Math.round((summary.students / summary.programs) * 10) / 10
    : 0;

  // Headline stats — 4 primary KPIs
  const headlineStats = [
    { label: 'Students', value: summary?.students ?? 0, icon: Users, color: 'text-blue-700 bg-blue-50 border-blue-100' },
    { label: 'Faculties', value: summary?.faculties ?? 0, icon: School, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
    { label: 'Programs', value: summary?.programs ?? 0, icon: Layers3, color: 'text-violet-700 bg-violet-50 border-violet-100' },
    { label: 'Courses', value: summary?.courses ?? 0, icon: BookOpen, color: 'text-amber-700 bg-amber-50 border-amber-100' },
  ];

  // Secondary KPIs rendered as a compact strip
  const secondaryStats = [
    {
      icon: GraduationCap,
      label: 'Staff / Admins',
      value: `${formatNumber(summary?.staff ?? 0)} / ${formatNumber(summary?.admins ?? 0)}`,
    },
    {
      icon: Network,
      label: 'Learning groups',
      value: formatNumber(summary?.learningGroups ?? 0),
      sub: `${formatNumber(summary?.activeRegistrations ?? 0)} active enrollments`,
    },
    {
      icon: Building2,
      label: 'Room capacity',
      value: formatNumber(analytics?.resources.totalCapacity ?? 0),
      sub: `${analytics?.resources.classrooms ?? 0} classrooms`,
    },
    {
      icon: TrendingUp,
      label: 'Attendance rate',
      value: `${attendance?.attendanceRate ?? 0}%`,
      sub: `${formatNumber(attendance?.total ?? 0)} records / 30 days`,
    },
  ];

  // Faculty pie data
  const facultyPieData = useMemo(
    () =>
      analytics?.facultyBreakdown.map((f, i) => ({
        name: f.name,
        value: f.students,
        secondary: `${f.programs} programs`,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })) ?? [],
    [analytics],
  );

  // Program pie data (top 8)
  const programPieData = useMemo(
    () =>
      analytics?.programBreakdown.slice(0, 8).map((p, i) => ({
        name: p.name,
        value: p.students,
        secondary: p.facultyName,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })) ?? [],
    [analytics],
  );

  const activePieData = distributionTab === 'faculty' ? facultyPieData : programPieData;
  const normalizedActivePieIndex = activePieData.length > 0
    ? Math.min(activePieIndex, activePieData.length - 1)
    : 0;
  const activePieItem = activePieData[normalizedActivePieIndex];
  const topPrograms = useMemo(() => analytics?.programBreakdown.slice(0, 6) ?? [], [analytics]);

  const attendanceData = useMemo(
    () =>
      attendance
        ? [
          { name: 'Present', value: attendance.present, color: '#1baf7a' },
          { name: 'Late', value: attendance.late, color: '#eda100' },
          { name: 'Absent', value: attendance.absent, color: '#e34948' },
          { name: 'Excused', value: attendance.excused, color: '#2a78d6' },
          { name: 'Medical', value: attendance.medical, color: '#4a3aa7' },
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

  const hasItemOnDate = (date: Date) =>
    visibleItems.some((item) => sameCalendarDay(toDate(item.date), date));

  const toggleProgram = (id: number) =>
    setExpandedPrograms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-slate-50 text-slate-700 text-xs">
                Live analytics
              </Badge>
              {analytics?.generatedAt && (
                <span className="text-xs text-slate-400">
                  Updated {new Date(analytics.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {selectedUniversity ?? 'University'} Statistics
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={loading} className="w-fit gap-2 shrink-0">
            <RefreshCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Primary KPIs */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {headlineStats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <div className={`rounded-md border p-1.5 ${color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              {loading ? (
                <Skeleton className="mt-2 h-7 w-20" />
              ) : (
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950">
                  {formatNumber(value)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Secondary KPI strip */}
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {secondaryStats.map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-medium">{label}</span>
              </div>
              {loading ? (
                <Skeleton className="mt-1.5 h-5 w-16" />
              ) : (
                <>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
                  {sub && <p className="text-xs text-slate-400">{sub}</p>}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 2: Distribution + Attendance side-by-side ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">

        {/* Combined Distribution Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold text-slate-950">Student distribution</CardTitle>
              <Tabs
                value={distributionTab}
                onValueChange={(v) => setDistributionTab(v as DistributionTab)}
              >
                <TabsList className="h-7 gap-0.5 px-0.5 py-0.5">
                  <TabsTrigger value="faculty" className="h-6 px-3 text-xs">
                    By faculty
                  </TabsTrigger>
                  <TabsTrigger value="program" className="h-6 px-3 text-xs">
                    By program
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {loading ? (
              <div className="flex gap-6">
                <Skeleton className="h-52 w-52 rounded-full" />
                <div className="flex-1 space-y-3 pt-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ) : activePieData.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                {/* Interactive donut — hover shows label in center */}
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    {activePieItem && (
                      <>
                        <text
                          x={110}
                          y={100}
                          textAnchor="middle"
                          fill="#0f172a"
                          style={{ fontSize: 13, fontWeight: 600 }}
                        >
                          {activePieItem.name.length > 16
                            ? `${activePieItem.name.slice(0, 15)}...`
                            : activePieItem.name}
                        </text>
                        <text x={110} y={119} textAnchor="middle" fill="#64748b" style={{ fontSize: 12 }}>
                          {formatNumber(activePieItem.value)} students
                        </text>
                        <text x={110} y={136} textAnchor="middle" fill="#94a3b8" style={{ fontSize: 11 }}>
                          {activePieItem.secondary}
                        </text>
                      </>
                    )}
                    <Pie
                      data={activePieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={90}
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                    >
                      {activePieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          opacity={index === normalizedActivePieIndex ? 1 : 0.72}
                          stroke={index === normalizedActivePieIndex ? '#ffffff' : entry.color}
                          strokeWidth={index === normalizedActivePieIndex ? 4 : 1}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend list */}
                <div className="flex flex-col justify-center gap-2 py-1">
                  {activePieData.slice(0, 7).map((item, idx) => {
                    const total = activePieData.reduce((s, x) => s + x.value, 0);
                    const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                    const isActive = idx === normalizedActivePieIndex;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
                          }`}
                        onMouseEnter={() => setActivePieIndex(idx)}
                        onClick={() => setActivePieIndex(idx)}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-800">
                          {item.name}
                        </span>
                        <span className="shrink-0 text-xs text-slate-400">{pct}%</span>
                        <span className="shrink-0 text-xs font-medium text-slate-700">
                          {formatNumber(item.value)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No distribution data"
                description="This chart will populate once student records are linked."
                compact
              />
            )}
          </CardContent>
        </Card>

        {/* Attendance card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold text-slate-950">Attendance health</CardTitle>
              {!loading && attendance && attendance.total > 0 && (
                <Badge variant="outline" className="text-xs">
                  {totalAbsences} absent today
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : attendance && attendance.total > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-slate-950">
                      {attendance.attendanceRate}%
                    </span>
                    <span className="text-sm text-slate-500">present or late</span>
                  </div>
                  <Progress value={attendance.attendanceRate} className="mt-2 h-1.5 bg-slate-100" />
                </div>

                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={44}
                      outerRadius={72}
                    >
                      {attendanceData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatNumber(value), 'Records']}
                      contentStyle={{ borderRadius: 8, border: '0.5px solid var(--border)', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-1.5">
                  {attendanceData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded bg-slate-50 px-2.5 py-1.5"
                    >
                      <span className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </span>
                      <span className="text-xs font-medium text-slate-900">
                        {formatNumber(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No attendance records"
                description="Insights appear after sessions are submitted."
                compact
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Program scale + Absences + Communications ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px_340px]">

        {/* Program bar chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold text-slate-950">Program scale</CardTitle>
              <Badge variant="secondary" className="bg-slate-100 text-xs text-slate-600">
                {formatDecimal(avgStudentsPerProgram, 1)} students/program
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : topPrograms.length > 0 ? (
              <div className="space-y-3">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topPrograms} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      height={48}
                      tickFormatter={(name: string) =>
                        name.length > 10 ? `${name.slice(0, 9)}…` : name
                      }
                    />
                    <YAxis tick={{ fontSize: 10 }} width={36} />
                    <Tooltip
                      formatter={(value: number) => [formatNumber(value), 'Students']}
                      contentStyle={{ borderRadius: 8, border: '0.5px solid var(--border)', fontSize: 12 }}
                    />
                    <Bar dataKey="students" radius={[4, 4, 0, 0]} fill="#2a78d6" maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Compact program rows */}
                <div className="space-y-1.5">
                  {topPrograms.slice(0, 4).map((p) => (
                    <ProgramRow key={p.id} program={p} max={topPrograms[0]?.students ?? 1} />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState title="No programs" description="Programs appear once created." compact />
            )}
          </CardContent>
        </Card>

        {/* Today's absences */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold text-slate-950">Today's absences</CardTitle>
              <Badge variant="secondary" className="bg-slate-100 text-xs text-slate-600">
                {formatNumber(totalAbsences)} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : analytics && analytics.todayAbsences.length > 0 ? (
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-0.5">
                {analytics.todayAbsences.map((program) => {
                  const expanded = expandedPrograms.includes(program.id);
                  return (
                    <Collapsible
                      key={program.id}
                      open={expanded}
                      onOpenChange={() => toggleProgram(program.id)}
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:bg-slate-50">
                          <div className="flex min-w-0 items-center gap-2">
                            {expanded ? (
                              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            )}
                            <span className="truncate text-xs font-medium text-slate-900">
                              {program.name}
                            </span>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {formatNumber(program.absences)}
                          </Badge>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-5 mt-1 grid gap-1 grid-cols-2">
                          {program.levels.map((level) => (
                            <div
                              key={level.id}
                              className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-2.5 py-1.5"
                            >
                              <span className="truncate text-xs text-slate-600">{level.name}</span>
                              <span className="ml-2 shrink-0 text-xs font-medium text-slate-900">
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
              <EmptyState
                title="No absences today"
                description="Updates as attendance is submitted."
                compact
              />
            )}
          </CardContent>
        </Card>

        {/* Communications calendar */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold text-slate-950">Communications</CardTitle>
              <Badge variant="outline" className="text-xs">
                {formatNumber(analytics?.communications.announcements ?? 0)} / {formatNumber(analytics?.communications.events ?? 0)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <Tabs
              value={activeEventTab}
              onValueChange={(v) => setActiveEventTab(v as EventTab)}
            >
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="ANNOUNCEMENT" className="gap-1.5 text-xs h-7">
                  <Bell className="h-3.5 w-3.5" />
                  Announcements
                </TabsTrigger>
                <TabsTrigger value="EVENT" className="gap-1.5 text-xs h-7">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Events
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-slate-200 scale-90 origin-top"
                modifiers={{ hasItem: hasItemOnDate }}
                modifiersClassNames={{
                  hasItem: 'font-semibold text-blue-700 underline underline-offset-2',
                }}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-700">
                  {selectedDate
                    ? `${activeEventTab === 'EVENT' ? 'Events' : 'Announcements'} on ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : 'Select a date'}
                </p>
                <Badge variant="outline" className="text-xs">{selectedItems.length}</Badge>
              </div>

              <div className="max-h-48 space-y-2 overflow-y-auto pr-0.5">
                {loading ? (
                  <Skeleton className="h-16 w-full" />
                ) : selectedItems.length > 0 ? (
                  selectedItems.map((item) => (
                    <CalendarItem key={`${item.type}-${item.id}`} item={item} />
                  ))
                ) : (
                  <EmptyState
                    title="Nothing scheduled"
                    description="Underlined dates have items."
                    compact
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function ProgramRow({
  program,
  max,
}: {
  program: UniversityAnalyticsProgramBreakdown;
  max: number;
}) {
  const width = max > 0 ? Math.max(4, Math.round((program.students / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3 rounded border border-slate-100 bg-white px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-slate-900">{program.name}</p>
          <span className="shrink-0 text-xs font-medium text-slate-700">
            {formatNumber(program.students)}
          </span>
        </div>
        <div className="mt-1.5 h-1 rounded-full bg-slate-100">
          <div className="h-1 rounded-full bg-blue-500" style={{ width: `${width}%` }} />
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
          <span>{program.levels} levels</span>
          <span>{program.courses} courses</span>
          <span>CGPA {formatDecimal(program.averageCgpa)}</span>
        </div>
      </div>
    </div>
  );
}

function CalendarItem({ item }: { item: UniversityAnalyticsItem }) {
  const itemDate = toDate(item.date);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h5 className="line-clamp-1 text-xs font-medium text-slate-900">{item.title}</h5>
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.description}</p>
        </div>
        <Badge
          variant={item.type === 'EVENT' ? 'default' : 'secondary'}
          className="shrink-0 text-xs"
        >
          {item.type === 'EVENT' ? 'Event' : 'Notice'}
        </Badge>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-slate-400">
        <span>
          {itemDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        {item.location && <span>{item.location}</span>}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  compact = false,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center ${compact ? 'px-4 py-6' : 'min-h-44 px-6 py-8'
        }`}
    >
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}
