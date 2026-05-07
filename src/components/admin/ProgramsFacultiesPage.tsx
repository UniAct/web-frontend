import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  Modal,
  ModalContent as SharedModalContent,
  ModalDescription as SharedModalDescription,
  ModalHeader as SharedModalHeader,
  ModalTitle as SharedModalTitle,
} from '../ui/modal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { SearchableSelect } from '../ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Check, ChevronsUpDown, ChevronDown, ChevronRight, Edit, Loader2, Plus, RefreshCcw, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  apiClient,
  CourseService,
  FacultyService,
  ProgramService,
  UniversityService,
  UserService,
  type BlockReasonType,
  type Course,
  type CourseCreateInput,
  type CourseType,
  type Faculty,
  type FacultyCreateInput,
  type FeeType,
  type Program,
  type ProgramCreateInput,
  type ProgramFeeInput,
  type ProgramLevelInput,
  type ProgramType,
  type ResultDisplayType,
  type StaffDirectoryEntry,
} from '../../api';

interface ProgramsFacultiesPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (id: string | null) => void;
}

type TabValue = 'faculties' | 'programs' | 'courses';

interface FacultyFormState {
  name: string;
  description: string;
  deanId: string;
}

interface ProgramFeeDraft extends ProgramFeeInput {
  id?: number,
  key: string;
}

interface ProgramLevelDraft {
  id?: number,
  key: string;
  level: number;
  minCredits: number;
  maxCredits: number;
  fees: ProgramFeeDraft[];
}

interface ProgramTranscriptDefinitionDraft {
  id?: number,
  key: string;
  minScore: number;
  maxScore: number;
  minGPA: number;
  maxGPA: number;
  gradeLetter: string;
  equivalentEstimate?: string;
}

interface AcademicLoadSemesterDraft {
  id?: number
  key: string;
  level: number;
  semester: number;
  minCredits: number;
  maxCredits: number;
}

interface AcademicLoadGPADraft {
  id?: number,
  key: string;
  minGPA: number;
  maxGPA: number;
  minCredits: number;
  maxCredits: number;
}

interface ProgramFormState {
  name: string;
  facultyId: string;
  description: string;
  headId: string;
  phone: string;
  universityCreditHours: number;
  facultyCreditHours: number;
  programCreditHours: number;
  programType: ProgramType;
  resultDisplay: ResultDisplayType;
  blockReason: BlockReasonType;
  levelsNumber: number;
  levels: ProgramLevelDraft[];
  transcriptDefinition: ProgramTranscriptDefinitionDraft[];
  academicLoadSemester: AcademicLoadSemesterDraft[];
  academicLoadGPA: AcademicLoadGPADraft[];
}

interface CourseFormState {
  name: string;
  code: string;
  description: string;
  credits: number;
  syllabus: string;
  successPercentage: number;
  minFinalSuccessPercentage: number;
  totalFail: boolean;
  programId: string;
  programLevelId: string;
  courseType: CourseType;
}

const createKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const feeTypeOptions: FeeType[] = ['ConstantYear', 'ConstantSemester', 'PerCreditHour', 'PerCourse', 'Administrative', 'Other'];
const programTypeOptions: ProgramType[] = ['Bachelor', 'Master', 'Diploma', 'PhD'];
const resultDisplayOptions: ResultDisplayType[] = ['CourseGrade', 'DetailedEstimate'];
const blockReasonOptions: BlockReasonType[] = ['NonPaymentCurrent', 'NonPaymentOld'];
const courseTypeOptions: CourseType[] = ['Mandatory', 'Elective', 'Project'];

function newFee(): ProgramFeeDraft {
  return { key: createKey(), feeType: 'PerCreditHour', amount: 0, description: '' };
}

function newLevel(level: number): ProgramLevelDraft {
  return { key: createKey(), level, minCredits: 12, maxCredits: 18, fees: [newFee()] };
}

function newSemesterLoad(level: number, semester: number): AcademicLoadSemesterDraft {
  return {
    key: createKey(),
    level,
    semester,
    minCredits: semester === 3 ? 3 : 12,
    maxCredits: semester === 3 ? 9 : 18,
  };
}

function newGpaLoad(): AcademicLoadGPADraft {
  return { key: createKey(), minGPA: 0, maxGPA: 4, minCredits: 12, maxCredits: 18 };
}

function syncLevels(levelsNumber: number, current?: ProgramLevelDraft[]): ProgramLevelDraft[] {
  return Array.from({ length: levelsNumber }, (_, index) => {
    const level = index + 1;
    return current?.find((item) => item.level === level) ?? newLevel(level);
  });
}

function syncSemesterLoads(levelsNumber: number, current?: AcademicLoadSemesterDraft[]): AcademicLoadSemesterDraft[] {
  const next: AcademicLoadSemesterDraft[] = [];
  for (let level = 1; level <= levelsNumber; level += 1) {
    for (let semester = 1; semester <= 3; semester += 1) {
      next.push(current?.find((item) => item.level === level && item.semester === semester) ?? newSemesterLoad(level, semester));
    }
  }
  return next;
}

function createProgramForm(): ProgramFormState {
  return {
    name: '',
    facultyId: '',
    description: '',
    headId: '',
    phone: '',
    universityCreditHours: 0,
    facultyCreditHours: 0,
    programCreditHours: 0,
    programType: 'Bachelor',
    resultDisplay: 'CourseGrade',
    blockReason: 'NonPaymentCurrent',
    levelsNumber: 4,
    levels: syncLevels(4),
    transcriptDefinition: [],
    academicLoadSemester: syncSemesterLoads(4),
    academicLoadGPA: [newGpaLoad()],
  };
}

function createCourseForm(): CourseFormState {
  return {
    name: '',
    code: '',
    description: '',
    credits: 3,
    syllabus: '',
    successPercentage: 60,
    minFinalSuccessPercentage: 30,
    totalFail: false,
    programId: '',
    programLevelId: '',
    courseType: 'Mandatory',
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}...`;
}

function programToForm(program: Program): ProgramFormState {
  const levelsNumber = program.levelsNumber || Math.max(program.levels.length, 1);

  return {
    name: program.name,
    facultyId: String(program.facultyId),
    description: program.description ?? '',
    headId: program.headId ? String(program.headId) : '',
    phone: program.phone ?? '',
    universityCreditHours: program.universityCreditHours,
    facultyCreditHours: program.facultyCreditHours,
    programCreditHours: program.programCreditHours,
    programType: program.programType,
    resultDisplay: program.resultDisplay,
    blockReason: program.blockReason ?? 'NonPaymentCurrent',
    levelsNumber,
    levels: syncLevels(
      levelsNumber,
      program.levels.map((level) => ({
        id: level.id,
        key: `level-${level.id}`,
        level: level.level,
        minCredits: level.minCredits,
        maxCredits: level.maxCredits,
        fees: level.fees.map((fee) => ({
          id: fee.id,
          key: `fee-${fee.id}`,
          feeType: fee.feeType,
          semesterNumber: fee.semesterNumber ?? undefined,
          amount: fee.amount,
          description: fee.description ?? '',
        })),
      })),
    ),
    transcriptDefinition: program.transcriptDefinition.map((item) => ({
      id: item.id,
      key: `transcript-${item.id}`,
      minScore: item.minScore,
      maxScore: item.maxScore,
      minGPA: item.minGPA,
      maxGPA: item.maxGPA,
      gradeLetter: item.gradeLetter,
      equivalentEstimate: item.equivalentEstimate ?? '',
    })),
    academicLoadSemester: syncSemesterLoads(
      levelsNumber,
      program.academicLoadSemester.map((item) => ({
        id: item.id,
        key: `load-${item.id}`,
        level: item.level,
        semester: item.semester,
        minCredits: item.minCredits,
        maxCredits: item.maxCredits,
      })),
    ),
    academicLoadGPA: program.academicLoadGPA.length
      ? program.academicLoadGPA.map((item) => ({
        id: item.id,
        key: `gpa-${item.id}`,
        minGPA: item.minGPA,
        maxGPA: item.maxGPA,
        minCredits: item.minCredits,
        maxCredits: item.maxCredits,
      }))
      : [newGpaLoad()],
  };
}

function courseToForm(course: Course): CourseFormState {
  return {
    name: course.name,
    code: course.code,
    description: course.description ?? '',
    credits: course.credits,
    syllabus: course.syllabus ?? '',
    successPercentage: course.successPercentage ?? 60,
    minFinalSuccessPercentage: course.minFinalSuccessPercentage ?? 30,
    totalFail: course.totalFail ?? false,
    programId: String(course.programId),
    programLevelId: '',
    courseType: course.courseType,
  };
}

interface MultiSearchableSelectProps {
  values: number[];
  onValuesChange: (values: number[]) => void;
  options: { value: number; label: string; description?: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

function MultiSearchableSelect({
  values,
  onValuesChange,
  options,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No option found.',
  disabled = false,
}: MultiSearchableSelectProps) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? options.filter(
      (o) =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        (o.description ?? '').toLowerCase().includes(search.toLowerCase()),
    )
    : options;

  const toggleValue = (value: number) => {
    onValuesChange(
      values.includes(value) ? values.filter((v) => v !== value) : [...values, value],
    );
  };

  return (
    <div className={`rounded-md border bg-white ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
      <div className="border-b px-3 py-2">
        <div className="flex items-center gap-2 text-slate-400">
          <Search className="h-4 w-4 shrink-0" />
          <input
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="max-h-56 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-slate-400">{emptyMessage}</p>
        ) : (
          filtered.map((option) => {
            const checked = values.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3 border-b px-3 py-2.5 last:border-0 hover:bg-slate-50"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleValue(option.value)}
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug text-slate-900">{option.label}</p>
                  {option.description && (
                    <p className="mt-0.5 text-xs leading-snug text-slate-500">{option.description}</p>
                  )}
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

function buildProgramPayload(form: ProgramFormState): any {
  // Helper to map fees while preserving their database ID
  const mapFee = (fee: ProgramFeeDraft) => ({
    id: fee.id, // <--- Critical for non-destructive fee updates
    feeType: fee.feeType,
    semesterNumber: fee.semesterNumber,
    amount: fee.amount,
    description: fee.description?.trim() || undefined,
  });

  const levels = form.levels.map((level) => ({
    id: level.id, // <--- Critical for preserving level identity
    level: level.level,
    minCredits: level.minCredits,
    maxCredits: level.maxCredits,
    // Separate fees based on your existing logic, but now with IDs
    fees: level.fees
      .filter((fee) => !fee.semesterNumber)
      .map(mapFee),
    semesterFees: {
      semester1: level.fees
        .filter((fee) => fee.semesterNumber === 1)
        .map(mapFee),
      semester2: level.fees
        .filter((fee) => fee.semesterNumber === 2)
        .map(mapFee),
    },
    summerFees: level.fees
      .filter((fee) => fee.semesterNumber === 3)
      .map(mapFee),
  }));

  return {
    name: form.name.trim(),
    facultyId: Number(form.facultyId),
    description: form.description.trim() || undefined,
    headId: form.headId ? Number(form.headId) : undefined,
    phone: form.phone.trim() || undefined,
    universityCreditHours: form.universityCreditHours,
    facultyCreditHours: form.facultyCreditHours,
    programCreditHours: form.programCreditHours,
    programType: form.programType,
    resultDisplay: form.resultDisplay,
    blockReason: form.blockReason,
    levelsNumber: form.levelsNumber,
    levels,
    transcriptDefinition: form.transcriptDefinition.map((item) => ({
      id: item.id, // <--- Preserve ID
      minScore: item.minScore,
      maxScore: item.maxScore,
      minGPA: item.minGPA,
      maxGPA: item.maxGPA,
      gradeLetter: item.gradeLetter.trim(),
      equivalentEstimate: item.equivalentEstimate?.trim() || undefined,
    })),
    academicLoadSemester: form.academicLoadSemester.map((item) => ({
      id: item.id, // <--- Preserve ID
      level: item.level,
      semester: item.semester,
      minCredits: item.minCredits,
      maxCredits: item.maxCredits,
    })),
    academicLoadGPA: form.academicLoadGPA.map((item) => ({
      id: item.id, // <--- Preserve ID
      minGPA: item.minGPA,
      maxGPA: item.maxGPA,
      minCredits: item.minCredits,
      maxCredits: item.maxCredits,
    })),
  };
}

export function ProgramsFacultiesPage({ selectedUniversity }: ProgramsFacultiesPageProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('faculties');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [staff, setStaff] = useState<StaffDirectoryEntry[]>([]);
  const [expandedPrograms, setExpandedPrograms] = useState<Set<number>>(new Set());
  const [tabAccess, setTabAccess] = useState({ faculties: true, programs: true, courses: true });

  const [facultyDialogOpen, setFacultyDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [facultyForm, setFacultyForm] = useState<FacultyFormState>({ name: '', description: '', deanId: '' });

  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programForm, setProgramForm] = useState<ProgramFormState>(createProgramForm);

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState<CourseFormState>(createCourseForm);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState<number[]>([]);
  const [resolvedUniversityId, setResolvedUniversityId] = useState<string | null>(selectedUniversity);

  const syncTenantOverride = async () => {
    const tenantContext = apiClient.getTenantContext();

    if (!tenantContext.isSuperAdmin && tenantContext.subdomain) {
      const profile = await UniversityService.getPublicTenantProfile(tenantContext.subdomain);
      apiClient.setTenantOverrideName(profile.name);
      setResolvedUniversityId(String(profile.id));
      return;
    }

    if (!selectedUniversity) {
      apiClient.clearTenantOverrideName();
      setResolvedUniversityId(null);
      return;
    }

    const university = await UniversityService.getById(Number(selectedUniversity));
    apiClient.setTenantOverrideName(university.name);
    setResolvedUniversityId(String(university.id));
  };

  const isAccessDeniedError = (error: unknown) => {
    const message = getErrorMessage(error, '').toLowerCase();
    return (
      message.includes('access denied') ||
      message.includes('forbidden') ||
      message.includes('not authorized')
    );
  };

  const loadAcademicDataByPermission = async () => {
    await syncTenantOverride();

    const [nextFaculties, nextPrograms, nextCourses, nextStaff] = await Promise.allSettled([
      FacultyService.getAll(),
      ProgramService.getAll(),
      CourseService.getAll(),
      UserService.getStaffDirectory(),
    ]);

    if (nextFaculties.status === 'fulfilled') {
      setFaculties(nextFaculties.value);
      setTabAccess((current) => ({ ...current, faculties: true }));
    } else if (isAccessDeniedError(nextFaculties.reason)) {
      setFaculties([]);
      setTabAccess((current) => ({ ...current, faculties: false }));
    } else {
      toast.error(getErrorMessage(nextFaculties.reason, 'Failed to load faculties'));
    }

    if (nextPrograms.status === 'fulfilled') {
      setPrograms(nextPrograms.value);
      setTabAccess((current) => ({ ...current, programs: true }));
    } else if (isAccessDeniedError(nextPrograms.reason)) {
      setPrograms([]);
      setTabAccess((current) => ({ ...current, programs: false }));
    } else {
      toast.error(getErrorMessage(nextPrograms.reason, 'Failed to load programs'));
    }

    if (nextCourses.status === 'fulfilled') {
      setCourses(nextCourses.value);
      setTabAccess((current) => ({ ...current, courses: true }));
    } else if (isAccessDeniedError(nextCourses.reason)) {
      setCourses([]);
      setTabAccess((current) => ({ ...current, courses: false }));
    } else {
      toast.error(getErrorMessage(nextCourses.reason, 'Failed to load courses'));
    }

    if (nextStaff.status === 'fulfilled') {
      setStaff(nextStaff.value);
    } else if (!isAccessDeniedError(nextStaff.reason)) {
      toast.error(getErrorMessage(nextStaff.reason, 'Failed to load staff directory'));
    }
  };

  useEffect(() => {
    if (!selectedUniversity) {
      apiClient.clearTenantOverrideName();
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        await loadAcademicDataByPermission();
      } catch {
        toast.error('Failed to load academic data');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [selectedUniversity]);

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadAcademicDataByPermission();
    } catch {
      toast.error('Failed to refresh academic data');
    } finally {
      setRefreshing(false);
    }
  };

  const staffOptions = useMemo(
    () =>
      staff.map((item) => ({
        value: String(item.userId),
        label: item.name,
        description: `${item.position} - ${item.email}`,
      })),
    [staff],
  );

  const facultyOptions = useMemo(
    () => faculties.map((item) => ({ value: String(item.id), label: item.name })),
    [faculties],
  );

  const programOptions = useMemo(
    () => programs.map((item) => ({ value: String(item.id), label: item.name })),
    [programs],
  );

  const selectedProgram = useMemo(
    () => programs.find((item) => String(item.id) === courseForm.programId),
    [courseForm.programId, programs],
  );

  const programLevelOptions = useMemo(
    () =>
      (selectedProgram?.levels ?? []).map((level) => ({
        value: level.id,
        label: `Level ${level.level}`,
        description: `${level.minCredits}-${level.maxCredits} credits`,
      })),
    [selectedProgram],
  );

  const facultyNameById = useMemo(
    () => new Map(faculties.map((item) => [item.id, item.name])),
    [faculties],
  );

  const staffNameById = useMemo(
    () => new Map(staff.map((item) => [item.userId, item.name])),
    [staff],
  );

  const filteredFaculties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q ? faculties.filter((item) => item.name.toLowerCase().includes(q)) : faculties;
  }, [faculties, searchQuery]);

  const filteredPrograms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q ? programs.filter((item) => item.name.toLowerCase().includes(q)) : programs;
  }, [programs, searchQuery]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? courses.filter((item) => item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q))
      : courses;
  }, [courses, searchQuery]);

  const prerequisiteCandidates = useMemo(() => {
    if (!courseForm.programId) return [];
    return courses.filter(
      (item) => item.programId === Number(courseForm.programId) && item.id !== editingCourse?.id,
    );
  }, [courseForm.programId, courses, editingCourse]);

  useEffect(() => {
    if (programLevelOptions.length === 0) {
      if (courseForm.programLevelId) {
        setCourseForm((current) => ({ ...current, programLevelId: '' }));
      }
      return;
    }

    const selectedLevelExists = programLevelOptions.some(
      (option) => option.value === Number(courseForm.programLevelId),
    );

    if (!selectedLevelExists) {
      setCourseForm((current) => ({ ...current, programLevelId: String(programLevelOptions[0].value) }));
    }
  }, [courseForm.programLevelId, programLevelOptions]);

  const resetFacultyDialog = () => {
    setEditingFaculty(null);
    setFacultyForm({ name: '', description: '', deanId: '' });
  };

  const resetProgramDialog = () => {
    setEditingProgram(null);
    setProgramForm(createProgramForm());
  };

  const resetCourseDialog = () => {
    setEditingCourse(null);
    setCourseForm(createCourseForm());
    setSelectedPrerequisites([]);
  };

  const saveFaculty = async () => {
    const universityId = resolvedUniversityId ?? selectedUniversity;

    if (!universityId) {
      toast.error('Please select a university first');
      return;
    }

    if (!facultyForm.name.trim()) {
      toast.error('Faculty name is required');
      return;
    }

    const payload: FacultyCreateInput = {
      universityId: Number(universityId),
      name: facultyForm.name.trim(),
      description: facultyForm.description.trim() || undefined,
      deanId: facultyForm.deanId ? Number(facultyForm.deanId) : undefined,
    };

    try {
      setSubmitting(true);
      if (editingFaculty) {
        await FacultyService.update(editingFaculty.id, payload);
        toast.success('Faculty updated successfully');
      } else {
        await FacultyService.create(payload);
        toast.success('Faculty created successfully');
      }
      setFacultyDialogOpen(false);
      resetFacultyDialog();
      await refreshData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save faculty'));
    } finally {
      setSubmitting(false);
    }
  };

  const saveProgram = async () => {
    if (!programForm.name.trim()) {
      toast.error('Program name is required');
      return;
    }

    if (!programForm.facultyId) {
      toast.error('Faculty is required');
      return;
    }

    if (programForm.transcriptDefinition.some((item) => !item.gradeLetter.trim())) {
      toast.error('Every transcript definition needs a grade letter');
      return;
    }

    try {
      setSubmitting(true);
      const payload = buildProgramPayload(programForm);
      if (editingProgram) {
        await ProgramService.update(editingProgram.id, payload);
        toast.success('Program updated successfully');
      } else {
        await ProgramService.create(payload);
        toast.success('Program created successfully');
      }
      setProgramDialogOpen(false);
      resetProgramDialog();
      await refreshData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save program'));
    } finally {
      setSubmitting(false);
    }
  };

  const saveCourse = async () => {
    if (!courseForm.name.trim() || !courseForm.code.trim()) {
      toast.error('Course name and code are required');
      return;
    }

    if (!courseForm.programId) {
      toast.error('Program is required');
      return;
    }

    if (!courseForm.programLevelId) {
      toast.error('Program level is required');
      return;
    }

    const payload: CourseCreateInput = {
      name: courseForm.name.trim(),
      code: courseForm.code.trim(),
      description: courseForm.description.trim() || undefined,
      credits: courseForm.credits,
      syllabus: courseForm.syllabus.trim() || undefined,
      successPercentage: courseForm.successPercentage,
      minFinalSuccessPercentage: courseForm.minFinalSuccessPercentage,
      totalFail: courseForm.totalFail,
      programId: Number(courseForm.programId),
      programLevelId: Number(courseForm.programLevelId),
      courseType: courseForm.courseType,
      prerequisiteIds: selectedPrerequisites,
    };

    try {
      setSubmitting(true);
      if (editingCourse) {
        await CourseService.update(editingCourse.id, payload);
        toast.success('Course updated successfully');
      } else {
        await CourseService.create(payload);
        toast.success('Course created successfully');
      }
      setCourseDialogOpen(false);
      resetCourseDialog();
      await refreshData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save course'));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteFaculty = async (faculty: Faculty) => {
    if (!window.confirm(`Delete faculty "${faculty.name}"?`)) return;
    try {
      setSubmitting(true);
      await FacultyService.delete(faculty.id);
      toast.success('Faculty deleted successfully');
      await refreshData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete faculty'));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProgram = async (program: Program) => {
    if (!window.confirm(`Delete program "${program.name}"?`)) return;
    try {
      setSubmitting(true);
      await ProgramService.delete(program.id);
      toast.success('Program deleted successfully');
      await refreshData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete program'));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCourse = async (course: Course) => {
    if (!window.confirm(`Delete course "${course.code} - ${course.name}"?`)) return;
    try {
      setSubmitting(true);
      await CourseService.delete(course.id);
      toast.success('Course deleted successfully');
      await refreshData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete course'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedUniversity) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-600">
          Please select a university first.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Academic Structure</h2>
          <p className="text-sm text-slate-600">
            Manage faculties, programs, course catalogs, fee structures, transcript definitions, and academic load rules.
          </p>
        </div>
        <Button variant="outline" onClick={() => void refreshData()} disabled={loading || refreshing}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Faculties</CardDescription>
            <CardTitle className="text-3xl">{faculties.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Tenant faculties configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Programs</CardDescription>
            <CardTitle className="text-3xl">{programs.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Programs linked to faculties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Courses</CardDescription>
            <CardTitle className="text-3xl">{courses.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Courses configured across programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Staff Options</CardDescription>
            <CardTitle className="text-3xl">{staff.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Available deans and heads</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="faculties">Faculties</TabsTrigger>
            <TabsTrigger value="programs">Programs & Levels</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search..." />
            </div>
            {activeTab === 'faculties' && <Button onClick={() => { resetFacultyDialog(); setFacultyDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add Faculty</Button>}
            {activeTab === 'programs' && <Button onClick={() => { resetProgramDialog(); setProgramDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add Program</Button>}
            {activeTab === 'courses' && <Button onClick={() => { resetCourseDialog(); setCourseDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add Course</Button>}
          </div>
        </div>

        <TabsContent value="faculties" className="space-y-4">
          {!tabAccess.faculties ? <Card><CardContent className="py-10 text-center text-slate-500">Access denied for faculties.</CardContent></Card> : loading ? <Card><CardContent className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></CardContent></Card> : (
            filteredFaculties.length === 0 ? <Card><CardContent className="py-10 text-center text-slate-500">No faculties found.</CardContent></Card> : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredFaculties.map((faculty) => (
                  <Card key={faculty.id}>
                    <CardHeader className="pb-3">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <div className="min-w-0">
                          <CardTitle className="truncate">{faculty.name}</CardTitle>
                          <CardDescription className="max-w-full">{faculty.description || 'No description provided'}</CardDescription>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingFaculty(faculty); setFacultyForm({ name: faculty.name, description: faculty.description ?? '', deanId: faculty.deanId ? String(faculty.deanId) : '' }); setFacultyDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => void deleteFaculty(faculty)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center justify-between"><span className="text-slate-600">Dean</span><span>{faculty.deanId ? staffNameById.get(faculty.deanId) || 'Not found' : 'Not assigned'}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-600">Programs</span><Badge variant="outline">{programs.filter((item) => item.facultyId === faculty.id).length}</Badge></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          {!tabAccess.programs ? <Card><CardContent className="py-10 text-center text-slate-500">Access denied for programs.</CardContent></Card> : loading ? <Card><CardContent className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></CardContent></Card> : (
            filteredPrograms.length === 0 ? <Card><CardContent className="py-10 text-center text-slate-500">No programs found.</CardContent></Card> : (
              filteredPrograms.map((program) => (
                <Card key={program.id}>
                  <CardHeader>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <CardTitle>{program.name}</CardTitle>
                        <CardDescription>{facultyNameById.get(program.facultyId) || 'Unknown faculty'} / Head: {program.headId ? staffNameById.get(program.headId) || 'Not found' : 'Not assigned'}</CardDescription>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{program.programType}</Badge>
                          <Badge variant="outline">{program.resultDisplay}</Badge>
                          <Badge variant="secondary">{program.levelsNumber} levels</Badge>
                          <Badge variant="secondary">{program.programCreditHours} credits</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingProgram(program); setProgramForm(programToForm(program)); setProgramDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => void deleteProgram(program)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">{program.description || 'No description provided.'}</p>
                    <div className="grid gap-3 md:grid-cols-4">{program.levels.map((level) => <div key={level.id} className="rounded-lg border p-3 text-sm"><div className="font-medium">Level {level.level}</div><div className="text-slate-500">{level.minCredits}-{level.maxCredits} credits</div><div className="text-slate-500">{level.fees.length} fee rule(s)</div></div>)}</div>
                  </CardContent>
                </Card>
              ))
            )
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          {!tabAccess.courses ? <Card><CardContent className="py-10 text-center text-slate-500">Access denied for courses.</CardContent></Card> : loading ? <Card><CardContent className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></CardContent></Card> : (
            filteredPrograms.length === 0 ? <Card><CardContent className="py-10 text-center text-slate-500">No programs found.</CardContent></Card> : filteredPrograms.map((program) => {
              const open = expandedPrograms.has(program.id);
              const programCourses = filteredCourses.filter((item) => item.programId === program.id);
              return (

                <Card key={program.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Button size="sm" variant="ghost" onClick={() => setExpandedPrograms((current) => { const next = new Set(current); next.has(program.id) ? next.delete(program.id) : next.add(program.id); return next; })}>{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</Button>
                        <div><CardTitle>{program.name}</CardTitle><CardDescription>{programCourses.length} course(s)</CardDescription></div>
                      </div>
                      <Badge variant="outline">{program.programType}</Badge>
                    </div>
                  </CardHeader>
                  {open && <CardContent>{programCourses.length === 0 ? <div className="rounded-lg border border-dashed p-6 text-center text-slate-500">No courses added yet.</div> : <div className="grid gap-4 md:grid-cols-2">{programCourses.map((course) => <div key={course.id} className="rounded-lg border p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-semibold">{course.code}</div><div className="text-sm text-slate-600">{course.name}</div></div><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => { setEditingCourse(course); setCourseForm(courseToForm(course)); setSelectedPrerequisites(course.prerequisites.map((item) => item.prerequisiteId)); setCourseDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => void deleteCourse(course)}><Trash2 className="h-4 w-4" /></Button></div></div><div className="mt-3 flex flex-wrap gap-2"><Badge variant="outline">{course.credits} credits</Badge><Badge variant="secondary">{course.courseType}</Badge>{course.prerequisites.length > 0 && <Badge variant="outline">{course.prerequisites.length} prerequisite(s)</Badge>}</div><p className="mt-3 text-sm text-slate-600">{course.description || 'No description provided.'}</p></div>)}</div>}</CardContent>}
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={facultyDialogOpen} onOpenChange={(open) => { setFacultyDialogOpen(open); if (!open) resetFacultyDialog(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFaculty ? 'Edit Faculty' : 'Add Faculty'}</DialogTitle>
            <DialogDescription>Create or update a faculty and assign its dean.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Faculty Name</Label><Input value={facultyForm.name} onChange={(event) => setFacultyForm((current) => ({ ...current, name: event.target.value }))} /></div>
            <div><Label>Dean</Label><SearchableSelect value={facultyForm.deanId} onValueChange={(value) => setFacultyForm((current) => ({ ...current, deanId: value }))} options={staffOptions} placeholder="Select dean" searchPlaceholder="Search staff..." emptyMessage="No staff found" /></div>
            <div><Label>Description</Label><Textarea rows={4} value={facultyForm.description} onChange={(event) => setFacultyForm((current) => ({ ...current, description: event.target.value }))} /></div>
            <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => { setFacultyDialogOpen(false); resetFacultyDialog(); }}>Cancel</Button><Button disabled={submitting} onClick={() => void saveFaculty()}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingFaculty ? 'Update Faculty' : 'Create Faculty'}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Modal open={programDialogOpen} onOpenChange={(open) => { setProgramDialogOpen(open); if (!open) resetProgramDialog(); }} maxWidth="max-w-7xl">
        <SharedModalContent className="w-[95vw] max-h-[90vh] overflow-y-auto">
          <SharedModalHeader>
            <SharedModalTitle>{editingProgram ? 'Edit Program' : 'Add Program'}</SharedModalTitle>
            <SharedModalDescription>Full backend-supported program setup: levels, fees, transcript, and academic load.</SharedModalDescription>
          </SharedModalHeader>
          <div className="space-y-8">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
              <div className="xl:col-span-2"><Label>Program Name</Label><Input value={programForm.name} onChange={(event) => setProgramForm((current) => ({ ...current, name: event.target.value }))} /></div>
              <div><Label>Faculty</Label><SearchableSelect value={programForm.facultyId} onValueChange={(value) => setProgramForm((current) => ({ ...current, facultyId: value }))} options={facultyOptions} placeholder="Select faculty" searchPlaceholder="Search faculties..." emptyMessage="No faculties found" /></div>
              <div><Label>Program Head</Label><SearchableSelect value={programForm.headId} onValueChange={(value) => setProgramForm((current) => ({ ...current, headId: value }))} options={staffOptions} placeholder="Select head" searchPlaceholder="Search staff..." emptyMessage="No staff found" /></div>
              <div><Label>Phone</Label><Input value={programForm.phone} onChange={(event) => setProgramForm((current) => ({ ...current, phone: event.target.value }))} /></div>
              <div><Label>Program Type</Label><Select value={programForm.programType} onValueChange={(value) => setProgramForm((current) => ({ ...current, programType: value as ProgramType }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{programTypeOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Result Display</Label><Select value={programForm.resultDisplay} onValueChange={(value) => setProgramForm((current) => ({ ...current, resultDisplay: value as ResultDisplayType }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{resultDisplayOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Block Reason</Label><Select value={programForm.blockReason} onValueChange={(value) => setProgramForm((current) => ({ ...current, blockReason: value as BlockReasonType }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{blockReasonOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Levels Number</Label><Input type="number" min="1" max="8" value={programForm.levelsNumber} onChange={(event) => { const levelsNumber = Math.max(1, Number(event.target.value) || 1); setProgramForm((current) => ({ ...current, levelsNumber, levels: syncLevels(levelsNumber, current.levels), academicLoadSemester: syncSemesterLoads(levelsNumber, current.academicLoadSemester) })); }} /></div>
              <div><Label>University Credit Hours</Label><Input type="number" min="0" value={programForm.universityCreditHours} onChange={(event) => setProgramForm((current) => ({ ...current, universityCreditHours: Number(event.target.value) || 0 }))} /></div>
              <div><Label>Faculty Credit Hours</Label><Input type="number" min="0" value={programForm.facultyCreditHours} onChange={(event) => setProgramForm((current) => ({ ...current, facultyCreditHours: Number(event.target.value) || 0 }))} /></div>
              <div><Label>Program Credit Hours</Label><Input type="number" min="0" value={programForm.programCreditHours} onChange={(event) => setProgramForm((current) => ({ ...current, programCreditHours: Number(event.target.value) || 0 }))} /></div>
              <div className="md:col-span-2 xl:col-span-2"><Label>Description</Label><Textarea rows={4} value={programForm.description} onChange={(event) => setProgramForm((current) => ({ ...current, description: event.target.value }))} /></div>
            </div>

            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Levels and Fees</h3>
                <p className="text-sm text-slate-500">Each fee can be general or tied to semester 1, semester 2, or summer.</p>
              </div>
              {programForm.levels.map((level, levelIndex) => (
                <Card key={level.key}>
                  <CardHeader>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <CardTitle>Level {level.level}</CardTitle>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input type="number" min="0" value={level.minCredits} onChange={(event) => setProgramForm((current) => { const levels = [...current.levels]; levels[levelIndex] = { ...levels[levelIndex], minCredits: Number(event.target.value) || 0 }; return { ...current, levels }; })} />
                        <Input type="number" min="0" value={level.maxCredits} onChange={(event) => setProgramForm((current) => { const levels = [...current.levels]; levels[levelIndex] = { ...levels[levelIndex], maxCredits: Number(event.target.value) || 0 }; return { ...current, levels }; })} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-end"><Button size="sm" variant="outline" onClick={() => setProgramForm((current) => { const levels = [...current.levels]; levels[levelIndex] = { ...levels[levelIndex], fees: [...levels[levelIndex].fees, newFee()] }; return { ...current, levels }; })}><Plus className="mr-2 h-4 w-4" />Add Fee</Button></div>
                    {level.fees.map((fee) => (
                      <div key={fee.key} className="grid gap-3 rounded-lg border p-3 md:grid-cols-12">
                        <div className="md:col-span-3"><Label>Type</Label><Select value={fee.feeType} onValueChange={(value) => setProgramForm((current) => ({ ...current, levels: current.levels.map((item, index) => index === levelIndex ? { ...item, fees: item.fees.map((entry) => entry.key === fee.key ? { ...entry, feeType: value as FeeType } : entry) } : item) }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{feeTypeOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
                        <div className="md:col-span-3"><Label>Applies To</Label><Select value={String(fee.semesterNumber ?? 0)} onValueChange={(value) => setProgramForm((current) => ({ ...current, levels: current.levels.map((item, index) => index === levelIndex ? { ...item, fees: item.fees.map((entry) => entry.key === fee.key ? { ...entry, semesterNumber: value === '0' ? undefined : Number(value) } : entry) } : item) }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">General</SelectItem><SelectItem value="1">Semester 1</SelectItem><SelectItem value="2">Semester 2</SelectItem><SelectItem value="3">Summer</SelectItem></SelectContent></Select></div>
                        <div className="md:col-span-2"><Label>Amount</Label><Input type="number" min="0" value={fee.amount} onChange={(event) => setProgramForm((current) => ({ ...current, levels: current.levels.map((item, index) => index === levelIndex ? { ...item, fees: item.fees.map((entry) => entry.key === fee.key ? { ...entry, amount: Number(event.target.value) || 0 } : entry) } : item) }))} /></div>
                        <div className="md:col-span-3"><Label>Description</Label><Input value={fee.description ?? ''} onChange={(event) => setProgramForm((current) => ({ ...current, levels: current.levels.map((item, index) => index === levelIndex ? { ...item, fees: item.fees.map((entry) => entry.key === fee.key ? { ...entry, description: event.target.value } : entry) } : item) }))} /></div>
                        <div className="md:col-span-1 md:self-end"><Button size="sm" variant="ghost" className="w-full text-red-600 hover:text-red-700" onClick={() => setProgramForm((current) => ({ ...current, levels: current.levels.map((item, index) => index === levelIndex ? { ...item, fees: item.fees.filter((entry) => entry.key !== fee.key) } : item) }))}><X className="h-4 w-4" /></Button></div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Transcript Definition</h3>
                  <p className="text-sm text-slate-500">Score ranges and GPA equivalents used on transcripts.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setProgramForm((current) => ({ ...current, transcriptDefinition: [...current.transcriptDefinition, { key: createKey(), minScore: 0, maxScore: 100, minGPA: 0, maxGPA: 4, gradeLetter: '', equivalentEstimate: '' }] }))}><Plus className="mr-2 h-4 w-4" />Add Definition</Button>
              </div>
              {programForm.transcriptDefinition.length === 0 ? <div className="rounded-lg border border-dashed p-6 text-center text-slate-500">No transcript definitions yet.</div> : programForm.transcriptDefinition.map((item) => (
                <Card key={item.key}><CardContent className="grid gap-3 p-4 md:grid-cols-6"><Input type="number" value={item.minScore} onChange={(event) => setProgramForm((current) => ({ ...current, transcriptDefinition: current.transcriptDefinition.map((entry) => entry.key === item.key ? { ...entry, minScore: Number(event.target.value) || 0 } : entry) }))} /><Input type="number" value={item.maxScore} onChange={(event) => setProgramForm((current) => ({ ...current, transcriptDefinition: current.transcriptDefinition.map((entry) => entry.key === item.key ? { ...entry, maxScore: Number(event.target.value) || 0 } : entry) }))} /><Input type="number" step="0.01" value={item.minGPA} onChange={(event) => setProgramForm((current) => ({ ...current, transcriptDefinition: current.transcriptDefinition.map((entry) => entry.key === item.key ? { ...entry, minGPA: Number(event.target.value) || 0 } : entry) }))} /><Input type="number" step="0.01" value={item.maxGPA} onChange={(event) => setProgramForm((current) => ({ ...current, transcriptDefinition: current.transcriptDefinition.map((entry) => entry.key === item.key ? { ...entry, maxGPA: Number(event.target.value) || 0 } : entry) }))} /><Input value={item.gradeLetter} onChange={(event) => setProgramForm((current) => ({ ...current, transcriptDefinition: current.transcriptDefinition.map((entry) => entry.key === item.key ? { ...entry, gradeLetter: event.target.value } : entry) }))} placeholder="Grade" /><div className="flex gap-2"><Input value={item.equivalentEstimate ?? ''} onChange={(event) => setProgramForm((current) => ({ ...current, transcriptDefinition: current.transcriptDefinition.map((entry) => entry.key === item.key ? { ...entry, equivalentEstimate: event.target.value } : entry) }))} placeholder="Estimate" /><Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => setProgramForm((current) => ({ ...current, transcriptDefinition: current.transcriptDefinition.filter((entry) => entry.key !== item.key) }))}><X className="h-4 w-4" /></Button></div></CardContent></Card>
              ))}
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Academic Load by Semester</h3>
                <p className="text-sm text-slate-500">Semester 3 is summer.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">{programForm.academicLoadSemester.map((item) => <Card key={item.key}><CardContent className="space-y-3 p-4"><div className="flex items-center justify-between"><span className="font-medium">Level {item.level} / Semester {item.semester}</span>{item.semester === 3 && <Badge variant="secondary">Summer</Badge>}</div><div className="grid grid-cols-2 gap-3"><Input type="number" min="0" value={item.minCredits} onChange={(event) => setProgramForm((current) => ({ ...current, academicLoadSemester: current.academicLoadSemester.map((entry) => entry.key === item.key ? { ...entry, minCredits: Number(event.target.value) || 0 } : entry) }))} /><Input type="number" min="0" value={item.maxCredits} onChange={(event) => setProgramForm((current) => ({ ...current, academicLoadSemester: current.academicLoadSemester.map((entry) => entry.key === item.key ? { ...entry, maxCredits: Number(event.target.value) || 0 } : entry) }))} /></div></CardContent></Card>)}</div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4"><div><h3 className="text-lg font-semibold">Academic Load by GPA</h3><p className="text-sm text-slate-500">Define minimum and maximum credit loads per GPA band.</p></div><Button size="sm" variant="outline" onClick={() => setProgramForm((current) => ({ ...current, academicLoadGPA: [...current.academicLoadGPA, newGpaLoad()] }))}><Plus className="mr-2 h-4 w-4" />Add GPA Range</Button></div>
              {programForm.academicLoadGPA.map((item) => <Card key={item.key}><CardContent className="grid gap-3 p-4 md:grid-cols-5"><Input type="number" step="0.01" value={item.minGPA} onChange={(event) => setProgramForm((current) => ({ ...current, academicLoadGPA: current.academicLoadGPA.map((entry) => entry.key === item.key ? { ...entry, minGPA: Number(event.target.value) || 0 } : entry) }))} /><Input type="number" step="0.01" value={item.maxGPA} onChange={(event) => setProgramForm((current) => ({ ...current, academicLoadGPA: current.academicLoadGPA.map((entry) => entry.key === item.key ? { ...entry, maxGPA: Number(event.target.value) || 0 } : entry) }))} /><Input type="number" min="0" value={item.minCredits} onChange={(event) => setProgramForm((current) => ({ ...current, academicLoadGPA: current.academicLoadGPA.map((entry) => entry.key === item.key ? { ...entry, minCredits: Number(event.target.value) || 0 } : entry) }))} /><Input type="number" min="0" value={item.maxCredits} onChange={(event) => setProgramForm((current) => ({ ...current, academicLoadGPA: current.academicLoadGPA.map((entry) => entry.key === item.key ? { ...entry, maxCredits: Number(event.target.value) || 0 } : entry) }))} /><Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => setProgramForm((current) => ({ ...current, academicLoadGPA: current.academicLoadGPA.filter((entry) => entry.key !== item.key) }))}><Trash2 className="h-4 w-4" /></Button></CardContent></Card>)}
            </section>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button variant="outline" onClick={() => { setProgramDialogOpen(false); resetProgramDialog(); }}>Cancel</Button>
              <Button disabled={submitting} onClick={() => void saveProgram()}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingProgram ? 'Update Program' : 'Create Program'}</Button>
            </div>
          </div>
        </SharedModalContent>
      </Modal>

      <Dialog open={courseDialogOpen} onOpenChange={(open) => { setCourseDialogOpen(open); if (!open) resetCourseDialog(); }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Add Course'}</DialogTitle>
            <DialogDescription>Create or update a course and its prerequisites.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Course Name</Label><Input value={courseForm.name} onChange={(event) => setCourseForm((current) => ({ ...current, name: event.target.value }))} /></div>
              <div><Label>Course Code</Label><Input value={courseForm.code} onChange={(event) => setCourseForm((current) => ({ ...current, code: event.target.value }))} /></div>
              <div><Label>Program</Label><SearchableSelect value={courseForm.programId} onValueChange={(value) => { setCourseForm((current) => ({ ...current, programId: value, programLevelId: '' })); setSelectedPrerequisites([]); }} options={programOptions} placeholder="Select program" searchPlaceholder="Search programs..." emptyMessage="No programs found" /></div>
              <div><Label>Program Level</Label><SearchableSelect value={courseForm.programLevelId} onValueChange={(value) => setCourseForm((current) => ({ ...current, programLevelId: value }))} options={programLevelOptions.map((item) => ({ value: String(item.value), label: item.label, description: item.description }))} placeholder="Select program level" searchPlaceholder="Search levels..." emptyMessage="No levels found" disabled={!courseForm.programId || programLevelOptions.length === 0} /></div>
              <div><Label>Course Type</Label><Select value={courseForm.courseType} onValueChange={(value) => setCourseForm((current) => ({ ...current, courseType: value as CourseType }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courseTypeOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Credits</Label><Input type="number" min="1" value={courseForm.credits} onChange={(event) => setCourseForm((current) => ({ ...current, credits: Number(event.target.value) || 1 }))} /></div>
              <div><Label>Success Percentage</Label><Input type="number" min="0" max="100" value={courseForm.successPercentage} onChange={(event) => setCourseForm((current) => ({ ...current, successPercentage: Number(event.target.value) || 0 }))} /></div>
              <div><Label>Min Final Success Percentage</Label><Input type="number" min="0" max="100" value={courseForm.minFinalSuccessPercentage} onChange={(event) => setCourseForm((current) => ({ ...current, minFinalSuccessPercentage: Number(event.target.value) || 0 }))} /></div>
              <div className="flex items-end"><label className="flex items-center gap-3 rounded-md border px-3 py-2"><Checkbox checked={courseForm.totalFail} onCheckedChange={(checked) => setCourseForm((current) => ({ ...current, totalFail: checked === true }))} /><span className="text-sm">Total fail course</span></label></div>
            </div>
            <div><Label>Description</Label><Textarea rows={3} value={courseForm.description} onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))} /></div>
            <div><Label>Syllabus</Label><Textarea rows={4} value={courseForm.syllabus} onChange={(event) => setCourseForm((current) => ({ ...current, syllabus: event.target.value }))} /></div>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">Prerequisites</h3>
                <p className="text-sm text-slate-500">Choose one or more prerequisite courses from the same program.</p>
              </div>
              <MultiSearchableSelect
                values={selectedPrerequisites}
                onValuesChange={setSelectedPrerequisites}
                options={prerequisiteCandidates.map((course) => ({
                  value: course.id,
                  label: `${course.code} - ${course.name}`,
                  description: course.description || 'No description provided',
                }))}
                placeholder="Select prerequisite courses"
                searchPlaceholder="Search prerequisites..."
                emptyMessage="No prerequisite candidates available."
                disabled={prerequisiteCandidates.length === 0}
              />
              {selectedPrerequisites.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedPrerequisites.map((courseId) => {
                    const selectedCourse = prerequisiteCandidates.find((course) => course.id === courseId);
                    return selectedCourse ? (
                      <Badge key={courseId} variant="secondary">
                        {selectedCourse.code}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t pt-4"><Button variant="outline" onClick={() => { setCourseDialogOpen(false); resetCourseDialog(); }}>Cancel</Button><Button disabled={submitting} onClick={() => void saveCourse()}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingCourse ? 'Update Course' : 'Create Course'}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
