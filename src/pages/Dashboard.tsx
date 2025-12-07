import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
  Calendar,
  Users,
  Bot,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  UserCheck,
  BarChart3,
  FileUp,
  UserCog,
  MessageSquare,
  Award,
  Settings
} from 'lucide-react';
import type { User as AppUser } from '../App';

interface DashboardProps {
  user: AppUser;
}

export function Dashboard({ user }: DashboardProps) {
  const renderStudentDashboard = () => (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="space-y-2">
        <h1 className="text-slate-900">Welcome back, {user.name.split(' ')[0]}!</h1>
        <p className="text-slate-600">Here's what's happening with your studies today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Attendance Rate</p>
                <p className="text-3xl text-emerald-600 mt-1">92%</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Active Teams</p>
                <p className="text-3xl text-blue-600 mt-1">3</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Upcoming Classes</p>
                <p className="text-3xl text-purple-600 mt-1">2</p>
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
                <p className="text-slate-600 text-sm">Career Opportunities</p>
                <p className="text-3xl text-orange-600 mt-1">12</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Calendar className="w-5 h-5 text-blue-600" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                <div>
                  <p className="text-sm text-slate-900 font-medium">Data Structures & Algorithms</p>
                  <p className="text-xs text-slate-600 mt-1">Room 101, CS Building</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-900 font-medium">10:00 AM</p>
                  <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 mt-1">In 2 hours</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-colors">
                <div>
                  <p className="text-sm text-slate-900 font-medium">Database Management</p>
                  <p className="text-xs text-slate-600 mt-1">Room 205, CS Building</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-900 font-medium">2:00 PM</p>
                  <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 mt-1">In 6 hours</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Hours Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Credit Hours Progress
            </CardTitle>
            <CardDescription>Track your academic progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* University Credit Hours */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">University Hours</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Mandatory</span>
                    <span className="text-gray-900 font-medium">2 / 4 hrs</span>
                  </div>
                  <Progress value={50} className="h-1.5" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Elective</span>
                    <span className="text-gray-900 font-medium">3 / 6 hrs</span>
                  </div>
                  <Progress value={50} className="h-1.5" />
                </div>
              </div>

              {/* Faculty Credit Hours */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Faculty Hours</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Mandatory</span>
                    <span className="text-gray-900 font-medium">24 / 48 hrs</span>
                  </div>
                  <Progress value={50} className="h-1.5" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Elective</span>
                    <span className="text-gray-900 font-medium">6 / 12 hrs</span>
                  </div>
                  <Progress value={50} className="h-1.5" />
                </div>
              </div>

              {/* Program Credit Hours */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Program Hours</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Mandatory</span>
                    <span className="text-gray-900 font-medium">29 / 58 hrs</span>
                  </div>
                  <Progress value={50} className="h-1.5" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Elective</span>
                    <span className="text-gray-900 font-medium">6 / 12 hrs</span>
                  </div>
                  <Progress value={50} className="h-1.5" />
                </div>
              </div>

              {/* Total Credit Hours */}
              <div className="space-y-2 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-900 font-medium">Total Hours</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Mandatory</span>
                    <span className="text-blue-600 font-medium">55 / 110 hrs</span>
                  </div>
                  <Progress value={50} className="h-2" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Elective</span>
                    <span className="text-purple-600 font-medium">15 / 30 hrs</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Teams & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Project Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm">Mobile App Development</p>
                  <p className="text-xs text-muted-foreground">4 members • Due Mar 25</p>
                </div>
                <div className="text-right">
                  <Progress value={75} className="w-20 h-2" />
                  <p className="text-xs text-muted-foreground mt-1">75% complete</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm">AI Research Project</p>
                  <p className="text-xs text-muted-foreground">3 members • Due Apr 10</p>
                </div>
                <div className="text-right">
                  <Progress value={45} className="w-20 h-2" />
                  <p className="text-xs text-muted-foreground mt-1">45% complete</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Assignment 3 - Data Structures</p>
                  <p className="text-xs text-muted-foreground">Due in 2 days</p>
                </div>
                <Badge variant="destructive" className="text-xs">High</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Project Milestone 2</p>
                  <p className="text-xs text-muted-foreground">Due in 5 days</p>
                </div>
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Medium</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Research Paper Draft</p>
                  <p className="text-xs text-muted-foreground">Due in 1 week</p>
                </div>
                <Badge variant="secondary" className="text-xs">Low</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFacultyDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-2">Good morning, {user.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's an overview of your classes and students today.</p>
      </div>

      {/* Faculty Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Students</p>
                <p className="text-2xl">156</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Avg Attendance</p>
                <p className="text-2xl text-green-600">87%</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Teams</p>
                <p className="text-2xl">24</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending Reviews</p>
                <p className="text-2xl text-orange-600">8</p>
              </div>
              <FileUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Classes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Today's Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm">CS 101 - Introduction to Programming</p>
                  <p className="text-xs text-muted-foreground">45 students • Room 101</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">9:00 AM - 10:30 AM</p>
                  <Badge className="text-xs bg-green-100 text-green-800">In Progress</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm">CS 301 - Advanced Algorithms</p>
                  <p className="text-xs text-muted-foreground">28 students • Room 205</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">2:00 PM - 3:30 PM</p>
                  <Badge variant="secondary" className="text-xs">Upcoming</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <UserCheck className="w-4 h-4 mr-2" />
                Take Attendance
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileUp className="w-4 h-4 mr-2" />
                Upload Materials
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Announcement
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-2">System Overview</h1>
        <p className="text-muted-foreground">Monitor and manage the university's digital ecosystem.</p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <p className="text-2xl">2,847</p>
              </div>
              <UserCog className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Sessions</p>
                <p className="text-2xl text-green-600">1,234</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">System Health</p>
                <p className="text-2xl text-green-600">99.9%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending Issues</p>
                <p className="text-2xl text-orange-600">3</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm">New user registration: 15 students</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm">System backup completed</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm">Database maintenance scheduled</p>
                  <p className="text-xs text-muted-foreground">6 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <UserCog className="w-4 h-4 mr-2" />
                User Management
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileUp className="w-4 h-4 mr-2" />
                Bulk Data Import
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics Dashboard
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAlumniDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-2">Welcome back to your alma mater!</h1>
        <p className="text-muted-foreground">Stay connected and give back to the university community.</p>
      </div>

      {/* Alumni Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Network Size</p>
                <p className="text-2xl">456</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Mentoring Sessions</p>
                <p className="text-2xl text-green-600">12</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Job Postings</p>
                <p className="text-2xl">8</p>
              </div>
              <Briefcase className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Events Attended</p>
                <p className="text-2xl">23</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alumni Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">JD</span>
                </div>
                <div>
                  <p className="text-sm">John Davis connected with you</p>
                  <p className="text-xs text-muted-foreground">Software Engineer at Google</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">SM</span>
                </div>
                <div>
                  <p className="text-sm">Sarah Miller joined your network</p>
                  <p className="text-xs text-muted-foreground">Product Manager at Microsoft</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="text-sm">Alumni Networking Mixer</p>
                <p className="text-xs text-muted-foreground">March 20, 2024 • 6:00 PM</p>
                <p className="text-xs text-muted-foreground">Student Center</p>
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-sm">Tech Industry Panel Discussion</p>
                <p className="text-xs text-muted-foreground">March 25, 2024 • 2:00 PM</p>
                <p className="text-xs text-muted-foreground">Virtual Event</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  switch (user.role) {
    case 'student':
      return renderStudentDashboard();
    case 'faculty':
      return renderFacultyDashboard();
    case 'admin':
      return renderAdminDashboard();
    case 'alumni':
      return renderAlumniDashboard();
    default:
      return renderStudentDashboard();
  }
}
