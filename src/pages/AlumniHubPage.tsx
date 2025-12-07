import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Users,
  Calendar,
  Briefcase,
  MessageSquare,
  Award,
  MapPin,
  Building,
  GraduationCap,
  Star,
  Clock,
  Search,
  Filter,
  Video,
  Coffee,
  Network
} from 'lucide-react';
import type { User as AppUser } from '../App';

interface AlumniHubPageProps {
  user: AppUser;
}

interface Alumni {
  id: string;
  name: string;
  graduationYear: number;
  degree: string;
  currentRole: string;
  company: string;
  industry: string;
  location: string;
  bio: string;
  mentorshipAvailable: boolean;
  rating: number;
  sessions: number;
}

interface Event {
  id: string;
  title: string;
  type: 'networking' | 'lecture' | 'workshop' | 'seminar';
  date: string;
  time: string;
  location: string;
  organizer: string;
  description: string;
  attendees: number;
  maxAttendees: number;
}

interface MentorshipSession {
  id: string;
  mentor: string;
  date: string;
  time: string;
  duration: string;
  topic: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export function AlumniHubPage({ user }: AlumniHubPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [selectedAlumni, setSelectedAlumni] = useState<string>('');

  const alumni: Alumni[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      graduationYear: 2018,
      degree: 'MS Computer Science',
      currentRole: 'Senior Software Engineer',
      company: 'Google',
      industry: 'Technology',
      location: 'San Francisco, CA',
      bio: 'Passionate about machine learning and distributed systems. Love mentoring students transitioning into tech careers.',
      mentorshipAvailable: true,
      rating: 4.8,
      sessions: 23,
    },
    {
      id: '2',
      name: 'Michael Chen',
      graduationYear: 2016,
      degree: 'BS Computer Science',
      currentRole: 'Product Manager',
      company: 'Microsoft',
      industry: 'Technology',
      location: 'Seattle, WA',
      bio: 'Product strategy and user experience expert. Helping students understand the business side of technology.',
      mentorshipAvailable: true,
      rating: 4.9,
      sessions: 31,
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      graduationYear: 2020,
      degree: 'MS Data Science',
      currentRole: 'Data Scientist',
      company: 'Netflix',
      industry: 'Entertainment',
      location: 'Los Angeles, CA',
      bio: 'Specializing in recommendation systems and machine learning at scale. Open to discussing career paths in data science.',
      mentorshipAvailable: true,
      rating: 4.7,
      sessions: 15,
    },
    {
      id: '4',
      name: 'David Thompson',
      graduationYear: 2015,
      degree: 'BS Computer Engineering',
      currentRole: 'Startup Founder',
      company: 'TechFlow Solutions',
      industry: 'Startup',
      location: 'Austin, TX',
      bio: 'Serial entrepreneur with experience in fintech and e-commerce. Mentoring students interested in startups.',
      mentorshipAvailable: false,
      rating: 4.6,
      sessions: 42,
    },
  ];

  const events: Event[] = [
    {
      id: '1',
      title: 'Tech Industry Career Panel',
      type: 'networking',
      date: '2024-03-25',
      time: '6:00 PM',
      location: 'Student Center Auditorium',
      organizer: 'Alumni Association',
      description: 'Panel discussion with alumni from major tech companies sharing career insights and answering questions.',
      attendees: 45,
      maxAttendees: 100,
    },
    {
      id: '2',
      title: 'AI in Healthcare: Guest Lecture',
      type: 'lecture',
      date: '2024-03-28',
      time: '2:00 PM',
      location: 'Virtual Event',
      organizer: 'Dr. Lisa Wang (Class of 2014)',
      description: 'Exploring the applications of artificial intelligence in modern healthcare systems.',
      attendees: 78,
      maxAttendees: 150,
    },
    {
      id: '3',
      title: 'Startup Workshop: From Idea to Launch',
      type: 'workshop',
      date: '2024-04-02',
      time: '10:00 AM',
      location: 'Innovation Lab',
      organizer: 'Entrepreneurship Club',
      description: 'Hands-on workshop covering the essentials of starting a tech company.',
      attendees: 22,
      maxAttendees: 30,
    },
    {
      id: '4',
      title: 'Alumni Networking Mixer',
      type: 'networking',
      date: '2024-04-05',
      time: '7:00 PM',
      location: 'Alumni Center',
      organizer: 'Alumni Relations',
      description: 'Casual networking event for current students and alumni in the area.',
      attendees: 67,
      maxAttendees: 120,
    },
  ];

  const mentorshipSessions: MentorshipSession[] = [
    {
      id: '1',
      mentor: 'Sarah Johnson',
      date: '2024-03-20',
      time: '3:00 PM',
      duration: '45 min',
      topic: 'Career Transition to Tech',
      status: 'scheduled',
    },
    {
      id: '2',
      mentor: 'Michael Chen',
      date: '2024-03-15',
      time: '2:00 PM',
      duration: '30 min',
      topic: 'Product Management Fundamentals',
      status: 'completed',
    },
  ];

  const industries = ['Technology', 'Finance', 'Healthcare', 'Entertainment', 'Startup', 'Consulting'];
  const graduationYears = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];

  const filteredAlumni = alumni.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.currentRole.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || person.industry === industryFilter;
    const matchesYear = yearFilter === 'all' || person.graduationYear.toString() === yearFilter;

    return matchesSearch && matchesIndustry && matchesYear;
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'networking': return 'bg-blue-100 text-blue-800';
      case 'lecture': return 'bg-purple-100 text-purple-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'seminar': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-2">Alumni Hub</h1>
        <p className="text-muted-foreground">Connect with graduates, find mentors, and expand your professional network.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Alumni Network</p>
                <p className="text-2xl">2,847</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Available Mentors</p>
                <p className="text-2xl text-green-600">156</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Upcoming Events</p>
                <p className="text-2xl text-purple-600">12</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Job Opportunities</p>
                <p className="text-2xl text-orange-600">34</p>
              </div>
              <Briefcase className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="directory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="directory">Alumni Directory</TabsTrigger>
          <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="jobs">Job Board</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search alumni by name, company, or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {graduationYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alumni Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((person) => (
              <Card key={person.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Profile Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg">{person.name}</h3>
                        <p className="text-sm text-muted-foreground">Class of {person.graduationYear}</p>
                        <p className="text-sm text-muted-foreground">{person.degree}</p>
                      </div>
                    </div>

                    {/* Current Position */}
                    <div>
                      <p className="text-sm">{person.currentRole}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Building className="w-3 h-3" />
                        <span>{person.company}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{person.location}</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-muted-foreground line-clamp-3">{person.bio}</p>

                    {/* Mentorship Info */}
                    {person.mentorshipAvailable && (
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700">Available for Mentorship</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs">{person.rating}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                      {person.mentorshipAvailable && (
                        <Button size="sm" className="flex-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          Book Session
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mentorship" className="space-y-6">
          {/* My Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>My Mentorship Sessions</CardTitle>
              <CardDescription>Track your scheduled and completed mentorship sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mentorshipSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">
                          {session.mentor.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm">{session.topic}</p>
                        <p className="text-xs text-muted-foreground">with {session.mentor}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">{session.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{session.time} ({session.duration})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      {session.status === 'scheduled' && (
                        <Button variant="outline" size="sm">
                          <Video className="w-3 h-3 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Mentors */}
          <Card>
            <CardHeader>
              <CardTitle>Available Mentors</CardTitle>
              <CardDescription>Find mentors in your area of interest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alumni.filter(person => person.mentorshipAvailable).map((mentor) => (
                  <div key={mentor.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">
                          {mentor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm">{mentor.name}</h4>
                        <p className="text-xs text-muted-foreground">{mentor.currentRole} at {mentor.company}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs">{mentor.rating} • {mentor.sessions} sessions</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{mentor.bio}</p>
                    <Button size="sm" className="w-full">
                      Book Mentorship Session
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription>Organized by {event.organizer}</CardDescription>
                    </div>
                    <Badge className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{event.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{event.attendees}/{event.maxAttendees} attending</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        Register
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Opportunities</CardTitle>
              <CardDescription>Career opportunities shared by alumni and partner companies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Job board feature coming soon...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Alumni will be able to share job opportunities and internships here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
