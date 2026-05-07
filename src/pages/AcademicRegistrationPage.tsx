import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Plus, Check, BookOpen, AlertCircle, CheckCircle2,
  Calendar, List, SendHorizonal, CalendarDays,
} from 'lucide-react';
import type { User as AppUser } from '../App';
import { toast } from 'sonner';
import { ProgramService, ScheduleService, EnrollmentService, type ScheduleSlot } from '../api';

interface AcademicRegistrationPageProps {
  user: AppUser;
}

interface CourseSession {
  sessionId: string;
  slotId: number;
  lecturer: string;
  content: string[];
  day: string;
  timeFrom: string;
  timeTo: string;
  room: string;
  availableSeats: number;
  rawSlot: ScheduleSlot;
}

interface Course {
  id: string;
  name: string;
  code: string;
  type:
  | 'University Mandatory'
  | 'University Elective'
  | 'Faculty Mandatory'
  | 'Faculty Elective'
  | 'Program Mandatory'
  | 'Program Elective';
  creditHours: number;
  failureTimes: number;
  level: number;
  sessions: CourseSession[];
}

interface SelectedSession extends CourseSession {
  courseId: string;
  courseName: string;
  courseCode: string;
  creditHours: number;
  addedAt: Date;
}

function format24HourTo12Hour(time24: string) {
  const [rawHour, rawMinute] = time24.split(':');
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return time24;
  }

  const period = hour >= 12 ? 'PM' : 'AM';
  const twelveHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(twelveHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
}

function parse12HourToMinutes(time12: string): number | null {
  const normalized = time12.trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;

  const [, rawHour, rawMinute, period] = match;
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  let hour24 = hour % 12;
  if (period === 'PM') hour24 += 12;
  return hour24 * 60 + minute;
}

function formatMinutesTo12Hour(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
}

function sessionsOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && endA > startB;
}

function mapScheduleSlotsToCourses(slots: ScheduleSlot[], level: number): Course[] {
  const courseMap = new Map<string, Course>();

  slots.forEach((slot) => {
    const courseId = String(slot.course.id);
    const defaultCapacity = slot.classroom.capacity ?? Math.max((slot.enrolledSeats ?? 0) + 30, 30);
    const availableSeats = Math.max(defaultCapacity - (slot.enrolledSeats ?? 0), 0);

    const session: CourseSession = {
      sessionId: String(slot.id),
      slotId: slot.slotId ?? slot.id,
      lecturer: slot.teacher.name,
      content: [slot.type],
      day: slot.dayOfWeek,
      timeFrom: format24HourTo12Hour(slot.startTime),
      timeTo: format24HourTo12Hour(slot.endTime),
      room: slot.classroom.label,
      availableSeats,
      rawSlot: slot,
    };

    if (!courseMap.has(courseId)) {
      courseMap.set(courseId, {
        id: courseId,
        name: slot.course.name,
        code: slot.course.code || slot.course.name || `Course ${slot.course.id}`,
        type: 'Program Mandatory',
        creditHours: slot.course.credits ?? 3,
        failureTimes: 0,
        level,
        sessions: [session],
      });
      return;
    }

    courseMap.get(courseId)!.sessions.push(session);
  });

  return Array.from(courseMap.values());
}

// ─── Constants ───────────────────────────────────────────────────────────────
const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
];
const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const MAX_CREDIT_HOURS = 21;
const ENROLLMENT_POLL_DELAY_MS = 1500;
const ENROLLMENT_MAX_POLLS = 40;

// Timetable column dims (px)
const SLOT_W = 82;
const DAY_W = 72;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const COURSE_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
  '#10b981', '#06b6d4', '#f59e0b', '#6366f1',
  '#14b8a6', '#ef4444',
];
function courseColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % COURSE_COLORS.length;
  return COURSE_COLORS[h];
}

const TYPE_SHORT: Record<string, string> = {
  'University Mandatory': 'Univ. Mand.',
  'University Elective': 'Univ. Elect.',
  'Faculty Mandatory': 'Fac. Mand.',
  'Faculty Elective': 'Fac. Elect.',
  'Program Mandatory': 'Prog. Mand.',
  'Program Elective': 'Prog. Elect.',
};
const TYPE_COLOR: Record<string, string> = {
  'University Mandatory': 'bg-blue-100 text-blue-700 border-blue-200',
  'University Elective': 'bg-blue-50 text-blue-600 border-blue-100',
  'Faculty Mandatory': 'bg-purple-100 text-purple-700 border-purple-200',
  'Faculty Elective': 'bg-purple-50 text-purple-600 border-purple-100',
  'Program Mandatory': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Program Elective': 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

function shortTime(t: string) {
  const [hm, ampm] = t.split(' ');
  return `${parseInt(hm.split(':')[0], 10)} ${ampm}`;
}

function buildIsoDateTime(time24: string, dayOffset = 0): string {
  const [rawHour = '00', rawMinute = '00'] = time24.split(':');
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  const safeHour = Number.isFinite(hour) ? hour : 0;
  const safeMinute = Number.isFinite(minute) ? minute : 0;
  return new Date(Date.UTC(1970, 0, 1 + dayOffset, safeHour, safeMinute, 0, 0)).toISOString();
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getPhysicalSlotId(session: Pick<SelectedSession, 'rawSlot' | 'slotId'>): number {
  return session.rawSlot.slotId ?? session.slotId ?? session.rawSlot.id;
}

function getEnrollmentCredits(
  sessions: SelectedSession[],
  enrolledSlotIds: Set<number>,
): number {
  const enrolledCourseCredits = new Map<string, number>();

  sessions.forEach((session) => {
    if (!enrolledSlotIds.has(getPhysicalSlotId(session))) {
      return;
    }

    if (!enrolledCourseCredits.has(session.courseId)) {
      enrolledCourseCredits.set(session.courseId, session.creditHours);
    }
  });

  return Array.from(enrolledCourseCredits.values()).reduce((sum, credits) => sum + credits, 0);
}

function getFailedEnrollmentMessage(failedSessions: Array<{ courseCode?: string; reason?: string }>): string {
  const details = failedSessions
    .slice(0, 2)
    .map((session) => {
      const label = session.courseCode?.trim();
      const reason = session.reason?.trim() || 'Registration failed';
      return label ? `${label}: ${reason}` : reason;
    })
    .join(' | ');

  return details || 'Registration could not be completed.';
}

function getScheduleCacheKey(programId: number, level: number, semesterId: number): string {
  return `academic-registration:schedule:${programId}:${level}:${semesterId}`;
}

function readCachedScheduleSlots(programId: number, level: number, semesterId: number): ScheduleSlot[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(getScheduleCacheKey(programId, level, semesterId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ScheduleSlot[]) : [];
  } catch {
    return [];
  }
}

function saveCachedScheduleSlots(
  programId: number,
  level: number,
  semesterId: number,
  scheduleSlots: ScheduleSlot[],
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(
      getScheduleCacheKey(programId, level, semesterId),
      JSON.stringify(scheduleSlots),
    );
  } catch {
    // Ignore storage failures and keep the live fetch path unchanged.
  }
}

function isKnownScheduleLoadSyncError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes('coursePrerequisitesFor') || error.message.includes('scheduleSlotContext.findMany()');
}

// ─────────────────────────────────────────────────────────────────────────────
export function AcademicRegistrationPage({ user }: AcademicRegistrationPageProps) {
  const [selectedLevel, setSelectedLevel] = useState(() =>
    user.programLevel ? String(user.programLevel) : ''
  );
  const [isLevelResolved, setIsLevelResolved] = useState(() => !!user.programLevel);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<SelectedSession[]>([]);
  const [sessionSeats, setSessionSeats] = useState<Record<string, number>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [mobileView, setMobileView] = useState<'courses' | 'timetable'>('courses');

  // Detect viewport width via JS — avoids Tailwind breakpoint mismatches
  const [vpWidth, setVpWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  useEffect(() => {
    const update = () => setVpWidth(window.innerWidth);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Split-screen threshold: 900px viewport (avoids lg=1024px issue in sidebar layouts)
  const isSplit = vpWidth >= 900;

  useEffect(() => {
    if (user.role !== 'student') return;
    if (user.programLevel) {
      setSelectedLevel(String(user.programLevel));
      setIsLevelResolved(true);
      return;
    }

    if (!user.programId || !user.programLevelId) return;

    let isMounted = true;

    const resolveAcademicLevel = async () => {
      try {
        const program = await ProgramService.getById(user.programId);

        if (!isMounted) return;

        const levelById = program.levels.find((level) => level.id === user.programLevelId);
        const levelByNumber = program.levels.find((level) => level.level === user.programLevelId);
        const resolvedLevel = levelById?.level ?? levelByNumber?.level;

        if (resolvedLevel) {
          setSelectedLevel(String(resolvedLevel));
        }

        setIsLevelResolved(true);
      } catch {
        setIsLevelResolved(true);
        // Keep fallback selectedLevel when program lookup is unavailable.
      }
    };

    void resolveAcademicLevel();

    return () => {
      isMounted = false;
    };
  }, [user.role, user.programId, user.programLevelId, user.programLevel]);


  useEffect(() => {
    if (user.role !== 'student') return;

    if (!isLevelResolved || !selectedLevel || !user.programId || !user.currentSemesterId) {
      setCourses([]);
      return;
    }

    let isMounted = true;

    const loadSchedule = async () => {
      try {
        setIsLoadingCourses(true);
        const scheduleSlots = await ScheduleService.getScheduleSlots(
          user.programId,
          Number(selectedLevel),
          user.currentSemesterId,
          user.facultyId,
        );

        if (!isMounted) return;

        saveCachedScheduleSlots(user.programId, Number(selectedLevel), user.currentSemesterId, scheduleSlots);
        setCourses(mapScheduleSlotsToCourses(scheduleSlots, Number(selectedLevel)));
      } catch (error) {
        if (!isMounted) return;

        const cachedScheduleSlots = readCachedScheduleSlots(
          user.programId,
          Number(selectedLevel),
          user.currentSemesterId,
        );

        if (cachedScheduleSlots.length > 0) {
          setCourses(mapScheduleSlotsToCourses(cachedScheduleSlots, Number(selectedLevel)));
          return;
        }

        setCourses([]);

        if (!isKnownScheduleLoadSyncError(error)) {
          toast.error(error instanceof Error ? error.message : 'Failed to load student schedule');
        }
      } finally {
        if (isMounted) setIsLoadingCourses(false);
      }
    };

    void loadSchedule();

    return () => {
      isMounted = false;
    };
  }, [isLevelResolved, selectedLevel, user.role, user.programId, user.currentSemesterId]);

  // ── Business logic (all preserved) ────────────────────────────────────────
  const isSessionAdded = (sessionId: string) =>
    selectedSessions.some(s => s.sessionId === sessionId);

  const getAvailableSeats = (sessionId: string, def: number) =>
    sessionSeats[sessionId] ?? def;

  const getTotalCreditHours = () => {
    const unique = new Set(selectedSessions.map(s => s.courseId));
    return Array.from(unique).reduce((sum, courseId) => {
      const s = selectedSessions.find(x => x.courseId === courseId);
      return sum + (s?.creditHours ?? 0);
    }, 0);
  };

  const hasTimeConflict = (session: CourseSession) => {
    const newStart = parse12HourToMinutes(session.timeFrom);
    const newEnd = parse12HourToMinutes(session.timeTo);
    if (newStart === null || newEnd === null || newEnd <= newStart) return false;

    return selectedSessions.some(sel => {
      if (sel.day !== session.day) return false;
      const selectedStart = parse12HourToMinutes(sel.timeFrom);
      const selectedEnd = parse12HourToMinutes(sel.timeTo);
      if (selectedStart === null || selectedEnd === null || selectedEnd <= selectedStart) return false;
      return sessionsOverlap(newStart, newEnd, selectedStart, selectedEnd);
    });
  };

  const hasConflictInTimetable = (sessionId: string) => {
    const session = selectedSessions.find(s => s.sessionId === sessionId);
    if (!session) return false;

    const currentStart = parse12HourToMinutes(session.timeFrom);
    const currentEnd = parse12HourToMinutes(session.timeTo);
    if (currentStart === null || currentEnd === null || currentEnd <= currentStart) return false;

    return selectedSessions.some(other => {
      if (other.sessionId === sessionId || other.day !== session.day) return false;
      const otherStart = parse12HourToMinutes(other.timeFrom);
      const otherEnd = parse12HourToMinutes(other.timeTo);
      if (otherStart === null || otherEnd === null || otherEnd <= otherStart) return false;
      return sessionsOverlap(currentStart, currentEnd, otherStart, otherEnd);
    });
  };

  const showRowError = (sessionId: string, msg: string) => {
    setRowErrors(prev => ({ ...prev, [sessionId]: msg }));
    setTimeout(() => setRowErrors(prev => {
      const n = { ...prev }; delete n[sessionId]; return n;
    }), 3200);
  };

  const addSession = (course: Course, session: CourseSession) => {
    if (isSessionAdded(session.sessionId)) return;
    const seats = getAvailableSeats(session.sessionId, session.availableSeats);
    if (seats <= 0) { showRowError(session.sessionId, 'No seats available'); return; }
    if (hasTimeConflict(session)) { showRowError(session.sessionId, 'Time conflict!'); return; }
    if (getTotalCreditHours() + course.creditHours > MAX_CREDIT_HOURS) {
      showRowError(session.sessionId, `Exceeds ${MAX_CREDIT_HOURS} hr limit`); return;
    }
    setSelectedSessions(prev => [
      ...prev,
      { ...session, courseId: course.id, courseName: course.name, courseCode: course.code, creditHours: course.creditHours, addedAt: new Date() },
    ]);
    setSessionSeats(prev => ({ ...prev, [session.sessionId]: seats - 1 }));
    toast.success(`✓ ${course.code || course.name || 'Course'} added to timetable`);
  };

  const removeSession = (sessionId: string) => {
    const session = selectedSessions.find(s => s.sessionId === sessionId);
    if (!session) return;
    setSelectedSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    if (sessionSeats[sessionId] !== undefined)
      setSessionSeats(prev => ({ ...prev, [sessionId]: prev[sessionId] + 1 }));
    toast.success('Session removed from timetable');
  };

  const submitRegistration = async () => {
    if (selectedSessions.length === 0) {
      toast.error('Please select at least one course session');
      return;
    }

    try {
      setIsSubmittingRegistration(true);
      const submittedSessions = [...selectedSessions];

      const enrollmentData = {
        scheduleSlots: submittedSessions.map((session) => {
          const slot = session.rawSlot;
            // slot.id is the ScheduleSlotContext ID (required by backend worker)
            const contextId = slot.id;

          return {
              id: contextId,
            start_time: buildIsoDateTime(slot.startTime),
            end_time: buildIsoDateTime(slot.endTime, slot.endTime <= slot.startTime ? 1 : 0),
            type: slot.type,
            course: {
              id: slot.course.id,
              code: slot.course.code || session.courseCode || session.courseName,
              name: slot.course.name || session.courseName,
              credits: slot.course.credits ?? session.creditHours,
            },
            teacher: {
              id: slot.teacher.id,
              name: slot.teacher.name,
            },
            classroom: {
              id: slot.classroom.id,
              label: slot.classroom.label,
              capacity: slot.classroom.capacity ?? 1,
            },
          };
        }),
      };

      const response = await EnrollmentService.submitEnrollment(enrollmentData);

      let finalStatus = await EnrollmentService.getEnrollmentStatus(response.jobId);

      toast.success(response.message || 'Registration submitted. Your enrollment is being processed.');

      for (let attempt = 0; attempt < ENROLLMENT_MAX_POLLS && !finalStatus.isCompleted; attempt += 1) {
        await delay(ENROLLMENT_POLL_DELAY_MS);
        finalStatus = await EnrollmentService.getEnrollmentStatus(response.jobId);
      }

      if (!finalStatus.isCompleted) {
        toast.warning('Registration is still processing. Please refresh in a moment to see the final result.');
        return;
      }

      const result = finalStatus.result;

      if (finalStatus.hasError || result?.error) {
        toast.error(result?.error || 'Registration could not be completed.');
        return;
      }

      const enrolledSessions = (result?.slots || []).filter((slot) => slot.status === 'enrolled');
      const failedSessions = (result?.slots || []).filter((slot) => slot.status === 'failed');
      const enrolledSlotIds = new Set(enrolledSessions.map((slot) => slot.slotId));
      const enrolledCredits = getEnrollmentCredits(submittedSessions, enrolledSlotIds);

      if (enrolledSlotIds.size > 0) {
        setSelectedSessions((currentSessions) =>
          currentSessions.filter((session) => !enrolledSlotIds.has(getPhysicalSlotId(session)))
        );
      }

      setSessionSeats({});

      if (enrolledSessions.length > 0 && failedSessions.length === 0) {
        toast.success(`Registration completed - ${enrolledCredits} credit hours enrolled`);
        return;
      }

      if (enrolledSessions.length > 0) {
        toast.warning(
          `Registration completed with issues - ${enrolledCredits} credit hours enrolled. ${getFailedEnrollmentMessage(failedSessions)}`
        );
        return;
      }

      toast.error(getFailedEnrollmentMessage(failedSessions));
      return;

      /*
      // Unreachable legacy toast removed by the async job flow above.
        response.message || `✓ Registration submitted — ${response.totalCredits} credit hours enrolled`
      );
      */
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit enrollment';
      toast.error(errorMessage);
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  const getCoursesForLevel = (level: number) => courses.filter(c => c.level === level);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalCredits = getTotalCreditHours();
  const uniqueCourseCount = new Set(selectedSessions.map(s => s.courseId)).size;
  const creditPct = Math.min((totalCredits / MAX_CREDIT_HOURS) * 100, 100);
  const creditBarColor = creditPct >= 100 ? '#ef4444' : creditPct >= 75 ? '#f59e0b' : '#10b981';

  // ── Timetable dims ────────────────────────────────────────────────────────
  const defaultStartMinutes = parse12HourToMinutes(timeSlots[0]) ?? 8 * 60;
  const defaultEndMinutes = parse12HourToMinutes(timeSlots[timeSlots.length - 1]) ?? 18 * 60;

  const sessionRanges = selectedSessions
    .map((session) => {
      const start = parse12HourToMinutes(session.timeFrom);
      const end = parse12HourToMinutes(session.timeTo);
      if (start === null || end === null || end <= start) return null;
      return { start, end };
    })
    .filter((range): range is { start: number; end: number } => range !== null);

  const minSessionStart = sessionRanges.length > 0 ? Math.min(...sessionRanges.map((range) => range.start)) : defaultStartMinutes;
  const maxSessionEnd = sessionRanges.length > 0 ? Math.max(...sessionRanges.map((range) => range.end)) : defaultEndMinutes;

  const timetableStartMinutes = Math.min(defaultStartMinutes, Math.floor(minSessionStart / 60) * 60);
  const timetableEndMinutes = Math.max(defaultEndMinutes, Math.ceil(maxSessionEnd / 60) * 60);
  const totalSlots = Math.max(Math.ceil((timetableEndMinutes - timetableStartMinutes) / 60), 1);
  const totalTimeWidth = totalSlots * SLOT_W;
  const timelineHeaders = Array.from({ length: totalSlots }, (_, index) =>
    formatMinutesTo12Hour(timetableStartMinutes + index * 60)
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PANEL: course table
  // ══════════════════════════════════════════════════════════════════════════
  const renderCourseTable = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#fff' }}>

      {/* Level tabs — sticky within panel */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20, flexShrink: 0,
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: 2, padding: '8px 12px 0',
      }}>
        {[1, 2, 3, 4].map(level => (
          <button
            key={level}
            onClick={() => setSelectedLevel(String(level))}
            style={{
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: selectedLevel === String(level) ? 600 : 500,
              borderBottom: selectedLevel === String(level) ? '2px solid #2563eb' : '2px solid transparent',
              color: selectedLevel === String(level) ? '#2563eb' : '#64748b',
              background: selectedLevel === String(level) ? '#eff6ff' : 'transparent',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Level {level}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8', paddingBottom: 4, paddingRight: 4 }}>
          {getCoursesForLevel(Number(selectedLevel)).length} course{getCoursesForLevel(Number(selectedLevel)).length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Scrollable table area */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <table style={{ borderCollapse: 'collapse', minWidth: 980, width: '100%' }}>

          {/* Sticky table header — sits below the tabs (tabs are ~45px) */}
          <thead>
            <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc' }}>
              {[
                { label: 'Code', w: 80, align: 'left' },
                { label: 'Course Name', w: 150, align: 'left' },
                { label: 'Type', w: 112, align: 'left' },
                { label: 'Cr.', w: 44, align: 'center' },
                { label: 'Fail', w: 44, align: 'center' },
                { label: 'Lecturer', w: 130, align: 'left' },
                { label: 'Content', w: 70, align: 'left' },
                { label: 'Day', w: 72, align: 'left' },
                { label: 'Time', w: 126, align: 'left' },
                { label: 'Room', w: 70, align: 'left' },
                { label: 'Seats', w: 48, align: 'center' },
              ].map(col => (
                <th
                  key={col.label}
                  style={{
                    width: col.w, minWidth: col.w,
                    padding: '8px 10px',
                    fontSize: 11, fontWeight: 600, color: '#475569',
                    textAlign: col.align as 'left' | 'center',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </th>
              ))}
              {/* Sticky action column header */}
              <th
                style={{
                  position: 'sticky', right: 0, zIndex: 15,
                  width: 60, minWidth: 60,
                  padding: '8px 8px',
                  fontSize: 11, fontWeight: 600, color: '#475569',
                  textAlign: 'center',
                  background: '#f1f5f9',
                  borderBottom: '1px solid #e2e8f0',
                  borderLeft: '1px solid #e2e8f0',
                  boxShadow: '-4px 0 8px -4px rgba(0,0,0,0.10)',
                  whiteSpace: 'nowrap',
                }}
              >
                Add
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoadingCourses ? (
              <tr>
                <td colSpan={12} style={{ padding: '18px 12px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                  Loading stored schedule...
                </td>
              </tr>
            ) : getCoursesForLevel(Number(selectedLevel)).length === 0 ? (
              <tr>
                <td colSpan={12} style={{ padding: '18px 12px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                  No stored schedule found for this level.
                </td>
              </tr>
            ) : getCoursesForLevel(Number(selectedLevel)).map(course =>
              course.sessions.map((session, si) => {
                const isAdded = isSessionAdded(session.sessionId);
                const seats = getAvailableSeats(session.sessionId, session.availableSeats);
                const conflict = !isAdded && hasTimeConflict(session);
                const noSeats = seats === 0;
                const error = rowErrors[session.sessionId];

                const rowBg = isAdded
                  ? '#f0fdf4'
                  : si % 2 === 0 ? '#ffffff' : '#fafafa';

                return (
                  <tr
                    key={session.sessionId}
                    style={{
                      background: rowBg,
                      borderTop: si === 0 ? '2px solid #e2e8f0' : '1px solid #f1f5f9',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = isAdded ? '#dcfce7' : '#eff6ff';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = rowBg;
                    }}
                  >
                    {/* Code */}
                    <td style={{ padding: '6px 10px', width: 80 }}>
                      {si === 0 && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {course.code}
                        </span>
                      )}
                    </td>

                    {/* Name */}
                    <td style={{ padding: '6px 10px', width: 150 }}>
                      {si === 0 && (
                        <span title={course.name} style={{ fontSize: 12, color: '#334155', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 144 }}>
                          {course.name}
                        </span>
                      )}
                    </td>

                    {/* Type */}
                    <td style={{ padding: '6px 10px', width: 112 }}>
                      {si === 0 && (
                        <Badge className={`${TYPE_COLOR[course.type] ?? 'bg-gray-100 text-gray-700 border-gray-200'} border whitespace-nowrap`}
                          style={{ fontSize: 10, padding: '1px 5px' }}>
                          {TYPE_SHORT[course.type] ?? course.type}
                        </Badge>
                      )}
                    </td>

                    {/* Credits */}
                    <td style={{ padding: '6px 10px', width: 44, textAlign: 'center' }}>
                      {si === 0 && <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{course.creditHours}</span>}
                    </td>

                    {/* Failures */}
                    <td style={{ padding: '6px 10px', width: 44, textAlign: 'center' }}>
                      {si === 0 && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: course.failureTimes > 0 ? '#dc2626' : '#94a3b8' }}>
                          {course.failureTimes}
                        </span>
                      )}
                    </td>

                    {/* Lecturer */}
                    <td style={{ padding: '6px 10px', width: 130 }}>
                      <span title={session.lecturer} style={{ fontSize: 11, color: '#475569', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 124 }}>
                        {session.lecturer}
                      </span>
                    </td>

                    {/* Content */}
                    <td style={{ padding: '6px 10px', width: 70 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {session.content.map(c => (
                          <Badge key={c} variant="outline" style={{ fontSize: 10, padding: '0 4px', whiteSpace: 'nowrap', color: '#64748b', borderColor: '#cbd5e1' }}>
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </td>

                    {/* Day */}
                    <td style={{ padding: '6px 10px', width: 72 }}>
                      <span style={{ fontSize: 12, color: '#475569' }}>{session.day.slice(0, 3)}</span>
                    </td>

                    {/* Time */}
                    <td style={{ padding: '6px 10px', width: 126 }}>
                      <span style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap' }}>
                        {session.timeFrom}–{session.timeTo}
                      </span>
                    </td>

                    {/* Room */}
                    <td style={{ padding: '6px 10px', width: 70 }}>
                      <span title={session.room} style={{ fontSize: 11, color: '#475569', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 66 }}>
                        {session.room}
                      </span>
                    </td>

                    {/* Seats */}
                    <td style={{ padding: '6px 10px', width: 48, textAlign: 'center' }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: noSeats ? '#dc2626' : seats < 5 ? '#ea580c' : '#16a34a',
                      }}>
                        {seats}
                      </span>
                    </td>

                    {/* Action — sticky right */}
                    <td style={{
                      position: 'sticky', right: 0, zIndex: 5,
                      padding: '6px 8px', width: 60,
                      textAlign: 'center',
                      background: isAdded ? '#dcfce7' : rowBg,
                      borderLeft: '1px solid #e2e8f0',
                      boxShadow: '-4px 0 8px -4px rgba(0,0,0,0.08)',
                    }}>
                      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isAdded ? (
                          <button
                            onClick={() => removeSession(session.sessionId)}
                            title="Added — click to remove"
                            style={{
                              width: 28, height: 28, borderRadius: 6,
                              background: '#dcfce7', border: '1px solid #86efac', color: '#16a34a',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.15s',
                            }}
                          >
                            <Check style={{ width: 14, height: 14 }} />
                          </button>
                        ) : (
                          <button
                            onClick={() => addSession(course, session)}
                            disabled={noSeats || conflict}
                            title={conflict ? 'Time conflict' : noSeats ? 'No seats' : 'Add to timetable'}
                            style={{
                              width: 28, height: 28, borderRadius: 6,
                              background: error ? '#fef2f2' : noSeats || conflict ? '#f8fafc' : '#fff',
                              border: `1px solid ${error ? '#f87171' : noSeats || conflict ? '#e2e8f0' : '#cbd5e1'}`,
                              color: error ? '#dc2626' : noSeats || conflict ? '#94a3b8' : '#64748b',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: noSeats || conflict ? 'not-allowed' : 'pointer',
                              transition: 'all 0.15s',
                              opacity: noSeats || conflict ? 0.5 : 1,
                            }}
                          >
                            <Plus style={{ width: 14, height: 14 }} />
                          </button>
                        )}

                        {/* Inline error tooltip */}
                        {error && (
                          <div style={{
                            position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)',
                            marginRight: 6, zIndex: 50, pointerEvents: 'none',
                            background: '#dc2626', color: '#fff',
                            fontSize: 11, padding: '4px 8px', borderRadius: 6,
                            whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}>
                            <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} />
                            {error}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PANEL: horizontal timetable
  // ══════════════════════════════════════════════════════════════════════════
  const renderTimetable = () => {
    const hasSessions = selectedSessions.length > 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#fff' }}>
        {/* Panel header */}
        <div style={{
          flexShrink: 0, padding: '8px 14px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #1e40af, #4338ca)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <CalendarDays style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.75)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Live Timetable</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Click a block to remove</span>
        </div>

        {!hasSessions ? (
          /* Empty state */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#eff6ff', border: '2px dashed #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays style={{ width: 30, height: 30, color: '#93c5fd' }} />
            </div>
            <p style={{ color: '#94a3b8', fontSize: 13, maxWidth: 200, lineHeight: 1.5 }}>
              Your timetable is empty. Add course sessions from the left panel.
            </p>
          </div>
        ) : (
          /* Scrollable timetable */
          <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            <div style={{ minWidth: DAY_W + totalTimeWidth + 1 }}>

              {/* Sticky time-header row */}
              <div style={{
                position: 'sticky', top: 0, zIndex: 20,
                display: 'flex', borderBottom: '2px solid #cbd5e1', background: '#f8fafc',
              }}>
                {/* Corner cell — also sticky left */}
                <div style={{
                  position: 'sticky', left: 0, zIndex: 30,
                  width: DAY_W, minWidth: DAY_W, height: 34,
                  background: '#f1f5f9', borderRight: '2px solid #cbd5e1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textAlign: 'center', lineHeight: 1.2 }}>Day/Time</span>
                </div>

                {/* Hour label cells */}
                {timelineHeaders.map(time => (
                  <div
                    key={time}
                    style={{
                      width: SLOT_W, minWidth: SLOT_W, height: 34,
                      borderRight: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#f8fafc', flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#475569' }}>{shortTime(time)}</span>
                  </div>
                ))}
              </div>

              {/* Day rows */}
              {daysOfWeek.map((day, di) => {
                const daySessions = selectedSessions.filter(s => s.day === day);
                const rowBg = di % 2 === 1 ? '#f8fafc' : '#ffffff';

                return (
                  <div
                    key={day}
                    style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', height: 60, minHeight: 60, background: rowBg }}
                  >
                    {/* Sticky day label */}
                    <div style={{
                      position: 'sticky', left: 0, zIndex: 10,
                      width: DAY_W, minWidth: DAY_W,
                      flexShrink: 0, borderRight: '2px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: rowBg,
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', lineHeight: 1 }}>{day.slice(0, 3)}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>{day.slice(3)}</div>
                      </div>
                    </div>

                    {/* Slot area with absolutely positioned session blocks */}
                    <div style={{ position: 'relative', width: totalTimeWidth, minWidth: totalTimeWidth, flexShrink: 0 }}>
                      {/* Vertical grid lines */}
                      {timelineHeaders.map((_, i) => (
                        <div
                          key={i}
                          style={{
                            position: 'absolute', top: 0, bottom: 0,
                            left: i * SLOT_W, width: SLOT_W,
                            borderRight: '1px solid #f1f5f9',
                          }}
                        />
                      ))}

                      {/* Session blocks */}
                      {daySessions.map(session => {
                        const start = parse12HourToMinutes(session.timeFrom);
                        const end = parse12HourToMinutes(session.timeTo);
                        if (start === null || end === null || end <= start) return null;

                        const clampedStart = Math.max(start, timetableStartMinutes);
                        const clampedEnd = Math.min(end, timetableEndMinutes);
                        if (clampedEnd <= clampedStart) return null;

                        const leftPx = ((clampedStart - timetableStartMinutes) / 60) * SLOT_W + 2;
                        const widthPx = Math.max(((clampedEnd - clampedStart) / 60) * SLOT_W - 4, 8);
                        const conflict = hasConflictInTimetable(session.sessionId);
                        const color = courseColor(session.courseId);

                        return (
                          <div
                            key={session.sessionId}
                            onClick={() => removeSession(session.sessionId)}
                            title={`${session.courseCode} • ${session.timeFrom}–${session.timeTo} • ${session.room}\nClick to remove`}
                            style={{
                              position: 'absolute',
                              top: 5, bottom: 5,
                              left: leftPx, width: widthPx,
                              borderRadius: 8,
                              background: color,
                              color: '#fff',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              boxShadow: conflict
                                ? `0 0 0 2px #ef4444, 0 2px 6px rgba(0,0,0,0.15)`
                                : '0 1px 4px rgba(0,0,0,0.12)',
                              transition: 'all 0.15s',
                              userSelect: 'none',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.opacity = '0.85';
                              (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.opacity = '1';
                              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                            }}
                          >
                            <div style={{ padding: '4px 7px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1, overflow: 'hidden' }}>
                              <p style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                                {session.courseCode}
                              </p>
                              {widthPx > 100 && (
                                <p style={{ fontSize: 10, lineHeight: 1.2, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                                  {session.room}
                                </p>
                              )}
                              {conflict && (
                                <p style={{ fontSize: 10, fontWeight: 700, color: '#fca5a5', margin: 0 }}>⚠ Conflict</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // TOP STATS STRIP
  // ══════════════════════════════════════════════════════════════════════════
  const renderStatsStrip = () => (
    <div style={{
      flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 14px',
      background: 'linear-gradient(135deg, #1e293b, #1e3a5f)',
      borderBottom: '1px solid #334155',
    }}>
      {/* Icon + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
        <BookOpen style={{ width: 15, height: 15, color: '#93c5fd' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>Academic Registration</span>
      </div>

      <div style={{ width: 1, height: 18, background: '#334155', flexShrink: 0 }} />

      {/* Courses count */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 10px', flexShrink: 0,
      }}>
        <CheckCircle2 style={{ width: 13, height: 13, color: '#4ade80' }} />
        <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>Courses:</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{uniqueCourseCount}</span>
      </div>

      {/* Credit hour progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, maxWidth: 280 }}>
        <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>Credit Hrs:</span>
        <div style={{ flex: 1, height: 16, background: 'rgba(255,255,255,0.12)', borderRadius: 99, overflow: 'hidden', position: 'relative', minWidth: 0 }}>
          <div style={{
            height: '100%', borderRadius: 99, transition: 'width 0.3s, background-color 0.3s',
            width: `${creditPct}%`, background: creditBarColor,
          }} />
          <span style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}>
            {totalCredits} / {MAX_CREDIT_HOURS}
          </span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: creditBarColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {Math.round(creditPct)}%
        </span>
      </div>

      {/* Mobile view switcher — only when NOT in split view */}
      {!isSplit && (
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'rgba(255,255,255,0.10)', borderRadius: 8, padding: 2, gap: 2, flexShrink: 0,
        }}>
          {(['courses', 'timetable'] as const).map(view => (
            <button
              key={view}
              onClick={() => setMobileView(view)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                background: mobileView === view ? '#fff' : 'transparent',
                color: mobileView === view ? '#1e293b' : '#94a3b8',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {view === 'courses' ? <List style={{ width: 13, height: 13 }} /> : <Calendar style={{ width: 13, height: 13 }} />}
              <span style={{ textTransform: 'capitalize' }}>{view === 'courses' ? 'Courses' : 'Timetable'}</span>
              {view === 'timetable' && selectedSessions.length > 0 && (
                <span style={{
                  background: '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 700,
                  borderRadius: 99, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {selectedSessions.length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Submit button */}
      <Button
        onClick={submitRegistration}
        disabled={selectedSessions.length === 0 || isSubmittingRegistration}
        style={{ flexShrink: 0, marginLeft: isSplit ? 'auto' : 0 }}
        className="bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white border-0 gap-1.5 h-8 text-xs font-semibold shadow-lg"
      >
        <SendHorizonal style={{ width: 14, height: 14, opacity: isSubmittingRegistration ? 0.6 : 1 }} />
        <span>{isSubmittingRegistration ? 'Submitting...' : 'Submit Registration'}</span>
      </Button>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 160px)',
        minHeight: 480,
        overflow: 'hidden',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        background: '#fff',
      }}
    >
      {/* ── TOP STATS STRIP ─────────────────────────────────────── */}
      {renderStatsStrip()}

      {isSplit ? (
        /* ── DESKTOP SPLIT VIEW ───────────────────────────────── */
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left: 58% */}
          <div style={{ width: '58%', borderRight: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {renderCourseTable()}
          </div>
          {/* Right: 42% */}
          <div style={{ width: '42%', overflow: 'hidden' }}>
            {renderTimetable()}
          </div>
        </div>
      ) : (
        /* ── MOBILE STACKED VIEW ──────────────────────────────── */
        <>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {mobileView === 'courses' ? renderCourseTable() : renderTimetable()}
          </div>

          {/* Floating bottom bar when sessions exist */}
          {selectedSessions.length > 0 && (
            <div style={{
              flexShrink: 0, borderTop: '1px solid #e2e8f0',
              background: '#fff', padding: '10px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {uniqueCourseCount} course{uniqueCourseCount !== 1 ? 's' : ''} · {totalCredits} credit hrs
              </span>
              <Button
                onClick={submitRegistration}
                disabled={isSubmittingRegistration}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs gap-1.5 h-8"
              >
                <SendHorizonal style={{ width: 13, height: 13, opacity: isSubmittingRegistration ? 0.6 : 1 }} />
                {isSubmittingRegistration ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
