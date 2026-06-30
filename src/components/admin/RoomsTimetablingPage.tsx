import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "../ui/modal";
import { SearchableSelect } from "../ui/searchable-select";
import {
  Plus,
  Calendar,
  Clock,
  Users,
  Edit,
  X,
  Settings,
  School,
  Move,
  ChevronRight,
  BookOpen,
  FlaskConical,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Building2,
  Layers,
  GripVertical,
  LayoutGrid,
  Loader2,
  Save,
  Download,
  FileText,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { escapeHtml } from "../../utils/html";
import {
  ScheduleService,
  EnrollmentWindowService,
  FacultyService,
  ProgramService,
  type DayOfWeek,
  type EnrollmentWindowRecord,
  type Faculty,
  type Program,
  type TimetableClassroomLookup,
  type TimetableCourseLookup,
  type TimetableStaffLookup,
  TimetableSaveLevelInput,
} from "../../api";
import {
  GetScheduleResponse,
  SlotType,
  TimetableSaveResult,
  TimetableSaveSessionInput,
} from "src/api/types/schedule";

// ─────────────────────────────────────────────────────────────────────────────
//  INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface ScheduledClass {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  type: SlotType;
  allowedCapacity: number;

  courseId: number;
  courseCode: string;
  courseName: string;

  instructorId: number;
  instructorName: string;

  classroomId: number;
  roomLabel: string;

  learningGroupId: number | null;
}

interface RoomsTimetablingPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

interface DayRange {
  startTime: string;
  endTime: string;
  enabled: boolean;
}

interface TimePeriod {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
const DAY_ABBR: Record<string, string> = {
  Saturday: "Sat",
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
};

const SLOT_INTERVAL = 30;

const DEFAULT_PERIODS: TimePeriod[] = [
  { id: "p1", label: "Period 1", startTime: "09:00", endTime: "10:40" },
  { id: "p2", label: "Period 2", startTime: "11:00", endTime: "12:40" },
  { id: "p3", label: "Period 3", startTime: "13:00", endTime: "14:40" },
  { id: "p4", label: "Period 4", startTime: "15:00", endTime: "16:40" },
];

const DEFAULT_DAY_RANGES: Record<string, DayRange> = {
  Saturday: { startTime: "08:00", endTime: "16:00", enabled: true },
  Sunday: { startTime: "08:00", endTime: "16:00", enabled: true },
  Monday: { startTime: "08:00", endTime: "16:00", enabled: true },
  Tuesday: { startTime: "08:00", endTime: "16:00", enabled: true },
  Wednesday: { startTime: "08:00", endTime: "16:00", enabled: true },
  Thursday: { startTime: "08:00", endTime: "16:00", enabled: true },
  Friday: { startTime: "08:00", endTime: "12:00", enabled: false },
};

// ─────────────────────────────────────────────────────────────────────────────
//  CLASS-TYPE COLORS
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    header: string;
    pdfBg: [number, number, number];
    pdfHeader: [number, number, number];
    pdfText: [number, number, number];
  }
> = {
  lecture: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-300",
    header: "bg-blue-500",
    pdfBg: [219, 234, 254],
    pdfHeader: [59, 130, 246],
    pdfText: [30, 64, 175],
  },
  lab: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
    header: "bg-emerald-500",
    pdfBg: [209, 250, 229],
    pdfHeader: [16, 185, 129],
    pdfText: [6, 95, 70],
  },
  tutorial: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    header: "bg-amber-500",
    pdfBg: [254, 243, 199],
    pdfHeader: [245, 158, 11],
    pdfText: [120, 53, 15],
  },
  seminar: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-300",
    header: "bg-purple-500",
    pdfBg: [243, 232, 255],
    pdfHeader: [168, 85, 247],
    pdfText: [88, 28, 135],
  },
};

const getColors = (type: string) =>
  TYPE_COLORS[type.toLowerCase()] ?? TYPE_COLORS.lecture;

const toRgb = ([r, g, b]: [number, number, number]) => `rgb(${r}, ${g}, ${b})`;

const getPdfColors = (type: string) => {
  const c = TYPE_COLORS[type.toLowerCase()] ?? TYPE_COLORS.lecture;
  return {
    bg: toRgb(c.pdfBg),
    header: toRgb(c.pdfHeader),
    text: toRgb(c.pdfText),
    borderAccent: toRgb([
      Math.max(0, c.pdfHeader[0] - 20),
      Math.max(0, c.pdfHeader[1] - 20),
      Math.max(0, c.pdfHeader[2] - 20),
    ]),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
const minutesToTime = (min: number) => {
  const h = Math.floor(min / 60),
    m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};
const fmt12 = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${dh}:${m.toString().padStart(2, "0")} ${period}`;
};
const getTypeIcon = (type: string) => {
  if (type.toLowerCase() === "lab")
    return <FlaskConical className="w-3 h-3 flex-shrink-0" />;
  if (type.toLowerCase() === "tutorial")
    return <BookOpen className="w-3 h-3 flex-shrink-0" />;
  if (type.toLowerCase() === "seminar")
    return <Monitor className="w-3 h-3 flex-shrink-0" />;
  return <BookOpen className="w-3 h-3 flex-shrink-0" />;
};

const deepCopy = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

const toDisplayCode = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 4)
    .join("");

const levelLabel = (level: number) => `Level ${level}`;

const classroomToClassType = (
  type: TimetableClassroomLookup["type"] | string,
): SlotType => {
  if (type === "Hall") return "Lecture";
  if (type === "Auditorium") return "Lecture";
  if (type === "Lab") return "Lab";
  if (type === "Other") return "Tutorial";
  return "Lecture";
};

const makeDefaultForm = () => ({
  day: "Sunday" as DayOfWeek,
  startTime: "09:00",
  endTime: "10:30",
  courseId: "",
  classType: "Lecture" as SlotType,
  teacherId: "",
  classroomId: "",
  allowedCapacity: "",
});

const parseAllowedCapacity = (value: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const toDateTimeLocalValue = (value: string | Date | null | undefined) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const toIsoFromDateTimeLocal = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

const makeDefaultEnrollmentWindowForm = (name = "Student registration window") => {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const end = new Date(now);
  end.setDate(end.getDate() + 7);

  return {
    name,
    startTime: toDateTimeLocalValue(now),
    endTime: toDateTimeLocalValue(end),
    isActive: true,
  };
};

/** Returns which period a class belongs to — whichever period has the most overlap */
function classifyPeriod(
  cls: { startTime: string; endTime: string },
  periods: TimePeriod[],
): string | null {
  const s = timeToMinutes(cls.startTime);
  const e = timeToMinutes(cls.endTime);
  let bestId: string | null = null;
  let bestOverlap = -1;
  for (const p of periods) {
    const ps = timeToMinutes(p.startTime);
    const pe = timeToMinutes(p.endTime);
    const overlap = Math.max(0, Math.min(e, pe) - Math.max(s, ps));
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      bestId = p.id;
    }
  }
  if (bestOverlap === 0) {
    let minDist = Infinity;
    for (const p of periods) {
      const dist = Math.abs(timeToMinutes(p.startTime) - s);
      if (dist < minDist) {
        minDist = dist;
        bestId = p.id;
      }
    }
  }
  return bestId;
}

function mapScheduleResponseToClasses(
  data: GetScheduleResponse,
): ScheduledClass[] {
  return data.scheduleSlots.map((slot) => ({
    id: String(slot.id),
    day: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    type: slot.type,
    courseId: slot.course.id,
    courseCode: slot.course.code,
    courseName: slot.course.name,
    instructorId: slot.teacher.id,
    instructorName: slot.teacher.name,
    classroomId: slot.classroom.id,
    roomLabel: slot.classroom.label,
    allowedCapacity: slot.allowedCapacity ?? slot.classroom.capacity ?? 1,
    learningGroupId: slot.learningGroup?.id || null,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function RoomsTimetablingPage({
  selectedUniversity,
}: RoomsTimetablingPageProps) {
  // ── Filter
  const [selFacultyId, setSelFacultyId] = useState("");
  const [selProgramId, setSelProgramId] = useState("");
  const [selLevelId, setSelLevelId] = useState("");

  // ── Time ranges & periods (now inline-editable in the timetable)
  const [dayRanges, setDayRanges] = useState<Record<string, DayRange>>(
    deepCopy(DEFAULT_DAY_RANGES),
  );
  const [periods, setPeriods] = useState<TimePeriod[]>(DEFAULT_PERIODS);

  // Inline editing state for periods
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);

  // ── Zoom state for timetable grid
  const [zoomLevel, setZoomLevel] = useState(1);
  const MIN_ZOOM = 0.4;
  const MAX_ZOOM = 1;
  const ZOOM_STEP = 0.1;
  const zoomIn = () => setZoomLevel((z) => Math.min(+(z + ZOOM_STEP).toFixed(1), MAX_ZOOM));
  const zoomOut = () => setZoomLevel((z) => Math.max(+(z - ZOOM_STEP).toFixed(1), MIN_ZOOM));
  const zoomReset = () => setZoomLevel(1);
  const zoomPercent = Math.round(zoomLevel * 100);

  // ── API data
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [lookupCourses, setLookupCourses] = useState<TimetableCourseLookup[]>([]);
  const [lookupClassrooms, setLookupClassrooms] = useState<TimetableClassroomLookup[]>([]);
  const [lookupStaff, setLookupStaff] = useState<TimetableStaffLookup[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<number | null>(null);
  const [isLoadingLookups, setIsLoadingLookups] = useState(false);
  const [isLoadingTimetable, setIsLoadingTimetable] = useState(false);
  const [isSavingTimetable, setIsSavingTimetable] = useState(false);

  // ── Draft / Save system
  const [savedClasses, setSavedClasses] = useState<ScheduledClass[]>([]);
  const [draftClasses, setDraftClasses] = useState<ScheduledClass[]>([]);

  const hasChanges = useMemo(
    () => JSON.stringify(savedClasses) !== JSON.stringify(draftClasses),
    [savedClasses, draftClasses],
  );

  const changeCount = useMemo(() => {
    const savedIds = new Set(savedClasses.map((c) => c.id));
    const draftIds = new Set(draftClasses.map((c) => c.id));
    const added = draftClasses.filter((c) => !savedIds.has(c.id)).length;
    const removed = savedClasses.filter((c) => !draftIds.has(c.id)).length;
    const modified = draftClasses.filter((c) => {
      const s = savedClasses.find((x) => x.id === c.id);
      return s && JSON.stringify(s) !== JSON.stringify(c);
    }).length;
    return added + removed + modified;
  }, [savedClasses, draftClasses]);

  const [, forceUpdate] = useState(0);

  const handleSave = async () => {
    if (!activeSemesterId || !selProgramId || !selLevelId) {
      toast.error("Please select program, level, and semester.");
      return;
    }
    try {
      setIsSavingTimetable(true);
      const payload: TimetableSaveLevelInput = {
        programId: Number(selProgramId),
        academicLevel: Number(selLevelId),
        scheduleSlots: draftClasses.map((item) => {
          const normalizedType = (item.type.charAt(0).toUpperCase() +
            item.type.slice(1).toLowerCase()) as SlotType;
          const formatAsIso = (timeStr: string) =>
            `2000-01-01T${timeStr}:00.000Z`;
          return {
            id: String(item.id).startsWith("temp-")
              ? undefined
              : Number(item.id),
            courseId: item.courseId,
            teacherId: item.instructorId,
            classroomId: item.classroomId,
            allowedCapacity: item.allowedCapacity,
            allowedCpacity: item.allowedCapacity,
            allowed_capacity: item.allowedCapacity,
            learningGroupId: item.learningGroupId,
            teacherName: item.instructorName,
            classroomName: item.roomLabel,
            dayOfWeek: item.day,
            startTime: formatAsIso(item.startTime),
            endTime: formatAsIso(item.endTime),
            type: normalizedType,
          };
        }),
      };
      const result: TimetableSaveResult = await ScheduleService.saveSchedule(
        payload,
        activeSemesterId,
      );
      const extractTime = (isoString: string) => {
        const parts = isoString.split("T");
        return parts.length > 1 ? parts[1].substring(0, 5) : isoString;
      };
      const syncedClasses: ScheduledClass[] = result.scheduleSlots.map(
        (slot) => ({
          id: String(slot.id),
          day: slot.dayOfWeek,
          startTime: extractTime(slot.startTime),
          endTime: extractTime(slot.endTime),
          type: slot.type,
          courseId: slot.course.id,
          courseCode: slot.course.code,
          courseName: slot.course.name,
          instructorId: slot.teacher.id,
          instructorName: slot.teacher.name,
          classroomId: slot.classroom.id,
          roomLabel: slot.classroom.label,
          allowedCapacity: slot.allowedCapacity ?? 1,
          learningGroupId: slot.learningGroup?.id || null,
        }),
      );
      setSavedClasses(syncedClasses);
      setDraftClasses(deepCopy(syncedClasses));
      toast.success("Timetable saved successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save timetable");
    } finally {
      setIsSavingTimetable(false);
    }
  };

  const handleDiscard = () => {
    setDraftClasses(deepCopy(savedClasses));
    toast.info("Changes discarded — reverted to last saved state");
    forceUpdate((x) => x + 1);
  };

  // ── Modal
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ScheduledClass | null>(null);
  const [formData, setFormData] = useState(makeDefaultForm());
  const [allowedCapacityTouched, setAllowedCapacityTouched] = useState(false);

  // ── Export modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<"current" | "all">("current");
  const [isExporting, setIsExporting] = useState(false);

  // Enrollment registration window
  const [enrollmentWindow, setEnrollmentWindow] = useState<EnrollmentWindowRecord | null>(null);
  const [enrollmentWindowForm, setEnrollmentWindowForm] = useState(makeDefaultEnrollmentWindowForm);
  const [isLoadingEnrollmentWindow, setIsLoadingEnrollmentWindow] = useState(false);
  const [isSavingEnrollmentWindow, setIsSavingEnrollmentWindow] = useState(false);

  // ── Drag & Drop — use refs to avoid stale closures
  const draggingIdRef = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const draftClassesRef = useRef<ScheduledClass[]>([]);
  draftClassesRef.current = draftClasses;

  // ── API hydration
  useEffect(() => {
    if (!selectedUniversity) return;
    const load = async () => {
      try {
        setIsLoadingLookups(true);
        const facultyData = await FacultyService.getAll();
        setFaculties(facultyData);

      } catch (error: any) {
        toast.error(error?.message || "Failed to load timetable lookups");
      } finally {
        setIsLoadingLookups(false);
      }
    };
    void load();
  }, [selectedUniversity]);

  useEffect(() => {
    if (!selectedUniversity) {
      setActiveSemesterId(null);
      return;
    }
    const read = () => {
      const raw = localStorage.getItem(`activeSemester:${selectedUniversity}`);
      const parsed = raw ? Number(raw) : NaN;
      setActiveSemesterId(Number.isFinite(parsed) ? parsed : null);
    };
    read();
    const interval = window.setInterval(read, 1000);
    return () => window.clearInterval(interval);
  }, [selectedUniversity]);

  // ── Load Programs when Faculty changes
  useEffect(() => {
    // If no faculty is selected, clear programs and return early
    if (!selFacultyId) {
      setPrograms([]);
      return;
    }

    const loadPrograms = async () => {
      try {
        setIsLoadingLookups(true); // Re-use lookup loader or create a specific one
        const programData = await ProgramService.getProgramsByFacultyId(Number(selFacultyId));
        setPrograms(programData);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load programs for this faculty");
      } finally {
        setIsLoadingLookups(false);
      }
    };

    void loadPrograms();
  }, [selFacultyId]); // Triggered whenever the faculty selection changes

  useEffect(() => {
    if (
      !selectedUniversity ||
      !selProgramId ||
      !selLevelId ||
      !activeSemesterId
    ) {
      setSavedClasses([]);
      setDraftClasses([]);
      setLookupCourses([]);
      setLookupClassrooms([]);
      setLookupStaff([]);
      return;
    }
    const loadTimetable = async () => {
      try {
        setIsLoadingTimetable(true);
        const data: GetScheduleResponse = await ScheduleService.getSchedule(
          Number(selProgramId),
          Number(selLevelId),
          activeSemesterId,
          selFacultyId ? Number(selFacultyId) : undefined,
        );
        setLookupCourses(data.lookups.courses);
        setLookupClassrooms(data.lookups.classrooms);
        setLookupStaff(data.lookups.staff);
        const mapped = mapScheduleResponseToClasses(data);
        setSavedClasses(mapped);
        setDraftClasses(deepCopy(mapped));
      } catch (error: any) {
        toast.error(error?.message || "Failed to load timetable");
      } finally {
        setIsLoadingTimetable(false);
      }
    };
    void loadTimetable();
  }, [selectedUniversity, selProgramId, selLevelId, activeSemesterId]);

  // ─────────────────────────────────────────────────────
  //  DERIVED
  // ─────────────────────────────────────────────────────

  const filteredPrograms = useMemo(() => {
    return programs;
  }, [programs]);

  const selProgram = useMemo(
    () => programs.find((p) => p.id == Number(selProgramId)),
    [programs, selProgramId],
  );

  const filteredLevels = useMemo(
    () => (selProgram?.levels ?? []).sort((a, b) => a.level - b.level),
    [selProgram],
  );

  const selLevel = useMemo(
    () => filteredLevels.find((l) => l.level === Number(selLevelId)),
    [filteredLevels, selLevelId],
  );

  const selectedProgramLevelId = useMemo(() => {
    const parsed = Number(selLevel?.id);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [selLevel]);

  const selectedWindowDefaultName = useMemo(() => {
    if (!selProgram || !selLevel) return "Student registration window";
    return `${selProgram.name} ${levelLabel(selLevel.level)} registration`;
  }, [selProgram, selLevel]);

  useEffect(() => {
    if (!selectedUniversity || !selFacultyId || !selProgramId || !selectedProgramLevelId || !activeSemesterId) {
      setEnrollmentWindow(null);
      setEnrollmentWindowForm(makeDefaultEnrollmentWindowForm(selectedWindowDefaultName));
      return;
    }

    let isMounted = true;

    const loadEnrollmentWindow = async () => {
      try {
        setIsLoadingEnrollmentWindow(true);
        const result = await EnrollmentWindowService.findConfigured({
          facultyId: Number(selFacultyId),
          programId: Number(selProgramId),
          semesterId: activeSemesterId,
          programLevelId: selectedProgramLevelId,
        });

        if (!isMounted) return;

        setEnrollmentWindow(result);
        if (result) {
          setEnrollmentWindowForm({
            name: result.name ?? selectedWindowDefaultName,
            startTime: toDateTimeLocalValue(result.startTime),
            endTime: toDateTimeLocalValue(result.endTime),
            isActive: result.isActive,
          });
        } else {
          setEnrollmentWindowForm(makeDefaultEnrollmentWindowForm(selectedWindowDefaultName));
        }
      } catch (error: any) {
        if (isMounted) {
          toast.error(error?.message || "Failed to load enrollment window");
          setEnrollmentWindow(null);
        }
      } finally {
        if (isMounted) setIsLoadingEnrollmentWindow(false);
      }
    };

    void loadEnrollmentWindow();

    return () => {
      isMounted = false;
    };
  }, [selectedUniversity, selFacultyId, selProgramId, selectedProgramLevelId, activeSemesterId, selectedWindowDefaultName]);

  const courseOptions = useMemo(
    () =>

      lookupCourses.map((course) => (
        {
          value: String(course.id),
          label: `${course.code} - ${course.name}`,
          description: `ID: ${course.id}`,
        })),
    [lookupCourses],
  );

  const classroomOptions = useMemo(
    () =>
      lookupClassrooms.map((room) => ({
        value: String(room.id),
        label: `${room.building}-${room.classroomNumber}`,
        description: `Capacity: ${room.capacity} | Type: ${room.type}`,
      })),
    [lookupClassrooms],
  );

  const instructorOptions = useMemo(
    () =>
      lookupStaff.map((staff) => ({
        value: String(staff.id),
        label: staff.name,
        description: staff.position,
      })),
    [lookupStaff],
  );

  const selFaculty = faculties.find((f) => f.id === Number(selFacultyId));
  const isAnyLoading =
    isLoadingLookups || isLoadingTimetable || isSavingTimetable;

  const getClassroomCapacity = useCallback(
    (classroomId: string) =>
      lookupClassrooms.find((room) => room.id === Number(classroomId))?.capacity ??
      null,
    [lookupClassrooms],
  );

  const activeDays = DAYS.filter((d) => dayRanges[d].enabled);
  const canConfigureEnrollmentWindow = Boolean(selFacultyId && selProgramId && selectedProgramLevelId && activeSemesterId);
  const enrollmentWindowStart = enrollmentWindowForm.startTime ? new Date(enrollmentWindowForm.startTime) : null;
  const enrollmentWindowEnd = enrollmentWindowForm.endTime ? new Date(enrollmentWindowForm.endTime) : null;
  const enrollmentWindowNow = new Date();
  const enrollmentWindowIsOpen = Boolean(
    enrollmentWindowForm.isActive &&
    enrollmentWindowStart &&
    enrollmentWindowEnd &&
    enrollmentWindowStart <= enrollmentWindowNow &&
    enrollmentWindowEnd >= enrollmentWindowNow,
  );

  // ─────────────────────────────────────────────────────
  //  CONFLICT DETECTION
  // ─────────────────────────────────────────────────────

  const getConflictMessage = useCallback(
    (
      day: DayOfWeek,
      start: string,
      end: string,
      classroomId: string,
      teacherId: string,
      excludeId?: string,
    ): string | null => {
      const s = timeToMinutes(start),
        e = timeToMinutes(end);
      for (const cls of draftClassesRef.current) {
        if (excludeId && String(cls.id) === excludeId) continue;
        if (cls.day !== day) continue;
        const cs = timeToMinutes(cls.startTime),
          ce = timeToMinutes(cls.endTime);
        const overlaps = s < ce && e > cs;
        if (!overlaps) continue;
        if (classroomId && cls.classroomId === Number(classroomId)) {
          const room = lookupClassrooms.find(
            (r) => r.id === Number(classroomId),
          );
          const roomCode = room
            ? `${room.building}-${room.classroomNumber}`
            : classroomId;
          return `Room ${roomCode} is already booked on ${day} from ${fmt12(cls.startTime)} to ${fmt12(cls.endTime)}`;
        }
        if (teacherId && cls.instructorId === Number(teacherId)) {
          const teacher = lookupStaff.find((s) => s.id === Number(teacherId));
          return `${teacher?.name || `Staff ${teacherId}`} is already teaching another class at this time on ${day}`;
        }
      }
      return null;
    },
    [lookupClassrooms, lookupStaff],
  );

  const hasConflict = useCallback(
    (
      day: DayOfWeek,
      start: string,
      end: string,
      classroomId: string,
      teacherId: string,
      excludeId?: string,
    ) =>
      getConflictMessage(day, start, end, classroomId, teacherId, excludeId) !==
      null,
    [getConflictMessage],
  );

  const updateDayRange = (
    day: string,
    field: keyof DayRange,
    value: string | boolean,
  ) => {
    setDayRanges((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSaveEnrollmentWindow = async () => {
    if (!selFacultyId || !selProgramId || !selectedProgramLevelId || !activeSemesterId) {
      toast.error("Select faculty, program, level, and active semester first.");
      return;
    }

    const startTime = toIsoFromDateTimeLocal(enrollmentWindowForm.startTime);
    const endTime = toIsoFromDateTimeLocal(enrollmentWindowForm.endTime);

    if (!startTime || !endTime) {
      toast.error("Please enter a valid start and end time.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      toast.error("Enrollment window end time must be after start time.");
      return;
    }

    try {
      setIsSavingEnrollmentWindow(true);
      const saved = await EnrollmentWindowService.save(enrollmentWindow?.id ?? null, {
        name: enrollmentWindowForm.name.trim() || null,
        facultyId: Number(selFacultyId),
        programId: Number(selProgramId),
        semesterId: activeSemesterId,
        programLevelId: selectedProgramLevelId,
        startTime,
        endTime,
        isActive: enrollmentWindowForm.isActive,
      });

      setEnrollmentWindow(saved);
      setEnrollmentWindowForm({
        name: saved.name ?? "Student registration window",
        startTime: toDateTimeLocalValue(saved.startTime),
        endTime: toDateTimeLocalValue(saved.endTime),
        isActive: saved.isActive,
      });
      toast.success("Enrollment window saved successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save enrollment window");
    } finally {
      setIsSavingEnrollmentWindow(false);
    }
  };

  // ─────────────────────────────────────────────────────
  //  EVENT HANDLERS
  // ─────────────────────────────────────────────────────

  const handleEditClass = (item: ScheduledClass) => {
    setEditingClass(item);
    setFormData({
      day: item.day,
      startTime: item.startTime,
      endTime: item.endTime,
      courseId: String(item.courseId),
      classType: item.type,
      teacherId: String(item.instructorId),
      classroomId: String(item.classroomId),
      allowedCapacity: String(item.allowedCapacity),
    });
    setAllowedCapacityTouched(false);
    setShowModal(true);
  };

  const handleSaveClass = () => {
    if (!formData.courseId || !formData.teacherId || !formData.classroomId) {
      toast.error("Please fill in all required fields");
      return;
    }
    const allowedCapacity = parseAllowedCapacity(formData.allowedCapacity);
    if (!allowedCapacity) {
      toast.error("Allowed Capacity must be a positive integer");
      return;
    }
    if (timeToMinutes(formData.startTime) >= timeToMinutes(formData.endTime)) {
      toast.error("End time must be after start time");
      return;
    }
    const conflictMsg = getConflictMessage(
      formData.day,
      formData.startTime,
      formData.endTime,
      formData.classroomId,
      formData.teacherId,
      editingClass ? String(editingClass.id) : undefined,
    );
    if (conflictMsg) {
      toast.error(conflictMsg);
      return;
    }
    const course = lookupCourses.find((c) => c.id === Number(formData.courseId));
    const classroom = lookupClassrooms.find(
      (r) => r.id === Number(formData.classroomId),
    );
    const teacher = lookupStaff.find((s) => s.id === Number(formData.teacherId));
    if (!course || !classroom || !teacher) {
      toast.error("Invalid selection. Please try again.");
      return;
    }
    const updatedItem: ScheduledClass = {
      id: editingClass ? editingClass.id : `temp-${Date.now()}`,
      day: formData.day,
      startTime: formData.startTime,
      endTime: formData.endTime,
      type: formData.classType as SlotType,
      allowedCapacity,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      instructorId: teacher.id,
      instructorName: teacher.name,
      classroomId: classroom.id,
      roomLabel: `${classroom.building} / ${classroom.classroomNumber}`,
      learningGroupId: editingClass?.learningGroupId,
    };
    if (editingClass) {
      setDraftClasses((prev) =>
        prev.map((c) => (c.id === editingClass.id ? updatedItem : c)),
      );
      toast.success("Class updated — remember to save!");
    } else {
      setDraftClasses((prev) => [...prev, updatedItem]);
      toast.success("Class added to draft — remember to save!");
    }
    setShowModal(false);
    setEditingClass(null);
    setAllowedCapacityTouched(false);
  };

  const handleDeleteClass = (id: string) => {
    setDraftClasses((prev) => prev.filter((c) => String(c.id) !== id));
    toast.info("Class removed — remember to save!");
  };

  // ── Drag & Drop — corrected implementation using refs to avoid stale closures
  const handleDragStart = useCallback(
    (e: React.DragEvent, cls: ScheduledClass) => {
      draggingIdRef.current = String(cls.id);
      setDraggingId(String(cls.id));
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("classId", String(cls.id));

      const ghost = document.createElement("div");
      ghost.style.cssText = `
        position:fixed; top:-200px; left:-200px;
        background:linear-gradient(135deg,#1d4ed8,#4f46e5);
        color:white; padding:10px 14px; border-radius:10px;
        font-family:system-ui,-apple-system,sans-serif;
        font-size:13px; font-weight:600;
        box-shadow:0 8px 30px rgba(30,64,175,0.4);
        white-space:nowrap; pointer-events:none; z-index:99999;
        border:2px solid rgba(255,255,255,0.3);
        display:flex; align-items:center; gap:8px;
      `;
      const duration =
        timeToMinutes(cls.endTime) - timeToMinutes(cls.startTime);
      const icon = document.createElement("span");
      icon.style.fontSize = "16px";
      icon.textContent = "*";
      const title = document.createElement("span");
      title.textContent = cls.courseCode || cls.courseName?.slice(0, 8) || "Class";
      const meta = document.createElement("span");
      meta.style.cssText = "opacity:0.75;font-weight:400;font-size:11px";
      meta.textContent = `${fmt12(cls.startTime)} - ${duration}min`;
      ghost.append(icon, title, meta);
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, -12, -12);
      setTimeout(() => document.body.removeChild(ghost), 0);
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    draggingIdRef.current = null;
    setDraggingId(null);
    setDragOverKey(null);
  }, []);

  /** Drop onto a period cell — moves the class to that day, snapping start to period start, keeping duration */
  const handlePeriodDrop = useCallback(
    (e: React.DragEvent, day: string, period: TimePeriod) => {
      e.preventDefault();
      e.stopPropagation();

      const classId = e.dataTransfer.getData("classId");
      if (!classId) {
        draggingIdRef.current = null;
        setDraggingId(null);
        setDragOverKey(null);
        return;
      }

      const cls = draftClassesRef.current.find((c) => String(c.id) === classId);
      if (!cls) {
        draggingIdRef.current = null;
        setDraggingId(null);
        setDragOverKey(null);
        return;
      }

      const duration = timeToMinutes(cls.endTime) - timeToMinutes(cls.startTime);
      const newStart = period.startTime;
      const newEnd = minutesToTime(timeToMinutes(newStart) + duration);
      const range = dayRanges[day];

      if (!range?.enabled) {
        toast.error("That day is closed");
      } else {
        const conflict = getConflictMessage(
          day as DayOfWeek,
          newStart,
          newEnd,
          String(cls.classroomId),
          String(cls.instructorId),
          classId,
        );
        if (conflict) {
          toast.error(conflict);
        } else {
          setDraftClasses((prev) =>
            prev.map((c) =>
              String(c.id) === classId
                ? { ...c, day: day as DayOfWeek, startTime: newStart, endTime: newEnd }
                : c,
            ),
          );
          toast.success("Class rescheduled — remember to save!");
        }
      }

      draggingIdRef.current = null;
      setDraggingId(null);
      setDragOverKey(null);
    },
    [dayRanges, getConflictMessage],
  );

  // ─────────────────────────────────────────────────────
  //  PDF EXPORT — professional, no emojis, consistent with timetable
  // ─────────────────────────────────────────────────────

  const loadExportClassesForLevel = useCallback(
    async (level: number) => {
      const data = await ScheduleService.getSchedule(
        Number(selProgramId),
        level,
        activeSemesterId as number,
        selFacultyId ? Number(selFacultyId) : undefined,
      );

      return mapScheduleResponseToClasses(data);
    },
    [activeSemesterId, selFacultyId, selProgramId],
  );

  const handleExport = async () => {
    setIsExporting(true);

    if (!selProgram || !activeSemesterId) {
      toast.error("Please select a program and semester before exporting.");
      setIsExporting(false);
      return;
    }

    const levelsToExport =
      exportScope === "current" && selLevel ? [selLevel] : filteredLevels;

    let levelExports:
      | Array<{ level: typeof selLevel; classes: ScheduledClass[] }>
      | null = null;

    try {
      levelExports =
        exportScope === "current" && selLevel
          ? [{ level: selLevel, classes: draftClasses }]
          : await Promise.all(
            levelsToExport.map(async (level) => ({
              level,
              classes: await loadExportClassesForLevel(level.level),
            })),
          );
    } catch (error: any) {
      toast.error(error?.message || "Failed to load timetable data for PDF export");
      setIsExporting(false);
      return;
    }

    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Build one page per level
    const printContent = levelExports
      .map(({ level, classes }) => {
        const prog = selProgram;
        const fac = selFaculty;

        const lectureCount = classes.filter(
          (c) => c.type.toLowerCase() === "lecture",
        ).length;
        const labCount = classes.filter(
          (c) => c.type.toLowerCase() === "lab",
        ).length;
        const tutorialCount = classes.filter(
          (c) => c.type.toLowerCase() === "tutorial",
        ).length;
        const seminarCount = classes.filter(
          (c) => c.type.toLowerCase() === "seminar",
        ).length;

        // Build period columns header
        const periodHeadersHtml = periods
          .map(
            (p) => `
          <th style="border:1px solid #cbd5e1; padding:10px 8px; text-align:center;
              background:linear-gradient(180deg,#1e3a8a 0%,#2563eb 100%);
              color:white; font-size:10px; font-weight:700; letter-spacing:0.3px;">
            <div style="font-size:11px; font-weight:800;">${escapeHtml(p.label)}</div>
            <div style="font-size:9px; opacity:0.85; font-weight:500; margin-top:2px;">${fmt12(p.startTime)} &ndash; ${fmt12(p.endTime)}</div>
            <div style="font-size:8.5px; opacity:0.65; margin-top:1px;">${timeToMinutes(p.endTime) - timeToMinutes(p.startTime)} min</div>
          </th>`,
          )
          .join("");

        // Build rows — one per active day
        const rowsHtml = DAYS.map((day) => {
          const r = dayRanges[day];
          const dayClasses = classes.filter((c) => c.day === day);
          const dayBg = r.enabled ? "white" : "#f8fafc";
          const dayLabelBg = r.enabled ? "#f1f5f9" : "#e2e8f0";

          const periodCellsHtml = periods
            .map((period) => {
              if (!r.enabled) {
                return `<td style="border:1px solid #e2e8f0; background: repeating-linear-gradient(45deg,#f8fafc,#f8fafc 5px,#eef2f7 5px,#eef2f7 10px); text-align:center; vertical-align:middle;">
                  <span style="color:#94a3b8; font-size:8px; font-weight:600; letter-spacing:1px; text-transform:uppercase;">CLOSED</span>
                </td>`;
              }

              // Check period is within day's active hours
              const periodInRange =
                timeToMinutes(period.startTime) < timeToMinutes(r.endTime) &&
                timeToMinutes(period.endTime) > timeToMinutes(r.startTime);

              if (!periodInRange) {
                return `<td style="border:1px solid #e2e8f0; background:#f8fafc;"></td>`;
              }

              // Find classes belonging to this period
              const cellClasses = dayClasses.filter(
                (c) => classifyPeriod(c, periods) === period.id,
              );

              if (cellClasses.length === 0) {
                return `<td style="border:1px solid #e2e8f0; background:white; min-height:80px;"></td>`;
              }

              const cardsHtml = cellClasses
                .map((cls) => {
                  const pc = getPdfColors(cls.type);
                  const duration =
                    timeToMinutes(cls.endTime) - timeToMinutes(cls.startTime);
                  return `
                  <div style="background:${pc.bg}; border-left:3px solid ${pc.header}; border-radius:4px; padding:6px 8px; margin-bottom:4px;">
                    <div style="display:flex; align-items:center; gap:5px; margin-bottom:3px;">
                      <span style="background:${pc.header}; color:white; padding:1px 6px; border-radius:3px; font-size:7px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">${escapeHtml(cls.type)}</span>
                      <span style="color:${pc.header}; font-weight:800; font-size:10px;">${escapeHtml(cls.courseCode)}</span>
                    </div>
                    <div style="color:#1e293b; font-size:9px; font-weight:700; line-height:1.3; margin-bottom:3px;">${escapeHtml(cls.courseName)}</div>
                    <div style="font-size:8px; color:#475569; line-height:1.6; border-top:1px solid rgba(0,0,0,0.06); padding-top:3px; margin-top:1px;">
                      <div><strong style="color:#374151;">Time:</strong> ${fmt12(cls.startTime)} &ndash; ${fmt12(cls.endTime)} (${duration} min)</div>
                      <div><strong style="color:#374151;">Instructor:</strong> ${escapeHtml(cls.instructorName)}</div>
                      <div><strong style="color:#374151;">Room:</strong> ${escapeHtml(cls.roomLabel)}</div>
                    </div>
                  </div>`;
                })
                .join("");

              return `<td style="border:1px solid #e2e8f0; padding:5px; vertical-align:top; background:white;">${cardsHtml}</td>`;
            })
            .join("");

          return `
          <tr>
            <td style="border:1px solid #e2e8f0; border-right:2px solid #cbd5e1;
                padding:8px 10px; text-align:center; background:${dayLabelBg};
                vertical-align:middle; font-weight:700;">
              <div style="font-size:13px; font-weight:800; color:#1e3a8a;">${DAY_ABBR[day]}</div>
              <div style="font-size:9px; color:#64748b; margin-top:1px;">${escapeHtml(day)}</div>
              ${r.enabled
              ? `<div style="margin-top:4px; font-size:7.5px; color:#3b82f6; background:#eff6ff; padding:2px 5px; border-radius:10px; display:inline-block; border:1px solid #bfdbfe;">${dayClasses.length} class${dayClasses.length !== 1 ? "es" : ""}</div>`
              : `<div style="margin-top:4px; font-size:7.5px; color:#94a3b8; background:#f1f5f9; padding:2px 5px; border-radius:10px; display:inline-block;">Closed</div>`
            }
            </td>
            ${periodCellsHtml}
          </tr>`;
        }).join("");

        // Summary badges HTML
        const summaryBadgesHtml = [
          { label: "Lecture", color: toRgb([59, 130, 246]), count: lectureCount },
          { label: "Lab", color: toRgb([16, 185, 129]), count: labCount },
          { label: "Tutorial", color: toRgb([245, 158, 11]), count: tutorialCount },
          { label: "Seminar", color: toRgb([168, 85, 247]), count: seminarCount },
        ]
          .filter((x) => x.count > 0)
          .map(
            (x) =>
              `<span style="background:${x.color}; color:white; padding:3px 10px; border-radius:12px; font-size:8.5px; font-weight:700;">${x.label}: ${x.count}</span>`,
          )
          .join("");

        return `
        <div class="timetable-page" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">

          <!-- Header -->
          <div style="background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 50%,#2563eb 100%);
                      color:white; padding:14px 18px 12px; border-radius:8px; margin-bottom:12px;
                      display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="font-size:8px; letter-spacing:2.5px; text-transform:uppercase; opacity:0.65; margin-bottom:5px; font-weight:600;">
                ACADEMIC TIMETABLE
              </div>
              <div style="font-size:18px; font-weight:900; letter-spacing:-0.3px; margin-bottom:4px;">
                Weekly Schedule
              </div>
              <div style="font-size:10.5px; opacity:0.8; font-weight:500;">
                ${[fac?.name, prog?.name].filter(Boolean).map(escapeHtml).join(" / ") || "All Faculties &amp; Programs"}
              </div>
              <div style="margin-top:6px; background:rgba(255,255,255,0.18); display:inline-flex; align-items:center; padding:4px 12px; border-radius:20px; border:1px solid rgba(255,255,255,0.3);">
                <span style="font-size:12px; font-weight:800;">${escapeHtml(levelLabel(level.level))}</span>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:8.5px; opacity:0.65; margin-bottom:8px;">Exported: ${dateStr}</div>
              <div style="display:flex; gap:5px; justify-content:flex-end; flex-wrap:wrap; margin-bottom:6px;">
                ${summaryBadgesHtml}
              </div>
              <div style="font-size:8px; opacity:0.55; text-align:right;">
                ${activeDays.length} active days &bull; ${classes.length} total sessions
              </div>
            </div>
          </div>

          <!-- Timetable -->
          <table style="width:100%; border-collapse:collapse; font-size:10px; table-layout:fixed;">
            <colgroup>
              <col style="width:70px;">
              ${periods.map(() => `<col>`).join("")}
            </colgroup>
            <thead>
              <tr>
                <th style="border:1px solid #cbd5e1; padding:10px 6px; text-align:center;
                    background:linear-gradient(180deg,#1e3a8a 0%,#2563eb 100%);
                    color:white; font-size:9px; font-weight:700; letter-spacing:1px;
                    border-right:2px solid #1e40af;">
                  DAY
                </th>
                ${periodHeadersHtml}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <!-- Footer -->
          <div style="margin-top:10px; padding-top:8px; border-top:1px solid #e2e8f0;
                      display:flex; justify-content:space-between; align-items:center;
                      font-size:7.5px; color:#94a3b8;">
            <span style="font-weight:600; color:#64748b;">UniAct Academic Timetabling System</span>
            <span>${levelLabel(level.level)} &bull; ${classes.length} sessions</span>
            <span>${dateStr}</span>
          </div>
        </div>`;
      })
      .join("");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to export PDF");
      setIsExporting(false);
      return;
    }

    // Compute dynamic scale: measure content vs A4 landscape printable area
    // A4 landscape printable at 96dpi with 8mm margins ~ 1056 x 728px logical
    const A4_W = 1056;
    const A4_H = 728;
    // Each page: header ~90px + table. Estimate table rows = DAYS.length, cols = periods.length
    // We inject a JS snippet that measures each .timetable-page and applies CSS zoom to fit
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Timetable - ${escapeHtml(exportScope === "current" && selLevel ? levelLabel(selLevel.level) : "All Levels")}</title>
          <style>
            @media print {
              @page {
                size: A4 landscape;
                margin: 8mm 10mm;
              }
              .timetable-page {
                page-break-after: always;
                page-break-inside: avoid;
              }
              .timetable-page:last-child {
                page-break-after: avoid;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              thead { display: table-header-group; }
              tr { page-break-inside: avoid; }
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              background: white;
              padding: 0;
            }
            .timetable-page {
              /* scale is set dynamically by JS below */
              transform-origin: top left;
              width: ${A4_W}px; /* fixed logical width before scaling */
            }
            table { background: white; width: 100%; }
            td, th { word-break: break-word; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.addEventListener('load', function() {
              var pages = document.querySelectorAll('.timetable-page');
              var AW = ${A4_W};
              var AH = ${A4_H};
              pages.forEach(function(page) {
                // Reset any prior transform so we measure natural size
                page.style.transform = '';
                page.style.marginBottom = '';
                var w = page.scrollWidth;
                var h = page.scrollHeight;
                var scaleW = AW / w;
                var scaleH = AH / h;
                var scale = Math.min(scaleW, scaleH, 1); // never upscale
                if (scale < 1) {
                  page.style.transform = 'scale(' + scale + ')';
                  page.style.transformOrigin = 'top left';
                  // Collapse the dead space after scaling so next page starts correctly
                  var shrunkH = Math.ceil(h * scale);
                  page.style.height = shrunkH + 'px';
                  page.style.overflow = 'hidden';
                  page.style.marginBottom = '0';
                }
              });
              setTimeout(function() { window.print(); }, 400);
            });
          <\/script>
        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      setIsExporting(false);
      setShowExportModal(false);
      toast.success("Print dialog opened — save as PDF to download");
    }, 800);
  };

  // ─────────────────────────────────────────────────────
  //  GUARDS
  // ─────────────────────────────────────────────────────

  if (!selectedUniversity) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <LayoutGrid className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No University Selected
          </h3>
          <p className="text-slate-500 text-center">
            Please select a university to manage its timetables.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!activeSemesterId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Select a Semester First
          </h3>
          <p className="text-slate-500 max-w-md">
            Open Semester Management from the header and choose the active
            semester before building timetable slots.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ─────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-24">
      {/* ── Page Header ── */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Timetabling &amp; Schedule Management
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          Build weekly schedules per program level — click any slot to add,
          drag to reschedule
        </p>
        {isAnyLoading && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {isLoadingLookups && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading faculties and programs
              </span>
            )}
            {isLoadingTimetable && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 border border-indigo-200">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading timetable
              </span>
            )}
            {isSavingTimetable && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving timetable changes
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Scope Filter — redesigned, clean and professional ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Top stripe */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center justify-center w-8 h-8">
            <SlidersHorizontal className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">View Filter</p>
            <p className="text-xs text-blue-100/80">
              Narrow down by faculty, program and level
            </p>
          </div>
          {(selFaculty || selProgram || selLevel) && (
            <div className="ml-auto flex items-center gap-1.5">
              {selFaculty && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-white/20 border border-white/30 rounded-full px-2.5 py-0.5">
                  <Building2 className="w-3 h-3" />
                  {toDisplayCode(selFaculty.name)}
                </span>
              )}
              {selProgram && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-white/20 border border-white/30 rounded-full px-2.5 py-0.5">
                  <BookOpen className="w-3 h-3" />
                  {toDisplayCode(selProgram.name)}
                </span>
              )}
              {selLevel && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-white/20 border border-white/30 rounded-full px-2.5 py-0.5">
                  <Layers className="w-3 h-3" />
                  Yr {selLevel.level}
                </span>
              )}
              <button
                onClick={() => {
                  setSelFacultyId("");
                  setSelProgramId("");
                  setSelLevelId("");
                }}
                className="text-xs text-white/70 hover:text-white transition-colors flex items-center gap-0.5 ml-1"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Filter fields */}
        <div className="p-5">
          {isLoadingLookups && (
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
              Loading filter data...
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-xl border border-slate-200 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Faculty */}
            <div className="relative group">
              <label className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider pointer-events-none z-10">
                <Building2 className="w-3 h-3" />
                Faculty
              </label>
              <select
                value={selFacultyId}
                onChange={(e) => {
                  setSelFacultyId(e.target.value);
                  setSelProgramId("");
                  setSelLevelId("");
                }}
                disabled={isLoadingLookups}
                className="w-full pt-8 pb-3 px-4 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer transition-colors hover:bg-slate-50"
              >
                <option value="">All Faculties</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 bottom-3.5 w-4 h-4 text-slate-300 rotate-90 pointer-events-none" />
            </div>

            {/* Program */}
            <div className="relative group">
              <label className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider pointer-events-none z-10">
                <BookOpen className="w-3 h-3" />
                Program
              </label>
              <select
                value={selProgramId}
                onChange={(e) => {
                  setSelProgramId(e.target.value);
                  setSelLevelId("");
                }}
                disabled={!selFacultyId || isLoadingLookups}
                className="w-full pt-8 pb-3 px-4 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer transition-colors hover:bg-slate-50"
              >
                <option value="">All Programs</option>
                {filteredPrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 bottom-3.5 w-4 h-4 text-slate-300 rotate-90 pointer-events-none" />
            </div>

            {/* Level */}
            <div className="relative group">
              <label className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider pointer-events-none z-10">
                <Layers className="w-3 h-3" />
                Level
              </label>
              <select
                value={selLevelId}
                onChange={(e) => setSelLevelId(e.target.value)}
                disabled={!selProgramId || isLoadingTimetable || isLoadingLookups}
                className="w-full pt-8 pb-3 px-4 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer transition-colors hover:bg-slate-50"
              >
                <option value="">All Levels</option>
                {filteredLevels.map((l) => (
                  <option key={l.id ?? l.level} value={l.level}>
                    {levelLabel(l.level)}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 bottom-3.5 w-4 h-4 text-slate-300 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Window */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Student Enrollment Window
                {canConfigureEnrollmentWindow && (
                  <Badge
                    className={
                      enrollmentWindowIsOpen
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }
                  >
                    {enrollmentWindowIsOpen ? "Open now" : "Closed now"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                {canConfigureEnrollmentWindow && selFaculty && selProgram && selLevel
                  ? `Controls registration for ${selFaculty.name} / ${selProgram.name} / ${levelLabel(selLevel.level)}.`
                  : "Controls when students can open registration for the selected faculty, program, level, and semester."}
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={handleSaveEnrollmentWindow}
              disabled={!canConfigureEnrollmentWindow || isLoadingEnrollmentWindow || isSavingEnrollmentWindow}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSavingEnrollmentWindow ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {enrollmentWindow ? "Update Window" : "Create Window"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {!canConfigureEnrollmentWindow ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Select faculty, program, level, and make sure an active semester is set before configuring student registration.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1fr_190px_190px_150px]">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Window Name
                </label>
                <input
                  value={enrollmentWindowForm.name}
                  onChange={(event) =>
                    setEnrollmentWindowForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  disabled={isLoadingEnrollmentWindow}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Opens
                </label>
                <input
                  type="datetime-local"
                  value={enrollmentWindowForm.startTime}
                  onChange={(event) =>
                    setEnrollmentWindowForm((current) => ({
                      ...current,
                      startTime: event.target.value,
                    }))
                  }
                  disabled={isLoadingEnrollmentWindow}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Closes
                </label>
                <input
                  type="datetime-local"
                  value={enrollmentWindowForm.endTime}
                  onChange={(event) =>
                    setEnrollmentWindowForm((current) => ({
                      ...current,
                      endTime: event.target.value,
                    }))
                  }
                  disabled={isLoadingEnrollmentWindow}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                />
              </div>
              <label className="flex items-end">
                <span className="flex h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
                  Active
                  <input
                    type="checkbox"
                    checked={enrollmentWindowForm.isActive}
                    onChange={(event) =>
                      setEnrollmentWindowForm((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                    disabled={isLoadingEnrollmentWindow}
                    className="h-4 w-4 accent-emerald-600"
                  />
                </span>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Weekly Timetable ── */}
      <Card className="shadow-sm overflow-hidden">
        {/* Card Header: title + legend + action buttons */}
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col items-start justify-between gap-4 xl:flex-row xl:items-center">
            <div className="min-w-0">
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                <Calendar className="w-5 h-5 text-blue-600" />
                Weekly Timetable
                {selLevel && (
                  <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 ml-1">
                    {levelLabel(selLevel.level)}
                  </Badge>
                )}
                {hasChanges && (
                  <Badge className="bg-amber-100 text-amber-700 border border-amber-200 ml-1 animate-pulse">
                    {changeCount} unsaved{" "}
                    {changeCount === 1 ? "change" : "changes"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <span className="inline-flex items-center gap-1">
                  <Plus className="w-3 h-3 text-blue-400" />
                  Click any cell to add a class
                </span>
                <span className="inline-flex items-center gap-1">
                  <GripVertical className="w-3 h-3 text-slate-400" />
                  Drag a card to reschedule
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Settings className="w-3 h-3" />
                  Click period / day headers to edit settings inline
                </span>
              </CardDescription>
            </div>
            {/* Action buttons — placed here next to the timetable */}
            <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:shrink-0">
              {/* Type legend */}
              <div className="hidden lg:flex flex-wrap gap-1.5 mr-2">
                {(["lecture", "lab", "tutorial", "seminar"] as const).map(
                  (type) => {
                    const c = TYPE_COLORS[type];
                    return (
                      <span
                        key={type}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}
                      >
                        {getTypeIcon(type)}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    );
                  },
                )}
              </div>
              {/* Zoom controls */}
              <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                <button
                  onClick={zoomOut}
                  disabled={zoomLevel <= MIN_ZOOM}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Zoom out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>
                <button
                  onClick={zoomReset}
                  className="flex items-center justify-center min-w-[44px] h-7 rounded-md text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all tabular-nums"
                  title="Reset zoom"
                >
                  {zoomPercent}%
                </button>
                <button
                  onClick={zoomIn}
                  disabled={zoomLevel >= MAX_ZOOM}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Zoom in"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportModal(true)}
                disabled={hasChanges || isAnyLoading || !selLevel}
                className="gap-2 flex-1 sm:flex-none"
                title={
                  hasChanges
                    ? "Save the timetable first before exporting"
                    : "Export timetable as PDF"
                }
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingClass(null);
                  setFormData(makeDefaultForm());
                  setAllowedCapacityTouched(false);
                  setShowModal(true);
                }}
                disabled={!selLevel || isAnyLoading}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Plus className="w-4 h-4" />
                Schedule Class
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 relative">
          {(isLoadingTimetable || isSavingTimetable) && (
            <div className="absolute inset-0 z-30 bg-white/75 backdrop-blur-[1px] flex items-center justify-center">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-md flex items-center gap-2 text-sm text-slate-700">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                {isSavingTimetable
                  ? "Saving timetable changes..."
                  : "Loading timetable..."}
              </div>
            </div>
          )}

          {/* Zoom wrapper — clips scaled content so card height tracks the zoom level */}
          <div
            style={{
              overflow: "auto",
              height: zoomLevel < 1
                ? `calc(${DAYS.length} * 160px * ${zoomLevel} + 60px)`
                : undefined,
              transition: "height 0.2s ease",
            }}
          >
            <div
              style={{
                minWidth: `${140 + periods.length * 220}px`,
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top left",
                width: zoomLevel < 1 ? `${(1 / zoomLevel) * 100}%` : "100%",
              }}
            >
              {/* ── Sticky column header: periods ── */}
              <div className="flex border-b-2 border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
                {/* Day label column header — contains day-range toggles */}
                <div
                  className="flex-shrink-0 flex flex-col items-center justify-center border-r-2 border-slate-200 bg-slate-50 py-3 gap-1"
                  style={{ width: 140 }}
                >
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 font-semibold">Day</span>
                  <span className="text-[10px] text-slate-400">
                    {activeDays.length}/{DAYS.length} active
                  </span>
                </div>

                {/* Period column headers — click to edit inline */}
                {periods.map((period, pIdx) => (
                  <div
                    key={period.id}
                    className="flex-1 min-w-[200px] border-r border-slate-200 last:border-r-0 relative group"
                  >
                    {editingPeriodId === period.id ? (
                      /* Inline period editor */
                      <div
                        className="p-2 bg-blue-50 border-b-2 border-blue-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1 mb-1.5">
                          <input
                            value={period.label}
                            onChange={(e) =>
                              setPeriods((prev) =>
                                prev.map((x, i) =>
                                  i === pIdx
                                    ? { ...x, label: e.target.value }
                                    : x,
                                ),
                              )
                            }
                            className="flex-1 text-xs font-bold px-2 py-1 border border-blue-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                          <button
                            onClick={() => setEditingPeriodId(null)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setPeriods((prev) =>
                                prev.filter((_, i) => i !== pIdx),
                              );
                              setEditingPeriodId(null);
                            }}
                            className="p-1 text-red-400 hover:bg-red-50 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <p className="text-[9px] text-slate-500 mb-0.5">Start</p>
                            <input
                              type="time"
                              value={period.startTime}
                              onChange={(e) =>
                                setPeriods((prev) =>
                                  prev.map((x, i) =>
                                    i === pIdx
                                      ? { ...x, startTime: e.target.value }
                                      : x,
                                  ),
                                )
                              }
                              className="w-full text-xs px-1.5 py-1 border border-blue-300 rounded bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-500 mb-0.5">End</p>
                            <input
                              type="time"
                              value={period.endTime}
                              onChange={(e) =>
                                setPeriods((prev) =>
                                  prev.map((x, i) =>
                                    i === pIdx
                                      ? { ...x, endTime: e.target.value }
                                      : x,
                                  ),
                                )
                              }
                              className="w-full text-xs px-1.5 py-1 border border-blue-300 rounded bg-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="py-3 px-3 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => setEditingPeriodId(period.id)}
                        title="Click to edit this period"
                      >
                        <p className="text-sm font-bold text-slate-800">
                          {period.label}
                        </p>
                        <p className="text-xs text-blue-600 font-semibold mt-0.5">
                          {fmt12(period.startTime)} – {fmt12(period.endTime)}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {timeToMinutes(period.endTime) -
                            timeToMinutes(period.startTime)}{" "}
                          min
                        </p>
                        {/* Edit hint on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          <span className="text-[9px] text-blue-400 font-medium inline-flex items-center gap-0.5">
                            <Edit className="w-2.5 h-2.5" />
                            Click to edit
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add period button */}
                <div
                  className="flex-shrink-0 flex items-center justify-center border-l border-slate-200 cursor-pointer hover:bg-blue-50 transition-colors"
                  style={{ width: 48 }}
                  onClick={() =>
                    setPeriods((prev) => [
                      ...prev,
                      {
                        id: `p${Date.now()}`,
                        label: `Period ${prev.length + 1}`,
                        startTime: "08:00",
                        endTime: "09:40",
                      },
                    ])
                  }
                  title="Add new period"
                >
                  <Plus className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* ── Day rows ── */}
              {DAYS.map((day) => {
                const r = dayRanges[day];
                const dayClasses = draftClasses.filter((c) => c.day === day);

                return (
                  <div
                    key={day}
                    className={`flex border-b border-slate-200 last:border-b-0 ${!r.enabled ? "opacity-60" : ""}`}
                    style={{ minHeight: 160 }}
                  >
                    {/* ── Day label cell — inline editing of enabled/times ── */}
                    <div
                      className={`flex-shrink-0 flex flex-col items-center justify-center border-r-2 border-slate-200 py-3 gap-1 group ${r.enabled ? "bg-white" : "bg-slate-50"}`}
                      style={{ width: 140 }}
                    >
                      <p
                        className={`text-base font-bold ${r.enabled ? "text-slate-800" : "text-slate-400"}`}
                      >
                        {DAY_ABBR[day]}
                      </p>
                      <p className={`text-xs ${r.enabled ? "text-slate-500" : "text-slate-300"}`}>
                        {day}
                      </p>
                      {/* Toggle enabled */}
                      <button
                        onClick={() => updateDayRange(day, "enabled", !r.enabled)}
                        className={`mt-1 relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${r.enabled ? "bg-blue-500" : "bg-slate-300"}`}
                        style={{ width: 36, height: 20 }}
                        role="switch"
                        aria-checked={r.enabled}
                        title={r.enabled ? "Click to disable this day" : "Click to enable this day"}
                      >
                        <span
                          className="bg-white rounded-full shadow-sm transition-transform duration-200"
                          style={{
                            width: 14,
                            height: 14,
                            transform: r.enabled
                              ? "translateX(19px)"
                              : "translateX(3px)",
                            display: "block",
                          }}
                        />
                      </button>

                      {r.enabled ? (
                        <>
                          {/* Inline time range editing — stacked to fit narrow column */}
                          <div className="w-full px-1.5 mt-1.5 space-y-1.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                                From
                              </span>
                              <input
                                type="time"
                                value={r.startTime}
                                onChange={(e) =>
                                  updateDayRange(day, "startTime", e.target.value)
                                }
                                className="w-full text-[10px] px-1.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-slate-700 font-medium"
                                title="Start time for this day"
                              />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                                To
                              </span>
                              <input
                                type="time"
                                value={r.endTime}
                                onChange={(e) =>
                                  updateDayRange(day, "endTime", e.target.value)
                                }
                                className="w-full text-[10px] px-1.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-slate-700 font-medium"
                                title="End time for this day"
                              />
                            </div>
                          </div>
                          <span className="mt-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                            {dayClasses.length}{" "}
                            {dayClasses.length === 1 ? "class" : "classes"}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 mt-1">
                          Closed
                        </span>
                      )}
                    </div>

                    {/* ── Period cells ── */}
                    {periods.map((period) => {
                      const cellKey = `${day}|${period.id}`;
                      const isOver =
                        dragOverKey === cellKey && draggingId !== null;
                      const cellClasses = dayClasses.filter(
                        (c) => classifyPeriod(c, periods) === period.id,
                      );
                      const periodInRange =
                        r.enabled &&
                        timeToMinutes(period.startTime) <
                        timeToMinutes(r.endTime) &&
                        timeToMinutes(period.endTime) >
                        timeToMinutes(r.startTime);

                      return (
                        <div
                          key={period.id}
                          className={`flex-1 min-w-[200px] border-r border-slate-200 last:border-r-0 relative transition-colors duration-150 ${!r.enabled
                            ? "bg-[repeating-linear-gradient(45deg,#f8fafc,#f8fafc_8px,#f1f5f9_8px,#f1f5f9_16px)]"
                            : !periodInRange
                              ? "bg-slate-50/70"
                              : isOver
                                ? "bg-blue-50 ring-2 ring-inset ring-blue-400"
                                : "bg-white hover:bg-slate-50/50"
                            }`}
                          onDragOver={(e) => {
                            if (!r.enabled || !periodInRange) return;
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                            if (dragOverKey !== cellKey)
                              setDragOverKey(cellKey);
                          }}
                          onDragLeave={(e) => {
                            // Only clear if leaving this cell entirely
                            if (
                              !e.currentTarget.contains(
                                e.relatedTarget as Node,
                              )
                            ) {
                              setDragOverKey(null);
                            }
                          }}
                          onDrop={(e) => handlePeriodDrop(e, day, period)}
                          onClick={() => {
                            if (
                              !r.enabled ||
                              !periodInRange ||
                              draggingId ||
                              editingPeriodId
                            )
                              return;
                            setEditingClass(null);
                            setFormData({
                              ...makeDefaultForm(),
                              day: day as DayOfWeek,
                              startTime: period.startTime,
                              endTime: period.endTime,
                            });
                            setShowModal(true);
                          }}
                          style={{
                            cursor:
                              !r.enabled || !periodInRange
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          {/* Drop overlay */}
                          {isOver && (
                            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                              <div className="bg-blue-600/90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                <Move className="w-3 h-3" />
                                Drop to reschedule
                              </div>
                            </div>
                          )}

                          {/* Empty state add prompt */}
                          {cellClasses.length === 0 &&
                            periodInRange &&
                            !isOver && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="flex flex-col items-center gap-1 text-slate-300">
                                  <Plus className="w-5 h-5" />
                                  <span className="text-[10px] font-medium">
                                    Add class
                                  </span>
                                </div>
                              </div>
                            )}

                          {/* Closed / inactive indicator */}
                          {(!r.enabled || !periodInRange) && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-[10px] text-slate-400 font-medium opacity-50 rotate-[-15deg] select-none">
                                {!r.enabled ? "Closed" : "—"}
                              </span>
                            </div>
                          )}

                          {/* Class cards */}
                          {cellClasses.length > 0 && (
                            <div
                              className="p-2 flex flex-col gap-1.5 overflow-y-auto"
                              style={{ maxHeight: 400 }}
                            >
                              {cellClasses.map((item) => {
                                const colors = getColors(item.type);
                                const isDragging =
                                  draggingId === String(item.id);
                                const duration =
                                  timeToMinutes(item.endTime) -
                                  timeToMinutes(item.startTime);

                                return (
                                  <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => {
                                      e.stopPropagation();
                                      handleDragStart(e, item);
                                    }}
                                    onDragEnd={handleDragEnd}
                                    onDoubleClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClass(item);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    title={`${item.courseCode ?? ""} — ${item.courseName ?? ""}\n${fmt12(item.startTime)} – ${fmt12(item.endTime)} (${duration}min)\n${item.instructorName ?? ""} · ${item.roomLabel ?? ""}`}
                                    className={`group relative rounded-lg border-l-4 select-none transition-all duration-150 ${colors.bg} ${colors.border} ${isDragging
                                      ? "opacity-30 scale-95 cursor-grabbing shadow-none"
                                      : "shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:brightness-[0.97]"
                                      }`}
                                  >
                                    <div className="px-2.5 py-2">
                                      {/* Row 1: type badge + course code + actions */}
                                      <div className="flex items-start justify-between gap-1 mb-1">
                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                          <span
                                            className={`inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white shrink-0 ${colors.header}`}
                                          >
                                            {getTypeIcon(item.type)}
                                            {item.type}
                                          </span>
                                          <span
                                            className={`text-xs font-bold truncate ${colors.text}`}
                                          >
                                            {item.courseCode ?? "—"}
                                          </span>
                                        </div>
                                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditClass(item);
                                            }}
                                            className={`p-0.5 rounded hover:bg-white/80 ${colors.text} transition-colors`}
                                            title="Edit"
                                          >
                                            <Edit className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteClass(String(item.id));
                                            }}
                                            className="p-0.5 rounded hover:bg-white/80 text-red-500 transition-colors"
                                            title="Delete"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Course name */}
                                      <p
                                        className={`text-[11px] font-semibold leading-tight ${colors.text} opacity-90 line-clamp-2 mb-1.5`}
                                      >
                                        {item.courseName ?? ""}
                                      </p>

                                      {/* Time */}
                                      <div
                                        className={`flex items-center gap-1 text-[10px] font-semibold ${colors.text} opacity-80 mb-1`}
                                      >
                                        <Clock className="w-2.5 h-2.5 shrink-0" />
                                        <span>
                                          {fmt12(item.startTime)} –{" "}
                                          {fmt12(item.endTime)}
                                          <span className="ml-1 opacity-60">
                                            ({duration}min)
                                          </span>
                                        </span>
                                      </div>

                                      {/* Room + instructor */}
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                          className={`text-[10px] ${colors.text} opacity-70 font-medium truncate`}
                                        >
                                          {item.roomLabel ?? ""}
                                        </span>
                                        <span
                                          className={`text-[10px] ${colors.text} opacity-60 truncate flex items-center gap-0.5`}
                                        >
                                          <Users className="w-2.5 h-2.5 shrink-0" />
                                          {item.instructorName ?? ""}
                                        </span>
                                      </div>

                                      {/* Drag grip */}
                                      <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-20 transition-opacity">
                                        <GripVertical className="w-3 h-3 text-slate-600" />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Spacer to align with the "add period" column */}
                    <div className="flex-shrink-0" style={{ width: 48 }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer stats */}
          <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50 flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {draftClasses.length}
              </span>{" "}
              total classes
            </span>
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {activeDays.length}
              </span>{" "}
              active days
            </span>
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {periods.length}
              </span>{" "}
              periods
            </span>
            {hasChanges && (
              <span className="text-xs text-amber-600 font-medium">
                {changeCount} unsaved{" "}
                {changeCount === 1 ? "change" : "changes"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── STICKY SAVE BAR ── */}
      {
        hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
            <div
              className="pointer-events-auto mx-4 mb-4 w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/15 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8">
                  <Save className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {changeCount} unsaved{" "}
                    {changeCount === 1 ? "change" : "changes"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Save to apply changes or discard to revert
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDiscard}
                  disabled={isSavingTimetable}
                  className="gap-1.5 flex-1 sm:flex-none border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={
                    isSavingTimetable || isLoadingTimetable || isLoadingLookups
                  }
                  className="gap-1.5 flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                >
                  {isSavingTimetable ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {isSavingTimetable ? "Saving..." : "Save Timetable"}
                </Button>
              </div>
            </div>
          </div>
        )
      }

      {/* ── ADD / EDIT CLASS MODAL ── */}
      <Modal
        open={showModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowModal(false);
            setEditingClass(null);
            setAllowedCapacityTouched(false);
          }
        }}
      >
        <ModalContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>
              {editingClass ? "Edit Scheduled Class" : "Schedule New Class"}
            </ModalTitle>
            <ModalDescription>
              {editingClass
                ? "Update the class details — changes go to draft until saved"
                : "Add a class to the timetable — changes go to draft until saved"}
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-4">
            {/* Day / Start / End */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Day *
                </label>
                <select
                  value={formData.day}
                  onChange={(e) =>
                    setFormData({ ...formData, day: e.target.value as DayOfWeek })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {DAYS.filter((d) => dayRanges[d].enabled).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <p className="text-xs text-slate-400 mt-0.5">
                  {fmt12(formData.startTime)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <p className="text-xs text-slate-400 mt-0.5">
                  {fmt12(formData.endTime)}
                </p>
              </div>
            </div>

            {/* Course / Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Course *
                </label>
                <SearchableSelect
                  value={formData.courseId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, courseId: value })
                  }
                  options={courseOptions}
                  placeholder="Select a course..."
                  searchPlaceholder="Search course by code or name..."
                  emptyMessage="No course found."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Class Type *
                </label>
                <select
                  value={formData.classType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      classType: e.target.value as typeof formData.classType,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Seminar">Seminar</option>
                </select>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getColors(formData.classType).bg} ${getColors(formData.classType).text} ${getColors(formData.classType).border}`}
                  >
                    {getTypeIcon(formData.classType)}
                    {formData.classType}
                  </span>
                </div>
              </div>
            </div>

            {/* Classroom / Instructor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Classroom *
                </label>
                <SearchableSelect
                  value={formData.classroomId}
                  onValueChange={(nextClassroomId) => {
                    const nextClassroom = lookupClassrooms.find(
                      (item) => item.id === Number(nextClassroomId),
                    );
                    const nextClassroomCapacity = getClassroomCapacity(nextClassroomId);
                    setFormData({
                      ...formData,
                      classroomId: nextClassroomId,
                      classType: classroomToClassType(
                        nextClassroom?.type || "Hall",
                      ),
                      allowedCapacity: allowedCapacityTouched
                        ? formData.allowedCapacity
                        : String(nextClassroomCapacity ?? ""),
                    });
                  }}
                  options={classroomOptions}
                  placeholder="Select a classroom..."
                  searchPlaceholder="Search room by building, number, or type..."
                  emptyMessage="No classroom found."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Allowed Capacity *
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={formData.allowedCapacity}
                  onChange={(e) => {
                    setAllowedCapacityTouched(true);
                    setFormData({ ...formData, allowedCapacity: e.target.value });
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Defaults from classroom capacity"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Instructor *
                </label>
                <SearchableSelect
                  value={formData.teacherId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teacherId: value })
                  }
                  options={instructorOptions}
                  placeholder="Select instructor..."
                  searchPlaceholder="Search instructor by name or role..."
                  emptyMessage="No instructor found."
                />
              </div>
            </div>

            {/* Validation preview */}
            {formData.courseId &&
              formData.startTime &&
              formData.endTime &&
              (() => {
                const timeInvalid =
                  timeToMinutes(formData.startTime) >=
                  timeToMinutes(formData.endTime);
                const capacityInvalid = !parseAllowedCapacity(formData.allowedCapacity);
                const conflictMsg = !timeInvalid
                  ? getConflictMessage(
                    formData.day,
                    formData.startTime,
                    formData.endTime,
                    formData.classroomId,
                    formData.teacherId,
                    editingClass ? String(editingClass.id) : undefined,
                  )
                  : null;
                const hasError = timeInvalid || capacityInvalid || !!conflictMsg;
                return (
                  <div
                    className={`rounded-xl border p-3.5 text-sm transition-colors ${hasError ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}
                  >
                    {timeInvalid ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>End time must be after start time</span>
                      </div>
                    ) : conflictMsg ? (
                      <div className="flex items-start gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{conflictMsg}</span>
                      </div>
                    ) : capacityInvalid ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Allowed Capacity must be a positive integer</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-emerald-700">
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          <span className="font-medium">Schedule looks good!</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 mt-1 pl-6">
                          <div>
                            <span className="text-slate-400">Day:</span>{" "}
                            <span className="font-medium">{formData.day}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Time:</span>{" "}
                            <span className="font-medium">
                              {fmt12(formData.startTime)} –{" "}
                              {fmt12(formData.endTime)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Duration:</span>{" "}
                            <span className="font-medium">
                              {timeToMinutes(formData.endTime) -
                                timeToMinutes(formData.startTime)}{" "}
                              min
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Type:</span>{" "}
                            <span className="font-medium capitalize">
                              {formData.classType}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setEditingClass(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveClass}
                disabled={
                  !formData.courseId ||
                  !formData.teacherId ||
                  !formData.classroomId ||
                  !parseAllowedCapacity(formData.allowedCapacity) ||
                  timeToMinutes(formData.startTime) >=
                  timeToMinutes(formData.endTime) ||
                  hasConflict(
                    formData.day,
                    formData.startTime,
                    formData.endTime,
                    formData.classroomId,
                    formData.teacherId,
                    editingClass ? String(editingClass.id) : undefined,
                  )
                }
              >
                {editingClass ? "Update Class" : "Add to Draft"}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      {/* ── EXPORT MODAL ── */}
      <Modal
        open={showExportModal}
        onOpenChange={(open) => {
          if (!open) setShowExportModal(false);
        }}
      >
        <ModalContent className="max-w-lg">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Export Timetable as PDF
            </ModalTitle>
            <ModalDescription>
              One timetable per page — landscape A4, period-based layout
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${exportScope === "current" ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"} ${!selLevel ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="current"
                  checked={exportScope === "current"}
                  disabled={!selLevel}
                  onChange={() => setExportScope("current")}
                  className="mt-0.5 accent-blue-600"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Current Level Only
                  </p>
                  {selLevel ? (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Single-page PDF for{" "}
                      <span className="font-medium text-blue-600">
                        {levelLabel(selLevel.level)}
                      </span>
                      {selProgram && <> ({selProgram.name})</>}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-0.5">
                      Select a program level first
                    </p>
                  )}
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${exportScope === "all" ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={exportScope === "all"}
                  onChange={() => setExportScope("all")}
                  className="mt-0.5 accent-blue-600"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    All Levels
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Multi-page PDF with{" "}
                    <span className="font-medium text-blue-600">
                      {filteredLevels.length} levels
                    </span>{" "}
                    — one timetable per page
                  </p>
                </div>
              </label>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-1.5">
              <p className="font-semibold text-slate-700 mb-2">PDF includes:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {[
                  "A4 landscape layout",
                  "Period-based columns",
                  "Color-coded class types",
                  "Course, instructor & room",
                  "Closed day patterns",
                  "Faculty & program header",
                  "Export date & session count",
                  "One timetable per page",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowExportModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || (exportScope === "current" && !selLevel)}
                className="gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div >
  );
}
