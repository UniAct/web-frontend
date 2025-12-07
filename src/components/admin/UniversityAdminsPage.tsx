import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '../ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  Settings,
  Users,
  BookOpen,
  BarChart3,
  UserCog,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'registrar' | 'academic_admin';
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  lastLogin: string;
  createdAt: string;
}

interface UniversityAdminsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (id: string | null) => void;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'statistics', label: 'Statistics', description: 'Access visual insights & analytics' },
  { id: 'admins', label: 'Admins', description: 'Manage administrator accounts' },
  { id: 'staff', label: 'Staff', description: 'Manage faculty & teaching assistants' },
  { id: 'students', label: 'Students', description: 'Manage student accounts & data' },
  { id: 'programs', label: 'Programs', description: 'Manage academic programs & faculties' },
  { id: 'rooms', label: 'Rooms', description: 'Manage rooms & facilities' },
  { id: 'timetabling', label: 'Timetabling', description: 'Create and modify schedules' },
  { id: 'enrollment', label: 'Enrollment', description: 'Manage student enrollments' },
  { id: 'level-tables', label: 'Level Tables', description: 'Manage level & schedule tables' },
  { id: 'attendance', label: 'Attendance', description: 'Track and manage attendance' },
  { id: 'grades', label: 'Grades', description: 'Manage student grades' },
  { id: 'announcements', label: 'Announcements', description: 'Create and manage announcements' },
  { id: 'audit-logs', label: 'Audit Logs', description: 'View system activity logs' },
  { id: 'settings', label: 'Settings', description: 'Modify system settings' },
];

// Mock data
const mockAdmins: Admin[] = [
  {
    id: '1',
    name: 'Dr. Ahmed Hassan',
    email: 'ahmed.hassan@anu.edu.eg',
    role: 'admin',
    status: 'active',
    permissions: ['statistics', 'staff', 'students', 'programs', 'timetabling', 'enrollment'],
    lastLogin: '2024-01-20T10:30:00Z',
    createdAt: '2023-09-15T08:00:00Z'
  },
  {
    id: '2',
    name: 'Sarah Mohamed',
    email: 'sarah.mohamed@anu.edu.eg',
    role: 'registrar',
    status: 'active',
    permissions: ['students', 'enrollment', 'attendance', 'statistics'],
    lastLogin: '2024-01-19T14:20:00Z',
    createdAt: '2023-10-01T09:15:00Z'
  },
  {
    id: '3',
    name: 'Prof. Omar Ali',
    email: 'omar.ali@anu.edu.eg',
    role: 'academic_admin',
    status: 'pending',
    permissions: ['programs', 'timetabling', 'grades', 'announcements'],
    lastLogin: 'Never',
    createdAt: '2024-01-15T11:00:00Z'
  }
];

export function UniversityAdminsPage({ selectedUniversity }: UniversityAdminsPageProps) {
  const [admins, setAdmins] = useState<Admin[]>(mockAdmins);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [filterRole, setFilterRole] = useState<'all' | Admin['role']>('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin' as Admin['role'],
    permissions: [] as string[]
  });

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || admin.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddAdmin = () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newAdmin: Admin = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'pending',
      permissions: formData.permissions,
      lastLogin: 'Never',
      createdAt: new Date().toISOString()
    };

    setAdmins([...admins, newAdmin]);
    setShowAddModal(false);
    resetForm();
    toast.success('Admin added successfully');
  };

  const handleEditAdmin = () => {
    if (!editingAdmin || !formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setAdmins(admins.map(admin =>
      admin.id === editingAdmin.id
        ? {
          ...admin,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          permissions: formData.permissions
        }
        : admin
    ));
    setEditingAdmin(null);
    resetForm();
    toast.success('Admin updated successfully');
  };

  const handleDeleteAdmin = (id: string) => {
    setAdmins(admins.filter(admin => admin.id !== id));
    toast.success('Admin deleted successfully');
  };

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: [...admin.permissions]
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'admin',
      permissions: []
    });
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permissionId]
      });
    } else {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permissionId)
      });
    }
  };

  const getRoleColor = (role: Admin['role']) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'registrar': return 'bg-green-100 text-green-800 border-green-200';
      case 'academic_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: Admin['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatLastLogin = (lastLogin: string) => {
    if (lastLogin === 'Never') return 'Never';
    return new Date(lastLogin).toLocaleDateString();
  };

  if (!selectedUniversity) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No University Selected</h3>
          <p className="text-slate-600 text-center">Please select a university from the Universities page to manage its administrators.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">University Administrators</h2>
          <p className="text-slate-600 mt-1">Manage administrators and their permissions</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Administrator
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Admins</p>
                <p className="text-2xl font-semibold text-slate-900">{admins.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Admins</p>
                <p className="text-2xl font-semibold text-green-600">
                  {admins.filter(a => a.status === 'active').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Approval</p>
                <p className="text-2xl font-semibold text-orange-600">
                  {admins.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Super Admins</p>
                <p className="text-2xl font-semibold text-red-600">
                  {admins.filter(a => a.role === 'super_admin').length}
                </p>
              </div>
              <UserCog className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search administrators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="registrar">Registrar</option>
              <option value="academic_admin">Academic Admin</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Administrators Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrator</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {admin.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{admin.name}</p>
                        <p className="text-sm text-slate-500">{admin.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(admin.role)}>
                      {admin.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(admin.status)}>
                      {admin.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {admin.permissions.slice(0, 2).map(permission => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {AVAILABLE_PERMISSIONS.find(p => p.id === permission)?.label}
                        </Badge>
                      ))}
                      {admin.permissions.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{admin.permissions.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatLastLogin(admin.lastLogin)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(admin)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={showAddModal || !!editingAdmin} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setEditingAdmin(null);
          resetForm();
        }
      }}>
        <ModalContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <div className="px-6 pt-6 pb-4 border-b border-slate-200 flex-shrink-0">
            <ModalHeader className="mb-0">
              <ModalTitle>
                {editingAdmin ? 'Edit Administrator' : 'Add New Administrator'}
              </ModalTitle>
              <ModalDescription>
                {editingAdmin ? 'Update administrator information and permissions' : 'Create a new administrator account'}
              </ModalDescription>
            </ModalHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Dr. Ahmed Hassan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., ahmed.hassan@anu.edu.eg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Admin['role'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="registrar">Registrar</option>
                  <option value="academic_admin">Academic Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Permissions
                </label>
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <div className="space-y-2">
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <label
                            htmlFor={permission.id}
                            className="text-sm font-medium text-slate-900 cursor-pointer"
                          >
                            {permission.label}
                          </label>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {permission.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-medium min-w-[24px] text-center ${formData.permissions.includes(permission.id)
                              ? 'text-green-600'
                              : 'text-slate-400'
                            }`}>
                            {formData.permissions.includes(permission.id) ? 'Yes' : 'No'}
                          </span>
                          <Switch
                            id={permission.id}
                            checked={formData.permissions.includes(permission.id)}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(permission.id, checked as boolean)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex-shrink-0">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAdmin(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingAdmin ? handleEditAdmin : handleAddAdmin}>
                {editingAdmin ? 'Update' : 'Add'} Administrator
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
