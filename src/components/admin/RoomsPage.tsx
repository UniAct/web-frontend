import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '../ui/modal';
import { Textarea } from '../ui/textarea';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  Building,
  Monitor,
  Wifi,
  Volume2,
  Presentation,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface Room {
  id: string;
  code: string;
  name: string;
  maxStudents: number;
  type: 'lecture' | 'lab' | 'seminar' | 'tutorial';
  building: string;
  floor: number;
  equipment: string[];
  isActive: boolean;
  createdAt: string;
}

interface RoomsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (id: string | null) => void;
}

// Mock data
const mockRooms: Room[] = [
  {
    id: '1',
    code: 'A101',
    name: 'Lecture Hall A101',
    maxStudents: 150,
    type: 'lecture',
    building: 'Engineering Building',
    floor: 1,
    equipment: ['Projector', 'Sound System', 'Whiteboard', 'Air Conditioning'],
    isActive: true,
    createdAt: '2023-06-01'
  },
  {
    id: '2',
    code: 'CS-LAB1',
    name: 'Computer Science Lab 1',
    maxStudents: 30,
    type: 'lab',
    building: 'Computer Science Building',
    floor: 2,
    equipment: ['30 Computers', 'Projector', 'Network', 'Air Conditioning'],
    isActive: true,
    createdAt: '2023-06-01'
  },
  {
    id: '3',
    code: 'B205',
    name: 'Tutorial Room B205',
    maxStudents: 25,
    type: 'tutorial',
    building: 'Main Building',
    floor: 2,
    equipment: ['Whiteboard', 'Tables', 'Chairs'],
    isActive: true,
    createdAt: '2023-06-15'
  },
  {
    id: '4',
    code: 'SEM1',
    name: 'Seminar Room 1',
    maxStudents: 40,
    type: 'seminar',
    building: 'Business Building',
    floor: 1,
    equipment: ['Smart Board', 'Video Conference', 'Sound System', 'Air Conditioning'],
    isActive: true,
    createdAt: '2023-07-01'
  }
];

export function RoomsPage({ selectedUniversity }: RoomsPageProps) {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filterType, setFilterType] = useState<'all' | Room['type']>('all');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    maxStudents: 30,
    type: 'lecture' as Room['type'],
    building: '',
    floor: 1,
    equipment: [] as string[],
  });

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || room.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddRoom = () => {
    if (!formData.code || !formData.name || !formData.building) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if room code already exists
    if (rooms.some(r => r.code === formData.code && r.id !== editingRoom?.id)) {
      toast.error('Room code already exists');
      return;
    }

    const newRoom: Room = {
      id: Date.now().toString(),
      code: formData.code,
      name: formData.name,
      maxStudents: formData.maxStudents,
      type: formData.type,
      building: formData.building,
      floor: formData.floor,
      equipment: formData.equipment,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRooms([...rooms, newRoom]);
    setShowAddModal(false);
    resetForm();
    toast.success('Room added successfully');
  };

  const handleEditRoom = () => {
    if (!editingRoom || !formData.code || !formData.name || !formData.building) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (rooms.some(r => r.code === formData.code && r.id !== editingRoom.id)) {
      toast.error('Room code already exists');
      return;
    }

    setRooms(rooms.map(room =>
      room.id === editingRoom.id
        ? {
          ...room,
          code: formData.code,
          name: formData.name,
          maxStudents: formData.maxStudents,
          type: formData.type,
          building: formData.building,
          floor: formData.floor,
          equipment: formData.equipment
        }
        : room
    ));
    setEditingRoom(null);
    resetForm();
    toast.success('Room updated successfully');
  };

  const handleDeleteRoom = (id: string) => {
    setRooms(rooms.filter(room => room.id !== id));
    toast.success('Room deleted successfully');
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      code: room.code,
      name: room.name,
      maxStudents: room.maxStudents,
      type: room.type,
      building: room.building,
      floor: room.floor,
      equipment: room.equipment
    });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      maxStudents: 30,
      type: 'lecture',
      building: '',
      floor: 1,
      equipment: []
    });
  };

  const getTypeIcon = (type: Room['type']) => {
    switch (type) {
      case 'lecture': return <Presentation className="w-4 h-4" />;
      case 'lab': return <Monitor className="w-4 h-4" />;
      case 'seminar': return <Users className="w-4 h-4" />;
      case 'tutorial': return <Building className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Room['type']) => {
    switch (type) {
      case 'lecture': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lab': return 'bg-green-100 text-green-800 border-green-200';
      case 'seminar': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'tutorial': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportRoomsData = () => {
    const csvContent = [
      ['Code', 'Name', 'Max Students', 'Type', 'Building', 'Floor', 'Equipment'].join(','),
      ...rooms.map(room => [
        room.code,
        `"${room.name}"`,
        room.maxStudents,
        room.type,
        `"${room.building}"`,
        room.floor,
        `"${room.equipment.join(', ')}"`
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Rooms Management</h2>
          <p className="text-slate-600 mt-1">Manage rooms, capacity, and equipment</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportRoomsData} className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
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
                <p className="text-sm text-slate-600">Lecture Halls</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {rooms.filter(r => r.type === 'lecture').length}
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
                  {rooms.filter(r => r.type === 'lab').length}
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
                  {rooms.reduce((sum, r) => sum + r.maxStudents, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                <option value="lecture">Lecture Halls</option>
                <option value="lab">Labs</option>
                <option value="seminar">Seminar Rooms</option>
                <option value="tutorial">Tutorial Rooms</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${room.type === 'lecture' ? 'bg-blue-100' :
                      room.type === 'lab' ? 'bg-green-100' :
                        room.type === 'seminar' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                    {getTypeIcon(room.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{room.code}</CardTitle>
                    <p className="text-sm text-slate-500">{room.name}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(room)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRoom(room.id)}
                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`gap-1 ${getTypeColor(room.type)}`}>
                  {getTypeIcon(room.type)}
                  {room.type}
                </Badge>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-lg font-semibold text-blue-600">{room.maxStudents}</span>
                  <span className="text-slate-600">students</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Building:</span>
                  <span className="font-medium">{room.building}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Floor:</span>
                  <span className="font-medium">Floor {room.floor}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Equipment:</p>
                <div className="flex flex-wrap gap-1">
                  {room.equipment.slice(0, 3).map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                  {room.equipment.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{room.equipment.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRooms.length === 0 && (
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
          setShowAddModal(false);
          setEditingRoom(null);
          resetForm();
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
                  Room Code *
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., A101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Room Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Lecture Hall A101"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Maximum Students *
                </label>
                <Input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
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
                  <option value="lecture">Lecture Hall</option>
                  <option value="lab">Laboratory</option>
                  <option value="seminar">Seminar Room</option>
                  <option value="tutorial">Tutorial Room</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Floor *
                </label>
                <Input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                  min="1"
                  max="20"
                />
              </div>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Equipment (comma separated)
              </label>
              <Textarea
                value={formData.equipment.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  equipment: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                })}
                placeholder="e.g., Projector, Sound System, Whiteboard, Air Conditioning"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRoom(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingRoom ? handleEditRoom : handleAddRoom}>
                {editingRoom ? 'Update' : 'Add'} Room
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
