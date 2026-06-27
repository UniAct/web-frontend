import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Sector,
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
import { Calendar } from '../ui/calendar';

// ── Palette ──────────────────────────────────────────────────────────────────
const SERIES = ['#2a78d6', '#1baf7a', '#eda100', '#4a3aa7', '#e34948', '#eb6834', '#e87ba4', '#008300'];

const ATTENDANCE_COLORS: Record<string, string> = {
  Present: '#1baf7a',
  Late: '#eda100',
  Absent: '#e34948',
  Excused: '#2a78d6',
  Medical: '#4a3aa7',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) { return new Intl.NumberFormat('en-US').format(n); }
function dec(n: number, d = 2) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: n > 0 ? d : 0, maximumFractionDigits: d }).format(n);
}
function toDate(s: string) { const d = new Date(s); return isNaN(d.getTime()) ? new Date() : d; }
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface StatisticsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (u: string | null) => void;
}
type EventTab = 'ANNOUNCEMENT' | 'EVENT';
type DistTab = 'faculty' | 'program';

// ── Active Pie Shape ──────────────────────────────────────────────────────────
// Recharts calls this with a wide set of props we forward to Sector
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ActivePieShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 5}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 9} outerRadius={outerRadius + 12}
        startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.5} />
    </g>
  );
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, icon: Icon, accent, sub, loading,
}: {
  label: string; value: string; icon: React.ElementType;
  accent: string; sub?: string; loading: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
      padding: '14px 16px', minWidth: 0
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: accent + '18', border: `1px solid ${accent}30`,
      }}>
        <Icon style={{ width: 18, height: 18, color: accent }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: '#64748b', letterSpacing: '0.03em', textTransform: 'uppercase' }}>{label}</p>
        {loading
          ? <div style={{ width: 64, height: 22, background: '#f1f5f9', borderRadius: 4, marginTop: 4 }} />
          : <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>{value}</p>
        }
        {sub && !loading && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHeader({ title, badge, action }: { title: string; badge?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '16px 20px 0', flexWrap: 'wrap'
    }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {badge}
        {action}
      </div>
    </div>
  );
}

// ── Pill Badge ─────────────────────────────────────────────────────────────────
function Pill({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'blue' }) {
  const bg = variant === 'blue' ? '#eff6ff' : '#f8fafc';
  const color = variant === 'blue' ? '#1d4ed8' : '#475569';
  const border = variant === 'blue' ? '#bfdbfe' : '#e2e8f0';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: bg, color, border: `1px solid ${border}`,
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 500
    }}>
      {children}
    </span>
  );
}

// ── Panel (card substitute) ────────────────────────────────────────────────────
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.03)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function StatisticsPage({ selectedUniversity }: StatisticsPageProps) {
  const [analytics, setAnalytics] = useState<UniversityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [selDate, setSelDate] = useState<Date | undefined>(new Date());
  const [evTab, setEvTab] = useState<EventTab>('ANNOUNCEMENT');
  const [distTab, setDistTab] = useState<DistTab>('faculty');
  const [pieIdx, setPieIdx] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setAnalytics(await UniversityService.getAnalytics()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); setPieIdx(0); }, [load, selectedUniversity]);
  useEffect(() => { setPieIdx(0); }, [distTab]);

  const sum = analytics?.summary;
  const att30 = analytics?.attendance.last30Days;
  const totalAbs = analytics?.todayAbsences.reduce((t, p) => t + p.absences, 0) ?? 0;
  const avgSPP = sum?.programs ? Math.round((sum.students / sum.programs) * 10) / 10 : 0;
  const avgCap = analytics?.resources.classrooms
    ? Math.round(analytics.resources.totalCapacity / analytics.resources.classrooms) : 0;

  const facultyPie = useMemo(() =>
    analytics?.facultyBreakdown.map((f, i) => ({
      name: f.name, value: f.students, secondary: `${f.programs} programs`, color: SERIES[i % SERIES.length],
    })) ?? [], [analytics]);

  const programPie = useMemo(() =>
    analytics?.programBreakdown.slice(0, 8).map((p, i) => ({
      name: p.name, value: p.students, secondary: p.facultyName, color: SERIES[i % SERIES.length],
    })) ?? [], [analytics]);

  const pieData = distTab === 'faculty' ? facultyPie : programPie;
  const safeIdx = pieData.length > 0 ? Math.min(pieIdx, pieData.length - 1) : 0;
  const active = pieData[safeIdx];
  const pieTotal = pieData.reduce((s, x) => s + x.value, 0);

  const topProgs = useMemo(() => analytics?.programBreakdown.slice(0, 6) ?? [], [analytics]);

  const attData = useMemo(() => att30 ? [
    { name: 'Present', value: att30.present },
    { name: 'Late', value: att30.late },
    { name: 'Absent', value: att30.absent },
    { name: 'Excused', value: att30.excused },
    { name: 'Medical', value: att30.medical },
  ] : [], [att30]);

  const upcomingFiltered = useMemo(
    () => analytics?.upcomingItems.filter(i => i.type === evTab) ?? [],
    [analytics, evTab],
  );
  const selItems = useMemo(() =>
    selDate ? upcomingFiltered.filter(i => sameDay(toDate(i.date), selDate)) : [],
    [selDate, upcomingFiltered]);

  const hasItem = (d: Date) => upcomingFiltered.some(i => sameDay(toDate(i.date), d));
  const toggle = (id: number) => setExpanded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // Donut center label rendered via foreignObject so it doesn't rely on coordinate guessing
  const DonutLabel = active ? (
    <foreignObject x={0} y={60} width={220} height={100} style={{ pointerEvents: 'none' }}>
      <div style={{ textAlign: 'center', padding: '0 12px' }}>
        <p style={{
          margin: 0, fontSize: 12, fontWeight: 600, color: '#0f172a',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {active.name}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>
          {fmt(active.value)} students
        </p>
        <p style={{ margin: '1px 0 0', fontSize: 10, color: '#94a3b8' }}>
          {active.secondary}
        </p>
      </div>
    </foreignObject>
  ) : null;

  const isLoading = (h: number) => (
    <div style={{
      height: h, background: '#f8fafc', borderRadius: 8,
      animation: 'pulse 1.5s ease-in-out infinite'
    }} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── HEADER PANEL ──────────────────────────────────────────────────── */}
      <Panel>
        <div style={{ padding: '20px 20px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Pill variant="blue">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2a78d6', display: 'inline-block' }} />
                  Live analytics
                </Pill>
                {analytics?.generatedAt && (
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    Updated {new Date(analytics.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <h2 style={{ margin: '8px 0 0', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                {selectedUniversity ?? 'University'} Statistics
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                Real-time snapshot of academic structure, attendance, and communications.
              </p>
            </div>
            <button
              onClick={load}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
                fontSize: 12, fontWeight: 500, color: '#475569', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1, flexShrink: 0, whiteSpace: 'nowrap',
              }}
            >
              <RefreshCcw style={{ width: 13, height: 13, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
              padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, fontSize: 12, color: '#991b1b',
            }}>
              <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
              {error}
            </div>
          )}
        </div>

        {/* Primary KPIs — explicit 4-col grid, no breakpoint */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: '16px 20px 0' }}>
          <KpiCard label="Students" value={fmt(sum?.students ?? 0)} icon={Users} accent="#2a78d6" loading={loading} />
          <KpiCard label="Faculties" value={fmt(sum?.faculties ?? 0)} icon={School} accent="#1baf7a" loading={loading} />
          <KpiCard label="Programs" value={fmt(sum?.programs ?? 0)} icon={Layers3} accent="#7c3aed" loading={loading} />
          <KpiCard label="Courses" value={fmt(sum?.courses ?? 0)} icon={BookOpen} accent="#d97706" loading={loading} />
        </div>

        {/* Secondary strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: '10px 20px 20px' }}>
          {[
            { icon: GraduationCap, label: 'Staff / Admins', value: `${fmt(sum?.staff ?? 0)} / ${fmt(sum?.admins ?? 0)}` },
            { icon: Network, label: 'Learning groups', value: fmt(sum?.learningGroups ?? 0), sub: `${fmt(sum?.activeRegistrations ?? 0)} active enrollments` },
            { icon: Building2, label: 'Room capacity', value: fmt(analytics?.resources.totalCapacity ?? 0), sub: `${avgCap} avg seats / room` },
            { icon: TrendingUp, label: 'Attendance rate', value: `${att30?.attendanceRate ?? 0}%`, sub: `${fmt(att30?.total ?? 0)} records / 30 days` },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10, padding: '10px 14px',
            }}>
              <Icon style={{ width: 15, height: 15, color: '#64748b', flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{label}</p>
                {loading
                  ? <div style={{ width: 56, height: 16, background: '#e2e8f0', borderRadius: 3, marginTop: 3 }} />
                  : <>
                    <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{value}</p>
                    {sub && <p style={{ margin: 0, fontSize: 10, color: '#94a3b8' }}>{sub}</p>}
                  </>
                }
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── ROW 2: Distribution + Attendance ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 370px', gap: 16 }}>

        {/* Distribution */}
        <Panel>
          <SectionHeader
            title="Student distribution"
            action={
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
                {(['faculty', 'program'] as DistTab[]).map(t => (
                  <button key={t} onClick={() => setDistTab(t)} style={{
                    padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 500, transition: 'all .15s',
                    background: distTab === t ? '#fff' : 'transparent',
                    color: distTab === t ? '#0f172a' : '#64748b',
                    boxShadow: distTab === t ? '0 1px 2px rgba(0,0,0,.08)' : 'none',
                  }}>
                    {t === 'faculty' ? 'By faculty' : 'By program'}
                  </button>
                ))}
              </div>
            }
          />
          <div style={{ padding: '16px 20px 20px' }}>
            {loading ? (
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ width: 220, height: 220, borderRadius: '50%', background: '#f1f5f9' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
                  {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ height: 32, background: '#f8fafc', borderRadius: 6 }} />)}
                </div>
              </div>
            ) : pieData.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'center' }}>
                {/* Donut */}
                <div style={{ position: 'relative' }}>
                  <ResponsiveContainer width={220} height={220}>
                    <PieChart>
                      {DonutLabel}
                      <Pie
                        data={pieData} dataKey="value" nameKey="name"
                        cx={110} cy={110} innerRadius={62} outerRadius={90}
                        activeIndex={safeIdx}
                        activeShape={ActivePieShape}
                        onMouseEnter={(_, i) => setPieIdx(i)}
                        onClick={(_, i) => setPieIdx(i)}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={entry.name} fill={entry.color}
                            opacity={i === safeIdx ? 1 : 0.65}
                            stroke={i === safeIdx ? '#fff' : 'transparent'}
                            strokeWidth={i === safeIdx ? 3 : 0}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {pieData.slice(0, 8).map((item, i) => {
                    const pct = pieTotal > 0 ? Math.round((item.value / pieTotal) * 100) : 0;
                    const isSel = i === safeIdx;
                    return (
                      <button key={item.name} type="button"
                        onMouseEnter={() => setPieIdx(i)} onClick={() => setPieIdx(i)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '7px 10px', borderRadius: 8, border: 'none', textAlign: 'left',
                          cursor: 'pointer', transition: 'background .1s',
                          background: isSel ? '#f0f7ff' : 'transparent',
                        }}
                      >
                        <span style={{
                          width: 10, height: 10, borderRadius: 3, flexShrink: 0,
                          background: item.color,
                          boxShadow: isSel ? `0 0 0 2px ${item.color}40` : 'none',
                        }} />
                        <span style={{
                          flex: 1, fontSize: 12, fontWeight: isSel ? 600 : 400,
                          color: isSel ? '#0f172a' : '#475569', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{pct}%</span>
                        <span style={{
                          fontSize: 12, fontWeight: 600, color: '#334155',
                          minWidth: 40, textAlign: 'right', flexShrink: 0
                        }}>
                          {fmt(item.value)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <EmptySlate title="No distribution data" sub="Populates once student records are linked." />
            )}
          </div>
        </Panel>

        {/* Attendance */}
        <Panel>
          <SectionHeader title="Attendance health"
            badge={!loading && att30 && att30.total > 0
              ? <Pill>{totalAbs} absent today</Pill> : undefined} />
          <div style={{ padding: '16px 20px 20px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ height: 28, width: 100, background: '#f1f5f9', borderRadius: 6 }} />
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4 }} />
                <div style={{ height: 160, background: '#f8fafc', borderRadius: 8 }} />
              </div>
            ) : att30 && att30.total > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{att30.attendanceRate}%</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>present or late</span>
                  </div>
                  <div style={{ marginTop: 8, height: 6, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${att30.attendanceRate}%`,
                      background: 'linear-gradient(90deg, #1baf7a, #2a78d6)', borderRadius: 4, transition: 'width .6s'
                    }} />
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={148}>
                  <PieChart>
                    <Pie data={attData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" innerRadius={40} outerRadius={66}>
                      {attData.map(e => <Cell key={e.name} fill={ATTENDANCE_COLORS[e.name] ?? '#94a3b8'} />)}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [fmt(v), 'Records']}
                      contentStyle={{
                        borderRadius: 8, border: '1px solid #e2e8f0',
                        fontSize: 11, boxShadow: '0 4px 6px rgba(0,0,0,.06)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {attData.map(item => (
                    <div key={item.name} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#f8fafc', borderRadius: 7, padding: '6px 10px',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#475569' }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: ATTENDANCE_COLORS[item.name] ?? '#94a3b8', flexShrink: 0
                        }} />
                        {item.name}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{fmt(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptySlate title="No attendance records" sub="Insights appear after sessions are submitted." />
            )}
          </div>
        </Panel>
      </div>

      {/* ── ROW 3: Programs + Absences + Comms ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px 330px', gap: 16 }}>

        {/* Program scale */}
        <Panel>
          <SectionHeader title="Program scale"
            badge={<Pill>{dec(avgSPP, 1)} students / program</Pill>} />
          <div style={{ padding: '16px 20px 20px' }}>
            {loading ? isLoading(280) : topProgs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={topProgs} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={0} height={44}
                      tickFormatter={(n: string) => n.length > 9 ? n.slice(0, 8) + '…' : n} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={34} />
                    <Tooltip
                      formatter={(v: number) => [fmt(v), 'Students']}
                      contentStyle={{
                        borderRadius: 8, border: '1px solid #e2e8f0',
                        fontSize: 11, boxShadow: '0 4px 6px rgba(0,0,0,.06)'
                      }}
                    />
                    <Bar dataKey="students" radius={[4, 4, 0, 0]} maxBarSize={38}
                      fill="url(#barGrad)" />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2a78d6" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {topProgs.slice(0, 5).map(p => {
                    const w = topProgs[0]?.students ? Math.max(4, Math.round((p.students / topProgs[0].students) * 100)) : 0;
                    return (
                      <div key={p.id} style={{
                        background: '#f8fafc', borderRadius: 8, padding: '8px 12px',
                        border: '1px solid #f1f5f9',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontSize: 12, fontWeight: 500, color: '#0f172a',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1
                          }}>
                            {p.name}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#2a78d6', flexShrink: 0 }}>{fmt(p.students)}</span>
                        </div>
                        <div style={{ marginTop: 6, height: 3, background: '#e2e8f0', borderRadius: 2 }}>
                          <div style={{ height: 3, width: `${w}%`, background: '#2a78d6', borderRadius: 2, transition: 'width .5s' }} />
                        </div>
                        <div style={{ marginTop: 5, display: 'flex', gap: 12 }}>
                          <span style={{ fontSize: 10, color: '#94a3b8' }}>{p.levels} levels</span>
                          <span style={{ fontSize: 10, color: '#94a3b8' }}>{p.courses} courses</span>
                          <span style={{ fontSize: 10, color: '#94a3b8' }}>CGPA {dec(p.averageCgpa)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <EmptySlate title="No programs" sub="Programs appear once created." />
            )}
          </div>
        </Panel>

        {/* Today's absences */}
        <Panel>
          <SectionHeader title="Today's absences" badge={<Pill>{fmt(totalAbs)} total</Pill>} />
          <div style={{ padding: '16px 20px 20px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 40, background: '#f8fafc', borderRadius: 8 }} />)}
              </div>
            ) : analytics?.todayAbsences.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 420, overflowY: 'auto' }}>
                {analytics.todayAbsences.map(prog => {
                  const open = expanded.includes(prog.id);
                  return (
                    <div key={prog.id}>
                      <button onClick={() => toggle(prog.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          gap: 8, padding: '9px 12px', background: open ? '#f0f7ff' : '#f8fafc',
                          border: `1px solid ${open ? '#bfdbfe' : '#f1f5f9'}`,
                          borderRadius: open ? '8px 8px 0 0' : 8, cursor: 'pointer', textAlign: 'left',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                          {open
                            ? <ChevronDown style={{ width: 12, height: 12, color: '#2a78d6', flexShrink: 0 }} />
                            : <ChevronRight style={{ width: 12, height: 12, color: '#94a3b8', flexShrink: 0 }} />
                          }
                          <span style={{
                            fontSize: 12, fontWeight: 500, color: '#0f172a',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}>
                            {prog.name}
                          </span>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: open ? '#1d4ed8' : '#475569',
                          background: open ? '#dbeafe' : '#e2e8f0', borderRadius: 5, padding: '2px 7px', flexShrink: 0,
                        }}>
                          {fmt(prog.absences)}
                        </span>
                      </button>
                      {open && (
                        <div style={{
                          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3,
                          padding: '6px 8px 8px', background: '#f8fbff',
                          border: '1px solid #bfdbfe', borderTop: 'none', borderRadius: '0 0 8px 8px',
                        }}>
                          {prog.levels.map(lv => (
                            <div key={lv.id} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              background: '#fff', borderRadius: 6, padding: '5px 8px',
                              border: '1px solid #e2e8f0',
                            }}>
                              <span style={{ fontSize: 10, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lv.name}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', flexShrink: 0, marginLeft: 4 }}>{fmt(lv.absences)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptySlate title="No absences today" sub="Updates as attendance is submitted." />
            )}
          </div>
        </Panel>

        {/* Communications */}
        <Panel>
          <SectionHeader title="Communications"
            badge={
              <Pill>
                {fmt(analytics?.communications.announcements ?? 0)} / {fmt(analytics?.communications.events ?? 0)}
              </Pill>
            }
          />
          <div style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Tab toggle */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
              {([['ANNOUNCEMENT', Bell, 'Announcements'], ['EVENT', CalendarIcon, 'Events']] as const).map(([val, Icon, label]) => (
                <button key={val} onClick={() => setEvTab(val as EventTab)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 500, transition: 'all .15s',
                    background: evTab === val ? '#fff' : 'transparent',
                    color: evTab === val ? '#0f172a' : '#64748b',
                    boxShadow: evTab === val ? '0 1px 2px rgba(0,0,0,.08)' : 'none',
                  }}>
                  <Icon style={{ width: 12, height: 12 }} />
                  {label}
                </button>
              ))}
            </div>

            {/* Calendar */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Calendar
                mode="single" selected={selDate} onSelect={setSelDate}
                className="rounded-lg border border-slate-200"
                modifiers={{ hasItem }}
                modifiersClassNames={{ hasItem: 'font-semibold text-blue-600 underline underline-offset-2' }}
              />
            </div>

            {/* Item list */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#475569' }}>
                  {selDate
                    ? `${evTab === 'EVENT' ? 'Events' : 'Notices'} on ${selDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : 'Pick a date'}
                </p>
                <span style={{
                  fontSize: 10, fontWeight: 700, background: '#f1f5f9', color: '#475569',
                  borderRadius: 5, padding: '2px 7px',
                }}>{selItems.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ height: 60, background: '#f8fafc', borderRadius: 8 }} />
                ) : selItems.length > 0 ? selItems.map(item => (
                  <CommItem key={`${item.type}-${item.id}`} item={item} />
                )) : (
                  <EmptySlate title="Nothing scheduled" sub="Underlined dates have items." compact />
                )}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function CommItem({ item }: { item: UniversityAnalyticsItem }) {
  const d = toDate(item.date);
  return (
    <div style={{
      background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8, padding: '9px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: 12, fontWeight: 600, color: '#0f172a',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>{item.title}</p>
          <p style={{
            margin: '2px 0 0', fontSize: 11, color: '#64748b',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>{item.description}</p>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600, flexShrink: 0, borderRadius: 5, padding: '2px 7px',
          background: item.type === 'EVENT' ? '#eff6ff' : '#f8fafc',
          color: item.type === 'EVENT' ? '#1d4ed8' : '#64748b',
          border: `1px solid ${item.type === 'EVENT' ? '#bfdbfe' : '#e2e8f0'}`,
        }}>
          {item.type === 'EVENT' ? 'Event' : 'Notice'}
        </span>
      </div>
      <div style={{ marginTop: 5, display: 'flex', gap: 10 }}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>
          {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        {item.location && <span style={{ fontSize: 10, color: '#94a3b8' }}>{item.location}</span>}
      </div>
    </div>
  );
}

function EmptySlate({ title, sub, compact }: { title: string; sub: string; compact?: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: compact ? '20px 16px' : '36px 24px',
      border: '1.5px dashed #e2e8f0', borderRadius: 10, background: '#fafafa', textAlign: 'center',
    }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#334155' }}>{title}</p>
      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>{sub}</p>
    </div>
  );
}
