import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { SearchableSelect } from '../ui/searchable-select';
import { Progress } from '../ui/progress';
import {
  Download,
  Users,
  CheckCircle,
  Save,
  Search,
  Loader,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { AttendanceService } from '../../api/modules/attendance/attendance.service';
import type { User as AppUser } from '../../App';
import type { AttendanceCourseSummary, StaffAttendanceCourse } from '../../api/types';
import { useResolvedSemester } from '../../hooks/useResolvedSemester';

interface AdminAttendancePageProps {
  user: AppUser;
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  isPresent: boolean;
  attendanceStatus: 'present' | 'absent' | 'late' | null;
  studentId: number;
}

interface CourseOption {
  value: string;
  courseId: number;
  label: string;
  description: string;
}

interface SectionOption {
  value: string;
  contextId: number;
  scheduleSlotId: number;
  teacherId: number;
  label: string;
  description: string;
}

function formatCourseTime(value: string): string {
  // Preserve wall-clock time from API payload and avoid timezone shifts.
  const timeOnly = value.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
  const dateTimeTime = value.match(/(?:T|\s)(\d{2}):(\d{2})(?::\d{2})?/);
  const matched = timeOnly ?? dateTimeTime;
  if (matched) {
    const hours = Number(matched[1]);
    const minutes = Number(matched[2]);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
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
  return user.role === 'faculty';
}

function toAttendanceStatus(status: string): Student['attendanceStatus'] {
  if (status === 'Present') return 'present';
  if (status === 'Late') return 'late';
  return 'absent';
}

export function AdminAttendancePage({ user, selectedUniversity }: AdminAttendancePageProps) {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [initialStudents, setInitialStudents] = useState<Student[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [attendanceSessionId, setAttendanceSessionId] = useState<number | null>(null);
  const {
    semesterId: activeSemesterId,
    isLoading: isResolvingSemester,
  } = useResolvedSemester({
    universityId: selectedUniversity,
    fallbackSemesterId: user.currentSemesterId ?? null,
  });

  // Fetch accessible courses for admin/staff attendance view.
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (isResolvingSemester) return;

        if (!activeSemesterId) {
          setCourses([]);
          setSelectedCourse('');
          setStudents([]);
          setInitialStudents([]);
          return;
        }

        setIsLoading(true);

        const nextCourses = canUseStaffScopedCourses(user)
          ? buildStaffCourseOptions(await AttendanceService.getStaffCourses(Number(user.id)))
          : buildCourseOptions(await AttendanceService.getCourseSummaries({ semesterId: activeSemesterId }));

        setCourses(nextCourses);
        setSections([]);
        setSelectedSection('');
      } catch (error) {
        console.error('Failed to fetch attendance courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCourses();
  }, [activeSemesterId, isResolvingSemester, user]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        if (!selectedCourse || !activeSemesterId) {
          setSections([]);
          setSelectedSection('');
          return;
        }

        setIsLoading(true);
        const slotOptions = await AttendanceService.getCourseOptions({
          semesterId: activeSemesterId,
          courseId: Number(selectedCourse),
        });

        const nextSections: SectionOption[] = slotOptions.map((item) => ({
          value: String(item.id),
          contextId: item.id,
          scheduleSlotId: item.slot.id,
          teacherId: item.slot.teacherId,
          label: `${item.program.name} • Level ${item.academicLevel}`,
          description: `${item.slot.type} • ${item.slot.dayOfWeek} ${formatCourseTime(item.slot.startTime)}-${formatCourseTime(item.slot.endTime)}`,
        })).sort((left, right) => left.label.localeCompare(right.label) || left.description.localeCompare(right.description));

        setSections(nextSections);
        setSelectedSection((current) =>
          nextSections.some((item) => item.value === current) ? current : (nextSections[0]?.value ?? '')
        );
      } catch (error) {
        console.error('Failed to fetch course sections:', error);
        toast.error('Failed to load class sections');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSections();
  }, [selectedCourse, activeSemesterId]);

  // Fetch enrolled students when a section is selected
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (!selectedSection) {
          setStudents([]);
          setInitialStudents([]);
          setAttendanceSessionId(null);
          return;
        }

        setIsLoading(true);
        const sectionOption = sections.find((section) => section.value === selectedSection);
        if (!sectionOption) return;

        const [enrolled, existingSession] = await Promise.all([
          AttendanceService.getEnrolled(sectionOption.contextId),
          AttendanceService.getSessionBySlotAndDate(sectionOption.scheduleSlotId, selectedDate),
        ]);

        const attendanceByStudentId = new Map<number, Student['attendanceStatus']>(
          (existingSession?.attendance ?? []).map((record) => [
            record.studentId,
            toAttendanceStatus(record.status),
          ]),
        );

        const formattedStudents: Student[] = enrolled.map(e => ({
          ...(() => {
            const attendanceStatus = attendanceByStudentId.get(e.studentId) ?? null;
            return {
              attendanceStatus,
              isPresent: attendanceStatus === 'present' || attendanceStatus === 'late',
            };
          })(),
          id: e.id,
          studentId: e.studentId,
          name: `${e.student.user.firstName || ''} ${e.student.user.lastName || ''}`.trim(),
          rollNumber: e.student.user.email || 'N/A',
        }));

        setStudents(formattedStudents);
        setInitialStudents(formattedStudents);
        setAttendanceSessionId(existingSession?.id ?? null);
        setHasChanges(false);
      } catch (error) {
        console.error('Failed to fetch enrolled students:', error);
        toast.error('Failed to load enrolled students');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStudents();
  }, [selectedSection, selectedDate, sections]);

  const toggleStudentAttendance = (studentId: number) => {
    setStudents(prev => {
      const updated = prev.map(student =>
        student.id === studentId
          ? {
            ...student,
            isPresent: !student.isPresent,
            attendanceStatus: student.isPresent ? 'absent' : 'present',
          }
          : student
      );

      const initialMap = new Map<number, Student['attendanceStatus']>(initialStudents.map(s => [s.studentId, s.attendanceStatus]));
      const hasChangedNow = updated.some(s => (initialMap.get(s.studentId) ?? null) !== s.attendanceStatus);
      setHasChanges(hasChangedNow);

      return updated;
    });
  };

  const markAllPresent = () => {
    setStudents(prev => {
      const updated = prev.map(student => ({ ...student, isPresent: true, attendanceStatus: 'present' as const }));
      const initialMap = new Map<number, Student['attendanceStatus']>(initialStudents.map(s => [s.studentId, s.attendanceStatus]));
      const hasChangedNow = updated.some(s => (initialMap.get(s.studentId) ?? null) !== s.attendanceStatus);
      setHasChanges(hasChangedNow);
      return updated;
    });
  };

  const markAllAbsent = () => {
    setStudents(prev => {
      const updated = prev.map(student => ({ ...student, isPresent: false, attendanceStatus: 'absent' as const }));
      const initialMap = new Map<number, Student['attendanceStatus']>(initialStudents.map(s => [s.studentId, s.attendanceStatus]));
      const hasChangedNow = updated.some(s => (initialMap.get(s.studentId) ?? null) !== s.attendanceStatus);
      setHasChanges(hasChangedNow);
      return updated;
    });
  };

  const getAttendanceStats = () => {
    const presentCount = students.filter(s => s.isPresent).length;
    const totalCount = students.length;
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
    return { presentCount, totalCount, percentage };
  };

  const stats = getAttendanceStats();

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;

    return students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const handleSaveAttendance = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }

    try {
      setIsLoading(true);

      // Get modified records (compare by studentId to avoid relying on array indices)
      const initialMap = new Map<number, Student['attendanceStatus']>(initialStudents.map(s => [s.studentId, s.attendanceStatus]));
      const modifiedRecords = students
        .map((student) => ({
          studentId: student.studentId,
          status: student.isPresent ? 'present' : 'absent',
          changed: (initialMap.get(student.studentId) ?? null) !== student.attendanceStatus,
        }))
        .filter(r => r.changed);

      if (modifiedRecords.length === 0) {
        toast.info('No changes to save');
        return;
      }

      // Create or reuse attendance session
      let sessionId = attendanceSessionId;
      if (!sessionId) {
        const sectionOption = sections.find((section) => section.value === selectedSection);
        if (!sectionOption) return;

        const now = new Date();
        const sessionStart = new Date(`${selectedDate}T${now.toTimeString().slice(0, 8)}`);
        const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000);
        const session = await AttendanceService.createSession({
          scheduleSlotId: sectionOption.scheduleSlotId,
          facultyMemberId: sectionOption.teacherId || Number(user.id),
          sessionDate: `${selectedDate}T00:00:00.000Z`,
          startTime: sessionStart.toISOString(),
          endTime: sessionEnd.toISOString(),
          attendanceMode: 'Manual',
        });
        sessionId = session.id;
        setAttendanceSessionId(sessionId);
      }

      // Save attendances
      await AttendanceService.saveAttendances(sessionId, {
        attendanceSessionId: sessionId,
        records: students.map((student) => ({
          studentId: student.studentId,
          status: (student.isPresent ? 'present' : 'absent') as 'present' | 'absent' | 'late',
        })),
      });

      // Update initial state to current state
      setInitialStudents([...students]);
      setHasChanges(false);

      toast.success(`Attendance saved successfully! ${modifiedRecords.length} record(s) updated.`);
    } catch (error) {
      console.error('Failed to save attendance:', error);
      toast.error('Failed to save attendance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAttendance = () => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }

    if (students.length === 0) {
      toast.error('No attendance data to export');
      return;
    }

    try {
      // Get the selected course info
      const courseOption = courses.find((c) => c.value === selectedCourse);
      if (!courseOption) return;

      // Prepare data for Excel export
      const exportData = students.map(student => ({
        ID: student.rollNumber,
        Name: student.name,
        Status: student.isPresent ? 'Present' : 'Absent'
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // ID column
        { wch: 25 }, // Name column
        { wch: 15 }  // Status column
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

      // Generate filename with course name and date
      const today = new Date().toISOString().split('T')[0];
      const courseCode = courseOption.label.split(' - ')[0].replace(/\s+/g, '_');
      const filename = `${courseCode}_Attendance_${today}.xlsx`;

      // Download the file
      XLSX.writeFile(wb, filename);

      toast.success('Attendance exported successfully!');
    } catch (error) {
      console.error('Failed to export attendance:', error);
      toast.error('Failed to export attendance');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-slate-900">Attendance Management</h2>
        <p className="text-slate-600 mt-1">Mark and manage student attendance for your classes</p>
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select Course
          </CardTitle>
          <CardDescription>Choose a course to mark attendance</CardDescription>
        </CardHeader>
        <CardContent>
          {(isLoading || isResolvingSemester) && courses.length === 0 ? (
            <div className="flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span>{isResolvingSemester ? 'Resolving semester...' : 'Loading courses...'}</span>
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
              placeholder="Choose a class"
              searchPlaceholder="Search by course, program, type, or day..."
              emptyMessage="No scheduled classes found."
            />
          )}
        </CardContent>
      </Card>

      {selectedCourse && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Class Section</CardTitle>
              <CardDescription>Choose the specific timetable entry for attendance</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && sections.length === 0 ? (
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Loading sections...</span>
                </div>
              ) : (
                <SearchableSelect
                  value={selectedSection}
                  onValueChange={setSelectedSection}
                  options={sections.map((section) => ({
                    value: section.value,
                    label: section.label,
                    description: section.description,
                  }))}
                  className="max-w-2xl"
                  placeholder="Choose a class section"
                  searchPlaceholder="Search by section, day, or time..."
                  emptyMessage="No class sections found for this course."
                />
              )}
            </CardContent>
          </Card>

          {selectedSection && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Date</CardTitle>
                  <CardDescription>Attendance records are stored per course and date</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    max="9999-12-31"
                  />
                </CardContent>
              </Card>

              {/* Manual Entry Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Manual Entry</CardTitle>
                  <CardDescription>Mark students as present or absent manually</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
              {/* Search and Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={markAllPresent}>
                    Mark All Present
                  </Button>
                  <Button variant="outline" size="sm" onClick={markAllAbsent}>
                    Mark All Absent
                  </Button>
                </div>
              </div>

              {/* Student List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    <span>Loading students...</span>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    No students enrolled in this course
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <Checkbox
                        checked={student.isPresent}
                        onCheckedChange={() => toggleStudentAttendance(student.id)}
                        className="border-slate-300"
                      />
                      <div className="flex-1">
                        <p className="text-slate-900">{student.name}</p>
                        <p className="text-slate-500">{student.rollNumber}</p>
                      </div>
                      {student.isPresent ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : student.attendanceStatus === 'absent' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              {/* Attendance Summary */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-700">Attendance Summary</p>
                  <p className="text-slate-900">
                    {stats.presentCount}/{stats.totalCount} present ({stats.percentage}%)
                  </p>
                </div>
                <Progress value={stats.percentage} className="h-2" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleSaveAttendance}
                  disabled={!hasChanges || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Attendance
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportAttendance}
                  className="gap-2"
                  disabled={students.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Export Attendance
                </Button>
              </div>
                </CardContent>
              </Card>
            </>
          )}

        </>
      )}

      {!selectedCourse && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600">Select a course to start marking attendance</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
