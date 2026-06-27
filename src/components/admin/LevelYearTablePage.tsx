import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { SearchableSelect } from '../ui/searchable-select';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import {
  Database,
  Calendar,
  Building,
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  ArrowRight,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Loader2,
  RefreshCw,
  GraduationCap,
  Filter,
  BarChart3,
  Eye,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ProgramService,
  SemesterService,
  StudentService,
  TranscriptService,
  type Program as BackendProgram,
  type Semester,
  type StudentRecord,
  type StudentTranscripts,
  type TranscriptGenerationJob,
  type TranscriptRecord,
} from '../../api';

interface LevelYearTablePageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

interface Level {
  id: string;
  name: string;
  totalCourses: number;
  totalCredits: number;
  enrolledStudents: number;
  courses: Course[];
}

interface Program {
  id: string;
  name: string;
  levels: Level[];
  isExpanded?: boolean;
}

type AcademicProgram = Program;

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  room: string;
  timeSlots: string[];
}

interface Student {
  id: string;
  name: string;
  studentId: string;
  currentLevel: string;
  gpa: number;
  status: 'passed' | 'failed';
  coursesCompleted: number;
  totalCourses: number;
}

function mapBackendProgram(program: BackendProgram): AcademicProgram {
  return {
    id: String(program.id),
    name: program.name,
    isExpanded: false,
    levels: (program.levels ?? [])
      .slice()
      .sort((a, b) => a.level - b.level)
      .map((level) => ({
        id: String(level.id),
        name: `Level ${level.level}`,
        totalCourses: 0,
        totalCredits: level.maxCredits || level.minCredits || 0,
        enrolledStudents: 0,
        courses: [],
      })),
  };
}

// Mock data
const mockPrograms: Program[] = [
  {
    id: '1',
    name: 'Computer Science',
    isExpanded: false,
    levels: [
      {
        id: '1-1',
        name: 'Level 1',
        totalCourses: 8,
        totalCredits: 32,
        enrolledStudents: 120,
        courses: [
          { id: 'cs101', code: 'CS-101', name: 'Introduction to Programming', credits: 4, instructor: 'Dr. Sarah Wilson', room: 'Lab A1', timeSlots: ['Mon 9:00-10:30', 'Wed 9:00-10:30'] },
          { id: 'math101', code: 'MATH-101', name: 'Calculus I', credits: 4, instructor: 'Prof. Michael Johnson', room: 'Room B2', timeSlots: ['Tue 11:00-12:30', 'Thu 11:00-12:30'] },
        ]
      },
      {
        id: '1-2',
        name: 'Level 2',
        totalCourses: 8,
        totalCredits: 32,
        enrolledStudents: 98,
        courses: [
          { id: 'cs201', code: 'CS-201', name: 'Data Structures', credits: 4, instructor: 'Dr. Ahmed Hassan', room: 'Lab B1', timeSlots: ['Mon 14:00-15:30', 'Wed 14:00-15:30'] },
        ]
      },
      {
        id: '1-3',
        name: 'Level 3',
        totalCourses: 9,
        totalCredits: 36,
        enrolledStudents: 85,
        courses: []
      },
      {
        id: '1-4',
        name: 'Level 4',
        totalCourses: 8,
        totalCredits: 32,
        enrolledStudents: 72,
        courses: []
      }
    ]
  },
  {
    id: '2',
    name: 'Mathematics',
    isExpanded: false,
    levels: [
      {
        id: '2-1',
        name: 'Level 1',
        totalCourses: 7,
        totalCredits: 28,
        enrolledStudents: 75,
        courses: [
          { id: 'math201', code: 'MATH-201', name: 'Statistics', credits: 4, instructor: 'Prof. Elena Rodriguez', room: 'Room C1', timeSlots: ['Tue 9:00-10:30', 'Thu 9:00-10:30'] },
        ]
      },
      {
        id: '2-2',
        name: 'Level 2',
        totalCourses: 8,
        totalCredits: 32,
        enrolledStudents: 62,
        courses: []
      }
    ]
  },
  {
    id: '3',
    name: 'Engineering',
    isExpanded: false,
    levels: [
      {
        id: '3-1',
        name: 'Level 1',
        totalCourses: 9,
        totalCredits: 36,
        enrolledStudents: 145,
        courses: []
      },
      {
        id: '3-2',
        name: 'Level 2',
        totalCourses: 9,
        totalCredits: 36,
        enrolledStudents: 128,
        courses: []
      },
      {
        id: '3-3',
        name: 'Level 3',
        totalCourses: 8,
        totalCredits: 32,
        enrolledStudents: 110,
        courses: []
      }
    ]
  }
];

// Mock student data for promotion
const mockStudentsForPromotion: Record<string, { passed: Student[], failed: Student[] }> = {
  '1-1': {
    passed: [
      { id: 's1', name: 'Ahmed Mohamed', studentId: 'CS2024001', currentLevel: 'Level 1', gpa: 3.5, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
      { id: 's2', name: 'Sara Ali', studentId: 'CS2024002', currentLevel: 'Level 1', gpa: 3.8, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
      { id: 's3', name: 'Omar Hassan', studentId: 'CS2024003', currentLevel: 'Level 1', gpa: 3.2, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
      { id: 's4', name: 'Fatima Ibrahim', studentId: 'CS2024004', currentLevel: 'Level 1', gpa: 3.9, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
      { id: 's5', name: 'Youssef Ahmed', studentId: 'CS2024005', currentLevel: 'Level 1', gpa: 3.3, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
    ],
    failed: [
      { id: 'f1', name: 'Khaled Mahmoud', studentId: 'CS2024006', currentLevel: 'Level 1', gpa: 1.8, status: 'failed', coursesCompleted: 5, totalCourses: 8 },
      { id: 'f2', name: 'Nour Samir', studentId: 'CS2024007', currentLevel: 'Level 1', gpa: 1.5, status: 'failed', coursesCompleted: 4, totalCourses: 8 },
    ]
  },
  '1-2': {
    passed: [
      { id: 's6', name: 'Mariam Fathy', studentId: 'CS2023010', currentLevel: 'Level 2', gpa: 3.6, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
      { id: 's7', name: 'Karim Adel', studentId: 'CS2023011', currentLevel: 'Level 2', gpa: 3.4, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
    ],
    failed: [
      { id: 'f3', name: 'Salma Youssef', studentId: 'CS2023012', currentLevel: 'Level 2', gpa: 1.9, status: 'failed', coursesCompleted: 6, totalCourses: 8 },
    ]
  },
  '2-1': {
    passed: [
      { id: 's8', name: 'Hassan Tarek', studentId: 'MATH2024020', currentLevel: 'Level 1', gpa: 3.7, status: 'passed', coursesCompleted: 7, totalCourses: 7 },
      { id: 's9', name: 'Layla Mustafa', studentId: 'MATH2024021', currentLevel: 'Level 1', gpa: 3.5, status: 'passed', coursesCompleted: 7, totalCourses: 7 },
    ],
    failed: []
  }
};

interface BackendTranscriptsPanelProps {
  programs: BackendProgram[];
  isProgramsLoading: boolean;
  programsError: string | null;
}

function formatSemesterLabel(
  semester: { type: string; term: number; year: number } | null | undefined,
): string {
  if (!semester) return 'Semester';
  return `${semester.type} ${semester.term} - ${semester.year}`;
}

function formatGpa(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toFixed(4);
}

function getStudentDisplayName(student: Pick<StudentRecord, 'fullName' | 'firstName' | 'lastName' | 'username'>): string {
  const fullName = typeof student.fullName === 'string' ? student.fullName.trim() : '';
  if (fullName) return fullName;

  const fallback = [student.firstName, student.lastName]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
    .trim();

  return fallback || student.username || 'Unknown Student';
}

function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toFixed(2);
}

function getProgramRequiredCredits(program: BackendProgram | null): number | null {
  if (!program) return null;
  return program.universityCreditHours + program.facultyCreditHours + program.programCreditHours;
}

function sortTranscriptRecords(records: TranscriptRecord[]): TranscriptRecord[] {
  return [...records].sort((left, right) => {
    const yearDiff = (right.semester?.year ?? right.year) - (left.semester?.year ?? left.year);
    if (yearDiff !== 0) return yearDiff;

    const termDiff = (right.semester?.term ?? 0) - (left.semester?.term ?? 0);
    if (termDiff !== 0) return termDiff;

    return right.id - left.id;
  });
}

function formatAssessmentTotal(totalMarks: number, totalMaxMarks: number): string {
  if (!Number.isFinite(totalMarks) || !Number.isFinite(totalMaxMarks) || totalMaxMarks <= 0) {
    return '—';
  }

  const percentage = (totalMarks / totalMaxMarks) * 100;
  return `${formatScore(totalMarks)}/${formatScore(totalMaxMarks)} (${formatScore(percentage)}%)`;
}

function BackendTranscriptsPanel({ programs, isProgramsLoading, programsError }: BackendTranscriptsPanelProps) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(true);
  const [semesterError, setSemesterError] = useState<string | null>(null);

  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [studentsNotice, setStudentsNotice] = useState<string | null>(null);

  const [transcript, setTranscript] = useState<StudentTranscripts | null>(null);
  const [semesterTranscript, setSemesterTranscript] = useState<TranscriptRecord | null>(null);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);

  const [transcriptJob, setTranscriptJob] = useState<TranscriptGenerationJob | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  const [expandedSemesters, setExpandedSemesters] = useState<string[]>([]);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [modalStudent, setModalStudent] = useState<StudentRecord | null>(null);
  const [modalTranscript, setModalTranscript] = useState<StudentTranscripts | null>(null);
  const [isLoadingModalTranscript, setIsLoadingModalTranscript] = useState(false);
  const [modalTranscriptError, setModalTranscriptError] = useState<string | null>(null);

  const selectedProgram = useMemo(
    () => programs.find((program) => String(program.id) === selectedProgramId) ?? null,
    [programs, selectedProgramId],
  );

  const levelOptions = useMemo(
    () =>
      (selectedProgram?.levels ?? [])
        .slice()
        .sort((left, right) => left.level - right.level)
        .map((level) => ({
          value: String(level.id),
          label: `Level ${level.level}`,
          description: `${level.minCredits}-${level.maxCredits} credits`,
        })),
    [selectedProgram],
  );

  const academicYearOptions = useMemo(() => {
    const years = Array.from(new Set(semesters.map((semester) => semester.year))).sort((left, right) => right - left);
    return years.map((year) => ({ value: String(year), label: String(year) }));
  }, [semesters]);

  const semesterOptions = useMemo(
    () =>
      semesters
        .filter((semester) => !selectedAcademicYear || String(semester.year) === selectedAcademicYear)
        .sort((left, right) => {
          if (left.year !== right.year) return right.year - left.year;
          return right.term - left.term;
        })
        .map((semester) => ({
          value: String(semester.id),
          label: formatSemesterLabel(semester),
          description: `${new Date(semester.startDate).toLocaleDateString()} to ${new Date(semester.endDate).toLocaleDateString()}`,
        })),
    [selectedAcademicYear, semesters],
  );

  const filteredStudents = useMemo(
    () =>
      students
        .filter((student) => !selectedLevelId || String(student.programLevelId) === selectedLevelId)
        .sort((left, right) => getStudentDisplayName(left).localeCompare(getStudentDisplayName(right))),
    [selectedLevelId, students],
  );

  const studentOptions = useMemo(
    () =>
      filteredStudents.map((student) => ({
        value: String(student.id),
        label: getStudentDisplayName(student),
        description: `${student.universityStudentId} • ${student.programLevelName} • CGPA ${formatGpa(student.cgpa)}`,
        searchText: `${getStudentDisplayName(student)} ${student.universityStudentId} ${student.programName} ${student.programLevelName}`,
      })),
    [filteredStudents],
  );

  const selectedStudent = useMemo(
    () => filteredStudents.find((student) => String(student.id) === selectedStudentId) ?? null,
    [filteredStudents, selectedStudentId],
  );

  const displayedTranscriptRecords = useMemo(() => {
    if (semesterTranscript) {
      return sortTranscriptRecords([semesterTranscript]);
    }

    return sortTranscriptRecords(transcript?.semesters ?? []);
  }, [semesterTranscript, transcript]);

  const currentTranscriptRecord = displayedTranscriptRecords[0] ?? null;
  const totalRequiredCredits = getProgramRequiredCredits(selectedProgram);
  const completedCredits = currentTranscriptRecord?.totalCredits ?? null;
  const remainingCredits =
    totalRequiredCredits !== null && completedCredits !== null
      ? Math.max(totalRequiredCredits - completedCredits, 0)
      : null;

  const programStats = useMemo(() => {
    const cgpas = filteredStudents
      .map((student) => student.cgpa)
      .filter((value): value is number => typeof value === 'number');

    if (cgpas.length === 0) {
      return {
        count: filteredStudents.length,
        average: null,
        highest: null,
        lowest: null,
      };
    }

    const total = cgpas.reduce((sum, value) => sum + value, 0);
    return {
      count: filteredStudents.length,
      average: total / cgpas.length,
      highest: Math.max(...cgpas),
      lowest: Math.min(...cgpas),
    };
  }, [filteredStudents]);

  const currentSemester = useMemo(
    () => semesters.find((semester) => String(semester.id) === selectedSemesterId) ?? null,
    [selectedSemesterId, semesters],
  );

  const modalTranscriptRecords = useMemo(
    () => sortTranscriptRecords(modalTranscript?.semesters ?? []),
    [modalTranscript],
  );

  const loadSemesters = async () => {
    setIsLoadingSemesters(true);
    setSemesterError(null);

    try {
      const [allSemesters, current] = await Promise.all([
        SemesterService.getAll(),
        SemesterService.getCurrent().catch(() => null),
      ]);

      setSemesters(allSemesters);

      if (current) {
        setSelectedAcademicYear((previous) => previous || String(current.year));
        setSelectedSemesterId((previous) => previous || String(current.id));
      }
    } catch (err) {
      setSemesterError(err instanceof Error ? err.message : 'Failed to load semesters');
    } finally {
      setIsLoadingSemesters(false);
    }
  };

  const loadStudents = async () => {
    setIsLoadingStudents(true);
    setStudentsError(null);
    setStudentsNotice(null);

    try {
      const fetchStudents = async (semesterId?: number) => {
        const collected: StudentRecord[] = [];
        let page = 1;
        let totalPages = 1;

        do {
          const response = await StudentService.getStudents({
            page,
            limit: 100,
            programId: selectedProgramId ? Number(selectedProgramId) : undefined,
            semesterId,
          });

          collected.push(...response.students);
          totalPages = Math.max(response.pagination.totalPages, 1);
          page += 1;
        } while (page <= totalPages);

        return collected;
      };

      const semesterScopedStudents = await fetchStudents(
        selectedSemesterId ? Number(selectedSemesterId) : undefined,
      );

      if (semesterScopedStudents.length > 0 || !selectedSemesterId) {
        setStudents(semesterScopedStudents);
        return;
      }

      const fallbackStudents = await fetchStudents(undefined);
      setStudents(fallbackStudents);
      setStudentsNotice(
        fallbackStudents.length > 0
          ? 'No students were linked to the selected semester, so the list below is showing program students across all semesters.'
          : 'No students were returned for the selected filters.',
      );
    } catch (err) {
      setStudents([]);
      setStudentsError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const resetTranscriptView = () => {
    setTranscript(null);
    setSemesterTranscript(null);
    setTranscriptError(null);
    setExpandedSemesters([]);
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  useEffect(() => {
    if (isLoadingSemesters) return;
    loadStudents();
  }, [isLoadingSemesters, selectedProgramId, selectedSemesterId]);

  useEffect(() => {
    if (selectedLevelId && !levelOptions.some((level) => level.value === selectedLevelId)) {
      setSelectedLevelId('');
    }
  }, [levelOptions, selectedLevelId]);

  useEffect(() => {
    if (selectedSemesterId && !semesterOptions.some((semester) => semester.value === selectedSemesterId)) {
      setSelectedSemesterId('');
    }
  }, [selectedSemesterId, semesterOptions]);

  useEffect(() => {
    if (selectedStudentId && !filteredStudents.some((student) => String(student.id) === selectedStudentId)) {
      setSelectedStudentId('');
    }
  }, [filteredStudents, selectedStudentId]);

  useEffect(() => {
    resetTranscriptView();
    setBatchError(null);
    setTranscriptJob(null);
  }, [selectedAcademicYear, selectedLevelId, selectedProgramId, selectedSemesterId, selectedStudentId]);

  useEffect(() => {
    if (!transcriptJob || transcriptJob.isCompleted) return undefined;

    const timer = window.setInterval(async () => {
      try {
        const nextJob = await TranscriptService.getTranscriptGenerationJob(transcriptJob.jobId);
        setTranscriptJob(nextJob);
      } catch (err) {
        setBatchError(err instanceof Error ? err.message : 'Failed to refresh transcript batch status');
      }
    }, 3000);

    return () => window.clearInterval(timer);
  }, [transcriptJob]);

  const handleLoadTranscript = async () => {
    if (!selectedStudent) {
      toast.error('Select a student first');
      return;
    }

    setIsLoadingTranscript(true);
    setTranscriptError(null);

    try {
      if (selectedSemesterId) {
        const semesterRecord = await TranscriptService.getStudentSemesterTranscript(
          selectedStudent.id,
          Number(selectedSemesterId),
        );
        setSemesterTranscript(semesterRecord);
        setTranscript(null);
        setExpandedSemesters([String(semesterRecord.id)]);
      } else {
        const records = await TranscriptService.getStudentTranscripts(selectedStudent.id);
        setTranscript(records);
        setSemesterTranscript(null);
        setExpandedSemesters(records.semesters.map((record) => String(record.id)));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load transcript';
      resetTranscriptView();
      setTranscriptError(message);
      toast.error(message);
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  const handleGenerateTranscript = async () => {
    if (!selectedStudent) {
      toast.error('Select a student first');
      return;
    }

    setIsGeneratingTranscript(true);
    setTranscriptError(null);

    try {
      const generated = await TranscriptService.generateStudentTranscripts(selectedStudent.id);

      if (selectedSemesterId) {
        const matchingSemester = generated.semesters.find((record) => record.semesterId === Number(selectedSemesterId));
        if (!matchingSemester) {
          setTranscript(generated);
          setSemesterTranscript(null);
          setExpandedSemesters(generated.semesters.map((record) => String(record.id)));
          toast.success('Transcript generation completed, but no transcript was found for the selected semester');
        } else {
          setSemesterTranscript(matchingSemester);
          setTranscript(null);
          setExpandedSemesters([String(matchingSemester.id)]);
          toast.success('Semester transcript generated from backend grades');
        }
      } else {
        setTranscript(generated);
        setSemesterTranscript(null);
        setExpandedSemesters(generated.semesters.map((record) => String(record.id)));
        toast.success('Cumulative transcript generated from backend grades');
      }

      await loadStudents();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate transcript';
      setTranscriptError(message);
      toast.error(message);
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

  const handleGenerateProgramTranscript = async () => {
    if (!selectedProgram) {
      toast.error('Select a program first');
      return;
    }

    if (!selectedSemesterId) {
      toast.error('Select a semester first');
      return;
    }

    setIsGeneratingBatch(true);
    setBatchError(null);

    try {
      const queuedJob = await TranscriptService.generateFacultySemesterTranscripts(
        Number(selectedSemesterId),
        selectedProgram.facultyId,
      );

      const initialJob = await TranscriptService.getTranscriptGenerationJob(queuedJob.jobId);
      setTranscriptJob(initialJob);
      toast.success(`Transcript batch job queued for ${queuedJob.totalStudents} student${queuedJob.totalStudents === 1 ? '' : 's'}`);
      await loadStudents();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start transcript generation job';
      setBatchError(message);
      toast.error(message);
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadSemesters(), loadStudents()]);

    if (selectedStudent) {
      await handleLoadTranscript();
    }

    if (transcriptJob && !transcriptJob.isCompleted) {
      try {
        setTranscriptJob(await TranscriptService.getTranscriptGenerationJob(transcriptJob.jobId));
      } catch (err) {
        setBatchError(err instanceof Error ? err.message : 'Failed to refresh transcript job');
      }
    }
  };

  const openTranscriptModal = async (student: StudentRecord) => {
    setModalStudent(student);
    setModalTranscript(null);
    setModalTranscriptError(null);
    setIsLoadingModalTranscript(true);
    setIsTranscriptModalOpen(true);

    try {
      const records = await TranscriptService.getStudentTranscripts(student.id);
      setModalTranscript(records);
    } catch (err) {
      setModalTranscriptError(err instanceof Error ? err.message : 'Failed to load transcript');
    } finally {
      setIsLoadingModalTranscript(false);
    }
  };

  const handleReset = () => {
    setSelectedProgramId('');
    setSelectedLevelId('');
    setSelectedAcademicYear('');
    setSelectedSemesterId('');
    setSelectedStudentId('');
    setStudents([]);
    setStudentsError(null);
    setStudentsNotice(null);
    setTranscriptJob(null);
    setBatchError(null);
    setModalStudent(null);
    setModalTranscript(null);
    setModalTranscriptError(null);
    setIsTranscriptModalOpen(false);
    resetTranscriptView();
  };

  const renderErrorBanner = (message: string | null) =>
    message ? (
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            GPA & Transcript Dashboard
          </CardTitle>
          <CardDescription>
            Backend-driven transcript generation and transcript viewing. GPA values shown here always come from the transcript APIs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Filter className="h-4 w-4 text-slate-400" />
                Program
              </label>
              <SearchableSelect
                value={selectedProgramId}
                onValueChange={setSelectedProgramId}
                options={programs.map((program) => ({
                  value: String(program.id),
                  label: program.name,
                  description: `${program.levels.length} levels • ${program.programType}`,
                }))}
                placeholder={isProgramsLoading ? 'Loading programs...' : 'All programs'}
                loading={isProgramsLoading}
                disabled={isProgramsLoading || !!programsError}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Level</label>
              <SearchableSelect
                value={selectedLevelId}
                onValueChange={setSelectedLevelId}
                options={levelOptions}
                placeholder={selectedProgram ? 'All levels' : 'Select a program first'}
                disabled={!selectedProgram}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Academic Year</label>
              <SearchableSelect
                value={selectedAcademicYear}
                onValueChange={setSelectedAcademicYear}
                options={academicYearOptions}
                placeholder={isLoadingSemesters ? 'Loading years...' : 'All years'}
                loading={isLoadingSemesters}
                disabled={isLoadingSemesters}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Semester</label>
              <SearchableSelect
                value={selectedSemesterId}
                onValueChange={setSelectedSemesterId}
                options={semesterOptions}
                placeholder={isLoadingSemesters ? 'Loading semesters...' : 'All semesters'}
                loading={isLoadingSemesters}
                disabled={isLoadingSemesters}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Student</label>
              <SearchableSelect
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
                options={studentOptions}
                placeholder={isLoadingStudents ? 'Loading students...' : 'Program mode'}
                loading={isLoadingStudents}
                disabled={isLoadingStudents || filteredStudents.length === 0}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleGenerateTranscript}
              disabled={!selectedStudent || isGeneratingTranscript || isLoadingTranscript}
              className="gap-2"
            >
              {isGeneratingTranscript ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
              Generate Transcript
            </Button>
            <Button
              variant="outline"
              onClick={handleLoadTranscript}
              disabled={!selectedStudent || isGeneratingTranscript || isLoadingTranscript}
              className="gap-2"
            >
              {isLoadingTranscript ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              {selectedSemesterId ? 'Load Semester Transcript' : 'Load Cumulative Transcript'}
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateProgramTranscript}
              disabled={!selectedProgram || !selectedSemesterId || isGeneratingBatch}
              className="gap-2"
            >
              {isGeneratingBatch ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
              Generate Semester Batch
            </Button>
            <Button variant="outline" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              Reset
            </Button>
            {selectedStudent && displayedTranscriptRecords.length > 0 ? (
              <Button variant="ghost" onClick={() => window.print()} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Transcript
              </Button>
            ) : null}
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Batch generation uses the selected semester and the faculty that owns the selected program, matching the
            backend transcript routes exactly.
          </div>

          {renderErrorBanner(programsError)}
          {renderErrorBanner(semesterError)}
          {renderErrorBanner(studentsError)}
          {renderErrorBanner(transcriptError)}
          {renderErrorBanner(batchError)}
          {studentsNotice ? (
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              {studentsNotice}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {selectedStudent ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Information
              </CardTitle>
              <CardDescription>Transcript mode for the selected student.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
                <p className="mt-1 font-medium text-slate-900">{getStudentDisplayName(selectedStudent)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">University ID</p>
                <p className="mt-1 font-medium text-slate-900">{selectedStudent.universityStudentId}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Program</p>
                <p className="mt-1 font-medium text-slate-900">{selectedStudent.programName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Level</p>
                <p className="mt-1 font-medium text-slate-900">{selectedStudent.programLevelName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Semester</p>
                <p className="mt-1 font-medium text-slate-900">{currentSemester ? formatSemesterLabel(currentSemester) : 'All semesters'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                <p className="mt-1 font-medium text-slate-900">{selectedStudent.status}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Summary</CardTitle>
              <CardDescription>
                Semester GPA and cumulative values pulled from the backend transcript records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTranscript ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {[
                    { label: 'Semester GPA', value: formatGpa(currentTranscriptRecord?.semesterGpa) },
                    { label: 'CGPA', value: formatGpa(currentTranscriptRecord?.cumulativeGpa ?? selectedStudent.cgpa) },
                    { label: 'Completed Credits', value: completedCredits !== null ? String(completedCredits) : '—' },
                    { label: 'Remaining Credits', value: remainingCredits !== null ? String(remainingCredits) : '—' },
                    { label: 'Total Credits', value: totalRequiredCredits !== null ? String(totalRequiredCredits) : '—' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transcript Table</CardTitle>
              <CardDescription>
                {selectedSemesterId
                  ? 'Selected semester transcript from the backend.'
                  : 'Cumulative transcript grouped by semester.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTranscript ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-56 rounded-xl" />
                </div>
              ) : displayedTranscriptRecords.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
                  {selectedStudent
                    ? 'No transcript exists for the current selection yet. Generate or load a backend transcript to view it here.'
                    : 'Select a student to view transcript details.'}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => selectedStudent && openTranscriptModal(selectedStudent)}
                    >
                      <Eye className="h-4 w-4" />
                      View Transcript
                    </Button>
                  </div>
                  <Accordion
                    type="multiple"
                    value={expandedSemesters}
                    onValueChange={setExpandedSemesters}
                    className="space-y-3"
                  >
                    {displayedTranscriptRecords.map((record) => {
                      const semesterLabel = formatSemesterLabel(record.semester ?? { term: 0, type: 'Semester', year: record.year });
                      return (
                        <AccordionItem key={record.id} value={String(record.id)} className="overflow-hidden rounded-xl border border-slate-200">
                          <AccordionTrigger className="bg-slate-50 px-4 py-3 hover:no-underline">
                            <div className="flex w-full flex-col gap-3 text-left md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="font-semibold text-slate-900">{semesterLabel}</p>
                                <p className="text-xs text-slate-500">
                                  Generated {new Date(record.generatedDate).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">Semester GPA {formatGpa(record.semesterGpa)}</Badge>
                                <Badge>Cumulative GPA {formatGpa(record.cumulativeGpa)}</Badge>
                                <Badge variant="outline">{record.totalCredits} credits</Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-0 pb-0">
                            <Separator />
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[960px] text-sm">
                                <thead>
                                  <tr className="border-b bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                                    <th className="px-4 py-3">Course Code</th>
                                    <th className="px-4 py-3">Course Name</th>
                                    <th className="px-4 py-3 text-center">Credit Hours</th>
                                    <th className="px-4 py-3 text-center">Assessment Total</th>
                                    <th className="px-4 py-3 text-center">Grade</th>
                                    <th className="px-4 py-3 text-center">Letter Grade</th>
                                    <th className="px-4 py-3 text-center">Quality Points</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Semester</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {record.courses.map((course) => (
                                    <tr key={course.registrationId} className="border-b last:border-b-0">
                                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{course.courseCode ?? '—'}</td>
                                      <td className="px-4 py-3 text-slate-800">{course.courseName ?? 'Unnamed course'}</td>
                                      <td className="px-4 py-3 text-center">{course.credits}</td>
                                      <td className="px-4 py-3 text-center">
                                        {`${formatScore(course.totalMarks)}/${formatScore(course.totalMaxMarks)}`}
                                      </td>
                                      <td className="px-4 py-3 text-center">{formatScore(course.scorePercentage)}</td>
                                      <td className="px-4 py-3 text-center font-semibold">{course.grade ?? '—'}</td>
                                      <td className="px-4 py-3 text-center">{formatGpa(course.gradePoints)}</td>
                                      <td className="px-4 py-3 text-center">{course.status}</td>
                                      <td className="px-4 py-3 text-center">{semesterLabel}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Program Mode
              </CardTitle>
              <CardDescription>
                Batch generation and GPA overview for the currently filtered scope.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Number of Students', value: String(programStats.count) },
                  { label: 'Average GPA', value: formatGpa(programStats.average) },
                  { label: 'Highest GPA', value: formatGpa(programStats.highest) },
                  { label: 'Lowest GPA', value: formatGpa(programStats.lowest) },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              {transcriptJob ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">Transcript Batch Job</p>
                      <p className="text-sm text-slate-500">Job ID: {transcriptJob.jobId}</p>
                    </div>
                    <Badge variant={transcriptJob.hasError ? 'destructive' : 'outline'}>{transcriptJob.status}</Badge>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Students</p>
                      <p className="mt-2 font-semibold text-slate-900">{transcriptJob.result?.totalStudents ?? '—'}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Completed</p>
                      <p className="mt-2 font-semibold text-emerald-700">{transcriptJob.result?.completedCount ?? '—'}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Failed</p>
                      <p className="mt-2 font-semibold text-rose-700">{transcriptJob.result?.failedCount ?? '—'}</p>
                    </div>
                  </div>

                  {transcriptJob.items && transcriptJob.items.length > 0 ? (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2">Student ID</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Semester GPA</th>
                            <th className="px-3 py-2">CGPA</th>
                            <th className="px-3 py-2">Message</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transcriptJob.items.map((item) => (
                            <tr key={`${item.studentId}-${item.semesterId}`} className="border-b last:border-b-0">
                              <td className="px-3 py-2">{item.studentId}</td>
                              <td className="px-3 py-2">
                                {item.error ? (
                                  <Badge variant="destructive">Failed</Badge>
                                ) : (
                                  <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>
                                )}
                              </td>
                              <td className="px-3 py-2">{formatGpa(item.transcript?.semesterGpa)}</td>
                              <td className="px-3 py-2">{formatGpa(item.transcript?.cumulativeGpa)}</td>
                              <td className="px-3 py-2 text-slate-600">{item.error ?? 'Transcript generated successfully'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Students In Scope</CardTitle>
              <CardDescription>
                Select a student to switch to transcript mode and inspect cumulative or semester transcript data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStudents ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 rounded-xl" />
                  <Skeleton className="h-12 rounded-xl" />
                  <Skeleton className="h-12 rounded-xl" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
                  No students were returned for the selected filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">University ID</th>
                        <th className="px-4 py-3">Program</th>
                        <th className="px-4 py-3">Level</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">CGPA</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b last:border-b-0">
                          <td className="px-4 py-3 font-medium text-slate-900">{getStudentDisplayName(student)}</td>
                          <td className="px-4 py-3">{student.universityStudentId}</td>
                          <td className="px-4 py-3">{student.programName}</td>
                          <td className="px-4 py-3">{student.programLevelName}</td>
                          <td className="px-4 py-3">{student.status}</td>
                          <td className="px-4 py-3">{formatGpa(student.cgpa)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setSelectedStudentId(String(student.id))}>
                                Select
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openTranscriptModal(student)}>
                                View Transcript
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={isTranscriptModalOpen} onOpenChange={setIsTranscriptModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {modalStudent ? `${getStudentDisplayName(modalStudent)} Transcript` : 'Transcript'}
            </DialogTitle>
            <DialogDescription>
              Every term returned by the backend transcript routes, including courses, grades, Semester GPA, and CGPA.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto pr-1">
            {modalTranscriptError ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{modalTranscriptError}</span>
              </div>
            ) : isLoadingModalTranscript ? (
              <div className="space-y-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </div>
            ) : !modalTranscript || modalTranscriptRecords.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
                No transcript records were returned for this student.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Student ID</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{modalStudent?.universityStudentId ?? '—'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Program</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{modalStudent?.programName ?? '—'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Level</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{modalStudent?.programLevelName ?? '—'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Current CGPA</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {formatGpa(modalTranscriptRecords[0]?.cumulativeGpa ?? modalStudent?.cgpa)}
                    </p>
                  </div>
                </div>

                <Accordion
                  type="multiple"
                  defaultValue={modalTranscriptRecords.map((record) => String(record.id))}
                  className="space-y-3"
                >
                  {modalTranscriptRecords.map((record) => {
                    const semesterLabel = formatSemesterLabel(record.semester ?? { term: 0, type: 'Semester', year: record.year });
                    return (
                      <AccordionItem key={record.id} value={String(record.id)} className="overflow-hidden rounded-xl border border-slate-200">
                        <AccordionTrigger className="bg-slate-50 px-4 py-3 hover:no-underline">
                          <div className="flex w-full flex-col gap-3 text-left md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{semesterLabel}</p>
                              <p className="text-xs text-slate-500">
                                Generated {new Date(record.generatedDate).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">Semester GPA {formatGpa(record.semesterGpa)}</Badge>
                              <Badge>Cumulative GPA {formatGpa(record.cumulativeGpa)}</Badge>
                              <Badge variant="outline">{record.totalCredits} credits</Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-0">
                          <Separator />
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[920px] text-sm">
                              <thead>
                                <tr className="border-b bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                                  <th className="px-4 py-3">Course Code</th>
                                  <th className="px-4 py-3">Course Name</th>
                                  <th className="px-4 py-3 text-center">Credit Hours</th>
                                  <th className="px-4 py-3 text-center">Assessment Total</th>
                                  <th className="px-4 py-3 text-center">Grade %</th>
                                  <th className="px-4 py-3 text-center">Letter Grade</th>
                                  <th className="px-4 py-3 text-center">Quality Points</th>
                                  <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {record.courses.map((course) => (
                                  <tr key={course.registrationId} className="border-b last:border-b-0">
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{course.courseCode ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-800">{course.courseName ?? 'Unnamed course'}</td>
                                    <td className="px-4 py-3 text-center">{course.credits}</td>
                                    <td className="px-4 py-3 text-center">{formatAssessmentTotal(course.totalMarks, course.totalMaxMarks)}</td>
                                    <td className="px-4 py-3 text-center">{formatScore(course.scorePercentage)}</td>
                                    <td className="px-4 py-3 text-center font-semibold">{course.grade ?? '—'}</td>
                                    <td className="px-4 py-3 text-center">{formatGpa(course.gradePoints)}</td>
                                    <td className="px-4 py-3 text-center">{course.status}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTranscriptModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function LevelYearTablePage({ selectedUniversity }: LevelYearTablePageProps) {
  const [backendPrograms, setBackendPrograms] = useState<BackendProgram[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [programsError, setProgramsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPrograms = async () => {
      setIsLoadingPrograms(true);
      setProgramsError(null);

      try {
        const programs = await ProgramService.getAll();
        if (!isMounted) return;
        setBackendPrograms(programs);
      } catch (error) {
        if (!isMounted) return;
        setBackendPrograms([]);
        setProgramsError(error instanceof Error ? error.message : 'Failed to load academic programs');
      } finally {
        if (isMounted) setIsLoadingPrograms(false);
      }
    };

    loadPrograms();

    return () => {
      isMounted = false;
    };
  }, [selectedUniversity]);

  return (
    <BackendTranscriptsPanel
      programs={backendPrograms}
      isProgramsLoading={isLoadingPrograms}
      programsError={programsError}
    />
  );
}

// export function LevelYearTablePage({ selectedUniversity }: LevelYearTablePageProps) {
//   const [programs, setPrograms] = useState<Program[]>(mockPrograms);
//   const [backendPrograms, setBackendPrograms] = useState<BackendProgram[]>([]);
//   const [academicPrograms, setAcademicPrograms] = useState<AcademicProgram[]>([]);
//   const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
//   const [programsError, setProgramsError] = useState<string | null>(null);
//   const [selectedTab, setSelectedTab] = useState('programs');

//   // Move Levels state
//   const [selectedProgramForMove, setSelectedProgramForMove] = useState<string | null>(null);
//   const [selectedLevelForMove, setSelectedLevelForMove] = useState<string | null>(null);
//   const [showPromotionDialog, setShowPromotionDialog] = useState(false);
//   const [promotionProgress, setPromotionProgress] = useState(0);
//   const [isPromoting, setIsPromoting] = useState(false);

//   useEffect(() => {
//     let isMounted = true;

//     const loadPrograms = async () => {
//       setIsLoadingPrograms(true);
//       setProgramsError(null);
//       try {
//         const backendPrograms = await ProgramService.getAll();
//         if (!isMounted) return;
//         setBackendPrograms(backendPrograms);
//         setAcademicPrograms(backendPrograms.map(mapBackendProgram));
//       } catch (err) {
//         if (!isMounted) return;
//         setBackendPrograms([]);
//         setAcademicPrograms([]);
//         setProgramsError(err instanceof Error ? err.message : 'Failed to load academic programs');
//       } finally {
//         if (isMounted) setIsLoadingPrograms(false);
//       }
//     };

//     loadPrograms();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   const toggleProgramExpansion = (programId: string) => {
//     setPrograms(prev =>
//       prev.map(program =>
//         program.id === programId
//           ? { ...program, isExpanded: !program.isExpanded }
//           : program
//       )
//     );
//   };

//   const toggleAcademicProgramExpansion = (programId: string) => {
//     setAcademicPrograms(prev =>
//       prev.map(program =>
//         program.id === programId
//           ? { ...program, isExpanded: !program.isExpanded }
//           : program
//       )
//     );
//   };

//   const handlePromoteStudents = async (levelId: string) => {
//     const studentsData = mockStudentsForPromotion[levelId];
//     if (!studentsData || studentsData.passed.length === 0) {
//       toast.error('No eligible students to promote');
//       return;
//     }

//     setIsPromoting(true);
//     setPromotionProgress(0);

//     // Simulate promotion process
//     const totalSteps = 100;
//     for (let i = 0; i <= totalSteps; i += 10) {
//       await new Promise(resolve => setTimeout(resolve, 200));
//       setPromotionProgress(i);
//     }

//     setIsPromoting(false);
//     setShowPromotionDialog(false);
//     toast.success(`Successfully promoted ${studentsData.passed.length} students to the next level!`);
//   };

//   const openPromotionDialog = (programId: string, levelId: string) => {
//     setSelectedProgramForMove(programId);
//     setSelectedLevelForMove(levelId);
//     setShowPromotionDialog(true);
//     setPromotionProgress(0);
//   };

//   const getNextLevelName = (currentLevelName: string): string => {
//     const levelNumber = parseInt(currentLevelName.match(/\d+/)?.[0] || '0');
//     return `Level ${levelNumber + 1}`;
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h2 className="text-2xl font-semibold text-slate-900">Level & Year Tables</h2>
//         <p className="text-slate-600 mt-1">
//           Manage academic structure and student promotions
//           {selectedUniversity && (
//             <span className="text-blue-600 font-medium"> • Filtered by selected university</span>
//           )}
//         </p>
//       </div>

//       {/* Tabs */}
//       <Tabs value={selectedTab} onValueChange={setSelectedTab}>
//         <TabsList className="grid w-full max-w-2xl grid-cols-3">
//           <TabsTrigger value="programs">Academic Programs & Levels</TabsTrigger>
//           <TabsTrigger value="gpa-transcripts">GPA & Transcripts</TabsTrigger>
//           <TabsTrigger value="move-levels">Move Levels</TabsTrigger>
//         </TabsList>

//         {/* Tab 1: Academic Programs & Levels */}
//         <TabsContent value="programs" className="mt-6 space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Database className="w-5 h-5" />
//                 Academic Programs & Levels
//               </CardTitle>
//               <CardDescription>
//                 Expandable view of programs with their respective academic levels
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {isLoadingPrograms ? (
//                 <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-200 py-12 text-sm text-slate-500">
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
//                   Loading academic programs...
//                 </div>
//               ) : programsError ? (
//                 <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
//                   <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
//                   <span>{programsError}</span>
//                 </div>
//               ) : academicPrograms.length === 0 ? (
//                 <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center">
//                   <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-300" />
//                   <p className="font-medium text-slate-900">No academic programs found</p>
//                   <p className="mt-1 text-sm text-slate-500">Create programs first to see their configured levels here.</p>
//                 </div>
//               ) : (
//               <div className="space-y-2">
//                 {academicPrograms.map((program) => (
//                   <div key={program.id} className="border border-slate-200 rounded-lg">
//                     {/* Program Header */}
//                     <div
//                       className="p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between"
//                       onClick={() => toggleAcademicProgramExpansion(program.id)}
//                     >
//                       <div className="flex items-center gap-3">
//                         {program.isExpanded ? (
//                           <ChevronDown className="w-4 h-4 text-slate-500" />
//                         ) : (
//                           <ChevronRight className="w-4 h-4 text-slate-500" />
//                         )}
//                         <div className="p-2 bg-blue-100 rounded-lg">
//                           <Building className="w-4 h-4 text-blue-600" />
//                         </div>
//                         <div>
//                           <h3 className="font-medium text-slate-900">{program.name}</h3>
//                           <p className="text-sm text-slate-600">
//                             {program.levels.length} levels • {
//                               program.levels.reduce((acc, level) => acc + level.totalCredits, 0)
//                             } total credit limit
//                           </p>
//                         </div>
//                       </div>
//                       <Badge variant="outline">
//                         {program.levels.length} Levels
//                       </Badge>
//                     </div>

//                     {/* Expanded Levels */}
//                     {program.isExpanded && (
//                       <div className="border-t border-slate-200 bg-slate-25">
//                         {program.levels.map((level) => (
//                           <div key={level.id} className="p-4 ml-8 border-l-2 border-slate-200 last:border-b-0">
//                             <div className="flex items-start justify-between mb-3">
//                               <div className="flex items-center gap-3">
//                                 <div className="p-2 bg-green-100 rounded-lg">
//                                   <Calendar className="w-4 h-4 text-green-600" />
//                                 </div>
//                                 <div>
//                                   <h4 className="font-medium text-slate-900">{level.name}</h4>
//                                   <p className="text-sm text-slate-600">Academic level structure</p>
//                                 </div>
//                               </div>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                               <div className="text-sm">
//                                 <span className="text-slate-600">Total Courses:</span>
//                                 <p className="font-medium text-slate-900">{level.totalCourses}</p>
//                               </div>
//                               <div className="text-sm">
//                                 <span className="text-slate-600">Total Credits:</span>
//                                 <p className="font-medium text-slate-900">{level.totalCredits}</p>
//                               </div>
//                               <div className="text-sm">
//                                 <span className="text-slate-600">Enrolled Students:</span>
//                                 <p className="font-medium text-slate-900">Not returned</p>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Tab 2: GPA Calculation & Transcripts */}
//         <TabsContent value="gpa-transcripts" className="mt-6">
//           <BackendTranscriptsPanel
//             programs={backendPrograms}
//             isProgramsLoading={isLoadingPrograms}
//             programsError={programsError}
//           />
//         </TabsContent>

//         {/* Tab 3: Move Levels */}
//         <TabsContent value="move-levels" className="mt-6 space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <TrendingUp className="w-5 h-5" />
//                 Move Students to Next Level
//               </CardTitle>
//               <CardDescription>
//                 Promote eligible students who have passed their current level to the next academic level
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {programs.map((program) => (
//                   <div key={program.id} className="border border-slate-200 rounded-lg p-4">
//                     <div className="flex items-center gap-3 mb-4">
//                       <div className="p-2 bg-blue-100 rounded-lg">
//                         <Building className="w-5 h-5 text-blue-600" />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-slate-900">{program.name}</h3>
//                         <p className="text-sm text-slate-600">{program.levels.length} academic levels</p>
//                       </div>
//                     </div>

//                     <div className="space-y-3">
//                       {program.levels.map((level, index) => {
//                         const studentsData = mockStudentsForPromotion[level.id];
//                         const hasNextLevel = index < program.levels.length - 1;
//                         const nextLevel = hasNextLevel ? program.levels[index + 1] : null;
//                         const passedCount = studentsData?.passed.length || 0;
//                         const failedCount = studentsData?.failed.length || 0;
//                         const totalCount = passedCount + failedCount;

//                         return (
//                           <div key={level.id} className="bg-slate-50 rounded-lg p-4">
//                             <div className="flex items-center justify-between mb-3">
//                               <div className="flex items-center gap-3">
//                                 <div className="p-2 bg-green-100 rounded-lg">
//                                   <Calendar className="w-4 h-4 text-green-600" />
//                                 </div>
//                                 <div>
//                                   <h4 className="font-medium text-slate-900">{level.name}</h4>
//                                   <p className="text-xs text-slate-500">
//                                     {totalCount > 0 ? `${totalCount} students total` : 'No students to evaluate'}
//                                   </p>
//                                 </div>
//                               </div>
//                               {hasNextLevel && (
//                                 <div className="flex items-center gap-2 text-sm text-slate-600">
//                                   <span>Move to</span>
//                                   <ArrowRight className="w-4 h-4" />
//                                   <span className="font-medium">{nextLevel?.name}</span>
//                                 </div>
//                               )}
//                             </div>

//                             {totalCount > 0 ? (
//                               <>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
//                                   {/* Eligible Students */}
//                                   <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
//                                     <div className="flex items-center justify-between mb-2">
//                                       <div className="flex items-center gap-2">
//                                         <CheckCircle className="w-4 h-4 text-green-600" />
//                                         <span className="text-sm font-medium text-slate-900">Eligible for Promotion</span>
//                                       </div>
//                                       <Badge className="bg-green-100 text-green-700 border-green-200">
//                                         {passedCount}
//                                       </Badge>
//                                     </div>
//                                     <p className="text-xs text-slate-600">
//                                       Students who passed all required courses
//                                     </p>
//                                   </div>

//                                   {/* Not Eligible Students */}
//                                   <div className="bg-white rounded-lg p-3 border-l-4 border-red-500">
//                                     <div className="flex items-center justify-between mb-2">
//                                       <div className="flex items-center gap-2">
//                                         <XCircle className="w-4 h-4 text-red-600" />
//                                         <span className="text-sm font-medium text-slate-900">Not Eligible</span>
//                                       </div>
//                                       <Badge className="bg-red-100 text-red-700 border-red-200">
//                                         {failedCount}
//                                       </Badge>
//                                     </div>
//                                     <p className="text-xs text-slate-600">
//                                       Students who need to retake courses
//                                     </p>
//                                   </div>
//                                 </div>

//                                 {hasNextLevel && passedCount > 0 && (
//                                   <Button
//                                     onClick={() => openPromotionDialog(program.id, level.id)}
//                                     className="w-full gap-2"
//                                     variant="default"
//                                   >
//                                     <TrendingUp className="w-4 h-4" />
//                                     Promote {passedCount} Student{passedCount !== 1 ? 's' : ''} to {nextLevel?.name}
//                                   </Button>
//                                 )}

//                                 {!hasNextLevel && (
//                                   <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 rounded-lg p-3">
//                                     <AlertTriangle className="w-4 h-4 text-blue-600" />
//                                     <span>This is the final level. Students will graduate upon completion.</span>
//                                   </div>
//                                 )}
//                               </>
//                             ) : (
//                               <div className="text-center py-4 text-sm text-slate-500">
//                                 No students available for evaluation in this level
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Promotion Dialog */}
//       <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
//         <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
//           <DialogHeader>
//             <DialogTitle>Confirm Student Promotion</DialogTitle>
//             <DialogDescription>
//               Review and confirm the promotion of eligible students to the next level
//             </DialogDescription>
//           </DialogHeader>

//           <div className="flex-1 overflow-y-auto">
//             {selectedLevelForMove && mockStudentsForPromotion[selectedLevelForMove] && (
//               <div className="space-y-4">
//                 {/* Summary */}
//                 <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
//                   <div className="flex items-start gap-3">
//                     <div className="p-2 bg-blue-100 rounded-lg">
//                       <Users className="w-5 h-5 text-blue-600" />
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="font-medium text-slate-900 mb-1">Promotion Summary</h4>
//                       <div className="grid grid-cols-2 gap-4 text-sm">
//                         <div>
//                           <span className="text-slate-600">Current Level:</span>
//                           <p className="font-medium text-slate-900">
//                             {programs.find(p => p.id === selectedProgramForMove)?.levels.find(l => l.id === selectedLevelForMove)?.name}
//                           </p>
//                         </div>
//                         <div>
//                           <span className="text-slate-600">Promoting To:</span>
//                           <p className="font-medium text-slate-900">
//                             {getNextLevelName(programs.find(p => p.id === selectedProgramForMove)?.levels.find(l => l.id === selectedLevelForMove)?.name || '')}
//                           </p>
//                         </div>
//                         <div>
//                           <span className="text-slate-600">Eligible Students:</span>
//                           <p className="font-medium text-green-700">
//                             {mockStudentsForPromotion[selectedLevelForMove].passed.length}
//                           </p>
//                         </div>
//                         <div>
//                           <span className="text-slate-600">Not Eligible:</span>
//                           <p className="font-medium text-red-700">
//                             {mockStudentsForPromotion[selectedLevelForMove].failed.length}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Eligible Students List */}
//                 <div>
//                   <div className="flex items-center gap-2 mb-3">
//                     <CheckCircle className="w-5 h-5 text-green-600" />
//                     <h4 className="font-medium text-slate-900">Students to be Promoted</h4>
//                   </div>
//                   <div className="space-y-2 max-h-64 overflow-y-auto">
//                     {mockStudentsForPromotion[selectedLevelForMove].passed.map((student) => (
//                       <div key={student.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//                               <span className="text-sm font-medium text-green-700">
//                                 {student.name.split(' ').map(n => n[0]).join('')}
//                               </span>
//                             </div>
//                             <div>
//                               <p className="font-medium text-slate-900">{student.name}</p>
//                               <p className="text-xs text-slate-600">{student.studentId}</p>
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <Badge className="bg-green-100 text-green-700 border-green-200">
//                               GPA: {student.gpa.toFixed(2)}
//                             </Badge>
//                             <p className="text-xs text-slate-600 mt-1">
//                               {student.coursesCompleted}/{student.totalCourses} courses
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Failed Students List */}
//                 {mockStudentsForPromotion[selectedLevelForMove].failed.length > 0 && (
//                   <div>
//                     <div className="flex items-center gap-2 mb-3">
//                       <XCircle className="w-5 h-5 text-red-600" />
//                       <h4 className="font-medium text-slate-900">Students Remaining in Current Level</h4>
//                     </div>
//                     <div className="space-y-2 max-h-48 overflow-y-auto">
//                       {mockStudentsForPromotion[selectedLevelForMove].failed.map((student) => (
//                         <div key={student.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-3">
//                               <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
//                                 <span className="text-sm font-medium text-red-700">
//                                   {student.name.split(' ').map(n => n[0]).join('')}
//                                 </span>
//                               </div>
//                               <div>
//                                 <p className="font-medium text-slate-900">{student.name}</p>
//                                 <p className="text-xs text-slate-600">{student.studentId}</p>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <Badge className="bg-red-100 text-red-700 border-red-200">
//                                 GPA: {student.gpa.toFixed(2)}
//                               </Badge>
//                               <p className="text-xs text-slate-600 mt-1">
//                                 {student.coursesCompleted}/{student.totalCourses} courses
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Progress Bar (shown during promotion) */}
//                 {isPromoting && (
//                   <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <TrendingUp className="w-5 h-5 text-blue-600 animate-pulse" />
//                       <span className="font-medium text-slate-900">Processing Promotion...</span>
//                     </div>
//                     <Progress value={promotionProgress} className="h-2" />
//                     <p className="text-xs text-slate-600 mt-2 text-center">{promotionProgress}% Complete</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setShowPromotionDialog(false)}
//               disabled={isPromoting}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={() => selectedLevelForMove && handlePromoteStudents(selectedLevelForMove)}
//               disabled={isPromoting}
//               className="gap-2"
//             >
//               {isPromoting ? (
//                 <>Processing...</>
//               ) : (
//                 <>
//                   <CheckCircle className="w-4 h-4" />
//                   Confirm Promotion
//                 </>
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
