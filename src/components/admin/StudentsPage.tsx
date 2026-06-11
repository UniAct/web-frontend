import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  FileSpreadsheet,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  Users,
  X,
  Filter,
  GraduationCap,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  FileUp,
  CloudUpload,
  TriangleAlert,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import {
  ProgramService,
  SemesterService,
  StudentService,
  type CreateStudentInput,
  type Program,
  type Semester,
  type StudentImportErrorRow,
  type StudentImportStatus,
  type StudentRecord,
  type StudentStatus,
  type UpdateStudentInput,
} from "../../api";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SearchableSelect } from "../ui/searchable-select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface StudentsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

interface StudentDraft {
  username: string;
  firstName: string;
  lastName: string;
  fullname: string;
  universityStudentId: string;
  nationalId: string;
  email: string;
  phone: string;
  homePhone: string;
  dateOfBirth: string;
  enrollmentDate: string;
  address: string;
  city: string;
  country: string;
  status: StudentStatus;
  religion: "M" | "C";
  gender: "M" | "F";
  previousQualification: string;
  secondarySchoolName: string;
  totalHighSchoolGrades: string;
  highSchoolSeatNumber: string;
  programId: string;
  programLevelId: string;
  semesterId: string;
}

interface ImportPreviewRow {
  rowNumber: number;
  data: Record<string, string>;
}

interface EditableImportFailure {
  row: number;
  reason: string;
  username?: string;
  data: Record<string, string>;
}

interface PersistedImportSession {
  universityId: string;
  jobId: string;
  status: StudentImportStatus;
  statusMessage: string;
  programId: string;
  programLevelId: string;
  semesterId: string;
  fileName: string;
}

const emptyStudentDraft: StudentDraft = {
  username: "",
  firstName: "",
  lastName: "",
  fullname: "",
  universityStudentId: "",
  nationalId: "",
  email: "",
  phone: "",
  homePhone: "",
  dateOfBirth: "",
  enrollmentDate: "",
  address: "",
  city: "",
  country: "Egypt",
  status: "New",
  religion: "M",
  gender: "M",
  previousQualification: "",
  secondarySchoolName: "",
  totalHighSchoolGrades: "",
  highSchoolSeatNumber: "",
  programId: "",
  programLevelId: "",
  semesterId: "",
};

const importEditableColumns = [
  "username",
  "firstName",
  "lastName",
  "fullname",
  "universityStudentId",
  "nationalId",
  "email",
  "phone",
  "dateOfBirth",
  "enrollmentDate",
  "status",
  "religion",
  "gender",
];

const importTemplateHeaders = [
  "Username",
  "First Name",
  "Last Name",
  "Full Name",
  "University Student ID",
  "National ID",
  "Email",
  "Phone",
  "Date of Birth",
  "Address",
  "City",
  "Country",
  "Status",
  "Enrollment Date",
  "Religion",
  "Gender",
  "Home Phone",
  "Previous Qualification",
  "Secondary School Name",
  "Total High School Grades",
  "High School Seat Number",
];

const importTemplateSampleRow = [
  "ahmed.hassan",
  "Ahmed",
  "Hassan",
  "Ahmed Hassan",
  "20260001",
  "30101011234567",
  "ahmed.hassan@student.anu.edu.eg",
  "01012345678",
  "2007-02-01",
  "Smouha, Alexandria",
  "Alexandria",
  "Egypt",
  "New",
  "2026-09-15",
  "M",
  "M",
  "034567890",
  "Thanaweya Amma",
  "Alex Secondary School",
  "91",
  "S123456",
];

const getImportStorageKey = (universityId: string) =>
  `studentsImportSession:${universityId}`;

const defaultStatusOptions: StudentStatus[] = [
  "New",
  "Repeat",
  "SingleChance",
  "ExternalReenrollment",
  "Deactivate",
];

const studentStatusLabels: Record<StudentStatus, string> = {
  New: "New",
  Repeat: "Repeat",
  SingleChance: "Single Chance",
  ExternalReenrollment: "External Re-enrollment",
  Deactivate: "Deactivate",
};

function formatStudentStatus(status: StudentStatus): string {
  return studentStatusLabels[status] ?? status;
}

function getStudentStatusBadgeVariant(
  status: StudentStatus,
): "default" | "secondary" | "destructive" {
  if (status === "New") return "default";
  if (status === "Deactivate") return "destructive";
  return "secondary";
}

// Enhanced status styling with distinct colors per status
function getStatusStyle(status: StudentStatus): { bg: string; text: string; border: string; dot: string } {
  switch (status) {
    case "New": return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" };
    case "Repeat": return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" };
    case "SingleChance": return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" };
    case "ExternalReenrollment": return { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" };
    case "Deactivate": return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
    default: return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
  }
}

function toCamelKey(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part, index) => {
      if (index === 0) {
        return (
          part.charAt(0).toLowerCase() +
          part.slice(1).toLowerCase()
        );
      }

      return (
        part.charAt(0).toUpperCase() +
        part.slice(1).toLowerCase()
      );
    })
    .join("");
}
const IMPORT_MAX_CHECKS = 48;
const IMPORT_POLL_DELAY_MS = 2500;

function resolveProgramLevels(
  programs: Program[],
  selectedProgramId: string,
): Program["levels"] {
  const id = Number(selectedProgramId);
  if (!id) return [];
  const program = programs.find((item) => item.id === id);
  return program?.levels ?? [];
}

function parseImportPreview(
  file: File,
): Promise<ImportPreviewRow[]> {
  return file.arrayBuffer().then((buffer) => {
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<
      Record<string, unknown>
    >(worksheet, { defval: "" });

    return rows.map((row, index) => {
      const normalizedData: Record<string, string> = {};
      Object.entries(row).forEach(([key, value]) => {
        normalizedData[toCamelKey(key)] = String(
          value ?? "",
        ).trim();
      });

      return {
        rowNumber: index + 2,
        data: normalizedData,
      };
    });
  });
}

function parseDateValue(
  value: string | undefined,
): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function downloadImportTemplate(): void {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    importTemplateHeaders,
    importTemplateSampleRow,
  ]);
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Students Template",
  );
  XLSX.writeFile(workbook, "students_import_template.xlsx");
}

function readPersistedImportSession(
  universityId: string,
): PersistedImportSession | null {
  try {
    const raw = localStorage.getItem(
      getImportStorageKey(universityId),
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedImportSession;
    if (!parsed?.jobId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePersistedImportSession(
  session: PersistedImportSession,
): void {
  localStorage.setItem(
    getImportStorageKey(session.universityId),
    JSON.stringify(session),
  );
}

function clearPersistedImportSession(
  universityId: string,
): void {
  localStorage.removeItem(getImportStorageKey(universityId));
}

function isTerminalImportLookupError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("job not found") ||
    normalized.includes("http 404") ||
    normalized.includes("request failed (http 404)")
  );
}

function normalizeImportFailures(
  errors: StudentImportErrorRow[] | undefined,
  previewRows: ImportPreviewRow[],
): EditableImportFailure[] {
  if (!errors || errors.length === 0) return [];

  return errors.map((error) => {
    const preview = previewRows.find(
      (row) => row.rowNumber === Number(error.row),
    );
    return {
      row: Number(error.row),
      username: error.username,
      reason: error.reason,
      data: {
        ...(preview?.data ?? {}),
      },
    };
  });
}

function getStudentFullName(student: StudentRecord): string {
  const joined =
    `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();
  return joined || student.fullName || student.username;
}

function parseNumeric(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function mapDraftToCreatePayload(
  draft: StudentDraft,
): CreateStudentInput {
  return {
    username: draft.username.trim(),
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    fullname:
      draft.fullname.trim() ||
      `${draft.firstName.trim()} ${draft.lastName.trim()}`.trim(),
    universityStudentId: Number(draft.universityStudentId),
    nationalId: draft.nationalId.trim(),
    programId: Number(draft.programId),
    programLevelId: Number(draft.programLevelId),
    semesterId: Number(draft.semesterId),
    email: draft.email.trim().toLowerCase(),
    phone: draft.phone.trim(),
    dateOfBirth: draft.dateOfBirth,
    address: draft.address.trim(),
    city: draft.city.trim(),
    country: draft.country.trim(),
    status: draft.status,
    enrollmentDate: draft.enrollmentDate,
    religion: draft.religion,
    gender: draft.gender,
    homePhone: draft.homePhone.trim() || undefined,
    previousQualification:
      draft.previousQualification.trim() || undefined,
    secondarySchoolName:
      draft.secondarySchoolName.trim() || undefined,
    totalHighSchoolGrades: parseNumeric(
      draft.totalHighSchoolGrades,
    ),
    highSchoolSeatNumber:
      draft.highSchoolSeatNumber.trim() || undefined,
  };
}

function mapStudentToEditDraft(
  student: StudentRecord,
): StudentDraft {
  return {
    username: student.username,
    firstName: student.firstName,
    lastName: student.lastName,
    fullname: student.fullName,
    universityStudentId: String(student.universityStudentId),
    nationalId: student.nationalId,
    email: student.email,
    phone: student.phone,
    homePhone: "",
    dateOfBirth: "",
    enrollmentDate: student.enrollmentDate?.slice(0, 10) || "",
    address: "",
    city: student.city,
    country: student.country,
    status: student.status,
    religion: student.religion,
    gender: student.gender,
    previousQualification: "",
    secondarySchoolName: "",
    totalHighSchoolGrades: "",
    highSchoolSeatNumber: "",
    programId: String(student.programId),
    programLevelId: String(student.programLevelId),
    semesterId: "",
  };
}

function mapEditDraftToPayload(
  draft: StudentDraft,
): UpdateStudentInput {
  return {
    username: draft.username.trim(),
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    fullname:
      draft.fullname.trim() ||
      `${draft.firstName.trim()} ${draft.lastName.trim()}`.trim(),
    universityStudentId: Number(draft.universityStudentId),
    nationalId: draft.nationalId.trim(),
    email: draft.email.trim().toLowerCase(),
    phone: draft.phone.trim(),
    address: draft.address.trim() || undefined,
    city: draft.city.trim(),
    country: draft.country.trim(),
    status: draft.status,
    enrollmentDate: draft.enrollmentDate || undefined,
    religion: draft.religion,
    gender: draft.gender,
    programId: Number(draft.programId),
    programLevelId: Number(draft.programLevelId),
    homePhone: draft.homePhone.trim() || undefined,
    previousQualification:
      draft.previousQualification.trim() || undefined,
    secondarySchoolName:
      draft.secondarySchoolName.trim() || undefined,
    totalHighSchoolGrades: parseNumeric(
      draft.totalHighSchoolGrades,
    ),
    highSchoolSeatNumber:
      draft.highSchoolSeatNumber.trim() || undefined,
    dateOfBirth: draft.dateOfBirth || undefined,
  };
}

export function StudentsPage({
  selectedUniversity,
}: StudentsPageProps) {
  const [loading, setLoading] = useState(false);
  const [semesterDataReady, setSemesterDataReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    "desc",
  );
  const [activeSemesterId, setActiveSemesterId] = useState<
    number | null
  >(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<StudentDraft>(
    emptyStudentDraft,
  );
  const [editDraft, setEditDraft] = useState<StudentDraft>(
    emptyStudentDraft,
  );
  const [editingStudentId, setEditingStudentId] = useState<
    number | null
  >(null);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(
    null,
  );
  const [importPreviewRows, setImportPreviewRows] = useState<
    ImportPreviewRow[]
  >([]);
  const [importProgramId, setImportProgramId] = useState("");
  const [importProgramLevelId, setImportProgramLevelId] =
    useState("");
  const [importSemesterId, setImportSemesterId] = useState("");
  const [importJobId, setImportJobId] = useState<string | null>(
    null,
  );
  const [importStatus, setImportStatus] =
    useState<StudentImportStatus | null>(null);
  const [importStatusMessage, setImportStatusMessage] =
    useState("");
  const [importFailures, setImportFailures] = useState<
    EditableImportFailure[]
  >([]);
  const [importing, setImporting] = useState(false);
  const [retryingFailedRows, setRetryingFailedRows] =
    useState(false);
  const [importTab, setImportTab] = useState<
    "setup" | "status" | "recover"
  >("setup");
  const pollingJobRef = useRef<string | null>(null);

  // ── UI-only state (visual enhancements) ──────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [expandedErrorRows, setExpandedErrorRows] = useState<Set<number>>(new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allProgramLevels = useMemo(() => {
    return programs.flatMap((program) =>
      (program.levels ?? []).map((level) => ({
        value: String(level.id),
        label: `Level ${level.level}`,
        description: `${program.name}`,
      })),
    );
  }, [programs]);

  const levelOptionsForProgramFilter = useMemo(() => {
    if (programFilter === "all") return allProgramLevels;

    return resolveProgramLevels(programs, programFilter).map(
      (level) => ({
        value: String(level.id),
        label: `Level ${level.level}`,
      }),
    );
  }, [allProgramLevels, programFilter, programs]);

  const selectedProgramLevelsForCreate = useMemo(
    () => resolveProgramLevels(programs, createDraft.programId),
    [createDraft.programId, programs],
  );

  const selectedProgramLevelsForEdit = useMemo(
    () => resolveProgramLevels(programs, editDraft.programId),
    [editDraft.programId, programs],
  );

  const selectedProgramLevelsForImport = useMemo(
    () => resolveProgramLevels(programs, importProgramId),
    [importProgramId, programs],
  );

  const statusOptions = useMemo(() => {
    const dynamic = new Set<StudentStatus>(
      defaultStatusOptions,
    );
    students.forEach((student) => dynamic.add(student.status));
    return Array.from(dynamic);
  }, [students]);

  const activeSemester = useMemo(
    () =>
      semesters.find((item) => item.id === activeSemesterId) ??
      null,
    [semesters, activeSemesterId],
  );

  const isSemesterLoading = selectedUniversity !== null && !semesterDataReady;

  const loadStudents = async () => {
    if (
      !selectedUniversity ||
      !activeSemester ||
      !activeSemesterId
    ) {
      setStudents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const queryBase: {
        programId?: number;
        semesterId?: number;
        status?: StudentStatus;
        sortOrder: "asc" | "desc";
      } = {
        sortOrder,
        semesterId: activeSemesterId,
      };

      if (programFilter !== "all")
        queryBase.programId = Number(programFilter);
      if (statusFilter !== "all")
        queryBase.status = statusFilter as StudentStatus;

      const firstPage = await StudentService.getStudents({
        ...queryBase,
        page: 1,
        limit: 100,
      });

      const allRows = [...firstPage.students];
      const totalPages = firstPage.pagination.totalPages;

      if (totalPages > 1) {
        const pagePromises: Array<
          Promise<
            Awaited<
              ReturnType<typeof StudentService.getStudents>
            >
          >
        > = [];
        for (let page = 2; page <= totalPages; page += 1) {
          pagePromises.push(
            StudentService.getStudents({
              ...queryBase,
              page,
              limit: 100,
            }),
          );
        }

        const pages = await Promise.all(pagePromises);
        pages.forEach((pageData) => {
          allRows.push(...pageData.students);
        });
      }

      setStudents(allRows);
    } catch (error: any) {
      console.error("Failed to load students:", error);
      toast.error(error.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    if (!selectedUniversity) return;

    try {
      setSemesterDataReady(false);
      const [programData, semesterData] = await Promise.all([
        ProgramService.getAll(),
        SemesterService.getAll(),
      ]);

      setPrograms(programData);
      setSemesters(semesterData);
    } catch (error: any) {
      console.error("Failed to load lookup data:", error);
      toast.error(
        error.message ||
        "Failed to load programs and semesters",
      );
    } finally {
      setSemesterDataReady(true);
    }
  };

  useEffect(() => {
    if (!selectedUniversity) return;
    void loadLookups();
  }, [selectedUniversity]);

  useEffect(() => {
    if (!selectedUniversity) {
      setActiveSemesterId(null);
      return;
    }

    const syncActiveSemester = () => {
      const raw = localStorage.getItem(
        `activeSemester:${selectedUniversity}`,
      );
      const parsed = raw ? Number(raw) : NaN;
      setActiveSemesterId(
        Number.isFinite(parsed) ? parsed : null,
      );
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== `activeSemester:${selectedUniversity}`) return;
      syncActiveSemester();
    };

    const onSemesterUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ universityId?: string }>;
      if (
        customEvent.detail?.universityId &&
        customEvent.detail.universityId !== selectedUniversity
      ) {
        return;
      }

      syncActiveSemester();
    };

    syncActiveSemester();
    window.addEventListener("storage", onStorage);
    window.addEventListener("active-semester-updated", onSemesterUpdated as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("active-semester-updated", onSemesterUpdated as EventListener);
    };
  }, [selectedUniversity]);

  useEffect(() => {
    if (!selectedUniversity) return;
    const persisted = readPersistedImportSession(
      selectedUniversity,
    );
    if (!persisted) return;

    setImportJobId(persisted.jobId);
    setImportStatus(persisted.status);
    setImportStatusMessage(persisted.statusMessage);
    setImportProgramId(persisted.programId);
    setImportProgramLevelId(persisted.programLevelId);
    setImportSemesterId(persisted.semesterId);

    if (
      persisted.status === "Pending" ||
      persisted.status === "Processing"
    ) {
      setImportTab("status");
      void startImportPolling(persisted.jobId);
    }
  }, [selectedUniversity]);

  useEffect(() => {
    if (!selectedUniversity || !semesterDataReady) return;

    if (!activeSemester) {
      setStudents([]);
      return;
    }

    void loadStudents();
  }, [
    selectedUniversity,
    semesterDataReady,
    activeSemesterId,
    activeSemester,
    programFilter,
    statusFilter,
    sortOrder,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    programFilter,
    levelFilter,
    statusFilter,
    activeSemesterId,
  ]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !term ||
        getStudentFullName(student)
          .toLowerCase()
          .includes(term) ||
        student.username.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.nationalId.toLowerCase().includes(term) ||
        String(student.universityStudentId).includes(term);

      const matchesLevel =
        levelFilter === "all" ||
        String(student.programLevelId) === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [students, search, levelFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / pageSize),
  );
  const pageStart = (currentPage - 1) * pageSize;
  const currentRows = filteredStudents.slice(
    pageStart,
    pageStart + pageSize,
  );

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => !s.isBlocked).length;
    const deleted = students.filter((s) => s.isBlocked).length;

    return { total, active, deleted };
  }, [students]);

  const resetCreateDialog = () => {
    setCreateDraft(emptyStudentDraft);
    setSubmitAttempted(false);
    setIsCreateOpen(false);
  };

  const handleCreateStudent = async () => {
    setSubmitAttempted(true);
    const required = [
      createDraft.username,
      createDraft.firstName,
      createDraft.lastName,
      createDraft.universityStudentId,
      createDraft.nationalId,
      createDraft.email,
      createDraft.phone,
      createDraft.dateOfBirth,
      createDraft.enrollmentDate,
      createDraft.address,
      createDraft.city,
      createDraft.country,
      createDraft.programId,
      createDraft.programLevelId,
      createDraft.semesterId,
    ];

    if (required.some((value) => !String(value).trim())) {
      toast.error(
        "Please fill all required fields before creating the student.",
      );
      return;
    }

    if (Number.isNaN(Number(createDraft.universityStudentId))) {
      toast.error(
        "University Student ID must be a valid number.",
      );
      return;
    }

    try {
      setSaving(true);
      await StudentService.createStudent(
        mapDraftToCreatePayload(createDraft),
      );
      toast.success("Student created successfully.");
      resetCreateDialog();
      await loadStudents();
    } catch (error: any) {
      console.error("Create student failed:", error);
      toast.error(error.message || "Failed to create student");
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (student: StudentRecord) => {
    setEditingStudentId(student.id);
    setEditDraft(mapStudentToEditDraft(student));
    setIsEditOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudentId) return;

    if (
      !editDraft.username.trim() ||
      !editDraft.firstName.trim() ||
      !editDraft.lastName.trim()
    ) {
      toast.error(
        "Username, first name, and last name are required.",
      );
      return;
    }

    try {
      setSaving(true);
      await StudentService.updateStudent(
        editingStudentId,
        mapEditDraftToPayload(editDraft),
      );
      toast.success("Student updated successfully.");
      setIsEditOpen(false);
      setEditingStudentId(null);
      await loadStudents();
    } catch (error: any) {
      console.error("Update student failed:", error);
      toast.error(error.message || "Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrRestore = async (
    student: StudentRecord,
  ) => {
    try {
      if (student.isBlocked) {
        await StudentService.activateStudent(student.id);
        toast.success(
          `Student ${student.username} has been re-activated.`,
        );
      } else {
        await StudentService.softDeleteStudent(student.id);
        toast.success(
          `Student ${student.username} has been deactivated.`,
        );
      }
      setConfirmDeleteId(null);
      await loadStudents();
    } catch (error: any) {
      console.error("Delete/restore failed:", error);
      toast.error(
        error.message || "Failed to update student state",
      );
    }
  };

  const handleImportFileChange = async (file: File | null) => {
    setImportFile(file);
    setImportPreviewRows([]);
    setImportFailures([]);
    setImportStatus(null);
    setImportStatusMessage("");
    setImportJobId(null);

    if (!file) return;

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".xlsx")) {
      toast.error(
        "Only .xlsx files are accepted by backend import API.",
      );
      return;
    }

    try {
      const preview = await parseImportPreview(file);
      setImportPreviewRows(preview);
      toast.success(
        `Loaded ${preview.length} rows from ${file.name}`,
      );
    } catch (error: any) {
      console.error("Preview parse failed:", error);
      toast.error(
        error.message ||
        "Failed to parse Excel file for preview",
      );
    }
  };

  const startImportPolling = async (jobId: string) => {
    if (pollingJobRef.current === jobId) return;
    pollingJobRef.current = jobId;
    setImporting(true);

    let reachedTerminalState = false;

    for (let index = 0; index < IMPORT_MAX_CHECKS; index += 1) {
      try {
        const statusData =
          await StudentService.getImportStatus(jobId);
        setImportStatus(statusData.status);
        setImportStatusMessage(statusData.message);

        if (selectedUniversity) {
          writePersistedImportSession({
            universityId: selectedUniversity,
            jobId,
            status: statusData.status,
            statusMessage: statusData.message,
            programId: importProgramId,
            programLevelId: importProgramLevelId,
            semesterId: importSemesterId,
            fileName: importFile?.name || "students.xlsx",
          });
        }

        if (
          statusData.status === "Completed" ||
          statusData.status === "Failed" ||
          statusData.status === "CompletedWithErrors"
        ) {
          reachedTerminalState = true;
          const normalized = normalizeImportFailures(
            statusData.error,
            importPreviewRows,
          );
          setImportFailures(normalized);
          setImportTab(
            statusData.status === "Completed"
              ? "status"
              : "recover",
          );
          if (statusData.status === "Completed") {
            toast.success("Import completed successfully.");
          } else if (
            statusData.status === "CompletedWithErrors"
          ) {
            toast.warning(
              "Import completed with errors. You can fix and retry failed rows below.",
            );
          } else {
            toast.error(
              "Import failed. Review backend reasons and corrected rows table.",
            );
          }
          break;
        }
      } catch (error: any) {
        console.error("Polling import status failed:", error);
        const message =
          error?.message || "Failed to poll import status";
        setImportStatusMessage(message);

        if (isTerminalImportLookupError(message)) {
          setImportStatus("Failed");
          setImportTab("status");
          setImporting(false);
          pollingJobRef.current = null;

          if (selectedUniversity) {
            writePersistedImportSession({
              universityId: selectedUniversity,
              jobId,
              status: "Failed",
              statusMessage: message,
              programId: importProgramId,
              programLevelId: importProgramLevelId,
              semesterId: importSemesterId,
              fileName: importFile?.name || "students.xlsx",
            });
          }

          toast.error(
            "Import tracking ended: job was not found by backend.",
          );
          return;
        }
      }

      await new Promise((resolve) =>
        window.setTimeout(resolve, IMPORT_POLL_DELAY_MS),
      );
    }

    if (!reachedTerminalState) {
      setImportStatusMessage(
        "Import is taking longer than expected. You can keep this tab open or click Refresh Status manually.",
      );
      setImportTab("status");
      toast.warning(
        "Import is still processing. You can refresh status manually.",
      );
    }

    setImporting(false);
    pollingJobRef.current = null;
    await loadStudents();
  };

  const handleRefreshImportStatus = async () => {
    if (!importJobId) {
      toast.error("No import job found to refresh.");
      return;
    }

    try {
      const statusData =
        await StudentService.getImportStatus(importJobId);
      setImportStatus(statusData.status);
      setImportStatusMessage(statusData.message);

      if (selectedUniversity) {
        writePersistedImportSession({
          universityId: selectedUniversity,
          jobId: importJobId,
          status: statusData.status,
          statusMessage: statusData.message,
          programId: importProgramId,
          programLevelId: importProgramLevelId,
          semesterId: importSemesterId,
          fileName: importFile?.name || "students.xlsx",
        });
      }

      if (
        statusData.status === "Completed" ||
        statusData.status === "Failed" ||
        statusData.status === "CompletedWithErrors"
      ) {
        const normalized = normalizeImportFailures(
          statusData.error,
          importPreviewRows,
        );
        setImportFailures(normalized);
        setImporting(false);
        pollingJobRef.current = null;
        setImportTab(
          statusData.status === "Completed"
            ? "status"
            : "recover",
        );
      }
    } catch (error: any) {
      const message =
        error?.message || "Failed to refresh import status";
      setImportStatus("Failed");
      setImportStatusMessage(message);
      setImporting(false);
      pollingJobRef.current = null;
      toast.error(message);
    }
  };

  const handleStartImport = async () => {
    if (
      importing ||
      importStatus === "Pending" ||
      importStatus === "Processing"
    ) {
      setImportTab("status");
      toast.warning(
        "There is already an import in progress. Please wait for completion.",
      );
      return;
    }

    if (!importFile) {
      toast.error("Please choose an Excel file first.");
      return;
    }

    if (
      !importProgramId ||
      !importProgramLevelId ||
      !importSemesterId
    ) {
      toast.error(
        "Program, level, and semester are required before import.",
      );
      return;
    }

    try {
      const response = await StudentService.startImport({
        file: importFile,
        programId: Number(importProgramId),
        programLevelId: Number(importProgramLevelId),
        semesterId: Number(importSemesterId),
      });

      setImportJobId(response.jobId);
      setImportStatus("Pending");
      setImportStatusMessage(response.message);
      setImportTab("status");
      toast.success(
        "Import accepted by server. Processing will start shortly.",
      );

      if (selectedUniversity) {
        writePersistedImportSession({
          universityId: selectedUniversity,
          jobId: response.jobId,
          status: "Pending",
          statusMessage: response.message,
          programId: importProgramId,
          programLevelId: importProgramLevelId,
          semesterId: importSemesterId,
          fileName: importFile.name,
        });
      }

      await startImportPolling(response.jobId);
    } catch (error: any) {
      console.error("Start import failed:", error);
      toast.error(error.message || "Failed to start import");
    }
  };

  const handleFailureCellEdit = (
    rowIndex: number,
    key: string,
    value: string,
  ) => {
    setImportFailures((current) =>
      current.map((row, index) => {
        if (index !== rowIndex) return row;
        return {
          ...row,
          data: {
            ...row.data,
            [key]: value,
          },
        };
      }),
    );
  };

  const buildCreatePayloadFromFailedRow = (
    row: EditableImportFailure,
    context: {
      programId: string;
      programLevelId: string;
      semesterId: string;
    },
  ): CreateStudentInput => {
    const fullName =
      row.data.fullname?.trim() ||
      `${row.data.firstName || ""} ${row.data.lastName || ""}`.trim();
    const grades = parseNumeric(
      row.data.totalHighSchoolGrades || "",
    );

    return {
      username: (row.data.username || "").trim(),
      firstName: (row.data.firstName || "").trim(),
      lastName: (row.data.lastName || "").trim(),
      fullname: fullName,
      universityStudentId: Number(row.data.universityStudentId),
      nationalId: (row.data.nationalId || "").trim(),
      programId: Number(context.programId),
      programLevelId: Number(context.programLevelId),
      semesterId: Number(context.semesterId),
      email: (row.data.email || "").trim().toLowerCase(),
      phone: (row.data.phone || "").trim(),
      dateOfBirth: (row.data.dateOfBirth || "").trim(),
      address: (row.data.address || "").trim(),
      city: (row.data.city || "").trim(),
      country: (row.data.country || "").trim() || "Egypt",
      status:
        ((row.data.status || "New").trim() as StudentStatus) ||
        "New",
      enrollmentDate: (row.data.enrollmentDate || "").trim(),
      religion:
        ((row.data.religion || "M").trim() as "M" | "C") || "M",
      gender:
        ((row.data.gender || "M").trim() as "M" | "F") || "M",
      homePhone: (row.data.homePhone || "").trim() || undefined,
      previousQualification:
        (row.data.previousQualification || "").trim() ||
        undefined,
      secondarySchoolName:
        (row.data.secondarySchoolName || "").trim() ||
        undefined,
      totalHighSchoolGrades: grades,
      highSchoolSeatNumber:
        (row.data.highSchoolSeatNumber || "").trim() ||
        undefined,
    };
  };

  const retryFailedRows = async () => {
    if (
      !importProgramId ||
      !importProgramLevelId ||
      !importSemesterId
    ) {
      toast.error(
        "Import context is missing. Please select program, level, and semester again.",
      );
      return;
    }

    if (importFailures.length === 0) {
      toast.error("No failed rows to retry.");
      return;
    }

    try {
      setRetryingFailedRows(true);

      const remaining: EditableImportFailure[] = [];
      let successCount = 0;

      for (const failure of importFailures) {
        try {
          const payload = buildCreatePayloadFromFailedRow(
            failure,
            {
              programId: importProgramId,
              programLevelId: importProgramLevelId,
              semesterId: importSemesterId,
            },
          );

          await StudentService.createStudent(payload);
          successCount += 1;
        } catch (error: any) {
          remaining.push({
            ...failure,
            reason: error.message || failure.reason,
          });
        }
      }

      setImportFailures(remaining);

      if (successCount > 0) {
        toast.success(
          `Inserted ${successCount} corrected rows successfully.`,
        );
      }

      if (remaining.length > 0) {
        toast.warning(
          `${remaining.length} rows still have validation errors.`,
        );
      } else {
        toast.success(
          "All failed rows were recovered successfully.",
        );
      }

      await loadStudents();
    } finally {
      setRetryingFailedRows(false);
    }
  };

  const resetImportDialog = () => {
    if (
      importing ||
      importStatus === "Pending" ||
      importStatus === "Processing"
    ) {
      setIsImportOpen(false);
      return;
    }

    if (selectedUniversity) {
      clearPersistedImportSession(selectedUniversity);
    }

    setImportFile(null);
    setImportPreviewRows([]);
    setImportProgramId("");
    setImportProgramLevelId("");
    setImportSemesterId("");
    setImportJobId(null);
    setImportStatus(null);
    setImportStatusMessage("");
    setImportFailures([]);
    setImporting(false);
    setRetryingFailedRows(false);
    setImportTab("setup");
    setIsImportOpen(false);
  };

  // ── Derived helpers ────────────────────────────────────────────
  const hasActiveFilters =
    search !== "" ||
    programFilter !== "all" ||
    levelFilter !== "all" ||
    statusFilter !== "all";

  const resetFilters = () => {
    setSearch("");
    setProgramFilter("all");
    setLevelFilter("all");
    setStatusFilter("all");
  };

  const toggleExpandError = (index: number) => {
    setExpandedErrorRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const importStatusSteps = [
    { key: "Uploaded", label: "Uploaded", done: !!importJobId },
    { key: "Pending", label: "Pending", done: importStatus === "Processing" || importStatus === "Completed" || importStatus === "CompletedWithErrors" || importStatus === "Failed" },
    { key: "Processing", label: "Processing", done: importStatus === "Completed" || importStatus === "CompletedWithErrors" || importStatus === "Failed" },
    { key: "Terminal", label: importStatus === "Completed" ? "Completed" : importStatus === "CompletedWithErrors" ? "Completed w/ Errors" : importStatus === "Failed" ? "Failed" : "Result", done: importStatus === "Completed" || importStatus === "CompletedWithErrors" || importStatus === "Failed" },
  ];

  // ═══════════════════════════════════════════════════════════════
  // EMPTY STATES
  // ═══════════════════════════════════════════════════════════════
  if (!selectedUniversity) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-8 py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
          <Users className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="mb-2 text-slate-900">No University Selected</h3>
        <p className="max-w-sm text-sm text-slate-500">
          Please select a university from the header before managing student accounts.
        </p>
      </div>
    );
  }

  if (isSemesterLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="h-7 w-56 animate-pulse rounded-md bg-slate-200" />
            <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-slate-100" />
            <div className="h-6 w-44 animate-pulse rounded-full bg-blue-100" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-3 w-40 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
            <div className="h-10 animate-pulse rounded-lg bg-slate-200 xl:col-span-12" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-200 xl:col-span-4" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-200 xl:col-span-4" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-200 xl:col-span-4" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-200 xl:col-span-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!activeSemester) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-8 py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
          <CalendarDays className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="mb-2 text-slate-900">Select a Semester First</h3>
        <p className="max-w-sm text-sm text-slate-500">
          Open Semester Management in the header and choose the active semester before loading students.
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-slate-900">Student Management</h2>
              <p className="text-sm text-slate-500">
                Connected to backend APIs — import, edit, and manage students across semesters.
              </p>
            </div>
          </div>
          {activeSemester && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
              <CalendarDays className="h-3 w-3" />
              Active semester: {activeSemester.year} — {activeSemester.type}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:shrink-0">
          <Button
            variant="outline"
            onClick={() => void loadStudents()}
            disabled={loading}
            className="h-10 gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 sm:w-auto"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsImportOpen(true)}
            className="h-10 gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 sm:w-auto"
          >
            <Upload className="h-3.5 w-3.5" />
            {importing || importStatus === "Pending" || importStatus === "Processing"
              ? "View Import Status"
              : "Import Students"}
            {(importing || importStatus === "Pending" || importStatus === "Processing") && (
              <span className="flex h-2 w-2 rounded-full bg-amber-400 ring-2 ring-amber-100" />
            )}
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-10 gap-2 bg-blue-600 hover:bg-blue-700 sm:w-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Student
          </Button>
        </div>
      </div>

      {/* ── KPI Stat Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="absolute right-0 top-0 h-full w-1.5 rounded-r-xl bg-slate-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Records</p>
              <p className="mt-1 text-3xl text-slate-900">
                {loading ? <span className="inline-block h-8 w-16 animate-pulse rounded-md bg-slate-200" /> : stats.total}
              </p>
              <p className="mt-1 text-xs text-slate-400">All enrolled students</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Users className="h-6 w-6 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="absolute right-0 top-0 h-full w-1.5 rounded-r-xl bg-emerald-400" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Accounts</p>
              <p className="mt-1 text-3xl text-emerald-600">
                {loading ? <span className="inline-block h-8 w-16 animate-pulse rounded-md bg-emerald-100" /> : stats.active}
              </p>
              <p className="mt-1 text-xs text-slate-400">Currently accessible</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <UserCheck className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Soft Deleted */}
        <div className="relative overflow-hidden rounded-xl border border-rose-100 bg-white p-5 shadow-sm">
          <div className="absolute right-0 top-0 h-full w-1.5 rounded-r-xl bg-rose-400" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Soft Deleted</p>
              <p className="mt-1 text-3xl text-rose-600">
                {loading ? <span className="inline-block h-8 w-16 animate-pulse rounded-md bg-rose-100" /> : stats.deleted}
              </p>
              <p className="mt-1 text-xs text-slate-400">Recoverable records</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50">
              <UserX className="h-6 w-6 text-rose-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Student Directory Card ────────────────────────────── */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex w-full max-w-full flex-col gap-3 overflow-hidden sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 max-w-full overflow-hidden">
              <CardTitle className="max-w-full break-words text-slate-900">Student Directory</CardTitle>
              <CardDescription className="mt-0.5 max-w-full whitespace-normal break-words">
                Search, filter, edit, deactivate, and recover students without losing records.
              </CardDescription>
            </div>
            {filteredStudents.length > 0 && !loading && (
              <Badge variant="secondary" className="text-xs">
                {filteredStudents.length} result{filteredStudents.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">

          {/* ── Filter Bar ─────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
              {/* Search */}
              <div className="relative xl:col-span-12">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="h-10 border-slate-200 bg-white pl-9 pr-9 text-sm placeholder:text-slate-400 focus-visible:ring-blue-500"
                  placeholder="Name, username, email, national ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Program */}
              <div className="relative xl:col-span-4">
                <SearchableSelect
                  value={programFilter}
                  onValueChange={(value) => {
                    setProgramFilter(value);
                    setLevelFilter("all");
                  }}
                  options={[
                    { value: "all", label: "All Programs" },
                    ...programs.map((p) => ({ value: String(p.id), label: p.name })),
                  ]}
                  placeholder="Program"
                  className="border-slate-200 bg-white text-sm"
                />
                {programFilter !== "all" && (
                  <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
                )}
              </div>

              {/* Level */}
              <div className="relative xl:col-span-4">
                <SearchableSelect
                  value={levelFilter}
                  onValueChange={setLevelFilter}
                  options={[
                    { value: "all", label: "All Levels" },
                    ...levelOptionsForProgramFilter,
                  ]}
                  placeholder="Level"
                  className="border-slate-200 bg-white text-sm"
                />
                {levelFilter !== "all" && (
                  <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
                )}
              </div>

              {/* Status */}
              <div className="relative xl:col-span-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 border-slate-200 bg-white text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>{formatStudentStatus(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {statusFilter !== "all" && (
                  <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
                )}
              </div>
            </div>

            {/* Second filter row */}
            <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-[360px]">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500">Sort</Label>
                  <Select value={sortOrder} onValueChange={(v: "asc" | "desc") => setSortOrder(v)}>
                    <SelectTrigger className="h-10 border-slate-200 bg-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest first</SelectItem>
                      <SelectItem value="asc">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500">Rows</Label>
                  <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                    <SelectTrigger className="h-10 border-slate-200 bg-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100 xl:ml-auto"
                >
                  <X className="h-3 w-3" />
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* ── Table ──────────────────────────────────────── */}
          {loading ? (
            // Skeleton loader
            <div className="space-y-0 overflow-hidden rounded-xl border border-slate-200">
              {/* Header skeleton */}
              <div className="flex gap-4 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                {[140, 100, 180, 80, 80, 80].map((w, i) => (
                  <div key={i} className="h-3.5 animate-pulse rounded bg-slate-200" style={{ width: w }} />
                ))}
              </div>
              {/* Row skeletons */}
              {Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, i) => (
                <div key={i} className={`flex items-center gap-4 px-4 py-4 ${i % 2 ? "bg-slate-50/40" : "bg-white"}`}>
                  <div className="space-y-1.5" style={{ width: 140 }}>
                    <div className="h-3.5 animate-pulse rounded bg-slate-200" style={{ width: "90%" }} />
                    <div className="h-3 animate-pulse rounded bg-slate-100" style={{ width: "70%" }} />
                  </div>
                  {[100, 180, 80, 80, 80].map((w, j) => (
                    <div key={j} className="h-3.5 animate-pulse rounded bg-slate-100" style={{ width: w }} />
                  ))}
                </div>
              ))}
            </div>
          ) : currentRows.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Filter className="h-7 w-7 text-slate-400" />
              </div>
              <h4 className="mb-1 text-slate-700">No students found</h4>
              <p className="mb-4 max-w-xs text-sm text-slate-400">
                No records match your current filters. Try adjusting the search or clearing active filters.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={resetFilters} className="gap-2">
                  <X className="h-3.5 w-3.5" />
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="py-3 text-xs font-semibold tracking-wide text-slate-500">Student</TableHead>
                    <TableHead className="py-3 text-xs font-semibold tracking-wide text-slate-500">Univ. ID</TableHead>
                    <TableHead className="py-3 text-xs font-semibold tracking-wide text-slate-500">Program / Level</TableHead>
                    <TableHead className="py-3 text-xs font-semibold tracking-wide text-slate-500">Status</TableHead>
                    <TableHead className="py-3 text-right text-xs font-semibold tracking-wide text-slate-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRows.map((student, rowIdx) => {
                    const statusStyle = getStatusStyle(student.status);
                    const isConfirming = confirmDeleteId === student.id;

                    return (
                      <TableRow
                        key={student.id}
                        className={`border-slate-100 transition-colors hover:bg-blue-50/30 ${rowIdx % 2 ? "bg-slate-50/20" : "bg-white"}`}
                      >
                        {/* Student cell */}
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-xs font-semibold text-white shadow-sm">
                              {(student.firstName?.[0] || student.username[0] || "?").toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{getStudentFullName(student)}</p>
                              <p className="text-xs text-slate-500">{student.email}</p>
                              <p className="text-xs text-slate-400">@{student.username}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Univ ID */}
                        <TableCell className="py-3.5">
                          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">
                            {student.universityStudentId}
                          </code>
                        </TableCell>

                        {/* Program / Level */}
                        <TableCell className="py-3.5">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-700 leading-tight">{student.programName}</p>
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              <GraduationCap className="h-2.5 w-2.5" />
                              {student.programLevelName}
                            </span>
                          </div>
                        </TableCell>

                        {/* Status badge */}
                        <TableCell className="py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                            {formatStudentStatus(student.status)}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3.5 text-right">
                          {isConfirming && !student.isBlocked ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-xs text-slate-500">Deactivate?</span>
                              <button
                                onClick={() => void handleDeleteOrRestore(student)}
                                className="rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditDialog(student)}
                                title="Edit student"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              {student.isBlocked ? (
                                <button
                                  onClick={() => void handleDeleteOrRestore(student)}
                                  title="Activate student"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm hover:bg-emerald-100 transition-all"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(student.id)}
                                  title="Deactivate student"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-500 shadow-sm hover:bg-rose-100 hover:text-rose-700 transition-all"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* ── Pagination ──────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {filteredStudents.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + pageSize, filteredStudents.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">{filteredStudents.length}</span>{" "}
              students
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "ellipsis" ? (
                    <span key={`e-${i}`} className="px-1 text-xs text-slate-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`flex h-7 min-w-[28px] items-center justify-center rounded-md border px-2 text-xs font-medium shadow-sm transition-colors ${currentPage === p
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════
          CREATE STUDENT DIALOG
      ══════════════════════════════════════════════════════════ */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) =>
          open ? setIsCreateOpen(true) : resetCreateDialog()
        }
      >
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
          <DialogHeader className="shrink-0 border-b border-slate-100 px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                <Plus className="h-4 w-4 text-blue-600" />
              </div>
              Create Student
            </DialogTitle>
            <DialogDescription>
              Fill student identity, contact, and enrollment details. Fields marked <span className="text-rose-500">*</span> are required.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-6">

              {/* Identity section */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Identity</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <LabelledInput label="Username *" value={createDraft.username} onChange={(v) => setCreateDraft((d) => ({ ...d, username: v }))} />
                  <LabelledInput label="University Student ID *" value={createDraft.universityStudentId} onChange={(v) => setCreateDraft((d) => ({ ...d, universityStudentId: v }))} />
                  <LabelledInput label="First Name *" value={createDraft.firstName} onChange={(v) => setCreateDraft((d) => ({ ...d, firstName: v }))} />
                  <LabelledInput label="Last Name *" value={createDraft.lastName} onChange={(v) => setCreateDraft((d) => ({ ...d, lastName: v }))} />
                  <LabelledInput label="Full Name" value={createDraft.fullname} onChange={(v) => setCreateDraft((d) => ({ ...d, fullname: v }))} />
                  <LabelledInput label="National ID *" value={createDraft.nationalId} onChange={(v) => setCreateDraft((d) => ({ ...d, nationalId: v }))} />
                  <LabelledInput label="Date of Birth *" type="date" value={createDraft.dateOfBirth} onChange={(v) => setCreateDraft((d) => ({ ...d, dateOfBirth: v }))} />
                  <SelectField label="Gender *" value={createDraft.gender} onValueChange={(v) => setCreateDraft((d) => ({ ...d, gender: v as "M" | "F" }))} options={[{ value: "M", label: "Male (M)" }, { value: "F", label: "Female (F)" }]} />
                  <SelectField label="Religion *" value={createDraft.religion} onValueChange={(v) => setCreateDraft((d) => ({ ...d, religion: v as "M" | "C" }))} options={[{ value: "M", label: "Muslim (M)" }, { value: "C", label: "Christian (C)" }]} />
                </div>
              </section>

              {/* Contact section */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Contact</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <LabelledInput label="Email *" type="email" value={createDraft.email} onChange={(v) => setCreateDraft((d) => ({ ...d, email: v }))} />
                  <LabelledInput label="Phone *" value={createDraft.phone} onChange={(v) => setCreateDraft((d) => ({ ...d, phone: v }))} />
                  <LabelledInput label="Home Phone" value={createDraft.homePhone} onChange={(v) => setCreateDraft((d) => ({ ...d, homePhone: v }))} />
                  <LabelledInput label="Address *" value={createDraft.address} onChange={(v) => setCreateDraft((d) => ({ ...d, address: v }))} />
                  <LabelledInput label="City *" value={createDraft.city} onChange={(v) => setCreateDraft((d) => ({ ...d, city: v }))} />
                  <LabelledInput label="Country *" value={createDraft.country} onChange={(v) => setCreateDraft((d) => ({ ...d, country: v }))} />
                </div>
              </section>

              {/* Academic Enrollment section */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Academic Enrollment</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <LabelledInput label="Enrollment Date *" type="date" value={createDraft.enrollmentDate} onChange={(v) => setCreateDraft((d) => ({ ...d, enrollmentDate: v }))} />
                  <SelectField label="Status *" value={createDraft.status} onValueChange={(v) => setCreateDraft((d) => ({ ...d, status: v as StudentStatus }))} options={statusOptions.map((s) => ({ value: s, label: formatStudentStatus(s) }))} />
                  <SelectField label="Program *" value={createDraft.programId} onValueChange={(v) => setCreateDraft((d) => ({ ...d, programId: v, programLevelId: "" }))} options={programs.map((p) => ({ value: String(p.id), label: p.name }))} />
                  <SelectField label="Program Level *" value={createDraft.programLevelId} onValueChange={(v) => setCreateDraft((d) => ({ ...d, programLevelId: v }))} options={selectedProgramLevelsForCreate.map((l) => ({ value: String(l.id), label: `Level ${l.level}` }))} />
                  <SelectField label="Semester *" value={createDraft.semesterId} onValueChange={(v) => setCreateDraft((d) => ({ ...d, semesterId: v }))} options={semesters.map((s) => ({ value: String(s.id), label: `${s.type} ${s.year}` }))} />
                </div>
              </section>

              {/* Qualifications section */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Qualifications</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <LabelledInput label="Previous Qualification" value={createDraft.previousQualification} onChange={(v) => setCreateDraft((d) => ({ ...d, previousQualification: v }))} />
                  <LabelledInput label="Secondary School" value={createDraft.secondarySchoolName} onChange={(v) => setCreateDraft((d) => ({ ...d, secondarySchoolName: v }))} />
                  <LabelledInput label="Total High School Grades" value={createDraft.totalHighSchoolGrades} onChange={(v) => setCreateDraft((d) => ({ ...d, totalHighSchoolGrades: v }))} />
                  <LabelledInput label="High School Seat Number" value={createDraft.highSchoolSeatNumber} onChange={(v) => setCreateDraft((d) => ({ ...d, highSchoolSeatNumber: v }))} />
                </div>
              </section>
            </div>
          </div>

          {/* Sticky footer */}
          <DialogFooter className="shrink-0 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <Button variant="outline" onClick={resetCreateDialog} className="gap-2">
              Cancel
            </Button>
            <Button
              onClick={() => void handleCreateStudent()}
              disabled={saving}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              {saving ? "Creating…" : "Create Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════
          EDIT STUDENT DIALOG
      ══════════════════════════════════════════════════════════ */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) =>
          !open ? setIsEditOpen(false) : setIsEditOpen(true)
        }
      >
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
          <DialogHeader className="shrink-0 border-b border-slate-100 px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                <Pencil className="h-4 w-4 text-amber-600" />
              </div>
              Edit Student
            </DialogTitle>
            <DialogDescription>
              Update student profile details and sync directly with backend PATCH API.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-6">

              {/* Identity */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Identity</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <LabelledInput label="Username *" value={editDraft.username} onChange={(v) => setEditDraft((d) => ({ ...d, username: v }))} />
                  <LabelledInput label="University Student ID *" value={editDraft.universityStudentId} onChange={(v) => setEditDraft((d) => ({ ...d, universityStudentId: v }))} />
                  <LabelledInput label="First Name *" value={editDraft.firstName} onChange={(v) => setEditDraft((d) => ({ ...d, firstName: v }))} />
                  <LabelledInput label="Last Name *" value={editDraft.lastName} onChange={(v) => setEditDraft((d) => ({ ...d, lastName: v }))} />
                  <LabelledInput label="Full Name" value={editDraft.fullname} onChange={(v) => setEditDraft((d) => ({ ...d, fullname: v }))} />
                  <LabelledInput label="National ID" value={editDraft.nationalId} onChange={(v) => setEditDraft((d) => ({ ...d, nationalId: v }))} />
                  <LabelledInput label="Date of Birth" type="date" value={editDraft.dateOfBirth} onChange={(v) => setEditDraft((d) => ({ ...d, dateOfBirth: v }))} />
                  <SelectField label="Gender" value={editDraft.gender} onValueChange={(v) => setEditDraft((d) => ({ ...d, gender: v as "M" | "F" }))} options={[{ value: "M", label: "Male (M)" }, { value: "F", label: "Female (F)" }]} />
                  <SelectField label="Religion" value={editDraft.religion} onValueChange={(v) => setEditDraft((d) => ({ ...d, religion: v as "M" | "C" }))} options={[{ value: "M", label: "Muslim (M)" }, { value: "C", label: "Christian (C)" }]} />
                </div>
              </section>

              {/* Contact */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Contact</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <LabelledInput label="Email" type="email" value={editDraft.email} onChange={(v) => setEditDraft((d) => ({ ...d, email: v }))} />
                  <LabelledInput label="Phone" value={editDraft.phone} onChange={(v) => setEditDraft((d) => ({ ...d, phone: v }))} />
                  <LabelledInput label="Home Phone" value={editDraft.homePhone} onChange={(v) => setEditDraft((d) => ({ ...d, homePhone: v }))} />
                  <LabelledInput label="Address" value={editDraft.address} onChange={(v) => setEditDraft((d) => ({ ...d, address: v }))} />
                  <LabelledInput label="City" value={editDraft.city} onChange={(v) => setEditDraft((d) => ({ ...d, city: v }))} />
                  <LabelledInput label="Country" value={editDraft.country} onChange={(v) => setEditDraft((d) => ({ ...d, country: v }))} />
                </div>
              </section>

              {/* Academic Enrollment */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Academic Enrollment</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <LabelledInput label="Enrollment Date" type="date" value={editDraft.enrollmentDate} onChange={(v) => setEditDraft((d) => ({ ...d, enrollmentDate: v }))} />
                  <SelectField label="Status" value={editDraft.status} onValueChange={(v) => setEditDraft((d) => ({ ...d, status: v as StudentStatus }))} options={statusOptions.map((s) => ({ value: s, label: formatStudentStatus(s) }))} />
                  <SelectField label="Program" value={editDraft.programId} onValueChange={(v) => setEditDraft((d) => ({ ...d, programId: v, programLevelId: "" }))} options={programs.map((p) => ({ value: String(p.id), label: p.name }))} />
                  <SelectField label="Program Level" value={editDraft.programLevelId} onValueChange={(v) => setEditDraft((d) => ({ ...d, programLevelId: v }))} options={selectedProgramLevelsForEdit.map((l) => ({ value: String(l.id), label: `Level ${l.level}` }))} />
                </div>
              </section>

              {/* Qualifications */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Qualifications</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <LabelledInput label="Previous Qualification" value={editDraft.previousQualification} onChange={(v) => setEditDraft((d) => ({ ...d, previousQualification: v }))} />
                  <LabelledInput label="Secondary School" value={editDraft.secondarySchoolName} onChange={(v) => setEditDraft((d) => ({ ...d, secondarySchoolName: v }))} />
                  <LabelledInput label="Total High School Grades" value={editDraft.totalHighSchoolGrades} onChange={(v) => setEditDraft((d) => ({ ...d, totalHighSchoolGrades: v }))} />
                  <LabelledInput label="High School Seat Number" value={editDraft.highSchoolSeatNumber} onChange={(v) => setEditDraft((d) => ({ ...d, highSchoolSeatNumber: v }))} />
                </div>
              </section>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button
              onClick={() => void handleUpdateStudent()}
              disabled={saving}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════
          IMPORT DIALOG
      ══════════════════════════════════════════════════════════ */}
      <Dialog
        open={isImportOpen}
        onOpenChange={(open) =>
          !open ? resetImportDialog() : setIsImportOpen(true)
        }
      >
        <DialogContent className="!flex !h-[90vh] !max-h-[90vh] !w-[min(96vw,72rem)] !flex-col !overflow-hidden !gap-0 !p-0 sm:!max-w-[72rem]">
          {/* Fixed header */}
          <DialogHeader className="shrink-0 border-b border-slate-100 px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
                <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
              </div>
              Import Students
            </DialogTitle>
            <DialogDescription>
              Upload an Excel file, monitor background processing, then fix failed rows directly.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={importTab}
            onValueChange={(v) => setImportTab(v as "setup" | "status" | "recover")}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            {/* Tab bar */}
            <div className="shrink-0 border-b border-slate-100 px-6 pt-3">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-100">
                <TabsTrigger value="setup" className="gap-2 text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  <CloudUpload className="h-3.5 w-3.5" />
                  Setup
                </TabsTrigger>
                <TabsTrigger value="status" className="gap-2 text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Processing
                </TabsTrigger>
                <TabsTrigger value="recover" className="relative gap-2 text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  <TriangleAlert className="h-3.5 w-3.5" />
                  Recover Errors
                  {importFailures.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                      {importFailures.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── SETUP TAB ─────────────────────────────────── */}
            <TabsContent
              value="setup"
              className="min-h-0 flex-1 overflow-y-auto px-6 py-4"
            >
              <div className="space-y-5">
                {/* Template download */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Download Import Template</p>
                    <p className="text-xs text-slate-500">Get the official Excel template with all required columns pre-filled with a sample row.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadImportTemplate} className="shrink-0 gap-2 text-xs">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Download Template
                  </Button>
                </div>

                {/* Program / Level / Semester */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Enrollment Context</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <SelectField label="Program *" value={importProgramId} onValueChange={(v) => { setImportProgramId(v); setImportProgramLevelId(""); }} options={programs.map((p) => ({ value: String(p.id), label: p.name }))} />
                    <SelectField label="Program Level *" value={importProgramLevelId} onValueChange={setImportProgramLevelId} options={selectedProgramLevelsForImport.map((l) => ({ value: String(l.id), label: `Level ${l.level}` }))} />
                    <SelectField label="Semester *" value={importSemesterId} onValueChange={setImportSemesterId} options={semesters.map((s) => ({ value: String(s.id), label: `${s.type} ${s.year}` }))} />
                  </div>
                </div>

                {/* Drag & Drop Zone */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Excel File</p>
                  <div
                    className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragOver
                      ? "border-blue-400 bg-blue-50"
                      : importFile
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                      }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files?.[0] ?? null;
                      void handleImportFileChange(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      id="import-file"
                      type="file"
                      accept=".xlsx"
                      className="sr-only"
                      onChange={(e) => { const f = e.target.files?.[0] ?? null; void handleImportFileChange(f); }}
                    />
                    {importFile ? (
                      <>
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                          <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 shadow-sm">
                          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-sm font-medium text-slate-700">{importFile.name}</span>
                          <button
                            className="ml-1 text-slate-400 hover:text-rose-500 transition-colors"
                            onClick={(e) => { e.stopPropagation(); void handleImportFileChange(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-emerald-600">{importPreviewRows.length} rows loaded — click to change</p>
                      </>
                    ) : (
                      <>
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                          <FileUp className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Drop your Excel file here</p>
                        <p className="mt-1 text-xs text-slate-400">or click to browse — .xlsx files only</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Start import */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    {importPreviewRows.length > 0
                      ? <span className="font-medium text-emerald-600">{importPreviewRows.length} rows</span>
                      : "No file loaded"
                    }{" "}
                    preview loaded
                  </p>
                  <Button
                    onClick={() => void handleStartImport()}
                    disabled={importing || !importFile || importStatus === "Pending" || importStatus === "Processing"}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {importing ? "Importing…" : "Start Import"}
                  </Button>
                </div>

                {/* Preview table */}
                {importPreviewRows.length > 0 && (
                  <div className="max-h-[24rem] overflow-hidden rounded-xl border border-slate-200">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2">
                      <p className="text-xs font-semibold text-slate-500">Preview (all rows)</p>
                    </div>
                    <div className="max-h-[20rem] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="text-xs">Row</TableHead>
                            <TableHead className="text-xs">Username</TableHead>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs">Univ. ID</TableHead>
                            <TableHead className="text-xs">Email</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importPreviewRows.map((row) => (
                            <TableRow key={row.rowNumber} className="text-xs">
                              <TableCell><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{row.rowNumber}</code></TableCell>
                              <TableCell className="text-slate-700">{row.data.username || "—"}</TableCell>
                              <TableCell className="text-slate-700">{row.data.fullname || `${row.data.firstName || ""} ${row.data.lastName || ""}`.trim() || "—"}</TableCell>
                              <TableCell className="text-slate-700">{row.data.universityStudentId || "—"}</TableCell>
                              <TableCell className="text-slate-500">{row.data.email || "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── PROCESSING TAB ────────────────────────────── */}
            <TabsContent
              value="status"
              className="min-h-0 flex-1 overflow-y-auto px-6 py-4"
            >
              <div className="space-y-5">
                {/* Stepper */}
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Import Progress</p>
                  <div className="flex items-center gap-0">
                    {importStatusSteps.map((step, i) => {
                      const isActive = importStatus?.toLowerCase() === step.key.toLowerCase() || (step.key === "Uploaded" && !!importJobId && importStatus === "Pending");
                      const isDone = step.done;
                      const isFailed = step.key === "Terminal" && importStatus === "Failed";

                      return (
                        <div key={step.key} className="flex flex-1 items-center">
                          <div className="flex flex-col items-center">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${isFailed ? "border-rose-400 bg-rose-50 text-rose-600"
                              : isDone ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                                : isActive ? "border-blue-400 bg-blue-50 text-blue-600 ring-2 ring-blue-200"
                                  : "border-slate-200 bg-slate-50 text-slate-400"
                              }`}>
                              {isFailed ? <X className="h-4 w-4" /> : isDone ? <CheckCircle2 className="h-4 w-4" /> : isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{i + 1}</span>}
                            </div>
                            <span className={`mt-1.5 text-[10px] font-medium ${isFailed ? "text-rose-600" : isDone ? "text-emerald-600" : isActive ? "text-blue-600" : "text-slate-400"}`}>
                              {step.label}
                            </span>
                          </div>
                          {i < importStatusSteps.length - 1 && (
                            <div className={`mb-5 h-0.5 flex-1 transition-all ${step.done ? "bg-emerald-300" : "bg-slate-200"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status details */}
                <div className={`rounded-xl border p-4 ${importStatus === "Completed" ? "border-emerald-200 bg-emerald-50"
                  : importStatus === "Failed" ? "border-rose-200 bg-rose-50"
                    : importStatus === "CompletedWithErrors" ? "border-amber-200 bg-amber-50"
                      : "border-blue-100 bg-blue-50"
                  }`}>
                  <div className="mb-2 flex items-center gap-2">
                    {importStatus === "Completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : importStatus === "Failed" || importStatus === "CompletedWithErrors" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                    <p className="text-sm font-medium text-slate-800">
                      {importStatus ? `Status: ${importStatus}` : "Waiting to start"}
                    </p>
                    {importing && (
                      <Badge variant="secondary" className="ml-auto text-xs">Polling backend…</Badge>
                    )}
                  </div>
                  {importJobId && (
                    <p className="mb-1 text-xs text-slate-500">Job ID: <code className="rounded bg-white px-1 py-0.5">{importJobId}</code></p>
                  )}
                  <p className="text-xs text-slate-600">
                    {importStatusMessage || "Start import to track progress here."}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleRefreshImportStatus()}
                    disabled={!importJobId}
                    className="gap-2 text-xs"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Refresh Status
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* ── RECOVER ERRORS TAB ────────────────────────── */}
            <TabsContent
              value="recover"
              className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-4"
              style={importTab === "recover" ? undefined : { maxHeight: "0px" }}
            >
              {/* Header bar */}
              <div className="mb-4 shrink-0 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <TriangleAlert className="h-4 w-4 text-amber-600" />
                    <p className="text-sm font-semibold text-slate-800">
                      {importFailures.length} row{importFailures.length !== 1 ? "s" : ""} to recover
                    </p>
                    {importFailures.length > 0 && (
                      <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        {importFailures.length} remaining
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Expand each row, correct the data, then retry.
                  </p>
                </div>
                <Button
                  onClick={() => void retryFailedRows()}
                  disabled={retryingFailedRows || importFailures.length === 0}
                  className="gap-2 bg-amber-600 hover:bg-amber-700"
                  size="sm"
                >
                  {retryingFailedRows ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                  {retryingFailedRows ? "Retrying…" : "Retry Corrected Rows"}
                </Button>
              </div>

              {importFailures.length === 0 ? (
                // Empty state
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No failed rows</p>
                  <p className="mt-1 max-w-xs text-xs text-slate-400">
                    Once the backend returns validation errors, they appear here for manual correction.
                  </p>
                </div>
              ) : (
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="space-y-2">
                    {importFailures.map((row, rowIndex) => {
                      const isExpanded = expandedErrorRows.has(rowIndex);

                      return (
                        <div
                          key={`${row.row}-${rowIndex}`}
                          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                        >
                          {/* Accordion header */}
                          <button
                            className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
                            onClick={() => toggleExpandError(rowIndex)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                  Row {row.row}
                                </span>
                                {row.username && (
                                  <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                                    @{row.username}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5">
                                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                                <p className="text-xs text-amber-800">{row.reason}</p>
                              </div>
                            </div>
                            {isExpanded
                              ? <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                              : <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-400" />}
                          </button>

                          {/* Accordion body */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 bg-slate-50/50 px-4 pb-4 pt-3">
                              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
                                {importEditableColumns.map((key) => (
                                  <div key={key} className="space-y-1">
                                    <Label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{key}</Label>
                                    <Input
                                      className="h-8 bg-white text-xs"
                                      value={row.data[key] || ""}
                                      onChange={(e) => handleFailureCellEdit(rowIndex, key, e.target.value)}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Fixed footer */}
          <DialogFooter className="shrink-0 border-t border-slate-100 bg-slate-50/70 px-6 py-3">
            <p className="mr-auto text-xs text-slate-400">
              {importing || importStatus === "Pending" || importStatus === "Processing"
                ? "Closing keeps import tracking in the background."
                : "Close to clear this import session."}
            </p>
            <Button variant="outline" onClick={resetImportDialog} className="gap-2 text-xs">
              <X className="h-3.5 w-3.5" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Sub-components (helper UI only — no logic change)
// ══════════════════════════════════════════════════════════════════

function LabelledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  const isRequired = label.includes("*");

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">
        {label.replace(" *", "")}
        {isRequired && <span className="ml-0.5 text-rose-500">*</span>}
      </Label>
      <div className="relative">
        {type === "date" && (
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        )}
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`border-slate-200 text-sm focus-visible:ring-blue-500 ${type === "date" ? "pl-9" : ""}`}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const isRequired = label.includes("*");

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">
        {label.replace(" *", "")}
        {isRequired && <span className="ml-0.5 text-rose-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="border-slate-200 text-sm focus:ring-blue-500">
          <SelectValue placeholder={`Select ${label.replace(" *", "")}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
