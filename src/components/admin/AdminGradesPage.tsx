import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SearchableSelect } from "../ui/searchable-select";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileSpreadsheet,
  Loader,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AttendanceService } from "../../api/modules/attendance/attendance.service";
import { CourseService } from "../../api/modules/course/course.service";
import type { User as AppUser } from "../../App";
import type {
  AttendanceCourseSummary,
  CourseAssessment,
  CourseAssessmentType,
  CourseStudentGrades,
  StaffAttendanceCourse,
} from "../../api/types";
import { useResolvedSemester } from "../../hooks/useResolvedSemester";

interface AdminGradesPageProps {
  user: AppUser;
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

interface CourseOption {
  value: string;
  courseId: number;
  label: string;
  description: string;
}

interface GradeColumn {
  id: string;
  assessmentId: number;
  name: string;
  assessmentType: CourseAssessmentType;
  maxMark: number;
}

interface StudentGrade {
  id: string;
  studentName: string;
  rollNumber: string;
  grades: Record<string, number | null>;
  gradeIds: Record<string, number>;
  total: number;
  equivalentGrade: string;
  finalGrade: string;
}

const gradeScale = [
  { grade: "A", min: 90, max: 101, equivalent: "Excellent" },
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

const assessmentTypes: CourseAssessmentType[] = ["Quiz", "Assignment", "Midterm", "Final", "Project"];

const emptyAssessmentForm = {
  label: "",
  assessmentType: "Assignment" as CourseAssessmentType,
  marks: "10",
};

function calculateGrade(total: number, maxTotal: number) {
  if (maxTotal <= 0) return { grade: "", equivalent: "" };

  const percentage = (total / maxTotal) * 100;
  const matched = gradeScale.find((scale) => percentage >= scale.min && percentage < scale.max);
  return matched ? { grade: matched.grade, equivalent: matched.equivalent } : { grade: "F", equivalent: "Fail" };
}

function buildCourseOptions(options: AttendanceCourseSummary[]): CourseOption[] {
  return options
    .map((item) => ({
      value: String(item.courseId),
      courseId: item.courseId,
      label: `${item.course.code} - ${item.course.name}`,
      description: item.course.description?.trim() || `${item.course.credits} credit hours`,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

function buildStaffCourseOptions(options: StaffAttendanceCourse[]): CourseOption[] {
  return options
    .map((item) => ({
      value: String(item.courseId),
      courseId: item.courseId,
      label: `${item.courseCode} - ${item.courseName}`,
      description: item.description?.trim() || `${item.courseCredits} credit hours`,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

function canUseStaffScopedCourses(user: AppUser): boolean {
  return user.role === "faculty";
}

function buildStudentGrades(students: CourseStudentGrades[], columns: GradeColumn[]): StudentGrade[] {
  return students.map((student) => {
    const grades: Record<string, number | null> = {};
    const gradeIds: Record<string, number> = {};

    columns.forEach((column) => {
      const record = student.grades.find((grade) => grade.assessmentId === column.assessmentId);
      grades[column.id] = record ? record.obtainedMarks : null;
      if (record) gradeIds[column.id] = record.gradeId;
    });

    const allFilled = columns.every((column) => grades[column.id] !== null && grades[column.id] !== undefined);
    const total = allFilled ? Object.values(grades).reduce((sum, mark) => sum + (mark ?? 0), 0) : 0;
    const maxTotal = columns.reduce((sum, column) => sum + column.maxMark, 0);
    const calculated = allFilled ? calculateGrade(total, maxTotal) : { grade: "", equivalent: "" };

    return {
      id: student.universityStudentId,
      studentName: student.studentName,
      rollNumber: student.universityStudentId,
      grades,
      gradeIds,
      total,
      equivalentGrade: calculated.equivalent,
      finalGrade: calculated.grade,
    };
  });
}

export function AdminGradesPage({ user, selectedUniversity }: AdminGradesPageProps) {
  const {
    semesterId: activeSemesterId,
    isLoading: isResolvingSemester,
  } = useResolvedSemester({
    universityId: selectedUniversity,
    fallbackSemesterId: user.currentSemesterId ?? null,
  });
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [gradeColumns, setGradeColumns] = useState<GradeColumn[]>([]);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [initialData, setInitialData] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<GradeColumn | null>(null);
  const [assessmentForm, setAssessmentForm] = useState(emptyAssessmentForm);
  const [assessmentSubmitting, setAssessmentSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      if (isResolvingSemester) return;

      if (!activeSemesterId) {
        setCourses([]);
        setSelectedCourse("");
        setGradeColumns([]);
        setStudentGrades([]);
        return;
      }

      try {
        setIsLoadingCourses(true);
        const nextCourses = canUseStaffScopedCourses(user)
          ? buildStaffCourseOptions(await AttendanceService.getStaffCourses(Number(user.id)))
          : buildCourseOptions(await AttendanceService.getCourseSummaries({ semesterId: activeSemesterId }));
        setCourses(nextCourses);
      } catch (error) {
        console.error("Failed to load grade courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setIsLoadingCourses(false);
      }
    };

    void fetchCourses();
  }, [activeSemesterId, isResolvingSemester, user]);

  useEffect(() => {
    if (!selectedCourse || !courses.some((course) => course.value === selectedCourse)) {
      setSelectedCourse("");
      setGradeColumns([]);
      setStudentGrades([]);
      setInitialData("");
      setHasChanges(false);
    }
  }, [courses, selectedCourse]);

  const loadCourseGrades = async (courseId: number, options?: { quiet?: boolean }) => {
    try {
      if (!options?.quiet) setIsLoadingGrades(true);
      const [assessments, students] = await Promise.all([
        CourseService.getAssessments(courseId),
        CourseService.getStudents(courseId),
      ]);

      const columns = assessments.map((assessment: CourseAssessment) => ({
        id: String(assessment.assessmentId),
        assessmentId: assessment.assessmentId,
        name: assessment.label,
        assessmentType: assessment.assessmentType as CourseAssessmentType,
        maxMark: assessment.maxMarks,
      }));
      const nextStudents = buildStudentGrades(students, columns);

      setGradeColumns(columns);
      setStudentGrades(nextStudents);
      setInitialData(JSON.stringify(nextStudents));
      setHasChanges(false);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to load course grades:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load grades");
    } finally {
      if (!options?.quiet) setIsLoadingGrades(false);
    }
  };

  useEffect(() => {
    if (!selectedCourse) return;
    void loadCourseGrades(Number(selectedCourse));
  }, [selectedCourse]);

  const selectedCourseInfo = courses.find((course) => course.value === selectedCourse);
  const maxTotal = gradeColumns.reduce((sum, column) => sum + column.maxMark, 0);
  const totalPages = Math.max(1, Math.ceil(studentGrades.length / studentsPerPage));
  const startIndex = (currentPage - 1) * studentsPerPage;
  const paginatedStudents = studentGrades.slice(startIndex, startIndex + studentsPerPage);

  const gradeDistribution = useMemo(() => {
    return gradeScale.map((scale) => ({
      grade: scale.grade,
      count: studentGrades.filter((student) => student.finalGrade === scale.grade).length,
      color: scale.grade.startsWith("A")
        ? "#10b981"
        : scale.grade.startsWith("B")
          ? "#3b82f6"
          : scale.grade.startsWith("C")
            ? "#f59e0b"
            : scale.grade.startsWith("D")
              ? "#f97316"
              : "#ef4444",
    }));
  }, [studentGrades]);

  const updateGrade = (studentId: string, columnId: string, value: string) => {
    const nextValue = value === "" ? null : Number(value);
    const column = gradeColumns.find((item) => item.id === columnId);

    if (!column) return;
    if (nextValue !== null && (!Number.isFinite(nextValue) || nextValue < 0)) {
      toast.error("Grade must be a positive number");
      return;
    }
    if (nextValue !== null && nextValue > column.maxMark) {
      toast.error(`Grade cannot exceed maximum mark of ${column.maxMark}`);
      return;
    }

    setStudentGrades((current) => {
      const next = current.map((student) => {
        if (student.id !== studentId) return student;

        const grades = { ...student.grades, [columnId]: nextValue };
        const allFilled = gradeColumns.every((item) => grades[item.id] !== null && grades[item.id] !== undefined);
        const total = allFilled ? Object.values(grades).reduce((sum, mark) => sum + (mark ?? 0), 0) : 0;
        const calculated = allFilled ? calculateGrade(total, maxTotal) : { grade: "", equivalent: "" };

        return {
          ...student,
          grades,
          total,
          equivalentGrade: calculated.equivalent,
          finalGrade: calculated.grade,
        };
      });

      setHasChanges(JSON.stringify(next) !== initialData);
      return next;
    });
  };

  const handleGradeKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    studentIndex: number,
    columnIndex: number,
  ) => {
    const keyMoves = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Enter"];
    if (!keyMoves.includes(event.key)) return;

    event.preventDefault();

    let nextStudentIndex = studentIndex;
    let nextColumnIndex = columnIndex;

    if (event.key === "ArrowRight") nextColumnIndex = Math.min(columnIndex + 1, gradeColumns.length - 1);
    if (event.key === "ArrowLeft") nextColumnIndex = Math.max(columnIndex - 1, 0);
    if (event.key === "ArrowDown" || event.key === "Enter") nextStudentIndex = Math.min(studentIndex + 1, studentGrades.length - 1);
    if (event.key === "ArrowUp") nextStudentIndex = Math.max(studentIndex - 1, 0);

    const nextStudent = studentGrades[nextStudentIndex];
    const nextColumn = gradeColumns[nextColumnIndex];
    const nextInput = nextStudent && nextColumn ? inputRefs.current[`${nextStudent.id}-${nextColumn.id}`] : null;

    nextInput?.focus();
    nextInput?.select();
  };

  const submitGrades = async () => {
    if (!selectedCourse || !hasChanges) return;

    const original = new Map<string, StudentGrade>(
      (JSON.parse(initialData || "[]") as StudentGrade[]).map((student) => [student.id, student]),
    );

    const updates = studentGrades.flatMap((student) =>
      gradeColumns
        .filter((column) => student.grades[column.id] !== original.get(student.id)?.grades[column.id])
        .map((column) => ({
          gradeId: student.gradeIds[column.id],
          marks: student.grades[column.id] ?? 0,
        }))
        .filter((item) => Number.isFinite(item.gradeId)),
    );

    if (updates.length === 0) {
      setHasChanges(false);
      return;
    }

    try {
      setIsSaving(true);
      await Promise.all(updates.map((item) => CourseService.updateStudentGrade(item.gradeId, { marks: item.marks })));
      await loadCourseGrades(Number(selectedCourse), { quiet: true });
      toast.success(`Saved ${updates.length} grade update${updates.length === 1 ? "" : "s"}`);
    } catch (error) {
      console.error("Failed to save grades:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save grades");
    } finally {
      setIsSaving(false);
    }
  };

  const openCreateAssessmentDialog = () => {
    setEditingColumn(null);
    setAssessmentForm(emptyAssessmentForm);
    setAssessmentDialogOpen(true);
  };

  const openEditAssessmentDialog = (column: GradeColumn) => {
    setEditingColumn(column);
    setAssessmentForm({
      label: column.name,
      assessmentType: column.assessmentType,
      marks: String(column.maxMark),
    });
    setAssessmentDialogOpen(true);
  };

  const saveAssessment = async () => {
    if (!selectedCourse) {
      toast.error("Please select a course first");
      return;
    }

    const label = assessmentForm.label.trim();
    const marks = Number(assessmentForm.marks);

    if (!label) {
      toast.error("Assessment name is required");
      return;
    }

    if (!Number.isFinite(marks) || marks <= 0 || marks > 100) {
      toast.error("Maximum mark must be between 0 and 100");
      return;
    }

    try {
      setAssessmentSubmitting(true);
      const courseId = Number(selectedCourse);

      if (editingColumn) {
        const optimisticColumns = gradeColumns.map((column) =>
          column.id === editingColumn.id
            ? {
              ...column,
              name: label,
              assessmentType: assessmentForm.assessmentType,
              maxMark: marks,
            }
            : column,
        );
        setGradeColumns(optimisticColumns);

        await CourseService.updateAssessments(courseId, {
          assessments: [{
            assessmentId: editingColumn.assessmentId,
            label,
            assessmentType: assessmentForm.assessmentType,
            marks,
          }],
        });
        toast.success("Assessment updated");
      } else {
        await CourseService.createAssessment(courseId, {
          label,
          assessmentType: assessmentForm.assessmentType,
          marks,
        });
        toast.success("Assessment created");
      }

      setAssessmentDialogOpen(false);
      setEditingColumn(null);
      setAssessmentForm(emptyAssessmentForm);
      await loadCourseGrades(Number(selectedCourse), { quiet: true });
    } catch (error) {
      console.error("Failed to save assessment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save assessment");
      if (selectedCourse) {
        await loadCourseGrades(Number(selectedCourse), { quiet: true });
      }
    } finally {
      setAssessmentSubmitting(false);
    }
  };

  const removeAssessment = async (column: GradeColumn) => {
    const confirmed = window.confirm(`Remove "${column.name}" and its grade records?`);
    if (!confirmed) return;

    try {
      setAssessmentSubmitting(true);
      const nextColumns = gradeColumns.filter((item) => item.id !== column.id);
      setGradeColumns(nextColumns);
      setStudentGrades((current) => current.map((student) => {
        const grades = { ...student.grades };
        const gradeIds = { ...student.gradeIds };
        delete grades[column.id];
        delete gradeIds[column.id];
        return { ...student, grades, gradeIds };
      }));

      await CourseService.deleteAssessment(column.assessmentId);
      toast.success("Assessment removed");
      if (selectedCourse) {
        await loadCourseGrades(Number(selectedCourse), { quiet: true });
      }
    } catch (error) {
      console.error("Failed to remove assessment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove assessment");
      if (selectedCourse) {
        await loadCourseGrades(Number(selectedCourse), { quiet: true });
      }
    } finally {
      setAssessmentSubmitting(false);
    }
  };

  const downloadGrades = () => {
    if (!selectedCourseInfo) return;

    const headers = [
      "Student ID",
      "Student Name",
      ...gradeColumns.map((column) => `${column.name} (/${column.maxMark})`),
      `Total (/${maxTotal})`,
      "Equivalent Grade",
      "Final Grade",
    ];
    const rows = studentGrades.map((student) => [
      student.rollNumber,
      student.studentName,
      ...gradeColumns.map((column) => student.grades[column.id]?.toString() ?? ""),
      student.total ? student.total.toFixed(2) : "",
      student.equivalentGrade,
      student.finalGrade,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = `${selectedCourseInfo.label.replace(/[^a-zA-Z0-9-]/g, "_")}_Grades_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getGradeBadgeColor = (grade: string) => {
    if (!grade) return "bg-slate-100 text-slate-800";
    if (grade.startsWith("A")) return "bg-green-100 text-green-800";
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-800";
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800";
    if (grade.startsWith("D")) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-slate-900">Grades Management</h2>
        <p className="text-slate-600 mt-1">Manage student assessment marks for assigned courses.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Select Course
          </CardTitle>
          <CardDescription>
            {isResolvingSemester
              ? "Resolving the current semester"
              : activeSemesterId
                ? "Choose a course to manage grades"
                : "No semester is available for this university"}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-3xl">
          {isLoadingCourses || isResolvingSemester ? (
            <div className="flex items-center gap-2 text-slate-600">
              <Loader className="w-4 h-4 animate-spin" />
              {isResolvingSemester ? "Resolving semester..." : "Loading courses..."}
            </div>
          ) : (
            <SearchableSelect
              value={selectedCourse}
              onValueChange={setSelectedCourse}
              options={courses.map((course) => ({
                value: course.value,
                label: course.label,
                description: course.description,
              }))}
              className="max-w-2xl"
              placeholder="Choose a course"
              searchPlaceholder="Search by course or program..."
              emptyMessage={activeSemesterId ? "No courses found." : "No semester available."}
            />
          )}
        </CardContent>
      </Card>

      {selectedCourse && (
        <Card>
          <CardHeader>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
              <div className="min-w-0 space-y-1">
                <CardTitle>Student Grades</CardTitle>
                <CardDescription>
                  {selectedCourseInfo?.label ?? "Selected course"} {selectedCourseInfo?.description ? `| ${selectedCourseInfo.description}` : ""}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
                <Dialog open={assessmentDialogOpen} onOpenChange={setAssessmentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={openCreateAssessmentDialog} disabled={isLoadingGrades || assessmentSubmitting} className="w-full gap-2 sm:w-auto">
                      <Plus className="w-4 h-4" />
                      Add Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingColumn ? "Edit Assessment" : "Add Assessment"}</DialogTitle>
                      <DialogDescription>
                        {editingColumn
                          ? "Update the column metadata. Existing student marks stay connected."
                          : "Create a real assessment column and seed grade cells for enrolled students."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="assessment-label">Name</Label>
                        <Input
                          id="assessment-label"
                          value={assessmentForm.label}
                          onChange={(event) => setAssessmentForm((current) => ({ ...current, label: event.target.value }))}
                          placeholder="e.g., Quiz 1, Midterm, Project"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={assessmentForm.assessmentType}
                            onValueChange={(value) => setAssessmentForm((current) => ({
                              ...current,
                              assessmentType: value as CourseAssessmentType,
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {assessmentTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="assessment-marks">Max Mark</Label>
                          <Input
                            id="assessment-marks"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={assessmentForm.marks}
                            onChange={(event) => setAssessmentForm((current) => ({ ...current, marks: event.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setAssessmentDialogOpen(false)} disabled={assessmentSubmitting}>
                        Cancel
                      </Button>
                      <Button onClick={saveAssessment} disabled={assessmentSubmitting}>
                        {assessmentSubmitting ? "Saving..." : editingColumn ? "Save Changes" : "Create Assessment"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button onClick={submitGrades} disabled={!hasChanges || isSaving || isLoadingGrades} className="w-full gap-2 sm:w-auto">
                  {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Grades
                </Button>
                <Button variant="outline" onClick={downloadGrades} disabled={studentGrades.length === 0} className="w-full gap-2 sm:w-auto">
                  <FileSpreadsheet className="w-4 h-4" />
                  Download CSV
                </Button>
                <div className="flex items-center gap-2 self-start rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:self-auto">
                  <Label htmlFor="grades-per-page" className="text-sm whitespace-nowrap">Rows</Label>
                  <Select value={String(studentsPerPage)} onValueChange={(value) => { setStudentsPerPage(Number(value)); setCurrentPage(1); }}>
                    <SelectTrigger id="grades-per-page" className="h-8 w-20 bg-white">
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
            {isLoadingGrades ? (
              <div className="flex items-center justify-center p-10 text-slate-600">
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Loading grades...
              </div>
            ) : gradeColumns.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Build the grade sheet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                  Add the first assessment column for this course. It will be saved to the backend and grade cells will be created for enrolled students automatically.
                </p>
                <Button className="mt-5 gap-2" onClick={openCreateAssessmentDialog}>
                  <Plus className="h-4 w-4" />
                  Create First Assessment
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="overflow-x-auto">
                  <table className="w-full min-w-[960px] border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300">
                        <th className="text-left py-3 px-4 bg-slate-50 sticky left-0 z-10 border-r border-slate-200 min-w-[130px]">University ID</th>
                        <th className="text-left py-3 px-4 bg-slate-50 border-r border-slate-200 min-w-[180px]">Student Name</th>
                        {gradeColumns.map((column) => (
                          <th key={column.id} className="text-center py-3 px-4 bg-slate-50 border-r border-slate-200 min-w-[140px]">
                            <div className="flex items-start justify-center gap-2">
                              <div>
                                <div className="text-slate-700">{column.name}</div>
                                <div className="text-xs text-slate-500">{column.assessmentType} | Max: {column.maxMark}</div>
                              </div>
                              <div className="flex">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditAssessmentDialog(column)}
                                  className="h-6 w-6 p-0 text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                                  title="Edit assessment"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => void removeAssessment(column)}
                                  className="h-6 w-6 p-0 text-slate-500 hover:text-red-700 hover:bg-red-50"
                                  title="Remove assessment"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </th>
                        ))}
                        <th className="text-center py-3 px-4 bg-blue-50 border-r border-slate-200 min-w-[100px]">Total / {maxTotal}</th>
                        <th className="text-center py-3 px-4 bg-purple-50 border-r border-slate-200 min-w-[130px]">Equivalent</th>
                        <th className="text-center py-3 px-4 bg-green-50 min-w-[120px]">Final Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentGrades.length === 0 ? (
                        <tr>
                          <td colSpan={gradeColumns.length + 5} className="bg-white px-6 py-12 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                              <BookOpen className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">Assessments are ready</h3>
                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                              No enrolled students were found for this course in the active semester. You can still manage the assessment columns now.
                            </p>
                          </td>
                        </tr>
                      ) : paginatedStudents.map((student, studentIndex) => {
                        const absoluteStudentIndex = startIndex + studentIndex;
                        return (
                        <tr key={student.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-3 px-4 bg-white sticky left-0 z-10 border-r border-slate-200">{student.rollNumber}</td>
                          <td className="py-3 px-4 bg-white border-r border-slate-200">{student.studentName}</td>
                          {gradeColumns.map((column, columnIndex) => (
                            <td key={column.id} className="py-3 px-4 text-center border-r border-slate-200">
                              <Input
                                ref={(element) => {
                                  inputRefs.current[`${student.id}-${column.id}`] = element;
                                }}
                                type="number"
                                min="0"
                                max={column.maxMark}
                                step="0.01"
                                value={student.grades[column.id] ?? ""}
                                onChange={(event) => updateGrade(student.id, column.id, event.target.value)}
                                onKeyDown={(event) => handleGradeKeyDown(event, absoluteStudentIndex, columnIndex)}
                                className="text-center w-20 mx-auto"
                              />
                            </td>
                          ))}
                          <td className="py-3 px-4 text-center bg-blue-50 border-r border-slate-200">
                            {student.total ? student.total.toFixed(2) : "--"}
                          </td>
                          <td className="py-3 px-4 text-center bg-purple-50 border-r border-slate-200">
                            {student.equivalentGrade ? (
                              <Badge className={getGradeBadgeColor(student.finalGrade)}>{student.equivalentGrade}</Badge>
                            ) : "--"}
                          </td>
                          <td className="py-3 px-4 text-center bg-green-50">
                            {student.finalGrade ? (
                              <Badge className={getGradeBadgeColor(student.finalGrade)}>{student.finalGrade}</Badge>
                            ) : "--"}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>

                {studentGrades.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-200">
                    <div className="text-sm text-slate-600">
                      Showing {startIndex + 1} to {Math.min(startIndex + studentsPerPage, studentGrades.length)} of {studentGrades.length} students
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {studentGrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Calculated from currently loaded backend grade records.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="grade" tick={{ fill: "#64748b", fontSize: 14 }} axisLine={{ stroke: "#cbd5e1" }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 14 }} axisLine={{ stroke: "#cbd5e1" }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {gradeDistribution.map((entry) => (
                      <Cell key={entry.grade} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
