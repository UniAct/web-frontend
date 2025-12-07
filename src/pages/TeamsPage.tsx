import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '../components/ui/modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Users,
  Plus,
  Calendar,
  Target,
  Clock,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  User,
  Settings,
  MessageSquare
} from 'lucide-react';
import type { User as AppUser } from '../App';

interface TeamsPageProps {
  user: AppUser;
}

interface Team {
  id: string;
  name: string;
  course: string;
  members: TeamMember[];
  progress: number;
  deadline: string;
  status: 'active' | 'completed' | 'overdue';
  description: string;
  tasks: Task[];
}

interface TeamMember {
  id: string;
  name: string;
  role: 'leader' | 'member';
  avatar?: string;
}

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: string;
}

export function TeamsPage({ user }: TeamsPageProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    description: '',
    course: '',
    maxMembers: 4,
    deadline: '',
  });

  const teams: Team[] = [
    {
      id: '1',
      name: 'Mobile App Development',
      course: 'CS 401 - Software Engineering',
      members: [
        { id: '1', name: 'John Doe', role: 'leader' },
        { id: '2', name: 'Alice Johnson', role: 'member' },
        { id: '3', name: 'Bob Smith', role: 'member' },
        { id: '4', name: 'Carol Davis', role: 'member' },
      ],
      progress: 75,
      deadline: '2024-03-25',
      status: 'active',
      description: 'Develop a cross-platform mobile application for university events management.',
      tasks: [
        { id: '1', title: 'UI/UX Design', assignee: 'Alice Johnson', status: 'completed', dueDate: '2024-03-15' },
        { id: '2', title: 'Backend API', assignee: 'Bob Smith', status: 'in-progress', dueDate: '2024-03-20' },
        { id: '3', title: 'Frontend Development', assignee: 'John Doe', status: 'in-progress', dueDate: '2024-03-22' },
        { id: '4', title: 'Testing & QA', assignee: 'Carol Davis', status: 'todo', dueDate: '2024-03-24' },
      ]
    },
    {
      id: '2',
      name: 'AI Research Project',
      course: 'CS 501 - Artificial Intelligence',
      members: [
        { id: '5', name: 'Eve Brown', role: 'leader' },
        { id: '6', name: 'David Wilson', role: 'member' },
        { id: '7', name: 'Frank Miller', role: 'member' },
      ],
      progress: 45,
      deadline: '2024-04-10',
      status: 'active',
      description: 'Research and implement machine learning algorithms for natural language processing.',
      tasks: [
        { id: '5', title: 'Literature Review', assignee: 'Eve Brown', status: 'completed', dueDate: '2024-03-10' },
        { id: '6', title: 'Data Collection', assignee: 'David Wilson', status: 'in-progress', dueDate: '2024-03-18' },
        { id: '7', title: 'Algorithm Implementation', assignee: 'Frank Miller', status: 'todo', dueDate: '2024-03-25' },
      ]
    },
  ];

  const availableTeams = [
    {
      id: '3',
      name: 'Database Management System',
      course: 'CS 301 - Database Systems',
      currentMembers: 2,
      maxMembers: 4,
      deadline: '2024-04-15',
      description: 'Design and implement a distributed database system for e-commerce applications.',
    },
    {
      id: '4',
      name: 'Web Security Analysis',
      course: 'CS 451 - Cybersecurity',
      currentMembers: 1,
      maxMembers: 3,
      deadline: '2024-04-20',
      description: 'Analyze web application vulnerabilities and develop security testing tools.',
    },
  ];

  const courses = [
    'CS 401 - Software Engineering',
    'CS 501 - Artificial Intelligence',
    'CS 301 - Database Systems',
    'CS 451 - Cybersecurity',
  ];

  const handleCreateTeam = () => {
    console.log('Creating team:', newTeamData);
    setShowCreateDialog(false);
    setNewTeamData({
      name: '',
      description: '',
      course: '',
      maxMembers: 4,
      deadline: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStudentView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">My Project Teams</h1>
          <p className="text-muted-foreground">Collaborate with teammates and track project progress.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Join Team
        </Button>

        <Modal open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Available Teams</ModalTitle>
              <ModalDescription>
                Join an existing team or request to create a new one
              </ModalDescription>
            </ModalHeader>
            <div className="space-y-4">
              {availableTeams.map((team) => (
                <Card key={team.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm">{team.name}</h3>
                      <p className="text-xs text-muted-foreground">{team.course}</p>
                      <p className="text-xs text-muted-foreground mt-2">{team.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className="text-xs">{team.currentMembers}/{team.maxMembers} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">Due {team.deadline}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm">
                      Request to Join
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ModalContent>
        </Modal>
      </div>

      {/* My Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTeam(team.id)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription>{team.course}</CardDescription>
                </div>
                <Badge className={getStatusColor(team.status)}>
                  {team.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{team.progress}%</span>
                  </div>
                  <Progress value={team.progress} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 3).map((member, index) => (
                      <div key={member.id} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    ))}
                    {team.members.length > 3 && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-gray-600 text-xs">+{team.members.length - 3}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Due {team.deadline}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Details */}
      {selectedTeam && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Details</CardTitle>
                <CardDescription>
                  {teams.find(t => t.id === selectedTeam)?.name}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Files
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Team Members */}
              <div>
                <h3 className="text-sm mb-3">Team Members</h3>
                <div className="grid grid-cols-2 gap-3">
                  {teams.find(t => t.id === selectedTeam)?.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm">{member.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {member.role === 'leader' ? 'Team Leader' : 'Member'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="text-sm mb-3">Tasks</h3>
                <div className="space-y-2">
                  {teams.find(t => t.id === selectedTeam)?.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                        <div>
                          <p className="text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Assigned to {task.assignee} • Due {task.dueDate}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderFacultyView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">Team Management</h1>
          <p className="text-muted-foreground">Create and manage student project teams.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>

        <Modal open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Create New Project Team</ModalTitle>
              <ModalDescription>
                Set up a new project team with constraints and requirements
              </ModalDescription>
            </ModalHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm">Project Name</label>
                <Input
                  placeholder="Enter project name"
                  value={newTeamData.name}
                  onChange={(e) => setNewTeamData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm">Course</label>
                <Select value={newTeamData.course} onValueChange={(value) => setNewTeamData(prev => ({ ...prev, course: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm">Description</label>
                <Textarea
                  placeholder="Project description and requirements"
                  value={newTeamData.description}
                  onChange={(e) => setNewTeamData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Max Team Size</label>
                  <Select value={newTeamData.maxMembers.toString()} onValueChange={(value) => setNewTeamData(prev => ({ ...prev, maxMembers: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 members</SelectItem>
                      <SelectItem value="3">3 members</SelectItem>
                      <SelectItem value="4">4 members</SelectItem>
                      <SelectItem value="5">5 members</SelectItem>
                      <SelectItem value="6">6 members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm">Deadline</label>
                  <Input
                    type="date"
                    value={newTeamData.deadline}
                    onChange={(e) => setNewTeamData(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam}>
                  Create Team
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      </div>

      {/* Teams Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Teams</p>
                <p className="text-2xl">24</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Completed Projects</p>
                <p className="text-2xl text-green-600">12</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
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
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Teams List */}
      <Card>
        <CardHeader>
          <CardTitle>All Project Teams</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm">{team.name}</h3>
                    <Badge className={getStatusColor(team.status)}>
                      {team.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{team.course}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span className="text-xs">{team.members.length} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span className="text-xs">{team.progress}% complete</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">Due {team.deadline}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return user.role === 'faculty' ? renderFacultyView() : renderStudentView();
}
