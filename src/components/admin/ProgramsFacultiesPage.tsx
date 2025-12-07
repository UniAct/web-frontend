import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SearchableSelect } from "../ui/searchable-select";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  GraduationCap,
  Building2,
  BookOpen,
  Users,
  ChevronRight,
  ChevronDown,
  Calendar,
  Award,
  ArrowLeft,
  ArrowRight,
  Save,
  Minus,
  X,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface ProgramsFacultiesPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (id: string | null) => void;
}

// Updated interfaces based on requirements
interface Faculty {
  id: string;
  name: string;
  description: string;
  deanId: string;
  createdAt: string;
  programsCount: number;
  regulations?: FacultyRegulations;
}

interface FacultyRegulations {
  roundToWholeNumber: boolean;
  approximateFractions: boolean;
  maxAbsence: number;
  minGradeExcellent: number;
  minGradeVeryGood: number;
  minGradeGood: number;
  minGradeAcceptable: number;
  minGradeVeryWeak: number;
  enableMercyRules: boolean;
  mercyRules: MercyRule[];
}

interface MercyRule {
  id: string;
  originalScore: number;
  adjustedScore: number;
}

interface Program {
  id: string;
  name: string;
  facultyId: string;
  headId: string;
  description: string;
  universityCreditHours: number;
  facultyCreditHours: number;
  programCreditHours: number;
  programType: "Bachelor" | "Master" | "Diploma" | "PhD";
  resultDisplay: "CourseGrade" | "DetailedEstimate";
  blockReason: "NonPaymentCurrent" | "NonPaymentOld";
  levelsNumber: number;
  levels: ProgramLevel[];
  transcriptDefinition: TranscriptDefinition[];
  academicLoadSemester: AcademicLoadSemester[];
  academicLoadGPA: AcademicLoadGPA[];
  createdAt: string;
}

interface ProgramLevel {
  level: number;
  minCredits: number;
  maxCredits: number;
  fees: Fee[];
  semesterFees: SemesterFees;
  summerFees: Fee[];
}

interface Fee {
  id: string;
  feeType:
  | "ConstantYear"
  | "ConstantSemester"
  | "PerCreditHour"
  | "PerCourse"
  | "Administrative"
  | "Other";
  semesterId?: string;
  amount: number;
  description: string;
}

interface SemesterFees {
  semester1: Fee[];
  semester2: Fee[];
}

interface TranscriptDefinition {
  id: string;
  minScore: number;
  maxScore: number;
  minGPA: number;
  maxGPA: number;
  gradeLetter: string;
  equivalentEstimate: string;
}

interface AcademicLoadSemester {
  level: number;
  semester: number;
  minCredits: number;
  maxCredits: number;
}

interface AcademicLoadGPA {
  id: string;
  minGPA: number;
  maxGPA: number;
  minCredits: number;
  maxCredits: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  syllabus: string;
  courseType: string;
  courseContent: string;
  lectureCredits?: number;
  labCredits?: number;
  successPercentage: number;
  minFinalSuccessPercentage: number;
  programId: string;
  prerequisites: CoursePrerequisite[];
}

interface CoursePrerequisite {
  id: string;
  courseId: string;
  prerequisiteId: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  department: string;
}

// Mock data
const mockStaff: Staff[] = [
  {
    id: "1",
    name: "Prof. Ahmed Mohamed",
    email: "ahmed@uni.edu",
    department: "Engineering",
  },
  {
    id: "2",
    name: "Dr. Sarah Hassan",
    email: "sarah@uni.edu",
    department: "Business",
  },
  {
    id: "3",
    name: "Prof. Michael Johnson",
    email: "michael@uni.edu",
    department: "Science",
  },
  {
    id: "4",
    name: "Dr. Elena Rodriguez",
    email: "elena@uni.edu",
    department: "Mathematics",
  },
];

const mockFaculties: Faculty[] = [
  {
    id: "1",
    name: "Faculty of Engineering",
    description:
      "Engineering programs including Computer Science, Electrical, and Mechanical Engineering",
    deanId: "1",
    createdAt: "2023-01-15",
    programsCount: 8,
  },
  {
    id: "2",
    name: "Faculty of Business Administration",
    description: "Business and management programs",
    deanId: "2",
    createdAt: "2023-02-20",
    programsCount: 5,
  },
];

const mockPrograms: Program[] = [
  {
    id: "1",
    name: "Computer Science",
    facultyId: "1",
    headId: "1",
    description: "Bachelor of Science in Computer Science",
    universityCreditHours: 128,
    facultyCreditHours: 32,
    programCreditHours: 96,
    programType: "Bachelor",
    resultDisplay: "CourseGrade",
    blockReason: "NonPaymentCurrent",
    levelsNumber: 4,
    levels: [],
    transcriptDefinition: [],
    academicLoadSemester: [],
    academicLoadGPA: [],
    createdAt: "2023-03-01",
  },
];

const mockCourses: Course[] = [
  {
    id: "1",
    name: "Introduction to Programming",
    code: "CS-101",
    description: "Basic programming concepts and fundamentals",
    credits: 3,
    syllabus:
      "Variables, control structures, functions, arrays",
    courseType: "Mandatory",
    courseContent: "Lecture and Lab",
    lectureCredits: 2,
    labCredits: 1,
    successPercentage: 70,
    minFinalSuccessPercentage: 50,
    programId: "1",
    prerequisites: [],
  },
  {
    id: "2",
    name: "Data Structures",
    code: "CS-201",
    description: "Advanced data structures and algorithms",
    credits: 4,
    syllabus:
      "Arrays, linked lists, trees, graphs, sorting algorithms",
    courseType: "Mandatory",
    courseContent: "Lecture",
    successPercentage: 65,
    minFinalSuccessPercentage: 55,
    programId: "1",
    prerequisites: [
      { id: "1", courseId: "2", prerequisiteId: "1" },
    ],
  },
];

export function ProgramsFacultiesPage({
  selectedUniversity,
}: ProgramsFacultiesPageProps) {
  const [activeTab, setActiveTab] = useState("faculties");
  const [searchQuery, setSearchQuery] = useState("");

  // Data state
  const [faculties, setFaculties] =
    useState<Faculty[]>(mockFaculties);
  const [programs, setPrograms] =
    useState<Program[]>(mockPrograms);
  const [courses, setCourses] = useState<Course[]>(mockCourses);

  // Faculty state
  const [showFacultyDialog, setShowFacultyDialog] =
    useState(false);
  const [showRegulationsDialog, setShowRegulationsDialog] =
    useState(false);
  const [editingFaculty, setEditingFaculty] =
    useState<Faculty | null>(null);
  const [facultyForm, setFacultyForm] = useState({
    name: "",
    description: "",
    deanId: "",
  });
  const [regulationsForm, setRegulationsForm] =
    useState<FacultyRegulations>({
      roundToWholeNumber: true,
      approximateFractions: false,
      maxAbsence: 3,
      minGradeExcellent: 90,
      minGradeVeryGood: 80,
      minGradeGood: 70,
      minGradeAcceptable: 60,
      minGradeVeryWeak: 50,
      enableMercyRules: false,
      mercyRules: [],
    });

  // Program state
  const [showProgramDialog, setShowProgramDialog] =
    useState(false);
  const [editingProgram, setEditingProgram] =
    useState<Program | null>(null);
  const [programStep, setProgramStep] = useState(1);
  const [programForm, setProgramForm] = useState<
    Partial<Program>
  >({
    name: "",
    facultyId: "",
    headId: "",
    description: "",
    universityCreditHours: 128,
    facultyCreditHours: 32,
    programCreditHours: 96,
    programType: "Bachelor",
    resultDisplay: "CourseGrade",
    blockReason: "NonPaymentCurrent",
    levelsNumber: 4,
    levels: [],
    transcriptDefinition: [],
    academicLoadSemester: [],
    academicLoadGPA: [
      {
        id: "1",
        minGPA: 0,
        maxGPA: 4,
        minCredits: 12,
        maxCredits: 18,
      },
    ],
  });

  // Course state
  const [showCourseDialog, setShowCourseDialog] =
    useState(false);
  const [editingCourse, setEditingCourse] =
    useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    description: "",
    credits: 3,
    syllabus: "",
    courseType: "Mandatory",
    courseContent: "Lecture",
    lectureCredits: 3,
    labCredits: 0,
    successPercentage: 70,
    minFinalSuccessPercentage: 50,
    programId: "",
  });
  const [selectedPrerequisites, setSelectedPrerequisites] =
    useState<string[]>([]);
  const [expandedPrograms, setExpandedPrograms] = useState<
    Set<string>
  >(new Set());
  const [expandedSemesters, setExpandedSemesters] = useState<
    Set<string>
  >(new Set());

  // Helper functions
  const resetFacultyForm = () => {
    setFacultyForm({ name: "", description: "", deanId: "" });
    setRegulationsForm({
      roundToWholeNumber: true,
      approximateFractions: false,
      maxAbsence: 3,
      minGradeExcellent: 90,
      minGradeVeryGood: 80,
      minGradeGood: 70,
      minGradeAcceptable: 60,
      minGradeVeryWeak: 50,
      enableMercyRules: false,
      mercyRules: [],
    });
  };

  const resetProgramForm = () => {
    setProgramForm({
      name: "",
      facultyId: "",
      headId: "",
      description: "",
      universityCreditHours: 128,
      facultyCreditHours: 32,
      programCreditHours: 96,
      programType: "Bachelor",
      resultDisplay: "CourseGrade",
      blockReason: "NonPaymentCurrent",
      levelsNumber: 4,
      levels: [],
      transcriptDefinition: [],
      academicLoadSemester: [],
      academicLoadGPA: [
        {
          id: "1",
          minGPA: 0,
          maxGPA: 4,
          minCredits: 12,
          maxCredits: 18,
        },
      ],
    });
    setProgramStep(1);
    setEditingProgram(null);
  };

  const resetCourseForm = () => {
    setCourseForm({
      name: "",
      code: "",
      description: "",
      credits: 3,
      syllabus: "",
      courseType: "Mandatory",
      courseContent: "Lecture",
      lectureCredits: 3,
      labCredits: 0,
      successPercentage: 70,
      minFinalSuccessPercentage: 50,
      programId: "",
    });
    setSelectedPrerequisites([]);
  };

  const addMercyRule = () => {
    const newRule: MercyRule = {
      id: Date.now().toString(),
      originalScore: 0,
      adjustedScore: 0,
    };
    setRegulationsForm({
      ...regulationsForm,
      mercyRules: [...regulationsForm.mercyRules, newRule],
    });
  };

  const removeMercyRule = (ruleId: string) => {
    setRegulationsForm({
      ...regulationsForm,
      mercyRules: regulationsForm.mercyRules.filter(
        (rule) => rule.id !== ruleId,
      ),
    });
  };

  const updateMercyRule = (
    ruleId: string,
    field: keyof MercyRule,
    value: number,
  ) => {
    setRegulationsForm({
      ...regulationsForm,
      mercyRules: regulationsForm.mercyRules.map((rule) =>
        rule.id === ruleId ? { ...rule, [field]: value } : rule,
      ),
    });
  };

  // Fee management helpers
  const addFeeToLevel = (
    levelIndex: number,
    feeType: "regular" | "summer" | "semester1" | "semester2",
  ) => {
    const levels = [...(programForm.levels || [])];
    const newFee: Fee = {
      id: Date.now().toString(),
      feeType: feeType.includes("semester")
        ? "ConstantSemester"
        : "PerCreditHour",
      amount: 0,
      description: "",
    };

    if (feeType === "regular") {
      levels[levelIndex].fees.push(newFee);
    } else if (feeType === "summer") {
      levels[levelIndex].summerFees.push(newFee);
    } else if (feeType === "semester1") {
      levels[levelIndex].semesterFees.semester1.push(newFee);
    } else if (feeType === "semester2") {
      levels[levelIndex].semesterFees.semester2.push(newFee);
    }

    setProgramForm({ ...programForm, levels });
  };

  const removeFeeFromLevel = (
    levelIndex: number,
    feeId: string,
    feeType: "regular" | "summer" | "semester1" | "semester2",
  ) => {
    const levels = [...(programForm.levels || [])];

    if (feeType === "regular") {
      levels[levelIndex].fees = levels[levelIndex].fees.filter(
        (fee) => fee.id !== feeId,
      );
    } else if (feeType === "summer") {
      levels[levelIndex].summerFees = levels[
        levelIndex
      ].summerFees.filter((fee) => fee.id !== feeId);
    } else if (feeType === "semester1") {
      levels[levelIndex].semesterFees.semester1 = levels[
        levelIndex
      ].semesterFees.semester1.filter(
        (fee) => fee.id !== feeId,
      );
    } else if (feeType === "semester2") {
      levels[levelIndex].semesterFees.semester2 = levels[
        levelIndex
      ].semesterFees.semester2.filter(
        (fee) => fee.id !== feeId,
      );
    }

    setProgramForm({ ...programForm, levels });
  };

  const updateLevelFee = (
    levelIndex: number,
    feeId: string,
    feeType: "regular" | "summer" | "semester1" | "semester2",
    field: keyof Fee,
    value: any,
  ) => {
    const levels = [...(programForm.levels || [])];
    let feeArray: Fee[];

    if (feeType === "regular") {
      feeArray = levels[levelIndex].fees;
    } else if (feeType === "summer") {
      feeArray = levels[levelIndex].summerFees;
    } else if (feeType === "semester1") {
      feeArray = levels[levelIndex].semesterFees.semester1;
    } else {
      feeArray = levels[levelIndex].semesterFees.semester2;
    }

    const feeIndex = feeArray.findIndex(
      (fee) => fee.id === feeId,
    );
    if (feeIndex !== -1) {
      feeArray[feeIndex] = {
        ...feeArray[feeIndex],
        [field]: value,
      };
      setProgramForm({ ...programForm, levels });
    }
  };

  const toggleSemesterExpansion = (
    levelIndex: number,
    semester: number,
  ) => {
    const key = `${levelIndex}-${semester}`;
    const newExpanded = new Set(expandedSemesters);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSemesters(newExpanded);
  };

  // Generate levels based on levelsNumber
  const generateProgramLevels = (
    levelsNumber: number,
  ): ProgramLevel[] => {
    return Array.from({ length: levelsNumber }, (_, index) => ({
      level: index + 1,
      minCredits: 15,
      maxCredits: 18,
      fees: [
        {
          id: `fee-${index + 1}`,
          feeType: "PerCreditHour",
          amount: 100,
          description: `Level ${index + 1} tuition fee`,
        },
      ],
      semesterFees: {
        semester1: [],
        semester2: [],
      },
      summerFees: [
        {
          id: `summer-fee-${index + 1}`,
          feeType: "PerCourse",
          amount: 200,
          description: `Level ${index + 1} summer course fee`,
        },
      ],
    }));
  };

  // Generate academic load semester based on levels
  const generateAcademicLoadSemester = (
    levelsNumber: number,
  ): AcademicLoadSemester[] => {
    const loads: AcademicLoadSemester[] = [];
    for (let level = 1; level <= levelsNumber; level++) {
      for (let semester = 1; semester <= 3; semester++) {
        // 3 includes summer
        loads.push({
          level,
          semester,
          minCredits: semester === 3 ? 6 : 15, // Summer semester has lower minimum
          maxCredits: semester === 3 ? 9 : 18, // Summer semester has lower maximum
        });
      }
    }
    return loads;
  };

  // Transcript Definition helpers
  const addTranscriptDefinition = () => {
    const newDef: TranscriptDefinition = {
      id: Date.now().toString(),
      minScore: 0,
      maxScore: 100,
      minGPA: 0,
      maxGPA: 4,
      gradeLetter: "",
      equivalentEstimate: "",
    };
    setProgramForm({
      ...programForm,
      transcriptDefinition: [
        ...(programForm.transcriptDefinition || []),
        newDef,
      ],
    });
  };

  const removeTranscriptDefinition = (defId: string) => {
    setProgramForm({
      ...programForm,
      transcriptDefinition: (
        programForm.transcriptDefinition || []
      ).filter((def) => def.id !== defId),
    });
  };

  const updateTranscriptDefinition = (
    defId: string,
    field: keyof TranscriptDefinition,
    value: any,
  ) => {
    setProgramForm({
      ...programForm,
      transcriptDefinition: (
        programForm.transcriptDefinition || []
      ).map((def) =>
        def.id === defId ? { ...def, [field]: value } : def,
      ),
    });
  };

  // Academic Load GPA helpers
  const addAcademicLoadGPA = () => {
    const newLoad: AcademicLoadGPA = {
      id: Date.now().toString(),
      minGPA: 0,
      maxGPA: 4,
      minCredits: 12,
      maxCredits: 18,
    };
    setProgramForm({
      ...programForm,
      academicLoadGPA: [
        ...(programForm.academicLoadGPA || []),
        newLoad,
      ],
    });
  };

  const removeAcademicLoadGPA = (loadId: string) => {
    setProgramForm({
      ...programForm,
      academicLoadGPA: (
        programForm.academicLoadGPA || []
      ).filter((load) => load.id !== loadId),
    });
  };

  const updateAcademicLoadGPA = (
    loadId: string,
    field: keyof AcademicLoadGPA,
    value: any,
  ) => {
    setProgramForm({
      ...programForm,
      academicLoadGPA: (programForm.academicLoadGPA || []).map(
        (load) =>
          load.id === loadId
            ? { ...load, [field]: value }
            : load,
      ),
    });
  };

  const updateAcademicLoadSemester = (
    index: number,
    field: keyof AcademicLoadSemester,
    value: any,
  ) => {
    const loads = [...(programForm.academicLoadSemester || [])];
    loads[index] = { ...loads[index], [field]: value };
    setProgramForm({
      ...programForm,
      academicLoadSemester: loads,
    });
  };

  // Faculty handlers
  const handleFacultyNext = () => {
    if (
      !facultyForm.name ||
      !facultyForm.description ||
      !facultyForm.deanId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setShowRegulationsDialog(true);
  };

  const handleFacultySubmit = () => {
    const newFaculty: Faculty = {
      id: editingFaculty?.id || Date.now().toString(),
      name: facultyForm.name,
      description: facultyForm.description,
      deanId: facultyForm.deanId,
      createdAt:
        editingFaculty?.createdAt ||
        new Date().toISOString().split("T")[0],
      programsCount: editingFaculty?.programsCount || 0,
      regulations: regulationsForm,
    };

    if (editingFaculty) {
      setFaculties(
        faculties.map((f) =>
          f.id === editingFaculty.id ? newFaculty : f,
        ),
      );
      toast.success("Faculty updated successfully");
    } else {
      setFaculties([...faculties, newFaculty]);
      toast.success("Faculty added successfully");
    }

    setShowFacultyDialog(false);
    setShowRegulationsDialog(false);
    setEditingFaculty(null);
    resetFacultyForm();
  };

  // Program handlers
  const handleProgramNext = () => {
    if (programStep === 1) {
      if (
        !programForm.name ||
        !programForm.facultyId ||
        !programForm.headId
      ) {
        toast.error("Please fill in all required fields");
        return;
      }
      // Generate levels and academic loads based on levelsNumber
      const levels = generateProgramLevels(
        programForm.levelsNumber || 4,
      );
      const academicLoads = generateAcademicLoadSemester(
        programForm.levelsNumber || 4,
      );
      setProgramForm({
        ...programForm,
        levels,
        academicLoadSemester: academicLoads,
      });
      setProgramStep(2);
    } else if (programStep === 2) {
      setProgramStep(3);
    } else if (programStep === 3) {
      setProgramStep(4);
    } else if (programStep === 4) {
      setProgramStep(5);
    }
  };

  const handleProgramBack = () => {
    if (programStep > 1) {
      setProgramStep(programStep - 1);
    }
  };

  const handleProgramSubmit = () => {
    const updatedProgram: Program = {
      id: editingProgram?.id || Date.now().toString(),
      ...(programForm as Program),
      createdAt:
        editingProgram?.createdAt ||
        new Date().toISOString().split("T")[0],
    };

    if (editingProgram) {
      setPrograms(
        programs.map((p) =>
          p.id === editingProgram.id ? updatedProgram : p,
        ),
      );
      toast.success("Program updated successfully");
    } else {
      setPrograms([...programs, updatedProgram]);
      toast.success("Program created successfully");
    }

    setShowProgramDialog(false);
    resetProgramForm();
  };

  // Course handlers
  const handleCourseSubmit = () => {
    if (
      !courseForm.name ||
      !courseForm.code ||
      !courseForm.programId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate credit hours for Lecture and Lab
    if (courseForm.courseContent === "Lecture and Lab") {
      const totalCreditHours =
        (courseForm.lectureCredits || 0) +
        (courseForm.labCredits || 0);
      if (totalCreditHours !== courseForm.credits) {
        toast.error(
          "Lecture and Lab credit hours must equal total course credits",
        );
        return;
      }
    }

    const prerequisites = selectedPrerequisites.map(
      (prereqId) => ({
        id: Date.now().toString() + prereqId,
        courseId: editingCourse?.id || Date.now().toString(),
        prerequisiteId: prereqId,
      }),
    );

    const newCourse: Course = {
      id: editingCourse?.id || Date.now().toString(),
      ...courseForm,
      prerequisites,
    };

    if (editingCourse) {
      setCourses(
        courses.map((c) =>
          c.id === editingCourse.id ? newCourse : c,
        ),
      );
      toast.success("Course updated successfully");
    } else {
      setCourses([...courses, newCourse]);
      toast.success("Course added successfully");
    }

    setShowCourseDialog(false);
    setEditingCourse(null);
    resetCourseForm();
  };

  const filteredFaculties = faculties.filter((faculty) =>
    faculty.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const filteredPrograms = programs.filter((program) =>
    program.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const filteredCourses = courses.filter(
    (course) =>
      course.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      course.code
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  if (!selectedUniversity) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GraduationCap className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No University Selected
          </h3>
          <p className="text-slate-600 text-center">
            Please select a university to manage its academic
            programs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Academic Programs
          </h2>
          <p className="text-slate-600 mt-1">
            Manage faculties, programs, levels, and courses
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  Total Faculties
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {faculties.length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  Active Programs
                </p>
                <p className="text-2xl font-semibold text-green-600">
                  {programs.length}
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  Total Courses
                </p>
                <p className="text-2xl font-semibold text-purple-600">
                  {courses.length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  Course Types
                </p>
                <p className="text-2xl font-semibold text-orange-600">
                  {
                    new Set(courses.map((c) => c.courseType))
                      .size
                  }
                </p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="faculties">
              🏛️ Faculties
            </TabsTrigger>
            <TabsTrigger value="programs">
              🎓 Programs & Levels
            </TabsTrigger>
            <TabsTrigger value="courses">
              📚 Courses
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>

            {activeTab === "faculties" && (
              <Button
                onClick={() => setShowFacultyDialog(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Faculty
              </Button>
            )}
            {activeTab === "programs" && (
              <Button
                onClick={() => setShowProgramDialog(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Program
              </Button>
            )}
            {activeTab === "courses" && (
              <Button
                onClick={() => setShowCourseDialog(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Course
              </Button>
            )}
          </div>
        </div>

        {/* Tab 1: Faculties */}
        <TabsContent value="faculties">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculties.map((faculty) => {
              const dean = mockStaff.find(
                (s) => s.id === faculty.deanId,
              );
              return (
                <Card
                  key={faculty.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {faculty.name}
                          </CardTitle>
                          <p className="text-sm text-slate-500">
                            Dean: {dean?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingFaculty(faculty);
                            setFacultyForm({
                              name: faculty.name,
                              description: faculty.description,
                              deanId: faculty.deanId,
                            });
                            if (faculty.regulations) {
                              setRegulationsForm(
                                faculty.regulations,
                              );
                            }
                            setShowFacultyDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFaculties(
                              faculties.filter(
                                (f) => f.id !== faculty.id,
                              ),
                            );
                            toast.success(
                              "Faculty deleted successfully",
                            );
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm mb-4">
                      {faculty.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                          Programs:
                        </span>
                        <Badge variant="outline">
                          {faculty.programsCount}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                          Created:
                        </span>
                        <span>{faculty.createdAt}</span>
                      </div>
                      {faculty.regulations && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            Regulations:
                          </span>
                          <Badge variant="secondary">
                            Configured
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 2: Programs & Levels */}
        <TabsContent value="programs">
          <div className="space-y-4">
            {filteredPrograms.map((program) => {
              const faculty = faculties.find(
                (f) => f.id === program.facultyId,
              );
              const head = mockStaff.find(
                (s) => s.id === program.headId,
              );

              return (
                <Card key={program.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {program.name}
                          </CardTitle>
                          <p className="text-sm text-slate-500">
                            {faculty?.name} • Head: {head?.name}{" "}
                            • {program.levelsNumber} levels
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {program.programType}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {program.programCreditHours} Credits
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Set the editing program and populate the form
                            setProgramForm({
                              name: program.name,
                              facultyId: program.facultyId,
                              headId: program.headId,
                              description: program.description,
                              universityCreditHours:
                                program.universityCreditHours,
                              facultyCreditHours:
                                program.facultyCreditHours,
                              programCreditHours:
                                program.programCreditHours,
                              programType: program.programType,
                              resultDisplay:
                                program.resultDisplay,
                              blockReason: program.blockReason,
                              levelsNumber:
                                program.levelsNumber,
                              levels: program.levels,
                              transcriptDefinition:
                                program.transcriptDefinition,
                              academicLoadSemester:
                                program.academicLoadSemester,
                              academicLoadGPA:
                                program.academicLoadGPA,
                            });
                            setEditingProgram(program);
                            setShowProgramDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-slate-600 mb-4">
                      {program.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-slate-600">
                          University Credits:
                        </span>
                        <p className="font-medium">
                          {program.universityCreditHours}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600">
                          Faculty Credits:
                        </span>
                        <p className="font-medium">
                          {program.facultyCreditHours}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600">
                          Program Credits:
                        </span>
                        <p className="font-medium">
                          {program.programCreditHours}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600">
                          Result Display:
                        </span>
                        <p className="font-medium">
                          {program.resultDisplay}
                        </p>
                      </div>
                    </div>

                    {program.levels.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3">
                          Program Levels
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {program.levels.map((level) => (
                            <div
                              key={level.level}
                              className="bg-slate-50 rounded-md p-3 border"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-slate-900">
                                  Level {level.level}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {level.minCredits}-
                                  {level.maxCredits} Credits
                                </Badge>
                              </div>
                              <div className="text-xs text-slate-600">
                                <p>
                                  Regular Fees:{" "}
                                  {level.fees.length}
                                </p>
                                <p>
                                  Semester Fees:{" "}
                                  {level.semesterFees.semester1
                                    .length +
                                    level.semesterFees.semester2
                                      .length}
                                </p>
                                <p>
                                  Summer Fees:{" "}
                                  {level.summerFees.length}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 3: Courses */}
        <TabsContent value="courses">
          <div className="space-y-4">
            {programs.map((program) => {
              const isExpanded = expandedPrograms.has(
                program.id,
              );
              const programCourses = filteredCourses.filter(
                (c) => c.programId === program.id,
              );

              return (
                <Card key={program.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newExpanded = new Set(
                              expandedPrograms,
                            );
                            if (newExpanded.has(program.id)) {
                              newExpanded.delete(program.id);
                            } else {
                              newExpanded.add(program.id);
                            }
                            setExpandedPrograms(newExpanded);
                          }}
                          className="p-1"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">
                              {program.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {programCourses.length} courses
                            </p>
                          </div>
                        </div>
                      </div>

                      <Badge variant="outline">
                        {program.programType}
                      </Badge>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {programCourses.map((course) => (
                          <div
                            key={course.id}
                            className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-slate-900">
                                  {course.code}
                                </h4>
                                <p className="text-sm text-slate-600">
                                  {course.name}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {course.credits} Credits
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingCourse(course);
                                    setCourseForm({
                                      name: course.name,
                                      code: course.code,
                                      description:
                                        course.description,
                                      credits: course.credits,
                                      syllabus: course.syllabus,
                                      courseType:
                                        course.courseType,
                                      courseContent:
                                        course.courseContent,
                                      lectureCredits:
                                        course.lectureCredits ||
                                        course.credits,
                                      labCredits:
                                        course.labCredits || 0,
                                      successPercentage:
                                        course.successPercentage,
                                      minFinalSuccessPercentage:
                                        course.minFinalSuccessPercentage,
                                      programId:
                                        course.programId,
                                    });
                                    setSelectedPrerequisites(
                                      course.prerequisites.map(
                                        (p) => p.prerequisiteId,
                                      ),
                                    );
                                    setShowCourseDialog(true);
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 mb-2">
                              {course.description}
                            </p>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">
                                Type: {course.courseType}
                              </span>
                              <span className="text-slate-500">
                                Success:{" "}
                                {course.successPercentage}%
                              </span>
                              {course.prerequisites.length >
                                0 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {course.prerequisites.length}{" "}
                                    Prerequisites
                                  </Badge>
                                )}
                            </div>
                          </div>
                        ))}

                        {programCourses.length === 0 && (
                          <div className="col-span-2 text-center py-8 text-slate-500">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>
                              No courses added to this program
                              yet
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Faculty Dialog */}
      <Dialog
        open={showFacultyDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowFacultyDialog(false);
            setEditingFaculty(null);
            resetFacultyForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFaculty
                ? "Edit Faculty"
                : "Add New Faculty"}
            </DialogTitle>
            <DialogDescription>
              {editingFaculty
                ? "Update faculty information"
                : "Create a new faculty with basic information"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="faculty-name">
                  Faculty Name *
                </Label>
                <Input
                  id="faculty-name"
                  value={facultyForm.name}
                  onChange={(e) =>
                    setFacultyForm({
                      ...facultyForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., Faculty of Engineering"
                />
              </div>

              <div>
                <Label htmlFor="faculty-description">
                  Description *
                </Label>
                <Textarea
                  id="faculty-description"
                  value={facultyForm.description}
                  onChange={(e) =>
                    setFacultyForm({
                      ...facultyForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of the faculty..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="dean-select">Dean *</Label>
                <Select
                  value={facultyForm.deanId}
                  onValueChange={(value) =>
                    setFacultyForm({
                      ...facultyForm,
                      deanId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dean" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStaff.map((staff) => (
                      <SelectItem
                        key={staff.id}
                        value={staff.id}
                      >
                        {staff.name} - {staff.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFacultyDialog(false);
                  setEditingFaculty(null);
                  resetFacultyForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFacultyNext}
                className="gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Next
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Faculty Regulations Dialog */}
      <Dialog
        open={showRegulationsDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowRegulationsDialog(false);
            if (!editingFaculty) {
              setShowFacultyDialog(false);
              resetFacultyForm();
            }
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Faculty Regulations</DialogTitle>
            <DialogDescription>
              Configure academic regulations and rules for this
              faculty
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {/* Regulation Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">
                  Regulation Section
                </h3>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="round-whole">
                        Round to Whole Number
                      </Label>
                      <p className="text-xs text-slate-500">
                        Example: 85.7 → 86
                      </p>
                    </div>
                    <Switch
                      id="round-whole"
                      checked={
                        regulationsForm.roundToWholeNumber
                      }
                      onCheckedChange={(checked) =>
                        setRegulationsForm({
                          ...regulationsForm,
                          roundToWholeNumber: checked,
                        })
                      }
                    />
                  </div>

                  {!regulationsForm.roundToWholeNumber && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="approximate-fractions">
                          Approximate Fractions
                        </Label>
                        <p className="text-xs text-slate-500">
                          Example: 85.3 → 85.5, 85.7 → 85.5
                        </p>
                      </div>
                      <Switch
                        id="approximate-fractions"
                        checked={
                          regulationsForm.approximateFractions
                        }
                        onCheckedChange={(checked) =>
                          setRegulationsForm({
                            ...regulationsForm,
                            approximateFractions: checked,
                          })
                        }
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="max-absence">
                      Maximum Absence
                    </Label>
                    <Input
                      id="max-absence"
                      type="number"
                      value={regulationsForm.maxAbsence}
                      onChange={(e) =>
                        setRegulationsForm({
                          ...regulationsForm,
                          maxAbsence:
                            parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="min-excellent">
                      Minimum Grade - Excellent
                    </Label>
                    <Input
                      id="min-excellent"
                      type="number"
                      step="0.1"
                      value={regulationsForm.minGradeExcellent}
                      onChange={(e) =>
                        setRegulationsForm({
                          ...regulationsForm,
                          minGradeExcellent:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="min-very-good">
                      Minimum Grade - Very Good
                    </Label>
                    <Input
                      id="min-very-good"
                      type="number"
                      step="0.1"
                      value={regulationsForm.minGradeVeryGood}
                      onChange={(e) =>
                        setRegulationsForm({
                          ...regulationsForm,
                          minGradeVeryGood:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="min-good">
                      Minimum Grade - Good
                    </Label>
                    <Input
                      id="min-good"
                      type="number"
                      step="0.1"
                      value={regulationsForm.minGradeGood}
                      onChange={(e) =>
                        setRegulationsForm({
                          ...regulationsForm,
                          minGradeGood:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="min-acceptable">
                      Minimum Grade - Acceptable
                    </Label>
                    <Input
                      id="min-acceptable"
                      type="number"
                      step="0.1"
                      value={regulationsForm.minGradeAcceptable}
                      onChange={(e) =>
                        setRegulationsForm({
                          ...regulationsForm,
                          minGradeAcceptable:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="min-very-weak">
                      Minimum Grade - Very Weak
                    </Label>
                    <Input
                      id="min-very-weak"
                      type="number"
                      step="0.1"
                      value={regulationsForm.minGradeVeryWeak}
                      onChange={(e) =>
                        setRegulationsForm({
                          ...regulationsForm,
                          minGradeVeryWeak:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-mercy">
                    Enable Mercy Rules
                  </Label>
                  <p className="text-xs text-slate-500">
                    Allow grade adjustments based on specific
                    conditions
                  </p>
                </div>
                <Switch
                  id="enable-mercy"
                  checked={regulationsForm.enableMercyRules}
                  onCheckedChange={(checked) =>
                    setRegulationsForm({
                      ...regulationsForm,
                      enableMercyRules: checked,
                    })
                  }
                />
              </div>
            </div>

            {/* Mercy Rules Section */}
            {regulationsForm.enableMercyRules && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">
                    Mercy Rules Section
                  </h3>
                  <Separator className="flex-1" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Define score adjustment rules
                    </p>
                    <Button
                      onClick={addMercyRule}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Rule
                    </Button>
                  </div>

                  {regulationsForm.mercyRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <Label htmlFor={`original-${rule.id}`}>
                          Original Score
                        </Label>
                        <Input
                          id={`original-${rule.id}`}
                          type="number"
                          step="0.1"
                          value={rule.originalScore}
                          onChange={(e) =>
                            updateMercyRule(
                              rule.id,
                              "originalScore",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`adjusted-${rule.id}`}>
                          Adjusted Score
                        </Label>
                        <Input
                          id={`adjusted-${rule.id}`}
                          type="number"
                          step="0.1"
                          value={rule.adjustedScore}
                          onChange={(e) =>
                            updateMercyRule(
                              rule.id,
                              "adjustedScore",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMercyRule(rule.id)}
                        className="text-red-600 hover:text-red-700 mt-6"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {regulationsForm.mercyRules.length === 0 && (
                    <div className="text-center py-8 text-slate-500 border-2 border-dashed rounded-lg">
                      <p>No mercy rules configured</p>
                      <p className="text-xs">
                        Click "Add Rule" to create adjustment
                        rules
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRegulationsDialog(false);
                  if (editingFaculty) {
                    setEditingFaculty(null);
                    resetFacultyForm();
                  }
                }}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleFacultySubmit}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {editingFaculty ? "Update" : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Dialog */}
      <Dialog
        open={showCourseDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowCourseDialog(false);
            setEditingCourse(null);
            resetCourseForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Edit Course" : "Add New Course"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse
                ? "Update course information"
                : "Create a new course"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course-name">
                  Course Name *
                </Label>
                <Input
                  id="course-name"
                  value={courseForm.name}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., Introduction to Programming"
                />
              </div>

              <div>
                <Label htmlFor="course-code">
                  Course Code *
                </Label>
                <Input
                  id="course-code"
                  value={courseForm.code}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      code: e.target.value,
                    })
                  }
                  placeholder="e.g., CS-101"
                />
              </div>

              <div>
                <Label htmlFor="course-credits">
                  Credits *
                </Label>
                <Input
                  id="course-credits"
                  type="number"
                  min="1"
                  max="6"
                  value={courseForm.credits}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      credits: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="course-program">
                  Program *
                </Label>
                <Select
                  value={courseForm.programId}
                  onValueChange={(value) =>
                    setCourseForm({
                      ...courseForm,
                      programId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem
                        key={program.id}
                        value={program.id}
                      >
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="course-type">
                  Course Type *
                </Label>
                <Select
                  value={courseForm.courseType}
                  onValueChange={(value: any) =>
                    setCourseForm({
                      ...courseForm,
                      courseType: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="University Mandatory">
                      University Mandatory
                    </SelectItem>
                    <SelectItem value="Faculty Mandatory">
                      Faculty Mandatory
                    </SelectItem>
                    <SelectItem value="Program Mandatory">
                      Program Mandatory
                    </SelectItem>
                    <SelectItem value="University Elective">
                      University Elective
                    </SelectItem>
                    <SelectItem value="Faculty Elective">
                      Faculty Elective
                    </SelectItem>
                    <SelectItem value="Program Elective">
                      Program Elective
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="course-content">
                  Course Content *
                </Label>
                <Select
                  value={courseForm.courseContent}
                  onValueChange={(value: any) => {
                    const newForm = {
                      ...courseForm,
                      courseContent: value,
                    };
                    if (value === "Lecture") {
                      newForm.lectureCredits =
                        courseForm.credits;
                      newForm.labCredits = 0;
                    } else if (value === "Workshop") {
                      newForm.lectureCredits =
                        courseForm.credits;
                      newForm.labCredits = 0;
                    }
                    setCourseForm(newForm);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course content" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lecture">
                      Lecture
                    </SelectItem>
                    <SelectItem value="Lecture and Lab">
                      Lecture and Lab
                    </SelectItem>
                    <SelectItem value="Workshop">
                      Workshop
                    </SelectItem>
                    <SelectItem value="Project">
                      Project
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="success-percentage">
                  Success Percentage
                </Label>
                <Input
                  id="success-percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={courseForm.successPercentage}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      successPercentage:
                        parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="min-final-success">
                  Min Final Success Percentage
                </Label>
                <Input
                  id="min-final-success"
                  type="number"
                  min="0"
                  max="100"
                  value={courseForm.minFinalSuccessPercentage}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      minFinalSuccessPercentage:
                        parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Lecture and Lab Credits */}
            {courseForm.courseContent === "Lecture and Lab" && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3">
                  Credit Hours Distribution
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lecture-credits">
                      Lecture Credit Hours *
                    </Label>
                    <Input
                      id="lecture-credits"
                      type="number"
                      min="0"
                      value={courseForm.lectureCredits || 0}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          lectureCredits:
                            parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="lab-credits">
                      Lab Credit Hours *
                    </Label>
                    <Input
                      id="lab-credits"
                      type="number"
                      min="0"
                      value={courseForm.labCredits || 0}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          labCredits:
                            parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mt-3 p-2 bg-white rounded border">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">
                      Validation:
                    </span>{" "}
                    Lecture ({courseForm.lectureCredits || 0}) +
                    Lab ({courseForm.labCredits || 0}) ={" "}
                    {(courseForm.lectureCredits || 0) +
                      (courseForm.labCredits || 0)}
                    {(courseForm.lectureCredits || 0) +
                      (courseForm.labCredits || 0) ===
                      courseForm.credits ? (
                      <span className="text-green-600 ml-2">
                        ✓ Equals total credits (
                        {courseForm.credits})
                      </span>
                    ) : (
                      <span className="text-red-600 ml-2">
                        ✗ Must equal total credits (
                        {courseForm.credits})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="course-description">
                Description
              </Label>
              <Textarea
                id="course-description"
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    description: e.target.value,
                  })
                }
                placeholder="Brief description of the course..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="course-syllabus">Syllabus</Label>
              <Textarea
                id="course-syllabus"
                value={courseForm.syllabus}
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    syllabus: e.target.value,
                  })
                }
                placeholder="Course syllabus and topics covered..."
                rows={4}
              />
            </div>

            {/* Prerequisites Selection */}
            <div>
              <Label>Prerequisites</Label>
              <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-slate-50">
                <p className="text-sm text-slate-600 mb-3">
                  Select courses that are prerequisites for this
                  course:
                </p>
                <div className="space-y-2">
                  {courses
                    .filter(
                      (course) =>
                        course.id !== editingCourse?.id &&
                        course.programId ===
                        courseForm.programId,
                    )
                    .map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`prereq-${course.id}`}
                          checked={selectedPrerequisites.includes(
                            course.id,
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPrerequisites([
                                ...selectedPrerequisites,
                                course.id,
                              ]);
                            } else {
                              setSelectedPrerequisites(
                                selectedPrerequisites.filter(
                                  (id) => id !== course.id,
                                ),
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`prereq-${course.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          <span className="font-medium">
                            {course.code}
                          </span>{" "}
                          - {course.name}
                        </Label>
                      </div>
                    ))}
                  {courses.filter(
                    (course) =>
                      course.id !== editingCourse?.id &&
                      course.programId === courseForm.programId,
                  ).length === 0 && (
                      <p className="text-sm text-slate-500 italic">
                        No other courses available in this program
                      </p>
                    )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCourseDialog(false);
                  setEditingCourse(null);
                  resetCourseForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCourseSubmit}>
                {editingCourse ? "Update" : "Add"} Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Program Dialog */}
      <Dialog
        open={showProgramDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowProgramDialog(false);
            setEditingProgram(null);
            resetProgramForm();
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[1400px] h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <DialogTitle>
              {editingProgram
                ? "Edit Program"
                : "Add New Program"}
            </DialogTitle>
            <DialogDescription>
              {editingProgram
                ? "Update program information"
                : "Create a new academic program with detailed configuration"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-8">
              {/* Step Indicator */}
              <div className="flex items-center justify-center space-x-3 p-[0px] mlt-[2px] mt-[0px] mr-[-67px] mb-[0px] ml-[0px]">
                {[
                  { step: 1, label: "Basic Info" },
                  { step: 2, label: "Levels & Fees" },
                  { step: 3, label: "Transcript" },
                  { step: 4, label: "Academic Load" },
                  { step: 5, label: "Review" },
                ].map((item, index) => (
                  <div
                    key={item.step}
                    className="flex items-center"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${item.step <= programStep
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-600"
                          }`}
                      >
                        {item.step}
                      </div>
                      <span className="text-xs text-slate-600 mt-1 hidden sm:block">
                        {item.label}
                      </span>
                    </div>
                    {index < 4 && (
                      <div
                        className={`w-12 h-1 mx-2 ${item.step < programStep
                            ? "bg-blue-600"
                            : "bg-slate-200"
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Basic Information */}
              {programStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-slate-900">
                      🧩 Program Basic Information
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Enter the fundamental details for this
                      academic program
                    </p>
                  </div>

                  <div className="w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="md:col-span-2 lg:col-span-3">
                        <Label htmlFor="program-name">
                          Program Name *
                        </Label>
                        <Input
                          id="program-name"
                          value={programForm.name}
                          onChange={(e) =>
                            setProgramForm({
                              ...programForm,
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g., Computer Science"
                          className="text-base"
                        />
                      </div>

                      <div>
                        <Label htmlFor="program-faculty">
                          Faculty *
                        </Label>
                        <Select
                          value={programForm.facultyId}
                          onValueChange={(value) =>
                            setProgramForm({
                              ...programForm,
                              facultyId: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select faculty" />
                          </SelectTrigger>
                          <SelectContent>
                            {faculties.map((faculty) => (
                              <SelectItem
                                key={faculty.id}
                                value={faculty.id}
                              >
                                {faculty.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="program-head">
                          Program Head *
                        </Label>
                        <Select
                          value={programForm.headId}
                          onValueChange={(value) =>
                            setProgramForm({
                              ...programForm,
                              headId: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select program head" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockStaff.map((staff) => (
                              <SelectItem
                                key={staff.id}
                                value={staff.id}
                              >
                                {staff.name} - {staff.department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="program-type">
                          Program Type
                        </Label>
                        <Select
                          value={programForm.programType}
                          onValueChange={(value: any) =>
                            setProgramForm({
                              ...programForm,
                              programType: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select program type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bachelor">
                              Bachelor
                            </SelectItem>
                            <SelectItem value="Master">
                              Master
                            </SelectItem>
                            <SelectItem value="Diploma">
                              Diploma
                            </SelectItem>
                            <SelectItem value="PhD">
                              PhD
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="result-display">
                          Result Display
                        </Label>
                        <Select
                          value={programForm.resultDisplay}
                          onValueChange={(value: any) =>
                            setProgramForm({
                              ...programForm,
                              resultDisplay: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select result display" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CourseGrade">
                              Course Grade
                            </SelectItem>
                            <SelectItem value="DetailedEstimate">
                              Detailed Estimate
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="block-reason">
                          Block Reason
                        </Label>
                        <Select
                          value={programForm.blockReason}
                          onValueChange={(value: any) =>
                            setProgramForm({
                              ...programForm,
                              blockReason: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select block reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NonPaymentCurrent">
                              Non Payment Current
                            </SelectItem>
                            <SelectItem value="NonPaymentOld">
                              Non Payment Old
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="levels-number">
                          Program Levels Number
                        </Label>
                        <Input
                          id="levels-number"
                          type="number"
                          min="1"
                          max="8"
                          value={programForm.levelsNumber}
                          onChange={(e) =>
                            setProgramForm({
                              ...programForm,
                              levelsNumber:
                                parseInt(e.target.value) || 4,
                            })
                          }
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-3">
                        <Label htmlFor="program-description">
                          Description
                        </Label>
                        <Textarea
                          id="program-description"
                          value={programForm.description}
                          onChange={(e) =>
                            setProgramForm({
                              ...programForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Detailed description of the program objectives, curriculum overview, and career outcomes..."
                          rows={4}
                          className="w-full resize-none"
                        />
                      </div>

                      <div>
                        <Label htmlFor="university-credits">
                          University Credit Hours
                        </Label>
                        <Input
                          id="university-credits"
                          type="number"
                          value={
                            programForm.universityCreditHours
                          }
                          onChange={(e) =>
                            setProgramForm({
                              ...programForm,
                              universityCreditHours:
                                parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="faculty-credits">
                          Faculty Credit Hours
                        </Label>
                        <Input
                          id="faculty-credits"
                          type="number"
                          value={programForm.facultyCreditHours}
                          onChange={(e) =>
                            setProgramForm({
                              ...programForm,
                              facultyCreditHours:
                                parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="program-credits">
                          Program Credit Hours
                        </Label>
                        <Input
                          id="program-credits"
                          type="number"
                          value={programForm.programCreditHours}
                          onChange={(e) =>
                            setProgramForm({
                              ...programForm,
                              programCreditHours:
                                parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Program Levels & Fees */}
              {programStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-slate-900">
                      🧩 Program Levels & 💰 Fees Configuration
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Configure {programForm.levelsNumber} levels
                      with their credit requirements and fee
                      structures
                    </p>
                  </div>

                  <div className="space-y-8">
                    {programForm.levels &&
                      programForm.levels.map(
                        (level, levelIndex) => (
                          <Card
                            key={level.level}
                            className="border-2 border-slate-200"
                          >
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                  Level {level.level}
                                </CardTitle>
                                <Badge
                                  variant="outline"
                                  className="text-sm"
                                >
                                  {level.minCredits}-
                                  {level.maxCredits} Credits
                                </Badge>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                              {/* Credit Hours Configuration */}
                              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                <div>
                                  <Label
                                    htmlFor={`min-credits-${levelIndex}`}
                                  >
                                    Minimum Credits
                                  </Label>
                                  <Input
                                    id={`min-credits-${levelIndex}`}
                                    type="number"
                                    value={level.minCredits}
                                    onChange={(e) => {
                                      const levels = [
                                        ...(programForm.levels ||
                                          []),
                                      ];
                                      levels[
                                        levelIndex
                                      ].minCredits =
                                        parseInt(
                                          e.target.value,
                                        ) || 0;
                                      setProgramForm({
                                        ...programForm,
                                        levels,
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`max-credits-${levelIndex}`}
                                  >
                                    Maximum Credits
                                  </Label>
                                  <Input
                                    id={`max-credits-${levelIndex}`}
                                    type="number"
                                    value={level.maxCredits}
                                    onChange={(e) => {
                                      const levels = [
                                        ...(programForm.levels ||
                                          []),
                                      ];
                                      levels[
                                        levelIndex
                                      ].maxCredits =
                                        parseInt(
                                          e.target.value,
                                        ) || 0;
                                      setProgramForm({
                                        ...programForm,
                                        levels,
                                      });
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Regular Fees Section */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-slate-900">
                                    💰 Regular Fees
                                  </h5>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      addFeeToLevel(
                                        levelIndex,
                                        "regular",
                                      )
                                    }
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Fee
                                  </Button>
                                </div>
                                <div className="space-y-3">
                                  {level.fees.map((fee) => (
                                    <div
                                      key={fee.id}
                                      className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg bg-white shadow-sm"
                                    >
                                      <div className="col-span-12 lg:col-span-3 p-[0px] mx-[14px] my--2[0px] m mx-[-1px] my-[0px]y-[0px] my-[0px]">
                                        <Select
                                          value={fee.feeType}
                                          onValueChange={(
                                            value: any,
                                          ) =>
                                            updateLevelFee(
                                              levelIndex,
                                              fee.id,
                                              "regular",
                                              "feeType",
                                              value,
                                            )
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="ConstantYear">
                                              Constant Year
                                            </SelectItem>
                                            <SelectItem value="ConstantSemester">
                                              Constant Semester
                                            </SelectItem>
                                            <SelectItem value="PerCreditHour">
                                              Per Credit Hour
                                            </SelectItem>
                                            <SelectItem value="PerCourse">
                                              Per Course
                                            </SelectItem>
                                            <SelectItem value="Administrative">
                                              Administrative
                                            </SelectItem>
                                            <SelectItem value="Other">
                                              Other
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      {fee.feeType ===
                                        "ConstantSemester" && (
                                          <div className="col-span-12 lg:col-span-2 px-[13210876543210px] p-[0px] mx-[39876543210px] mx-[-1px]mx-[1px] mx-[-2px my-[0px]] m-[0px] m mx-[-44px]x-[-43px]">
                                            <Select
                                              value={fee.semesterId}
                                              onValueChange={(
                                                value,
                                              ) =>
                                                updateLevelFee(
                                                  levelIndex,
                                                  fee.id,
                                                  "regular",
                                                  "semesterId",
                                                  value,
                                                )
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Semester" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="1">
                                                  Semester 1
                                                </SelectItem>
                                                <SelectItem value="2">
                                                  Semester 2
                                                </SelectItem>
                                                <SelectItem value="3">
                                                  Semester 3
                                                  (Summer)
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        )}
                                      <div
                                        className={
                                          fee.feeType ===
                                            "ConstantSemester"
                                            ? "col-span-12 lg:col-span-2"
                                            : "col-span-12 lg:col-span-4"
                                        }
                                      >
                                        <Input
                                          type="number"
                                          placeholder="Amount"
                                          value={fee.amount}
                                          onChange={(e) =>
                                            updateLevelFee(
                                              levelIndex,
                                              fee.id,
                                              "regular",
                                              "amount",
                                              parseFloat(
                                                e.target.value,
                                              ) || 0,
                                            )
                                          }
                                        />
                                      </div>
                                      <div
                                        className={
                                          fee.feeType ===
                                            "ConstantSemester"
                                            ? "col-span-11 lg:col-span-5"
                                            : "col-span-11 lg:col-span-6"
                                        }
                                      >
                                        <Input
                                          placeholder="Fee description (e.g., Tuition fee, Lab fee, etc.)"
                                          value={fee.description}
                                          onChange={(e) =>
                                            updateLevelFee(
                                              levelIndex,
                                              fee.id,
                                              "regular",
                                              "description",
                                              e.target.value,
                                            )
                                          }
                                          className="w-full"
                                        />
                                      </div>
                                      <div className="col-span-1 lg:col-span-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            removeFeeFromLevel(
                                              levelIndex,
                                              fee.id,
                                              "regular",
                                            )
                                          }
                                          className="w-full"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  {level.fees.length === 0 && (
                                    <div className="text-center py-6 text-slate-500 border-2 border-dashed rounded-lg">
                                      <p>
                                        No regular fees configured
                                      </p>
                                      <p className="text-xs">
                                        Click "Add Fee" to add fee
                                        structures
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Summer Course Fees Section */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-slate-900">
                                    ☀️ Summer Course Fees
                                  </h5>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      addFeeToLevel(
                                        levelIndex,
                                        "summer",
                                      )
                                    }
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Summer Fee
                                  </Button>
                                </div>
                                <div className="space-y-3">
                                  {level.summerFees.map((fee) => (
                                    <div
                                      key={fee.id}
                                      className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg bg-orange-50 shadow-sm"
                                    >
                                      <div className="col-span-12 lg:col-span-3">
                                        <Select
                                          value={fee.feeType}
                                          onValueChange={(
                                            value: any,
                                          ) =>
                                            updateLevelFee(
                                              levelIndex,
                                              fee.id,
                                              "summer",
                                              "feeType",
                                              value,
                                            )
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="ConstantYear">
                                              Constant Year
                                            </SelectItem>
                                            <SelectItem value="ConstantSemester">
                                              Constant Semester
                                            </SelectItem>
                                            <SelectItem value="PerCreditHour">
                                              Per Credit Hour
                                            </SelectItem>
                                            <SelectItem value="PerCourse">
                                              Per Course
                                            </SelectItem>
                                            <SelectItem value="Administrative">
                                              Administrative
                                            </SelectItem>
                                            <SelectItem value="Other">
                                              Other
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      {fee.feeType ===
                                        "ConstantSemester" && (
                                          <div className="col-span-12 lg:col-span-2">
                                            <Select
                                              value={fee.semesterId}
                                              onValueChange={(
                                                value,
                                              ) =>
                                                updateLevelFee(
                                                  levelIndex,
                                                  fee.id,
                                                  "summer",
                                                  "semesterId",
                                                  value,
                                                )
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Semester" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="1">
                                                  Semester 1
                                                </SelectItem>
                                                <SelectItem value="2">
                                                  Semester 2
                                                </SelectItem>
                                                <SelectItem value="3">
                                                  Semester 3
                                                  (Summer)
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        )}
                                      <div
                                        className={
                                          fee.feeType ===
                                            "ConstantSemester"
                                            ? "col-span-12 lg:col-span-2"
                                            : "col-span-12 lg:col-span-4"
                                        }
                                      >
                                        <Input
                                          type="number"
                                          placeholder="Amount"
                                          value={fee.amount}
                                          onChange={(e) =>
                                            updateLevelFee(
                                              levelIndex,
                                              fee.id,
                                              "summer",
                                              "amount",
                                              parseFloat(
                                                e.target.value,
                                              ) || 0,
                                            )
                                          }
                                        />
                                      </div>
                                      <div
                                        className={
                                          fee.feeType ===
                                            "ConstantSemester"
                                            ? "col-span-11 lg:col-span-5"
                                            : "col-span-11 lg:col-span-6"
                                        }
                                      >
                                        <Input
                                          placeholder="Summer fee description (e.g., Summer course fee, Intensive workshop fee, etc.)"
                                          value={fee.description}
                                          onChange={(e) =>
                                            updateLevelFee(
                                              levelIndex,
                                              fee.id,
                                              "summer",
                                              "description",
                                              e.target.value,
                                            )
                                          }
                                          className="w-full"
                                        />
                                      </div>
                                      <div className="col-span-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            removeFeeFromLevel(
                                              levelIndex,
                                              fee.id,
                                              "summer",
                                            )
                                          }
                                          className="w-full"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  {level.summerFees.length ===
                                    0 && (
                                      <div className="text-center py-6 text-slate-500 border-2 border-dashed rounded-lg">
                                        <p>
                                          No summer fees configured
                                        </p>
                                        <p className="text-xs">
                                          Click "Add Summer Fee" to
                                          add summer course fee
                                          structures
                                        </p>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ),
                      )}
                  </div>
                </div>
              )}

              {/* Step 3: Program Transcript Definition */}
              {programStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-slate-900">
                      📘 Program Transcript Definition
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Define grading scales and transcript display
                      formats
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900">
                        Transcript Grade Definitions
                      </h4>
                      <Button
                        onClick={addTranscriptDefinition}
                        size="sm"
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Definition
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {(
                        programForm.transcriptDefinition || []
                      ).map((def) => (
                        <Card key={def.id} className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
                            <div>
                              <Label
                                htmlFor={`min-score-${def.id}`}
                              >
                                Min Score
                              </Label>
                              <Input
                                id={`min-score-${def.id}`}
                                type="number"
                                step="0.1"
                                value={def.minScore}
                                onChange={(e) =>
                                  updateTranscriptDefinition(
                                    def.id,
                                    "minScore",
                                    parseFloat(e.target.value) ||
                                    0,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`max-score-${def.id}`}
                              >
                                Max Score
                              </Label>
                              <Input
                                id={`max-score-${def.id}`}
                                type="number"
                                step="0.1"
                                value={def.maxScore}
                                onChange={(e) =>
                                  updateTranscriptDefinition(
                                    def.id,
                                    "maxScore",
                                    parseFloat(e.target.value) ||
                                    0,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`min-gpa-${def.id}`}
                              >
                                Min GPA
                              </Label>
                              <Input
                                id={`min-gpa-${def.id}`}
                                type="number"
                                step="0.1"
                                value={def.minGPA}
                                onChange={(e) =>
                                  updateTranscriptDefinition(
                                    def.id,
                                    "minGPA",
                                    parseFloat(e.target.value) ||
                                    0,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`max-gpa-${def.id}`}
                              >
                                Max GPA
                              </Label>
                              <Input
                                id={`max-gpa-${def.id}`}
                                type="number"
                                step="0.1"
                                value={def.maxGPA}
                                onChange={(e) =>
                                  updateTranscriptDefinition(
                                    def.id,
                                    "maxGPA",
                                    parseFloat(e.target.value) ||
                                    0,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`grade-letter-${def.id}`}
                              >
                                Grade Letter
                              </Label>
                              <Input
                                id={`grade-letter-${def.id}`}
                                value={def.gradeLetter}
                                onChange={(e) =>
                                  updateTranscriptDefinition(
                                    def.id,
                                    "gradeLetter",
                                    e.target.value,
                                  )
                                }
                                placeholder="A, B, C, etc."
                                maxLength={10}
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`equivalent-estimate-${def.id}`}
                              >
                                Equivalent Estimate
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  id={`equivalent-estimate-${def.id}`}
                                  value={def.equivalentEstimate}
                                  onChange={(e) =>
                                    updateTranscriptDefinition(
                                      def.id,
                                      "equivalentEstimate",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Excellent, Very Good, etc."
                                  maxLength={50}
                                  className="flex-1"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    removeTranscriptDefinition(
                                      def.id,
                                    )
                                  }
                                  className="px-3"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}

                      {(programForm.transcriptDefinition || [])
                        .length === 0 && (
                          <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-lg">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>
                              No transcript definitions configured
                            </p>
                            <p className="text-xs">
                              Click "Add Definition" to create
                              grading scale entries
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Academic Load Semester */}
              {programStep === 4 && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-slate-900">
                      📚 Academic Load Semester Configuration
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Auto-generated semester load limits for{" "}
                      {programForm.levelsNumber} levels (including
                      summer)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(programForm.academicLoadSemester || []).map(
                      (load, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge
                                variant={
                                  load.semester === 3
                                    ? "secondary"
                                    : "default"
                                }
                              >
                                Level {load.level} -{" "}
                                {load.semester === 3
                                  ? "Summer"
                                  : `Semester ${load.semester}`}
                              </Badge>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <Label
                                  htmlFor={`load-min-${index}`}
                                >
                                  Minimum Credits
                                </Label>
                                <Input
                                  id={`load-min-${index}`}
                                  type="number"
                                  value={load.minCredits}
                                  onChange={(e) =>
                                    updateAcademicLoadSemester(
                                      index,
                                      "minCredits",
                                      parseInt(e.target.value) ||
                                      0,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor={`load-max-${index}`}
                                >
                                  Maximum Credits
                                </Label>
                                <Input
                                  id={`load-max-${index}`}
                                  type="number"
                                  value={load.maxCredits}
                                  onChange={(e) =>
                                    updateAcademicLoadSemester(
                                      index,
                                      "maxCredits",
                                      parseInt(e.target.value) ||
                                      0,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ),
                    )}
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-slate-900 mb-4">
                      🎓 Academic Load by GPA
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                          Configure credit load limits based on
                          student GPA ranges
                        </p>
                        <Button
                          onClick={addAcademicLoadGPA}
                          size="sm"
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add GPA Range
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {(programForm.academicLoadGPA || []).map(
                          (load) => (
                            <Card key={load.id} className="p-4">
                              <div className="grid grid-cols-5 gap-4 items-end">
                                <div>
                                  <Label
                                    htmlFor={`gpa-min-${load.id}`}
                                  >
                                    Min GPA
                                  </Label>
                                  <Input
                                    id={`gpa-min-${load.id}`}
                                    type="number"
                                    step="0.1"
                                    value={load.minGPA}
                                    onChange={(e) =>
                                      updateAcademicLoadGPA(
                                        load.id,
                                        "minGPA",
                                        parseFloat(
                                          e.target.value,
                                        ) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`gpa-max-${load.id}`}
                                  >
                                    Max GPA
                                  </Label>
                                  <Input
                                    id={`gpa-max-${load.id}`}
                                    type="number"
                                    step="0.1"
                                    value={load.maxGPA}
                                    onChange={(e) =>
                                      updateAcademicLoadGPA(
                                        load.id,
                                        "maxGPA",
                                        parseFloat(
                                          e.target.value,
                                        ) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`gpa-min-credits-${load.id}`}
                                  >
                                    Min Credits
                                  </Label>
                                  <Input
                                    id={`gpa-min-credits-${load.id}`}
                                    type="number"
                                    value={load.minCredits}
                                    onChange={(e) =>
                                      updateAcademicLoadGPA(
                                        load.id,
                                        "minCredits",
                                        parseInt(
                                          e.target.value,
                                        ) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`gpa-max-credits-${load.id}`}
                                  >
                                    Max Credits
                                  </Label>
                                  <Input
                                    id={`gpa-max-credits-${load.id}`}
                                    type="number"
                                    value={load.maxCredits}
                                    onChange={(e) =>
                                      updateAcademicLoadGPA(
                                        load.id,
                                        "maxCredits",
                                        parseInt(
                                          e.target.value,
                                        ) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      removeAcademicLoadGPA(
                                        load.id,
                                      )
                                    }
                                    className="w-full"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ),
                        )}

                        {(programForm.academicLoadGPA || [])
                          .length === 0 && (
                            <div className="text-center py-8 text-slate-500 border-2 border-dashed rounded-lg">
                              <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>
                                No GPA-based academic load rules
                                configured
                              </p>
                              <p className="text-xs">
                                Click "Add GPA Range" to create
                                credit load limits based on GPA
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Final Review */}
              {programStep === 5 && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-slate-900">
                      ✅ Final Review & Submit
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Review all program configuration before
                      submission
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h4 className="font-medium text-slate-900 mb-4">
                        Program Overview
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Program Name:
                          </span>
                          <span className="font-medium">
                            {programForm.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Faculty:
                          </span>
                          <span className="font-medium">
                            {
                              faculties.find(
                                (f) =>
                                  f.id === programForm.facultyId,
                              )?.name
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Program Head:
                          </span>
                          <span className="font-medium">
                            {
                              mockStaff.find(
                                (s) =>
                                  s.id === programForm.headId,
                              )?.name
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Program Type:
                          </span>
                          <span className="font-medium">
                            {programForm.programType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Number of Levels:
                          </span>
                          <span className="font-medium">
                            {programForm.levelsNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Program Credit Hours:
                          </span>
                          <span className="font-medium">
                            {programForm.programCreditHours}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Result Display:
                          </span>
                          <span className="font-medium">
                            {programForm.resultDisplay}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Block Reason:
                          </span>
                          <span className="font-medium">
                            {programForm.blockReason}
                          </span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-medium text-slate-900 mb-4">
                        Configuration Summary
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Total Fee Types:
                          </span>
                          <span className="font-medium">
                            {(programForm.levels || []).reduce(
                              (total, level) =>
                                total +
                                level.fees.length +
                                level.summerFees.length,
                              0,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Transcript Definitions:
                          </span>
                          <span className="font-medium">
                            {
                              (
                                programForm.transcriptDefinition ||
                                []
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Academic Load Rules:
                          </span>
                          <span className="font-medium">
                            {
                              (
                                programForm.academicLoadSemester ||
                                []
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            GPA Load Rules:
                          </span>
                          <span className="font-medium">
                            {
                              (programForm.academicLoadGPA || [])
                                .length
                            }
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {programForm.description && (
                    <Card className="p-6">
                      <h4 className="font-medium text-slate-900 mb-2">
                        Program Description
                      </h4>
                      <p className="text-sm text-slate-600">
                        {programForm.description}
                      </p>
                    </Card>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Navigation Buttons - Fixed at bottom */}
          <div className="flex justify-between items-center px-6 py-4 border-t bg-white shrink-0">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowProgramDialog(false);
                  setEditingProgram(null);
                  resetProgramForm();
                }}
              >
                Cancel
              </Button>
              {programStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleProgramBack}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                Step {programStep} of 5
              </span>
              {programStep < 5 ? (
                <Button
                  onClick={handleProgramNext}
                  className="gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleProgramSubmit}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  {editingProgram ? "Update" : "Create"}{" "}
                  Program
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
