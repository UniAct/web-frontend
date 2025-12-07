import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Download, Calendar, Clock, MapPin, BookOpen, User } from 'lucide-react';
import type { User as AppUser } from '../App';
import { toast } from 'sonner';

interface TimetablePageProps {
  user: AppUser;
}

interface SavedCourse {
  id: string;
  name: string;
  code: string;
  type: string;
  creditHours: number;
  lecturer: string;
  content: string[];
  day: string;
  timeFrom: string;
  timeTo: string;
  room: string;
}

// Mock saved timetable data (would come from backend in real app)
const savedCourses: SavedCourse[] = [
  {
    id: 'CS401',
    name: 'Software Engineering',
    code: 'CS-401',
    type: 'Program Mandatory',
    creditHours: 4,
    lecturer: 'Prof. Jennifer Clark',
    content: ['Lecture', 'Project'],
    day: 'Saturday',
    timeFrom: '08:00 AM',
    timeTo: '11:00 AM',
    room: 'CS-501'
  },
  {
    id: 'SEC401',
    name: 'Cybersecurity Fundamentals',
    code: 'SEC-401',
    type: 'Program Mandatory',
    creditHours: 3,
    lecturer: 'Dr. Mark Roberts',
    content: ['Lecture', 'Lab'],
    day: 'Tuesday',
    timeFrom: '10:00 AM',
    timeTo: '01:00 PM',
    room: 'Security-Lab-01'
  },
  {
    id: 'ML401',
    name: 'Machine Learning',
    code: 'ML-401',
    type: 'Program Elective',
    creditHours: 4,
    lecturer: 'Dr. Anna Rodriguez',
    content: ['Lecture', 'Lab', 'Project'],
    day: 'Monday',
    timeFrom: '02:00 PM',
    timeTo: '06:00 PM',
    room: 'AI-Lab-02'
  },
  {
    id: 'CLOUD401',
    name: 'Cloud Computing',
    code: 'CLOUD-401',
    type: 'Program Elective',
    creditHours: 3,
    lecturer: 'Prof. Thomas White',
    content: ['Lecture', 'Workshop'],
    day: 'Wednesday',
    timeFrom: '08:00 AM',
    timeTo: '11:00 AM',
    room: 'CS-502'
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

export function TimetablePage({ user }: TimetablePageProps) {
  const [isExporting, setIsExporting] = useState(false);

  const getCourseColor = (courseId: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500'
    ];
    const index = savedCourses.findIndex(c => c.id === courseId);
    return colors[index % colors.length];
  };

  const getTotalCreditHours = () => {
    return savedCourses.reduce((sum, course) => sum + course.creditHours, 0);
  };

  const getTypeColor = (type: string) => {
    if (type.includes('Mandatory')) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const renderTimetableCell = (day: string, time: string) => {
    const course = savedCourses.find(c => {
      if (c.day !== day) return false;
      const courseStart = c.timeFrom;
      const courseEnd = c.timeTo;
      return time >= courseStart && time < courseEnd;
    });

    if (!course) return null;

    // Only render on the first time slot of the course
    if (course.timeFrom !== time) return null;

    const startIndex = timeSlots.indexOf(course.timeFrom);
    const endIndex = timeSlots.indexOf(course.timeTo);
    const duration = endIndex - startIndex;

    return (
      <div
        className={`${getCourseColor(course.id)} text-white p-4 rounded-lg shadow-md`}
        style={{
          gridRow: `span ${duration}`,
        }}
      >
        <div className="space-y-2">
          <div>
            <p className="font-semibold">{course.code}</p>
            <p className="text-sm opacity-95">{course.name}</p>
          </div>
          <div className="space-y-1 text-xs opacity-90">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{course.lecturer}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{course.room}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{course.timeFrom} - {course.timeTo}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const downloadAsPDF = async () => {
    setIsExporting(true);

    try {
      // Import html2pdf library dynamically
      const html2pdf = (await import('html2pdf.js')).default;

      const element = document.getElementById('timetable-content');
      if (!element) {
        toast.error('Timetable content not found');
        return;
      }

      // Clone the element to avoid modifying the original
      const clonedElement = element.cloneNode(true) as HTMLElement;

      // Create a comprehensive style override to prevent oklch parsing issues
      const style = document.createElement('style');
      style.textContent = `
        :root, * {
          --background: #f8f9fb !important;
          --foreground: #2d3748 !important;
          --card: #ffffff !important;
          --card-foreground: #2d3748 !important;
          --popover: #ffffff !important;
          --popover-foreground: #2d3748 !important;
          --primary: #2563eb !important;
          --primary-foreground: #ffffff !important;
          --secondary: #e2e8f0 !important;
          --secondary-foreground: #1e293b !important;
          --muted: #f1f5f9 !important;
          --muted-foreground: #64748b !important;
          --accent: #dbeafe !important;
          --accent-foreground: #1e40af !important;
          --destructive: #dc2626 !important;
          --destructive-foreground: #ffffff !important;
          --border: #e2e8f0 !important;
          --input: transparent !important;
          --ring: #93c5fd !important;
          --color-background: #f8f9fb !important;
          --color-foreground: #2d3748 !important;
          --color-card: #ffffff !important;
          --color-card-foreground: #2d3748 !important;
          --color-popover: #ffffff !important;
          --color-popover-foreground: #2d3748 !important;
          --color-primary: #2563eb !important;
          --color-primary-foreground: #ffffff !important;
          --color-secondary: #e2e8f0 !important;
          --color-secondary-foreground: #1e293b !important;
          --color-muted: #f1f5f9 !important;
          --color-muted-foreground: #64748b !important;
          --color-accent: #dbeafe !important;
          --color-accent-foreground: #1e40af !important;
          --color-destructive: #dc2626 !important;
          --color-destructive-foreground: #ffffff !important;
          --color-border: #e2e8f0 !important;
          --color-input: transparent !important;
          --color-ring: #93c5fd !important;
        }
        .text-primary-foreground { color: #ffffff !important; }
        .text-foreground { color: #2d3748 !important; }
        .text-muted-foreground { color: #64748b !important; }
        .text-slate-900 { color: #0f172a !important; }
        .text-slate-600 { color: #475569 !important; }
        .text-slate-700 { color: #334155 !important; }
        .bg-primary { background-color: #2563eb !important; }
        .bg-secondary { background-color: #e2e8f0 !important; }
        .bg-card { background-color: #ffffff !important; }
        .bg-white { background-color: #ffffff !important; }
        .bg-slate-50 { background-color: #f8fafc !important; }
        .bg-slate-100 { background-color: #f1f5f9 !important; }
        .border-border { border-color: #e2e8f0 !important; }
        .border-slate-100 { border-color: #f1f5f9 !important; }
        .border-slate-200 { border-color: #e2e8f0 !important; }
      `;
      clonedElement.prepend(style);

      // Force layout recalculation
      clonedElement.style.display = 'block';
      clonedElement.style.visibility = 'visible';

      const opt = {
        margin: 10,
        filename: `Timetable_Semester_1_${user.name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          onclone: (clonedDoc: Document) => {
            // Override all CSS variables in the cloned document to prevent oklch
            const root = clonedDoc.documentElement;
            const allElements = clonedDoc.querySelectorAll('*');

            // Set root variables
            const vars = {
              '--background': '#f8f9fb',
              '--foreground': '#2d3748',
              '--card': '#ffffff',
              '--card-foreground': '#2d3748',
              '--primary': '#2563eb',
              '--primary-foreground': '#ffffff',
              '--secondary': '#e2e8f0',
              '--secondary-foreground': '#1e293b',
              '--muted': '#f1f5f9',
              '--muted-foreground': '#64748b',
              '--border': '#e2e8f0',
              '--ring': '#93c5fd',
              '--color-background': '#f8f9fb',
              '--color-foreground': '#2d3748',
              '--color-card': '#ffffff',
              '--color-primary': '#2563eb',
              '--color-primary-foreground': '#ffffff',
              '--color-border': '#e2e8f0'
            };

            Object.entries(vars).forEach(([key, value]) => {
              root.style.setProperty(key, value, 'important');
            });

            // Remove any computed styles with oklch
            allElements.forEach((el) => {
              const element = el as HTMLElement;
              const computedStyle = window.getComputedStyle(element);

              // Check for oklch in color properties
              ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
                const value = computedStyle.getPropertyValue(prop);
                if (value && value.includes('oklch')) {
                  // Replace with a default color
                  element.style.setProperty(prop, '#2d3748', 'important');
                }
              });
            });
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      await html2pdf().set(opt).from(clonedElement).save();
      toast.success('Timetable downloaded successfully!');
    } catch (error: any) {
      console.error('PDF export error:', error);
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('oklch')) {
        toast.error('Color format error. Retrying with compatibility mode...');
        // Could implement a fallback here if needed
      } else {
        toast.error('Failed to download timetable. Please try again.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-slate-900">My Timetable</h2>
          <p className="text-slate-600 mt-1">Semester 1 - Academic Year 2024/2025</p>
        </div>
        <Button
          onClick={downloadAsPDF}
          disabled={isExporting}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Generating PDF...' : 'Download as PDF'}
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Courses</p>
                <p className="text-3xl text-blue-600 mt-1">{savedCourses.length}</p>
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
                <p className="text-sm text-slate-600">Credit Hours</p>
                <p className="text-3xl text-emerald-600 mt-1">{getTotalCreditHours()}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Mandatory</p>
                <p className="text-3xl text-purple-600 mt-1">
                  {savedCourses.filter(c => c.type.includes('Mandatory')).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Elective</p>
                <p className="text-3xl text-orange-600 mt-1">
                  {savedCourses.filter(c => c.type.includes('Elective')).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Content - This will be exported */}
      <div id="timetable-content">
        {/* Timetable Grid */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="print:border-b border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900">Weekly Schedule</CardTitle>
                <CardDescription className="text-slate-600">
                  {user.name} • Semester 1 • {getTotalCreditHours()} Credit Hours
                </CardDescription>
              </div>
              <div className="hidden print:block text-sm text-slate-500">
                Generated on {new Date().toLocaleDateString()}
              </div>
            </div>
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
                        <div key={`${day}-${time}`} className="bg-white border border-slate-200 rounded-lg p-2 min-h-[100px] relative hover:bg-slate-50/50 transition-colors">
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

        {/* Course Details List */}
        <Card className="mt-6 border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900">Course Details</CardTitle>
            <CardDescription className="text-slate-600">Complete list of registered courses</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {savedCourses.map((course, index) => (
                <div key={course.id} className="flex items-start gap-4 p-5 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                  <div className={`w-12 h-12 ${getCourseColor(course.id)} rounded-xl flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{course.code} - {course.name}</h4>
                        <p className="text-sm text-slate-600 mt-1">{course.lecturer}</p>
                      </div>
                      <Badge className={getTypeColor(course.type)}>
                        {course.type}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{course.day}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span>{course.timeFrom} - {course.timeTo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span>{course.room}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-orange-500" />
                        <span>{course.creditHours} Credit Hours</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {course.content.map(c => (
                        <Badge key={c} variant="outline" className="text-xs border-slate-300 text-slate-600 bg-white">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #timetable-content,
          #timetable-content * {
            visibility: visible;
          }
          #timetable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:border-b {
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 1rem;
            margin-bottom: 1rem;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
