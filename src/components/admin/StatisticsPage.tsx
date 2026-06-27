import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Network,
  RefreshCcw,
  Shield,
  Users,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { UniversityService, type UniversityAnalytics, type UniversityAnalyticsItem } from '../../api';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const CHART_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

interface StatisticsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

type EventTab = 'ANNOUNCEMENT' | 'EVENT';

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
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

function eventTypeLabel(type: EventTab) {
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

  const summaryStats = useMemo(() => {
    const summary = analytics?.summary;

    return [
      {
        label: 'Students',
        value: summary?.students ?? 0,
        icon: Users,
        tone: 'bg-blue-50 text-blue-700 border-blue-100',
      },
      {
        label: 'Staff',
        value: summary?.staff ?? 0,
        icon: GraduationCap,
        tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      },
      {
        label: 'Admins',
        value: summary?.admins ?? 0,
        icon: Shield,
        tone: 'bg-violet-50 text-violet-700 border-violet-100',
      },
      {
        label: 'Learning Groups',
        value: summary?.activeTeams ?? 0,
        icon: Network,
        tone: 'bg-amber-50 text-amber-700 border-amber-100',
      },
    ];
  }, [analytics]);

  const totalAbsences = useMemo(
    () => analytics?.todayAbsences.reduce((total, program) => total + program.absences, 0) ?? 0,
    [analytics],
  );

  const pieChartData = useMemo(
    () =>
      analytics?.todayAbsences.map((program, index) => ({
        name: program.name,
        value: program.absences,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })) ?? [],
    [analytics],
  );

  const visibleItems = useMemo(
    () => analytics?.upcomingItems.filter((item) => item.type === activeEventTab) ?? [],
    [activeEventTab, analytics],
  );

  const selectedItems = useMemo(() => {
    if (!selectedDate) return [];
    return visibleItems.filter((item) => sameCalendarDay(toDate(item.date), selectedDate));
  }, [selectedDate, visibleItems]);

  const toggleProgram = (programId: number) => {
    setExpandedPrograms((prev) =>
      prev.includes(programId) ? prev.filter((id) => id !== programId) : [...prev, programId],
    );
  };

  const hasItemOnDate = (date: Date) =>
    visibleItems.some((item) => sameCalendarDay(toDate(item.date), date));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Statistics</h2>
          <p className="mt-1 text-sm text-slate-600">
            Live institutional overview for {selectedUniversity ?? 'the selected university'}.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={loading} className="w-fit gap-2">
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-950">Today's Absences</CardTitle>
              <CardDescription>Grouped by program and academic level from recorded attendance.</CardDescription>
            </div>
            <Badge variant="secondary" className="w-fit bg-slate-100 text-slate-700">
              {formatNumber(totalAbsences)} total
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <Skeleton className="h-64 w-full" />
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : analytics && analytics.todayAbsences.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div className="flex min-h-64 items-center justify-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={pieChartData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96}>
                        {pieChartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} absences`, 'Total']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
                  {analytics.todayAbsences.map((program) => {
                    const expanded = expandedPrograms.includes(program.id);

                    return (
                      <Collapsible
                        key={program.id}
                        open={expanded}
                        onOpenChange={() => toggleProgram(program.id)}
                      >
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
                          <div className="ml-7 mt-2 space-y-2">
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
              </div>
            ) : (
              <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
                <Activity className="h-8 w-8 text-emerald-600" />
                <p className="mt-3 text-sm font-medium text-slate-900">No absences recorded today</p>
                <p className="mt-1 text-sm text-slate-500">This will update when attendance sessions are submitted.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-950">Calendar</CardTitle>
            <CardDescription>Published announcements and scheduled events.</CardDescription>
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
                modifiersClassNames={{
                  hasItem: 'font-semibold text-blue-700 underline underline-offset-4',
                }}
              />
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="text-sm font-medium text-slate-900">
                  {selectedDate
                    ? `${eventTypeLabel(activeEventTab)} on ${selectedDate.toLocaleDateString()}`
                    : 'Select a date'}
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
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                    <p className="text-sm font-medium text-slate-900">Nothing scheduled</p>
                    <p className="mt-1 text-sm text-slate-500">Choose an underlined day to view details.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
