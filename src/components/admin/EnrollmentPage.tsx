import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Search,
  Eye,
  UserMinus,
  CheckCircle,
  XCircle,
  Calendar,
  BookOpen,
  Users,
  BarChart3,
  GraduationCap,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface EnrollmentPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

export function EnrollmentPage({ selectedUniversity }: EnrollmentPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('current');

  // Dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

  // Course management state for details dialog
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [coursesToAdd, setCoursesToAdd] = useState<any[]>([]);
  const [coursesToDrop, setCoursesToDrop] = useState<string[]>([]);
  const [selectedCourseToAdd, setSelectedCourseToAdd] = useState('');

  // Mock data
  const programs = [
    { id: '1', name: 'Computer Science', code: 'CS' },
    { id: '2', name: 'Business Administration', code: 'BA' },
    { id: '3', name: 'Engineering', code: 'ENG' },
    { id: '4', name: 'Mathematics', code: 'MATH' }
  ];

  const levelsByProgram: Record<string, Array<{ id: string; name: string }>> = {
    '1': [
      { id: '1', name: 'Level 1' },
      { id: '2', name: 'Level 2' },
      { id: '3', name: 'Level 3' },
      { id: '4', name: 'Level 4' }
    ],
    '2': [
      { id: '5', name: 'Level 1' },
      { id: '6', name: 'Level 2' },
      { id: '7', name: 'Level 3' },
      { id: '8', name: 'Level 4' }
    ],
    '3': [
      { id: '9', name: 'Level 1' },
      { id: '10', name: 'Level 2' },
      { id: '11', name: 'Level 3' },
      { id: '12', name: 'Level 4' }
    ],
    '4': [
      { id: '13', name: 'Level 1' },
      { id: '14', name: 'Level 2' },
      { id: '15', name: 'Level 3' },
      { id: '16', name: 'Level 4' }
    ]
  };

  const students = [
    { id: '1', name: 'John Doe', studentId: '20210001', program: 'Computer Science' },
    { id: '2', name: 'Sarah Ahmed', studentId: '20220015', program: 'Computer Science' },
    { id: '3', name: 'Mohamed Ali', studentId: '20200078', program: 'Computer Science' },
    { id: '4', name: 'Emma Wilson', studentId: '20230045', program: 'Computer Science' },
    { id: '5', name: 'David Chen', studentId: '20220089', program: 'Computer Science' }
  ];

  const coursesByLevel: Record<string, Array<{ id: string; name: string; code: string }>> = {
    '1': [
      { id: '1', name: 'Introduction to Programming', code: 'CS-101' },
      { id: '2', name: 'Discrete Mathematics', code: 'CS-102' }
    ],
    '2': [
      { id: '3', name: 'Data Structures', code: 'CS-201' },
      { id: '4', name: 'Algorithms', code: 'CS-202' }
    ],
    '3': [
      { id: '5', name: 'Database Systems', code: 'CS-301' },
      { id: '6', name: 'Operating Systems', code: 'CS-302' }
    ],
    '4': [
      { id: '7', name: 'Machine Learning', code: 'CS-401' },
      { id: '8', name: 'Artificial Intelligence', code: 'CS-402' }
    ]
  };

  const courseTypes = ['Lecture', 'Lab', 'Workshop'];

  const courseSchedules = [
    { id: '1', day: 'Sunday', from: '09:00', to: '11:00', room: 'A1L2' },
    { id: '2', day: 'Monday', from: '10:00', to: '12:00', room: 'B2L3' },
    { id: '3', day: 'Tuesday', from: '13:00', to: '15:00', room: 'C1L1' },
    { id: '4', day: 'Wednesday', from: '14:00', to: '16:00', room: 'A2L4' },
    { id: '5', day: 'Thursday', from: '11:00', to: '13:00', room: 'B1L2' }
  ];

  // Mock data for student enrolled courses (multiple courses per student)
  const studentEnrolledCourses: Record<string, any[]> = {
    '20210001': [
      { id: 'c1', name: 'Data Structures', code: 'CS-201', schedule: 'Sunday - 09:00 : 11:00', room: 'A1L2' },
      { id: 'c2', name: 'Algorithms', code: 'CS-202', schedule: 'Monday - 10:00 : 12:00', room: 'B2L3' },
      { id: 'c3', name: 'Database Systems', code: 'CS-301', schedule: 'Tuesday - 13:00 : 15:00', room: 'C1L1' },
      { id: 'c4', name: 'Operating Systems', code: 'CS-302', schedule: 'Wednesday - 14:00 : 16:00', room: 'A2L4' },
    ],
    '20220015': [
      { id: 'c5', name: 'Calculus II', code: 'MATH-201', schedule: 'Monday - 10:00 : 12:00', room: 'B2L3' },
      { id: 'c6', name: 'Linear Algebra', code: 'MATH-202', schedule: 'Tuesday - 09:00 : 11:00', room: 'A3L1' },
      { id: 'c7', name: 'Probability Theory', code: 'MATH-301', schedule: 'Thursday - 11:00 : 13:00', room: 'B1L2' },
    ],
    '20200078': [
      { id: 'c8', name: 'Quantum Physics', code: 'PHYS-401', schedule: 'Tuesday - 13:00 : 15:00', room: 'C1L1' },
      { id: 'c9', name: 'Thermodynamics', code: 'PHYS-301', schedule: 'Wednesday - 10:00 : 12:00', room: 'C2L2' },
      { id: 'c10', name: 'Electromagnetic Theory', code: 'PHYS-302', schedule: 'Thursday - 14:00 : 16:00', room: 'C3L1' },
    ],
    '20230045': [
      { id: 'c11', name: 'Database Systems', code: 'CS-301', schedule: 'Wednesday - 14:00 : 16:00', room: 'A2L4' },
      { id: 'c12', name: 'Web Development', code: 'CS-303', schedule: 'Sunday - 11:00 : 13:00', room: 'A1L3' },
      { id: 'c13', name: 'Software Engineering', code: 'CS-304', schedule: 'Monday - 13:00 : 15:00', room: 'B3L2' },
      { id: 'c14', name: 'Computer Networks', code: 'CS-305', schedule: 'Thursday - 09:00 : 11:00', room: 'A4L1' },
    ]
  };

  // Mock data for available courses to add (for the selected student)
  const availableCoursesToAdd = [
    { id: 'ac1', name: 'Machine Learning', code: 'CS-401', schedule: 'Sunday - 14:00 : 16:00', room: 'A1L4' },
    { id: 'ac2', name: 'Artificial Intelligence', code: 'CS-402', schedule: 'Monday - 15:00 : 17:00', room: 'B1L4' },
    { id: 'ac3', name: 'Cloud Computing', code: 'CS-403', schedule: 'Tuesday - 10:00 : 12:00', room: 'C1L3' },
    { id: 'ac4', name: 'Mobile Development', code: 'CS-404', schedule: 'Wednesday - 11:00 : 13:00', room: 'A2L3' },
    { id: 'ac5', name: 'Cybersecurity', code: 'CS-405', schedule: 'Thursday - 15:00 : 17:00', room: 'B2L4' },
  ];

  // Mock enrollment data
  const currentEnrollments = [
    {
      id: '1',
      studentName: 'John Doe',
      studentId: '20210001',
      courseName: 'Data Structures',
      courseCode: 'CS-301',
      courseType: 'Lecture',
      instructor: 'Dr. Sarah Wilson',
      semester: 'Fall 2024',
      status: 'Enrolled',
      schedule: 'Sunday - 09:00 : 11:00',
      room: 'A1L2',
      enrollmentDate: '2024-08-15',
      credits: 3,
      gradeStatus: 'In Progress',
      prerequisites: 'CS-201',
      syllabus: 'Advanced data structures and algorithms'
    },
    {
      id: '2',
      studentName: 'Sarah Ahmed',
      studentId: '20220015',
      courseName: 'Calculus II',
      courseCode: 'MATH-201',
      courseType: 'Lecture',
      instructor: 'Prof. Michael Johnson',
      semester: 'Fall 2024',
      status: 'Enrolled',
      schedule: 'Monday - 10:00 : 12:00',
      room: 'B2L3',
      enrollmentDate: '2024-08-20',
      credits: 4,
      gradeStatus: 'In Progress',
      prerequisites: 'MATH-101',
      syllabus: 'Advanced calculus concepts'
    },
    {
      id: '3',
      studentName: 'Mohamed Ali',
      studentId: '20200078',
      courseName: 'Quantum Physics',
      courseCode: 'PHYS-401',
      courseType: 'Lab',
      instructor: 'Dr. Ahmed Hassan',
      semester: 'Fall 2024',
      status: 'Enrolled',
      schedule: 'Tuesday - 13:00 : 15:00',
      room: 'C1L1',
      enrollmentDate: '2024-08-18',
      credits: 3,
      gradeStatus: 'In Progress',
      prerequisites: 'PHYS-301',
      syllabus: 'Quantum mechanics and applications'
    },
    {
      id: '4',
      studentName: 'Emma Wilson',
      studentId: '20230045',
      courseName: 'Database Systems',
      courseCode: 'CS-301',
      courseType: 'Lecture',
      instructor: 'Dr. Sarah Wilson',
      semester: 'Fall 2024',
      status: 'Enrolled',
      schedule: 'Wednesday - 14:00 : 16:00',
      room: 'A2L4',
      enrollmentDate: '2024-08-22',
      credits: 3,
      gradeStatus: 'In Progress',
      prerequisites: 'CS-201',
      syllabus: 'Database design and SQL'
    }
  ];

  const pendingRequests = [
    {
      id: '1',
      studentName: 'Emma Wilson',
      studentId: '20230045',
      requestedCourse: 'Advanced Algorithms',
      courseCode: 'CS-401',
      courseType: 'Lecture',
      reason: 'Prerequisites completed',
      requestDate: '2024-08-22',
      schedule: 'Thursday - 11:00 : 13:00',
      room: 'B1L2',
      priority: 'High'
    },
    {
      id: '2',
      studentName: 'David Chen',
      studentId: '20220089',
      requestedCourse: 'Statistics',
      courseCode: 'MATH-301',
      courseType: 'Workshop',
      reason: 'Course required for major',
      requestDate: '2024-08-21',
      schedule: 'Sunday - 09:00 : 11:00',
      room: 'A1L2',
      priority: 'Medium'
    },
    {
      id: '3',
      studentName: 'John Doe',
      studentId: '20210001',
      requestedCourse: 'Machine Learning',
      courseCode: 'CS-401',
      courseType: 'Lab',
      reason: 'Interest in AI specialization',
      requestDate: '2024-08-23',
      schedule: 'Monday - 10:00 : 12:00',
      room: 'B2L3',
      priority: 'Medium'
    }
  ];

  // Enrollment by Program data (moved from StudentsPage)
  const programEnrollments = [
    {
      program: 'Computer Science',
      levels: {
        'Level 1': 245,
        'Level 2': 198,
        'Level 3': 176,
        'Level 4': 142
      },
      total: 761
    },
    {
      program: 'Mathematics',
      levels: {
        'Level 1': 180,
        'Level 2': 165,
        'Level 3': 145,
        'Level 4': 128
      },
      total: 618
    },
    {
      program: 'Physics',
      levels: {
        'Level 1': 125,
        'Level 2': 112,
        'Level 3': 98,
        'Level 4': 85
      },
      total: 420
    },
    {
      program: 'Chemistry',
      levels: {
        'Level 1': 98,
        'Level 2': 87,
        'Level 3': 76,
        'Level 4': 65
      },
      total: 326
    },
    {
      program: 'Biology',
      levels: {
        'Level 1': 156,
        'Level 2': 142,
        'Level 3': 128,
        'Level 4': 115
      },
      total: 541
    },
    {
      program: 'Engineering',
      levels: {
        'Level 1': 312,
        'Level 2': 289,
        'Level 3': 267,
        'Level 4': 245
      },
      total: 1113
    },
    {
      program: 'Business Administration',
      levels: {
        'Level 1': 223,
        'Level 2': 198,
        'Level 3': 187,
        'Level 4': 165
      },
      total: 773
    }
  ];

  // Filtered enrollments based on search and filters
  const filteredCurrentEnrollments = useMemo(() => {
    return currentEnrollments.filter(enrollment => {
      const matchesSearch = searchQuery === '' ||
        enrollment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.studentId.includes(searchQuery) ||
        enrollment.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.courseCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
      const matchesSemester = semesterFilter === 'all' || enrollment.semester === semesterFilter;
      const matchesCourse = courseFilter === 'all' || enrollment.courseCode === courseFilter;

      return matchesSearch && matchesStatus && matchesSemester && matchesCourse;
    });
  }, [searchQuery, statusFilter, semesterFilter, courseFilter]);

  // Filtered pending requests based on search and filters
  const filteredPendingRequests = useMemo(() => {
    return pendingRequests.filter(request => {
      const matchesSearch = searchQuery === '' ||
        request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.studentId.includes(searchQuery) ||
        request.requestedCourse.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.courseCode.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Enrolled': return 'default';
      case 'Pending': return 'secondary';
      case 'Waitlisted': return 'outline';
      case 'Dropped': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'secondary';
    }
  };



  const handleApproveRequest = (requestId: string, studentName: string) => {
    toast.success(`Enrollment request for ${studentName} approved successfully`);
  };

  const handleRejectRequest = (requestId: string, studentName: string) => {
    toast.error(`Enrollment request for ${studentName} rejected`);
  };

  const handleDropCourse = (enrollmentId: string, studentName: string, courseName: string) => {
    toast.warning(`${studentName} dropped from ${courseName}`);
  };

  const handleViewDetails = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    // Load the student's enrolled courses
    const courses = studentEnrolledCourses[enrollment.studentId] || [];
    setEnrolledCourses([...courses]);
    // Reset changes
    setCoursesToAdd([]);
    setCoursesToDrop([]);
    setSelectedCourseToAdd('');
    setDetailsDialogOpen(true);
  };

  const handleAddCourse = () => {
    if (!selectedCourseToAdd) {
      toast.error('Please select a course to add');
      return;
    }

    const courseToAdd = availableCoursesToAdd.find(c => c.id === selectedCourseToAdd);
    if (!courseToAdd) return;

    // Check if already enrolled or already in add list
    const alreadyEnrolled = enrolledCourses.some(c => c.id === courseToAdd.id);
    const alreadyInAddList = coursesToAdd.some(c => c.id === courseToAdd.id);

    if (alreadyEnrolled || alreadyInAddList) {
      toast.error('Student is already enrolled in this course');
      return;
    }

    // Add to courses list
    setEnrolledCourses(prev => [...prev, { ...courseToAdd, isNew: true }]);
    setCoursesToAdd(prev => [...prev, courseToAdd]);
    setSelectedCourseToAdd('');
    toast.success(`${courseToAdd.name} added to enrollment list`);
  };

  const handleDropCourseFromList = (courseId: string) => {
    const course = enrolledCourses.find(c => c.id === courseId);
    if (!course) return;

    // If it's a newly added course, just remove it from the add list
    if (course.isNew) {
      setEnrolledCourses(prev => prev.filter(c => c.id !== courseId));
      setCoursesToAdd(prev => prev.filter(c => c.id !== courseId));
      toast.info(`${course.name} removed from enrollment list`);
    } else {
      // Mark existing course for dropping
      setCoursesToDrop(prev => [...prev, courseId]);
      setEnrolledCourses(prev => prev.filter(c => c.id !== courseId));
      toast.warning(`${course.name} marked for dropping`);
    }
  };

  const handleSubmitChanges = () => {
    if (coursesToAdd.length === 0 && coursesToDrop.length === 0) {
      toast.info('No changes to submit');
      return;
    }

    const addedCount = coursesToAdd.length;
    const droppedCount = coursesToDrop.length;

    let message = '';
    if (addedCount > 0 && droppedCount > 0) {
      message = `Successfully added ${addedCount} course(s) and dropped ${droppedCount} course(s)`;
    } else if (addedCount > 0) {
      message = `Successfully added ${addedCount} course(s)`;
    } else {
      message = `Successfully dropped ${droppedCount} course(s)`;
    }

    toast.success(message);

    // Reset changes
    setCoursesToAdd([]);
    setCoursesToDrop([]);
    setDetailsDialogOpen(false);
  };

  const hasChanges = coursesToAdd.length > 0 || coursesToDrop.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl text-slate-900">Enrollment Management</h2>
          <p className="text-slate-600 mt-1">Manage student course enrollments and registrations</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by student name, ID, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Enrolled">Enrolled</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                <SelectItem value="Dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                <SelectItem value="Spring 2024">Spring 2024</SelectItem>
                <SelectItem value="Summer 2024">Summer 2024</SelectItem>
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="CS-301">CS-301</SelectItem>
                <SelectItem value="MATH-201">MATH-201</SelectItem>
                <SelectItem value="PHYS-401">PHYS-401</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Current Enrollments, Pending Requests, and Enrollment by Program */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Current Enrollments
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Users className="w-4 h-4" />
            Pending Requests
          </TabsTrigger>
          <TabsTrigger value="program-stats" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Enrollment by Program
          </TabsTrigger>
        </TabsList>

        {/* Current Enrollments Tab - Compact View with View Details Button */}
        <TabsContent value="current" className="space-y-4 mt-6">
          {filteredCurrentEnrollments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600">No enrollments found</p>
              </CardContent>
            </Card>
          ) : (
            filteredCurrentEnrollments.map((enrollment) => (
              <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                      <div>
                        <p className="text-slate-900">{enrollment.studentName}</p>
                        <p className="text-sm text-slate-500">ID: {enrollment.studentId}</p>
                      </div>
                      <div>
                        <p className="text-slate-900">{enrollment.courseCode}</p>
                        <p className="text-sm text-slate-500">{enrollment.courseName}</p>
                      </div>
                      <div>
                        <p className="text-slate-900">{enrollment.schedule}</p>
                        <p className="text-sm text-slate-500">Room {enrollment.room}</p>
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <Badge variant={getStatusColor(enrollment.status)}>
                          {enrollment.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleViewDetails(enrollment)}
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Pending Requests Tab */}
        <TabsContent value="pending" className="space-y-4 mt-6">
          {filteredPendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600">No pending requests found</p>
              </CardContent>
            </Card>
          ) : (
            filteredPendingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-slate-900">{request.studentName}</h4>
                          <p className="text-slate-600">ID: {request.studentId}</p>
                        </div>
                        <Badge variant={getPriorityColor(request.priority)}>
                          {request.priority} Priority
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-slate-600">Requested Course</p>
                            <p className="text-slate-900">{request.courseCode} - {request.requestedCourse}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-slate-600">Schedule</p>
                            <p className="text-slate-900">{request.schedule} - {request.room}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-600">Course Type</p>
                          <p className="text-slate-900">{request.courseType}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Request Date</p>
                          <p className="text-slate-900">{new Date(request.requestDate).toLocaleDateString()}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-slate-600">Reason</p>
                          <p className="text-slate-900">{request.reason}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200">
                    <Button
                      size="sm"
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveRequest(request.id, request.studentName)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRejectRequest(request.id, request.studentName)}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Enrollment by Program Tab - Moved from StudentsPage */}
        <TabsContent value="program-stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Student Distribution Across Academic Programs
              </CardTitle>
              <CardDescription>
                View enrollment statistics broken down by program and level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programEnrollments.map((enrollment) => (
                  <div key={enrollment.program} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="text-slate-900 mb-3">{enrollment.program}</h4>
                    <div className="space-y-2">
                      {Object.entries(enrollment.levels).map(([level, count]) => (
                        <div key={level} className="flex justify-between text-sm">
                          <span className="text-slate-600">{level}:</span>
                          <span className="text-slate-900">{count}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm text-slate-900 pt-2 border-t">
                        <span>Total:</span>
                        <span>{enrollment.total}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enrollment Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Enrollment Details</DialogTitle>
            <DialogDescription>
              Manage course enrollments for this student
            </DialogDescription>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="space-y-6 py-4">
              {/* Student Information */}
              <div className="space-y-3">
                <h3 className="text-slate-900 border-b pb-2">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Student Name</p>
                    <p className="text-slate-900">{selectedEnrollment.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Student ID</p>
                    <p className="text-slate-900">{selectedEnrollment.studentId}</p>
                  </div>
                </div>
              </div>

              {/* Add Course Section */}
              <div className="space-y-3">
                <h3 className="text-slate-900 border-b pb-2">Add New Course</h3>
                <div className="flex gap-3">
                  <Select value={selectedCourseToAdd} onValueChange={setSelectedCourseToAdd}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a course to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCoursesToAdd.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddCourse}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Course
                  </Button>
                </div>
              </div>

              {/* Enrolled Courses Table */}
              <div className="space-y-3">
                <h3 className="text-slate-900 border-b pb-2">Enrolled Courses ({enrolledCourses.length})</h3>
                {enrolledCourses.length === 0 ? (
                  <div className="p-8 text-center border rounded-lg bg-slate-50">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-500">No courses enrolled</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 text-slate-700">Course Name</th>
                          <th className="text-left py-3 px-4 text-slate-700">Schedule</th>
                          <th className="text-center py-3 px-4 text-slate-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledCourses.map((course) => (
                          <tr
                            key={course.id}
                            className={`border-b last:border-b-0 hover:bg-slate-50 transition-colors ${course.isNew ? 'bg-green-50' : ''}`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="text-slate-900">{course.code} - {course.name}</p>
                                  {course.isNew && (
                                    <Badge className="mt-1 bg-green-100 text-green-700 hover:bg-green-100">
                                      New
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-slate-900">{course.schedule}</p>
                              <p className="text-sm text-slate-500">Room {course.room}</p>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDropCourseFromList(course.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                                Drop Course
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Submit Changes */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDetailsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleSubmitChanges}
                  disabled={!hasChanges}
                >
                  Submit Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
