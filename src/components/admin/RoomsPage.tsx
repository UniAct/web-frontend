import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '../ui/modal';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  Building,
  Monitor,
  Presentation,
  Download,
  Loader2,
  RefreshCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { ClassroomService, type Classroom, type ClassroomCreateInput, type ClassroomType } from '../../api';

type Room = Classroom;

interface RoomFormData {
  classroomNumber: string;
  building: string;
  capacity: number;
  type: ClassroomType;
}

interface RoomsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (id: string | null) => void;
}

const initialFormData: RoomFormData = {
  classroomNumber: '',
  building: '',
  capacity: 30,
  type: 'Hall',
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function RoomsPage({ selectedUniversity }: RoomsPageProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filterType, setFilterType] = useState<'all' | Room['type']>('all');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [formData, setFormData] = useState<RoomFormData>(initialFormData);

  const loadRooms = async () => {
    if (!selectedUniversity) return;

    try {
      setLoading(true);
      setFetchError(null);
      const fetchedRooms = await ClassroomService.getAll();
      setRooms(fetchedRooms);
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to load classrooms');
      setFetchError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRooms();
  }, [selectedUniversity]);

  const filteredRooms = useMemo(() => rooms.filter((room) => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const matchesSearch =
      room.classroomNumber.toLowerCase().includes(normalizedSearch) ||
      room.building.toLowerCase().includes(normalizedSearch);
    const matchesType = filterType === 'all' || room.type === filterType;
    return matchesSearch && matchesType;
  }), [rooms, searchQuery, filterType]);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingRoom(null);
    resetForm();
  };

  const isDuplicateClassroom = () => {
    return rooms.some(
      (room) =>
        room.classroomNumber.trim().toLowerCase() === formData.classroomNumber.trim().toLowerCase() &&
        room.building.trim().toLowerCase() === formData.building.trim().toLowerCase() &&
        room.id !== editingRoom?.id,
    );
  };

  const handleAddRoom = async () => {
    if (!formData.classroomNumber.trim() || !formData.building.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isDuplicateClassroom()) {
      toast.error('Classroom number already exists in this building');
      return;
    }

    const payload: ClassroomCreateInput = {
      classroomNumber: formData.classroomNumber.trim(),
      building: formData.building.trim(),
      capacity: formData.capacity,
      type: formData.type,
    };

    try {
      setSaving(true);
      const createdRoom = await ClassroomService.create(payload);
      setRooms((current) => [...current, createdRoom]);
      closeModal();
      toast.success('Room added successfully');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create room'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditRoom = async () => {
    if (!editingRoom || !formData.classroomNumber.trim() || !formData.building.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isDuplicateClassroom()) {
      toast.error('Classroom number already exists in this building');
      return;
    }

    const payload: ClassroomCreateInput = {
      classroomNumber: formData.classroomNumber.trim(),
      building: formData.building.trim(),
      capacity: formData.capacity,
      type: formData.type,
    };

    try {
      setSaving(true);
      const updatedRoom = await ClassroomService.update(editingRoom.id, payload);
      setRooms((current) => current.map((room) => (room.id === editingRoom.id ? updatedRoom : room)));
      closeModal();
      toast.success('Room updated successfully');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update room'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this room?');
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await ClassroomService.delete(id);
      setRooms((current) => current.filter((room) => room.id !== id));
      toast.success('Room deleted successfully');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete room'));
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      classroomNumber: room.classroomNumber,
      building: room.building,
      capacity: room.capacity,
      type: room.type,
    });
  };

  const getTypeIcon = (type: Room['type']) => {
    switch (type) {
      case 'Hall': return <Presentation className="w-4 h-4" />;
      case 'Lab': return <Monitor className="w-4 h-4" />;
      case 'Auditorium': return <Users className="w-4 h-4" />;
      case 'Other': return <Building className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: Room['type']) => {
    switch (type) {
      case 'Hall': return 'Hall';
      case 'Lab': return 'Laboratory';
      case 'Auditorium': return 'Auditorium';
      case 'Other': return 'Other';
      default: return type;
    }
  };

  const getTypeColor = (type: Room['type']) => {
    switch (type) {
      case 'Hall': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Lab': return 'bg-green-100 text-green-800 border-green-200';
      case 'Auditorium': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Other': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportRoomsData = () => {
    const csvContent = [
      ['Room Number', 'Building', 'Capacity', 'Type', 'Availability', 'Scheduled Sessions'].join(','),
      ...rooms.map(room => [
        room.classroomNumber,
        `"${room.building}"`,
        room.capacity,
        room.type,
        room.underMaintenance ? 'Unavailable' : 'Available',
        room.scheduleSlot?.length ?? 0,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rooms-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Rooms data exported successfully');
  };

  if (!selectedUniversity) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MapPin className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No University Selected</h3>
          <p className="text-slate-600 text-center">Please select a university to manage its rooms.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-slate-900 break-words">Rooms Management</h2>
          <p className="text-slate-600 mt-1 break-words">Manage classrooms, capacity, and availability</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:gap-3">
          <Button variant="outline" onClick={() => void loadRooms()} disabled={loading} className="gap-2 w-full">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportRoomsData} className="gap-2 w-full" disabled={loading}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="gap-2 w-full" disabled={loading}>
            <Plus className="w-4 h-4" />
            Add Room
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Rooms</p>
                <p className="text-2xl font-semibold text-slate-900">{rooms.length}</p>
              </div>
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Halls</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {rooms.filter(r => r.type === 'Hall').length}
                </p>
              </div>
              <Presentation className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Labs</p>
                <p className="text-2xl font-semibold text-green-600">
                  {rooms.filter(r => r.type === 'Lab').length}
                </p>
              </div>
              <Monitor className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Capacity</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {rooms.reduce((sum, r) => sum + r.capacity, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {fetchError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{fetchError}</CardContent>
        </Card>
      ) : null}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Hall">Halls</option>
                <option value="Lab">Labs</option>
                <option value="Auditorium">Auditoriums</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex items-center justify-center py-12 text-slate-600">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading rooms...
              </CardContent>
            </Card>
          </div>
        ) : null}

        {!loading && filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${room.type === 'Hall' ? 'bg-blue-100' :
                    room.type === 'Lab' ? 'bg-green-100' :
                      room.type === 'Auditorium' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                    {getTypeIcon(room.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{room.classroomNumber}</CardTitle>
                    <p className="text-sm text-slate-500">{room.building}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(room)}
                    disabled={deletingId === room.id || saving}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRoom(room.id)}
                    disabled={deletingId === room.id || saving}
                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                  >
                    {deletingId === room.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`gap-1 ${getTypeColor(room.type)}`}>
                  {getTypeIcon(room.type)}
                  {getTypeLabel(room.type)}
                </Badge>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-lg font-semibold text-blue-600">{room.capacity}</span>
                  <span className="text-slate-600">students</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Building:</span>
                  <span className="font-medium">{room.building}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Availability:</span>
                  <Badge variant="outline" className={room.underMaintenance ? 'text-red-700 border-red-200 bg-red-50' : 'text-green-700 border-green-200 bg-green-50'}>
                    {room.underMaintenance ? 'Unavailable' : 'Available'}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Scheduled sessions</p>
                <p className="text-sm text-slate-600">{room.scheduleSlot?.length ?? 0} session(s)</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && filteredRooms.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="w-12 h-12 text-slate-400 mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Rooms Found</h3>
                <p className="text-slate-600">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add/Edit Room Modal */}
      <Modal open={showAddModal || !!editingRoom} onOpenChange={(open) => {
        if (!open) {
          closeModal();
        }
      }}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </ModalTitle>
            <ModalDescription>
              {editingRoom ? 'Update room information and settings' : 'Create a new room with capacity and equipment details'}
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Room Number *
                </label>
                <Input
                  value={formData.classroomNumber}
                  onChange={(e) => setFormData({ ...formData, classroomNumber: e.target.value })}
                  placeholder="e.g., A101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Building *
                </label>
                <Input
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  placeholder="e.g., Engineering Building"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Capacity *
                </label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Math.max(1, Number(e.target.value) || 1) })}
                  min="1"
                  max="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Room Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Room['type'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Hall">Hall</option>
                  <option value="Lab">Laboratory</option>
                  <option value="Auditorium">Auditorium</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={() => void (editingRoom ? handleEditRoom() : handleAddRoom())} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingRoom ? 'Update' : 'Add'} Room
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
