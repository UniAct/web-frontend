import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Bell, Calendar as CalendarIcon, Edit, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import { AnnouncementService } from '../../api';
import type { Announcement, AnnouncementInput } from '../../api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { SearchableSelect } from '../ui/searchable-select';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';

interface AnnouncementsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

const emptyForm = {
  title: '',
  content: '',
  type: 'ANNOUNCEMENT' as AnnouncementInput['type'],
  audience: 'ALL' as AnnouncementInput['audience'],
  status: 'PUBLISHED' as AnnouncementInput['status'],
  event_location: '',
};

export function AnnouncementsPage({ selectedUniversity }: AnnouncementsPageProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('announcements');
  const [allItems, setAllItems] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCreator, setFilterCreator] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');

  const loadItems = async () => {
    setIsLoading(true);
    try {
      setAllItems(await AnnouncementService.getAll());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, [selectedUniversity]);

  const creators = useMemo(
    () => ['all', ...Array.from(new Set(allItems.map((item) => String(item.author_id))))],
    [allItems],
  );

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedDate(undefined);
    setEditingItem(null);
  };

  const toInput = (): AnnouncementInput => ({
    title: form.title.trim(),
    content: form.content.trim(),
    type: form.type,
    audience: form.audience,
    status: form.status,
    event_date: selectedDate ? selectedDate.toISOString() : null,
    event_location: form.event_location.trim() || null,
  });

  const validateForm = () => {
    if (!form.title.trim()) return 'Please enter a title';
    if (!form.content.trim()) return 'Please enter content';
    if (!form.type) return 'Please select type';
    if (!form.audience) return 'Please select audience';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = toInput();
      if (editingItem) {
        const updated = await AnnouncementService.update(editingItem.id, payload);
        setAllItems((items) => items.map((item) => (item.id === updated.id ? updated : item)));
        toast.success('Item updated');
      } else {
        const created = await AnnouncementService.create(payload);
        setAllItems((items) => [created, ...items]);
        toast.success(payload.type === 'EVENT' ? 'Event created' : 'Announcement created');
      }

      resetForm();
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: Announcement) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      content: item.content,
      type: item.type,
      audience: item.audience,
      status: item.status,
      event_location: item.event_location ?? '',
    });
    setSelectedDate(item.event_date ? new Date(item.event_date) : undefined);
    setDialogOpen(true);
  };

  const handleDelete = async (item: Announcement) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      await AnnouncementService.delete(item.id);
      setAllItems((items) => items.filter((current) => current.id !== item.id));
      toast.success('Item deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete item');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCreator('all');
    setFilterDateRange('all');
  };

  const hasActiveFilters = searchQuery || filterCreator !== 'all' || filterDateRange !== 'all';

  const filterItems = (items: Announcement[], itemType: Announcement['type']) => {
    return items.filter((item) => {
      if (item.type !== itemType) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          item.title.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          String(item.author_id).includes(query);
        if (!matchesSearch) return false;
      }

      if (filterCreator !== 'all' && String(item.author_id) !== filterCreator) return false;

      const itemDate = new Date(item.event_date ?? item.created_at);
      if (filterDateRange !== 'all') {
        const today = new Date();
        const daysDiff = Math.floor((itemDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (filterDateRange === 'upcoming' && daysDiff < 0) return false;
        if (filterDateRange === 'past' && daysDiff >= 0) return false;
        if (filterDateRange === 'thisWeek' && (daysDiff < 0 || daysDiff > 7)) return false;
        if (filterDateRange === 'thisMonth' && (daysDiff < 0 || daysDiff > 30)) return false;
      }

      return true;
    });
  };

  const announcements = filterItems(allItems, 'ANNOUNCEMENT');
  const events = filterItems(allItems, 'EVENT');

  const renderItemsList = (items: Announcement[], itemType: string) => {
    if (isLoading) {
      return <Skeleton className="h-64 w-full" />;
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">{hasActiveFilters ? 'No items match your filters' : `No ${itemType}s found`}</p>
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
              {['Title', 'Content', 'Author', 'Audience', 'Date', 'Status', 'Actions'].map((heading) => (
                <th key={heading} className="text-left py-3 px-4 bg-slate-50">
                  <div className="text-slate-700">{heading}</div>
                </th>
              ))}
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
                  <div className="text-slate-900 text-sm">User #{item.author_id}</div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline">{item.audience}</Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="text-slate-900 text-sm">
                    {new Date(item.event_date ?? item.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge className={item.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}>
                    {item.status}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} className="h-8 w-8 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item)}
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900">Announcements & Events</h2>
          <p className="text-slate-600 mt-1">Manage university announcements and events</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Announcement or Event' : 'Create Announcement or Event'}</DialogTitle>
              <DialogDescription>Fill in the details below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Description/Content</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={form.event_location}
                    onChange={(event) => setForm((current) => ({ ...current, event_location: event.target.value }))}
                    placeholder="Main Auditorium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <SearchableSelect
                    value={form.type}
                    onValueChange={(value) => setForm((current) => ({ ...current, type: value as AnnouncementInput['type'] }))}
                    options={[
                      { value: 'ANNOUNCEMENT', label: 'Announcement' },
                      { value: 'EVENT', label: 'Event' },
                    ]}
                    placeholder="Select type"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <SearchableSelect
                    value={form.audience}
                    onValueChange={(value) => setForm((current) => ({ ...current, audience: value as AnnouncementInput['audience'] }))}
                    options={[
                      { value: 'ALL', label: 'All' },
                      { value: 'STUDENTS', label: 'Students' },
                      { value: 'STAFF', label: 'Staff' },
                      { value: 'FACULTY', label: 'Faculty' },
                    ]}
                    placeholder="Select audience"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <SearchableSelect
                    value={form.status}
                    onValueChange={(value) => setForm((current) => ({ ...current, status: value as AnnouncementInput['status'] }))}
                    options={[
                      { value: 'PUBLISHED', label: 'Published' },
                      { value: 'DRAFT', label: 'Draft' },
                    ]}
                    placeholder="Select status"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by title, content, or author id..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>
            <SearchableSelect
              value={filterCreator}
              onValueChange={setFilterCreator}
              options={creators.map((creator) => ({ value: creator, label: creator === 'all' ? 'All Authors' : `User #${creator}` }))}
              placeholder="Filter by Author"
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
                { value: 'thisMonth', label: 'This Month' },
              ]}
              placeholder="Filter by Date"
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
