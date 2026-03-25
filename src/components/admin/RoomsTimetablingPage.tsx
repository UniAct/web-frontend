import { useState, useMemo, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import {
  Plus,
  Calendar,
  Clock,
  Users,
  Edit,
  X,
  ChevronDown,
  ChevronUp,
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
  Save,
  Download,
  FileText,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
//  INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

interface RoomsTimetablingPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

interface Faculty { id: string; name: string; code: string }
interface Program { id: string; name: string; code: string; facultyId: string }
interface ProgramLevel { id: string; level: number; label: string; programId: string }
interface Course { id: string; code: string; name: string; credits: number; programId: string; levelId: string }
interface Room { id: string; code: string; name: string; capacity: number; type: string }

interface ScheduledClass {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  classType: "lecture" | "lab" | "tutorial" | "seminar";
  instructor: string;
  roomId: string;
  roomCode: string;
}

interface DayRange { startTime: string; endTime: string; enabled: boolean }

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_ABBR: Record<string, string> = {
  Saturday: "Sat", Sunday: "Sun", Monday: "Mon", Tuesday: "Tue",
  Wednesday: "Wed", Thursday: "Thu", Friday: "Fri",
};

const PIXELS_PER_MINUTE = 2;
const SLOT_INTERVAL = 30;
const TIME_COL_WIDTH = 88;
const BODY_MAX_HEIGHT = 580; // px — scrollable timetable body height

// ─────────────────────────────────────────────────────────────────────────────
//  CLASS-TYPE COLORS (Issue 2 fix — type-based, not course-based)
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, {
  bg: string; text: string; border: string; header: string;
  pdfBg: [number, number, number]; pdfHeader: [number, number, number]; pdfText: [number, number, number];
}> = {
  lecture: {
    bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-300", header: "bg-blue-500",
    pdfBg: [219, 234, 254], pdfHeader: [59, 130, 246], pdfText: [30, 64, 175],
  },
  lab: {
    bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300", header: "bg-emerald-500",
    pdfBg: [209, 250, 229], pdfHeader: [16, 185, 129], pdfText: [6, 95, 70],
  },
  tutorial: {
    bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300", header: "bg-amber-500",
    pdfBg: [254, 243, 199], pdfHeader: [245, 158, 11], pdfText: [120, 53, 15],
  },
  seminar: {
    bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-300", header: "bg-purple-500",
    pdfBg: [243, 232, 255], pdfHeader: [168, 85, 247], pdfText: [88, 28, 135],
  },
};

const getColors = (type: string) => TYPE_COLORS[type] ?? TYPE_COLORS.lecture;

// ─────────────────────────────────────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

const FACULTIES: Faculty[] = [
  { id: "fac1", code: "ENG", name: "Faculty of Engineering" },
  { id: "fac2", code: "CS", name: "Faculty of Computer Science" },
  { id: "fac3", code: "BUS", name: "Faculty of Business" },
  { id: "fac4", code: "SCI", name: "Faculty of Science" },
];
const PROGRAMS: Program[] = [
  { id: "p1", code: "CE", name: "Computer Engineering", facultyId: "fac1" },
  { id: "p2", code: "EE", name: "Electrical Engineering", facultyId: "fac1" },
  { id: "p3", code: "CS", name: "Computer Science", facultyId: "fac2" },
  { id: "p4", code: "IS", name: "Information Systems", facultyId: "fac2" },
  { id: "p5", code: "BA", name: "Business Administration", facultyId: "fac3" },
  { id: "p6", code: "PH", name: "Applied Physics", facultyId: "fac4" },
];
const PROGRAM_LEVELS: ProgramLevel[] = [
  { id: "lv1-p1", level: 1, label: "Level 1", programId: "p1" },
  { id: "lv2-p1", level: 2, label: "Level 2", programId: "p1" },
  { id: "lv3-p1", level: 3, label: "Level 3", programId: "p1" },
  { id: "lv4-p1", level: 4, label: "Level 4", programId: "p1" },
  { id: "lv1-p3", level: 1, label: "Level 1", programId: "p3" },
  { id: "lv2-p3", level: 2, label: "Level 2", programId: "p3" },
  { id: "lv3-p3", level: 3, label: "Level 3", programId: "p3" },
  { id: "lv1-p4", level: 1, label: "Level 1", programId: "p4" },
  { id: "lv2-p4", level: 2, label: "Level 2", programId: "p4" },
  { id: "lv1-p5", level: 1, label: "Level 1", programId: "p5" },
  { id: "lv2-p5", level: 2, label: "Level 2", programId: "p5" },
];
const ALL_COURSES: Course[] = [
  { id: "c1", code: "CS101", name: "Introduction to Programming", credits: 3, programId: "p1", levelId: "lv1-p1" },
  { id: "c2", code: "CS101L", name: "Programming Lab", credits: 1, programId: "p1", levelId: "lv1-p1" },
  { id: "c3", code: "MATH101", name: "Calculus I", credits: 3, programId: "p1", levelId: "lv1-p1" },
  { id: "c4", code: "PHYS101", name: "Physics I", credits: 3, programId: "p1", levelId: "lv1-p1" },
  { id: "c5", code: "PHYS101L", name: "Physics Lab I", credits: 1, programId: "p1", levelId: "lv1-p1" },
  { id: "c6", code: "ENG201", name: "Technical Writing", credits: 2, programId: "p1", levelId: "lv2-p1" },
  { id: "c7", code: "CE201", name: "Digital Logic Design", credits: 3, programId: "p1", levelId: "lv2-p1" },
  { id: "c8", code: "CE301", name: "Computer Architecture", credits: 3, programId: "p1", levelId: "lv3-p1" },
  { id: "c9", code: "CS201", name: "Data Structures & Algorithms", credits: 3, programId: "p3", levelId: "lv1-p3" },
  { id: "c10", code: "CS301", name: "Operating Systems", credits: 3, programId: "p3", levelId: "lv2-p3" },
  { id: "c11", code: "IS101", name: "Information Systems Fundamentals", credits: 3, programId: "p4", levelId: "lv1-p4" },
  { id: "c12", code: "BA101", name: "Principles of Management", credits: 3, programId: "p5", levelId: "lv1-p5" },
];
const ROOMS: Room[] = [
  { id: "r1", code: "A101", name: "Lecture Hall A101", capacity: 150, type: "lecture" },
  { id: "r2", code: "CS-LAB1", name: "CS Lab 1", capacity: 30, type: "lab" },
  { id: "r3", code: "B205", name: "Tutorial Room B205", capacity: 25, type: "tutorial" },
  { id: "r4", code: "C102", name: "Lecture Room C102", capacity: 60, type: "lecture" },
  { id: "r5", code: "PHYS-LAB", name: "Physics Lab", capacity: 20, type: "lab" },
  { id: "r6", code: "SEM-A", name: "Seminar Room A", capacity: 40, type: "seminar" },
];

const INITIAL_CLASSES: ScheduledClass[] = [
  {
    id: "sc1", day: "Sunday", startTime: "09:30", endTime: "11:00",
    courseId: "c1", courseCode: "CS101", courseName: "Introduction to Programming",
    classType: "lecture", instructor: "Dr. Ahmed Hassan", roomId: "r1", roomCode: "A101"
  },
  {
    id: "sc2", day: "Tuesday", startTime: "11:00", endTime: "12:00",
    courseId: "c2", courseCode: "CS101L", courseName: "Programming Lab",
    classType: "lab", instructor: "TA Sara Khaled", roomId: "r2", roomCode: "CS-LAB1"
  },
  {
    id: "sc3", day: "Saturday", startTime: "09:00", endTime: "11:30",
    courseId: "c3", courseCode: "MATH101", courseName: "Calculus I",
    classType: "lecture", instructor: "Dr. Nour Eldin", roomId: "r4", roomCode: "C102"
  },
  {
    id: "sc4", day: "Wednesday", startTime: "10:00", endTime: "11:30",
    courseId: "c4", courseCode: "PHYS101", courseName: "Physics I",
    classType: "lecture", instructor: "Dr. Omar Farouk", roomId: "r1", roomCode: "A101"
  },
  {
    id: "sc5", day: "Wednesday", startTime: "11:30", endTime: "12:30",
    courseId: "c5", courseCode: "PHYS101L", courseName: "Physics Lab I",
    classType: "lab", instructor: "TA Mona Ali", roomId: "r5", roomCode: "PHYS-LAB"
  },
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
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
const minutesToTime = (min: number) => {
  const h = Math.floor(min / 60), m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};
const fmt12 = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${dh}:${m.toString().padStart(2, "0")} ${period}`;
};
const getTypeIcon = (type: string) => {
  if (type === "lab") return <FlaskConical className="w-3 h-3 flex-shrink-0" />;
  if (type === "tutorial") return <BookOpen className="w-3 h-3 flex-shrink-0" />;
  if (type === "seminar") return <Monitor className="w-3 h-3 flex-shrink-0" />;
  return <BookOpen className="w-3 h-3 flex-shrink-0" />;
};

const deepCopy = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

const makeDefaultForm = () => ({
  day: "Sunday" as string,
  startTime: "09:00",
  endTime: "10:30",
  courseId: "",
  classType: "lecture" as "lecture" | "lab" | "tutorial" | "seminar",
  instructor: "",
  roomId: "",
});

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function RoomsTimetablingPage({ selectedUniversity }: RoomsTimetablingPageProps) {

  // ── Filter
  const [selFacultyId, setSelFacultyId] = useState("");
  const [selProgramId, setSelProgramId] = useState("");
  const [selLevelId, setSelLevelId] = useState("");

  // ── Time ranges
  const [dayRanges, setDayRanges] = useState<Record<string, DayRange>>(deepCopy(DEFAULT_DAY_RANGES));
  const [showTimeSettings, setShowTimeSettings] = useState(false);

  // ── Draft / Save system (Issue 4)
  const [savedClasses, setSavedClasses] = useState<ScheduledClass[]>(INITIAL_CLASSES);
  const [draftClasses, setDraftClasses] = useState<ScheduledClass[]>(deepCopy(INITIAL_CLASSES));

  const hasChanges = useMemo(
    () => JSON.stringify(savedClasses) !== JSON.stringify(draftClasses),
    [savedClasses, draftClasses]
  );

  const changeCount = useMemo(() => {
    const savedIds = new Set(savedClasses.map(c => c.id));
    const draftIds = new Set(draftClasses.map(c => c.id));
    const added = draftClasses.filter(c => !savedIds.has(c.id)).length;
    const removed = savedClasses.filter(c => !draftIds.has(c.id)).length;
    const modified = draftClasses.filter(c => {
      const s = savedClasses.find(x => x.id === c.id);
      return s && JSON.stringify(s) !== JSON.stringify(c);
    }).length;
    return added + removed + modified;
  }, [savedClasses, draftClasses]);

  // Force re-render utility
  const [, forceUpdate] = useState(0);

  const handleSave = () => {
    console.log("handleSave called", { draftClasses });
    setSavedClasses(deepCopy(draftClasses));
    toast.success("Timetable saved successfully!");
    forceUpdate(x => x + 1); // force re-render
  };
  const handleDiscard = () => {
    console.log("handleDiscard called", { savedClasses });
    setDraftClasses(deepCopy(savedClasses));
    toast.info("Changes discarded — reverted to last saved state");
    forceUpdate(x => x + 1); // force re-render
  };

  // ── Modal
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ScheduledClass | null>(null);
  const [formData, setFormData] = useState(makeDefaultForm());

  // ── Export modal (Issue 5)
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<"current" | "all">("current");
  const [isExporting, setIsExporting] = useState(false);

  // ── Drag & Drop
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────
  //  DERIVED
  // ─────────────────────────────────────────────────────

  const filteredPrograms = useMemo(
    () => PROGRAMS.filter(p => !selFacultyId || p.facultyId === selFacultyId),
    [selFacultyId]
  );
  const filteredLevels = useMemo(
    () => PROGRAM_LEVELS.filter(l => !selProgramId || l.programId === selProgramId),
    [selProgramId]
  );
  const filteredCourses = useMemo(
    () => ALL_COURSES.filter(c =>
      (!selProgramId || c.programId === selProgramId) &&
      (!selLevelId || c.levelId === selLevelId)
    ),
    [selProgramId, selLevelId]
  );

  const selFaculty = FACULTIES.find(f => f.id === selFacultyId);
  const selProgram = PROGRAMS.find(p => p.id === selProgramId);
  const selLevel = PROGRAM_LEVELS.find(l => l.id === selLevelId);

  // Global time range = union of all enabled day ranges
  const { globalStartMin, globalEndMin } = useMemo(() => {
    const active = DAYS.filter(d => dayRanges[d].enabled);
    if (!active.length) return { globalStartMin: 8 * 60, globalEndMin: 18 * 60 };
    const starts = active.map(d => timeToMinutes(dayRanges[d].startTime));
    const ends = active.map(d => timeToMinutes(dayRanges[d].endTime));
    return {
      globalStartMin: Math.floor(Math.min(...starts) / SLOT_INTERVAL) * SLOT_INTERVAL,
      globalEndMin: Math.ceil(Math.max(...ends) / SLOT_INTERVAL) * SLOT_INTERVAL,
    };
  }, [dayRanges]);

  const totalMinutes = globalEndMin - globalStartMin;
  const totalHeight = totalMinutes * PIXELS_PER_MINUTE;

  const allSlots = useMemo(() => {
    const slots = [];
    for (let m = globalStartMin; m < globalEndMin; m += SLOT_INTERVAL) {
      slots.push({
        absMin: m,
        time: minutesToTime(m),
        position: (m - globalStartMin) * PIXELS_PER_MINUTE,
        height: SLOT_INTERVAL * PIXELS_PER_MINUTE,
        isHour: m % 60 === 0,
      });
    }
    return slots;
  }, [globalStartMin, globalEndMin]);

  const timeMarkers = useMemo(() => {
    const markers = [];
    for (let m = globalStartMin; m <= globalEndMin; m += SLOT_INTERVAL) {
      markers.push({
        absMin: m,
        time: minutesToTime(m),
        position: (m - globalStartMin) * PIXELS_PER_MINUTE,
        isHour: m % 60 === 0,
      });
    }
    return markers;
  }, [globalStartMin, globalEndMin]);

  const coursesPool = filteredCourses.length > 0 ? filteredCourses : ALL_COURSES;
  const activeDays = DAYS.filter(d => dayRanges[d].enabled);

  // ─────────────────────────────────────────────────────
  //  HELPERS
  // ─────────────────────────────────────────────────────

  const isDaySlotActive = useCallback((day: string, absMin: number) => {
    const r = dayRanges[day];
    if (!r.enabled) return false;
    return absMin >= timeToMinutes(r.startTime) && absMin < timeToMinutes(r.endTime);
  }, [dayRanges]);

  const getClassDims = (cls: ScheduledClass) => {
    const s = timeToMinutes(cls.startTime), e = timeToMinutes(cls.endTime);
    return {
      top: (s - globalStartMin) * PIXELS_PER_MINUTE,
      height: Math.max((e - s) * PIXELS_PER_MINUTE, 30),
      duration: e - s,
    };
  };

  // ── ISSUE 3: Global smart conflict detection ──────────────────────────────
  // Returns a descriptive message string if there is a conflict, or null if clear.
  // Checks ALL classes in draftClasses (across every level/program/faculty).
  // Two conflict types:
  //   1. Room conflict  — same day + same room + overlapping times
  //   2. Instructor conflict — same day + same instructor + overlapping times
  const getConflictMessage = useCallback((
    day: string,
    start: string,
    end: string,
    roomId: string,
    instructor: string,
    excludeId?: string,
  ): string | null => {
    const s = timeToMinutes(start), e = timeToMinutes(end);
    for (const cls of draftClasses) {
      if (excludeId && cls.id === excludeId) continue;
      if (cls.day !== day) continue;
      const cs = timeToMinutes(cls.startTime), ce = timeToMinutes(cls.endTime);
      const overlaps = s < ce && e > cs;
      if (!overlaps) continue;

      // Room conflict check (only when a room has been selected)
      if (roomId && cls.roomId === roomId) {
        const room = ROOMS.find(r => r.id === roomId);
        return `Room ${room?.code ?? roomId} is already booked on ${day} from ${fmt12(cls.startTime)} to ${fmt12(cls.endTime)}`;
      }

      // Instructor conflict check (only when an instructor has been entered)
      if (instructor && cls.instructor.trim().toLowerCase() === instructor.trim().toLowerCase()) {
        return `${instructor} is already teaching another class at this time on ${day}`;
      }
    }
    return null;
  }, [draftClasses]);

  // Legacy boolean helper retained for the disabled-button check
  const hasConflict = useCallback((
    day: string, start: string, end: string,
    roomId: string, instructor: string, excludeId?: string
  ) => getConflictMessage(day, start, end, roomId, instructor, excludeId) !== null,
    [getConflictMessage]);

  const updateDayRange = (day: string, field: keyof DayRange, value: string | boolean) => {
    setDayRanges(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  // ─────────────────────────────────────────────────────
  //  EVENT HANDLERS
  // ─────────────────────────────────────────────────────

  const handleSlotClick = (day: string, time: string) => {
    if (draggingId) return;
    const r = dayRanges[day];
    const dur = Math.min(90, timeToMinutes(r.endTime) - timeToMinutes(time));
    setEditingClass(null);
    setFormData({
      ...makeDefaultForm(),
      day,
      startTime: time,
      endTime: minutesToTime(timeToMinutes(time) + Math.max(dur, 30)),
    });
    setShowModal(true);
  };

  const handleEditClass = (cls: ScheduledClass) => {
    setEditingClass(cls);
    setFormData({
      day: cls.day, startTime: cls.startTime, endTime: cls.endTime,
      courseId: cls.courseId, classType: cls.classType,
      instructor: cls.instructor, roomId: cls.roomId,
    });
    setShowModal(true);
  };

  const handleSaveClass = () => {
    if (!formData.courseId || !formData.instructor || !formData.roomId) {
      toast.error("Please fill in all required fields"); return;
    }
    if (timeToMinutes(formData.startTime) >= timeToMinutes(formData.endTime)) {
      toast.error("End time must be after start time"); return;
    }
    const conflictMsg = getConflictMessage(
      formData.day, formData.startTime, formData.endTime,
      formData.roomId, formData.instructor, editingClass?.id
    );
    if (conflictMsg) { toast.error(conflictMsg); return; }
    const course = ALL_COURSES.find(c => c.id === formData.courseId);
    const room = ROOMS.find(r => r.id === formData.roomId);
    if (!course || !room) return;

    if (editingClass) {
      setDraftClasses(prev => prev.map(c => c.id === editingClass.id ? {
        ...c, day: formData.day, startTime: formData.startTime, endTime: formData.endTime,
        courseId: course.id, courseCode: course.code, courseName: course.name,
        classType: formData.classType, instructor: formData.instructor,
        roomId: room.id, roomCode: room.code,
      } : c));
      toast.success("Class updated — remember to save!");
    } else {
      const newClass: ScheduledClass = {
        id: Date.now().toString(),
        day: formData.day, startTime: formData.startTime, endTime: formData.endTime,
        courseId: course.id, courseCode: course.code, courseName: course.name,
        classType: formData.classType, instructor: formData.instructor,
        roomId: room.id, roomCode: room.code,
      };
      setDraftClasses(prev => [...prev, newClass]);
      toast.success("Class added to draft — remember to save!");
    }
    setShowModal(false);
    setEditingClass(null);
  };

  const handleDeleteClass = (id: string) => {
    setDraftClasses(prev => prev.filter(c => c.id !== id));
    toast.info("Class removed — remember to save!");
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, cls: ScheduledClass) => {
    setDraggingId(cls.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cls.id);
  };
  const handleDragEnd = () => { setDraggingId(null); setDragOverKey(null); };

  const handleSlotDragOver = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault(); e.dataTransfer.dropEffect = "move";
    const key = `${day}|${time}`;
    if (dragOverKey !== key) setDragOverKey(key);
  };
  const handleSlotDrop = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    const classId = e.dataTransfer.getData("text/plain");
    const cls = draftClasses.find(c => c.id === classId);
    if (!cls) return;
    const duration = timeToMinutes(cls.endTime) - timeToMinutes(cls.startTime);
    const newStartMin = timeToMinutes(time);
    const newEndMin = newStartMin + duration;
    const range = dayRanges[day];
    const dragConflict = getConflictMessage(
      day, time, minutesToTime(newEndMin), cls.roomId, cls.instructor, classId
    );
    if (!range.enabled || newEndMin > timeToMinutes(range.endTime)) {
      toast.error("Cannot place class outside the day's time range");
    } else if (dragConflict) {
      toast.error(dragConflict);
    } else {
      setDraftClasses(prev => prev.map(c =>
        c.id === classId
          ? { ...c, day, startTime: time, endTime: minutesToTime(newEndMin) }
          : c
      ));
      toast.success("Class rescheduled — remember to save!");
    }
    setDraggingId(null); setDragOverKey(null);
  };

  // ─────────────────────────────────────────────────────
  //  PDF EXPORT (Issue 5 — Browser Print-to-PDF)
  // ─────────────────────────────────────────────────────

  const handleExport = () => {
    setIsExporting(true);

    const levelsToExport = exportScope === "current" && selLevel
      ? [selLevel]
      : PROGRAM_LEVELS;

    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });

    const hourSlots: number[] = [];
    for (let m = globalStartMin; m <= globalEndMin; m += 60) hourSlots.push(m);

    const printContent = levelsToExport.map(level => {
      const prog = PROGRAMS.find(p => p.id === level.programId);
      const fac = FACULTIES.find(f => f.id === prog?.facultyId);
      const classes = draftClasses;

      return `
        <div class="page-break" style="page-break-after: always; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #4f46e5 100%); 
                      color: white; padding: 24px; border-radius: 12px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: bold;">UniAct University</h1>
                <p style="margin: 0 0 4px 0; font-size: 14px; opacity: 0.9;">
                  ${[fac?.name, prog?.name].filter(Boolean).join(" › ") || "All Faculties & Programs"}
                </p>
                <p style="margin: 0; font-size: 18px; font-weight: 600;">${level.label}</p>
              </div>
              <div style="text-align: right; font-size: 12px; opacity: 0.8;">
                <div>Exported: ${dateStr}</div>
                <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: flex-end;">
                  ${["lecture", "lab", "tutorial", "seminar"].map(type => {
        const colors = TYPE_COLORS[type];
        return `<span style="display: inline-block; background: ${colors.header}; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">${type.charAt(0).toUpperCase() + type.slice(1)}</span>`;
      }).join("")}
                </div>
              </div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="border: 1px solid #cbd5e1; padding: 12px 8px; text-align: center; width: 80px; font-weight: 600; color: #64748b;">TIME</th>
                ${DAYS.map(day => {
        const r = dayRanges[day];
        return `<th style="border: 1px solid #cbd5e1; padding: 12px 8px; text-align: center; font-weight: 600; color: ${r.enabled ? "#1e293b" : "#94a3b8"};">
                    <div>${DAY_ABBR[day]}</div>
                    <div style="font-size: 9px; font-weight: normal; margin-top: 2px; color: #64748b;">
                      ${r.enabled ? `${fmt12(r.startTime).replace(":00", "").replace(" ", "")}-${fmt12(r.endTime).replace(":00", "").replace(" ", "")}` : "Closed"}
                    </div>
                  </th>`;
      }).join("")}
              </tr>
            </thead>
            <tbody>
              ${hourSlots.map((timeSlot, rowIndex) => {
        return `<tr>
                  <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center; background: #fafafa; font-weight: 500; color: #475569; vertical-align: top;">
                    ${fmt12(minutesToTime(timeSlot))}
                  </td>
                  ${DAYS.map(day => {
          const r = dayRanges[day];
          const cellClasses = classes.filter(cls => {
            if (cls.day !== day) return false;
            const clsStart = timeToMinutes(cls.startTime);
            const clsEnd = timeToMinutes(cls.endTime);
            const slotStart = timeSlot;
            const slotEnd = timeSlot + 60;
            return clsStart < slotEnd && clsEnd > slotStart;
          });

          const mainClass = cellClasses.find(cls =>
            timeToMinutes(cls.startTime) === timeSlot
          );

          if (!r.enabled) {
            return `<td style="border: 1px solid #e2e8f0; background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #f1f5f9 10px, #f1f5f9 20px); position: relative;">
                        ${rowIndex === Math.floor(hourSlots.length / 2) ? '<div style="text-align: center; color: #94a3b8; font-size: 10px; padding: 8px;">Closed</div>' : ''}
                      </td>`;
          }

          if (mainClass) {
            const duration = timeToMinutes(mainClass.endTime) - timeToMinutes(mainClass.startTime);
            const rowSpan = Math.ceil(duration / 60);
            const colors = TYPE_COLORS[mainClass.classType];

            return `<td rowspan="${rowSpan}" style="border: 1px solid #e2e8f0; padding: 0; vertical-align: top;">
                        <div style="background: linear-gradient(135deg, ${colors.bg} 0%, white 100%); 
                                    border-left: 4px solid ${colors.header}; 
                                    padding: 8px; height: 100%; min-height: ${rowSpan * 40}px;">
                          <div style="font-weight: 700; color: ${colors.text}; margin-bottom: 4px; font-size: 12px;">
                            ${mainClass.courseCode}
                          </div>
                          <div style="color: #334155; font-size: 10px; line-height: 1.3; margin-bottom: 6px;">
                            ${mainClass.courseName}
                          </div>
                          <div style="font-size: 9px; color: #64748b; margin-top: 6px; border-top: 1px solid ${colors.border}; padding-top: 4px;">
                            <div>${fmt12(mainClass.startTime)} – ${fmt12(mainClass.endTime)}</div>
                            <div>${mainClass.instructor}</div>
                            <div>Room: ${mainClass.roomCode}</div>
                            <div style="margin-top: 2px;">
                              <span style="background: ${colors.header}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 8px; font-weight: 600;">
                                ${mainClass.classType.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>`;
          } else if (cellClasses.length === 0) {
            return `<td style="border: 1px solid #e2e8f0; background: white; height: 40px;"></td>`;
          } else {
            return '';
          }
        }).join("")}
                </tr>`;
      }).join("")}
            </tbody>
          </table>

          <div style="text-align: center; font-size: 10px; color: #94a3b8; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
            ${classes.length} total classes scheduled • Generated by UniAct Timetabling System
          </div>
        </div>
      `;
    }).join("");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to export PDF");
      setIsExporting(false);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Timetable - ${exportScope === "current" && selLevel ? selLevel.label : "All Levels"}</title>
          <style>
            @media print {
              @page {
                size: A4 landscape;
                margin: 10mm;
              }
              .page-break {
                page-break-after: always;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            table {
              background: white;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      setIsExporting(false);
      setShowExportModal(false);
      toast.success("Print dialog opened — save as PDF to download");
    }, 500);
  };

  // ─────────────────────────────────────────────────────
  //  GUARD
  // ─────────────────────────────────────────────────────

  if (!selectedUniversity) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <LayoutGrid className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No University Selected</h3>
          <p className="text-slate-500 text-center">Please select a university to manage its timetables.</p>
        </CardContent>
      </Card>
    );
  }

  // ─────────────────────────────────────────────────────
  //  RENDER
  // ���────────────────────────────────────────────────────

  return (
    <div className="space-y-5 pb-24">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Timetabling & Schedule Management</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Build weekly schedules per program level — click any slot to add, drag to reschedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export button — only after saving */}
          <Button
            variant="outline"
            onClick={() => setShowExportModal(true)}
            disabled={hasChanges}
            className="gap-2"
            title={hasChanges ? "Save the timetable first before exporting" : "Export timetable as PDF"}
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button
            onClick={() => { setEditingClass(null); setFormData(makeDefaultForm()); setShowModal(true); }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Class
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <Card className="border-blue-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 flex items-center gap-2">
          <School className="w-4 h-4 text-white/80" />
          <span className="text-sm font-medium text-white">Scope Filter</span>
          <span className="text-xs text-white/60 ml-1">— Faculty → Program → Level</span>
        </div>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3">
            {/* Faculty */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                <Building2 className="w-3 h-3 inline mr-1" />Faculty
              </label>
              <select
                value={selFacultyId}
                onChange={e => { setSelFacultyId(e.target.value); setSelProgramId(""); setSelLevelId(""); }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              >
                <option value="">All Faculties</option>
                {FACULTIES.map(f => <option key={f.id} value={f.id}>{f.code} — {f.name}</option>)}
              </select>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center hidden lg:block" />
            {/* Program */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                <BookOpen className="w-3 h-3 inline mr-1" />Program
              </label>
              <select
                value={selProgramId}
                onChange={e => { setSelProgramId(e.target.value); setSelLevelId(""); }}
                disabled={!selFacultyId}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Programs</option>
                {filteredPrograms.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
              </select>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center hidden lg:block" />
            {/* Level */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                <Layers className="w-3 h-3 inline mr-1" />Program Level
              </label>
              <select
                value={selLevelId}
                onChange={e => setSelLevelId(e.target.value)}
                disabled={!selProgramId}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Levels</option>
                {filteredLevels.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>
            {/* Breadcrumbs */}
            {(selFaculty || selProgram || selLevel) && (
              <div className="flex items-center gap-1.5 flex-wrap lg:pb-0.5">
                {selFaculty && <Badge className="bg-blue-100 text-blue-800 border border-blue-200">{selFaculty.code}</Badge>}
                {selProgram && <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-200">{selProgram.code}</Badge>}
                {selLevel && <Badge className="bg-purple-100 text-purple-800 border border-purple-200">Yr {selLevel.level}</Badge>}
                <button
                  onClick={() => { setSelFacultyId(""); setSelProgramId(""); setSelLevelId(""); }}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >Clear</button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Time Range Settings (Issue 3 — fixed toggle) ── */}
      <Card className="shadow-sm">
        <CardHeader
          className="pb-3 cursor-pointer select-none"
          onClick={() => setShowTimeSettings(v => !v)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-500" />
              <CardTitle className="text-sm font-semibold text-slate-700">Day Time Range Settings</CardTitle>
              <span className="text-xs text-slate-400 hidden sm:inline">— Customize each day independently</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {DAYS.map(d => (
                  <div key={d} className={`w-2 h-2 rounded-full transition-colors duration-300 ${dayRanges[d].enabled ? "bg-blue-500" : "bg-slate-300"}`} title={d} />
                ))}
              </div>
              {showTimeSettings ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>
        </CardHeader>
        {showTimeSettings && (
          <CardContent className="pt-0 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {DAYS.map(day => {
                const r = dayRanges[day];
                return (
                  <div
                    key={day}
                    className={`rounded-xl border-2 p-3 transition-all duration-300 ${r.enabled
                      ? "border-blue-200 bg-gradient-to-b from-blue-50 to-white"
                      : "border-slate-200 bg-slate-50 opacity-70"
                      }`}
                  >
                    {/* Day header — fixed height, proper alignment (Issue 3) */}
                    <div className="flex items-center justify-between h-6 mb-3">
                      <span className="text-sm font-semibold text-slate-700">{DAY_ABBR[day]}</span>

                      {/* Toggle switch — Issue 3 fix: perfectly centered thumb */}
                      <button
                        onClick={() => updateDayRange(day, "enabled", !r.enabled)}
                        className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${r.enabled ? "bg-blue-500" : "bg-slate-300"
                          }`}
                        style={{ width: 36, height: 20 }}
                        role="switch"
                        aria-checked={r.enabled}
                      >
                        <span
                          className="bg-white rounded-full shadow-sm transition-transform duration-200"
                          style={{
                            width: 14,
                            height: 14,
                            transform: r.enabled ? "translateX(19px)" : "translateX(3px)",
                            display: "block",
                          }}
                        />
                      </button>
                    </div>

                    {r.enabled ? (
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">From</p>
                          <input
                            type="time"
                            value={r.startTime}
                            onChange={e => updateDayRange(day, "startTime", e.target.value)}
                            className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">To</p>
                          <input
                            type="time"
                            value={r.endTime}
                            onChange={e => updateDayRange(day, "endTime", e.target.value)}
                            className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </div>
                        <div className="text-center pt-1.5 border-t border-blue-100">
                          <span className="text-xs text-blue-600 font-medium">{fmt12(r.startTime)}</span>
                          <span className="text-xs text-slate-400 mx-1">–</span>
                          <span className="text-xs text-blue-600 font-medium">{fmt12(r.endTime)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center">Closed</p>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              💡 Each day has its own independent time range — the timetable grid updates live as you adjust
            </p>
          </CardContent>
        )}
      </Card>

      {/* ── Fluid Weekly Timetable — ISSUE 1 FIX: frozen header + scrollable body ── */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5 text-blue-600" />
                Fluid Weekly Timetable
                {selLevel && (
                  <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 ml-1">{selLevel.label}</Badge>
                )}
                {hasChanges && (
                  <Badge className="bg-amber-100 text-amber-700 border border-amber-200 ml-1 animate-pulse">
                    {changeCount} unsaved {changeCount === 1 ? "change" : "changes"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                <span className="inline-flex items-center gap-1 mr-3">
                  <span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300 inline-block" />
                  Click empty slot → Add class
                </span>
                <span className="inline-flex items-center gap-1 mr-3">
                  <GripVertical className="w-3 h-3 text-slate-400" />
                  Drag class → Reschedule
                </span>
              </CardDescription>
            </div>
            {/* Color legend — type-based (Issue 2) */}
            <div className="flex flex-wrap gap-1.5">
              {(["lecture", "lab", "tutorial", "seminar"] as const).map(type => {
                const c = TYPE_COLORS[type];
                return (
                  <span key={type} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
                    {getTypeIcon(type)}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/*
            ISSUE 1 FIX ARCHITECTURE:
            overflow-x-auto (outer, shared horizontal scroll)
              └─ minWidth container
                   ├─ FROZEN HEADER (no vertical scroll, always visible)
                   └─ SCROLLABLE BODY (overflow-y-auto, independent vertical scroll)
                        starts at top, first slot always visible
          */}
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${TIME_COL_WIDTH + DAYS.length * 120}px` }}>

              {/* ─── FROZEN HEADER — never scrolls vertically ─── */}
              <div className="flex border-b-2 border-slate-200 bg-white" style={{ position: "sticky", top: 0, zIndex: 20 }}>
                {/* Time column header */}
                <div
                  className="flex-shrink-0 flex flex-col items-center justify-center border-r-2 border-slate-200 bg-slate-50 py-3 gap-1"
                  style={{ width: TIME_COL_WIDTH }}
                >
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400 font-medium">Time</span>
                </div>

                {/* Day columns */}
                {DAYS.map(day => {
                  const r = dayRanges[day];
                  const count = draftClasses.filter(c => c.day === day).length;
                  return (
                    <div
                      key={day}
                      className={`flex-1 min-w-[110px] py-3 px-2 text-center border-r border-slate-200 last:border-r-0 ${!r.enabled ? "bg-slate-50" : "bg-white"}`}
                    >
                      <p className={`text-sm font-bold ${!r.enabled ? "text-slate-400" : "text-slate-800"}`}>{DAY_ABBR[day]}</p>
                      <p className={`text-xs mt-0.5 ${!r.enabled ? "text-slate-300" : "text-slate-500"}`}>{day}</p>
                      {r.enabled ? (
                        <>
                          <p className="text-xs text-blue-500 mt-1 font-medium">
                            {count} {count === 1 ? "class" : "classes"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {fmt12(r.startTime).replace(":00", "").replace(" ", "")}&nbsp;–&nbsp;
                            {fmt12(r.endTime).replace(":00", "").replace(" ", "")}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-300 mt-1">Closed</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ─── SCROLLABLE BODY — independent vertical scroll ─── */}
              {/* overflow-y-auto here, NOT on the outer container */}
              <div
                className="overflow-y-auto"
                style={{ maxHeight: BODY_MAX_HEIGHT }}
              >
                {/* Inner body: flex row, height = totalHeight, no extra padding/offset */}
                <div className="flex" style={{ height: totalHeight, minHeight: totalHeight }}>

                  {/* Time column — full height, markers positioned from top=0 */}
                  <div
                    className="flex-shrink-0 bg-gradient-to-b from-slate-50 to-white border-r-2 border-slate-200 relative"
                    style={{ width: TIME_COL_WIDTH, height: totalHeight }}
                  >
                    {timeMarkers.map((marker, idx) => (
                      <div
                        key={marker.absMin}
                        className="absolute right-0 left-0 flex items-start justify-end pr-2 pointer-events-none"
                        style={{ top: marker.position }}
                      >
                        <span
                          className={`leading-none ${marker.isHour
                            ? "text-xs font-semibold text-slate-600"
                            : "text-[10px] text-slate-400"
                            }`}
                          style={{
                            // ISSUE 1 FIX: first label anchored to top (translateY 0) so it
                            // is never clipped by the container's overflow. All subsequent
                            // labels use the standard -50% centering on their grid line.
                            transform: idx === 0 ? "translateY(0)" : "translateY(-50%)",
                          }}
                        >
                          {fmt12(marker.time)}
                        </span>
                        <div
                          className={`absolute right-0 ${marker.isHour ? "bg-slate-400 w-2.5" : "bg-slate-300 w-1.5"} h-px`}
                          style={{ top: 0 }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {DAYS.map(day => {
                    const r = dayRanges[day];
                    const dayClasses = draftClasses.filter(c => c.day === day);

                    return (
                      <div
                        key={day}
                        className="flex-1 min-w-[110px] relative border-r border-slate-200 last:border-r-0"
                        style={{ height: totalHeight }}
                      >
                        {/* Slot cells */}
                        {allSlots.map(slot => {
                          const active = isDaySlotActive(day, slot.absMin);
                          const overKey = `${day}|${slot.time}`;
                          const isOver = dragOverKey === overKey && draggingId !== null;

                          return (
                            <div
                              key={slot.absMin}
                              className={`absolute left-0 right-0 transition-colors duration-150 group
                                ${slot.isHour ? "border-t border-slate-200" : "border-t border-slate-100"}
                                ${active
                                  ? isOver
                                    ? "bg-blue-100 cursor-copy"
                                    : "bg-white hover:bg-blue-50/50 cursor-pointer"
                                  : r.enabled
                                    ? "bg-slate-50/60 cursor-not-allowed"
                                    : "bg-slate-100/60 cursor-not-allowed"
                                }
                              `}
                              style={{ top: slot.position, height: slot.height }}
                              onClick={() => active && handleSlotClick(day, slot.time)}
                              onDragOver={e => active ? handleSlotDragOver(e, day, slot.time) : e.preventDefault()}
                              onDragLeave={() => setDragOverKey(null)}
                              onDrop={e => active ? handleSlotDrop(e, day, slot.time) : e.preventDefault()}
                            >
                              {/* Add hint on hover */}
                              {active && !draggingId && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <div className="border border-dashed border-blue-300 rounded-md w-[85%] h-[72%] flex items-center justify-center bg-blue-50/40">
                                    <Plus className="w-3 h-3 text-blue-400" />
                                  </div>
                                </div>
                              )}
                              {/* Drop zone highlight */}
                              {isOver && (
                                <div className="absolute inset-0 border-2 border-blue-400 border-dashed rounded bg-blue-100/70 z-10 pointer-events-none flex items-center justify-center">
                                  <Move className="w-4 h-4 text-blue-500" />
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Closed overlay */}
                        {!r.enabled && (
                          <div className="absolute inset-0 z-20 bg-slate-100/80 flex flex-col items-center justify-center gap-1 pointer-events-none">
                            <div className="opacity-30">
                              {[0, 1, 2, 3, 4].map(i => (
                                <div key={i} className="w-20 h-px bg-slate-400 rotate-45 mb-3" />
                              ))}
                            </div>
                            <span className="text-xs text-slate-400 font-medium absolute">Closed</span>
                          </div>
                        )}

                        {/* Class cards — Issue 2: color by type */}
                        {dayClasses.map(cls => {
                          const { top, height, duration } = getClassDims(cls);
                          const colors = getColors(cls.classType);
                          const isDragging = draggingId === cls.id;

                          return (
                            <div
                              key={cls.id}
                              draggable
                              onDragStart={e => handleDragStart(e, cls)}
                              onDragEnd={handleDragEnd}
                              // ISSUE 2 FIX: double-click opens edit modal (single-click unchanged)
                              onDoubleClick={e => { e.stopPropagation(); handleEditClass(cls); }}
                              className={`absolute left-1 right-1 rounded-xl border-2 overflow-hidden z-20 select-none
                                transition-all duration-200 group
                                ${colors.bg} ${colors.border}
                                ${isDragging
                                  ? "opacity-40 scale-95 shadow-none cursor-grabbing"
                                  : "shadow-md hover:shadow-xl hover:scale-[1.015] cursor-grab"
                                }
                              `}
                              style={{ top: top + 2, height: Math.max(height - 4, 28) }}
                            >
                              {/* Top accent bar */}
                              <div className={`h-1.5 w-full ${colors.header} shrink-0`} />

                              <div className="px-1.5 pb-1.5 flex flex-col h-[calc(100%-6px)] overflow-hidden">
                                {/* Badge row + actions */}
                                <div className="flex items-start justify-between gap-0.5 mt-1">
                                  <div className="flex items-center gap-1 min-w-0">
                                    {getTypeIcon(cls.classType)}
                                    <Badge variant="outline" className="text-xs py-0 px-1.5 bg-white/80 border-white/60 shrink-0">
                                      {cls.courseCode}
                                    </Badge>
                                  </div>
                                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button
                                      onClick={e => { e.stopPropagation(); handleEditClass(cls); }}
                                      className={`p-0.5 rounded hover:bg-white/70 ${colors.text} transition-colors`}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={e => { e.stopPropagation(); handleDeleteClass(cls.id); }}
                                      className="p-0.5 rounded hover:bg-white/70 text-red-500 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Course name */}
                                {height >= 54 && (
                                  <p className={`text-xs font-semibold ${colors.text} line-clamp-2 leading-tight mt-0.5`} title={cls.courseName}>
                                    {cls.courseName}
                                  </p>
                                )}

                                {/* Time */}
                                <div className={`text-xs ${colors.text} opacity-80 font-medium mt-auto`}>
                                  {fmt12(cls.startTime)} – {fmt12(cls.endTime)}
                                </div>

                                {/* Room + duration */}
                                {height >= 72 && (
                                  <div className="text-xs text-slate-500 opacity-70">
                                    {duration}min · {cls.roomCode}
                                  </div>
                                )}

                                {/* Instructor */}
                                {height >= 92 && (
                                  <div className={`text-xs ${colors.text} opacity-70 flex items-center gap-1 mt-0.5 truncate`}>
                                    <Users className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">{cls.instructor}</span>
                                  </div>
                                )}

                                {/* Grip */}
                                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-25 transition-opacity">
                                  <GripVertical className="w-3 h-3 text-slate-500" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer stats */}
          <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50 flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{draftClasses.length}</span> total classes
            </span>
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{activeDays.length}</span> active days
            </span>
            <span className="text-xs text-slate-500">
              Grid:&nbsp;
              <span className="font-semibold text-slate-700">{fmt12(minutesToTime(globalStartMin))}</span>
              &nbsp;–&nbsp;
              <span className="font-semibold text-slate-700">{fmt12(minutesToTime(globalEndMin))}</span>
            </span>
            {hasChanges && (
              <span className="text-xs text-amber-600 font-medium">⚠ {changeCount} unsaved {changeCount === 1 ? "change" : "changes"}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════
          STICKY SAVE BAR — Issue 4
          Shown only when draftClasses ≠ savedClasses
      ══════════════════════════════════════════════════ */}
      {hasChanges && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
        >
          <div
            className="pointer-events-auto mx-4 mb-4 w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/15 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 shrink-0">
                <Save className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {changeCount} unsaved {changeCount === 1 ? "change" : "changes"}
                </p>
                <p className="text-xs text-slate-500">Save to apply changes or discard to revert</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                className="gap-1.5 flex-1 sm:flex-none border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="gap-1.5 flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-3.5 h-3.5" />
                Save Timetable
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          ADD / EDIT CLASS MODAL
      ══════════════════════════════════════════════════ */}
      <Modal
        open={showModal}
        onOpenChange={open => { if (!open) { setShowModal(false); setEditingClass(null); } }}
      >
        <ModalContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>{editingClass ? "Edit Scheduled Class" : "Schedule New Class"}</ModalTitle>
            <ModalDescription>
              {editingClass ? "Update the class details — changes go to draft until saved" : "Add a class to the timetable — changes go to draft until saved"}
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-4">
            {/* Day / Start / End */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Day *</label>
                <select
                  value={formData.day}
                  onChange={e => setFormData({ ...formData, day: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {DAYS.filter(d => dayRanges[d].enabled).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Time *</label>
                <input type="time" value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <p className="text-xs text-slate-400 mt-0.5">{fmt12(formData.startTime)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Time *</label>
                <input type="time" value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <p className="text-xs text-slate-400 mt-0.5">{fmt12(formData.endTime)}</p>
              </div>
            </div>
            {/* Course / Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Course *</label>
                <select value={formData.courseId}
                  onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select a course…</option>
                  {coursesPool.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Class Type *</label>
                <select
                  value={formData.classType}
                  onChange={e => setFormData({ ...formData, classType: e.target.value as typeof formData.classType })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="seminar">Seminar</option>
                </select>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getColors(formData.classType).bg} ${getColors(formData.classType).text} ${getColors(formData.classType).border}`}>
                    {getTypeIcon(formData.classType)}
                    {formData.classType}
                  </span>
                </div>
              </div>
            </div>
            {/* Room / Instructor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Room *</label>
                <select value={formData.roomId}
                  onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select a room…</option>
                  {ROOMS.map(r => <option key={r.id} value={r.id}>{r.code} — {r.name} (Cap: {r.capacity})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Instructor *</label>
                <Input
                  value={formData.instructor}
                  onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="e.g., Dr. Ahmed Hassan"
                />
              </div>
            </div>

            {/* Validation preview */}
            {formData.courseId && formData.startTime && formData.endTime && (() => {
              const timeInvalid = timeToMinutes(formData.startTime) >= timeToMinutes(formData.endTime);
              const conflictMsg = !timeInvalid
                ? getConflictMessage(
                  formData.day, formData.startTime, formData.endTime,
                  formData.roomId, formData.instructor, editingClass?.id
                )
                : null;
              const hasError = timeInvalid || !!conflictMsg;
              return (
                <div className={`rounded-xl border p-3.5 text-sm transition-colors ${hasError ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
                  }`}>
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
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span className="font-medium">Schedule looks good!</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 mt-1 pl-6">
                        <div><span className="text-slate-400">Day:</span> <span className="font-medium">{formData.day}</span></div>
                        <div><span className="text-slate-400">Time:</span> <span className="font-medium">{fmt12(formData.startTime)} – {fmt12(formData.endTime)}</span></div>
                        <div><span className="text-slate-400">Duration:</span> <span className="font-medium">{timeToMinutes(formData.endTime) - timeToMinutes(formData.startTime)} min</span></div>
                        <div><span className="text-slate-400">Type:</span> <span className="font-medium capitalize">{formData.classType}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => { setShowModal(false); setEditingClass(null); }}>Cancel</Button>
              <Button
                onClick={handleSaveClass}
                disabled={
                  !formData.courseId || !formData.instructor || !formData.roomId ||
                  timeToMinutes(formData.startTime) >= timeToMinutes(formData.endTime) ||
                  hasConflict(formData.day, formData.startTime, formData.endTime, formData.roomId, formData.instructor, editingClass?.id)
                }
              >
                {editingClass ? "Update Class" : "Add to Draft"}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      {/* ══════════════════════════════════════════════════
          EXPORT MODAL — Issue 5
      ═══════════════════════════════════════��══════════ */}
      <Modal
        open={showExportModal}
        onOpenChange={open => { if (!open) setShowExportModal(false); }}
      >
        <ModalContent className="max-w-lg">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Export Timetable as PDF
            </ModalTitle>
            <ModalDescription>
              Choose the export scope — landscape A4 PDF with full schedule details
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4">
            {/* Scope options */}
            <div className="space-y-3">
              {/* Current level */}
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${exportScope === "current" ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                } ${!selLevel ? "opacity-50 cursor-not-allowed" : ""}`}>
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
                  <p className="text-sm font-semibold text-slate-800">Current Level Only</p>
                  {selLevel ? (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Exports a single-page PDF for <span className="font-medium text-blue-600">{selLevel.label}</span>
                      {selProgram && <> ({selProgram.name})</>}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-0.5">⚠ Select a program level in the filter first</p>
                  )}
                </div>
              </label>

              {/* All levels */}
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${exportScope === "all" ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                }`}>
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={exportScope === "all"}
                  onChange={() => setExportScope("all")}
                  className="mt-0.5 accent-blue-600"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">All Levels</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Exports a multi-page PDF with each of the{" "}
                    <span className="font-medium text-blue-600">{PROGRAM_LEVELS.length} program levels</span>
                    {" "}on its own dedicated page
                  </p>
                </div>
              </label>
            </div>

            {/* PDF preview info */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-1.5">
              <p className="font-semibold text-slate-700 mb-2">PDF will include:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-500" />Landscape A4 layout</div>
                <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-500" />Color-coded class types</div>
                <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-500" />Course, instructor & room</div>
                <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-500" />Closed day indicators</div>
                <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-500" />Header with faculty & program</div>
                <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-500" />Export date & university name</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowExportModal(false)}>Cancel</Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || (exportScope === "current" && !selLevel)}
                className="gap-2"
              >
                {isExporting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>
                ) : (
                  <><Download className="w-4 h-4" />Export PDF</>
                )}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
