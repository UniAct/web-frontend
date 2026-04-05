import { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
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
  ShieldAlert,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
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
} from '../../api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SearchableSelect } from '../ui/searchable-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

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
  religion: 'M' | 'C';
  gender: 'M' | 'F';
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
  username: '',
  firstName: '',
  lastName: '',
  fullname: '',
  universityStudentId: '',
  nationalId: '',
  email: '',
  phone: '',
  homePhone: '',
  dateOfBirth: '',
  enrollmentDate: '',
  address: '',
  city: '',
  country: 'Egypt',
  status: 'Active',
  religion: 'M',
  gender: 'M',
  previousQualification: '',
  secondarySchoolName: '',
  totalHighSchoolGrades: '',
  highSchoolSeatNumber: '',
  programId: '',
  programLevelId: '',
  semesterId: '',
};

const importEditableColumns = [
  'username',
  'firstName',
  'lastName',
  'fullname',
  'universityStudentId',
  'nationalId',
  'email',
  'phone',
  'dateOfBirth',
  'enrollmentDate',
  'status',
  'religion',
  'gender',
];

const importTemplateHeaders = [
  'Username',
  'First Name',
  'Last Name',
  'Full Name',
  'University Student ID',
  'National ID',
  'Email',
  'Phone',
  'Date of Birth',
  'Address',
  'City',
  'Country',
  'Status',
  'Enrollment Date',
  'Religion',
  'Gender',
  'Home Phone',
  'Previous Qualification',
  'Secondary School Name',
  'Total High School Grades',
  'High School Seat Number',
];

const importTemplateSampleRow = [
  'ahmed.hassan',
  'Ahmed',
  'Hassan',
  'Ahmed Hassan',
  '20260001',
  '30101011234567',
  'ahmed.hassan@student.anu.edu.eg',
  '01012345678',
  '2007-02-01',
  'Smouha, Alexandria',
  'Alexandria',
  'Egypt',
  'Active',
  '2026-09-15',
  'M',
  'M',
  '034567890',
  'Thanaweya Amma',
  'Alex Secondary School',
  '91',
  'S123456',
];

const getImportStorageKey = (universityId: string) => `studentsImportSession:${universityId}`;

const defaultStatusOptions: StudentStatus[] = ['Active', 'Inactive', 'Graduated', 'Suspended', 'Dismissed'];

function toCamelKey(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((part, index) => {
      if (index === 0) {
        return part.charAt(0).toLowerCase() + part.slice(1).toLowerCase();
      }

      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
}
const IMPORT_MAX_CHECKS = 48;
const IMPORT_POLL_DELAY_MS = 2500;

function resolveProgramLevels(programs: Program[], selectedProgramId: string): Program['levels'] {
  const id = Number(selectedProgramId);
  if (!id) return [];
  const program = programs.find((item) => item.id === id);
  return program?.levels ?? [];
}

function parseImportPreview(file: File): Promise<ImportPreviewRow[]> {
  return file.arrayBuffer().then((buffer) => {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

    return rows.map((row, index) => {
      const normalizedData: Record<string, string> = {};
      Object.entries(row).forEach(([key, value]) => {
        normalizedData[toCamelKey(key)] = String(value ?? '').trim();
      });

      return {
        rowNumber: index + 2,
        data: normalizedData,
      };
    });
  });
}

function parseDateValue(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function downloadImportTemplate(): void {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([importTemplateHeaders, importTemplateSampleRow]);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Template');
  XLSX.writeFile(workbook, 'students_import_template.xlsx');
}

function readPersistedImportSession(universityId: string): PersistedImportSession | null {
  try {
    const raw = localStorage.getItem(getImportStorageKey(universityId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedImportSession;
    if (!parsed?.jobId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePersistedImportSession(session: PersistedImportSession): void {
  localStorage.setItem(getImportStorageKey(session.universityId), JSON.stringify(session));
}

function clearPersistedImportSession(universityId: string): void {
  localStorage.removeItem(getImportStorageKey(universityId));
}

function isTerminalImportLookupError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('job not found') ||
    normalized.includes('http 404') ||
    normalized.includes('request failed (http 404)')
  );
}

function normalizeImportFailures(
  errors: StudentImportErrorRow[] | undefined,
  previewRows: ImportPreviewRow[],
): EditableImportFailure[] {
  if (!errors || errors.length === 0) return [];

  return errors.map((error) => {
    const preview = previewRows.find((row) => row.rowNumber === Number(error.row));
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
  const joined = `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim();
  return joined || student.fullName || student.username;
}

function parseNumeric(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function mapDraftToCreatePayload(draft: StudentDraft): CreateStudentInput {
  return {
    username: draft.username.trim(),
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    fullname: draft.fullname.trim() || `${draft.firstName.trim()} ${draft.lastName.trim()}`.trim(),
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
    previousQualification: draft.previousQualification.trim() || undefined,
    secondarySchoolName: draft.secondarySchoolName.trim() || undefined,
    totalHighSchoolGrades: parseNumeric(draft.totalHighSchoolGrades),
    highSchoolSeatNumber: draft.highSchoolSeatNumber.trim() || undefined,
  };
}

function mapStudentToEditDraft(student: StudentRecord): StudentDraft {
  return {
    username: student.username,
    firstName: student.firstName,
    lastName: student.lastName,
    fullname: student.fullName,
    universityStudentId: String(student.universityStudentId),
    nationalId: student.nationalId,
    email: student.email,
    phone: student.phone,
    homePhone: '',
    dateOfBirth: '',
    enrollmentDate: student.enrollmentDate?.slice(0, 10) || '',
    address: '',
    city: student.city,
    country: student.country,
    status: student.status,
    religion: student.religion,
    gender: student.gender,
    previousQualification: '',
    secondarySchoolName: '',
    totalHighSchoolGrades: '',
    highSchoolSeatNumber: '',
    programId: String(student.programId),
    programLevelId: String(student.programLevelId),
    semesterId: '',
  };
}

function mapEditDraftToPayload(draft: StudentDraft): UpdateStudentInput {
  return {
    username: draft.username.trim(),
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    fullname: draft.fullname.trim() || `${draft.firstName.trim()} ${draft.lastName.trim()}`.trim(),
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
    previousQualification: draft.previousQualification.trim() || undefined,
    secondarySchoolName: draft.secondarySchoolName.trim() || undefined,
    totalHighSchoolGrades: parseNumeric(draft.totalHighSchoolGrades),
    highSchoolSeatNumber: draft.highSchoolSeatNumber.trim() || undefined,
    dateOfBirth: draft.dateOfBirth || undefined,
  };
}

export function StudentsPage({ selectedUniversity }: StudentsPageProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteFilter, setDeleteFilter] = useState<'active' | 'deleted' | 'all'>('active');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeSemesterId, setActiveSemesterId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<StudentDraft>(emptyStudentDraft);
  const [editDraft, setEditDraft] = useState<StudentDraft>(emptyStudentDraft);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreviewRows, setImportPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [importProgramId, setImportProgramId] = useState('');
  const [importProgramLevelId, setImportProgramLevelId] = useState('');
  const [importSemesterId, setImportSemesterId] = useState('');
  const [importJobId, setImportJobId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<StudentImportStatus | null>(null);
  const [importStatusMessage, setImportStatusMessage] = useState('');
  const [importFailures, setImportFailures] = useState<EditableImportFailure[]>([]);
  const [importing, setImporting] = useState(false);
  const [retryingFailedRows, setRetryingFailedRows] = useState(false);
  const [importTab, setImportTab] = useState<'setup' | 'status' | 'recover'>('setup');
  const pollingJobRef = useRef<string | null>(null);

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
    if (programFilter === 'all') return allProgramLevels;

    return resolveProgramLevels(programs, programFilter).map((level) => ({
      value: String(level.id),
      label: `Level ${level.level}`,
    }));
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
    const dynamic = new Set<StudentStatus>(defaultStatusOptions);
    students.forEach((student) => dynamic.add(student.status));
    return Array.from(dynamic);
  }, [students]);

  const activeSemester = useMemo(
    () => semesters.find((item) => item.id === activeSemesterId) ?? null,
    [semesters, activeSemesterId],
  );

  const loadStudents = async () => {
    if (!selectedUniversity || !activeSemester) {
      setStudents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const queryBase: {
        programId?: number;
        status?: StudentStatus;
        isBlocked?: boolean;
        sortOrder: 'asc' | 'desc';
      } = {
        sortOrder,
      };

      if (programFilter !== 'all') queryBase.programId = Number(programFilter);
      if (statusFilter !== 'all') queryBase.status = statusFilter as StudentStatus;
      if (deleteFilter === 'active') queryBase.isBlocked = false;
      if (deleteFilter === 'deleted') queryBase.isBlocked = true;

      const firstPage = await StudentService.getStudents({
        ...queryBase,
        page: 1,
        limit: 100,
      });

      const allRows = [...firstPage.students];
      const totalPages = firstPage.pagination.totalPages;

      if (totalPages > 1) {
        const pagePromises: Array<Promise<Awaited<ReturnType<typeof StudentService.getStudents>>>> = [];
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
      console.error('Failed to load students:', error);
      toast.error(error.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    if (!selectedUniversity) return;

    try {
      const [programData, semesterData] = await Promise.all([
        ProgramService.getAll(),
        SemesterService.getAll(),
      ]);

      setPrograms(programData);
      setSemesters(semesterData);
    } catch (error: any) {
      console.error('Failed to load lookup data:', error);
      toast.error(error.message || 'Failed to load programs and semesters');
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

    const read = () => {
      const raw = localStorage.getItem(`activeSemester:${selectedUniversity}`);
      const parsed = raw ? Number(raw) : NaN;
      setActiveSemesterId(Number.isFinite(parsed) ? parsed : null);
    };

    read();
    const interval = window.setInterval(read, 1000);
    return () => window.clearInterval(interval);
  }, [selectedUniversity]);

  useEffect(() => {
    if (!selectedUniversity) return;
    const persisted = readPersistedImportSession(selectedUniversity);
    if (!persisted) return;

    setImportJobId(persisted.jobId);
    setImportStatus(persisted.status);
    setImportStatusMessage(persisted.statusMessage);
    setImportProgramId(persisted.programId);
    setImportProgramLevelId(persisted.programLevelId);
    setImportSemesterId(persisted.semesterId);

    if (persisted.status === 'Pending' || persisted.status === 'Processing') {
      setImportTab('status');
      void startImportPolling(persisted.jobId);
    }
  }, [selectedUniversity]);

  useEffect(() => {
    if (!selectedUniversity) return;

    if (!activeSemester) {
      setStudents([]);
      return;
    }

    void loadStudents();
  }, [selectedUniversity, activeSemesterId, programFilter, statusFilter, deleteFilter, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, programFilter, levelFilter, statusFilter, deleteFilter]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !term ||
        getStudentFullName(student).toLowerCase().includes(term) ||
        student.username.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.nationalId.toLowerCase().includes(term) ||
        String(student.universityStudentId).includes(term);

      const matchesLevel = levelFilter === 'all' || String(student.programLevelId) === levelFilter;
      const enrollmentDate = parseDateValue(student.enrollmentDate);

      let matchesActiveSemester = true;
      if (activeSemester) {
        const start = parseDateValue(activeSemester.startDate);
        const end = parseDateValue(activeSemester.endDate);
        if (start && end && enrollmentDate) {
          matchesActiveSemester = enrollmentDate >= start && enrollmentDate <= end;
        }
      }

      return matchesSearch && matchesLevel && matchesActiveSemester;
    });
  }, [students, search, levelFilter, activeSemester]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const currentRows = filteredStudents.slice(pageStart, pageStart + pageSize);

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => !s.isBlocked).length;
    const deleted = students.filter((s) => s.isBlocked).length;

    return { total, active, deleted };
  }, [students]);

  const resetCreateDialog = () => {
    setCreateDraft(emptyStudentDraft);
    setIsCreateOpen(false);
  };

  const handleCreateStudent = async () => {
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
      toast.error('Please fill all required fields before creating the student.');
      return;
    }

    if (Number.isNaN(Number(createDraft.universityStudentId))) {
      toast.error('University Student ID must be a valid number.');
      return;
    }

    try {
      setSaving(true);
      await StudentService.createStudent(mapDraftToCreatePayload(createDraft));
      toast.success('Student created successfully.');
      resetCreateDialog();
      await loadStudents();
    } catch (error: any) {
      console.error('Create student failed:', error);
      toast.error(error.message || 'Failed to create student');
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

    if (!editDraft.username.trim() || !editDraft.firstName.trim() || !editDraft.lastName.trim()) {
      toast.error('Username, first name, and last name are required.');
      return;
    }

    try {
      setSaving(true);
      await StudentService.updateStudent(editingStudentId, mapEditDraftToPayload(editDraft));
      toast.success('Student updated successfully.');
      setIsEditOpen(false);
      setEditingStudentId(null);
      await loadStudents();
    } catch (error: any) {
      console.error('Update student failed:', error);
      toast.error(error.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrRestore = async (student: StudentRecord) => {
    try {
      if (student.isBlocked) {
        await StudentService.activateStudent(student.id);
        toast.success(`Student ${student.username} has been re-activated.`);
      } else {
        await StudentService.softDeleteStudent(student.id);
        toast.success(`Student ${student.username} has been deactivated.`);
      }
      await loadStudents();
    } catch (error: any) {
      console.error('Delete/restore failed:', error);
      toast.error(error.message || 'Failed to update student state');
    }
  };

  const handleImportFileChange = async (file: File | null) => {
    setImportFile(file);
    setImportPreviewRows([]);
    setImportFailures([]);
    setImportStatus(null);
    setImportStatusMessage('');
    setImportJobId(null);

    if (!file) return;

    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.xlsx')) {
      toast.error('Only .xlsx files are accepted by backend import API.');
      return;
    }

    try {
      const preview = await parseImportPreview(file);
      setImportPreviewRows(preview);
      toast.success(`Loaded ${preview.length} rows from ${file.name}`);
    } catch (error: any) {
      console.error('Preview parse failed:', error);
      toast.error(error.message || 'Failed to parse Excel file for preview');
    }
  };

  const startImportPolling = async (jobId: string) => {
    if (pollingJobRef.current === jobId) return;
    pollingJobRef.current = jobId;
    setImporting(true);

    let reachedTerminalState = false;

    for (let index = 0; index < IMPORT_MAX_CHECKS; index += 1) {
      try {
        const statusData = await StudentService.getImportStatus(jobId);
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
            fileName: importFile?.name || 'students.xlsx',
          });
        }

        if (statusData.status === 'Completed' || statusData.status === 'Failed' || statusData.status === 'CompletedWithErrors') {
          reachedTerminalState = true;
          const normalized = normalizeImportFailures(statusData.error, importPreviewRows);
          setImportFailures(normalized);
          setImportTab(statusData.status === 'Completed' ? 'status' : 'recover');
          if (statusData.status === 'Completed') {
            toast.success('Import completed successfully.');
          } else if (statusData.status === 'CompletedWithErrors') {
            toast.warning('Import completed with errors. You can fix and retry failed rows below.');
          } else {
            toast.error('Import failed. Review backend reasons and corrected rows table.');
          }
          break;
        }
      } catch (error: any) {
        console.error('Polling import status failed:', error);
        const message = error?.message || 'Failed to poll import status';
        setImportStatusMessage(message);

        if (isTerminalImportLookupError(message)) {
          setImportStatus('Failed');
          setImportTab('status');
          setImporting(false);
          pollingJobRef.current = null;

          if (selectedUniversity) {
            writePersistedImportSession({
              universityId: selectedUniversity,
              jobId,
              status: 'Failed',
              statusMessage: message,
              programId: importProgramId,
              programLevelId: importProgramLevelId,
              semesterId: importSemesterId,
              fileName: importFile?.name || 'students.xlsx',
            });
          }

          toast.error('Import tracking ended: job was not found by backend.');
          return;
        }
      }

      await new Promise((resolve) => window.setTimeout(resolve, IMPORT_POLL_DELAY_MS));
    }

    if (!reachedTerminalState) {
      setImportStatusMessage('Import is taking longer than expected. You can keep this tab open or click Refresh Status manually.');
      setImportTab('status');
      toast.warning('Import is still processing. You can refresh status manually.');
    }

    setImporting(false);
    pollingJobRef.current = null;
    await loadStudents();
  };

  const handleRefreshImportStatus = async () => {
    if (!importJobId) {
      toast.error('No import job found to refresh.');
      return;
    }

    try {
      const statusData = await StudentService.getImportStatus(importJobId);
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
          fileName: importFile?.name || 'students.xlsx',
        });
      }

      if (statusData.status === 'Completed' || statusData.status === 'Failed' || statusData.status === 'CompletedWithErrors') {
        const normalized = normalizeImportFailures(statusData.error, importPreviewRows);
        setImportFailures(normalized);
        setImporting(false);
        pollingJobRef.current = null;
        setImportTab(statusData.status === 'Completed' ? 'status' : 'recover');
      }
    } catch (error: any) {
      const message = error?.message || 'Failed to refresh import status';
      setImportStatus('Failed');
      setImportStatusMessage(message);
      setImporting(false);
      pollingJobRef.current = null;
      toast.error(message);
    }
  };

  const handleStartImport = async () => {
    if (importing || importStatus === 'Pending' || importStatus === 'Processing') {
      setImportTab('status');
      toast.warning('There is already an import in progress. Please wait for completion.');
      return;
    }

    if (!importFile) {
      toast.error('Please choose an Excel file first.');
      return;
    }

    if (!importProgramId || !importProgramLevelId || !importSemesterId) {
      toast.error('Program, level, and semester are required before import.');
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
      setImportStatus('Pending');
      setImportStatusMessage(response.message);
      setImportTab('status');
      toast.success('Import accepted by server. Processing will start shortly.');

      if (selectedUniversity) {
        writePersistedImportSession({
          universityId: selectedUniversity,
          jobId: response.jobId,
          status: 'Pending',
          statusMessage: response.message,
          programId: importProgramId,
          programLevelId: importProgramLevelId,
          semesterId: importSemesterId,
          fileName: importFile.name,
        });
      }

      await startImportPolling(response.jobId);
    } catch (error: any) {
      console.error('Start import failed:', error);
      toast.error(error.message || 'Failed to start import');
    }
  };

  const handleFailureCellEdit = (rowIndex: number, key: string, value: string) => {
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
    context: { programId: string; programLevelId: string; semesterId: string },
  ): CreateStudentInput => {
    const fullName = row.data.fullname?.trim() || `${row.data.firstName || ''} ${row.data.lastName || ''}`.trim();
    const grades = parseNumeric(row.data.totalHighSchoolGrades || '');

    return {
      username: (row.data.username || '').trim(),
      firstName: (row.data.firstName || '').trim(),
      lastName: (row.data.lastName || '').trim(),
      fullname: fullName,
      universityStudentId: Number(row.data.universityStudentId),
      nationalId: (row.data.nationalId || '').trim(),
      programId: Number(context.programId),
      programLevelId: Number(context.programLevelId),
      semesterId: Number(context.semesterId),
      email: (row.data.email || '').trim().toLowerCase(),
      phone: (row.data.phone || '').trim(),
      dateOfBirth: (row.data.dateOfBirth || '').trim(),
      address: (row.data.address || '').trim(),
      city: (row.data.city || '').trim(),
      country: (row.data.country || '').trim() || 'Egypt',
      status: ((row.data.status || 'Active').trim() as StudentStatus) || 'Active',
      enrollmentDate: (row.data.enrollmentDate || '').trim(),
      religion: ((row.data.religion || 'M').trim() as 'M' | 'C') || 'M',
      gender: ((row.data.gender || 'M').trim() as 'M' | 'F') || 'M',
      homePhone: (row.data.homePhone || '').trim() || undefined,
      previousQualification: (row.data.previousQualification || '').trim() || undefined,
      secondarySchoolName: (row.data.secondarySchoolName || '').trim() || undefined,
      totalHighSchoolGrades: grades,
      highSchoolSeatNumber: (row.data.highSchoolSeatNumber || '').trim() || undefined,
    };
  };

  const retryFailedRows = async () => {
    if (!importProgramId || !importProgramLevelId || !importSemesterId) {
      toast.error('Import context is missing. Please select program, level, and semester again.');
      return;
    }

    if (importFailures.length === 0) {
      toast.error('No failed rows to retry.');
      return;
    }

    try {
      setRetryingFailedRows(true);

      const remaining: EditableImportFailure[] = [];
      let successCount = 0;

      for (const failure of importFailures) {
        try {
          const payload = buildCreatePayloadFromFailedRow(failure, {
            programId: importProgramId,
            programLevelId: importProgramLevelId,
            semesterId: importSemesterId,
          });

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
        toast.success(`Inserted ${successCount} corrected rows successfully.`);
      }

      if (remaining.length > 0) {
        toast.warning(`${remaining.length} rows still have validation errors.`);
      } else {
        toast.success('All failed rows were recovered successfully.');
      }

      await loadStudents();
    } finally {
      setRetryingFailedRows(false);
    }
  };

  const resetImportDialog = () => {
    if (importing || importStatus === 'Pending' || importStatus === 'Processing') {
      setIsImportOpen(false);
      return;
    }

    if (selectedUniversity) {
      clearPersistedImportSession(selectedUniversity);
    }

    setImportFile(null);
    setImportPreviewRows([]);
    setImportProgramId('');
    setImportProgramLevelId('');
    setImportSemesterId('');
    setImportJobId(null);
    setImportStatus(null);
    setImportStatusMessage('');
    setImportFailures([]);
    setImporting(false);
    setRetryingFailedRows(false);
    setImportTab('setup');
    setIsImportOpen(false);
  };

  if (!selectedUniversity) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="mb-4 h-12 w-12 text-slate-400" />
          <h3 className="mb-2 text-lg font-medium text-slate-900">No University Selected</h3>
          <p className="text-center text-slate-600">
            Please select a university before managing student accounts.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!activeSemester) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarDays className="mb-4 h-12 w-12 text-slate-400" />
          <h3 className="mb-2 text-lg font-medium text-slate-900">Select a Semester First</h3>
          <p className="max-w-md text-slate-600">
            Open Semester Management in the header and choose the active semester before loading students.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Student Management</h2>
          <p className="mt-1 text-slate-600">
            Fully connected to backend APIs with import recovery workflow and soft-delete controls.
          </p>
          {activeSemester ? (
            <p className="mt-1 text-xs text-blue-700">
              Active semester filter: {activeSemester.year} - {activeSemester.type} (Enrollment Date based)
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void loadStudents()} disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {importing || importStatus === 'Pending' || importStatus === 'Processing' ? 'View Import Status' : 'Import Students'}
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Total Records</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Active Accounts</p>
            <p className="text-2xl font-semibold text-emerald-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Soft Deleted</p>
            <p className="text-2xl font-semibold text-rose-600">{stats.deleted}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>
            Search, filter, edit, deactivate, and recover students without losing records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search by name, username, email, national ID"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <SearchableSelect
              value={programFilter}
              onValueChange={(value) => {
                setProgramFilter(value);
                setLevelFilter('all');
              }}
              options={[
                { value: 'all', label: 'All Programs' },
                ...programs.map((program) => ({ value: String(program.id), label: program.name })),
              ]}
              placeholder="Program"
            />

            <SearchableSelect
              value={levelFilter}
              onValueChange={setLevelFilter}
              options={[{ value: 'all', label: 'All Levels' }, ...levelOptionsForProgramFilter]}
              placeholder="Level"
            />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={deleteFilter} onValueChange={(value: 'active' | 'deleted' | 'all') => setDeleteFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Deletion State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active only</SelectItem>
                <SelectItem value="deleted">Deleted only</SelectItem>
                <SelectItem value="all">All records</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-slate-600">Sort</Label>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest first</SelectItem>
                  <SelectItem value="asc">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-slate-600">Rows</Label>
              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-[95px]">
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

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : currentRows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-slate-600">
              No students found for current filters.
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>University ID</TableHead>
                    <TableHead>Program / Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRows.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{getStudentFullName(student)}</p>
                          <p className="text-xs text-slate-600">{student.email}</p>
                          <p className="text-xs text-slate-500">@{student.username}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-700">{student.universityStudentId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm text-slate-700">
                          <div>{student.programName}</div>
                          <Badge variant="outline">{student.programLevelName}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>{student.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {student.isBlocked ? (
                          <Badge variant="destructive" className="gap-1">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Deleted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(student)}>
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant={student.isBlocked ? 'outline' : 'destructive'}
                            size="sm"
                            onClick={() => void handleDeleteOrRestore(student)}
                          >
                            {student.isBlocked ? (
                              <>
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                Activate
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Deactivate
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Showing {filteredStudents.length === 0 ? 0 : pageStart + 1} to{' '}
              {Math.min(pageStart + pageSize, filteredStudents.length)} of {filteredStudents.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Badge variant="secondary">
                Page {currentPage} / {totalPages}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={(open) => (open ? setIsCreateOpen(true) : resetCreateDialog())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Student</DialogTitle>
            <DialogDescription>
              Fill student identity, contact, and enrollment details. Required fields are validated before submit.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <LabelledInput label="Username *" value={createDraft.username} onChange={(value) => setCreateDraft((d) => ({ ...d, username: value }))} />
            <LabelledInput label="University Student ID *" value={createDraft.universityStudentId} onChange={(value) => setCreateDraft((d) => ({ ...d, universityStudentId: value }))} />
            <LabelledInput label="First Name *" value={createDraft.firstName} onChange={(value) => setCreateDraft((d) => ({ ...d, firstName: value }))} />
            <LabelledInput label="Last Name *" value={createDraft.lastName} onChange={(value) => setCreateDraft((d) => ({ ...d, lastName: value }))} />
            <LabelledInput label="Full Name" value={createDraft.fullname} onChange={(value) => setCreateDraft((d) => ({ ...d, fullname: value }))} />
            <LabelledInput label="National ID *" value={createDraft.nationalId} onChange={(value) => setCreateDraft((d) => ({ ...d, nationalId: value }))} />
            <LabelledInput label="Email *" type="email" value={createDraft.email} onChange={(value) => setCreateDraft((d) => ({ ...d, email: value }))} />
            <LabelledInput label="Phone *" value={createDraft.phone} onChange={(value) => setCreateDraft((d) => ({ ...d, phone: value }))} />
            <LabelledInput label="Home Phone" value={createDraft.homePhone} onChange={(value) => setCreateDraft((d) => ({ ...d, homePhone: value }))} />
            <LabelledInput label="Date of Birth *" type="date" value={createDraft.dateOfBirth} onChange={(value) => setCreateDraft((d) => ({ ...d, dateOfBirth: value }))} />
            <LabelledInput label="Enrollment Date *" type="date" value={createDraft.enrollmentDate} onChange={(value) => setCreateDraft((d) => ({ ...d, enrollmentDate: value }))} />
            <LabelledInput label="Address *" value={createDraft.address} onChange={(value) => setCreateDraft((d) => ({ ...d, address: value }))} />
            <LabelledInput label="City *" value={createDraft.city} onChange={(value) => setCreateDraft((d) => ({ ...d, city: value }))} />
            <LabelledInput label="Country *" value={createDraft.country} onChange={(value) => setCreateDraft((d) => ({ ...d, country: value }))} />
            <LabelledInput label="Previous Qualification" value={createDraft.previousQualification} onChange={(value) => setCreateDraft((d) => ({ ...d, previousQualification: value }))} />
            <LabelledInput label="Secondary School" value={createDraft.secondarySchoolName} onChange={(value) => setCreateDraft((d) => ({ ...d, secondarySchoolName: value }))} />
            <LabelledInput label="Total High School Grades" value={createDraft.totalHighSchoolGrades} onChange={(value) => setCreateDraft((d) => ({ ...d, totalHighSchoolGrades: value }))} />
            <LabelledInput label="High School Seat Number" value={createDraft.highSchoolSeatNumber} onChange={(value) => setCreateDraft((d) => ({ ...d, highSchoolSeatNumber: value }))} />

            <SelectField
              label="Program *"
              value={createDraft.programId}
              onValueChange={(value) => setCreateDraft((d) => ({ ...d, programId: value, programLevelId: '' }))}
              options={programs.map((program) => ({ value: String(program.id), label: program.name }))}
            />
            <SelectField
              label="Program Level *"
              value={createDraft.programLevelId}
              onValueChange={(value) => setCreateDraft((d) => ({ ...d, programLevelId: value }))}
              options={selectedProgramLevelsForCreate.map((level) => ({ value: String(level.id), label: `Level ${level.level}` }))}
            />
            <SelectField
              label="Semester *"
              value={createDraft.semesterId}
              onValueChange={(value) => setCreateDraft((d) => ({ ...d, semesterId: value }))}
              options={semesters.map((semester) => ({
                value: String(semester.id),
                label: `${semester.type} ${semester.year}`,
              }))}
            />
            <SelectField
              label="Status *"
              value={createDraft.status}
              onValueChange={(value) => setCreateDraft((d) => ({ ...d, status: value as StudentStatus }))}
              options={statusOptions.map((status) => ({ value: status, label: status }))}
            />
            <SelectField
              label="Religion *"
              value={createDraft.religion}
              onValueChange={(value) => setCreateDraft((d) => ({ ...d, religion: value as 'M' | 'C' }))}
              options={[
                { value: 'M', label: 'Muslim (M)' },
                { value: 'C', label: 'Christian (C)' },
              ]}
            />
            <SelectField
              label="Gender *"
              value={createDraft.gender}
              onValueChange={(value) => setCreateDraft((d) => ({ ...d, gender: value as 'M' | 'F' }))}
              options={[
                { value: 'M', label: 'Male (M)' },
                { value: 'F', label: 'Female (F)' },
              ]}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetCreateDialog}>Cancel</Button>
            <Button onClick={() => void handleCreateStudent()} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => (!open ? setIsEditOpen(false) : setIsEditOpen(true))}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student profile details and sync directly with backend PATCH API.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <LabelledInput label="Username *" value={editDraft.username} onChange={(value) => setEditDraft((d) => ({ ...d, username: value }))} />
            <LabelledInput label="University Student ID *" value={editDraft.universityStudentId} onChange={(value) => setEditDraft((d) => ({ ...d, universityStudentId: value }))} />
            <LabelledInput label="First Name *" value={editDraft.firstName} onChange={(value) => setEditDraft((d) => ({ ...d, firstName: value }))} />
            <LabelledInput label="Last Name *" value={editDraft.lastName} onChange={(value) => setEditDraft((d) => ({ ...d, lastName: value }))} />
            <LabelledInput label="Full Name" value={editDraft.fullname} onChange={(value) => setEditDraft((d) => ({ ...d, fullname: value }))} />
            <LabelledInput label="National ID" value={editDraft.nationalId} onChange={(value) => setEditDraft((d) => ({ ...d, nationalId: value }))} />
            <LabelledInput label="Email" type="email" value={editDraft.email} onChange={(value) => setEditDraft((d) => ({ ...d, email: value }))} />
            <LabelledInput label="Phone" value={editDraft.phone} onChange={(value) => setEditDraft((d) => ({ ...d, phone: value }))} />
            <LabelledInput label="Date of Birth" type="date" value={editDraft.dateOfBirth} onChange={(value) => setEditDraft((d) => ({ ...d, dateOfBirth: value }))} />
            <LabelledInput label="Enrollment Date" type="date" value={editDraft.enrollmentDate} onChange={(value) => setEditDraft((d) => ({ ...d, enrollmentDate: value }))} />
            <LabelledInput label="Address" value={editDraft.address} onChange={(value) => setEditDraft((d) => ({ ...d, address: value }))} />
            <LabelledInput label="City" value={editDraft.city} onChange={(value) => setEditDraft((d) => ({ ...d, city: value }))} />
            <LabelledInput label="Country" value={editDraft.country} onChange={(value) => setEditDraft((d) => ({ ...d, country: value }))} />
            <LabelledInput label="Home Phone" value={editDraft.homePhone} onChange={(value) => setEditDraft((d) => ({ ...d, homePhone: value }))} />
            <LabelledInput label="Previous Qualification" value={editDraft.previousQualification} onChange={(value) => setEditDraft((d) => ({ ...d, previousQualification: value }))} />
            <LabelledInput label="Secondary School" value={editDraft.secondarySchoolName} onChange={(value) => setEditDraft((d) => ({ ...d, secondarySchoolName: value }))} />
            <LabelledInput label="Total High School Grades" value={editDraft.totalHighSchoolGrades} onChange={(value) => setEditDraft((d) => ({ ...d, totalHighSchoolGrades: value }))} />
            <LabelledInput label="High School Seat Number" value={editDraft.highSchoolSeatNumber} onChange={(value) => setEditDraft((d) => ({ ...d, highSchoolSeatNumber: value }))} />

            <SelectField
              label="Program"
              value={editDraft.programId}
              onValueChange={(value) => setEditDraft((d) => ({ ...d, programId: value, programLevelId: '' }))}
              options={programs.map((program) => ({ value: String(program.id), label: program.name }))}
            />
            <SelectField
              label="Program Level"
              value={editDraft.programLevelId}
              onValueChange={(value) => setEditDraft((d) => ({ ...d, programLevelId: value }))}
              options={selectedProgramLevelsForEdit.map((level) => ({ value: String(level.id), label: `Level ${level.level}` }))}
            />
            <SelectField
              label="Status"
              value={editDraft.status}
              onValueChange={(value) => setEditDraft((d) => ({ ...d, status: value as StudentStatus }))}
              options={statusOptions.map((status) => ({ value: status, label: status }))}
            />
            <SelectField
              label="Religion"
              value={editDraft.religion}
              onValueChange={(value) => setEditDraft((d) => ({ ...d, religion: value as 'M' | 'C' }))}
              options={[
                { value: 'M', label: 'Muslim (M)' },
                { value: 'C', label: 'Christian (C)' },
              ]}
            />
            <SelectField
              label="Gender"
              value={editDraft.gender}
              onValueChange={(value) => setEditDraft((d) => ({ ...d, gender: value as 'M' | 'F' }))}
              options={[
                { value: 'M', label: 'Male (M)' },
                { value: 'F', label: 'Female (F)' },
              ]}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={() => void handleUpdateStudent()} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportOpen} onOpenChange={(open) => (!open ? resetImportDialog() : setIsImportOpen(true))}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Import Students</DialogTitle>
            <DialogDescription>
              Upload an Excel file, monitor background processing, then fix failed rows directly and re-insert them.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={importTab} onValueChange={(value) => setImportTab(value as 'setup' | 'status' | 'recover')} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="status">Processing</TabsTrigger>
              <TabsTrigger value="recover">Recover Errors</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-sm text-slate-600">
                  Download the official template with all backend-required columns before filling data.
                </div>
                <Button variant="outline" onClick={downloadImportTemplate}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <SelectField
                  label="Program *"
                  value={importProgramId}
                  onValueChange={(value) => {
                    setImportProgramId(value);
                    setImportProgramLevelId('');
                  }}
                  options={programs.map((program) => ({ value: String(program.id), label: program.name }))}
                />
                <SelectField
                  label="Program Level *"
                  value={importProgramLevelId}
                  onValueChange={setImportProgramLevelId}
                  options={selectedProgramLevelsForImport.map((level) => ({
                    value: String(level.id),
                    label: `Level ${level.level}`,
                  }))}
                />
                <SelectField
                  label="Semester *"
                  value={importSemesterId}
                  onValueChange={setImportSemesterId}
                  options={semesters.map((semester) => ({
                    value: String(semester.id),
                    label: `${semester.type} ${semester.year}`,
                  }))}
                />
              </div>

              <div className="rounded-lg border border-dashed p-4">
                <Label htmlFor="import-file" className="mb-2 block text-sm text-slate-700">
                  Excel File (.xlsx)
                </Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".xlsx"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    void handleImportFileChange(file);
                  }}
                />
                {importFile ? (
                  <div className="mt-3 flex items-center gap-2 rounded bg-slate-50 p-2 text-sm text-slate-700">
                    <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                    {importFile.name}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Preview rows loaded: {importPreviewRows.length}</p>
                <Button onClick={() => void handleStartImport()} disabled={importing || !importFile || importStatus === 'Pending' || importStatus === 'Processing'}>
                  {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Start Import
                </Button>
              </div>

              {importPreviewRows.length > 0 ? (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>University ID</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importPreviewRows.slice(0, 8).map((row) => (
                        <TableRow key={row.rowNumber}>
                          <TableCell>{row.rowNumber}</TableCell>
                          <TableCell>{row.data.username || '-'}</TableCell>
                          <TableCell>{row.data.fullname || `${row.data.firstName || ''} ${row.data.lastName || ''}`.trim() || '-'}</TableCell>
                          <TableCell>{row.data.universityStudentId || '-'}</TableCell>
                          <TableCell>{row.data.email || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center gap-2">
                    {importStatus === 'Completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : importStatus === 'Failed' || importStatus === 'CompletedWithErrors' ? (
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    )}
                    <p className="text-sm text-slate-700">Job ID: {importJobId || '-'}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Status: {importStatus || 'Not started'}</Badge>
                    {importing ? <Badge variant="secondary">Polling backend...</Badge> : null}
                  </div>

                  <p className="text-sm text-slate-600">{importStatusMessage || 'Start import to track progress here.'}</p>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleRefreshImportStatus()}
                      disabled={!importJobId}
                    >
                      Refresh Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recover" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-600">Failed rows to recover: {importFailures.length}</p>
                <Button onClick={() => void retryFailedRows()} disabled={retryingFailedRows || importFailures.length === 0}>
                  {retryingFailedRows ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                  Retry Corrected Rows
                </Button>
              </div>

              {importFailures.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-slate-600">
                  No failed rows available. Once backend returns errors, they appear here for manual correction.
                </div>
              ) : (
                <div className="space-y-3">
                  {importFailures.map((row, rowIndex) => (
                    <Card key={`${row.row}-${rowIndex}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Row {row.row}</CardTitle>
                        <CardDescription>{row.reason}</CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                        {importEditableColumns.map((key) => (
                          <div key={key} className="space-y-1">
                            <Label className="text-xs text-slate-500">{key}</Label>
                            <Input
                              value={row.data[key] || ''}
                              onChange={(event) => handleFailureCellEdit(rowIndex, key, event.target.value)}
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <div className="mr-auto text-xs text-slate-500">
              {importing || importStatus === 'Pending' || importStatus === 'Processing'
                ? 'Closing keeps tracking in the background.'
                : 'Close and clear import session.'}
            </div>
            <Button variant="outline" onClick={resetImportDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LabelledInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
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
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label}`} />
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
