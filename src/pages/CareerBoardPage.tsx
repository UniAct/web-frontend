import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import {
  Briefcase,
  MapPin,
  Building,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Search,
  Filter,
  BookmarkPlus,
  ExternalLink,
  GraduationCap,
  Star,
  TrendingUp,
  FileText,
  Target,
  CheckCircle
} from 'lucide-react';
import type { User as AppUser } from '../App';

interface CareerBoardPageProps {
  user: AppUser;
}

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  type: 'internship' | 'full-time' | 'part-time' | 'contract';
  location: string;
  remote: boolean;
  salaryRange: string;
  experience: string;
  postedBy: string;
  postedDate: string;
  deadline: string;
  description: string;
  requirements: string[];
  benefits: string[];
  saved: boolean;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'applied' | 'reviewing' | 'interview' | 'offer' | 'rejected';
  nextStep?: string;
}

export function CareerBoardPage({ user }: CareerBoardPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<string>('');

  const jobOpportunities: JobOpportunity[] = [
    {
      id: '1',
      title: 'Software Engineering Intern',
      company: 'Google',
      type: 'internship',
      location: 'Mountain View, CA',
      remote: false,
      salaryRange: '$6,000 - $8,000/month',
      experience: 'Entry Level',
      postedBy: 'Sarah Johnson (Alumni)',
      postedDate: '2024-03-10',
      deadline: '2024-04-15',
      description: 'Join our team to work on cutting-edge projects that impact billions of users worldwide. You\'ll collaborate with experienced engineers on real-world problems.',
      requirements: [
        'Currently pursuing BS/MS in Computer Science or related field',
        'Strong programming skills in Python, Java, or C++',
        'Understanding of data structures and algorithms',
        'Experience with software development lifecycle'
      ],
      benefits: [
        'Competitive compensation',
        'Mentorship program',
        'Free meals and transportation',
        'Access to Google facilities'
      ],
      saved: false,
    },
    {
      id: '2',
      title: 'Data Science Associate',
      company: 'Microsoft',
      type: 'full-time',
      location: 'Seattle, WA',
      remote: true,
      salaryRange: '$95,000 - $125,000/year',
      experience: 'Entry Level',
      postedBy: 'Michael Chen (Alumni)',
      postedDate: '2024-03-12',
      deadline: '2024-04-20',
      description: 'Work with large-scale data to drive insights and build machine learning models that enhance our products and services.',
      requirements: [
        'BS/MS in Data Science, Statistics, or related field',
        'Experience with Python, R, or SQL',
        'Knowledge of machine learning algorithms',
        'Strong analytical and problem-solving skills'
      ],
      benefits: [
        'Comprehensive health coverage',
        'Stock options',
        'Flexible work arrangements',
        'Professional development budget'
      ],
      saved: true,
    },
    {
      id: '3',
      title: 'Frontend Developer',
      company: 'Netflix',
      type: 'full-time',
      location: 'Los Angeles, CA',
      remote: true,
      salaryRange: '$85,000 - $115,000/year',
      experience: 'Mid Level',
      postedBy: 'Emily Rodriguez (Alumni)',
      postedDate: '2024-03-08',
      deadline: '2024-03-30',
      description: 'Build and maintain user interfaces for our streaming platform, reaching millions of users globally.',
      requirements: [
        '2+ years of experience with React/Vue/Angular',
        'Strong knowledge of JavaScript, HTML, CSS',
        'Experience with modern build tools',
        'Understanding of responsive design principles'
      ],
      benefits: [
        'Unlimited PTO policy',
        'Netflix content access',
        'Remote work stipend',
        'Annual learning budget'
      ],
      saved: false,
    },
    {
      id: '4',
      title: 'Product Management Intern',
      company: 'Apple',
      type: 'internship',
      location: 'Cupertino, CA',
      remote: false,
      salaryRange: '$7,000 - $9,000/month',
      experience: 'Entry Level',
      postedBy: 'Career Services',
      postedDate: '2024-03-14',
      deadline: '2024-04-25',
      description: 'Support product teams in developing innovative features and managing product lifecycle from conception to launch.',
      requirements: [
        'Pursuing MBA or equivalent experience',
        'Strong analytical and communication skills',
        'Interest in consumer technology products',
        'Previous internship or project management experience preferred'
      ],
      benefits: [
        'Employee discounts on Apple products',
        'Networking opportunities',
        'Mentorship from senior PMs',
        'Access to Apple facilities'
      ],
      saved: true,
    },
  ];

  const applications: Application[] = [
    {
      id: '1',
      jobId: '2',
      jobTitle: 'Data Science Associate',
      company: 'Microsoft',
      appliedDate: '2024-03-13',
      status: 'interview',
      nextStep: 'Technical interview scheduled for March 22',
    },
    {
      id: '2',
      jobId: '1',
      jobTitle: 'Software Engineering Intern',
      company: 'Google',
      appliedDate: '2024-03-11',
      status: 'reviewing',
    },
    {
      id: '3',
      jobId: '4',
      jobTitle: 'Product Management Intern',
      company: 'Apple',
      appliedDate: '2024-03-15',
      status: 'applied',
    },
  ];

  const companies = ['Google', 'Microsoft', 'Netflix', 'Apple', 'Amazon', 'Meta'];
  const locations = ['Mountain View, CA', 'Seattle, WA', 'Los Angeles, CA', 'Cupertino, CA', 'Austin, TX', 'New York, NY'];

  const filteredJobs = jobOpportunities.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === 'all' || job.location.includes(locationFilter);
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesCompany = companyFilter === 'all' || job.company === companyFilter;

    return matchesSearch && matchesLocation && matchesType && matchesCompany;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internship': return 'bg-blue-100 text-blue-800';
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-yellow-100 text-yellow-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleSaveJob = (jobId: string) => {
    // In a real app, this would update the backend
    console.log('Toggle save for job:', jobId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-2">Career Development Board</h1>
        <p className="text-muted-foreground">Discover internships, job opportunities, and track your applications.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Opportunities</p>
                <p className="text-2xl">247</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">My Applications</p>
                <p className="text-2xl text-purple-600">{applications.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Interview Invites</p>
                <p className="text-2xl text-green-600">1</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Saved Jobs</p>
                <p className="text-2xl text-orange-600">12</p>
              </div>
              <Star className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList>
          <TabsTrigger value="opportunities">Job Opportunities</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
          <TabsTrigger value="resources">Career Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs by title, company, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg mb-1">{job.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{job.company}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{job.location}</span>
                            {job.remote && <Badge variant="outline" className="text-xs ml-1">Remote</Badge>}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSaveJob(job.id)}
                      >
                        <BookmarkPlus className={`w-4 h-4 ${job.saved ? 'fill-current text-orange-500' : ''}`} />
                      </Button>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getTypeColor(job.type)}>
                        {job.type}
                      </Badge>
                      <Badge variant="outline">{job.experience}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{job.salaryRange}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Deadline: {job.deadline}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Apply Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Posted by {job.postedBy} • {job.postedDate}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Tracker</CardTitle>
              <CardDescription>Monitor the status of your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm">{app.jobTitle}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Building className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{app.company}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Applied {app.appliedDate}</span>
                          </div>
                        </div>
                        {app.nextStep && (
                          <p className="text-sm text-blue-600 mt-2">📅 {app.nextStep}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(app.status)}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {applications.length === 0 && (
                <div className="text-center p-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No applications yet</p>
                  <p className="text-sm text-muted-foreground">Start applying to jobs to track your progress here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Jobs</CardTitle>
              <CardDescription>Jobs you've bookmarked for later</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {jobOpportunities.filter(job => job.saved).map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                      <Badge className={getTypeColor(job.type)}>
                        {job.type}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Apply Now
                      </Button>
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume Builder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create and optimize your resume with our AI-powered builder
                </p>
                <Button className="w-full">
                  Build Resume
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Mock Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Practice with AI-powered mock interviews and get feedback
                </p>
                <Button className="w-full">
                  Start Practice
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Skill Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Evaluate your technical skills and get personalized recommendations
                </p>
                <Button className="w-full">
                  Take Assessment
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Career Guidance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get personalized career advice based on your interests and skills
                </p>
                <Button className="w-full">
                  Get Guidance
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Industry Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn about different industries and career paths from experts
                </p>
                <Button className="w-full">
                  Explore
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Interview Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access our comprehensive guide to acing technical and behavioral interviews
                </p>
                <Button className="w-full">
                  View Tips
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
