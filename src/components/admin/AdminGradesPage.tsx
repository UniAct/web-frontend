import {
  useState,
  useMemo,
  useEffect,
  useRef,
  KeyboardEvent,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { Switch } from "../ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  Plus,
  FileSpreadsheet,
  Save,
  Trash2,
  BookOpen,
  Check,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Send,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface AdminGradesPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

interface GradeColumn {
  id: string;
  name: string;
  maxMark: number;
}

interface StudentGrade {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  grades: Record<string, number | null>;
  total: number;
  equivalentGrade: string;
  finalGrade: string;
}

interface CourseData {
  gradeColumns: GradeColumn[];
  students: StudentGrade[];
}

interface ProgramLevel {
  id: string;
  name: string;
  published: boolean;
}

interface Program {
  id: string;
  name: string;
  levels: ProgramLevel[];
}

const gradeScale = [
  { grade: "A", min: 90, max: 100, equivalent: "Excellent" },
  { grade: "A-", min: 85, max: 90, equivalent: "Excellent" },
  { grade: "B+", min: 80, max: 85, equivalent: "Very Good" },
  { grade: "B", min: 75, max: 80, equivalent: "Very Good" },
  { grade: "B-", min: 70, max: 75, equivalent: "Good" },
  { grade: "C+", min: 65, max: 70, equivalent: "Good" },
  { grade: "C", min: 60, max: 65, equivalent: "Good" },
  { grade: "C-", min: 56, max: 60, equivalent: "Pass" },
  { grade: "D+", min: 53, max: 56, equivalent: "Pass" },
  { grade: "D", min: 50, max: 53, equivalent: "Pass" },
  { grade: "F", min: 0, max: 50, equivalent: "Fail" },
];

export function AdminGradesPage({
  selectedUniversity,
}: AdminGradesPageProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState("student-grades");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [gradeColumns, setGradeColumns] = useState<
    GradeColumn[]
  >([]);
  const [studentGrades, setStudentGrades] = useState<
    StudentGrade[]
  >([]);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnMaxMark, setNewColumnMaxMark] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState<string>("");
  const [courseDropdownOpen, setCourseDropdownOpen] =
    useState(false);
  const inputRefs = useRef<{
    [key: string]: HTMLInputElement | null;
  }>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(5);

  // Grades Status state
  const [programs, setPrograms] = useState<Program[]>([
    {
      id: "cs",
      name: "Computer Science",
      levels: [
        { id: "level-1", name: "Level 1", published: false },
        { id: "level-2", name: "Level 2", published: false },
        { id: "level-3", name: "Level 3", published: false },
        { id: "level-4", name: "Level 4", published: false },
      ],
    },
    {
      id: "eng",
      name: "Engineering",
      levels: [
        { id: "level-1", name: "Level 1", published: false },
        { id: "level-2", name: "Level 2", published: false },
        { id: "level-3", name: "Level 3", published: false },
        { id: "level-4", name: "Level 4", published: false },
      ],
    },
    {
      id: "med",
      name: "Medicine",
      levels: [
        { id: "level-1", name: "Level 1", published: false },
        { id: "level-2", name: "Level 2", published: false },
        { id: "level-3", name: "Level 3", published: false },
        { id: "level-4", name: "Level 4", published: false },
        { id: "level-5", name: "Level 5", published: false },
        { id: "level-6", name: "Level 6", published: false },
      ],
    },
    {
      id: "bus",
      name: "Business Administration",
      levels: [
        { id: "level-1", name: "Level 1", published: false },
        { id: "level-2", name: "Level 2", published: false },
        { id: "level-3", name: "Level 3", published: false },
        { id: "level-4", name: "Level 4", published: false },
      ],
    },
  ]);
  const [expandedPrograms, setExpandedPrograms] = useState<
    string[]
  >(["cs"]); // Default expand first program

  // Mock courses data with their specific grade structures
  const courses = [
    {
      id: "cs-301",
      name: "CS-301 - Advanced Algorithms",
      students: 28,
      instructor: "Dr. Sarah Wilson",
    },
    {
      id: "cs-201",
      name: "CS-201 - Data Structures",
      students: 35,
      instructor: "Prof. Michael Johnson",
    },
    {
      id: "cs-101",
      name: "CS-101 - Programming Basics",
      students: 45,
      instructor: "Dr. Ahmed Hassan",
    },
    {
      id: "math-201",
      name: "MATH-201 - Calculus II",
      students: 32,
      instructor: "Prof. Lisa Chen",
    },
    {
      id: "phys-401",
      name: "PHYS-401 - Quantum Physics",
      students: 20,
      instructor: "Dr. Robert Brown",
    },
  ];

  // Mock course-specific data
  const courseData: Record<string, CourseData> = {
    "cs-301": {
      gradeColumns: [
        { id: "1", name: "Midterm", maxMark: 30 },
        { id: "2", name: "Quiz 1", maxMark: 10 },
        { id: "3", name: "Quiz 2", maxMark: 10 },
        { id: "4", name: "Final Exam", maxMark: 50 },
      ],
      students: [
        {
          id: "1",
          studentId: "1",
          studentName: "John Doe",
          rollNumber: "CS2021001",
          grades: {},
          total: 0,
          equivalentGrade: "",
          finalGrade: "",
        },
        {
          id: "2",
          studentId: "2",
          studentName: "Sarah Ahmed",
          rollNumber: "CS2021002",
          grades: {},
          total: 0,
          equivalentGrade: "",
          finalGrade: "",
        },
        {
          id: "3",
          studentId: "3",
          studentName: "Mohamed Ali",
          rollNumber: "CS2021003",
          grades: {},
          total: 0,
          equivalentGrade: "",
          finalGrade: "",
        },
      ],
    },
    "cs-201": {
      gradeColumns: [
        { id: "1", name: "Assignment 1", maxMark: 20 },
        { id: "2", name: "Assignment 2", maxMark: 20 },
        { id: "3", name: "Midterm", maxMark: 30 },
        { id: "4", name: "Final Project", maxMark: 30 },
      ],
      students: [
        {
          id: "4",
          studentId: "4",
          studentName: "Emma Wilson",
          rollNumber: "CS2021004",
          grades: {},
          total: 0,
          equivalentGrade: "",
          finalGrade: "",
        },
        {
          id: "5",
          studentId: "5",
          studentName: "David Chen",
          rollNumber: "CS2021005",
          grades: {},
          total: 0,
          equivalentGrade: "",
          finalGrade: "",
        },
      ],
    },
    "cs-101": {
      gradeColumns: [
        { id: "1", name: "Lab Work", maxMark: 25 },
        { id: "2", name: "Quizzes", maxMark: 15 },
        { id: "3", name: "Midterm", maxMark: 30 },
        { id: "4", name: "Final Exam", maxMark: 30 },
      ],
      students: [
        {
          id: "6",
          studentId: "6",
          studentName: "Lisa Brown",
          rollNumber: "CS2021006",
          grades: {},
          total: 0,
          equivalentGrade: "",
          finalGrade: "",
        },
        {
          id: "7",
          studentId: "7",
          studentName: "Michael Lee",
          rollNumber: "CS2021007",
          grades: {},
          total: 0,
          equivalentGrade: "",
          finalGrade: "",
        },
        {
          id: "8",
          studentId: "8",
          studentName: "Anna Taylor",
          rollNumber: "CS2021008",
          grades: {},
          total: 0,
          equivalentGrade: "",
          finalGrade: "",
        },
      ],
    },
    "math-201": {
      gradeColumns: [
        { id: "1", name: "Homework", maxMark: 20 },
        { id: "2", name: "Quiz 1", maxMark: 10 },
        { id: "3", name: "Quiz 2", maxMark: 10 },
        { id: "4", name: "Midterm", maxMark: 30 },
        { id: "5", name: "Final Exam", maxMark: 30 },
      ],
      students: [
        {
          id: "9",
          studentId: "9",
          studentName: "James Wilson",
          rollNumber: "MATH2021001",
          grades: {},
          total: 0,
          equivalentGrade: "",
          finalGrade: "",
        },
        {
          id: "10",
          studentId: "10",
          studentName: "Sophia Martinez",
          rollNumber: "MATH2021002",
          grades: {},
          total: 0,
          equivalentGrade: "",
          finalGrade: "",
        },
      ],
    },
    "phys-401": {
      gradeColumns: [
        { id: "1", name: "Lab Reports", maxMark: 30 },
        { id: "2", name: "Midterm", maxMark: 35 },
        { id: "3", name: "Final Exam", maxMark: 35 },
      ],
      students: [
        {
          id: "11",
          studentId: "11",
          studentName: "Robert Johnson",
          rollNumber: "PHYS2021001",
          grades: {},
          total: 0,
          equivalentGrade: "",
          finalGrade: "",
        },
      ],
    },
  };

  const calculateGrade = (total: number, maxTotal: number) => {
    if (maxTotal === 0) return { grade: "", equivalent: "" };

    const percentage = (total / maxTotal) * 100;

    for (const scale of gradeScale) {
      if (percentage >= scale.min && percentage < scale.max) {
        return {
          grade: scale.grade,
          equivalent: scale.equivalent,
        };
      }
    }

    return { grade: "F", equivalent: "Fail" };
  };

  const loadCourseGrades = (courseId: string) => {
    const data = courseData[courseId];
    if (data) {
      setGradeColumns(data.gradeColumns);

      // Initialize student grades with null values
      const initialGrades = data.students.map((student) => {
        const grades: Record<string, number | null> = {};
        data.gradeColumns.forEach((col) => {
          grades[col.id] = null;
        });

        return {
          ...student,
          grades,
          total: 0,
          equivalentGrade: "",
          finalGrade: "",
        };
      });

      setStudentGrades(initialGrades);
      setInitialData(JSON.stringify(initialGrades));
      setHasChanges(false);
    }
  };

  const updateGrade = (
    studentId: string,
    columnId: string,
    value: string,
  ) => {
    const numValue = value === "" ? null : parseFloat(value);
    const column = gradeColumns.find(
      (col) => col.id === columnId,
    );

    if (
      column &&
      numValue !== null &&
      numValue > column.maxMark
    ) {
      toast.error(
        `Grade cannot exceed maximum mark of ${column.maxMark}`,
      );
      return;
    }

    setStudentGrades((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          const updatedGrades = {
            ...student.grades,
            [columnId]: numValue,
          };

          // Check if all grades are filled for this student
          const allFilled = gradeColumns.every(
            (col) =>
              updatedGrades[col.id] !== null &&
              updatedGrades[col.id] !== undefined,
          );

          let total = 0;
          let grade = "";
          let equivalent = "";

          if (allFilled) {
            // Calculate total only if all grades are filled
            total = Object.values(updatedGrades).reduce(
              (sum, g) => sum + (g || 0),
              0,
            );
            const maxTotal = gradeColumns.reduce(
              (sum, col) => sum + col.maxMark,
              0,
            );
            const calculated = calculateGrade(total, maxTotal);
            grade = calculated.grade;
            equivalent = calculated.equivalent;
          }

          return {
            ...student,
            grades: updatedGrades,
            total,
            equivalentGrade: equivalent,
            finalGrade: grade,
          };
        }
        return student;
      }),
    );

    setHasChanges(true);
  };

  const addGradeColumn = () => {
    if (!newColumnName || !newColumnMaxMark) {
      toast.error(
        "Please provide column name and maximum mark",
      );
      return;
    }

    const maxMark = parseFloat(newColumnMaxMark);
    if (isNaN(maxMark) || maxMark <= 0) {
      toast.error("Maximum mark must be a positive number");
      return;
    }

    const newColumn: GradeColumn = {
      id: Date.now().toString(),
      name: newColumnName,
      maxMark,
    };

    setGradeColumns((prev) => [...prev, newColumn]);

    // Add the new column to existing student grades
    setStudentGrades((prev) =>
      prev.map((student) => ({
        ...student,
        grades: { ...student.grades, [newColumn.id]: null },
        total: 0,
        equivalentGrade: "",
        finalGrade: "",
      })),
    );

    setNewColumnName("");
    setNewColumnMaxMark("");
    setDialogOpen(false);
    setHasChanges(true);
    toast.success(
      `Column "${newColumnName}" added successfully`,
    );
  };

  const removeGradeColumn = (columnId: string) => {
    const column = gradeColumns.find(
      (col) => col.id === columnId,
    );
    if (!column) return;

    setGradeColumns((prev) =>
      prev.filter((col) => col.id !== columnId),
    );

    // Remove the column from student grades and recalculate
    setStudentGrades((prev) =>
      prev.map((student) => {
        const updatedGrades = { ...student.grades };
        delete updatedGrades[columnId];

        // Recalculate if all remaining grades are filled
        const remainingColumns = gradeColumns.filter(
          (col) => col.id !== columnId,
        );
        const allFilled = remainingColumns.every(
          (col) =>
            updatedGrades[col.id] !== null &&
            updatedGrades[col.id] !== undefined,
        );

        let total = 0;
        let grade = "";
        let equivalent = "";

        if (allFilled && remainingColumns.length > 0) {
          total = Object.values(updatedGrades).reduce(
            (sum, g) => sum + (g || 0),
            0,
          );
          const maxTotal = remainingColumns.reduce(
            (sum, col) => sum + col.maxMark,
            0,
          );
          const calculated = calculateGrade(total, maxTotal);
          grade = calculated.grade;
          equivalent = calculated.equivalent;
        }

        return {
          ...student,
          grades: updatedGrades,
          total,
          equivalentGrade: equivalent,
          finalGrade: grade,
        };
      }),
    );

    setHasChanges(true);
    toast.success(`Column "${column.name}" removed`);
  };

  const submitGrades = () => {
    if (!selectedCourse) {
      toast.error("Please select a course first");
      return;
    }

    // Recalculate all grades on submit
    const maxTotal = gradeColumns.reduce(
      (sum, col) => sum + col.maxMark,
      0,
    );

    setStudentGrades((prev) =>
      prev.map((student) => {
        const allFilled = gradeColumns.every(
          (col) =>
            student.grades[col.id] !== null &&
            student.grades[col.id] !== undefined,
        );

        if (allFilled) {
          const total = Object.values(student.grades).reduce(
            (sum, g) => sum + (g || 0),
            0,
          );
          const { grade, equivalent } = calculateGrade(
            total,
            maxTotal,
          );
          return {
            ...student,
            total,
            equivalentGrade: equivalent,
            finalGrade: grade,
          };
        }

        return student;
      }),
    );

    setHasChanges(false);
    setInitialData(JSON.stringify(studentGrades));
    toast.success(
      "Grades submitted and calculated successfully",
    );
  };

  const pushGradesToStudents = () => {
    toast.success("Grades are being sent to students.");
  };

  const toggleGradeStatus = (
    programId: string,
    levelId: string,
    published: boolean,
  ) => {
    setPrograms((prevPrograms) =>
      prevPrograms.map((program) =>
        program.id === programId
          ? {
            ...program,
            levels: program.levels.map((level) =>
              level.id === levelId
                ? { ...level, published }
                : level,
            ),
          }
          : program,
      ),
    );
    toast.success(
      `Grades ${published ? "published" : "unpublished"} successfully`,
    );
  };

  const toggleProgramExpanded = (programId: string) => {
    setExpandedPrograms((prev) =>
      prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [...prev, programId],
    );
  };

  const downloadGrades = (format: "csv" | "excel") => {
    if (!selectedCourse) {
      toast.error("Please select a course first");
      return;
    }

    const course = courses.find((c) => c.id === selectedCourse);
    if (!course) return;

    // Prepare CSV headers
    const headers = [
      "Student ID",
      "Student Name",
      ...gradeColumns.map(
        (col) => `${col.name} (/${col.maxMark})`,
      ),
      `Total (/${maxTotal})`,
      "Equivalent Grade",
      "Final Grade",
    ];

    // Prepare CSV rows
    const rows = studentGrades.map((student) => [
      student.rollNumber,
      student.studentName,
      ...gradeColumns.map((col) => {
        const grade = student.grades[col.id];
        return grade !== null && grade !== undefined
          ? grade.toString()
          : "";
      }),
      student.total > 0 ? student.total.toFixed(2) : "",
      student.equivalentGrade || "",
      student.finalGrade || "",
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape cells containing commas or quotes
            if (
              typeof cell === "string" &&
              (cell.includes(",") || cell.includes('"'))
            ) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(","),
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format
    const fileName = `${course.name.replace(/[^a-zA-Z0-9-]/g, "_")}_Grades_${dateStr}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloaded grades as ${fileName}`);
  };

  const getGradeBadgeColor = (grade: string) => {
    if (!grade || grade === "")
      return "bg-slate-100 text-slate-800";
    if (grade.startsWith("A"))
      return "bg-green-100 text-green-800";
    if (grade.startsWith("B"))
      return "bg-blue-100 text-blue-800";
    if (grade.startsWith("C"))
      return "bg-yellow-100 text-yellow-800";
    if (grade.startsWith("D"))
      return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  // Keyboard navigation handler
  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    studentIndex: number,
    columnIndex: number,
  ) => {
    const totalStudents = studentGrades.length;
    const totalColumns = gradeColumns.length;

    let newStudentIndex = studentIndex;
    let newColumnIndex = columnIndex;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        newColumnIndex = Math.min(
          columnIndex + 1,
          totalColumns - 1,
        );
        break;
      case "ArrowLeft":
        e.preventDefault();
        newColumnIndex = Math.max(columnIndex - 1, 0);
        break;
      case "ArrowDown":
        e.preventDefault();
        newStudentIndex = Math.min(
          studentIndex + 1,
          totalStudents - 1,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        newStudentIndex = Math.max(studentIndex - 1, 0);
        break;
      case "Enter":
        e.preventDefault();
        // Move down to next student on Enter
        newStudentIndex = Math.min(
          studentIndex + 1,
          totalStudents - 1,
        );
        break;
      default:
        return;
    }

    // Focus the new input
    const newKey = `${studentGrades[newStudentIndex].id}-${gradeColumns[newColumnIndex].id}`;
    const nextInput = inputRefs.current[newKey];
    if (nextInput) {
      nextInput.focus();
      nextInput.select();
    }
  };

  const maxTotal = gradeColumns.reduce(
    (sum, col) => sum + col.maxMark,
    0,
  );

  // Pagination calculations
  const totalPages = Math.ceil(
    studentGrades.length / studentsPerPage,
  );
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const paginatedStudents = studentGrades.slice(
    startIndex,
    endIndex,
  );

  // Reset to page 1 when students per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [studentsPerPage, selectedCourse]);

  // Calculate grade distribution for bar chart
  const gradeDistribution = useMemo(() => {
    const distribution = gradeScale.map((scale) => {
      const count = studentGrades.filter(
        (s) => s.finalGrade === scale.grade,
      ).length;
      return {
        grade: scale.grade,
        count,
        color: scale.grade.startsWith("A")
          ? "#10b981"
          : scale.grade.startsWith("B")
            ? "#3b82f6"
            : scale.grade.startsWith("C")
              ? "#f59e0b"
              : scale.grade.startsWith("D")
                ? "#f97316"
                : "#ef4444",
      };
    });
    return distribution;
  }, [studentGrades]);

  // Check if all students have final grades
  const allStudentsHaveFinalGrades = useMemo(() => {
    if (studentGrades.length === 0) return false;
    return studentGrades.every(
      (student) => student.finalGrade && student.finalGrade !== "",
    );
  }, [studentGrades]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-slate-900">
          Grades Management
        </h2>
        <p className="text-slate-600 mt-1">
          Manage student grades and calculate final results
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="student-grades">
            Student Grades
          </TabsTrigger>
          <TabsTrigger value="grades-status">
            Grades Status
          </TabsTrigger>
        </TabsList>

        {/* Student Grades Tab */}
        <TabsContent value="student-grades" className="space-y-6">
          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Select Course
              </CardTitle>
              <CardDescription>
                Choose a course to manage grades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Popover
                open={courseDropdownOpen}
                onOpenChange={setCourseDropdownOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={courseDropdownOpen}
                    className="w-full justify-between"
                  >
                    {selectedCourse
                      ? courses.find(
                        (course) => course.id === selectedCourse,
                      )?.name
                      : "Choose a course"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[600px] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search courses by name or code..." />
                    <CommandList>
                      <CommandEmpty>No course found.</CommandEmpty>
                      <CommandGroup>
                        {courses.map((course) => (
                          <CommandItem
                            key={course.id}
                            value={`${course.name} ${course.instructor}`}
                            onSelect={() => {
                              setSelectedCourse(course.id);
                              loadCourseGrades(course.id);
                              setCourseDropdownOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${selectedCourse === course.id
                                  ? "opacity-100"
                                  : "opacity-0"
                                }`}
                            />
                            <div className="flex-1">
                              <div>{course.name}</div>
                              <div className="text-xs text-slate-500">
                                {course.students} students •{" "}
                                {course.instructor}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {!selectedCourse && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600">
                  Please select a course to view and manage grades
                </p>
              </CardContent>
            </Card>
          )}

          {selectedCourse && studentGrades.length > 0 && (
            <>
              {/* Grades Table */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <CardTitle>Student Grades</CardTitle>
                      <CardDescription>
                        Enter grades for each student. Grades will
                        be calculated automatically when all fields
                        are filled.
                      </CardDescription>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 no-print">
                      <Dialog
                        open={dialogOpen}
                        onOpenChange={setDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Grade Column
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Add New Grade Column
                            </DialogTitle>
                            <DialogDescription>
                              Define a new grading component for
                              this course
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="columnName">
                                Column Name
                              </Label>
                              <Input
                                id="columnName"
                                placeholder="e.g., Quiz 3, Project, Assignment 1"
                                value={newColumnName}
                                onChange={(e) =>
                                  setNewColumnName(e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maxMark">
                                Maximum Mark
                              </Label>
                              <Input
                                id="maxMark"
                                type="number"
                                placeholder="e.g., 10, 20, 30"
                                value={newColumnMaxMark}
                                onChange={(e) =>
                                  setNewColumnMaxMark(
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={addGradeColumn}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              Add Column
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        onClick={submitGrades}
                        disabled={!hasChanges}
                        className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        Submit Grades
                      </Button>

                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => downloadGrades("excel")}
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Download Excel
                      </Button>

                      <Button
                        onClick={pushGradesToStudents}
                        disabled={!allStudentsHaveFinalGrades}
                        className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        Push Grades to Students
                      </Button>

                      <div className="ml-auto flex items-center gap-3">
                        <Label
                          htmlFor="perPage"
                          className="text-sm whitespace-nowrap"
                        >
                          Students per page:
                        </Label>
                        <Select
                          value={studentsPerPage.toString()}
                          onValueChange={(value) =>
                            setStudentsPerPage(Number(value))
                          }
                        >
                          <SelectTrigger
                            id="perPage"
                            className="w-20"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-6 px-6">
                    <div className="inline-block min-w-full align-middle">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-slate-300">
                            <th className="text-left py-3 px-4 bg-slate-50 sticky left-0 z-10 border-r border-slate-200 min-w-[120px]">
                              <div className="text-slate-700">
                                University ID
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 bg-slate-50 border-r border-slate-200 min-w-[150px]">
                              <div className="text-slate-700">
                                Student Name
                              </div>
                            </th>
                            {gradeColumns.map((column) => (
                              <th
                                key={column.id}
                                className="text-center py-3 px-4 bg-slate-50 border-r border-slate-200 min-w-[140px]"
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <div>
                                    <div className="text-slate-700">
                                      {column.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      Max: {column.maxMark}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      removeGradeColumn(column.id)
                                    }
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </th>
                            ))}
                            <th className="text-center py-3 px-4 bg-blue-50 border-r border-slate-200 min-w-[100px]">
                              <div className="text-blue-900">
                                Total
                              </div>
                              <div className="text-xs text-blue-700">
                                / {maxTotal}
                              </div>
                            </th>
                            <th className="text-center py-3 px-4 bg-purple-50 border-r border-slate-200 min-w-[130px]">
                              <div className="text-purple-900">
                                Equivalent
                              </div>
                            </th>
                            <th className="text-center py-3 px-4 bg-green-50 min-w-[120px]">
                              <div className="text-green-900">
                                Final Grade
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedStudents.map(
                            (student, studentIndex) => {
                              const actualStudentIndex =
                                startIndex + studentIndex;
                              return (
                                <tr
                                  key={student.id}
                                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                                >
                                  <td className="py-3 px-4 bg-white sticky left-0 z-10 border-r border-slate-200">
                                    <div className="text-slate-900">
                                      {student.rollNumber}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 bg-white border-r border-slate-200">
                                    <div className="text-slate-900">
                                      {student.studentName}
                                    </div>
                                  </td>
                                  {gradeColumns.map(
                                    (column, columnIndex) => (
                                      <td
                                        key={column.id}
                                        className="py-3 px-4 text-center border-r border-slate-200"
                                      >
                                        <Input
                                          ref={(el) => {
                                            inputRefs.current[
                                              `${student.id}-${column.id}`
                                            ] = el;
                                          }}
                                          type="number"
                                          min="0"
                                          max={column.maxMark}
                                          step="0.5"
                                          value={
                                            student.grades[
                                            column.id
                                            ] ?? ""
                                          }
                                          onChange={(e) =>
                                            updateGrade(
                                              student.id,
                                              column.id,
                                              e.target.value,
                                            )
                                          }
                                          onKeyDown={(e) =>
                                            handleKeyDown(
                                              e,
                                              actualStudentIndex,
                                              columnIndex,
                                            )
                                          }
                                          className="text-center w-20 mx-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                          placeholder="--"
                                        />
                                      </td>
                                    ),
                                  )}
                                  <td className="py-3 px-4 text-center bg-blue-50 border-r border-slate-200">
                                    <div className="text-blue-900">
                                      {student.total > 0
                                        ? student.total.toFixed(2)
                                        : "--"}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-center bg-purple-50 border-r border-slate-200">
                                    {student.equivalentGrade ? (
                                      <Badge
                                        className={`${getGradeBadgeColor(student.finalGrade)} hover:${getGradeBadgeColor(student.finalGrade)}`}
                                      >
                                        {student.equivalentGrade}
                                      </Badge>
                                    ) : (
                                      <span className="text-slate-400">
                                        --
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-center bg-green-50">
                                    {student.finalGrade ? (
                                      <Badge
                                        className={`${getGradeBadgeColor(student.finalGrade)} hover:${getGradeBadgeColor(student.finalGrade)}`}
                                      >
                                        {student.finalGrade}
                                      </Badge>
                                    ) : (
                                      <span className="text-slate-400">
                                        --
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  {studentGrades.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-200 no-print">
                      <div className="text-sm text-slate-600">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(endIndex, studentGrades.length)}{" "}
                        of {studentGrades.length} students
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.max(1, prev - 1),
                            )
                          }
                          disabled={currentPage === 1}
                          className="gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {totalPages <= 7 ? (
                            // Show all pages if 7 or fewer
                            Array.from(
                              { length: totalPages },
                              (_, i) => i + 1,
                            ).map((page) => (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={
                                  currentPage === page
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    : ""
                                }
                              >
                                {page}
                              </Button>
                            ))
                          ) : (
                            // Show smart pagination with ellipsis
                            <>
                              {currentPage > 3 && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setCurrentPage(1)
                                    }
                                  >
                                    1
                                  </Button>
                                  <span className="px-2 text-slate-400">
                                    ...
                                  </span>
                                </>
                              )}
                              {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                              )
                                .filter(
                                  (page) =>
                                    page === currentPage ||
                                    page === currentPage - 1 ||
                                    page === currentPage + 1 ||
                                    (currentPage <= 3 &&
                                      page <= 5) ||
                                    (currentPage >=
                                      totalPages - 2 &&
                                      page >= totalPages - 4),
                                )
                                .map((page) => (
                                  <Button
                                    key={page}
                                    variant={
                                      currentPage === page
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                      setCurrentPage(page)
                                    }
                                    className={
                                      currentPage === page
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        : ""
                                    }
                                  >
                                    {page}
                                  </Button>
                                ))}
                              {currentPage < totalPages - 2 && (
                                <>
                                  <span className="px-2 text-slate-400">
                                    ...
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setCurrentPage(totalPages)
                                    }
                                  >
                                    {totalPages}
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="gap-1"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grade Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>
                    Visual representation of student grades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={gradeDistribution}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                        />
                        <XAxis
                          dataKey="grade"
                          tick={{ fill: "#64748b", fontSize: 14 }}
                          axisLine={{ stroke: "#cbd5e1" }}
                        />
                        <YAxis
                          tick={{ fill: "#64748b", fontSize: 14 }}
                          axisLine={{ stroke: "#cbd5e1" }}
                          label={{
                            value: "Number of Students",
                            angle: -90,
                            position: "insideLeft",
                            fill: "#64748b",
                          }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "12px",
                            boxShadow:
                              "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          labelStyle={{
                            color: "#1e293b",
                            fontWeight: "bold",
                            marginBottom: "4px",
                          }}
                          formatter={(value: number) => [
                            `${value} student${value !== 1 ? "s" : ""}`,
                            "Count",
                          ]}
                        />
                        <Bar
                          dataKey="count"
                          radius={[8, 8, 0, 0]}
                          animationDuration={800}
                          animationBegin={0}
                        >
                          {gradeDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {selectedCourse && studentGrades.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600">
                  No students enrolled in this course
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Grades Status Tab */}
        <TabsContent value="grades-status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Grades Publishing Status
              </CardTitle>
              <CardDescription>
                Control which program levels have their grades published to students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {programs.map((program) => {
                const isExpanded = expandedPrograms.includes(
                  program.id,
                );
                return (
                  <Collapsible
                    key={program.id}
                    open={isExpanded}
                    onOpenChange={() =>
                      toggleProgramExpanded(program.id)
                    }
                  >
                    <Card className="border-2">
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <ChevronDown
                                className={`w-5 h-5 transition-transform ${isExpanded
                                    ? "transform rotate-0"
                                    : "transform -rotate-90"
                                  }`}
                              />
                              {program.name}
                            </CardTitle>
                            <Badge variant="outline" className="ml-2">
                              {
                                program.levels.filter((l) => l.published)
                                  .length
                              }{" "}
                              / {program.levels.length} Published
                            </Badge>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {program.levels.map((level) => (
                              <div
                                key={level.id}
                                className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                                  <span className="text-slate-900">
                                    {level.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`text-sm px-3 py-1 rounded-full ${level.published
                                        ? "bg-green-100 text-green-700"
                                        : "bg-slate-200 text-slate-700"
                                      }`}
                                  >
                                    {level.published
                                      ? "✅ Published"
                                      : "🚫 Unpublished"}
                                  </span>
                                  <Switch
                                    checked={level.published}
                                    onCheckedChange={(checked) =>
                                      toggleGradeStatus(
                                        program.id,
                                        level.id,
                                        checked,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
