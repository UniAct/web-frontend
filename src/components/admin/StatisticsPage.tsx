import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar } from '../ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { 
  Users, 
  GraduationCap, 
  Shield, 
  Network,
  ChevronDown,
  ChevronRight,
  Bell,
  CalendarIcon
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface StatisticsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

interface ProgramAbsence {
  name: string;
  absences: number;
  levels: {
    name: string;
    absences: number;
  }[];
}

interface AnnouncementEvent {
  id: string;
  title: string;
  date: Date;
  type: 'announcement' | 'event';
  description: string;
}

export function StatisticsPage({ selectedUniversity }: StatisticsPageProps) {
  const [expandedPrograms, setExpandedPrograms] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeEventTab, setActiveEventTab] = useState('announcements');

  // Mock data
  const summaryStats = [
    { label: 'Total Students', value: '2,845', icon: Users, color: 'blue' },
    { label: 'Total Staff', value: '287', icon: GraduationCap, color: 'green' },
    { label: 'Total Admins', value: '45', icon: Shield, color: 'purple' },
    { label: 'Active Teams', value: '126', icon: Network, color: 'orange' }
  ];

  const programAbsences: ProgramAbsence[] = [
    {
      name: 'Computer Science',
      absences: 45,
      levels: [
        { name: 'Level 1', absences: 15 },
        { name: 'Level 2', absences: 12 },
        { name: 'Level 3', absences: 10 },
        { name: 'Level 4', absences: 8 }
      ]
    },
    {
      name: 'Engineering',
      absences: 38,
      levels: [
        { name: 'Level 1', absences: 12 },
        { name: 'Level 2', absences: 10 },
        { name: 'Level 3', absences: 9 },
        { name: 'Level 4', absences: 7 }
      ]
    },
    {
      name: 'Business Administration',
      absences: 32,
      levels: [
        { name: 'Level 1', absences: 10 },
        { name: 'Level 2', absences: 8 },
        { name: 'Level 3', absences: 8 },
        { name: 'Level 4', absences: 6 }
      ]
    },
    {
      name: 'Medicine',
      absences: 28,
      levels: [
        { name: 'Level 1', absences: 8 },
        { name: 'Level 2', absences: 7 },
        { name: 'Level 3', absences: 7 },
        { name: 'Level 4', absences: 6 }
      ]
    },
    {
      name: 'Arts & Humanities',
      absences: 22,
      levels: [
        { name: 'Level 1', absences: 6 },
        { name: 'Level 2', absences: 6 },
        { name: 'Level 3', absences: 5 },
        { name: 'Level 4', absences: 5 }
      ]
    }
  ];

  const pieChartData = programAbsences.map((program, index) => ({
    name: program.name,
    value: program.absences,
    color: COLORS[index % COLORS.length]
  }));

  const upcomingEvents: AnnouncementEvent[] = [
    {
      id: '1',
      title: 'Annual Research Symposium',
      date: new Date(2024, 9, 15),
      type: 'event',
      description: 'Annual research symposium featuring presentations from faculty and graduate students.'
    },
    {
      id: '2',
      title: 'Career Fair 2024',
      date: new Date(2024, 9, 10),
      type: 'event',
      description: 'Annual career fair with 50+ companies recruiting for internships and full-time positions.'
    },
    {
      id: '3',
      title: 'Faculty Development Workshop',
      date: new Date(2024, 7, 20),
      type: 'event',
      description: 'Professional development workshop on innovative teaching methodologies.'
    }
  ];

  const upcomingAnnouncements: AnnouncementEvent[] = [
    {
      id: '1',
      title: 'Fall Semester Registration Opens',
      date: new Date(2024, 7, 1),
      type: 'announcement',
      description: 'Registration for Fall 2024 semester will begin on August 1st.'
    },
    {
      id: '2',
      title: 'Library Hours Extended',
      date: new Date(2024, 6, 28),
      type: 'announcement',
      description: 'Starting next week, the university library will extend its hours.'
    },
    {
      id: '3',
      title: 'Scholarship Applications Open',
      date: new Date(2024, 6, 30),
      type: 'announcement',
      description: 'Merit-based scholarship applications are now open for the upcoming academic year.'
    }
  ];

  const toggleProgram = (programName: string) => {
    setExpandedPrograms(prev =>
      prev.includes(programName)
        ? prev.filter(p => p !== programName)
        : [...prev, programName]
    );
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'green': return 'bg-green-100 text-green-600';
      case 'purple': return 'bg-purple-100 text-purple-600';
      case 'orange': return 'bg-orange-100 text-orange-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getEventsForDate = (date: Date | undefined, type: 'event' | 'announcement') => {
    if (!date) return [];
    
    const items = type === 'event' ? upcomingEvents : upcomingAnnouncements;
    
    return items.filter(item => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getDate() === date.getDate() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const hasEventsOnDate = (date: Date, type: 'event' | 'announcement') => {
    const items = type === 'event' ? upcomingEvents : upcomingAnnouncements;
    
    return items.some(item => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getDate() === date.getDate() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const selectedItems = getEventsForDate(selectedDate, activeEventTab as 'event' | 'announcement');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-slate-900">Statistics & Analytics</h2>
        <p className="text-slate-600 mt-1">Overview of institutional data and insights</p>
      </div>

      {/* Top Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${getColorClass(stat.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Absence Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Absence Overview</CardTitle>
          <CardDescription>Absence statistics by program and level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="flex items-center justify-center min-h-[350px]">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Program List - Scrollable */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
              {programAbsences.map((program) => (
                <Collapsible
                  key={program.name}
                  open={expandedPrograms.includes(program.name)}
                  onOpenChange={() => toggleProgram(program.name)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        {expandedPrograms.includes(program.name) ? (
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        )}
                        <span className="text-slate-900">{program.name}</span>
                      </div>
                      <Badge variant="secondary">{program.absences} absences</Badge>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-7 mt-2 space-y-2">
                      {program.levels.map((level) => (
                        <div
                          key={level.name}
                          className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100"
                        >
                          <span className="text-sm text-slate-700">{level.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {level.absences} absences
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events & Announcements Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events & Announcements</CardTitle>
          <CardDescription>View scheduled events and announcements on the calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeEventTab} onValueChange={setActiveEventTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="announcements" className="gap-2">
                <Bell className="w-4 h-4" />
                Announcements
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                Events
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar View */}
              <div className="w-full overflow-x-auto">
                <div className="mx-auto w-max max-w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      hasEvent: (date) => hasEventsOnDate(date, activeEventTab as 'event' | 'announcement')
                    }}
                    modifiersStyles={{
                      hasEvent: {
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        color: activeEventTab === 'events' ? '#3b82f6' : '#8b5cf6'
                      }
                    }}
                  />
                </div>
              </div>

              {/* Selected Date Items */}
              <div>
                <h4 className="text-sm text-slate-900 mb-3">
                  {selectedDate
                    ? `${activeEventTab === 'events' ? 'Events' : 'Announcements'} on ${selectedDate.toLocaleDateString()}`
                    : 'Select a date to view details'}
                </h4>
                
                <div className="space-y-3">
                  {selectedItems.length > 0 ? (
                    selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="text-slate-900">{item.title}</h5>
                          <Badge variant={item.type === 'event' ? 'default' : 'secondary'}>
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{item.description}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {item.date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <p>No {activeEventTab} scheduled for this date</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
