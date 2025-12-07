import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SearchableSelect } from '../ui/searchable-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Users,
  Upload,
  Mail,
  Phone,
  Edit,
  Trash2,
  GraduationCap,
  Calendar,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface StudentsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

// Grade calculation utility
function calculateGrade(total: number): string {
  if (total >= 90) return 'A';
  if (total >= 85) return 'B+';
  if (total >= 80) return 'B';
  if (total >= 75) return 'C+';
  if (total >= 70) return 'C';
  if (total >= 65) return 'D+';
  if (total >= 60) return 'D';
  return 'F';
}

// Calculate GPA from grade letter
function gradeToGPA(grade: string): number {
  const gradeMap: { [key: string]: number } = {
    'A': 4.0,
    'B+': 3.5,
    'B': 3.0,
    'C+': 2.5,
    'C': 2.0,
    'D+': 1.5,
    'D': 1.0,
    'F': 0.0
  };
  return gradeMap[grade] || 0.0;
}

// Calculate semester GPA and summary
function calculateSemesterSummary(courses: any[]) {
  const totalCredits = courses.reduce((sum, course) => sum + course.creditHours, 0);
  const obtainedHours = courses.filter(course => course.total >= 60).reduce((sum, course) => sum + course.creditHours, 0);

  let totalGradePoints = 0;
  courses.forEach(course => {
    const grade = calculateGrade(course.total);
    const gradePoint = gradeToGPA(grade);
    totalGradePoints += gradePoint * course.creditHours;
  });

  const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';

  return {
    totalCredits,
    obtainedHours,
    gpa
  };
}

// Calculate CGPA across all semesters in a level
function calculateCGPA(levelData: any): string {
  let totalCredits = 0;
  let totalGradePoints = 0;

  levelData.semesters.forEach((semester: any) => {
    semester.courses.forEach((course: any) => {
      const grade = calculateGrade(course.total);
      const gradePoint = gradeToGPA(grade);
      totalGradePoints += gradePoint * course.creditHours;
      totalCredits += course.creditHours;
    });
  });

  return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
}

// Grade Level Section Component with Collapsible Semesters
function GradeLevelSection({ levelData, onUpdateGrade }: { levelData: any; onUpdateGrade: (semesterIndex: number, courseIndex: number, newTotal: number) => void }) {
  const [openSemesters, setOpenSemesters] = useState<{ [key: string]: boolean }>({});

  const toggleSemester = (semesterName: string) => {
    setOpenSemesters(prev => ({
      ...prev,
      [semesterName]: !prev[semesterName]
    }));
  };

  const cgpa = calculateCGPA(levelData);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{levelData.level}</CardTitle>
          <Badge variant="default" className="gap-1">
            CGPA: {cgpa}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {levelData.semesters.map((semester: any, semesterIndex: number) => {
          const summary = calculateSemesterSummary(semester.courses);

          return (
            <div key={semesterIndex} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSemester(semester.name)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {openSemesters[semester.name] ? (
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  )}
                  <span className="text-slate-900">{semester.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{semester.courses.length} Courses</Badge>
                  <Badge variant="secondary">GPA: {summary.gpa}</Badge>
                </div>
              </button>

              {openSemesters[semester.name] && (
                <div className="p-4 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Course Code</TableHead>
                        <TableHead className="text-center">Credit Hours</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {semester.courses.map((course: any, courseIndex: number) => {
                        const grade = calculateGrade(course.total);
                        return (
                          <TableRow key={courseIndex}>
                            <TableCell>{course.name}</TableCell>
                            <TableCell className="text-slate-600">{course.code}</TableCell>
                            <TableCell className="text-center">{course.creditHours}</TableCell>
                            <TableCell className="text-center">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={course.total}
                                onChange={(e) => {
                                  const newTotal = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                  onUpdateGrade(semesterIndex, courseIndex, newTotal);
                                }}
                                className="w-20 text-center mx-auto"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  grade.startsWith('A') ? 'default' :
                                    grade.startsWith('B') ? 'secondary' :
                                      grade === 'F' ? 'destructive' :
                                        'outline'
                                }
                              >
                                {grade}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {/* Summary Row */}
                      <TableRow className="bg-slate-50 border-t-2 border-slate-300">
                        <TableCell colSpan={2} className="text-right">
                          <span className="text-slate-900">Summary:</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-slate-900">Total Credits: {summary.totalCredits}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-slate-900">Obtained: {summary.obtainedHours}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default">GPA: {summary.gpa}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default">CGPA: {summary.gpa}</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function StudentsPage({ selectedUniversity }: StudentsPageProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDialogTab, setEditDialogTab] = useState('personal-info');
  const [showGradesTab, setShowGradesTab] = useState(false); // Control whether to show grades tab
  const [gradesModified, setGradesModified] = useState(false); // Track if grades have been modified
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('all-students');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);

  // Assignment filters with search
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [assignmentFilters, setAssignmentFilters] = useState({
    program: 'all',
    level: 'all'
  });

  // All Students tab filters
  const [allStudentsSearch, setAllStudentsSearch] = useState('');
  const [allStudentsFilters, setAllStudentsFilters] = useState({
    program: 'all',
    level: 'all',
    status: 'all'
  });

  // Edit student state
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editStudent, setEditStudent] = useState({
    studentId: '',
    name: '',
    religion: '',
    type: '',
    nationalId: '',
    passport: '',
    enrollmentDate: '',
    address: '',
    homePhone: '',
    mobilePhone: '',
    email: '',
    previousQualification: '',
    program: '',
    level: '',
    status: 'Active'
  });

  // Form state for adding new student - updated with all new fields
  const [newStudent, setNewStudent] = useState({
    studentId: '',
    name: '',
    religion: '',
    type: '',
    nationalId: '',
    passport: '',
    enrollmentDate: '',
    address: '',
    homePhone: '',
    mobilePhone: '',
    email: '',
    previousQualification: ''
  });

  // Mock student data with new fields
  const [students, setStudents] = useState([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@student.anu.edu.eg',
      mobilePhone: '+20 10 123 4567',
      homePhone: '+20 2 123 4567',
      studentId: '20210001',
      nationalId: '29501012345678',
      passport: 'A12345678',
      program: 'Computer Science',
      level: 'Level 3',
      religion: 'Muslim',
      type: 'Male',
      gpa: 3.8,
      status: 'Active',
      enrollmentDate: '2021-09-01',
      address: '123 Main St, Alexandria',
      previousQualification: 'High School - 95%'
    },
    {
      id: '2',
      name: 'Sarah Ahmed',
      email: 'sarah.ahmed@student.anu.edu.eg',
      mobilePhone: '+20 10 123 4568',
      homePhone: '+20 2 123 4568',
      studentId: '20220015',
      nationalId: '30001234567890',
      passport: 'B23456789',
      program: 'Mathematics',
      level: 'Level 2',
      religion: 'Muslim',
      type: 'Female',
      gpa: 3.9,
      status: 'Active',
      enrollmentDate: '2022-09-01',
      address: '456 Park Ave, Cairo',
      previousQualification: 'High School - 98%'
    },
    {
      id: '3',
      name: 'Mohamed Ali',
      email: 'mohamed.ali@student.anu.edu.eg',
      mobilePhone: '+20 10 123 4569',
      homePhone: '+20 2 123 4569',
      studentId: '20200078',
      nationalId: '29801234567891',
      passport: '',
      program: 'Physics',
      level: 'Level 4',
      religion: 'Muslim',
      type: 'Male',
      gpa: 3.6,
      status: 'Active',
      enrollmentDate: '2020-09-01',
      address: '789 University Rd, Giza',
      previousQualification: 'High School - 92%'
    }
  ]);

  const programs = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Business Administration'];
  const levelOptions = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];
  const religionOptions = [
    { value: '1', label: 'Muslim' },
    { value: '2', label: 'Christian' }
  ];
  const typeOptions = [
    { value: '1', label: 'Male' },
    { value: '2', label: 'Female' }
  ];

  // Mock grades data - organized by student ID (now with state for editing)
  const [studentGradesData, setStudentGradesData] = useState<{ [key: string]: any }>({
    '1': [ // John Doe
      {
        level: 'Level 1',
        semesters: [
          {
            name: 'Fall 2021',
            courses: [
              { name: 'Introduction to Programming', code: 'CS101', creditHours: 3, total: 92, grade: 'A' },
              { name: 'Calculus I', code: 'MATH101', creditHours: 3, total: 88, grade: 'A-' },
              { name: 'Physics I', code: 'PHYS101', creditHours: 3, total: 85, grade: 'B+' },
              { name: 'English Composition', code: 'ENG101', creditHours: 2, total: 90, grade: 'A' }
            ]
          },
          {
            name: 'Spring 2022',
            courses: [
              { name: 'Data Structures', code: 'CS102', creditHours: 3, total: 94, grade: 'A' },
              { name: 'Calculus II', code: 'MATH102', creditHours: 3, total: 87, grade: 'A-' },
              { name: 'Physics II', code: 'PHYS102', creditHours: 3, total: 83, grade: 'B+' },
              { name: 'Digital Logic', code: 'CS103', creditHours: 3, total: 91, grade: 'A' }
            ]
          }
        ]
      },
      {
        level: 'Level 2',
        semesters: [
          {
            name: 'Fall 2022',
            courses: [
              { name: 'Algorithms', code: 'CS201', creditHours: 3, total: 89, grade: 'A-' },
              { name: 'Database Systems', code: 'CS202', creditHours: 3, total: 92, grade: 'A' },
              { name: 'Computer Architecture', code: 'CS203', creditHours: 3, total: 86, grade: 'B+' },
              { name: 'Discrete Mathematics', code: 'MATH201', creditHours: 3, total: 88, grade: 'A-' }
            ]
          },
          {
            name: 'Spring 2023',
            courses: [
              { name: 'Operating Systems', code: 'CS204', creditHours: 3, total: 90, grade: 'A' },
              { name: 'Web Development', code: 'CS205', creditHours: 3, total: 95, grade: 'A+' },
              { name: 'Software Engineering', code: 'CS206', creditHours: 3, total: 87, grade: 'A-' },
              { name: 'Linear Algebra', code: 'MATH202', creditHours: 3, total: 84, grade: 'B+' }
            ]
          }
        ]
      },
      {
        level: 'Level 3',
        semesters: [
          {
            name: 'Fall 2023',
            courses: [
              { name: 'Artificial Intelligence', code: 'CS301', creditHours: 3, total: 93, grade: 'A' },
              { name: 'Computer Networks', code: 'CS302', creditHours: 3, total: 88, grade: 'A-' },
              { name: 'Machine Learning', code: 'CS303', creditHours: 3, total: 91, grade: 'A' },
              { name: 'Probability & Statistics', code: 'MATH301', creditHours: 3, total: 85, grade: 'B+' }
            ]
          }
        ]
      }
    ],
    '2': [ // Sarah Ahmed
      {
        level: 'Level 1',
        semesters: [
          {
            name: 'Fall 2022',
            courses: [
              { name: 'Calculus I', code: 'MATH101', creditHours: 3, total: 96, grade: 'A+' },
              { name: 'Linear Algebra', code: 'MATH102', creditHours: 3, total: 94, grade: 'A' },
              { name: 'Physics I', code: 'PHYS101', creditHours: 3, total: 92, grade: 'A' },
              { name: 'English Composition', code: 'ENG101', creditHours: 2, total: 95, grade: 'A+' }
            ]
          },
          {
            name: 'Spring 2023',
            courses: [
              { name: 'Calculus II', code: 'MATH103', creditHours: 3, total: 97, grade: 'A+' },
              { name: 'Abstract Algebra', code: 'MATH104', creditHours: 3, total: 93, grade: 'A' },
              { name: 'Differential Equations', code: 'MATH105', creditHours: 3, total: 95, grade: 'A+' },
              { name: 'Programming for Math', code: 'CS101', creditHours: 2, total: 90, grade: 'A' }
            ]
          }
        ]
      },
      {
        level: 'Level 2',
        semesters: [
          {
            name: 'Fall 2023',
            courses: [
              { name: 'Real Analysis', code: 'MATH201', creditHours: 3, total: 94, grade: 'A' },
              { name: 'Number Theory', code: 'MATH202', creditHours: 3, total: 96, grade: 'A+' },
              { name: 'Topology', code: 'MATH203', creditHours: 3, total: 92, grade: 'A' },
              { name: 'Mathematical Logic', code: 'MATH204', creditHours: 3, total: 91, grade: 'A' }
            ]
          }
        ]
      }
    ],
    '3': [ // Mohamed Ali
      {
        level: 'Level 1',
        semesters: [
          {
            name: 'Fall 2020',
            courses: [
              { name: 'General Physics I', code: 'PHYS101', creditHours: 3, total: 85, grade: 'B+' },
              { name: 'Calculus I', code: 'MATH101', creditHours: 3, total: 83, grade: 'B+' },
              { name: 'Chemistry I', code: 'CHEM101', creditHours: 3, total: 88, grade: 'A-' },
              { name: 'English', code: 'ENG101', creditHours: 2, total: 80, grade: 'B' }
            ]
          }
        ]
      },
      {
        level: 'Level 2',
        semesters: [
          {
            name: 'Fall 2021',
            courses: [
              { name: 'Electromagnetism', code: 'PHYS201', creditHours: 3, total: 87, grade: 'A-' },
              { name: 'Quantum Mechanics I', code: 'PHYS202', creditHours: 3, total: 84, grade: 'B+' },
              { name: 'Thermodynamics', code: 'PHYS203', creditHours: 3, total: 89, grade: 'A-' },
              { name: 'Mathematical Methods', code: 'MATH201', creditHours: 3, total: 82, grade: 'B+' }
            ]
          }
        ]
      },
      {
        level: 'Level 3',
        semesters: [
          {
            name: 'Fall 2022',
            courses: [
              { name: 'Quantum Mechanics II', code: 'PHYS301', creditHours: 3, total: 86, grade: 'B+' },
              { name: 'Statistical Mechanics', code: 'PHYS302', creditHours: 3, total: 88, grade: 'A-' },
              { name: 'Solid State Physics', code: 'PHYS303', creditHours: 3, total: 85, grade: 'B+' },
              { name: 'Advanced Lab', code: 'PHYS304', creditHours: 2, total: 90, grade: 'A' }
            ]
          }
        ]
      },
      {
        level: 'Level 4',
        semesters: [
          {
            name: 'Fall 2023',
            courses: [
              { name: 'Particle Physics', code: 'PHYS401', creditHours: 3, total: 84, grade: 'B+' },
              { name: 'Nuclear Physics', code: 'PHYS402', creditHours: 3, total: 87, grade: 'A-' },
              { name: 'Astrophysics', code: 'PHYS403', creditHours: 3, total: 89, grade: 'A-' },
              { name: 'Senior Project', code: 'PHYS404', creditHours: 3, total: 91, grade: 'A' }
            ]
          }
        ]
      }
    ]
  });

  // Handle file upload for import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'text/csv' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.csv')) {
        setImportFile(file);
        toast.success(`File "${file.name}" selected for import`);
      } else {
        toast.error('Please select a valid Excel (.xlsx) or CSV file');
      }
    }
  };

  // Simulate import process
  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    // Check if program and level are selected for auto-assignment
    if (assignmentFilters.program === 'all' || assignmentFilters.level === 'all') {
      toast.error('Please select a Program and Level to assign imported students');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    // Simulate import progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setImportProgress(i);
    }

    // Simulate adding imported students with auto-assignment to selected program and level
    const importedStudents = [
      {
        id: String(students.length + 1),
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@student.anu.edu.eg',
        mobilePhone: '+20 10 987 6543',
        homePhone: '',
        studentId: '20240001',
        nationalId: '30101234567892',
        passport: '',
        program: assignmentFilters.program, // Auto-assigned
        level: assignmentFilters.level, // Auto-assigned
        religion: 'Muslim',
        type: 'Male',
        gpa: 0.0,
        status: 'Active',
        enrollmentDate: new Date().toISOString().split('T')[0],
        address: '',
        previousQualification: ''
      },
      {
        id: String(students.length + 2),
        name: 'Fatima Mohamed',
        email: 'fatima.mohamed@student.anu.edu.eg',
        mobilePhone: '+20 10 876 5432',
        homePhone: '',
        studentId: '20240002',
        nationalId: '30201234567893',
        passport: '',
        program: assignmentFilters.program, // Auto-assigned
        level: assignmentFilters.level, // Auto-assigned
        religion: 'Muslim',
        type: 'Female',
        gpa: 0.0,
        status: 'Active',
        enrollmentDate: new Date().toISOString().split('T')[0],
        address: '',
        previousQualification: ''
      }
    ];

    setStudents(prev => [...prev, ...importedStudents]);
    setIsImporting(false);
    setShowImportModal(false);
    setImportFile(null);
    setImportProgress(0);
    toast.success(`Successfully imported ${importedStudents.length} students to ${assignmentFilters.program} - ${assignmentFilters.level}`);
  };

  // Handle adding new student manually
  const handleAddStudent = () => {
    // Validation - only Student ID, Name, and Enrollment Date are required
    if (!newStudent.studentId || !newStudent.name || !newStudent.enrollmentDate) {
      toast.error('Please fill in all required fields (Student ID, Name, Enrollment Date)');
      return;
    }

    // Check if program and level are selected for auto-assignment
    if (assignmentFilters.program === 'all' || assignmentFilters.level === 'all') {
      toast.error('Please select a Program and Level in the filter to assign the student');
      return;
    }

    // Check for duplicate Student ID
    const duplicateStudentId = students.find(s => s.studentId === newStudent.studentId);

    if (duplicateStudentId) {
      toast.error('Student ID already exists');
      return;
    }

    // Convert religion and type from enum to readable format
    const getReligionLabel = (value: string) => {
      if (value === '1') return 'Muslim';
      if (value === '2') return 'Christian';
      return '';
    };

    const getTypeLabel = (value: string) => {
      if (value === '1') return 'Male';
      if (value === '2') return 'Female';
      return '';
    };

    const student = {
      id: String(students.length + 1),
      studentId: newStudent.studentId,
      name: newStudent.name,
      religion: getReligionLabel(newStudent.religion),
      type: getTypeLabel(newStudent.type),
      nationalId: newStudent.nationalId || '',
      passport: newStudent.passport || '',
      enrollmentDate: newStudent.enrollmentDate,
      address: newStudent.address || '',
      homePhone: newStudent.homePhone || '',
      mobilePhone: newStudent.mobilePhone || '',
      email: newStudent.email || '',
      previousQualification: newStudent.previousQualification || '',
      program: assignmentFilters.program, // Auto-assigned from filter
      level: assignmentFilters.level, // Auto-assigned from filter
      gpa: 0.0,
      status: 'Active'
    };

    setStudents(prev => [...prev, student]);
    setNewStudent({
      studentId: '',
      name: '',
      religion: '',
      type: '',
      nationalId: '',
      passport: '',
      enrollmentDate: '',
      address: '',
      homePhone: '',
      mobilePhone: '',
      email: '',
      previousQualification: ''
    });
    setShowAddModal(false);
    toast.success(`Student added successfully to ${assignmentFilters.program} - ${assignmentFilters.level}`);
  };

  // Download template
  const downloadTemplate = () => {
    const templateData = [
      ['Student ID', 'Name', 'Religion (1=Muslim, 2=Christian)', 'Type (1=Male, 2=Female)', 'National ID', 'Passport', 'Enrollment Date', 'Address', 'Home Phone', 'Mobile Phone', 'Email', 'Previous Qualification'],
      ['20240001', 'John Doe', '1', '1', '29501012345678', 'A12345678', '2024-09-01', '123 Main St', '+20 2 123 4567', '+20 10 123 4567', 'john.doe@student.anu.edu.eg', 'High School - 95%'],
      ['20240002', 'Sarah Ahmed', '1', '2', '30001234567890', 'B23456789', '2024-09-01', '456 Park Ave', '+20 2 123 4568', '+20 10 123 4568', 'sarah.ahmed@student.anu.edu.eg', 'High School - 98%']
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded successfully');
  };

  // Filter students for assignment
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      student.studentId.toLowerCase().includes(assignmentSearch.toLowerCase());

    const matchesProgram = assignmentFilters.program === 'all' || student.program === assignmentFilters.program;
    const matchesLevel = assignmentFilters.level === 'all' || student.level === assignmentFilters.level;

    return matchesSearch && matchesProgram && matchesLevel;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage);

  // Handle assignment
  const handleAssignStudents = () => {
    if (assignmentFilters.program === 'all' || assignmentFilters.level === 'all') {
      toast.error('Please select specific program and level for assignment');
      return;
    }

    const assignedCount = filteredStudents.length;

    // Update students with assignment
    setStudents(prev => prev.map(student => {
      if (filteredStudents.find(filtered => filtered.id === student.id)) {
        return {
          ...student,
          program: assignmentFilters.program,
          level: assignmentFilters.level,
          status: 'Assigned'
        };
      }
      return student;
    }));

    toast.success(`Successfully assigned ${assignedCount} students to ${assignmentFilters.program} - ${assignmentFilters.level}`);
  };

  // Clear all students
  const handleClearAllStudents = () => {
    setStudents([]);
    setCurrentPage(1);
    setAssignmentFilters({ program: 'all', level: 'all' });
    toast.success('All students cleared successfully');
  };

  // Open edit modal with student data (from "All Students" tab - show grades)
  const handleEditClick = (student: any, showGrades: boolean = true) => {
    setSelectedStudent(student);
    setShowGradesTab(showGrades); // Control whether to show grades tab
    setEditDialogTab('personal-info'); // Reset to personal info tab
    setGradesModified(false); // Reset grades modified flag

    // Convert display values back to enum values for selects
    const getReligionValue = (label: string) => {
      if (label === 'Muslim') return '1';
      if (label === 'Christian') return '2';
      return '';
    };

    const getTypeValue = (label: string) => {
      if (label === 'Male') return '1';
      if (label === 'Female') return '2';
      return '';
    };

    setEditStudent({
      studentId: student.studentId,
      name: student.name,
      religion: getReligionValue(student.religion),
      type: getTypeValue(student.type),
      nationalId: student.nationalId || '',
      passport: student.passport || '',
      enrollmentDate: student.enrollmentDate,
      address: student.address || '',
      homePhone: student.homePhone || '',
      mobilePhone: student.mobilePhone || '',
      email: student.email || '',
      previousQualification: student.previousQualification || '',
      program: student.program,
      level: student.level,
      status: student.status
    });
    setShowEditModal(true);
  };

  // Handle updating student
  const handleUpdateStudent = () => {
    if (!editStudent.studentId || !editStudent.name || !editStudent.enrollmentDate) {
      toast.error('Please fill in all required fields (Student ID, Name, Enrollment Date)');
      return;
    }

    // Convert religion and type from enum to readable format
    const getReligionLabel = (value: string) => {
      if (value === '1') return 'Muslim';
      if (value === '2') return 'Christian';
      return '';
    };

    const getTypeLabel = (value: string) => {
      if (value === '1') return 'Male';
      if (value === '2') return 'Female';
      return '';
    };

    setStudents(prev => prev.map(s =>
      s.id === selectedStudent.id
        ? {
          ...s,
          studentId: editStudent.studentId,
          name: editStudent.name,
          religion: getReligionLabel(editStudent.religion),
          type: getTypeLabel(editStudent.type),
          nationalId: editStudent.nationalId,
          passport: editStudent.passport,
          enrollmentDate: editStudent.enrollmentDate,
          address: editStudent.address,
          homePhone: editStudent.homePhone,
          mobilePhone: editStudent.mobilePhone,
          email: editStudent.email,
          previousQualification: editStudent.previousQualification,
          program: editStudent.program,
          level: editStudent.level,
          status: editStudent.status
        }
        : s
    ));

    setShowEditModal(false);
    setSelectedStudent(null);
    toast.success('Student updated successfully');
  };

  // Toggle student status
  const handleToggleStatus = (studentId: string) => {
    setStudents(prev => prev.map(s =>
      s.id === studentId
        ? { ...s, status: s.status === 'Active' ? 'Deactivated' : 'Active' }
        : s
    ));
    toast.success('Student status updated');
  };

  // Remove student
  const handleRemoveStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    toast.success('Student removed successfully');
  };

  // Update grade for a specific course
  const handleUpdateGrade = (levelIndex: number, semesterIndex: number, courseIndex: number, newTotal: number) => {
    if (!selectedStudent) return;

    setStudentGradesData(prev => {
      const updated = { ...prev };
      if (updated[selectedStudent.id]) {
        const levelData = [...updated[selectedStudent.id]];
        const semester = { ...levelData[levelIndex].semesters[semesterIndex] };
        const courses = [...semester.courses];
        courses[courseIndex] = { ...courses[courseIndex], total: newTotal };
        semester.courses = courses;
        levelData[levelIndex] = { ...levelData[levelIndex], semesters: [...levelData[levelIndex].semesters] };
        levelData[levelIndex].semesters[semesterIndex] = semester;
        updated[selectedStudent.id] = levelData;
      }
      return updated;
    });

    // Mark grades as modified
    setGradesModified(true);
  };

  // Submit grade changes
  const handleSubmitGrades = () => {
    if (!selectedStudent || !gradesModified) return;

    // Here you would normally send the updated grades to the backend
    // For now, we'll just show a success message

    toast.success('Grades updated successfully');
    setGradesModified(false);
  };

  // Filter students for "All Students" tab
  const allStudentsFiltered = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(allStudentsSearch.toLowerCase()) ||
      student.studentId.toLowerCase().includes(allStudentsSearch.toLowerCase());

    const matchesProgram = allStudentsFilters.program === 'all' || student.program === allStudentsFilters.program;
    const matchesLevel = allStudentsFilters.level === 'all' || student.level === allStudentsFilters.level;
    const matchesStatus = allStudentsFilters.status === 'all' || student.status === allStudentsFilters.status;

    return matchesSearch && matchesProgram && matchesLevel && matchesStatus;
  });

  // Pagination for All Students
  const allStudentsTotalPages = Math.ceil(allStudentsFiltered.length / studentsPerPage);
  const allStudentsStartIndex = (currentPage - 1) * studentsPerPage;
  const allStudentsPaginated = allStudentsFiltered.slice(allStudentsStartIndex, allStudentsStartIndex + studentsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-slate-900">Student Management</h2>
        <p className="text-slate-600 mt-1">
          Manage student records and enrollment
          {selectedUniversity && (
            <span className="text-blue-600"> • Filtered by selected university</span>
          )}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="all-students">All Students</TabsTrigger>
          <TabsTrigger value="assign-students">Assign Students</TabsTrigger>
        </TabsList>

        {/* Tab 1: All Students */}
        <TabsContent value="all-students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Students</CardTitle>
              <CardDescription>
                View and manage all assigned students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="space-y-4 mb-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search by student name or student university ID..."
                    value={allStudentsSearch}
                    onChange={(e) => setAllStudentsSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Filter by Program</Label>
                    <Select
                      value={allStudentsFilters.program}
                      onValueChange={(value) => setAllStudentsFilters(prev => ({ ...prev, program: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Programs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {programs.map((program) => (
                          <SelectItem key={program} value={program}>
                            {program}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Filter by Level</Label>
                    <Select
                      value={allStudentsFilters.level}
                      onValueChange={(value) => setAllStudentsFilters(prev => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {levelOptions.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Filter by Status</Label>
                    <Select
                      value={allStudentsFilters.status}
                      onValueChange={(value) => setAllStudentsFilters(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Deactivated">Deactivated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Students per page</Label>
                    <Select
                      value={studentsPerPage.toString()}
                      onValueChange={(value) => {
                        setStudentsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Showing {allStudentsFiltered.length} of {students.length} students
                  </div>
                </div>
              </div>

              {/* Students List */}
              {allStudentsFiltered.length > 0 ? (
                <div className="space-y-4">
                  {allStudentsPaginated.map((student) => (
                    <div key={student.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-slate-900">{student.name}</h4>
                                <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                                  {student.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600">ID: {student.studentId} • {student.program}</p>
                            </div>
                            <Badge variant="outline">{student.level}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                            {student.email && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="w-4 h-4" />
                                {student.email}
                              </div>
                            )}
                            {student.mobilePhone && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="w-4 h-4" />
                                {student.mobilePhone}
                              </div>
                            )}
                            {student.nationalId && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <FileText className="w-4 h-4" />
                                National ID: {student.nationalId}
                              </div>
                            )}
                            {student.type && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <GraduationCap className="w-4 h-4" />
                                {student.type}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                              Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => handleEditClick(student, true)}
                              >
                                <Edit className="w-3 h-3" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-red-600 hover:text-red-700"
                                onClick={() => handleRemoveStudent(student.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {allStudentsTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-slate-600">
                        Page {currentPage} of {allStudentsTotalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(allStudentsTotalPages, prev + 1))}
                          disabled={currentPage === allStudentsTotalPages}
                          className="gap-1"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg text-slate-900 mb-2">No Students Found</h3>
                  <p className="text-slate-600 mb-4">
                    {students.length === 0
                      ? "Add or import students in the 'Assign Students' tab to get started."
                      : "No students match your current filters."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Assign Students */}
        <TabsContent value="assign-students" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assign Students</CardTitle>
                  <CardDescription>
                    Filter and assign students to programs and academic levels
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Upload className="w-4 h-4" />
                        Import Students
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Import Students</DialogTitle>
                        <DialogDescription>
                          Upload an Excel or CSV file containing student data
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {!isImporting ? (
                          <>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                              <div className="space-y-2">
                                <h4>Select file to import</h4>
                                <p className="text-sm text-slate-600">Excel (.xlsx) or CSV files only</p>
                              </div>
                              <input
                                type="file"
                                accept=".xlsx,.csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                              />
                              <label htmlFor="file-upload" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 mt-4 cursor-pointer">
                                Choose File
                              </label>
                            </div>

                            {importFile && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-sm text-green-900">
                                    {importFile.name}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div className="text-sm text-blue-900">
                                  <p className="mb-1">Required columns:</p>
                                  <p>Student ID (required), Name (required), Enrollment Date (required)</p>
                                  <p className="mt-2">Note: Religion (1=Muslim, 2=Christian), Type (1=Male, 2=Female)</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={downloadTemplate}
                                variant="outline"
                                className="flex-1 gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                Download Template
                              </Button>
                              <Button
                                onClick={handleImport}
                                disabled={!importFile}
                                className="flex-1"
                              >
                                Import Students
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <Upload className="w-6 h-6 text-blue-600" />
                              </div>
                              <h4 className="mb-2">Importing Students...</h4>
                              <p className="text-sm text-slate-600">
                                Processing {importFile?.name}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{importProgress}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${importProgress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                        <DialogDescription>
                          Enter student information. Student ID, Name, and Enrollment Date are required.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="studentId">Student ID *</Label>
                          <Input
                            id="studentId"
                            placeholder="e.g., 20240001"
                            value={newStudent.studentId}
                            onChange={(e) => setNewStudent(prev => ({ ...prev, studentId: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name">Student Name *</Label>
                          <Input
                            id="name"
                            placeholder="Enter full name"
                            value={newStudent.name}
                            onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="religion">Religion</Label>
                          <Select onValueChange={(value) => setNewStudent(prev => ({ ...prev, religion: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select religion" />
                            </SelectTrigger>
                            <SelectContent>
                              {religionOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">Type</Label>
                          <Select onValueChange={(value) => setNewStudent(prev => ({ ...prev, type: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {typeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nationalId">National ID</Label>
                          <Input
                            id="nationalId"
                            placeholder="14-digit National ID"
                            maxLength={14}
                            value={newStudent.nationalId}
                            onChange={(e) => setNewStudent(prev => ({ ...prev, nationalId: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="passport">Passport</Label>
                          <Input
                            id="passport"
                            placeholder="Passport number"
                            value={newStudent.passport}
                            onChange={(e) => setNewStudent(prev => ({ ...prev, passport: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
                          <Input
                            id="enrollmentDate"
                            type="date"
                            value={newStudent.enrollmentDate}
                            onChange={(e) => setNewStudent(prev => ({ ...prev, enrollmentDate: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            placeholder="Full address"
                            value={newStudent.address}
                            onChange={(e) => setNewStudent(prev => ({ ...prev, address: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="homePhone">Home Phone</Label>
                          <Input
                            id="homePhone"
                            placeholder="+20 2 123 4567"
                            value={newStudent.homePhone}
                            onChange={(e) => setNewStudent(prev => ({ ...prev, homePhone: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mobilePhone">Mobile Phone</Label>
                          <Input
                            id="mobilePhone"
                            placeholder="+20 10 123 4567"
                            value={newStudent.mobilePhone}
                            onChange={(e) => setNewStudent(prev => ({ ...prev, mobilePhone: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="student@university.edu"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="previousQualification">Previous Qualification</Label>
                          <Input
                            id="previousQualification"
                            placeholder="e.g., High School - 95%"
                            value={newStudent.previousQualification}
                            onChange={(e) => setNewStudent(prev => ({ ...prev, previousQualification: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowAddModal(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddStudent}
                          className="flex-1"
                        >
                          Add Student
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Assignment Filters */}
              <div className="space-y-4 mb-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search by student name or student university ID..."
                    value={assignmentSearch}
                    onChange={(e) => setAssignmentSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters and Actions */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Filter by Program</Label>
                    <Select
                      value={assignmentFilters.program}
                      onValueChange={(value) => setAssignmentFilters(prev => ({ ...prev, program: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Programs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {programs.map((program) => (
                          <SelectItem key={program} value={program}>
                            {program}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Filter by Level</Label>
                    <Select
                      value={assignmentFilters.level}
                      onValueChange={(value) => setAssignmentFilters(prev => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {levelOptions.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Students per page</Label>
                    <Select
                      value={studentsPerPage.toString()}
                      onValueChange={(value) => {
                        setStudentsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button
                      onClick={handleAssignStudents}
                      disabled={filteredStudents.length === 0 || assignmentFilters.program === 'all' || assignmentFilters.level === 'all'}
                      className="w-full"
                    >
                      Assign Them ({filteredStudents.length})
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button
                      variant="destructive"
                      onClick={handleClearAllStudents}
                      disabled={students.length === 0}
                      className="w-full gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Showing {filteredStudents.length} of {students.length} students
                  </div>
                </div>
              </div>

              {/* Students List */}
              {filteredStudents.length > 0 ? (
                <div className="space-y-4">
                  {paginatedStudents.map((student) => (
                    <div key={student.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-slate-900">{student.name}</h4>
                              <p className="text-sm text-slate-600">ID: {student.studentId} • {student.program}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{student.level}</Badge>
                              <Badge variant={student.status === 'Active' ? 'default' : student.status === 'Assigned' ? 'secondary' : 'outline'}>
                                {student.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                            {student.email && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="w-4 h-4" />
                                {student.email}
                              </div>
                            )}
                            {student.mobilePhone && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="w-4 h-4" />
                                {student.mobilePhone}
                              </div>
                            )}
                            {student.nationalId && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <FileText className="w-4 h-4" />
                                National ID: {student.nationalId}
                              </div>
                            )}
                            {student.type && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <GraduationCap className="w-4 h-4" />
                                {student.type}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                              Added: {new Date(student.enrollmentDate).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => handleEditClick(student, false)}
                              >
                                <Edit className="w-3 h-3" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-red-600 hover:text-red-700"
                                onClick={() => handleRemoveStudent(student.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-slate-600">
                        Page {currentPage} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="gap-1"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg text-slate-900 mb-2">No Students Found</h3>
                  <p className="text-slate-600 mb-4">
                    {students.length === 0
                      ? "Import students or add them manually to get started."
                      : "No students match your current filters."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Student Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information and view academic performance
            </DialogDescription>
          </DialogHeader>

          <Tabs value={editDialogTab} onValueChange={setEditDialogTab}>
            <TabsList className={`grid w-full ${showGradesTab ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
              {showGradesTab && <TabsTrigger value="grades">Grades</TabsTrigger>}
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal-info" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-studentId">Student ID *</Label>
                  <Input
                    id="edit-studentId"
                    placeholder="e.g., 20240001"
                    value={editStudent.studentId}
                    onChange={(e) => setEditStudent(prev => ({ ...prev, studentId: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-name">Student Name *</Label>
                  <Input
                    id="edit-name"
                    placeholder="Enter full name"
                    value={editStudent.name}
                    onChange={(e) => setEditStudent(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-religion">Religion</Label>
                  <Select
                    value={editStudent.religion}
                    onValueChange={(value) => setEditStudent(prev => ({ ...prev, religion: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    <SelectContent>
                      {religionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select
                    value={editStudent.type}
                    onValueChange={(value) => setEditStudent(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-nationalId">National ID</Label>
                  <Input
                    id="edit-nationalId"
                    placeholder="14-digit National ID"
                    maxLength={14}
                    value={editStudent.nationalId}
                    onChange={(e) => setEditStudent(prev => ({ ...prev, nationalId: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-passport">Passport</Label>
                  <Input
                    id="edit-passport"
                    placeholder="Passport number"
                    value={editStudent.passport}
                    onChange={(e) => setEditStudent(prev => ({ ...prev, passport: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-enrollmentDate">Enrollment Date *</Label>
                  <Input
                    id="edit-enrollmentDate"
                    type="date"
                    value={editStudent.enrollmentDate}
                    onChange={(e) => setEditStudent(prev => ({ ...prev, enrollmentDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Input
                    id="edit-address"
                    placeholder="Full address"
                    value={editStudent.address}
                    onChange={(e) => setEditStudent(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-homePhone">Home Phone</Label>
                  <Input
                    id="edit-homePhone"
                    placeholder="+20 2 123 4567"
                    value={editStudent.homePhone}
                    onChange={(e) => setEditStudent(prev => ({ ...prev, homePhone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-mobilePhone">Mobile Phone</Label>
                  <Input
                    id="edit-mobilePhone"
                    placeholder="+20 10 123 4567"
                    value={editStudent.mobilePhone}
                    onChange={(e) => setEditStudent(prev => ({ ...prev, mobilePhone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="student@university.edu"
                    value={editStudent.email}
                    onChange={(e) => setEditStudent(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-previousQualification">Previous Qualification</Label>
                  <Input
                    id="edit-previousQualification"
                    placeholder="e.g., High School - 95%"
                    value={editStudent.previousQualification}
                    onChange={(e) => setEditStudent(prev => ({ ...prev, previousQualification: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-program">Program</Label>
                  <Select
                    value={editStudent.program}
                    onValueChange={(value) => setEditStudent(prev => ({ ...prev, program: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-level">Level</Label>
                  <Select
                    value={editStudent.level}
                    onValueChange={(value) => setEditStudent(prev => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editStudent.status}
                    onValueChange={(value) => setEditStudent(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Deactivated">Deactivated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStudent}
                  className="flex-1"
                >
                  Update Student
                </Button>
              </div>
            </TabsContent>

            {/* Grades Tab - Only show if showGradesTab is true */}
            {showGradesTab && (
              <TabsContent value="grades" className="mt-4">
                <div className="space-y-4">
                  {selectedStudent && studentGradesData[selectedStudent.id] ? (
                    <>
                      <div className="space-y-4">
                        {studentGradesData[selectedStudent.id].map((levelData: any, levelIndex: number) => (
                          <GradeLevelSection
                            key={levelIndex}
                            levelData={levelData}
                            onUpdateGrade={(semesterIndex, courseIndex, newTotal) =>
                              handleUpdateGrade(levelIndex, semesterIndex, courseIndex, newTotal)
                            }
                          />
                        ))}
                      </div>

                      {/* Submit Changes Button */}
                      <div className="flex justify-end pt-4 border-t border-slate-200">
                        <Button
                          onClick={handleSubmitGrades}
                          disabled={!gradesModified}
                          className={`gap-2 ${gradesModified
                              ? 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'
                              : ''
                            }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Submit Changes
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg text-slate-900 mb-2">No Grades Available</h3>
                      <p className="text-slate-600">
                        No academic records found for this student.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
