import { useState, useRef, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { SearchableSelect } from '../ui/searchable-select';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import {
  GraduationCap,
  Calculator,
  FileText,
  Download,
  Search,
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Eye,
  ChevronRight,
  Printer,
  BarChart3,
  Filter,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FacultyOption { id: string; name: string; }
interface ProgramOption { id: string; facultyId: string; name: string; }
interface LevelOption { id: string; programId: string; name: string; }

interface CourseGrade {
  code: string;
  name: string;
  creditHours: number;
  grade: string;
  degreeDetails?: string;
}

interface Semester {
  id: string;
  name: string;
  courses: CourseGrade[];
  attemptedHours: number;
  earnedHours: number;
  semesterGPA: number | null;
  cgpa: number | null;
}

interface StudentGPA {
  id: string;
  studentId: string;
  name: string;
  level: string;
  levelId: string;
  programId: string;
  facultyId: string;
  cgpa: number;
  currentSemesterGPA: number | null;
  academicStatus: 'Honors' | 'Good Standing' | 'Warning' | 'Probation';
  gpaCalculated: boolean;
  lastCalculated: string | null;
  email: string;
  semesters: Semester[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADE_POINTS: Record<string, number> = {
  'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0,
  'D-': 0.7, 'F': 0.0, 'P': -1, 'IP': -1, '': -1,
};

function gradeToPoints(grade: string): number {
  return GRADE_POINTS[grade] ?? -1;
}

function formatGPA(gpa: number | null): string {
  if (gpa === null || gpa < 0) return '—';
  return gpa.toFixed(4);
}

function getAcademicStatus(cgpa: number): StudentGPA['academicStatus'] {
  if (cgpa >= 3.7) return 'Honors';
  if (cgpa >= 2.5) return 'Good Standing';
  if (cgpa >= 2.0) return 'Warning';
  return 'Probation';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockFacultiesGPA: FacultyOption[] = [
  { id: 'fac1', name: 'Faculty of Computing & Information Technology' },
  { id: 'fac2', name: 'Faculty of Engineering' },
  { id: 'fac3', name: 'Faculty of Business Administration' },
];

const mockProgramsGPA: ProgramOption[] = [
  { id: 'prog1', facultyId: 'fac1', name: 'Computer Science' },
  { id: 'prog2', facultyId: 'fac1', name: 'Cybersecurity' },
  { id: 'prog3', facultyId: 'fac1', name: 'Information Technology' },
  { id: 'prog4', facultyId: 'fac2', name: 'Civil Engineering' },
  { id: 'prog5', facultyId: 'fac2', name: 'Electrical Engineering' },
  { id: 'prog6', facultyId: 'fac3', name: 'Business Administration' },
  { id: 'prog7', facultyId: 'fac3', name: 'Finance' },
];

const mockLevelsGPA: LevelOption[] = [
  { id: 'lv1_1', programId: 'prog1', name: 'Level 1' },
  { id: 'lv1_2', programId: 'prog1', name: 'Level 2' },
  { id: 'lv1_3', programId: 'prog1', name: 'Level 3' },
  { id: 'lv1_4', programId: 'prog1', name: 'Level 4' },
  { id: 'lv2_1', programId: 'prog2', name: 'Level 1' },
  { id: 'lv2_2', programId: 'prog2', name: 'Level 2' },
  { id: 'lv2_3', programId: 'prog2', name: 'Level 3' },
  { id: 'lv2_4', programId: 'prog2', name: 'Level 4' },
  { id: 'lv3_1', programId: 'prog3', name: 'Level 1' },
  { id: 'lv3_2', programId: 'prog3', name: 'Level 2' },
  { id: 'lv4_1', programId: 'prog4', name: 'Level 1' },
  { id: 'lv4_2', programId: 'prog4', name: 'Level 2' },
  { id: 'lv5_1', programId: 'prog5', name: 'Level 1' },
  { id: 'lv6_1', programId: 'prog6', name: 'Level 1' },
  { id: 'lv7_1', programId: 'prog7', name: 'Level 1' },
];

// Detailed transcript for the primary sample student (Cybersecurity Level 4)
const ahmadSemesters: Semester[] = [
  {
    id: 's1', name: 'Fall 2022-2023',
    courses: [
      { code: '00101N', name: 'Linear Algebra', creditHours: 3, grade: 'A' },
      { code: '00103N', name: 'Introduction to Computer Systems', creditHours: 3, grade: 'B+' },
      { code: '00105N', name: 'Programming I', creditHours: 3, grade: 'A' },
      { code: '00106N', name: 'Probability and Statistics I', creditHours: 3, grade: 'B' },
      { code: '00107N', name: 'Discrete Structures', creditHours: 3, grade: 'B+' },
      { code: '0x004N', name: 'First Aid', creditHours: 2, grade: 'A' },
    ],
    attemptedHours: 17, earnedHours: 17, semesterGPA: 3.5881, cgpa: 3.5881,
  },
  {
    id: 's2', name: 'Spring 2022-2023',
    courses: [
      { code: '00102N', name: 'Calculus', creditHours: 3, grade: 'A' },
      { code: '00104N', name: 'Introduction to Data Sciences', creditHours: 3, grade: 'A-' },
      { code: '02201N', name: 'Introduction to Cybersecurity', creditHours: 3, grade: 'B' },
      { code: '00201N', name: 'Probability and Statistics II', creditHours: 3, grade: 'A' },
      { code: '0x020N', name: 'Communication Skills', creditHours: 2, grade: 'B+' },
      { code: '00110N', name: 'Programming II', creditHours: 3, grade: 'A' },
    ],
    attemptedHours: 17, earnedHours: 17, semesterGPA: 3.6861, cgpa: 3.6371,
  },
  {
    id: 's3', name: 'Fall 2023-2024',
    courses: [
      { code: '0x007N', name: 'Critical Thinking', creditHours: 2, grade: 'A' },
      { code: '00108N', name: 'Data Structures and Algorithms', creditHours: 3, grade: 'A' },
      { code: '00202N', name: 'Introduction to Databases', creditHours: 3, grade: 'A' },
      { code: '02202N', name: 'Number Theory', creditHours: 3, grade: 'A' },
      { code: '00203N', name: 'Numerical Computations', creditHours: 3, grade: 'A' },
      { code: '00109N', name: 'Introduction to Artificial Intelligence', creditHours: 3, grade: 'A' },
    ],
    attemptedHours: 17, earnedHours: 17, semesterGPA: 4.0, cgpa: 3.7581,
  },
  {
    id: 's4', name: 'Spring 2023-2024',
    courses: [
      { code: '00206N', name: 'Data Mining and Analytics', creditHours: 3, grade: 'A-' },
      { code: '00207N', name: 'Computer Networks', creditHours: 3, grade: 'A' },
      { code: '02203N', name: 'Cryptography', creditHours: 3, grade: 'A' },
      { code: '00307N', name: 'Operating Systems', creditHours: 3, grade: 'A' },
      { code: '00305N', name: 'Machine Learning', creditHours: 3, grade: 'A-' },
      { code: '00204N', name: 'Web Programming', creditHours: 3, grade: 'A' },
    ],
    attemptedHours: 18, earnedHours: 18, semesterGPA: 3.8887, cgpa: 3.7921,
  },
  {
    id: 's5', name: 'Fall 2024-2025',
    courses: [
      { code: '0x008N', name: 'Innovation & Entrepreneurship', creditHours: 2, grade: 'A' },
      { code: '00306N', name: 'Cloud Computing', creditHours: 3, grade: 'A' },
      { code: '02304N', name: 'Computer and Network Security', creditHours: 3, grade: 'A' },
      { code: '02303N', name: 'Secure Software Development', creditHours: 3, grade: 'A' },
      { code: '00205N', name: 'Mobile Programming', creditHours: 3, grade: 'A' },
      { code: '01206N', name: 'AI Security Issues', creditHours: 3, grade: 'A' },
    ],
    attemptedHours: 17, earnedHours: 17, semesterGPA: 4.0, cgpa: 3.8332,
  },
  {
    id: 's6', name: 'Spring 2024-2025',
    courses: [
      { code: '02302N', name: 'Operating Systems Security', creditHours: 3, grade: 'B+' },
      { code: '02305N', name: 'Data Integrity and Authentication', creditHours: 3, grade: 'A' },
      { code: '02413N', name: 'Cloud Computing Security', creditHours: 3, grade: 'A' },
      { code: '02412N', name: 'Blockchain Security', creditHours: 3, grade: 'A' },
      { code: '02306N', name: 'Information Security Management', creditHours: 3, grade: 'A' },
      { code: '00301N', name: 'Software Engineering', creditHours: 3, grade: 'A' },
      { code: '0x015N', name: 'Social Issues', creditHours: 0, grade: 'P' },
    ],
    attemptedHours: 18, earnedHours: 18, semesterGPA: 3.8888, cgpa: 3.8429,
  },
  {
    id: 's7', name: 'Fall 2025-2026',
    courses: [
      { code: '02407N', name: 'Law and Cybersecurity', creditHours: 3, grade: 'A' },
      { code: '02406N', name: 'Digital Forensics', creditHours: 3, grade: 'A-' },
      { code: '01404N', name: 'Project I', creditHours: 3, grade: 'A' },
      { code: '02401N', name: 'Social Networks Computing', creditHours: 3, grade: 'A-' },
      { code: '00304N', name: 'Distributed Processing', creditHours: 3, grade: 'A' },
      { code: '02403N', name: 'Human Security', creditHours: 3, grade: 'A' },
    ],
    attemptedHours: 18, earnedHours: 18, semesterGPA: 3.8887, cgpa: 3.8496,
  },
  {
    id: 's8', name: 'Spring 2025-2026',
    courses: [
      { code: '02402N', name: 'Security of Distributed Systems', creditHours: 3, grade: '' },
      { code: '02405N', name: 'Cybersecurity Risk Management', creditHours: 3, grade: '' },
      { code: '02408N', name: 'Project II', creditHours: 3, grade: '' },
      { code: '02410N', name: 'Proactive Computer Security', creditHours: 3, grade: '' },
      { code: '0x009N', name: 'Technical Writing', creditHours: 2, grade: '' },
    ],
    attemptedHours: 14, earnedHours: 0, semesterGPA: null, cgpa: null,
  },
];

const mockStudentsGPA: StudentGPA[] = [
  // Cybersecurity Level 4
  {
    id: 'g1', studentId: 'CS2022101', name: 'Ahmad Al-Rashidi',
    level: 'Level 4', levelId: 'lv2_4', programId: 'prog2', facultyId: 'fac1',
    cgpa: 3.8496, currentSemesterGPA: null, academicStatus: 'Honors',
    gpaCalculated: false, lastCalculated: null,
    email: 'a.rashidi@university.edu',
    semesters: ahmadSemesters,
  },
  {
    id: 'g2', studentId: 'CS2022102', name: 'Fatima Al-Zahra',
    level: 'Level 4', levelId: 'lv2_4', programId: 'prog2', facultyId: 'fac1',
    cgpa: 3.7210, currentSemesterGPA: 3.6500, academicStatus: 'Honors',
    gpaCalculated: true, lastCalculated: '2026-01-15T10:30:00',
    email: 'f.zahra@university.edu',
    semesters: [
      {
        id: 'fs1', name: 'Fall 2022-2023', courses: [
          { code: '00101N', name: 'Linear Algebra', creditHours: 3, grade: 'A-' },
          { code: '00103N', name: 'Introduction to Computer Systems', creditHours: 3, grade: 'A' },
          { code: '00105N', name: 'Programming I', creditHours: 3, grade: 'B+' },
          { code: '00107N', name: 'Discrete Structures', creditHours: 3, grade: 'A-' },
        ], attemptedHours: 12, earnedHours: 12, semesterGPA: 3.75, cgpa: 3.75
      },
      {
        id: 'fs2', name: 'Spring 2022-2023', courses: [
          { code: '00102N', name: 'Calculus', creditHours: 3, grade: 'A' },
          { code: '02201N', name: 'Introduction to Cybersecurity', creditHours: 3, grade: 'A-' },
          { code: '00110N', name: 'Programming II', creditHours: 3, grade: 'B+' },
        ], attemptedHours: 9, earnedHours: 9, semesterGPA: 3.67, cgpa: 3.72
      },
    ],
  },
  {
    id: 'g3', studentId: 'CS2022103', name: 'Omar Hassan',
    level: 'Level 4', levelId: 'lv2_4', programId: 'prog2', facultyId: 'fac1',
    cgpa: 3.5600, currentSemesterGPA: 3.4000, academicStatus: 'Honors',
    gpaCalculated: true, lastCalculated: '2026-01-15T10:31:00',
    email: 'o.hassan@university.edu',
    semesters: [
      {
        id: 'os1', name: 'Fall 2022-2023', courses: [
          { code: '00101N', name: 'Linear Algebra', creditHours: 3, grade: 'B+' },
          { code: '00105N', name: 'Programming I', creditHours: 3, grade: 'A-' },
          { code: '00107N', name: 'Discrete Structures', creditHours: 3, grade: 'B' },
        ], attemptedHours: 9, earnedHours: 9, semesterGPA: 3.43, cgpa: 3.43
      },
    ],
  },
  {
    id: 'g4', studentId: 'CS2022104', name: 'Nour Al-Din',
    level: 'Level 4', levelId: 'lv2_4', programId: 'prog2', facultyId: 'fac1',
    cgpa: 3.1800, currentSemesterGPA: 3.0000, academicStatus: 'Good Standing',
    gpaCalculated: true, lastCalculated: '2026-01-15T10:32:00',
    email: 'n.aldin@university.edu',
    semesters: [
      {
        id: 'ns1', name: 'Fall 2022-2023', courses: [
          { code: '00101N', name: 'Linear Algebra', creditHours: 3, grade: 'B' },
          { code: '00105N', name: 'Programming I', creditHours: 3, grade: 'B+' },
        ], attemptedHours: 6, earnedHours: 6, semesterGPA: 3.15, cgpa: 3.15
      },
    ],
  },
  {
    id: 'g5', studentId: 'CS2022105', name: 'Salma Ibrahim',
    level: 'Level 4', levelId: 'lv2_4', programId: 'prog2', facultyId: 'fac1',
    cgpa: 3.9100, currentSemesterGPA: 4.0000, academicStatus: 'Honors',
    gpaCalculated: false, lastCalculated: null,
    email: 's.ibrahim@university.edu',
    semesters: [
      {
        id: 'si1', name: 'Fall 2022-2023', courses: [
          { code: '00101N', name: 'Linear Algebra', creditHours: 3, grade: 'A' },
          { code: '00105N', name: 'Programming I', creditHours: 3, grade: 'A' },
          { code: '00107N', name: 'Discrete Structures', creditHours: 3, grade: 'A' },
        ], attemptedHours: 9, earnedHours: 9, semesterGPA: 4.0, cgpa: 4.0
      },
    ],
  },
  {
    id: 'g6', studentId: 'CS2022106', name: 'Khalid Mansour',
    level: 'Level 4', levelId: 'lv2_4', programId: 'prog2', facultyId: 'fac1',
    cgpa: 2.4500, currentSemesterGPA: 2.3000, academicStatus: 'Warning',
    gpaCalculated: true, lastCalculated: '2026-01-15T10:33:00',
    email: 'k.mansour@university.edu',
    semesters: [
      {
        id: 'km1', name: 'Fall 2022-2023', courses: [
          { code: '00101N', name: 'Linear Algebra', creditHours: 3, grade: 'C+' },
          { code: '00105N', name: 'Programming I', creditHours: 3, grade: 'C' },
        ], attemptedHours: 6, earnedHours: 6, semesterGPA: 2.15, cgpa: 2.15
      },
    ],
  },
  {
    id: 'g7', studentId: 'CS2022107', name: 'Rania Youssef',
    level: 'Level 4', levelId: 'lv2_4', programId: 'prog2', facultyId: 'fac1',
    cgpa: 1.8000, currentSemesterGPA: 1.5000, academicStatus: 'Probation',
    gpaCalculated: false, lastCalculated: null,
    email: 'r.youssef@university.edu',
    semesters: [
      {
        id: 'ry1', name: 'Fall 2022-2023', courses: [
          { code: '00101N', name: 'Linear Algebra', creditHours: 3, grade: 'D' },
          { code: '00105N', name: 'Programming I', creditHours: 3, grade: 'D+' },
        ], attemptedHours: 6, earnedHours: 6, semesterGPA: 1.15, cgpa: 1.15
      },
    ],
  },
  {
    id: 'g8', studentId: 'CS2022108', name: 'Tarek Mahmoud',
    level: 'Level 4', levelId: 'lv2_4', programId: 'prog2', facultyId: 'fac1',
    cgpa: 3.6700, currentSemesterGPA: 3.8000, academicStatus: 'Honors',
    gpaCalculated: true, lastCalculated: '2026-01-15T10:35:00',
    email: 't.mahmoud@university.edu',
    semesters: [
      {
        id: 'tm1', name: 'Fall 2022-2023', courses: [
          { code: '00101N', name: 'Linear Algebra', creditHours: 3, grade: 'A-' },
          { code: '00105N', name: 'Programming I', creditHours: 3, grade: 'A' },
          { code: '00107N', name: 'Discrete Structures', creditHours: 3, grade: 'A-' },
        ], attemptedHours: 9, earnedHours: 9, semesterGPA: 3.80, cgpa: 3.80
      },
    ],
  },
  // Computer Science Level 3
  {
    id: 'g9', studentId: 'CS2023201', name: 'Layla Al-Ansari',
    level: 'Level 3', levelId: 'lv1_3', programId: 'prog1', facultyId: 'fac1',
    cgpa: 3.5200, currentSemesterGPA: 3.6000, academicStatus: 'Honors',
    gpaCalculated: true, lastCalculated: '2026-01-10T09:00:00',
    email: 'l.ansari@university.edu',
    semesters: [
      {
        id: 'la1', name: 'Fall 2023-2024', courses: [
          { code: 'CS301', name: 'Operating Systems', creditHours: 3, grade: 'A-' },
          { code: 'CS302', name: 'Database Management', creditHours: 3, grade: 'A' },
        ], attemptedHours: 6, earnedHours: 6, semesterGPA: 3.85, cgpa: 3.85
      },
    ],
  },
  {
    id: 'g10', studentId: 'CS2023202', name: 'Hassan Al-Farsi',
    level: 'Level 3', levelId: 'lv1_3', programId: 'prog1', facultyId: 'fac1',
    cgpa: 2.8900, currentSemesterGPA: 2.7000, academicStatus: 'Good Standing',
    gpaCalculated: false, lastCalculated: null,
    email: 'h.farsi@university.edu',
    semesters: [
      {
        id: 'hf1', name: 'Fall 2023-2024', courses: [
          { code: 'CS301', name: 'Operating Systems', creditHours: 3, grade: 'B' },
          { code: 'CS302', name: 'Database Management', creditHours: 3, grade: 'B+' },
        ], attemptedHours: 6, earnedHours: 6, semesterGPA: 3.15, cgpa: 3.15
      },
    ],
  },
  // CS Level 1
  {
    id: 'g11', studentId: 'CS2025301', name: 'Mariam Al-Zaidi',
    level: 'Level 1', levelId: 'lv1_1', programId: 'prog1', facultyId: 'fac1',
    cgpa: 3.9200, currentSemesterGPA: 3.9500, academicStatus: 'Honors',
    gpaCalculated: true, lastCalculated: '2026-01-12T08:00:00',
    email: 'm.zaidi@university.edu',
    semesters: [
      {
        id: 'mz1', name: 'Fall 2025-2026', courses: [
          { code: 'CS101', name: 'Introduction to Programming', creditHours: 3, grade: 'A' },
          { code: 'MATH101', name: 'Calculus I', creditHours: 3, grade: 'A' },
        ], attemptedHours: 6, earnedHours: 6, semesterGPA: 4.0, cgpa: 4.0
      },
    ],
  },
  // Engineering Level 1
  {
    id: 'g12', studentId: 'ENG2025001', name: 'Yousef Al-Balushi',
    level: 'Level 1', levelId: 'lv4_1', programId: 'prog4', facultyId: 'fac2',
    cgpa: 3.4500, currentSemesterGPA: 3.5000, academicStatus: 'Honors',
    gpaCalculated: false, lastCalculated: null,
    email: 'y.balushi@university.edu',
    semesters: [
      {
        id: 'yb1', name: 'Fall 2025-2026', courses: [
          { code: 'ENG101', name: 'Engineering Fundamentals', creditHours: 3, grade: 'B+' },
          { code: 'MATH101', name: 'Calculus I', creditHours: 3, grade: 'A-' },
        ], attemptedHours: 6, earnedHours: 6, semesterGPA: 3.50, cgpa: 3.50
      },
    ],
  },
];

// ─── Status Badge Config ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StudentGPA['academicStatus'] }) {
  const config = {
    Honors: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <Star className="w-3 h-3" /> },
    'Good Standing': { className: 'bg-blue-50 text-blue-700 border-blue-200', icon: <CheckCircle2 className="w-3 h-3" /> },
    Warning: { className: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertTriangle className="w-3 h-3" /> },
    Probation: { className: 'bg-red-50 text-red-700 border-red-200', icon: <AlertTriangle className="w-3 h-3" /> },
  };
  const { className, icon } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {icon}{status}
    </span>
  );
}

function GpaChip({ gpa, size = 'sm' }: { gpa: number | null; size?: 'sm' | 'md' }) {
  if (gpa === null) return <span className="text-slate-400 text-xs italic">Pending</span>;
  const color = gpa >= 3.7 ? 'text-emerald-600' : gpa >= 2.5 ? 'text-blue-600' : gpa >= 2.0 ? 'text-amber-600' : 'text-red-600';
  return <span className={`font-semibold tabular-nums ${size === 'md' ? 'text-base' : 'text-sm'} ${color}`}>{gpa.toFixed(4)}</span>;
}

// ─── Main Component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

export function GpaTranscriptsTab() {
  // Filter state
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  // Table state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'name' | 'cgpa' | 'status'>('cgpa');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Students state (local copy to update GPA calculations)
  const [students, setStudents] = useState<StudentGPA[]>(mockStudentsGPA);

  // Modal state
  const [selectedStudent, setSelectedStudent] = useState<StudentGPA | null>(null);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calcProgress, setCalcProgress] = useState(0);
  const [calcStep, setCalcStep] = useState('');
  const [calcDone, setCalcDone] = useState(false);

  const transcriptRef = useRef<HTMLDivElement>(null);

  // ── Derived filter options ───────────────────────────────────────────────────

  const programOptions = useMemo(() =>
    mockProgramsGPA
      .filter(p => !selectedFaculty || p.facultyId === selectedFaculty)
      .map(p => ({ value: p.id, label: p.name })),
    [selectedFaculty]
  );

  const levelOptions = useMemo(() =>
    mockLevelsGPA
      .filter(l => !selectedProgram || l.programId === selectedProgram)
      .map(l => ({ value: l.id, label: l.name })),
    [selectedProgram]
  );

  const facultyOptions = mockFacultiesGPA.map(f => ({ value: f.id, label: f.name }));

  // ── Filtered & sorted students ───────────────────────────────────────────────

  const filteredStudents = useMemo(() => {
    let list = students.filter(s => {
      if (selectedFaculty && s.facultyId !== selectedFaculty) return false;
      if (selectedProgram && s.programId !== selectedProgram) return false;
      if (selectedLevel && s.levelId !== selectedLevel) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.studentId.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      if (sortField === 'cgpa') cmp = a.cgpa - b.cgpa;
      if (sortField === 'status') cmp = a.academicStatus.localeCompare(b.academicStatus);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [students, selectedFaculty, selectedProgram, selectedLevel, searchQuery, sortField, sortDir]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));

  // ── Stats ────────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    if (filteredStudents.length === 0) return null;
    const cgpas = filteredStudents.map(s => s.cgpa);
    return {
      total: filteredStudents.length,
      avgCGPA: cgpas.reduce((a, b) => a + b, 0) / cgpas.length,
      highestGPA: Math.max(...cgpas),
      honors: filteredStudents.filter(s => s.academicStatus === 'Honors').length,
      probation: filteredStudents.filter(s => s.academicStatus === 'Probation').length,
      warning: filteredStudents.filter(s => s.academicStatus === 'Warning').length,
      uncalculated: filteredStudents.filter(s => !s.gpaCalculated).length,
    };
  }, [filteredStudents]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleFacultyChange = (v: string) => {
    setSelectedFaculty(v);
    setSelectedProgram('');
    setSelectedLevel('');
    setCurrentPage(1);
  };

  const handleProgramChange = (v: string) => {
    setSelectedProgram(v);
    setSelectedLevel('');
    setCurrentPage(1);
  };

  const handleLevelChange = (v: string) => {
    setSelectedLevel(v);
    setCurrentPage(1);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const openTranscript = (student: StudentGPA) => {
    setSelectedStudent(student);
    setShowTranscriptModal(true);
  };

  const handleCalculateGPA = async () => {
    const targets = filteredStudents.filter(s => selectedLevel ? s.levelId === selectedLevel : true);
    setCalculating(true);
    setCalcProgress(0);
    setCalcDone(false);

    const steps = [
      'Fetching enrolled courses...',
      'Loading grade records...',
      'Applying grading scale...',
      'Computing semester GPAs...',
      'Updating cumulative GPAs...',
      'Saving results...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setCalcStep(steps[i]);
      await new Promise(r => setTimeout(r, 500));
      setCalcProgress(Math.round(((i + 1) / steps.length) * 100));
    }

    const now = new Date().toISOString();
    setStudents(prev => prev.map(s =>
      targets.find(t => t.id === s.id)
        ? { ...s, gpaCalculated: true, lastCalculated: now }
        : s
    ));

    setCalcDone(true);
    setCalculating(false);
    toast.success(`GPA calculated for ${targets.length} student${targets.length !== 1 ? 's' : ''}`);
  };

  const handleExportPDF = () => {
    if (!selectedStudent) return;

    const getUniversityName = () => 'Arab International University';
    const facultyName = mockFacultiesGPA.find(f => f.id === selectedStudent.facultyId)?.name ?? '';
    const programName = mockProgramsGPA.find(p => p.id === selectedStudent.programId)?.name ?? '';

    const semesterRows = selectedStudent.semesters.map(sem => {
      const isInProgress = sem.earnedHours === 0 && sem.semesterGPA === null;
      const courseRows = sem.courses.map(c => {
        const gradeCell = c.grade === '' ? '<span style="color:#94a3b8;font-style:italic;">In Progress</span>' :
          c.grade === 'P' ? '<span style="color:#059669;">Pass</span>' : c.grade;
        return `<tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:7px 10px;font-size:11px;color:#374151;font-family:monospace;">${c.code}</td>
          <td style="padding:7px 10px;font-size:11px;color:#111827;">${c.name}</td>
          <td style="padding:7px 10px;font-size:11px;color:#374151;text-align:center;">${c.creditHours}</td>
          <td style="padding:7px 10px;font-size:11px;font-weight:600;text-align:center;">${gradeCell}</td>
        </tr>`;
      }).join('');

      const summaryBar = isInProgress
        ? `<div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:8px 12px;font-size:10.5px;color:#6b7280;font-style:italic;">
             Semester in progress — grades not yet finalized
           </div>`
        : `<div style="background:#f0f9ff;border-top:2px solid #0ea5e9;padding:10px 12px;font-size:10.5px;color:#0369a1;display:flex;gap:24px;flex-wrap:wrap;">
             <span><b>Attempted Hours:</b> ${sem.attemptedHours}</span>
             <span><b>Total Hours Earned:</b> ${sem.earnedHours}</span>
             <span><b>Semester GPA:</b> ${sem.semesterGPA?.toFixed(4) ?? '—'}</span>
             <span><b>Cumulative GPA:</b> ${sem.cgpa?.toFixed(4) ?? '—'}</span>
           </div>`;

      return `<div style="margin-bottom:20px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;page-break-inside:avoid;">
        <div style="background:#1e3a5f;color:white;padding:10px 14px;font-size:12px;font-weight:700;">${sem.name}</div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">
              <th style="padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;">Course Code</th>
              <th style="padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;">Course Name</th>
              <th style="padding:8px 10px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;">Credits</th>
              <th style="padding:8px 10px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;">Grade</th>
            </tr>
          </thead>
          <tbody>${courseRows}</tbody>
        </table>
        ${summaryBar}
      </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Academic Transcript — ${selectedStudent.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; padding: 0; }
    @media print {
      body { padding: 0; }
      @page { margin: 15mm; size: A4; }
    }
  </style>
</head>
<body>
  <div style="max-width:720px;margin:0 auto;padding:24px;">
    <!-- Header -->
    <div style="text-align:center;border-bottom:3px solid #1e3a5f;padding-bottom:20px;margin-bottom:24px;">
      <div style="font-size:22px;font-weight:800;color:#1e3a5f;letter-spacing:0.5px;">${getUniversityName()}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Office of the Registrar</div>
      <div style="font-size:18px;font-weight:700;color:#374151;margin-top:12px;letter-spacing:1px;text-transform:uppercase;">Official Academic Transcript</div>
    </div>

    <!-- Student Info -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:24px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div><span style="font-size:10.5px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Student Name</span><div style="font-size:14px;font-weight:700;color:#111827;margin-top:2px;">${selectedStudent.name}</div></div>
      <div><span style="font-size:10.5px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Student ID</span><div style="font-size:14px;font-weight:700;color:#111827;margin-top:2px;font-family:monospace;">${selectedStudent.studentId}</div></div>
      <div><span style="font-size:10.5px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Faculty</span><div style="font-size:13px;color:#374151;margin-top:2px;">${facultyName}</div></div>
      <div><span style="font-size:10.5px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Program</span><div style="font-size:13px;color:#374151;margin-top:2px;">${programName}</div></div>
      <div><span style="font-size:10.5px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Level</span><div style="font-size:13px;color:#374151;margin-top:2px;">${selectedStudent.level}</div></div>
      <div><span style="font-size:10.5px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Cumulative GPA</span><div style="font-size:14px;font-weight:800;color:#1e3a5f;margin-top:2px;">${selectedStudent.cgpa.toFixed(4)}</div></div>
    </div>

    <!-- Semesters -->
    ${semesterRows}

    <!-- Footer -->
    <div style="margin-top:32px;border-top:2px solid #e2e8f0;padding-top:16px;text-align:center;color:#9ca3af;font-size:10px;">
      This is an official transcript issued by ${getUniversityName()}. Issued on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) { toast.error('Pop-up blocked. Please allow pop-ups for this site.'); return; }
    w.document.write(html);
    w.document.close();
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const hasSelection = selectedFaculty || selectedProgram || selectedLevel;

  const levelName = selectedLevel
    ? mockLevelsGPA.find(l => l.id === selectedLevel)?.name ?? ''
    : '';

  const SortHeader = ({ field, label }: { field: typeof sortField; label: string }) => (
    <button
      className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
      onClick={() => handleSort(field)}
    >
      {label}
      {sortField === field ? (
        <span className="text-blue-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
      ) : (
        <span className="text-slate-300">↕</span>
      )}
    </button>
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">GPA Calculation & Transcripts</h3>
          </div>
          <p className="text-sm text-slate-500 ml-10">
            Calculate semester & cumulative GPA for students and generate official academic transcripts.
          </p>
        </div>
        <Button
          onClick={() => setShowCalculateModal(true)}
          disabled={!hasSelection}
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm shrink-0"
        >
          <Calculator className="w-4 h-4" />
          Calculate GPA
        </Button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Filter Students</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Faculty</label>
              <SearchableSelect
                value={selectedFaculty}
                onValueChange={handleFacultyChange}
                options={facultyOptions}
                placeholder="Select faculty..."
                searchPlaceholder="Search faculties..."
                emptyMessage="No faculty found."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Program</label>
              <SearchableSelect
                value={selectedProgram}
                onValueChange={handleProgramChange}
                options={programOptions}
                placeholder={selectedFaculty ? 'Select program...' : 'Select faculty first...'}
                searchPlaceholder="Search programs..."
                emptyMessage="No program found."
                disabled={!selectedFaculty}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Level</label>
              <SearchableSelect
                value={selectedLevel}
                onValueChange={handleLevelChange}
                options={levelOptions}
                placeholder={selectedProgram ? 'Select level...' : 'Select program first...'}
                searchPlaceholder="Search levels..."
                emptyMessage="No level found."
                disabled={!selectedProgram}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {!hasSelection && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-slate-100 rounded-2xl mb-4">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Select a faculty, program, and level</p>
          <p className="text-slate-400 text-sm mt-1">Use the filters above to load students and their GPA data</p>
        </div>
      )}

      {/* ── Stats Cards ─────────────────────────────────────────────────────── */}
      {hasSelection && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total Students', value: stats.total, icon: <Users className="w-4 h-4" />, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
            { label: 'Average CGPA', value: stats.avgCGPA.toFixed(3), icon: <TrendingUp className="w-4 h-4" />, color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
            { label: 'Highest GPA', value: stats.highestGPA.toFixed(4), icon: <Award className="w-4 h-4" />, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
            { label: 'With Honors', value: stats.honors, icon: <Star className="w-4 h-4" />, color: 'violet', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
            { label: 'Probation', value: stats.probation, icon: <AlertTriangle className="w-4 h-4" />, color: 'red', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
          ].map(({ label, value, icon, bg, text, border }) => (
            <Card key={label} className={`border ${border} ${bg} shadow-none`}>
              <CardContent className="p-4">
                <div className={`flex items-center gap-2 mb-2 ${text}`}>{icon}<span className="text-xs font-medium">{label}</span></div>
                <div className={`text-2xl font-bold ${text}`}>{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Student Table ────────────────────────────────────────────────────── */}
      {hasSelection && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-0 px-5 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  Students
                  {filteredStudents.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-normal">
                      {filteredStudents.length}
                    </span>
                  )}
                </CardTitle>
                {levelName && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {mockProgramsGPA.find(p => p.id === selectedProgram)?.name} • {levelName}
                  </p>
                )}
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  placeholder="Search name or ID..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-9 h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            {filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="p-3 bg-slate-100 rounded-full mb-3">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">No students found</p>
                <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-5 py-3">
                        <SortHeader field="name" label="Student" />
                      </th>
                      <th className="text-center px-4 py-3 hidden md:table-cell">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Level</span>
                      </th>
                      <th className="text-center px-4 py-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sem GPA</span>
                      </th>
                      <th className="text-center px-4 py-3">
                        <SortHeader field="cgpa" label="CGPA" />
                      </th>
                      <th className="text-center px-4 py-3 hidden sm:table-cell">
                        <SortHeader field="status" label="Status" />
                      </th>
                      <th className="text-center px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">GPA Calc</span>
                      </th>
                      <th className="text-right px-5 py-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student, idx) => (
                      <tr
                        key={student.id}
                        className={`border-b border-slate-50 hover:bg-blue-50/40 transition-colors cursor-pointer group ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                        onClick={() => openTranscript(student)}
                      >
                        {/* Student */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                              <span className="text-white text-xs font-semibold">
                                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{student.name}</div>
                              <div className="text-xs text-slate-400 font-mono">{student.studentId}</div>
                            </div>
                          </div>
                        </td>
                        {/* Level */}
                        <td className="px-4 py-3.5 text-center hidden md:table-cell">
                          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{student.level}</span>
                        </td>
                        {/* Semester GPA */}
                        <td className="px-4 py-3.5 text-center">
                          <GpaChip gpa={student.currentSemesterGPA} />
                        </td>
                        {/* CGPA */}
                        <td className="px-4 py-3.5 text-center">
                          <GpaChip gpa={student.cgpa} />
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                          <StatusBadge status={student.academicStatus} />
                        </td>
                        {/* GPA Calc Status */}
                        <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                          {student.gpaCalculated ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                                <CheckCircle2 className="w-3 h-3" />Calculated
                              </span>
                              {student.lastCalculated && (
                                <span className="text-[10px] text-slate-400">
                                  {new Date(student.lastCalculated).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                              <Clock className="w-3 h-3" />Pending
                            </span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 gap-1"
                            onClick={e => { e.stopPropagation(); openTranscript(student); }}
                          >
                            <Eye className="w-3 h-3" />
                            Transcript
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
                    <span className="text-xs text-slate-500">
                      Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredStudents.length)}–{Math.min(currentPage * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <Button key={p} variant={currentPage === p ? 'default' : 'outline'} size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setCurrentPage(p)}>{p}</Button>
                      ))}
                      <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TRANSCRIPT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showTranscriptModal} onOpenChange={setShowTranscriptModal}>
        <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 gap-0">
          {selectedStudent && (
            <>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-5 rounded-t-lg shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap className="w-4 h-4 text-blue-300" />
                      <span className="text-blue-300 text-xs font-medium uppercase tracking-wider">Academic Transcript</span>
                    </div>
                    <h2 className="text-xl font-bold">{selectedStudent.name}</h2>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-slate-300 text-sm font-mono">{selectedStudent.studentId}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 text-sm">{mockProgramsGPA.find(p => p.id === selectedStudent.programId)?.name}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 text-sm">{selectedStudent.level}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400 mb-0.5">Cumulative GPA</div>
                    <div className="text-3xl font-black text-white tabular-nums">{selectedStudent.cgpa.toFixed(4)}</div>
                    <div className="mt-1"><StatusBadge status={selectedStudent.academicStatus} /></div>
                  </div>
                </div>

                {/* Summary pills */}
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {[
                    { label: 'Semesters', value: selectedStudent.semesters.filter(s => s.earnedHours > 0).length },
                    { label: 'Total Earned Hours', value: selectedStudent.semesters.reduce((a, s) => a + s.earnedHours, 0) },
                    { label: 'Faculty', value: mockFacultiesGPA.find(f => f.id === selectedStudent.facultyId)?.name?.split(' ').slice(-1)[0] ?? '' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/10 rounded-lg px-3 py-1.5 text-xs">
                      <span className="text-slate-400">{label}: </span>
                      <span className="font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scrollable Transcript Body */}
              <ScrollArea className="flex-1 min-h-0">
                <div ref={transcriptRef} className="px-6 py-5 space-y-4">
                  <Accordion type="multiple" defaultValue={selectedStudent.semesters.map(s => s.id)} className="space-y-3">
                    {selectedStudent.semesters.map((sem) => {
                      const isInProgress = sem.earnedHours === 0 && sem.semesterGPA === null;
                      return (
                        <AccordionItem
                          key={sem.id}
                          value={sem.id}
                          className="border border-slate-200 rounded-lg overflow-hidden shadow-sm !border-b"
                        >
                          <AccordionTrigger className="px-4 py-3 bg-slate-50 hover:bg-slate-100 hover:no-underline transition-colors !py-3">
                            <div className="flex items-center justify-between w-full pr-2">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                <span className="font-semibold text-slate-800 text-sm">{sem.name}</span>
                                {isInProgress && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-medium">In Progress</span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-slate-500 hidden sm:block">{sem.attemptedHours} hrs</span>
                                {!isInProgress && sem.semesterGPA !== null && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-400 hidden sm:block">GPA:</span>
                                    <GpaChip gpa={sem.semesterGPA} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="!pt-0 !pb-0">
                            {/* Course Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-100">
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide w-28">Code</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Course Name</th>
                                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide w-20">Credits</th>
                                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide w-20">Grade</th>
                                    {sem.courses.some(c => c.degreeDetails !== undefined) && (
                                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Details</th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {sem.courses.map((course, ci) => {
                                    const pts = gradeToPoints(course.grade);
                                    const gradeColor = course.grade === 'P' ? 'text-emerald-600' :
                                      pts >= 3.7 ? 'text-emerald-600' :
                                        pts >= 3.0 ? 'text-blue-600' :
                                          pts >= 2.0 ? 'text-amber-600' :
                                            pts >= 0 ? 'text-red-600' :
                                              'text-slate-400';
                                    return (
                                      <tr key={ci} className={`border-b border-slate-50 ${ci % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                                        <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{course.code}</td>
                                        <td className="px-4 py-2.5 text-sm text-slate-800">{course.name}</td>
                                        <td className="px-4 py-2.5 text-sm text-center text-slate-600">
                                          {course.creditHours === 0 ? <span className="text-slate-300">—</span> : course.creditHours}
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                          {course.grade === '' ? (
                                            <span className="text-xs text-slate-400 italic">IP</span>
                                          ) : (
                                            <span className={`font-bold text-sm ${gradeColor}`}>{course.grade}</span>
                                          )}
                                        </td>
                                        {sem.courses.some(c => c.degreeDetails !== undefined) && (
                                          <td className="px-4 py-2.5 text-center text-xs text-slate-400">{course.degreeDetails ?? '—'}</td>
                                        )}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Semester Summary Footer */}
                            {isInProgress ? (
                              <div className="bg-amber-50 border-t border-amber-100 px-4 py-3">
                                <p className="text-xs text-amber-600 italic flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 shrink-0" />
                                  Semester currently in progress — grades not yet finalized
                                </p>
                              </div>
                            ) : (
                              <div className="bg-blue-50 border-t border-blue-100 px-4 py-3">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {[
                                    { label: 'Attempted Hours', value: sem.attemptedHours },
                                    { label: 'Hours Earned', value: sem.earnedHours },
                                    { label: 'Semester GPA', value: sem.semesterGPA?.toFixed(4) ?? '—' },
                                    { label: 'Cumulative GPA', value: sem.cgpa?.toFixed(4) ?? '—' },
                                  ].map(({ label, value }) => (
                                    <div key={label} className="text-center">
                                      <div className="text-[10px] text-blue-500 font-medium uppercase tracking-wide">{label}</div>
                                      <div className="text-sm font-bold text-slate-800 mt-0.5 tabular-nums">{value}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </ScrollArea>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-lg flex items-center justify-between shrink-0">
                <p className="text-xs text-slate-400">
                  Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowTranscriptModal(false)}>
                    Close
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 h-8 text-xs bg-blue-600 hover:bg-blue-700"
                    onClick={handleExportPDF}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════
          CALCULATE GPA MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showCalculateModal} onOpenChange={v => { if (!calculating) setShowCalculateModal(v); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Calculator className="w-4 h-4 text-blue-600" />
              </div>
              Calculate GPA
            </DialogTitle>
            <DialogDescription>
              {calcDone
                ? 'GPA calculation completed successfully.'
                : 'Calculate semester and cumulative GPA for the selected students.'}
            </DialogDescription>
          </DialogHeader>

          {!calcDone && !calculating && (
            <div className="space-y-4 py-2">
              {/* Scope summary */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2.5">
                {[
                  { label: 'Faculty', value: mockFacultiesGPA.find(f => f.id === selectedFaculty)?.name ?? 'All' },
                  { label: 'Program', value: mockProgramsGPA.find(p => p.id === selectedProgram)?.name ?? 'All' },
                  { label: 'Level', value: levelName || 'All' },
                  { label: 'Students', value: `${filteredStudents.length} student${filteredStudents.length !== 1 ? 's' : ''}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
              {stats && stats.uncalculated > 0 && (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{stats.uncalculated} student{stats.uncalculated !== 1 ? 's have' : ' has'} not been calculated yet in this selection.</span>
                </div>
              )}
            </div>
          )}

          {calculating && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                <span className="text-sm text-slate-600">{calcStep}</span>
              </div>
              <Progress value={calcProgress} className="h-2" />
              <p className="text-xs text-slate-400 text-center">{calcProgress}% complete</p>
            </div>
          )}

          {calcDone && (
            <div className="py-4">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Calculation Complete</p>
                  <p className="text-sm text-slate-500 mt-1">
                    GPA has been successfully calculated for {filteredStudents.length} students.
                  </p>
                </div>
                <div className="w-full bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-left">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-500">Students updated:</span><div className="font-semibold text-emerald-700">{filteredStudents.length}</div></div>
                    <div><span className="text-slate-500">Timestamp:</span><div className="font-semibold text-slate-700">{new Date().toLocaleTimeString()}</div></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {!calcDone ? (
              <>
                <Button variant="outline" onClick={() => setShowCalculateModal(false)} disabled={calculating}>Cancel</Button>
                <Button
                  onClick={handleCalculateGPA}
                  disabled={calculating}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {calculating ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Calculating...</>
                  ) : (
                    <><Calculator className="w-3.5 h-3.5" />Start Calculation</>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => { setShowCalculateModal(false); setCalcDone(false); setCalcProgress(0); }}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
