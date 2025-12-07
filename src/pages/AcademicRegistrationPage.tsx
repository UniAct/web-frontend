import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Check, BookOpen, Clock, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { User as AppUser } from '../App';
import { toast } from 'sonner';

interface AcademicRegistrationPageProps {
  user: AppUser;
}

interface CourseSession {
  sessionId: string;
  lecturer: string;
  content: string[];
  day: string;
  timeFrom: string;
  timeTo: string;
  room: string;
  availableSeats: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  type: 'University Mandatory' | 'University Elective' | 'Faculty Mandatory' | 'Faculty Elective' | 'Program Mandatory' | 'Program Elective';
  creditHours: number;
  failureTimes: number;
  level: number;
  sessions: CourseSession[];
}

interface SelectedSession extends CourseSession {
  courseId: string;
  courseName: string;
  courseCode: string;
  creditHours: number;
  addedAt: Date;
}

// Mock course data with multiple sessions
const mockCourses: Course[] = [
  // Level 1 Courses
  {
    id: 'CS101',
    name: 'Introduction to Programming',
    code: 'CS-101',
    type: 'Program Mandatory',
    creditHours: 3,
    failureTimes: 0,
    level: 1,
    sessions: [
      {
        sessionId: 'CS101-S1',
        lecturer: 'Dr. Ahmed Hassan',
        content: ['Lecture'],
        day: 'Sunday',
        timeFrom: '10:00 AM',
        timeTo: '12:00 PM',
        room: 'CS-101',
        availableSeats: 15
      },
      {
        sessionId: 'CS101-S2',
        lecturer: 'Dr. Ahmed Hassan',
        content: ['Lab'],
        day: 'Tuesday',
        timeFrom: '02:00 PM',
        timeTo: '04:00 PM',
        room: 'CS-Lab-01',
        availableSeats: 15
      },
      {
        sessionId: 'CS101-S3',
        lecturer: 'Prof. Sarah Wilson',
        content: ['Lecture'],
        day: 'Monday',
        timeFrom: '08:00 AM',
        timeTo: '10:00 AM',
        room: 'CS-102',
        availableSeats: 8
      }
    ]
  },
  {
    id: 'MATH101',
    name: 'Calculus I',
    code: 'MATH-101',
    type: 'Faculty Mandatory',
    creditHours: 4,
    failureTimes: 0,
    level: 1,
    sessions: [
      {
        sessionId: 'MATH101-S1',
        lecturer: 'Prof. Sarah Wilson',
        content: ['Lecture'],
        day: 'Saturday',
        timeFrom: '08:00 AM',
        timeTo: '10:00 AM',
        room: 'Math-201',
        availableSeats: 20
      },
      {
        sessionId: 'MATH101-S2',
        lecturer: 'Dr. Michael Brown',
        content: ['Lecture'],
        day: 'Sunday',
        timeFrom: '02:00 PM',
        timeTo: '04:00 PM',
        room: 'Math-202',
        availableSeats: 12
      }
    ]
  },
  {
    id: 'ENG101',
    name: 'English Communication',
    code: 'ENG-101',
    type: 'University Mandatory',
    creditHours: 2,
    failureTimes: 0,
    level: 1,
    sessions: [
      {
        sessionId: 'ENG101-S1',
        lecturer: 'Dr. Emily Chen',
        content: ['Lecture'],
        day: 'Wednesday',
        timeFrom: '02:00 PM',
        timeTo: '04:00 PM',
        room: 'A-Building-105',
        availableSeats: 25
      }
    ]
  },
  {
    id: 'PHYS101',
    name: 'Physics I',
    code: 'PHYS-101',
    type: 'Faculty Elective',
    creditHours: 3,
    failureTimes: 0,
    level: 1,
    sessions: [
      {
        sessionId: 'PHYS101-S1',
        lecturer: 'Dr. Michael Brown',
        content: ['Lecture'],
        day: 'Thursday',
        timeFrom: '10:00 AM',
        timeTo: '12:00 PM',
        room: 'Physics-201',
        availableSeats: 18
      },
      {
        sessionId: 'PHYS101-S2',
        lecturer: 'Dr. Michael Brown',
        content: ['Lab'],
        day: 'Thursday',
        timeFrom: '02:00 PM',
        timeTo: '04:00 PM',
        room: 'Physics-Lab-02',
        availableSeats: 18
      }
    ]
  },
  // Level 2 Courses
  {
    id: 'CS201',
    name: 'Data Structures',
    code: 'CS-201',
    type: 'Program Mandatory',
    creditHours: 4,
    failureTimes: 0,
    level: 2,
    sessions: [
      {
        sessionId: 'CS201-S1',
        lecturer: 'Prof. Michael Johnson',
        content: ['Lecture'],
        day: 'Saturday',
        timeFrom: '10:00 AM',
        timeTo: '12:00 PM',
        room: 'CS-201',
        availableSeats: 10
      },
      {
        sessionId: 'CS201-S2',
        lecturer: 'Prof. Michael Johnson',
        content: ['Lab'],
        day: 'Monday',
        timeFrom: '02:00 PM',
        timeTo: '04:00 PM',
        room: 'CS-Lab-02',
        availableSeats: 10
      }
    ]
  },
  {
    id: 'CS202',
    name: 'Object-Oriented Programming',
    code: 'CS-202',
    type: 'Program Mandatory',
    creditHours: 3,
    failureTimes: 0,
    level: 2,
    sessions: [
      {
        sessionId: 'CS202-S1',
        lecturer: 'Dr. Lisa Anderson',
        content: ['Lecture', 'Lab'],
        day: 'Sunday',
        timeFrom: '02:00 PM',
        timeTo: '05:00 PM',
        room: 'CS-Lab-03',
        availableSeats: 18
      }
    ]
  },
  {
    id: 'MATH201',
    name: 'Discrete Mathematics',
    code: 'MATH-201',
    type: 'Faculty Mandatory',
    creditHours: 3,
    failureTimes: 0,
    level: 2,
    sessions: [
      {
        sessionId: 'MATH201-S1',
        lecturer: 'Prof. David Lee',
        content: ['Lecture'],
        day: 'Wednesday',
        timeFrom: '10:00 AM',
        timeTo: '12:00 PM',
        room: 'Math-303',
        availableSeats: 14
      }
    ]
  },
  {
    id: 'DB201',
    name: 'Database Management Systems',
    code: 'DB-201',
    type: 'Program Mandatory',
    creditHours: 4,
    failureTimes: 0,
    level: 2,
    sessions: [
      {
        sessionId: 'DB201-S1',
        lecturer: 'Dr. Robert Taylor',
        content: ['Lecture'],
        day: 'Thursday',
        timeFrom: '08:00 AM',
        timeTo: '10:00 AM',
        room: 'CS-301',
        availableSeats: 16
      },
      {
        sessionId: 'DB201-S2',
        lecturer: 'Dr. Robert Taylor',
        content: ['Lab'],
        day: 'Thursday',
        timeFrom: '10:00 AM',
        timeTo: '12:00 PM',
        room: 'CS-Lab-04',
        availableSeats: 16
      }
    ]
  },
  // Level 3 & 4 courses similar structure...
  {
    id: 'CS301',
    name: 'Advanced Algorithms',
    code: 'CS-301',
    type: 'Program Mandatory',
    creditHours: 4,
    failureTimes: 0,
    level: 3,
    sessions: [
      {
        sessionId: 'CS301-S1',
        lecturer: 'Dr. Sarah Wilson',
        content: ['Lecture', 'Workshop'],
        day: 'Saturday',
        timeFrom: '02:00 PM',
        timeTo: '05:00 PM',
        room: 'CS-401',
        availableSeats: 22
      }
    ]
  },
  {
    id: 'CS401',
    name: 'Software Engineering',
    code: 'CS-401',
    type: 'Program Mandatory',
    creditHours: 4,
    failureTimes: 0,
    level: 4,
    sessions: [
      {
        sessionId: 'CS401-S1',
        lecturer: 'Prof. Jennifer Clark',
        content: ['Lecture'],
        day: 'Saturday',
        timeFrom: '08:00 AM',
        timeTo: '10:00 AM',
        room: 'CS-501',
        availableSeats: 18
      },
      {
        sessionId: 'CS401-S2',
        lecturer: 'Prof. Jennifer Clark',
        content: ['Project'],
        day: 'Sunday',
        timeFrom: '10:00 AM',
        timeTo: '12:00 PM',
        room: 'CS-501',
        availableSeats: 18
      }
    ]
  }
];

const timeSlots = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM'
];

const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const MAX_CREDIT_HOURS = 21;

export function AcademicRegistrationPage({ user }: AcademicRegistrationPageProps) {
  const [selectedLevel, setSelectedLevel] = useState('1');
  const [selectedSessions, setSelectedSessions] = useState<SelectedSession[]>([]);
  const [sessionSeats, setSessionSeats] = useState<Record<string, number>>({});

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'University Mandatory':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'University Elective':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Faculty Mandatory':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Faculty Elective':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Program Mandatory':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Program Elective':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCourseColor = (courseId: string) => {
    const colors = [
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-rose-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500'
    ];
    const uniqueCourses = [...new Set(selectedSessions.map(s => s.courseId))];
    const index = uniqueCourses.indexOf(courseId);
    return colors[index % colors.length];
  };

  const isSessionAdded = (sessionId: string) => {
    return selectedSessions.some(s => s.sessionId === sessionId);
  };

  const getAvailableSeats = (sessionId: string, defaultSeats: number) => {
    return sessionSeats[sessionId] ?? defaultSeats;
  };

  const hasTimeConflict = (session: CourseSession) => {
    return selectedSessions.some(selected => {
      if (selected.day !== session.day) return false;

      const selectedStart = selected.timeFrom;
      const selectedEnd = selected.timeTo;
      const sessionStart = session.timeFrom;
      const sessionEnd = session.timeTo;

      return (
        (sessionStart >= selectedStart && sessionStart < selectedEnd) ||
        (sessionEnd > selectedStart && sessionEnd <= selectedEnd) ||
        (sessionStart <= selectedStart && sessionEnd >= selectedEnd)
      );
    });
  };

  const addSession = (course: Course, session: CourseSession) => {
    if (isSessionAdded(session.sessionId)) {
      toast.error('This session is already added');
      return;
    }

    const currentSeats = getAvailableSeats(session.sessionId, session.availableSeats);
    if (currentSeats <= 0) {
      toast.error('❌ No seats available for this session');
      return;
    }

    if (hasTimeConflict(session)) {
      toast.error('⚠️ This session conflicts with another one in your timetable');
      return;
    }

    const currentCredits = getTotalCreditHours();
    if (currentCredits + course.creditHours > MAX_CREDIT_HOURS) {
      toast.error(`🚫 You cannot exceed your maximum allowed credit hours (${MAX_CREDIT_HOURS})`);
      return;
    }

    const newSession: SelectedSession = {
      ...session,
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      creditHours: course.creditHours,
      addedAt: new Date()
    };

    setSelectedSessions([...selectedSessions, newSession]);
    setSessionSeats(prev => ({
      ...prev,
      [session.sessionId]: currentSeats - 1
    }));
    toast.success(`✓ ${course.code} session added to your timetable`);
  };

  const removeSession = (sessionId: string) => {
    const session = selectedSessions.find(s => s.sessionId === sessionId);
    if (!session) return;

    setSelectedSessions(selectedSessions.filter(s => s.sessionId !== sessionId));

    const currentSeats = sessionSeats[sessionId];
    if (currentSeats !== undefined) {
      setSessionSeats(prev => ({
        ...prev,
        [sessionId]: currentSeats + 1
      }));
    }

    toast.success('Session removed from timetable');
  };

  const getTotalCreditHours = () => {
    const uniqueCourses = new Set(selectedSessions.map(s => s.courseId));
    return Array.from(uniqueCourses).reduce((sum, courseId) => {
      const session = selectedSessions.find(s => s.courseId === courseId);
      return sum + (session?.creditHours || 0);
    }, 0);
  };

  const submitRegistration = () => {
    if (selectedSessions.length === 0) {
      toast.error('Please select at least one course session');
      return;
    }

    toast.success(`✓ Registration submitted! Total: ${getTotalCreditHours()} credit hours`);
  };

  const getCoursesForLevel = (level: number) => {
    return mockCourses.filter(c => c.level === level);
  };

  const renderTimetableCell = (day: string, time: string) => {
    const session = selectedSessions.find(s => {
      if (s.day !== day) return false;
      return time >= s.timeFrom && time < s.timeTo;
    });

    if (!session) return null;
    if (session.timeFrom !== time) return null;

    const startIndex = timeSlots.indexOf(session.timeFrom);
    const endIndex = timeSlots.indexOf(session.timeTo);
    const duration = endIndex - startIndex;

    return (
      <div
        className={`${getCourseColor(session.courseId)} text-white p-3 rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group relative`}
        style={{ gridRow: `span ${duration}` }}
        onClick={() => removeSession(session.sessionId)}
      >
        <div className="space-y-1">
          <p className="font-semibold text-sm">{session.courseCode}</p>
          <p className="text-xs opacity-95 line-clamp-1">{session.courseName}</p>
          <div className="flex items-center gap-1 text-xs opacity-90">
            <MapPin className="w-3 h-3" />
            <span>{session.room}</span>
          </div>
          <div className="flex items-center gap-1 text-xs opacity-90">
            <Clock className="w-3 h-3" />
            <span>{session.timeFrom} - {session.timeTo}</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-20 rounded-lg transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100">Click to remove</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-slate-900">Academic Registration</h2>
        <p className="text-slate-600">Build your semester timetable by selecting courses</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Selected Courses</p>
                <p className="text-3xl text-blue-600 mt-1">{new Set(selectedSessions.map(s => s.courseId)).size}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Credit Hours</p>
                <p className="text-3xl text-emerald-600 mt-1">{getTotalCreditHours()}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Max. Credit Hours Can Be Registered</p>
                <p className="text-3xl text-indigo-600 mt-1">{MAX_CREDIT_HOURS}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Selection */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">Available Courses</CardTitle>
          <CardDescription className="text-slate-600">Browse courses by level and add sessions to your timetable</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={selectedLevel} onValueChange={setSelectedLevel}>
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-slate-100">
              <TabsTrigger value="1" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Level 1</TabsTrigger>
              <TabsTrigger value="2" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Level 2</TabsTrigger>
              <TabsTrigger value="3" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Level 3</TabsTrigger>
              <TabsTrigger value="4" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Level 4</TabsTrigger>
            </TabsList>

            {[1, 2, 3, 4].map(level => (
              <TabsContent key={level} value={String(level)} className="space-y-4">
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full border-collapse min-w-[1400px]">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Course Code</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700 sticky left-[120px] bg-slate-50 z-10 border-r border-slate-200">Course Name</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Type</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Credits</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Failures</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Lecturer</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Content</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Day</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Time</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Room</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Seats</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCoursesForLevel(level).map(course =>
                        course.sessions.map((session, sessionIndex) => (
                          <tr
                            key={session.sessionId}
                            className={`border-t border-slate-200 hover:bg-blue-50/50 transition-colors ${sessionIndex === 0 ? 'border-t-2 border-t-slate-300' : ''
                              }`}
                          >
                            <td className="py-3 px-4 sticky left-0 bg-white z-10 border-r border-slate-200">
                              {sessionIndex === 0 && (
                                <span className="font-semibold text-slate-900">{course.code}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 sticky left-[120px] bg-white z-10 border-r border-slate-200">
                              {sessionIndex === 0 && (
                                <span className="text-slate-900">{course.name}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {sessionIndex === 0 && (
                                <Badge className={`${getTypeColor(course.type)} text-xs border`}>
                                  {course.type}
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {sessionIndex === 0 && (
                                <span className="font-semibold text-slate-900">{course.creditHours}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {sessionIndex === 0 && (
                                <span className={course.failureTimes > 0 ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                                  {course.failureTimes}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-slate-700 text-sm">{session.lecturer}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                {session.content.map(c => (
                                  <Badge key={c} variant="outline" className="text-xs border-slate-300 text-slate-600">
                                    {c}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-slate-700 text-sm">{session.day}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-slate-700 text-sm whitespace-nowrap">{session.timeFrom} - {session.timeTo}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-slate-700 text-sm">{session.room}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`font-semibold ${getAvailableSeats(session.sessionId, session.availableSeats) < 5
                                ? 'text-orange-600'
                                : getAvailableSeats(session.sessionId, session.availableSeats) === 0
                                  ? 'text-red-600'
                                  : 'text-emerald-600'
                                }`}>
                                {getAvailableSeats(session.sessionId, session.availableSeats)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isSessionAdded(session.sessionId) ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                  onClick={() => removeSession(session.sessionId)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addSession(course, session)}
                                  disabled={getAvailableSeats(session.sessionId, session.availableSeats) === 0 || hasTimeConflict(session)}
                                  className="hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Interactive Timetable */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">Your Weekly Timetable</CardTitle>
          <CardDescription className="text-slate-600">
            {selectedSessions.length > 0
              ? 'Click on a session to remove it from your timetable'
              : 'Add course sessions from the table above to see them here'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2">
                {/* Header */}
                <div className="bg-slate-100 p-3 rounded-lg font-semibold text-center text-sm text-slate-700">Time</div>
                {daysOfWeek.map(day => (
                  <div key={day} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg font-semibold text-center text-sm">
                    {day}
                  </div>
                ))}

                {/* Time slots */}
                {timeSlots.map(time => (
                  <div key={time} className="contents">
                    <div className="bg-slate-50 p-3 rounded-lg text-center text-sm text-slate-700 font-medium">
                      {time}
                    </div>
                    {daysOfWeek.map(day => (
                      <div key={`${day}-${time}`} className="bg-white border border-slate-200 rounded-lg p-2 min-h-[80px] relative hover:bg-slate-50/50 transition-colors">
                        {renderTimetableCell(day, time)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={submitRegistration}
          disabled={selectedSessions.length === 0}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-6 text-base shadow-md hover:shadow-lg transition-all"
        >
          Submit Registration ({getTotalCreditHours()} Credit Hours)
        </Button>
      </div>
    </div>
  );
}
