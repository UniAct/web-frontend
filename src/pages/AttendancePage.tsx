import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { SearchableSelect } from '../components/ui/searchable-select';
import {
  Users,
  CheckCircle,
  Calendar,
  Download,
  Search,
  Loader
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { AttendanceService } from '../api/modules/attendance/attendance.service';
import { SemesterService } from '../api/modules/semester/semester.service';
import type { Semester } from '../api/types';
import type { User as AppUser } from '../App';

interface AttendancePageProps {
  user: AppUser;
}

interface AttendanceRecord {
  id: string;
  course: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
  location?: string;
}

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  isPresent: boolean;
  studentId: number;
}

interface CourseOption {
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

export function AttendancePage({ user }: AttendancePageProps) {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [initialStudents, setInitialStudents] = useState<Student[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [attendanceSessionId, setAttendanceSessionId] = useState<number | null>(null);
  const [resolvedSemesterId, setResolvedSemesterId] = useState<number | null>(user.currentSemesterId ?? null);
  const [availableSemesters, setAvailableSemesters] = useState<Semester[]>([]);

  const resolveActiveSemesterId = () => {
    if (user.currentSemesterId) {
      return user.currentSemesterId;
    }

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith('activeSemester:')) continue;

      const raw = localStorage.getItem(key);
      const parsed = raw ? Number(raw) : NaN;
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return null;
  };

  const resolveFallbackSemesterId = async (): Promise<number | null> => {
    const semesters = await SemesterService.getAll();
    setAvailableSemesters(semesters);

    const sorted = [...semesters].sort((left, right) => (right.year - left.year) || (right.term - left.term));
    return sorted[0]?.id ?? null;
  };

  const attendanceHistory: AttendanceRecord[] = [
    { id: '1', course: 'CS 301 - Advanced Algorithms', date: '2024-03-15', time: '10:00 AM', status: 'present', location: 'Room 101' },
    { id: '2', course: 'CS 201 - Data Structures', date: '2024-03-14', time: '2:00 PM', status: 'present', location: 'Room 205' },
    { id: '3', course: 'CS 301 - Advanced Algorithms', date: '2024-03-13', time: '10:00 AM', status: 'late', location: 'Room 101' },
    { id: '4', course: 'CS 101 - Programming Basics', date: '2024-03-12', time: '9:00 AM', status: 'absent' },
    { id: '5', course: 'CS 201 - Data Structures', date: '2024-03-12', time: '2:00 PM', status: 'present', location: 'Room 205' },
  ];

  // Fetch schedule slots for faculty view (only courses taught by this faculty)
  useEffect(() => {
    if (user.role !== 'faculty') return;

    setResolvedSemesterId(resolveActiveSemesterId());

    const fetchCourses = async () => {
      try {
        setIsLoading(true);

        let semesterId = resolveActiveSemesterId();
        if (!semesterId) {
          semesterId = await resolveFallbackSemesterId();
        }

        if (!semesterId) {
          toast.error('No semester available for this university');
          return;
        }

        setResolvedSemesterId(semesterId);

        const courseOptions = await AttendanceService.getCourseOptions({
          semesterId,
          teacherId: Number(user.id),
        });

        const nextCourses: CourseOption[] = courseOptions.map((item) => ({
          value: String(item.id),
          contextId: item.id,
          scheduleSlotId: item.slot.id,
          teacherId: item.slot.teacherId,
          label: `${item.slot.course.code} - ${item.slot.course.name}`,
          description: `${item.program.name} • Level ${item.academicLevel} • ${item.slot.type} • ${item.slot.dayOfWeek} ${formatCourseTime(item.slot.startTime)}-${formatCourseTime(item.slot.endTime)}`,
        })).sort((left, right) => left.description.localeCompare(right.description) || left.label.localeCompare(right.label));

        setCourses(nextCourses);

        if (nextCourses.length === 0) {
          toast.error('No attendance-enabled timetable slots were found for this staff member');
        }
      } catch (error) {
        console.error('Failed to fetch schedule slots:', error);
        toast.error('Failed to load schedule slots');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  // Fetch enrolled students when a course is selected
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (!selectedCourse) {
          setStudents([]);
          setInitialStudents([]);
          setAttendanceSessionId(null);
          return;
        }

        setIsLoading(true);
        const courseOption = courses.find((c) => c.value === selectedCourse);
        if (!courseOption) return;

        const [enrolled, existingSession] = await Promise.all([
          AttendanceService.getEnrolled(courseOption.contextId),
          AttendanceService.getSessionBySlotAndDate(courseOption.scheduleSlotId, selectedDate),
        ]);

        const attendanceByStudentId = new Map(
          (existingSession?.attendance ?? []).map((record) => [
            record.studentId,
            record.status === 'Present' || record.status === 'Late',
          ]),
        );

        const formattedStudents: Student[] = enrolled.map(e => ({
          id: e.id,
          studentId: e.studentId,
          name: `${e.student.user.firstName || ''} ${e.student.user.lastName || ''}`.trim(),
          rollNumber: e.student.user.email || 'N/A',
          isPresent: attendanceByStudentId.get(e.studentId) ?? false,
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
  }, [selectedCourse, selectedDate, courses]);

  const toggleStudentAttendance = (studentId: number) => {
    setStudents(prev => {
      const updated = prev.map(student =>
        student.id === studentId ? { ...student, isPresent: !student.isPresent } : student
      );

      const initialMap = new Map<number, boolean>(
        initialStudents.map(s => [s.studentId, s.isPresent])
      );

      const hasChangedNow = updated.some(s => (initialMap.get(s.studentId) ?? false) !== s.isPresent);
      setHasChanges(hasChangedNow);

      return updated;
    });
  };

  const markAllPresent = () => {
    setStudents(prev => {
      const updated = prev.map(student => ({ ...student, isPresent: true }));
      const initialMap = new Map<number, boolean>(initialStudents.map(s => [s.studentId, s.isPresent]));
      const hasChangedNow = updated.some(s => (initialMap.get(s.studentId) ?? false) !== s.isPresent);
      setHasChanges(hasChangedNow);
      return updated;
    });
  };

  const markAllAbsent = () => {
    setStudents(prev => {
      const updated = prev.map(student => ({ ...student, isPresent: false }));
      const initialMap = new Map<number, boolean>(initialStudents.map(s => [s.studentId, s.isPresent]));
      const hasChangedNow = updated.some(s => (initialMap.get(s.studentId) ?? false) !== s.isPresent);
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

  const handleSaveAttendance = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }

    try {
      setIsLoading(true);

      // Get modified records (compare by studentId to avoid relying on array indices)
      const initialMap = new Map<number, boolean>(initialStudents.map(s => [s.studentId, s.isPresent]));
      const modifiedRecords = students
        .map((student) => ({
          studentId: student.studentId,
          status: student.isPresent ? 'present' : 'absent',
          changed: (initialMap.get(student.studentId) ?? false) !== student.isPresent,
        }))
        .filter(r => r.changed);

      if (modifiedRecords.length === 0) {
        toast.info('No changes to save');
        return;
      }

      // Create or reuse attendance session
      let sessionId = attendanceSessionId;
      if (!sessionId) {
        const courseOption = courses.find((c) => c.value === selectedCourse);
        if (!courseOption) return;

        const now = new Date();
        const sessionStart = new Date(`${selectedDate}T${now.toTimeString().slice(0, 8)}`);
        const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000);
        const session = await AttendanceService.createSession({
          scheduleSlotId: courseOption.scheduleSlotId,
          facultyMemberId: courseOption.teacherId || Number(user.id),
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

  const stats = getAttendanceStats();

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;

    return students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const renderStudentView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-2">My Attendance</h1>
        <p className="text-muted-foreground">Track your class attendance and participation.</p>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">This Week</p>
                <p className="text-2xl text-green-600">92%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">This Month</p>
                <p className="text-2xl text-blue-600">88%</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Overall</p>
                <p className="text-2xl text-purple-600">85%</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your recent attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceHistory.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm">{record.course}</p>
                  <p className="text-xs text-muted-foreground">
                    {record.date} • {record.time}
                    {record.location && ` • ${record.location}`}
                  </p>
                </div>
                <Badge
                  variant={record.status === 'present' ? 'default' : record.status === 'late' ? 'secondary' : 'destructive'}
                  className={`text-xs ${record.status === 'present' ? 'bg-green-100 text-green-800' :
                    record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                >
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFacultyView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-2">Attendance Management</h1>
        <p className="text-muted-foreground">Take and manage student attendance for your classes.</p>
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && courses.length === 0 ? (
            <div className="flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Loading courses...</span>
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
              <CardTitle>Attendance Date</CardTitle>
              <CardDescription>Attendance records are stored per class date</CardDescription>
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
                    placeholder="Search by name or email..."
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
                    <div key={student.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <Checkbox
                        checked={student.isPresent}
                        onCheckedChange={() => toggleStudentAttendance(student.id)}
                      />
                      <div className="flex-1">
                        <p className="text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.rollNumber}</p>
                      </div>
                      {student.isPresent && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm">Attendance Summary</p>
                  <p className="text-sm">{stats.presentCount}/{stats.totalCount} present ({stats.percentage}%)</p>
                </div>
                <Progress value={stats.percentage} className="h-2" />
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={handleSaveAttendance}
                  disabled={!hasChanges || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save Attendance</>
                  )}
                </Button>
                <Button variant="outline" className="gap-2" disabled={students.length === 0}>
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
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

  return user.role === 'faculty' ? renderFacultyView() : renderStudentView();
}
