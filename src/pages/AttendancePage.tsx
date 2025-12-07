import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Progress } from '../components/ui/progress';
import {
  Users,
  CheckCircle,
  Clock,
  Calendar,
  Download
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
  id: string;
  name: string;
  rollNumber: string;
  isPresent: boolean;
}

export function AttendancePage({ user }: AttendancePageProps) {
  const [selectedCourse, setSelectedCourse] = useState('cs-301');
  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'Alice Johnson', rollNumber: 'CS2021001', isPresent: false },
    { id: '2', name: 'Bob Smith', rollNumber: 'CS2021002', isPresent: true },
    { id: '3', name: 'Carol Davis', rollNumber: 'CS2021003', isPresent: false },
    { id: '4', name: 'David Wilson', rollNumber: 'CS2021004', isPresent: true },
    { id: '5', name: 'Eve Brown', rollNumber: 'CS2021005', isPresent: false },
  ]);

  const attendanceHistory: AttendanceRecord[] = [
    { id: '1', course: 'CS 301 - Advanced Algorithms', date: '2024-03-15', time: '10:00 AM', status: 'present', location: 'Room 101' },
    { id: '2', course: 'CS 201 - Data Structures', date: '2024-03-14', time: '2:00 PM', status: 'present', location: 'Room 205' },
    { id: '3', course: 'CS 301 - Advanced Algorithms', date: '2024-03-13', time: '10:00 AM', status: 'late', location: 'Room 101' },
    { id: '4', course: 'CS 101 - Programming Basics', date: '2024-03-12', time: '9:00 AM', status: 'absent' },
    { id: '5', course: 'CS 201 - Data Structures', date: '2024-03-12', time: '2:00 PM', status: 'present', location: 'Room 205' },
  ];

  const courses = [
    { id: 'cs-301', name: 'CS 301 - Advanced Algorithms', students: 28, room: 'Room 101' },
    { id: 'cs-201', name: 'CS 201 - Data Structures', students: 35, room: 'Room 205' },
    { id: 'cs-101', name: 'CS 101 - Programming Basics', students: 45, room: 'Room 102' }
  ];

  const toggleStudentAttendance = (studentId: string) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === studentId
          ? { ...student, isPresent: !student.isPresent }
          : student
      )
    );
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, isPresent: true })));
  };

  const markAllAbsent = () => {
    setStudents(prev => prev.map(student => ({ ...student, isPresent: false })));
  };

  const getAttendanceStats = () => {
    const presentCount = students.filter(s => s.isPresent).length;
    const totalCount = students.length;
    const percentage = Math.round((presentCount / totalCount) * 100);
    return { presentCount, totalCount, percentage };
  };

  const stats = getAttendanceStats();

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
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name} • {course.students} students • {course.room}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Manual Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Entry</CardTitle>
          <CardDescription>Mark students as present or absent manually</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg">Student List</h3>
              <p className="text-sm text-muted-foreground">
                Mark students as present or absent manually
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllPresent}>
                Mark All Present
              </Button>
              <Button variant="outline" size="sm" onClick={markAllAbsent}>
                Mark All Absent
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {students.map((student) => (
              <div key={student.id} className="flex items-center space-x-3 p-3 border rounded-lg">
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
            ))}
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm">Attendance Summary</p>
              <p className="text-sm">{stats.presentCount}/{stats.totalCount} present ({stats.percentage}%)</p>
            </div>
            <Progress value={stats.percentage} className="h-2" />
          </div>

          <div className="flex gap-3">
            <Button className="flex-1">
              Save Attendance
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return user.role === 'faculty' ? renderFacultyView() : renderStudentView();
}
