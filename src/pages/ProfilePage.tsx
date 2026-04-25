import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Bell,
  Shield,
  Edit,
  Save,
  Camera,
  Settings,
  Lock,
  Globe,
  Smartphone,
  Eye,
  EyeOff,
  Star,
  Trophy
} from 'lucide-react';
import type { User as UserType } from '../App';

interface ProfilePageProps {
  user: UserType;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateEarned: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function ProfilePage({ user }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: '+1 (555) 123-4567',
    bio: 'Computer Science student passionate about artificial intelligence and software development. Active member of coding clubs and hackathons.',
    location: 'University Campus, CA',
    website: 'https://johndoe.dev',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    graduationYear: user.year || new Date().getFullYear() + 2,
    major: 'Computer Science',
    gpa: '3.8',
    skills: ['Python', 'JavaScript', 'React', 'Machine Learning', 'SQL', 'Git']
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    assignments: true,
    teamUpdates: true,
    events: false,
    newsletter: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showGrades: false,
    allowMessages: true
  });

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Perfect Attendance',
      description: 'Maintained 100% attendance for a full semester',
      icon: '🎯',
      dateEarned: '2024-01-15',
      rarity: 'rare'
    },
    {
      id: '2',
      title: 'Team Player',
      description: 'Successfully completed 5 team projects',
      icon: '🤝',
      dateEarned: '2024-02-20',
      rarity: 'common'
    },
    {
      id: '3',
      title: 'AI Pioneer',
      description: 'Scored in top 10% on AI course final project',
      icon: '🤖',
      dateEarned: '2024-03-05',
      rarity: 'epic'
    },
    {
      id: '4',
      title: 'Mentor',
      description: 'Helped 10+ students through peer tutoring',
      icon: '👨‍🏫',
      dateEarned: '2024-02-28',
      rarity: 'legendary'
    }
  ];

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving profile data:', profileData);
    setIsEditing(false);
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your profile information, preferences, and privacy settings.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="academic">Academic Info</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  {isEditing && (
                    <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                      <Camera className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <div>
                  <h3 className="text-lg">{profileData.name}</h3>
                  <p className="text-muted-foreground">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                  <p className="text-sm text-muted-foreground">{user.facultyName}</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm">Full Name</label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm">Email Address</label>
                  <Input
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm">Phone Number</label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm">Location</label>
                  <Input
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-sm">Bio</label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm">Website</label>
                  <Input
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="https://your-website.com"
                  />
                </div>
                <div>
                  <label className="text-sm">LinkedIn</label>
                  <Input
                    value={profileData.linkedin}
                    onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="text-sm">GitHub</label>
                  <Input
                    value={profileData.github}
                    onChange={(e) => setProfileData(prev => ({ ...prev, github: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="github.com/username"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="text-sm mb-2 block">Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profileData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => handleSkillRemove(skill)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <Input
                    placeholder="Add a skill and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSkillAdd((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Academic Information</CardTitle>
                  <CardDescription>Your academic details and progress</CardDescription>
                </div>
                <div className="flex gap-2">
                  {isEditingAcademic ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditingAcademic(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsEditingAcademic(false)}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => setIsEditingAcademic(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Academic Info
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm">Major</label>
                  <Select
                    value={profileData.major}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, major: value }))}
                    disabled={!isEditingAcademic}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm">Expected Graduation</label>
                  <Input
                    value={profileData.graduationYear}
                    type="number"
                    onChange={(e) => setProfileData(prev => ({ ...prev, graduationYear: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditingAcademic}
                  />
                </div>
                <div>
                  <label className="text-sm">Current GPA</label>
                  <Input
                    value={profileData.gpa}
                    onChange={(e) => setProfileData(prev => ({ ...prev, gpa: e.target.value }))}
                    disabled={!isEditingAcademic}
                  />
                </div>
                <div>
                  <label className="text-sm">Student ID</label>
                  <Input value="CS2021001" disabled />
                </div>
              </div>

              <div>
                <h3 className="text-sm mb-3">Current Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Data Structures & Algorithms', code: 'CS 301', grade: 'A-' },
                    { name: 'Database Management Systems', code: 'CS 201', grade: 'B+' },
                    { name: 'Artificial Intelligence', code: 'CS 501', grade: 'A' },
                    { name: 'Software Engineering', code: 'CS 401', grade: 'A-' }
                  ].map((course, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="text-sm">{course.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{course.code}</span>
                        <Badge variant="outline">{course.grade}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Achievements & Badges
              </CardTitle>
              <CardDescription>Your accomplishments and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-4 border-2 rounded-lg ${getRarityColor(achievement.rarity)}`}>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-sm">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {achievement.dateEarned}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm mb-2">Achievement Progress</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Study Streak (25 days needed)</span>
                    <span>18/25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive push notifications on your device</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Assignment Updates</p>
                    <p className="text-xs text-muted-foreground">New assignments and due date reminders</p>
                  </div>
                  <Switch
                    checked={notifications.assignments}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, assignments: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Team Updates</p>
                    <p className="text-xs text-muted-foreground">Project team messages and updates</p>
                  </div>
                  <Switch
                    checked={notifications.teamUpdates}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, teamUpdates: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Event Reminders</p>
                    <p className="text-xs text-muted-foreground">Upcoming events and activities</p>
                  </div>
                  <Switch
                    checked={notifications.events}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, events: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Newsletter</p>
                    <p className="text-xs text-muted-foreground">Weekly newsletter and updates</p>
                  </div>
                  <Switch
                    checked={notifications.newsletter}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newsletter: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control who can see your information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm">Profile Visibility</label>
                  <Select value={privacy.profileVisibility} onValueChange={(value) => setPrivacy(prev => ({ ...prev, profileVisibility: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can see</SelectItem>
                      <SelectItem value="university">University - Only university members</SelectItem>
                      <SelectItem value="private">Private - Only you</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Show Email Address</p>
                    <p className="text-xs text-muted-foreground">Allow others to see your email</p>
                  </div>
                  <Switch
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showEmail: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Show Phone Number</p>
                    <p className="text-xs text-muted-foreground">Allow others to see your phone</p>
                  </div>
                  <Switch
                    checked={privacy.showPhone}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showPhone: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Show Grades</p>
                    <p className="text-xs text-muted-foreground">Display your academic performance</p>
                  </div>
                  <Switch
                    checked={privacy.showGrades}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showGrades: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Allow Messages</p>
                    <p className="text-xs text-muted-foreground">Let others send you messages</p>
                  </div>
                  <Switch
                    checked={privacy.allowMessages}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowMessages: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm mb-2">Password</h4>
                  <p className="text-xs text-muted-foreground mb-3">Last updated 30 days ago</p>
                  <Button variant="outline" size="sm">
                    <Lock className="w-3 h-3 mr-2" />
                    Change Password
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm mb-2">Two-Factor Authentication</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Add an extra layer of security to your account
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-orange-600">Not Enabled</Badge>
                    <Button variant="outline" size="sm">
                      <Smartphone className="w-3 h-3 mr-2" />
                      Enable 2FA
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm mb-2">Active Sessions</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Monitor and manage your active sessions
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="text-xs">Current Session - Chrome on MacOS</p>
                        <p className="text-xs text-muted-foreground">192.168.1.1 • Active now</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Current</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm mb-2">Account Deletion</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Permanently delete your account and all associated data
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
