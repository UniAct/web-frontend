import { useState, useMemo, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  BookOpen, Users, FileText, CheckSquare, Video, StickyNote,
  Search, Plus, Download, Upload, Pin, Heart, MessageCircle,
  MoreHorizontal, Link, Copy, ExternalLink, Clock, AlertTriangle,
  ChevronRight, ChevronDown, Paperclip, Send, Calendar, Star,
  Folder, File, FolderOpen, Check, X, Bell, Activity,
  GraduationCap, BookMarked, Layers, Zap, TrendingUp, Eye,
  Edit3, Trash2, ThumbsUp, Smile, Image, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../App';

interface GroupsPageProps { user: User; }

// ── Types ─────────────────────────────────────────────────────────────────────

interface CourseMember {
  id: string;
  name: string;
  role: 'instructor' | 'ta' | 'student';
  email: string;
  status: 'online' | 'away' | 'offline';
  avatar?: string;
  joinedAt: string;
}

interface Post {
  id: string;
  author: string;
  authorRole: 'instructor' | 'ta' | 'student';
  content: string;
  timestamp: string;
  isPinned: boolean;
  isAnnouncement: boolean;
  reactions: { emoji: string; count: number; reacted: boolean }[];
  replies: Reply[];
  attachments: string[];
}

interface Reply {
  id: string;
  author: string;
  authorRole: 'instructor' | 'ta' | 'student';
  content: string;
  timestamp: string;
}

interface DocFile {
  id: string;
  name: string;
  type: 'pdf' | 'pptx' | 'docx' | 'zip' | 'xlsx' | 'folder';
  size?: string;
  category: 'Lecture Slides' | 'Assignments' | 'Labs' | 'Resources' | 'Exams';
  uploadedBy: string;
  uploadedAt: string;
  downloads: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'todo' | 'in-progress' | 'submitted' | 'graded';
  priority: 'high' | 'medium' | 'low';
  points: number;
  submissions: number;
  totalStudents: number;
  gradingStatus: 'not-started' | 'in-progress' | 'completed';
}

interface Session {
  id: string;
  title: string;
  type: 'lecture' | 'lab' | 'office-hours' | 'review';
  date: string;
  time: string;
  duration: string;
  platform: 'google-meet' | 'zoom' | 'teams' | 'other';
  link: string;
  description: string;
  isRecurring: boolean;
}

interface Note {
  id: string;
  title: string;
  content: string;
  author: string;
  updatedAt: string;
  isPinned: boolean;
  tags: string[];
}

interface Workspace {
  id: string;
  courseCode: string;
  courseName: string;
  program: string;
  faculty: string;
  level: string;
  semester: string;
  color: string;
  unreadCount: number;
  onlineCount: number;
  totalMembers: number;
  lastActivity: string;
  members: CourseMember[];
  posts: Post[];
  documents: DocFile[];
  tasks: Task[];
  sessions: Session[];
  notes: Note[];
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'ws1',
    courseCode: 'CS-401',
    courseName: 'Operating Systems',
    program: 'Computer Science',
    faculty: 'Faculty of Computing & IT',
    level: 'Level 4',
    semester: 'Spring 2025-2026',
    color: '#3b82f6',
    unreadCount: 5,
    onlineCount: 12,
    totalMembers: 48,
    lastActivity: '2 min ago',
    members: [
      { id: 'm1', name: 'Dr. Sarah Wilson', role: 'instructor', email: 's.wilson@uni.edu', status: 'online', joinedAt: '2025-09-01' },
      { id: 'm2', name: 'Ahmad Al-Rashidi', role: 'ta', email: 'a.rashidi@uni.edu', status: 'online', joinedAt: '2025-09-01' },
      { id: 'm3', name: 'Fatima Al-Zahra', role: 'student', email: 'f.zahra@uni.edu', status: 'online', joinedAt: '2025-09-02' },
      { id: 'm4', name: 'Omar Hassan', role: 'student', email: 'o.hassan@uni.edu', status: 'away', joinedAt: '2025-09-02' },
      { id: 'm5', name: 'Nour Al-Din', role: 'student', email: 'n.aldin@uni.edu', status: 'offline', joinedAt: '2025-09-03' },
      { id: 'm6', name: 'Salma Ibrahim', role: 'student', email: 's.ibrahim@uni.edu', status: 'online', joinedAt: '2025-09-03' },
      { id: 'm7', name: 'Khalid Mansour', role: 'student', email: 'k.mansour@uni.edu', status: 'offline', joinedAt: '2025-09-04' },
      { id: 'm8', name: 'Rania Youssef', role: 'student', email: 'r.youssef@uni.edu', status: 'online', joinedAt: '2025-09-04' },
    ],
    posts: [
      {
        id: 'p1', author: 'Dr. Sarah Wilson', authorRole: 'instructor',
        content: '📢 **Important Announcement**: The midterm exam will be held on **May 28th, 2026** in Hall A-101. The exam covers chapters 1–6. Please review the process scheduling and memory management sections thoroughly. Office hours this week are extended — Mon & Wed 2–4 PM.',
        timestamp: '2026-05-17T09:00:00', isPinned: true, isAnnouncement: true,
        reactions: [
          { emoji: '👍', count: 18, reacted: false },
          { emoji: '📝', count: 7, reacted: true },
          { emoji: '🙏', count: 4, reacted: false },
        ],
        replies: [
          { id: 'r1', author: 'Fatima Al-Zahra', authorRole: 'student', content: 'Thank you Dr. Sarah! Will the exam include virtual memory as well?', timestamp: '2026-05-17T09:45:00' },
          { id: 'r2', author: 'Dr. Sarah Wilson', authorRole: 'instructor', content: 'Yes, virtual memory is included. Focus on paging and page replacement algorithms.', timestamp: '2026-05-17T10:15:00' },
        ],
        attachments: ['Midterm_Study_Guide.pdf'],
      },
      {
        id: 'p2', author: 'Ahmad Al-Rashidi', authorRole: 'ta',
        content: 'Lab 5 solution has been uploaded to the Documents section under **Labs**. Please review it before the next lab session. If you have questions, feel free to ask here or during office hours.',
        timestamp: '2026-05-16T14:30:00', isPinned: false, isAnnouncement: false,
        reactions: [
          { emoji: '👍', count: 23, reacted: true },
          { emoji: '❤️', count: 5, reacted: false },
        ],
        replies: [],
        attachments: [],
      },
      {
        id: 'p3', author: 'Omar Hassan', authorRole: 'student',
        content: 'Can anyone explain the difference between deadlock prevention and deadlock avoidance? I keep confusing the two.',
        timestamp: '2026-05-15T19:00:00', isPinned: false, isAnnouncement: false,
        reactions: [{ emoji: '👍', count: 8, reacted: false }],
        replies: [
          { id: 'r3', author: 'Fatima Al-Zahra', authorRole: 'student', content: 'Deadlock prevention removes one of the 4 conditions. Avoidance uses algorithms like Banker\'s to avoid unsafe states.', timestamp: '2026-05-15T19:30:00' },
          { id: 'r4', author: 'Ahmad Al-Rashidi', authorRole: 'ta', content: 'Great answer, Fatima! Also check lecture slides 9 for the comparison diagram.', timestamp: '2026-05-15T20:00:00' },
        ],
        attachments: [],
      },
    ],
    documents: [
      { id: 'd1', name: 'Lecture 01 - Introduction to OS.pdf', type: 'pdf', size: '3.2 MB', category: 'Lecture Slides', uploadedBy: 'Dr. Sarah Wilson', uploadedAt: '2026-02-01', downloads: 44 },
      { id: 'd2', name: 'Lecture 02 - Process Management.pptx', type: 'pptx', size: '5.8 MB', category: 'Lecture Slides', uploadedBy: 'Dr. Sarah Wilson', uploadedAt: '2026-02-08', downloads: 42 },
      { id: 'd3', name: 'Lecture 09 - Deadlocks.pdf', type: 'pdf', size: '2.1 MB', category: 'Lecture Slides', uploadedBy: 'Dr. Sarah Wilson', uploadedAt: '2026-04-10', downloads: 38 },
      { id: 'd4', name: 'Assignment 1 - Shell Programming.pdf', type: 'pdf', size: '0.8 MB', category: 'Assignments', uploadedBy: 'Dr. Sarah Wilson', uploadedAt: '2026-02-15', downloads: 46 },
      { id: 'd5', name: 'Assignment 2 - Process Scheduling.docx', type: 'docx', size: '0.6 MB', category: 'Assignments', uploadedBy: 'Dr. Sarah Wilson', uploadedAt: '2026-03-05', downloads: 44 },
      { id: 'd6', name: 'Lab 05 - Memory Management Solution.pdf', type: 'pdf', size: '1.4 MB', category: 'Labs', uploadedBy: 'Ahmad Al-Rashidi', uploadedAt: '2026-05-16', downloads: 31 },
      { id: 'd7', name: 'Lab Manual Spring 2026.pdf', type: 'pdf', size: '4.2 MB', category: 'Labs', uploadedBy: 'Ahmad Al-Rashidi', uploadedAt: '2026-02-01', downloads: 46 },
      { id: 'd8', name: 'Midterm Study Guide.pdf', type: 'pdf', size: '1.1 MB', category: 'Resources', uploadedBy: 'Dr. Sarah Wilson', uploadedAt: '2026-05-17', downloads: 46 },
      { id: 'd9', name: 'Previous Exam 2024.pdf', type: 'pdf', size: '0.9 MB', category: 'Exams', uploadedBy: 'Dr. Sarah Wilson', uploadedAt: '2026-05-10', downloads: 46 },
    ],
    tasks: [
      { id: 't1', title: 'Assignment 3 — Virtual Memory', description: 'Implement a page replacement algorithm (LRU or FIFO) in C/C++ and benchmark performance.', dueDate: '2026-05-25', status: 'in-progress', priority: 'high', points: 20, submissions: 28, totalStudents: 46, gradingStatus: 'not-started' },
      { id: 't2', title: 'Assignment 2 — Process Scheduling', description: 'Implement Round Robin and FCFS schedulers and compare average turnaround time.', dueDate: '2026-04-20', status: 'graded', priority: 'medium', points: 15, submissions: 46, totalStudents: 46, gradingStatus: 'completed' },
      { id: 't3', title: 'Lab Report 5 — Memory Management', description: 'Submit your lab report for Lab 5 following the provided template.', dueDate: '2026-05-20', status: 'submitted', priority: 'medium', points: 10, submissions: 35, totalStudents: 46, gradingStatus: 'in-progress' },
      { id: 't4', title: 'Final Project — OS Component Design', description: 'Design and implement a mini OS component (shell, scheduler, or file system).', dueDate: '2026-06-10', status: 'todo', priority: 'high', points: 30, submissions: 0, totalStudents: 46, gradingStatus: 'not-started' },
    ],
    sessions: [
      { id: 's1', title: 'Midterm Review Session', type: 'review', date: '2026-05-22', time: '5:00 PM', duration: '2 hours', platform: 'google-meet', link: 'https://meet.google.com/abc-defg-hij', description: 'Comprehensive review of all midterm topics. Questions and answers session.', isRecurring: false },
      { id: 's2', title: 'Weekly Office Hours', type: 'office-hours', date: '2026-05-19', time: '2:00 PM', duration: '1 hour', platform: 'zoom', link: 'https://zoom.us/j/123456789', description: 'Open office hours for any questions or assistance.', isRecurring: true },
      { id: 's3', title: 'Lab 6 — File Systems', type: 'lab', date: '2026-05-21', time: '9:00 AM', duration: '2 hours', platform: 'teams', link: 'https://teams.microsoft.com/l/meetup', description: 'Hands-on lab session covering file system implementation.', isRecurring: false },
    ],
    notes: [
      { id: 'n1', title: 'Process Scheduling Summary', content: '## Key Algorithms\n\n**FCFS** — Simple, non-preemptive. Convoy effect issue.\n\n**Round Robin** — Time quantum based. Good response time.\n\n**SJF** — Optimal average waiting time but requires knowing burst times.\n\n**Priority** — Can lead to starvation; solved with aging.', author: 'Ahmad Al-Rashidi', updatedAt: '2026-05-10', isPinned: true, tags: ['scheduling', 'cpu', 'midterm'] },
      { id: 'n2', title: 'Deadlock Conditions & Solutions', content: '## 4 Necessary Conditions\n\n1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait\n\n**Prevention**: Eliminate one condition.\n**Avoidance**: Banker\'s Algorithm.\n**Detection & Recovery**: Allow then detect + recover.', author: 'Dr. Sarah Wilson', updatedAt: '2026-05-12', isPinned: false, tags: ['deadlock', 'concurrency', 'midterm'] },
    ],
  },
  {
    id: 'ws2',
    courseCode: 'SEC-301',
    courseName: 'Cryptography',
    program: 'Cybersecurity',
    faculty: 'Faculty of Computing & IT',
    level: 'Level 3',
    semester: 'Spring 2025-2026',
    color: '#8b5cf6',
    unreadCount: 2,
    onlineCount: 6,
    totalMembers: 38,
    lastActivity: '1 hour ago',
    members: [
      { id: 'ms1', name: 'Prof. Michael Johnson', role: 'instructor', email: 'm.johnson@uni.edu', status: 'away', joinedAt: '2025-09-01' },
      { id: 'ms2', name: 'Tarek Mahmoud', role: 'ta', email: 't.mahmoud@uni.edu', status: 'online', joinedAt: '2025-09-01' },
      { id: 'ms3', name: 'Layla Al-Ansari', role: 'student', email: 'l.ansari@uni.edu', status: 'online', joinedAt: '2025-09-02' },
    ],
    posts: [
      {
        id: 'cp1', author: 'Prof. Michael Johnson', authorRole: 'instructor',
        content: '🔐 **RSA Implementation Assignment** has been posted. You need to implement RSA key generation, encryption, and decryption. Use Python or C++. Due date: **May 30th**. Starter code is in the Assignments folder.',
        timestamp: '2026-05-16T11:00:00', isPinned: true, isAnnouncement: true,
        reactions: [{ emoji: '👍', count: 25, reacted: false }],
        replies: [],
        attachments: ['RSA_Starter_Code.zip'],
      },
    ],
    documents: [
      { id: 'cd1', name: 'Lecture 10 - RSA Algorithm.pdf', type: 'pdf', size: '2.8 MB', category: 'Lecture Slides', uploadedBy: 'Prof. Michael Johnson', uploadedAt: '2026-04-20', downloads: 36 },
      { id: 'cd2', name: 'RSA Assignment Starter Code.zip', type: 'zip', size: '1.2 MB', category: 'Assignments', uploadedBy: 'Prof. Michael Johnson', uploadedAt: '2026-05-16', downloads: 30 },
    ],
    tasks: [
      { id: 'ct1', title: 'RSA Implementation', description: 'Implement RSA key gen, encryption, and decryption.', dueDate: '2026-05-30', status: 'todo', priority: 'high', points: 25, submissions: 0, totalStudents: 36, gradingStatus: 'not-started' },
    ],
    sessions: [
      { id: 'cs1', title: 'Cryptography Office Hours', type: 'office-hours', date: '2026-05-20', time: '3:00 PM', duration: '1 hour', platform: 'zoom', link: 'https://zoom.us/j/987654321', description: 'Q&A for RSA assignment and exam prep.', isRecurring: false },
    ],
    notes: [],
  },
  {
    id: 'ws3',
    courseCode: 'MATH-301',
    courseName: 'Numerical Computations',
    program: 'Computer Science',
    faculty: 'Faculty of Computing & IT',
    level: 'Level 3',
    semester: 'Spring 2025-2026',
    color: '#10b981',
    unreadCount: 0,
    onlineCount: 3,
    totalMembers: 52,
    lastActivity: '3 hours ago',
    members: [
      { id: 'mm1', name: 'Dr. Elena Rodriguez', role: 'instructor', email: 'e.rodriguez@uni.edu', status: 'offline', joinedAt: '2025-09-01' },
    ],
    posts: [],
    documents: [
      { id: 'md1', name: 'Lecture Notes - Numerical Methods.pdf', type: 'pdf', size: '4.1 MB', category: 'Lecture Slides', uploadedBy: 'Dr. Elena Rodriguez', uploadedAt: '2026-02-10', downloads: 50 },
    ],
    tasks: [],
    sessions: [],
    notes: [],
  },
];

// ── Helper components ─────────────────────────────────────────────────────────

function Avatar({ name, role, size = 'sm', status }: { name: string; role?: string; size?: 'xs' | 'sm' | 'md' | 'lg'; status?: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const roleColor = role === 'instructor' ? 'from-blue-500 to-indigo-600'
    : role === 'ta' ? 'from-violet-500 to-purple-600'
      : 'from-slate-400 to-slate-500';
  const sizeClass = size === 'xs' ? 'w-5 h-5 text-[8px]' : size === 'sm' ? 'w-7 h-7 text-[10px]' : size === 'md' ? 'w-8 h-8 text-[11px]' : 'w-10 h-10 text-sm';
  const statusColor = status === 'online' ? 'bg-emerald-400' : status === 'away' ? 'bg-amber-400' : 'bg-slate-300';
  const borderSize = size === 'xs' || size === 'sm' ? 'border-[1.5px]' : 'border-2';
  return (
    <div className="relative inline-flex shrink-0">
      <div className={`${sizeClass} rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center font-bold text-white shadow-sm ring-1 ring-black/5`}>
        {initials}
      </div>
      {status && (
        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${borderSize} border-white ${statusColor}`} />
      )}
    </div>
  );
}

function FileIcon({ type }: { type: DocFile['type'] }) {
  const config: Record<string, { color: string; label: string }> = {
    pdf: { color: 'text-red-500 bg-red-50 border-red-100', label: 'PDF' },
    pptx: { color: 'text-orange-500 bg-orange-50 border-orange-100', label: 'PPT' },
    docx: { color: 'text-blue-500 bg-blue-50 border-blue-100', label: 'DOC' },
    zip: { color: 'text-yellow-600 bg-yellow-50 border-yellow-100', label: 'ZIP' },
    xlsx: { color: 'text-green-600 bg-green-50 border-green-100', label: 'XLS' },
    folder: { color: 'text-amber-500 bg-amber-50 border-amber-100', label: 'DIR' },
  };
  const { color, label } = config[type] ?? { color: 'text-slate-500 bg-slate-50 border-slate-100', label: 'FILE' };
  return (
    <div className={`w-8 h-8 rounded-md ${color} border flex items-center justify-center shrink-0 shadow-sm`}>
      <span className="text-[8px] font-bold leading-none">{label}</span>
    </div>
  );
}

function timeAgo(ts: string) {
  const d = new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function platformIcon(platform: Session['platform']) {
  const icons: Record<string, string> = {
    'google-meet': '🟢', zoom: '🔵', teams: '🟣', other: '🔗',
  };
  return icons[platform] ?? '🔗';
}

function platformLabel(platform: Session['platform']) {
  return { 'google-meet': 'Google Meet', zoom: 'Zoom', teams: 'MS Teams', other: 'External Link' }[platform] ?? platform;
}

const STATUS_CONFIG = {
  todo: { label: 'To Do', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  'in-progress': { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  submitted: { label: 'Submitted', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  graded: { label: 'Graded', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const PRIORITY_CONFIG = {
  high: { label: 'High', className: 'bg-red-50 text-red-600 border-red-200' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-600 border-amber-200' },
  low: { label: 'Low', className: 'bg-slate-50 text-slate-500 border-slate-200' },
};

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export function GroupsPage({ user }: GroupsPageProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_WORKSPACES);
  const [activeWsId, setActiveWsId] = useState<string>(MOCK_WORKSPACES[0].id);
  const [activeTab, setActiveTab] = useState('posts');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Post composer state
  const [postContent, setPostContent] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Document state
  const [docCategory, setDocCategory] = useState<string>('All');
  const [docSearch, setDocSearch] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', category: 'Lecture Slides' as DocFile['category'], file: '' });

  // Task state
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium' as Task['priority'], points: 10 });
  const [taskFilter, setTaskFilter] = useState<string>('all');

  // Session state
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [sessionForm, setSessionForm] = useState({ title: '', type: 'lecture' as Session['type'], date: '', time: '', duration: '1 hour', platform: 'zoom' as Session['platform'], link: '', description: '' });

  // Members state
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState<string>('all');

  // Notes state
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', tags: '' });

  const ws = workspaces.find(w => w.id === activeWsId)!;

  // ── Sidebar workspaces filter ─────────────────────────────────────────────

  const filteredWorkspaces = useMemo(() =>
    workspaces.filter(w =>
      !sidebarSearch ||
      w.courseName.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
      w.courseCode.toLowerCase().includes(sidebarSearch.toLowerCase())
    ),
    [workspaces, sidebarSearch]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectWorkspace = (id: string) => {
    setActiveWsId(id);
    setActiveTab('posts');
    setWorkspaces(prev => prev.map(w =>
      w.id === id ? { ...w, unreadCount: 0 } : w
    ));
  };

  const handlePostSubmit = () => {
    if (!postContent.trim()) return;
    const newPost: Post = {
      id: `p-${Date.now()}`, author: user.name, authorRole: 'instructor',
      content: postContent, timestamp: new Date().toISOString(),
      isPinned: false, isAnnouncement,
      reactions: [{ emoji: '👍', count: 0, reacted: false }],
      replies: [], attachments: [],
    };
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWsId ? { ...w, posts: [newPost, ...w.posts] } : w
    ));
    setPostContent('');
    setIsAnnouncement(false);
    toast.success('Post published');
  };

  const handleReply = (postId: string) => {
    if (!replyContent.trim()) return;
    const reply: Reply = {
      id: `r-${Date.now()}`, author: user.name, authorRole: 'instructor',
      content: replyContent, timestamp: new Date().toISOString(),
    };
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWsId ? {
        ...w, posts: w.posts.map(p =>
          p.id === postId ? { ...p, replies: [...p.replies, reply] } : p
        )
      } : w
    ));
    setReplyContent('');
    setReplyingTo(null);
  };

  const handleReact = (postId: string, emoji: string) => {
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWsId ? {
        ...w, posts: w.posts.map(p =>
          p.id === postId ? {
            ...p, reactions: p.reactions.map(r =>
              r.emoji === emoji
                ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
                : r
            )
          } : p
        )
      } : w
    ));
  };

  const handlePinPost = (postId: string) => {
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWsId ? {
        ...w, posts: w.posts.map(p =>
          p.id === postId ? { ...p, isPinned: !p.isPinned } : p
        )
      } : w
    ));
  };

  const handleDeletePost = (postId: string) => {
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWsId ? { ...w, posts: w.posts.filter(p => p.id !== postId) } : w
    ));
    toast.success('Post deleted');
  };

  const handleUploadDoc = () => {
    if (!uploadForm.name.trim()) { toast.error('Please enter a file name'); return; }
    const newDoc: DocFile = {
      id: `d-${Date.now()}`, name: uploadForm.name,
      type: 'pdf', size: '—', category: uploadForm.category,
      uploadedBy: user.name, uploadedAt: new Date().toISOString().split('T')[0], downloads: 0,
    };
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWsId ? { ...w, documents: [newDoc, ...w.documents] } : w
    ));
    setShowUploadDialog(false);
    setUploadForm({ name: '', category: 'Lecture Slides', file: '' });
    toast.success('Document uploaded');
  };

  const handleCreateTask = () => {
    if (!taskForm.title.trim() || !taskForm.dueDate) { toast.error('Please fill in title and due date'); return; }
    const newTask: Task = {
      id: `t-${Date.now()}`, title: taskForm.title, description: taskForm.description,
      dueDate: taskForm.dueDate, status: 'todo', priority: taskForm.priority,
      points: taskForm.points, submissions: 0, totalStudents: ws.members.filter(m => m.role === 'student').length,
      gradingStatus: 'not-started',
    };
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWsId ? { ...w, tasks: [newTask, ...w.tasks] } : w
    ));
    setShowTaskDialog(false);
    setTaskForm({ title: '', description: '', dueDate: '', priority: 'medium', points: 10 });
    toast.success('Task/Assignment created');
  };

  const handleCreateSession = () => {
    if (!sessionForm.title.trim() || !sessionForm.date || !sessionForm.link) {
      toast.error('Please fill in title, date, and meeting link'); return;
    }
    const newSession: Session = {
      id: `s-${Date.now()}`, ...sessionForm, isRecurring: false,
    };
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWsId ? { ...w, sessions: [newSession, ...w.sessions] } : w
    ));
    setShowSessionDialog(false);
    setSessionForm({ title: '', type: 'lecture', date: '', time: '', duration: '1 hour', platform: 'zoom', link: '', description: '' });
    toast.success('Session scheduled');
  };

  const handleSaveNote = () => {
    if (!noteForm.title.trim()) { toast.error('Please enter a note title'); return; }
    if (editingNote) {
      setWorkspaces(prev => prev.map(w =>
        w.id === activeWsId ? {
          ...w, notes: w.notes.map(n =>
            n.id === editingNote.id ? { ...n, title: noteForm.title, content: noteForm.content, tags: noteForm.tags.split(',').map(t => t.trim()).filter(Boolean), updatedAt: new Date().toISOString().split('T')[0] } : n
          )
        } : w
      ));
      toast.success('Note updated');
    } else {
      const note: Note = {
        id: `n-${Date.now()}`, title: noteForm.title, content: noteForm.content,
        author: user.name, updatedAt: new Date().toISOString().split('T')[0],
        isPinned: false, tags: noteForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      setWorkspaces(prev => prev.map(w =>
        w.id === activeWsId ? { ...w, notes: [note, ...w.notes] } : w
      ));
      toast.success('Note saved');
    }
    setShowNoteDialog(false);
    setEditingNote(null);
    setNoteForm({ title: '', content: '', tags: '' });
  };

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteForm({ title: note.title, content: note.content, tags: note.tags.join(', ') });
    setShowNoteDialog(true);
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const filteredDocs = useMemo(() => {
    const cats = ['Lecture Slides', 'Assignments', 'Labs', 'Resources', 'Exams'] as const;
    return cats.reduce((acc, cat) => {
      const docs = ws.documents.filter(d =>
        (docCategory === 'All' || d.category === docCategory) &&
        (!docSearch || d.name.toLowerCase().includes(docSearch.toLowerCase()))
        && d.category === cat
      );
      if (docs.length > 0 || docCategory === cat || docCategory === 'All') acc[cat] = docs;
      return acc;
    }, {} as Record<string, DocFile[]>);
  }, [ws.documents, docCategory, docSearch]);

  const filteredTasks = useMemo(() =>
    ws.tasks.filter(t => taskFilter === 'all' || t.status === taskFilter),
    [ws.tasks, taskFilter]
  );

  const filteredMembers = useMemo(() =>
    ws.members.filter(m =>
      (!memberSearch || m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.email.toLowerCase().includes(memberSearch.toLowerCase())) &&
      (memberFilter === 'all' || m.role === memberFilter)
    ),
    [ws.members, memberSearch, memberFilter]
  );

  const sortedPosts = useMemo(() => [
    ...ws.posts.filter(p => p.isPinned),
    ...ws.posts.filter(p => !p.isPinned),
  ], [ws.posts]);

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date() && dueDate;

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-lg border border-slate-200/80 shadow-md bg-white">

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <div className={`${sidebarCollapsed ? 'w-12' : 'w-60'} shrink-0 bg-slate-50/50 border-r border-slate-200/70 flex flex-col transition-all duration-200`}>

        {/* Sidebar header */}
        <div className="px-2.5 py-2 border-b border-slate-200/70 flex items-center gap-1.5">
          {!sidebarCollapsed && (
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input
                className="w-full pl-7 pr-2 py-1.5 text-[11px] rounded-md bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-300 transition-shadow shadow-sm"
                placeholder="Search workspaces..."
                value={sidebarSearch}
                onChange={e => setSidebarSearch(e.target.value)}
              />
            </div>
          )}
          <button
            className="w-6 h-6 rounded-md hover:bg-slate-200/60 flex items-center justify-center text-slate-500 transition-colors shrink-0"
            onClick={() => setSidebarCollapsed(v => !v)}
          >
            {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Workspace list */}
        <ScrollArea className="flex-1">
          <div className="p-1.5 space-y-0.5">
            {!sidebarCollapsed && (
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider px-2 pt-1 pb-1">Course Workspaces</p>
            )}
            {filteredWorkspaces.map(w => (
              <button
                key={w.id}
                onClick={() => handleSelectWorkspace(w.id)}
                className={`w-full text-left rounded-md transition-all group ${activeWsId === w.id
                  ? 'bg-white shadow-sm border border-slate-200'
                  : 'hover:bg-white/70 border border-transparent'
                  } ${sidebarCollapsed ? 'p-1.5 flex items-center justify-center' : 'p-2'}`}
              >
                {sidebarCollapsed ? (
                  <div className="relative">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold shadow-sm" style={{ background: w.color }}>
                      {w.courseCode.split('-')[0].slice(0, 2)}
                    </div>
                    {w.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">{w.unreadCount}</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm" style={{ background: w.color }}>
                      {w.courseCode.split('-')[0].slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-semibold text-slate-800 truncate">{w.courseCode}</span>
                        {w.unreadCount > 0 && (
                          <span className="shrink-0 px-1 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-bold leading-none">{w.unreadCount}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate leading-snug mt-0.5">{w.courseName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] text-slate-400">{w.totalMembers} members</span>
                        <span className="text-[9px] text-slate-300">·</span>
                        <span className="text-[9px] text-slate-400">{w.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Stats footer */}
        {!sidebarCollapsed && (
          <div className="border-t border-slate-200/70 p-2">
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Workspaces', value: workspaces.length },
                { label: 'Total Members', value: workspaces.reduce((a, w) => a + w.totalMembers, 0) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-md p-1.5 text-center border border-slate-100 shadow-sm">
                  <div className="text-sm font-bold text-slate-800 leading-none">{value}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN WORKSPACE AREA ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Workspace header */}
        <div className="px-4 py-2.5 border-b border-slate-200/70 bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[11px] font-bold shadow-sm shrink-0" style={{ background: ws.color }}>
              {ws.courseCode.split('-')[0].slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-[13px] font-semibold text-slate-900 leading-none">{ws.courseCode} — {ws.courseName}</h2>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-medium leading-none">{ws.semester}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 leading-none">
                <span>{ws.program}</span>
                <span>·</span>
                <span>{ws.level}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block" />
                  {ws.onlineCount} online
                </span>
                <span>·</span>
                <span>{ws.totalMembers} members</span>
              </div>
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="hidden lg:flex items-center gap-2 text-xs shrink-0">
            {[
              { icon: <FileText className="w-3 h-3" />, label: `${ws.documents.length} docs` },
              { icon: <CheckSquare className="w-3 h-3" />, label: `${ws.tasks.filter(t => t.status !== 'graded').length} active tasks` },
              { icon: <Calendar className="w-3 h-3" />, label: `${ws.sessions.length} sessions` },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 shadow-sm text-[10px]">
                {icon}<span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 border-b border-slate-200/70 bg-white shrink-0">
            <TabsList className="h-9 bg-transparent p-0 gap-0.5">
              {[
                { value: 'posts', label: 'Posts', icon: <MessageCircle className="w-3 h-3" />, count: ws.posts.length },
                { value: 'documents', label: 'Documents', icon: <FileText className="w-3 h-3" />, count: ws.documents.length },
                { value: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-3 h-3" />, count: ws.tasks.filter(t => t.status !== 'graded').length },
                { value: 'members', label: 'Members', icon: <Users className="w-3 h-3" />, count: ws.totalMembers },
                { value: 'sessions', label: 'Sessions', icon: <Video className="w-3 h-3" />, count: ws.sessions.length },
                { value: 'notes', label: 'Notes', icon: <StickyNote className="w-3 h-3" />, count: ws.notes.length },
              ].map(({ value, label, icon, count }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="h-9 px-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/30 data-[state=active]:shadow-none text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all gap-1.5 text-[11px] font-medium"
                >
                  {icon}{label}
                  {count > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-slate-100 data-[state=active]:bg-blue-100 text-slate-500 data-[state=active]:text-blue-600 text-[9px] font-semibold leading-none">{count}</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── POSTS TAB ─────────────────────────────────────────────────── */}
          <TabsContent value="posts" className="flex-1 overflow-hidden mt-0 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto px-4 py-3 space-y-2.5">

                {/* Post composer */}
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <Avatar name={user.name} role="instructor" size="sm" />
                      <Textarea
                        placeholder={isAnnouncement ? '📢 Write an announcement...' : 'Share something with the class...'}
                        value={postContent}
                        onChange={e => setPostContent(e.target.value)}
                        className="flex-1 resize-none min-h-[60px] text-[11px] border-slate-200 bg-slate-50 focus:bg-white"
                        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePostSubmit(); }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 pl-10">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setIsAnnouncement(v => !v)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border transition-colors ${isAnnouncement ? 'bg-amber-50 text-amber-700 border-amber-200' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                        >
                          <Bell className="w-2.5 h-2.5" />Announcement
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
                          <Paperclip className="w-2.5 h-2.5" />Attach
                        </button>
                      </div>
                      <Button
                        size="sm"
                        className="h-6 gap-1 text-[10px] bg-blue-600 hover:bg-blue-700 shadow-sm"
                        onClick={handlePostSubmit}
                        disabled={!postContent.trim()}
                      >
                        <Send className="w-2.5 h-2.5" />Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts feed */}
                {sortedPosts.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No posts yet. Start the conversation.</p>
                  </div>
                )}
                {sortedPosts.map(post => (
                  <Card key={post.id} className={`border-slate-200 shadow-sm transition-shadow hover:shadow ${post.isPinned ? 'ring-1 ring-amber-200' : ''}`}>
                    <CardContent className="p-3">
                      {/* Post header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-2">
                          <Avatar name={post.author} role={post.authorRole} size="sm" />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-semibold text-slate-900 leading-none">{post.author}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium leading-none ${post.authorRole === 'instructor' ? 'bg-blue-50 text-blue-700' :
                                post.authorRole === 'ta' ? 'bg-violet-50 text-violet-700' :
                                  'bg-slate-100 text-slate-500'
                                }`}>
                                {post.authorRole === 'instructor' ? 'Instructor' : post.authorRole === 'ta' ? 'TA' : 'Student'}
                              </span>
                              {post.isAnnouncement && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-medium flex items-center gap-0.5 leading-none">
                                  <Bell className="w-2.5 h-2.5" />Announcement
                                </span>
                              )}
                              {post.isPinned && (
                                <span className="flex items-center gap-0.5 text-[9px] text-amber-600 leading-none">
                                  <Pin className="w-2.5 h-2.5" />Pinned
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 leading-none">{timeAgo(post.timestamp)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button onClick={() => handlePinPost(post.id)} className="p-1 rounded-md hover:bg-slate-100 text-slate-400 transition-colors" title={post.isPinned ? 'Unpin' : 'Pin'}>
                            <Pin className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeletePost(post.id)} className="p-1 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Post content */}
                      <div className="pl-9">
                        <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                        {/* Attachments */}
                        {post.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {post.attachments.map(att => (
                              <div key={att} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[10px] text-slate-600">
                                <Paperclip className="w-2.5 h-2.5 text-slate-400" />{att}
                                <button className="text-blue-500 hover:text-blue-700"><Download className="w-2.5 h-2.5" /></button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reactions */}
                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                          {post.reactions.map(r => (
                            <button
                              key={r.emoji}
                              onClick={() => handleReact(post.id, r.emoji)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border transition-all leading-none ${r.reacted ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-blue-50'}`}
                            >
                              {r.emoji} <span>{r.count}</span>
                            </button>
                          ))}
                          <button
                            onClick={() => { setReplyingTo(post.id); setExpandedReplies(prev => { const s = new Set(prev); s.add(post.id); return s; }); }}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all leading-none"
                          >
                            <MessageCircle className="w-2.5 h-2.5" />{post.replies.length > 0 ? post.replies.length : ''} Reply
                          </button>
                          {post.replies.length > 0 && (
                            <button
                              onClick={() => setExpandedReplies(prev => { const s = new Set(prev); s.has(post.id) ? s.delete(post.id) : s.add(post.id); return s; })}
                              className="text-[10px] text-blue-500 hover:underline leading-none"
                            >
                              {expandedReplies.has(post.id) ? 'Hide' : `Show ${post.replies.length}`} replies
                            </button>
                          )}
                        </div>

                        {/* Replies */}
                        {expandedReplies.has(post.id) && (
                          <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-slate-100">
                            {post.replies.map(reply => (
                              <div key={reply.id} className="flex items-start gap-1.5">
                                <Avatar name={reply.author} role={reply.authorRole} size="xs" />
                                <div className="flex-1 bg-slate-50 rounded-md px-2 py-1.5">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[10px] font-semibold text-slate-800 leading-none">{reply.author}</span>
                                    <span className="text-[9px] text-slate-400 leading-none">{timeAgo(reply.timestamp)}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-600 leading-relaxed">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                            {replyingTo === post.id && (
                              <div className="flex items-start gap-1.5 mt-1.5">
                                <Avatar name={user.name} role="instructor" size="xs" />
                                <div className="flex-1 flex gap-1">
                                  <Input
                                    className="flex-1 h-7 text-[10px]"
                                    placeholder="Write a reply..."
                                    value={replyContent}
                                    onChange={e => setReplyContent(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleReply(post.id); if (e.key === 'Escape') setReplyingTo(null); }}
                                    autoFocus
                                  />
                                  <Button size="sm" className="h-7 px-2" onClick={() => handleReply(post.id)}>
                                    <Send className="w-2.5 h-2.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 px-1.5" onClick={() => setReplyingTo(null)}>
                                    <X className="w-2.5 h-2.5" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── DOCUMENTS TAB ─────────────────────────────────────────────── */}
          <TabsContent value="documents" className="flex-1 overflow-hidden mt-0">
            <div className="flex flex-col h-full">
              {/* Doc toolbar */}
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2 shrink-0">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <Input placeholder="Search documents..." className="pl-7 h-7 text-[11px] border-slate-200 bg-white shadow-sm" value={docSearch} onChange={e => setDocSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-1">
                  {['All', 'Lecture Slides', 'Assignments', 'Labs', 'Resources', 'Exams'].map(cat => (
                    <button key={cat} onClick={() => setDocCategory(cat)}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${docCategory === cat ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'text-slate-500 hover:bg-white border border-transparent'}`}
                    >{cat}</button>
                  ))}
                </div>
                <Button size="sm" className="h-7 gap-1 text-[10px] shrink-0 bg-blue-600 hover:bg-blue-700 ml-auto shadow-sm" onClick={() => setShowUploadDialog(true)}>
                  <Upload className="w-3 h-3" />Upload
                </Button>
              </div>

              <ScrollArea className="flex-1 px-3 py-3">
                <div className="space-y-3 max-w-5xl">
                  {(['Lecture Slides', 'Assignments', 'Labs', 'Resources', 'Exams'] as const).map(cat => {
                    const docs = ws.documents.filter(d =>
                      (docCategory === 'All' || docCategory === cat) &&
                      d.category === cat &&
                      (!docSearch || d.name.toLowerCase().includes(docSearch.toLowerCase()))
                    );
                    if (docs.length === 0 && (docCategory !== 'All' && docCategory !== cat)) return null;
                    if (docs.length === 0 && docSearch) return null;
                    return (
                      <div key={cat}>
                        <div className="flex items-center gap-1.5 mb-1.5 px-1">
                          <Folder className="w-3 h-3 text-amber-500" />
                          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{cat}</span>
                          <span className="text-[9px] text-slate-400">({docs.length})</span>
                        </div>
                        {docs.length === 0 ? (
                          <p className="text-[10px] text-slate-400 pl-5 py-1">No files in this category</p>
                        ) : (
                          <div className="space-y-0.5">
                            {docs.map(doc => (
                              <div key={doc.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group">
                                <FileIcon type={doc.type} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-medium text-slate-800 truncate leading-snug">{doc.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400 leading-none">
                                    <span>{doc.size}</span>
                                    <span>·</span>
                                    <span>by {doc.uploadedBy}</span>
                                    <span>·</span>
                                    <span>{doc.uploadedAt}</span>
                                    <span>·</span>
                                    <span className="flex items-center gap-0.5"><Download className="w-2.5 h-2.5" />{doc.downloads}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* ── TASKS TAB ─────────────────────────────────────────────────── */}
          <TabsContent value="tasks" className="flex-1 overflow-hidden mt-0">
            <div className="flex flex-col h-full">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'todo', label: 'To Do' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'submitted', label: 'Submitted' },
                    { value: 'graded', label: 'Graded' },
                  ].map(f => (
                    <button key={f.value} onClick={() => setTaskFilter(f.value)}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${taskFilter === f.value ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'text-slate-500 hover:bg-white border border-transparent'}`}
                    >{f.label}</button>
                  ))}
                </div>
                <Button size="sm" className="h-7 gap-1 text-[10px] shrink-0 bg-blue-600 hover:bg-blue-700 ml-auto shadow-sm" onClick={() => setShowTaskDialog(true)}>
                  <Plus className="w-3 h-3" />New Task
                </Button>
              </div>

              <ScrollArea className="flex-1 px-3 py-3">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No tasks in this category</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-w-5xl">
                    {filteredTasks.map(task => {
                      const overdue = isOverdue(task.dueDate) && task.status !== 'graded';
                      const progress = task.totalStudents > 0 ? Math.round((task.submissions / task.totalStudents) * 100) : 0;
                      return (
                        <Card key={task.id} className={`border-slate-200 shadow-sm hover:shadow transition-shadow ${overdue ? 'ring-1 ring-red-200' : ''}`}>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-1.5 flex-wrap mb-1.5">
                                  <h4 className="text-[12px] font-semibold text-slate-900 leading-snug">{task.title}</h4>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border leading-none ${STATUS_CONFIG[task.status].className}`}>
                                    {STATUS_CONFIG[task.status].label}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border leading-none ${PRIORITY_CONFIG[task.priority].className}`}>
                                    {PRIORITY_CONFIG[task.priority].label} Priority
                                  </span>
                                  {overdue && (
                                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-50 text-red-600 border border-red-200 leading-none">
                                      <AlertTriangle className="w-2.5 h-2.5" />Overdue
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">{task.description}</p>
                                <div className="flex items-center gap-3 text-[10px] text-slate-500 leading-none">
                                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />Due {task.dueDate}</span>
                                  <span className="flex items-center gap-1"><Star className="w-2.5 h-2.5" />{task.points} pts</span>
                                  <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" />{task.submissions}/{task.totalStudents} submitted</span>
                                </div>
                              </div>
                              <div className="shrink-0 text-right space-y-1.5 w-24">
                                <div className="text-[9px] text-slate-400 leading-none">Submissions</div>
                                <div>
                                  <div className="flex justify-between text-[9px] text-slate-500 mb-1 leading-none">
                                    <span>{progress}%</span>
                                    <span>{task.submissions}/{task.totalStudents}</span>
                                  </div>
                                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                  </div>
                                </div>
                                <span className={`block text-[9px] px-1.5 py-1 rounded text-center leading-none ${task.gradingStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                  task.gradingStatus === 'in-progress' ? 'bg-blue-50 text-blue-600' :
                                    'bg-slate-50 text-slate-400'
                                  }`}>
                                  {task.gradingStatus === 'completed' ? '✓ Graded' :
                                    task.gradingStatus === 'in-progress' ? 'Grading...' : 'Not graded'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* ── MEMBERS TAB ───────────────────────────────────────────────── */}
          <TabsContent value="members" className="flex-1 overflow-hidden mt-0">
            <div className="flex flex-col h-full">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2 shrink-0">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <Input placeholder="Search members..." className="pl-7 h-7 text-[11px] border-slate-200 bg-white shadow-sm" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-1">
                  {['all', 'instructor', 'ta', 'student'].map(f => (
                    <button key={f} onClick={() => setMemberFilter(f)}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors capitalize ${memberFilter === f ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'text-slate-500 hover:bg-white border border-transparent'}`}
                    >{f === 'all' ? 'All' : f === 'ta' ? 'TAs' : f === 'instructor' ? 'Instructors' : 'Students'}</button>
                  ))}
                </div>
              </div>

              <ScrollArea className="flex-1 px-3 py-3">
                <div className="space-y-3 max-w-5xl">
                  {(['instructor', 'ta', 'student'] as const)
                    .filter(role => memberFilter === 'all' || memberFilter === role)
                    .map(role => {
                      const members = filteredMembers.filter(m => m.role === role);
                      if (members.length === 0) return null;
                      const roleLabel = role === 'instructor' ? 'Course Instructor' : role === 'ta' ? 'Teaching Assistants' : 'Students';
                      const roleBg = role === 'instructor' ? 'bg-blue-50 border-blue-100' : role === 'ta' ? 'bg-violet-50 border-violet-100' : 'bg-slate-50 border-slate-100';
                      return (
                        <div key={role}>
                          <div className="flex items-center gap-1.5 mb-2 px-1">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${roleBg} ${role === 'instructor' ? 'text-blue-700' : role === 'ta' ? 'text-violet-700' : 'text-slate-600'}`}>
                              {roleLabel}
                            </span>
                            <span className="text-[9px] text-slate-400">{members.length} member{members.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                            {members.map(m => (
                              <div key={m.id} className="flex items-center gap-2 p-2 rounded-md border border-slate-200 bg-white hover:shadow-sm transition-shadow">
                                <Avatar name={m.name} role={m.role} size="sm" status={m.status} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <p className="text-[11px] font-semibold text-slate-900 truncate leading-none">{m.name}</p>
                                    {m.status === 'online' && <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />}
                                  </div>
                                  <p className="text-[10px] text-slate-400 truncate leading-snug mt-0.5">{m.email}</p>
                                  <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Joined {m.joinedAt}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* ── SESSIONS TAB ──────────────────────────────────────────────── */}
          <TabsContent value="sessions" className="flex-1 overflow-hidden mt-0">
            <div className="flex flex-col h-full">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between shrink-0">
                <p className="text-[10px] text-slate-500">Schedule virtual sessions with external meeting links — Google Meet, Zoom, MS Teams.</p>
                <Button size="sm" className="h-7 gap-1 text-[10px] bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => setShowSessionDialog(true)}>
                  <Plus className="w-3 h-3" />Schedule Session
                </Button>
              </div>
              <ScrollArea className="flex-1 px-3 py-3">
                {ws.sessions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Video className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No sessions scheduled yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-w-5xl">
                    {ws.sessions.map(session => {
                      const typeConfig = {
                        lecture: { label: 'Lecture', className: 'bg-blue-50 text-blue-700 border-blue-200' },
                        lab: { label: 'Lab Session', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                        'office-hours': { label: 'Office Hours', className: 'bg-violet-50 text-violet-700 border-violet-200' },
                        review: { label: 'Review', className: 'bg-amber-50 text-amber-700 border-amber-200' },
                      };
                      const tc = typeConfig[session.type];
                      return (
                        <Card key={session.id} className="border-slate-200 shadow-sm hover:shadow transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center shrink-0 w-12">
                                <div className="text-[9px] font-bold text-slate-700 leading-none">
                                  {new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                                </div>
                                <div className="text-lg font-black text-slate-900 leading-tight mt-0.5">
                                  {new Date(session.date + 'T12:00:00').getDate()}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                      <h4 className="text-[12px] font-semibold text-slate-900 leading-none">{session.title}</h4>
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border leading-none ${tc.className}`}>{tc.label}</span>
                                      {session.isRecurring && <span className="text-[9px] text-slate-400 leading-none">🔄 Recurring</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1.5 leading-none">
                                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{session.time} · {session.duration}</span>
                                      <span className="flex items-center gap-0.5">{platformIcon(session.platform)} {platformLabel(session.platform)}</span>
                                    </div>
                                    {session.description && <p className="text-[10px] text-slate-500 leading-relaxed">{session.description}</p>}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 gap-1 text-[10px] px-2"
                                      onClick={() => { navigator.clipboard.writeText(session.link); toast.success('Link copied'); }}
                                    >
                                      <Copy className="w-2.5 h-2.5" />Copy
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="h-6 gap-1 text-[10px] px-2 bg-blue-600 hover:bg-blue-700 shadow-sm"
                                      onClick={() => window.open(session.link, '_blank')}
                                    >
                                      <ExternalLink className="w-2.5 h-2.5" />Join
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* ── NOTES TAB ─────────────────────────────────────────────────── */}
          <TabsContent value="notes" className="flex-1 overflow-hidden mt-0">
            <div className="flex flex-col h-full">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between shrink-0">
                <p className="text-[10px] text-slate-500">Shared lecture summaries, study notes, and pinned references for the course.</p>
                <Button size="sm" className="h-7 gap-1 text-[10px] bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => { setEditingNote(null); setNoteForm({ title: '', content: '', tags: '' }); setShowNoteDialog(true); }}>
                  <Plus className="w-3 h-3" />New Note
                </Button>
              </div>
              <ScrollArea className="flex-1 px-3 py-3">
                {ws.notes.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No notes yet. Add the first shared note.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-w-6xl">
                    {[...ws.notes].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map(note => (
                      <Card key={note.id} className={`border-slate-200 shadow-sm hover:shadow transition-shadow cursor-pointer ${note.isPinned ? 'ring-1 ring-amber-200' : ''}`} onClick={() => openEditNote(note)}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-1.5 mb-1.5">
                            <div className="flex items-center gap-1.5">
                              {note.isPinned && <Pin className="w-2.5 h-2.5 text-amber-500" />}
                              <h4 className="text-[11px] font-semibold text-slate-900 leading-snug">{note.title}</h4>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); setWorkspaces(prev => prev.map(w => w.id === activeWsId ? { ...w, notes: w.notes.map(n => n.id === note.id ? { ...n, isPinned: !n.isPinned } : n) } : w)); }}
                              className="p-0.5 rounded hover:bg-slate-100 text-slate-400 transition-colors shrink-0"
                            >
                              <Pin className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">{note.content.replace(/[#*]/g, '').trim()}</p>
                          <div className="mt-2 flex items-center justify-between gap-1">
                            <div className="flex flex-wrap gap-1">
                              {note.tags.map(tag => (
                                <span key={tag} className="px-1 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-medium leading-none">#{tag}</span>
                              ))}
                            </div>
                            <span className="text-[9px] text-slate-400 shrink-0 leading-none">{note.updatedAt}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          DIALOGS
      ═══════════════════════════════════════════════════════════════════════ */}

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[13px]"><Upload className="w-3.5 h-3.5 text-blue-500" />Upload Document</DialogTitle>
            <DialogDescription className="text-[11px]">Upload a file to the {ws.courseName} workspace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-5 text-center bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer">
              <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
              <p className="text-[11px] text-slate-500">Click to browse or drag and drop</p>
              <p className="text-[10px] text-slate-400 mt-1">PDF, PPTX, DOCX, ZIP up to 50MB</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-600">File Name</label>
              <Input className="text-[11px] h-8" placeholder="e.g. Lecture 10 - File Systems.pdf" value={uploadForm.name} onChange={e => setUploadForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-600">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {(['Lecture Slides', 'Assignments', 'Labs', 'Resources', 'Exams'] as const).map(cat => (
                  <button key={cat} onClick={() => setUploadForm(p => ({ ...p, category: cat }))}
                    className={`px-2 py-1 rounded-md text-[10px] border transition-colors ${uploadForm.category === cat ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                  >{cat}</button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700 gap-1 text-[10px]" onClick={handleUploadDoc}><Upload className="w-3 h-3" />Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[13px]"><CheckSquare className="w-3.5 h-3.5 text-blue-500" />Create Task / Assignment</DialogTitle>
            <DialogDescription className="text-[11px]">Add a new task or assignment for students in {ws.courseName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-600">Title</label>
              <Input className="text-[11px] h-8" placeholder="e.g. Assignment 4 — File System Implementation" value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-600">Description</label>
              <Textarea className="text-[11px] resize-none" rows={3} placeholder="Describe the assignment requirements..." value={taskForm.description} onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-slate-600">Due Date</label>
                <Input type="date" className="text-[11px] h-8" value={taskForm.dueDate} onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-slate-600">Points</label>
                <Input type="number" min={1} max={100} className="text-[11px] h-8" value={taskForm.points} onChange={e => setTaskForm(p => ({ ...p, points: parseInt(e.target.value) || 10 }))} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-600">Priority</label>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button key={p} onClick={() => setTaskForm(prev => ({ ...prev, priority: p }))}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-colors capitalize ${taskForm.priority === p ? `${PRIORITY_CONFIG[p].className}` : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setShowTaskDialog(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700 gap-1 text-[10px]" onClick={handleCreateTask}><Plus className="w-3 h-3" />Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[13px]"><Video className="w-3.5 h-3.5 text-blue-500" />Schedule Session</DialogTitle>
            <DialogDescription className="text-[11px]">Add a virtual session with an external meeting link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-600">Session Title</label>
              <Input className="text-[11px] h-8" placeholder="e.g. Midterm Review Session" value={sessionForm.title} onChange={e => setSessionForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-slate-600">Type</label>
                <div className="flex flex-wrap gap-1">
                  {(['lecture', 'lab', 'office-hours', 'review'] as const).map(t => (
                    <button key={t} onClick={() => setSessionForm(p => ({ ...p, type: t }))}
                      className={`px-2 py-1 rounded-md text-[10px] border transition-colors capitalize ${sessionForm.type === t ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                    >{t.replace('-', ' ')}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-slate-600">Platform</label>
                <div className="flex flex-wrap gap-1">
                  {(['zoom', 'google-meet', 'teams', 'other'] as const).map(plat => (
                    <button key={plat} onClick={() => setSessionForm(p => ({ ...p, platform: plat }))}
                      className={`px-2 py-1 rounded-md text-[10px] border transition-colors ${sessionForm.platform === plat ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                    >{platformIcon(plat)} {platformLabel(plat)}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-slate-600">Date</label>
                <Input type="date" className="text-[11px] h-8" value={sessionForm.date} onChange={e => setSessionForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-slate-600">Time</label>
                <Input type="time" className="text-[11px] h-8" value={sessionForm.time} onChange={e => setSessionForm(p => ({ ...p, time: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-600">Meeting Link <span className="text-red-400">*</span></label>
              <Input className="text-[11px] h-8" placeholder="https://meet.google.com/... or https://zoom.us/j/..." value={sessionForm.link} onChange={e => setSessionForm(p => ({ ...p, link: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-600">Description (optional)</label>
              <Textarea className="text-[11px] resize-none" rows={2} placeholder="Session agenda or notes..." value={sessionForm.description} onChange={e => setSessionForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setShowSessionDialog(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700 gap-1 text-[10px]" onClick={handleCreateSession}><Calendar className="w-3 h-3" />Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[13px]"><StickyNote className="w-3.5 h-3.5 text-blue-500" />{editingNote ? 'Edit Note' : 'New Shared Note'}</DialogTitle>
            <DialogDescription className="text-[11px]">Notes are visible to all course members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 flex-1 overflow-y-auto">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-600">Title</label>
              <Input className="text-[11px] h-8" placeholder="Note title..." value={noteForm.title} onChange={e => setNoteForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-600">Content (Markdown supported)</label>
              <Textarea className="text-[11px] resize-none font-mono" rows={10} placeholder="# Title&#10;## Section&#10;&#10;Your notes here..." value={noteForm.content} onChange={e => setNoteForm(p => ({ ...p, content: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-600">Tags (comma separated)</label>
              <Input className="text-[11px] h-8" placeholder="e.g. scheduling, memory, midterm" value={noteForm.tags} onChange={e => setNoteForm(p => ({ ...p, tags: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setShowNoteDialog(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700 gap-1 text-[10px]" onClick={handleSaveNote}><Check className="w-3 h-3" />{editingNote ? 'Save Changes' : 'Publish Note'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
