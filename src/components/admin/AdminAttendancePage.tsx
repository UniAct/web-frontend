import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SearchableSelect } from '../ui/searchable-select';
import { Progress } from '../ui/progress';
import {
  Download,
  Users,
  CheckCircle,
  Save,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface AdminAttendancePageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  isPresent: boolean;
}

export function AdminAttendancePage({ selectedUniversity }: AdminAttendancePageProps) {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'John Doe', rollNumber: 'CS2021001', isPresent: false },
    { id: '2', name: 'Sarah Ahmed', rollNumber: 'CS2021002', isPresent: false },
    { id: '3', name: 'Mohamed Ali', rollNumber: 'CS2021003', isPresent: false },
    { id: '4', name: 'Emma Wilson', rollNumber: 'CS2021004', isPresent: false },
    { id: '5', name: 'David Chen', rollNumber: 'CS2021005', isPresent: false },
    { id: '6', name: 'Lisa Brown', rollNumber: 'CS2021006', isPresent: false },
    { id: '7', name: 'Ahmed Hassan', rollNumber: 'CS2021007', isPresent: false },
    { id: '8', name: 'Fatima Khan', rollNumber: 'CS2021008', isPresent: false },
  ]);

  const [initialStudents, setInitialStudents] = useState<Student[]>(students);
  const [hasChanges, setHasChanges] = useState(false);

  // Mock courses data
  const courses = [
    { id: 'cs-301', name: 'CS-301 - Advanced Algorithms', students: 28, room: 'Room 101' },
    { id: 'cs-201', name: 'CS-201 - Data Structures', students: 35, room: 'Room 205' },
    { id: 'cs-101', name: 'CS-101 - Programming Basics', students: 45, room: 'Room 102' },
    { id: 'math-201', name: 'MATH-201 - Calculus II', students: 32, room: 'Room 303' },
    { id: 'phys-401', name: 'PHYS-401 - Quantum Physics', students: 20, room: 'Room 401' }
  ];

  const toggleStudentAttendance = (studentId: string) => {
    setStudents(prev => {
      const updated = prev.map(student =>
        student.id === studentId
          ? { ...student, isPresent: !student.isPresent }
          : student
      );

      // Check if there are changes
      const hasChanged = updated.some((student, index) =>
        student.isPresent !== initialStudents[index].isPresent
      );
      setHasChanges(hasChanged);

      return updated;
    });
  };

  const markAllPresent = () => {
    const updated = students.map(student => ({ ...student, isPresent: true }));
    setStudents(updated);
    const hasChanged = updated.some((student, index) =>
      student.isPresent !== initialStudents[index].isPresent
    );
    setHasChanges(hasChanged);
  };

  const markAllAbsent = () => {
    const updated = students.map(student => ({ ...student, isPresent: false }));
    setStudents(updated);
    const hasChanged = updated.some((student, index) =>
      student.isPresent !== initialStudents[index].isPresent
    );
    setHasChanges(hasChanged);
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

  const handleSaveAttendance = () => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }

    // Get only modified records
    const modifiedRecords = students.filter((student, index) =>
      student.isPresent !== initialStudents[index].isPresent
    );

    if (modifiedRecords.length === 0) {
      toast.info('No changes to save');
      return;
    }

    // Save the modified records (in real app, this would be an API call)
    console.log('Saving modified attendance records:', modifiedRecords);

    // Update initial state to current state
    setInitialStudents([...students]);
    setHasChanges(false);

    toast.success(`Attendance saved successfully! ${modifiedRecords.length} record(s) updated.`);
  };

  const handleExportAttendance = () => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }

    // Get the selected course name
    const course = courses.find(c => c.id === selectedCourse);
    if (!course) return;

    // Prepare data for Excel export
    const exportData = students.map(student => ({
      ID: student.rollNumber,
      Name: student.name,
      Status: student.isPresent ? '' : 'X' // X = Absent, Empty = Present
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // ID column
      { wch: 25 }, // Name column
      { wch: 10 }  // Status column
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

    // Generate filename with course name and date
    const today = new Date().toISOString().split('T')[0];
    const courseName = course.name.split(' - ')[0].replace(/\s+/g, '_');
    const filename = `${courseName}_Attendance_${today}.xlsx`;

    // Download the file
    XLSX.writeFile(wb, filename);

    toast.success('Attendance exported successfully!');
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

      {selectedCourse && (
        <>
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
                {filteredStudents.map((student) => (
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
                    {student.isPresent && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                ))}
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
                  disabled={!hasChanges}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Attendance
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportAttendance}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Attendance
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
}
