import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '../ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  MoreHorizontal,
  Globe,
  Calendar,
  TrendingUp,
  AlertCircle,
  Shield,
  UserCog,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';

interface University {
  id: number;
  name: string;
  subdomain: string;
  db_schema: string;
  is_active: boolean;
  university_id?: number;
  created_at?: string;
  updated_at?: string;
}

interface SuperAdmin {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface UniversitiesListPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (id: string | null) => void;
}

// Mock super admins data
const mockSuperAdmins: SuperAdmin[] = [
  {
    id: '1',
    username: 'admin_master',
    email: 'master@uniact.system',
    createdAt: '2023-01-01'
  },
  {
    id: '2',
    username: 'admin_tech',
    email: 'tech.admin@uniact.system',
    createdAt: '2023-06-15'
  },
  {
    id: '3',
    username: 'admin_support',
    email: 'support@uniact.system',
    createdAt: '2023-09-20'
  }
];

export function UniversitiesListPage({ selectedUniversity, setSelectedUniversity }: UniversitiesListPageProps) {
  const [activeTab, setActiveTab] = useState('universities');

  // Universities state
  const [universities, setUniversities] = useState<University[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    db_schema: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });

  // Super Admins state
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showAddRootAdminModal, setShowAddRootAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<SuperAdmin | null>(null);
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
  const [isLoadingSuperAdmins, setIsLoadingSuperAdmins] = useState(false);
  
  // Register SuperAdmin form
  const [registerFormData, setRegisterFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  // Root Admin form
  const [adminFormData, setAdminFormData] = useState({
    university_id: '',
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    country: '',
    national_id: ''
  });

  // Load tenants and superadmins on mount
  useEffect(() => {
    loadTenants();
    loadSuperAdmins();
  }, []);

  const loadTenants = async () => {
    try {
      setIsLoadingTenants(true);
      const response = await apiClient.getTenants();
      if (response.data) {
        setUniversities(response.data);
      } else {
        toast.error('Failed to load universities');
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      toast.error('Error loading universities');
    } finally {
      setIsLoadingTenants(false);
    }
  };

  const loadSuperAdmins = async () => {
    try {
      setIsLoadingSuperAdmins(true);
      const response = await apiClient.getSuperAdmins();
      if (response.data) {
        setSuperAdmins(response.data.map((admin: any) => ({
          id: String(admin.id),
          username: admin.username,
          email: admin.email,
          createdAt: admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'
        })));
      }
    } catch (error) {
      console.error('Error loading super admins:', error);
      // Don't show error toast, as it might fail if endpoint not ready
    } finally {
      setIsLoadingSuperAdmins(false);
    }
  };

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.subdomain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAddUniversity = async () => {
    if (!formData.name || !formData.subdomain || !formData.db_schema) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoadingTenants(true);
      const response = await apiClient.createTenant({
        name: formData.name,
        subdomain: formData.subdomain,
        db_schema: formData.db_schema
      });

      if (response.status === 'success' && response.data) {
        setUniversities([...universities, response.data]);
        setShowAddModal(false);
        setFormData({ name: '', subdomain: '', db_schema: '', address: '', phone: '', email: '', website: '' });
        toast.success('University added successfully!');
      } else {
        toast.error(response.message || 'Failed to add university');
      }
    } catch (error: any) {
      console.error('Error adding university:', error);
      toast.error(error.message || 'Failed to add university');
    } finally {
      setIsLoadingTenants(false);
    }
  };

  const handleEditUniversity = () => {
    if (!editingUniversity || !formData.name || !formData.subdomain || !formData.db_schema) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUniversities(universities.map(uni =>
      uni.id === editingUniversity.id
        ? { ...uni, name: formData.name, subdomain: formData.subdomain, db_schema: formData.db_schema }
        : uni
    ));
    setEditingUniversity(null);
    setFormData({ name: '', subdomain: '', db_schema: '', address: '', phone: '', email: '', website: '' });
    toast.success('University updated successfully');
  };

  const handleDeleteUniversity = async (id: number) => {
    try {
      await apiClient.deleteTenant(id);
      setUniversities(universities.filter(uni => uni.id !== id));
      if (selectedUniversity === String(id)) {
        setSelectedUniversity(null);
      }
      toast.success('University deleted successfully');
    } catch (error: any) {
      console.error('Error deleting university:', error);
      toast.error('Failed to delete university');
    }
  };

  const openEditModal = (university: University) => {
    setEditingUniversity(university);
    setFormData({
      name: university.name,
      subdomain: university.subdomain,
      db_schema: university.db_schema,
      address: '',
      phone: '',
      email: '',
      website: ''
    });
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  // Super Admin handlers
  const filteredSuperAdmins = superAdmins.filter(admin =>
    admin.username.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(adminSearchQuery.toLowerCase())
  );

  // Register a new SuperAdmin
  const handleRegisterSuperAdmin = async () => {
    if (!registerFormData.username || !registerFormData.email || !registerFormData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerFormData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmittingAdmin(true);
      const response = await apiClient.createSuperAdmin({
        username: registerFormData.username,
        email: registerFormData.email,
        password: registerFormData.password
      });

      if (response.status === 'success') {
        // Add to local list
        const newAdmin: SuperAdmin = {
          id: Date.now().toString(),
          username: registerFormData.username,
          email: registerFormData.email,
          createdAt: new Date().toLocaleDateString()
        };
        setSuperAdmins([...superAdmins, newAdmin]);
        setShowAddAdminModal(false);
        setRegisterFormData({
          username: '',
          email: '',
          password: ''
        });
        toast.success('SuperAdmin registered successfully! Verification email sent.');
      } else {
        toast.error(response.message || 'Failed to register SuperAdmin');
      }
    } catch (error: any) {
      console.error('Error registering SuperAdmin:', error);
      toast.error(error.message || 'Failed to register SuperAdmin');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  // Assign root account to a university
  const handleAssignRootAdmin = async () => {
    if (!adminFormData.university_id || !adminFormData.username || !adminFormData.first_name || 
        !adminFormData.last_name || !adminFormData.email || !adminFormData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminFormData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Find selected university
    const selectedUni = universities.find(uni => String(uni.id) === adminFormData.university_id);
    if (!selectedUni) {
      toast.error('Please select a valid university');
      return;
    }

    try {
      setIsSubmittingAdmin(true);
      const response = await apiClient.assignRootAccount({
        university_name: selectedUni.name,
        username: adminFormData.username,
        first_name: adminFormData.first_name,
        last_name: adminFormData.last_name,
        email: adminFormData.email,
        password: adminFormData.password,
        phone: adminFormData.phone || undefined,
        date_of_birth: adminFormData.date_of_birth || undefined,
        address: adminFormData.address || undefined,
        city: adminFormData.city || undefined,
        country: adminFormData.country || undefined,
        national_id: adminFormData.national_id || undefined
      });

      if (response.status === 'success') {
        setShowAddRootAdminModal(false);
        setAdminFormData({
          university_id: '',
          username: '',
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          phone: '',
          date_of_birth: '',
          address: '',
          city: '',
          country: '',
          national_id: ''
        });
        toast.success('Root account created successfully! Verification email sent.');
      } else {
        toast.error(response.message || 'Failed to create root account');
      }
    } catch (error: any) {
      console.error('Error assigning root account:', error);
      toast.error(error.message || 'Failed to create root account');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const handleEditSuperAdmin = () => {
    if (!editingAdmin || !adminFormData.username || !adminFormData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminFormData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSuperAdmins(superAdmins.map(admin =>
      admin.id === editingAdmin.id
        ? { ...admin, username: adminFormData.username, email: adminFormData.email }
        : admin
    ));
    setEditingAdmin(null);
    setAdminFormData({
      university_id: '',
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      date_of_birth: '',
      address: '',
      city: '',
      country: '',
      national_id: ''
    });
    toast.success('Super Admin updated successfully');
  };

  const handleDeleteSuperAdmin = (id: string) => {
    if (superAdmins.length <= 1) {
      toast.error('Cannot delete the last super admin');
      return;
    }
    setSuperAdmins(superAdmins.filter(admin => admin.id !== id));
    toast.success('Super Admin deleted successfully');
  };

  const openEditAdminModal = (admin: SuperAdmin) => {
    setEditingAdmin(admin);
    setAdminFormData({
      university_id: '',
      username: admin.username,
      first_name: '',
      last_name: '',
      email: admin.email,
      password: '', // Don't pre-fill password for security
      phone: '',
      date_of_birth: '',
      address: '',
      city: '',
      country: '',
      national_id: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="universities" className="gap-2">
            <Building2 className="w-4 h-4" />
            Universities
          </TabsTrigger>
          <TabsTrigger value="superadmins" className="gap-2">
            <Shield className="w-4 h-4" />
            Super Admins
          </TabsTrigger>
        </TabsList>

        {/* Universities Tab */}
        <TabsContent value="universities" className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Universities</h2>
              <p className="text-slate-600 mt-1">Manage universities and their configurations</p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add University
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Universities</p>
                    <p className="text-2xl font-semibold text-slate-900">{universities.length}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Universities</p>
                    <p className="text-2xl font-semibold text-green-600">
                      {universities.filter(u => u.is_active).length}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
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
                    placeholder="Search universities by name or subdomain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    disabled={isLoadingTenants}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Universities Table */}
          <Card>
            <CardContent className="p-0">
              {isLoadingTenants ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <span className="ml-2 text-slate-600">Loading universities...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>University</TableHead>
                      <TableHead>Subdomain</TableHead>
                      <TableHead>Schema</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUniversities.length > 0 ? (
                      filteredUniversities.map((university) => (
                        <TableRow
                          key={university.id}
                          className={selectedUniversity === String(university.id) ? 'bg-blue-50' : ''}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{university.name}</p>
                                <p className="text-sm text-slate-500">ID: {university.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Globe className="w-4 h-4 text-slate-400" />
                              {university.subdomain}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{university.db_schema}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(university.is_active)}>
                              {university.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{university.created_at ? new Date(university.created_at).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedUniversity(String(university.id))}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Select
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(university)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUniversity(university.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          {searchQuery ? 'No universities found' : 'No universities yet. Create one to get started.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Super Admins Tab */}
        <TabsContent value="superadmins" className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Super Admins</h2>
              <p className="text-slate-600 mt-1">Manage super administrator accounts</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddAdminModal(true)} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4" />
                Register Super Admin
              </Button>
              <Button onClick={() => setShowAddRootAdminModal(true)} className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                <Plus className="w-4 h-4" />
                Assign Root Admin
              </Button>
            </div>
          </div>

          {/* Stats Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Super Admins</p>
                  <p className="text-2xl font-semibold text-slate-900">{superAdmins.length}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by username or email..."
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Super Admins Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuperAdmins.length > 0 ? (
                    filteredSuperAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <UserCog className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{admin.username}</p>
                              <p className="text-sm text-slate-500">ID: {admin.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.createdAt}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditAdminModal(admin)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSuperAdmin(admin.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                        No super admins found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit University Modal */}
      <Modal open={showAddModal || !!editingUniversity} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setEditingUniversity(null);
          setFormData({ name: '', subdomain: '', db_schema: '', address: '', phone: '', email: '', website: '' });
        }
      }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingUniversity ? 'Edit University' : 'Add New University'}
            </ModalTitle>
            <ModalDescription>
              {editingUniversity ? 'Update university information' : 'Create a new university in the system'}
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                University Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Alexandria National University"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subdomain *
              </label>
              <Input
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                placeholder="e.g., anu (will be anu:5173)"
              />
              <p className="text-xs text-slate-500 mt-1">Lowercase letters, numbers, and hyphens only</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Database Schema *
              </label>
              <Input
                value={formData.db_schema}
                onChange={(e) => setFormData({ ...formData, db_schema: e.target.value })}
                placeholder="e.g., alexandria_national_university"
              />
              <p className="text-xs text-slate-500 mt-1">Database schema for tenant data isolation</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g., 123 University Street, Cairo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g., +20 3 5921911"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g., info@university.edu.eg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Website
              </label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="e.g., https://www.university.edu.eg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUniversity(null);
                  setFormData({ name: '', subdomain: '', db_schema: '', address: '', phone: '', email: '', website: '' });
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingUniversity ? handleEditUniversity : handleAddUniversity}>
                {editingUniversity ? 'Update' : 'Add'} University
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      {/* Register Super Admin Modal */}
      <Modal open={showAddAdminModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddAdminModal(false);
          setRegisterFormData({ username: '', email: '', password: '' });
        }
      }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Register New Super Admin</ModalTitle>
            <ModalDescription>
              Create a new super administrator account for system management
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username *
              </label>
              <Input
                value={registerFormData.username}
                onChange={(e) => setRegisterFormData({ ...registerFormData, username: e.target.value })}
                placeholder="e.g., superadmin1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={registerFormData.email}
                onChange={(e) => setRegisterFormData({ ...registerFormData, email: e.target.value })}
                placeholder="e.g., admin@system.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password *
              </label>
              <Input
                type="password"
                value={registerFormData.password}
                onChange={(e) => setRegisterFormData({ ...registerFormData, password: e.target.value })}
                placeholder="Enter a secure password"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddAdminModal(false);
                  setRegisterFormData({ username: '', email: '', password: '' });
                }}
                disabled={isSubmittingAdmin}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRegisterSuperAdmin}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isSubmittingAdmin}
              >
                {isSubmittingAdmin ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Super Admin'
                )}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      {/* Assign Root Admin Modal */}
      <Modal open={showAddRootAdminModal || !!editingAdmin} onOpenChange={(open) => {
        if (!open) {
          setShowAddRootAdminModal(false);
          setEditingAdmin(null);
          setAdminFormData({
            university_id: '',
            username: '',
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            phone: '',
            date_of_birth: '',
            address: '',
            city: '',
            country: '',
            national_id: ''
          });
        }
      }}>
        <ModalContent className="max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>
              {editingAdmin ? 'Edit Root Account' : 'Assign Root Admin to University'}
            </ModalTitle>
            <ModalDescription>
              {editingAdmin ? 'Update root administrator account' : 'Create the first administrator account for a university'}
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4">
            {/* University Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select University *
              </label>
              <select
                value={adminFormData.university_id}
                onChange={(e) => setAdminFormData({ ...adminFormData, university_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose a university --</option>
                {universities.map((uni) => (
                  <option key={uni.id} value={String(uni.id)}>
                    {uni.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Details */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Account Information</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Username *
                  </label>
                  <Input
                    value={adminFormData.username}
                    onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                    placeholder="e.g., root_admin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    placeholder="e.g., admin@university.edu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password *
                  </label>
                  <Input
                    type="password"
                    value={adminFormData.password}
                    onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                    placeholder="Enter a secure password"
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    value={adminFormData.first_name}
                    onChange={(e) => setAdminFormData({ ...adminFormData, first_name: e.target.value })}
                    placeholder="e.g., Mark"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    value={adminFormData.last_name}
                    onChange={(e) => setAdminFormData({ ...adminFormData, last_name: e.target.value })}
                    placeholder="e.g., Magdy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={adminFormData.phone}
                    onChange={(e) => setAdminFormData({ ...adminFormData, phone: e.target.value })}
                    placeholder="e.g., +201234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={adminFormData.date_of_birth}
                    onChange={(e) => setAdminFormData({ ...adminFormData, date_of_birth: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    National ID
                  </label>
                  <Input
                    value={adminFormData.national_id}
                    onChange={(e) => setAdminFormData({ ...adminFormData, national_id: e.target.value })}
                    placeholder="e.g., 28503151234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <Input
                    value={adminFormData.city}
                    onChange={(e) => setAdminFormData({ ...adminFormData, city: e.target.value })}
                    placeholder="e.g., Alexandria"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Country
                  </label>
                  <Input
                    value={adminFormData.country}
                    onChange={(e) => setAdminFormData({ ...adminFormData, country: e.target.value })}
                    placeholder="e.g., Egypt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Address
                  </label>
                  <Input
                    value={adminFormData.address}
                    onChange={(e) => setAdminFormData({ ...adminFormData, address: e.target.value })}
                    placeholder="e.g., 123 University Street"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddRootAdminModal(false);
                  setEditingAdmin(null);
                  setAdminFormData({
                    university_id: '',
                    username: '',
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    phone: '',
                    date_of_birth: '',
                    address: '',
                    city: '',
                    country: '',
                    national_id: ''
                  });
                }}
                disabled={isSubmittingAdmin}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignRootAdmin}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                disabled={isSubmittingAdmin}
              >
                {isSubmittingAdmin ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Root Admin'
                )}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      {/* Loading Dialog - Tenant Creation in Progress */}
      <Modal open={isLoadingTenants && (showAddModal || !!editingUniversity)} onOpenChange={() => {}}>
        <ModalContent className="border-0 bg-transparent shadow-none max-w-sm">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">
                Creating University...
              </h3>
              <p className="text-sm text-slate-600">
                Setting up database schema and creating tables
              </p>
            </div>

            <div className="space-y-2 bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-700">Creating tenant record</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-700">Initializing database schema</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                <span className="text-sm text-slate-500">Creating tables</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              This may take a few moments...
            </p>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
