import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SearchableSelect } from '../ui/searchable-select';
import { MultiSelect } from '../ui/multi-select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Search,
  Plus,
  Bell,
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  Filter,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AnnouncementsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  creator: string;
  type: 'announcement' | 'event';
  targetAudience: string | string[];
  date: string;
  createdAt: string;
  status: 'Published' | 'Draft';
}

export function AnnouncementsPage({ selectedUniversity }: AnnouncementsPageProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('announcements');

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [type, setType] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCreator, setFilterCreator] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');

  // Mock data
  const allItems: Announcement[] = [
    {
      id: '1',
      title: 'Fall Semester Registration Opens',
      content: 'Registration for Fall 2024 semester will begin on August 1st. Students are advised to meet with their academic advisors before registration.',
      creator: 'Dr. Sarah Wilson',
      type: 'announcement',
      targetAudience: 'Students',
      date: '2024-08-01',
      createdAt: '2024-07-15',
      status: 'Published'
    },
    {
      id: '2',
      title: 'Annual Research Symposium 2024',
      content: 'Join us for the Annual Research Symposium featuring presentations from faculty and graduate students. Registration required.',
      creator: 'Prof. Michael Johnson',
      type: 'event',
      targetAudience: 'All',
      date: '2024-09-15',
      createdAt: '2024-07-10',
      status: 'Published'
    },
    {
      id: '3',
      title: 'Campus Safety Protocol Update',
      content: 'New safety protocols have been implemented across campus. All staff and students must familiarize themselves with the updated procedures.',
      creator: 'Security Office',
      type: 'announcement',
      targetAudience: 'All',
      date: '2024-07-20',
      createdAt: '2024-07-18',
      status: 'Published'
    },
    {
      id: '4',
      title: 'Career Fair 2024',
      content: 'Annual career fair with 50+ companies recruiting for internships and full-time positions. Business attire required.',
      creator: 'Dr. Ahmed Hassan',
      type: 'event',
      targetAudience: 'Students',
      date: '2024-10-10',
      createdAt: '2024-07-25',
      status: 'Published'
    },
    {
      id: '5',
      title: 'Faculty Development Workshop',
      content: 'Professional development workshop on innovative teaching methodologies and assessment strategies.',
      creator: 'Prof. Lisa Chen',
      type: 'event',
      targetAudience: 'Faculty',
      date: '2024-08-20',
      createdAt: '2024-07-22',
      status: 'Published'
    },
    {
      id: '6',
      title: 'Library Hours Extended',
      content: 'Starting next week, the university library will extend its hours to accommodate exam preparation. New hours: 7 AM - 11 PM.',
      creator: 'Library Administration',
      type: 'announcement',
      targetAudience: 'Students',
      date: '2024-07-28',
      createdAt: '2024-07-20',
      status: 'Published'
    },
    {
      id: '7',
      title: 'Alumni Networking Event',
      content: 'Connect with alumni working in tech industry. Great opportunity for networking and career advice.',
      creator: 'Alumni Relations',
      type: 'event',
      targetAudience: 'Students',
      date: '2024-09-05',
      createdAt: '2024-07-19',
      status: 'Published'
    },
    {
      id: '8',
      title: 'Scholarship Applications Open',
      content: 'Merit-based scholarship applications are now open for the upcoming academic year. Deadline: September 15th.',
      creator: 'Financial Aid Office',
      type: 'announcement',
      targetAudience: 'Students',
      date: '2024-07-30',
      createdAt: '2024-07-16',
      status: 'Published'
    }
  ];

  const creators = ['all', ...Array.from(new Set(allItems.map(item => item.creator)))];

  // Filter logic
  const filterItems = (items: Announcement[], itemType: 'announcement' | 'event') => {
    return items.filter(item => {
      // Type filter
      if (item.type !== itemType) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          item.title.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.creator.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Creator filter
      if (filterCreator !== 'all' && item.creator !== filterCreator) {
        return false;
      }

      // Date range filter
      if (filterDateRange !== 'all') {
        const itemDate = new Date(item.date);
        const today = new Date();
        const daysDiff = Math.floor((itemDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        switch (filterDateRange) {
          case 'upcoming':
            if (daysDiff < 0) return false;
            break;
          case 'past':
            if (daysDiff >= 0) return false;
            break;
          case 'thisWeek':
            if (daysDiff < 0 || daysDiff > 7) return false;
            break;
          case 'thisMonth':
            if (daysDiff < 0 || daysDiff > 30) return false;
            break;
        }
      }

      return true;
    });
  };

  const announcements = filterItems(allItems, 'announcement');
  const events = filterItems(allItems, 'event');

  const handleCreateAnnouncement = () => {
    // Validation
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter content');
      return;
    }
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    if (!targetAudience || targetAudience.length === 0) {
      toast.error('Please select at least one target audience');
      return;
    }
    if (!type) {
      toast.error('Please select type');
      return;
    }

    // Create announcement (in real app, this would call an API)
    toast.success(`${type === 'announcement' ? 'Announcement' : 'Event'} created successfully`);

    // Reset form
    setTitle('');
    setContent('');
    setSelectedDate(undefined);
    setTargetAudience([]);
    setType('');
    setDialogOpen(false);
  };

  const handleEdit = (id: string) => {
    toast.info('Edit functionality would open here');
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      toast.success('Item deleted successfully');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCreator('all');
    setFilterDateRange('all');
  };

  const hasActiveFilters = searchQuery || filterCreator !== 'all' || filterDateRange !== 'all';

  const renderItemsList = (items: Announcement[], itemType: string) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">
            {hasActiveFilters ? 'No items match your filters' : `No ${itemType}s found`}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-4 gap-2">
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-300">
              <th className="text-left py-3 px-4 bg-slate-50">
                <div className="text-slate-700">Title</div>
              </th>
              <th className="text-left py-3 px-4 bg-slate-50">
                <div className="text-slate-700">Content</div>
              </th>
              <th className="text-left py-3 px-4 bg-slate-50">
                <div className="text-slate-700">Creator</div>
              </th>
              <th className="text-left py-3 px-4 bg-slate-50">
                <div className="text-slate-700">Audience</div>
              </th>
              <th className="text-left py-3 px-4 bg-slate-50">
                <div className="text-slate-700">Date</div>
              </th>
              <th className="text-left py-3 px-4 bg-slate-50">
                <div className="text-slate-700">Status</div>
              </th>
              <th className="text-center py-3 px-4 bg-slate-50">
                <div className="text-slate-700">Actions</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="text-slate-900 max-w-xs truncate">{item.title}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-slate-600 text-sm max-w-md truncate">{item.content}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-slate-900 text-sm">{item.creator}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(item.targetAudience) ? (
                      item.targetAudience.map((audience, idx) => (
                        <Badge key={idx} variant="outline">{audience}</Badge>
                      ))
                    ) : (
                      <Badge variant="outline">{item.targetAudience}</Badge>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-slate-900 text-sm">{new Date(item.date).toLocaleDateString()}</div>
                </td>
                <td className="py-3 px-4">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {item.status}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id, item.title)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900">Announcements & Events</h2>
          <p className="text-slate-600 mt-1">Manage university announcements and events</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-[rgb(255,255,255)] bg-[rgb(0,0,0)]">
              <Plus className="w-4 h-4" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement or Event</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new announcement or event
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Description/Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter detailed description"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <MultiSelect
                    value={targetAudience}
                    onValueChange={setTargetAudience}
                    options={[
                      { value: 'all', label: 'All' },
                      { value: 'students', label: 'Students' },
                      { value: 'faculty', label: 'Faculty' },
                      { value: 'staff', label: 'Staff' },
                      { value: 'alumni', label: 'Alumni' }
                    ]}
                    placeholder="Select one or more audiences"
                    searchPlaceholder="Search audiences..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <SearchableSelect
                  value={type}
                  onValueChange={setType}
                  options={[
                    { value: 'announcement', label: 'University Announcement' },
                    { value: 'event', label: 'Event' }
                  ]}
                  placeholder="Select type"
                  searchPlaceholder="Search type..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateAnnouncement}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 bg-[rgb(0,0,0)]"
              >
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl text-slate-900">{announcements.length}</p>
                <p className="text-sm text-slate-600">Total Announcements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl text-slate-900">{events.length}</p>
                <p className="text-sm text-slate-600">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Filter className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl text-slate-900">{announcements.length + events.length}</p>
                <p className="text-sm text-slate-600">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by title, content, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <SearchableSelect
              value={filterCreator}
              onValueChange={setFilterCreator}
              options={creators.map(creator => ({ value: creator, label: creator === 'all' ? 'All Creators' : creator }))}
              placeholder="Filter by Creator"
              searchPlaceholder="Search creators..."
              className="w-full md:w-[200px]"
            />

            <SearchableSelect
              value={filterDateRange}
              onValueChange={setFilterDateRange}
              options={[
                { value: 'all', label: 'All Dates' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'past', label: 'Past' },
                { value: 'thisWeek', label: 'This Week' },
                { value: 'thisMonth', label: 'This Month' }
              ]}
              placeholder="Filter by Date"
              searchPlaceholder="Search date range..."
              className="w-full md:w-[200px]"
            />

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Announcements and Events */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Content</CardTitle>
          <CardDescription>View and manage announcements and events separately</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="announcements" className="gap-2">
                <Bell className="w-4 h-4" />
                Announcements ({announcements.length})
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                Events ({events.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="announcements" className="mt-6">
              {renderItemsList(announcements, 'announcement')}
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              {renderItemsList(events, 'event')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
