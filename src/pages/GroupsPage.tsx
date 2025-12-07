import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '../components/ui/modal';
import {
  Users,
  Plus,
  Hash,
  Lock,
  Unlock,
  Copy,
  MessageSquare,
  FileText,
  Upload,
  CheckSquare,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import type { User as AppUser } from '../App';

interface GroupsPageProps {
  user: AppUser;
}

interface StudyGroup {
  id: string;
  name: string;
  code: string;
  type: 'open' | 'closed';
  subject: string;
  members: GroupMember[];
  maxMembers: number;
  description: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

interface GroupMember {
  id: string;
  name: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

interface GroupTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdBy: string;
}

export function GroupsPage({ user }: GroupsPageProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [joinCode, setJoinCode] = useState('');
  const [activeTab, setActiveTab] = useState('my-groups');

  const [newGroupData, setNewGroupData] = useState({
    name: '',
    subject: '',
    description: '',
    type: 'open' as 'open' | 'closed',
    maxMembers: 10,
  });

  const myGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'Data Structures Study Group',
      code: 'DS2024A',
      type: 'closed',
      subject: 'CS 201 - Data Structures',
      members: [
        { id: '1', name: 'John Doe', role: 'admin', joinedAt: '2024-03-01' },
        { id: '2', name: 'Alice Johnson', role: 'member', joinedAt: '2024-03-02' },
        { id: '3', name: 'Bob Smith', role: 'member', joinedAt: '2024-03-03' },
        { id: '4', name: 'Carol Davis', role: 'member', joinedAt: '2024-03-04' },
      ],
      maxMembers: 8,
      description: 'Weekly study sessions for Data Structures assignments and exam preparation.',
      createdBy: 'John Doe',
      createdAt: '2024-03-01',
      isActive: true,
    },
    {
      id: '2',
      name: 'AI Research Discussion',
      code: 'AI2024B',
      type: 'open',
      subject: 'CS 501 - Artificial Intelligence',
      members: [
        { id: '5', name: 'Eve Brown', role: 'admin', joinedAt: '2024-02-15' },
        { id: '6', name: 'David Wilson', role: 'member', joinedAt: '2024-02-16' },
        { id: '7', name: 'Frank Miller', role: 'member', joinedAt: '2024-02-18' },
      ],
      maxMembers: 12,
      description: 'Discussing latest AI research papers and working on course projects together.',
      createdBy: 'Eve Brown',
      createdAt: '2024-02-15',
      isActive: true,
    },
  ];

  const availableGroups: StudyGroup[] = [
    {
      id: '3',
      name: 'Database Design Workshop',
      code: 'DB2024C',
      type: 'open',
      subject: 'CS 301 - Database Systems',
      members: [
        { id: '8', name: 'Sarah Wilson', role: 'admin', joinedAt: '2024-03-10' },
        { id: '9', name: 'Mike Johnson', role: 'member', joinedAt: '2024-03-11' },
      ],
      maxMembers: 6,
      description: 'Hands-on database design practice and assignment help.',
      createdBy: 'Sarah Wilson',
      createdAt: '2024-03-10',
      isActive: true,
    },
    {
      id: '4',
      name: 'Web Security Lab',
      code: 'WS2024D',
      type: 'open',
      subject: 'CS 451 - Cybersecurity',
      members: [
        { id: '10', name: 'Alex Turner', role: 'admin', joinedAt: '2024-03-08' },
      ],
      maxMembers: 8,
      description: 'Practical web security testing and vulnerability analysis.',
      createdBy: 'Alex Turner',
      createdAt: '2024-03-08',
      isActive: true,
    },
  ];

  const uncompletedGroups: StudyGroup[] = [
    {
      id: '5',
      name: 'Machine Learning Study Circle',
      code: 'ML2024E',
      type: 'open',
      subject: 'CS 502 - Machine Learning',
      members: [
        { id: '11', name: 'Lisa Chen', role: 'admin', joinedAt: '2024-03-12' },
        { id: '12', name: 'Tom Anderson', role: 'member', joinedAt: '2024-03-13' },
      ],
      maxMembers: 8,
      description: 'Weekly ML algorithm implementation and theory discussions.',
      createdBy: 'Lisa Chen',
      createdAt: '2024-03-12',
      isActive: true,
    },
  ];

  const groupTasks: GroupTask[] = [
    {
      id: '1',
      title: 'Review Chapter 5 - Binary Trees',
      description: 'Go through the chapter and prepare discussion points for next session',
      assignedTo: ['Alice Johnson', 'Bob Smith'],
      dueDate: '2024-03-20',
      status: 'in-progress',
      createdBy: 'John Doe',
    },
    {
      id: '2',
      title: 'Practice Problems Set 3',
      description: 'Complete the practice problems and share solutions',
      assignedTo: ['Carol Davis'],
      dueDate: '2024-03-18',
      status: 'pending',
      createdBy: 'John Doe',
    },
  ];

  const handleCreateGroup = () => {
    const newGroup: StudyGroup = {
      id: Date.now().toString(),
      name: newGroupData.name,
      code: generateGroupCode(),
      type: newGroupData.type,
      subject: newGroupData.subject,
      members: [{ id: user.id, name: user.name, role: 'admin', joinedAt: new Date().toISOString().split('T')[0] }],
      maxMembers: newGroupData.maxMembers,
      description: newGroupData.description,
      createdBy: user.name,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
    };

    console.log('Creating group:', newGroup);
    setShowCreateDialog(false);
    setNewGroupData({
      name: '',
      subject: '',
      description: '',
      type: 'open',
      maxMembers: 10,
    });
  };

  const generateGroupCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleJoinGroup = () => {
    console.log('Joining group with code:', joinCode);
    setShowJoinDialog(false);
    setJoinCode('');
  };

  const copyGroupCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">Study Groups & Rooms</h1>
          <p className="text-muted-foreground">Create study groups, join rooms, and collaborate with peers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowJoinDialog(true)}>
            <Hash className="w-4 h-4 mr-2" />
            Join with Code
          </Button>

          <Modal open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Join Study Group</ModalTitle>
                <ModalDescription>
                  Enter the group code to join an existing study group
                </ModalDescription>
              </ModalHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm">Group Code</label>
                  <Input
                    placeholder="Enter 6-character code (e.g., ABC123)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleJoinGroup} disabled={joinCode.length !== 6}>
                    Join Group
                  </Button>
                </div>
              </div>
            </ModalContent>
          </Modal>

          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>

          <Modal open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Create Study Group</ModalTitle>
                <ModalDescription>
                  Set up a new study group or room for collaboration
                </ModalDescription>
              </ModalHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm">Group Name</label>
                  <Input
                    placeholder="e.g., Data Structures Study Group"
                    value={newGroupData.name}
                    onChange={(e) => setNewGroupData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm">Subject/Course</label>
                  <Input
                    placeholder="e.g., CS 201 - Data Structures"
                    value={newGroupData.subject}
                    onChange={(e) => setNewGroupData(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm">Description</label>
                  <Textarea
                    placeholder="Describe the purpose of this study group..."
                    value={newGroupData.description}
                    onChange={(e) => setNewGroupData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Group Type</label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        variant={newGroupData.type === 'open' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewGroupData(prev => ({ ...prev, type: 'open' }))}
                      >
                        <Unlock className="w-3 h-3 mr-1" />
                        Open
                      </Button>
                      <Button
                        variant={newGroupData.type === 'closed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewGroupData(prev => ({ ...prev, type: 'closed' }))}
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Closed
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm">Max Members</label>
                    <Input
                      type="number"
                      min="2"
                      max="20"
                      value={newGroupData.maxMembers}
                      onChange={(e) => setNewGroupData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGroup}>
                    Create Group
                  </Button>
                </div>
              </div>
            </ModalContent>
          </Modal>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
          <TabsTrigger value="available">Available Groups</TabsTrigger>
          <TabsTrigger value="incomplete">
            Incomplete Groups
            <Badge className="ml-2 bg-orange-100 text-orange-800 text-xs">
              {uncompletedGroups.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => (
              <Card key={group.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedGroup(group.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>{group.subject}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      {group.type === 'open' ?
                        <Unlock className="w-4 h-4 text-green-600" /> :
                        <Lock className="w-4 h-4 text-orange-600" />
                      }
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{group.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{group.members.length}/{group.maxMembers}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyGroupCode(group.code);
                        }}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {group.code}
                      </Button>
                    </div>

                    <div className="flex -space-x-2">
                      {group.members.slice(0, 4).map((member, index) => (
                        <div key={member.id} className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      ))}
                      {group.members.length > 4 && (
                        <div className="w-7 h-7 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-gray-600 text-xs">+{group.members.length - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Group Details */}
          {selectedGroup && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Group Workspace</CardTitle>
                    <CardDescription>
                      {myGroups.find(g => g.id === selectedGroup)?.name}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Discussion
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Share Files
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tasks">
                  <TabsList>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tasks" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm">Group Tasks</h3>
                      <Button size="sm">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Task
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {groupTasks.map((task) => (
                        <div key={task.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm">{task.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span className="text-xs">{task.assignedTo.join(', ')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs">Due {task.dueDate}</span>
                                </div>
                              </div>
                            </div>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="members" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {myGroups.find(g => g.id === selectedGroup)?.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm">{member.name}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {member.role === 'admin' ? 'Admin' : 'Member'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Joined {member.joinedAt}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="files" className="space-y-4">
                    <div className="text-center p-8 border-2 border-dashed rounded-lg">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No files shared yet</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Upload className="w-3 h-3 mr-1" />
                        Upload File
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>{group.subject}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Unlock className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">Open</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{group.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{group.members.length}/{group.maxMembers} members</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created by {group.createdBy}
                      </p>
                    </div>

                    <Button className="w-full" size="sm">
                      Join Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="incomplete" className="space-y-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              These groups need more members to reach their target size.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {uncompletedGroups.map((group) => (
              <Card key={group.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>{group.subject}</CardDescription>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      Needs {group.maxMembers - group.members.length} more
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{group.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{group.members.length}/{group.maxMembers} members</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created {group.createdAt}
                      </p>
                    </div>

                    <Button className="w-full" variant="outline" size="sm">
                      Request to Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
