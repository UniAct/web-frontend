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
  Trash2,
  Building2,
  Globe,
  TrendingUp,
  Shield,
  UserCog,
  Loader2,
  Power,
  KeyRound,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient, SuperAdminService, UniversityService } from '../../api';
import { TenantDetectionService } from '../../services/TenantDetectionService';
import type { TenantRootAdmin } from '../../api';

interface University {
  id: number;
  /** Also used as the university-name tenant identifier (must match exactly for login) */
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  established_date?: string;
  accreditation?: string;
  db_schema: string;
  is_active: boolean;
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

const UNIVERSITIES_LOAD_ERROR_TOAST_ID = 'universities-load-error';

export function UniversitiesListPage({ selectedUniversity, setSelectedUniversity }: UniversitiesListPageProps) {
  const [activeTab, setActiveTab] = useState('universities');

  // Universities state
  const [universities, setUniversities] = useState<University[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    db_schema: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    established_date: '',
    accreditation: ''
  });

  // Super Admins state
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showAddRootAdminModal, setShowAddRootAdminModal] = useState(false);
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
  const [isLoadingSuperAdmins, setIsLoadingSuperAdmins] = useState(false);
  const [rootAdmins, setRootAdmins] = useState<TenantRootAdmin[]>([]);
  const [rootAdminSearchQuery, setRootAdminSearchQuery] = useState('');
  const [rootTenantSchema, setRootTenantSchema] = useState('');
  const [isLoadingRootAdmins, setIsLoadingRootAdmins] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<TenantRootAdmin | null>(null);
  const [newRootPassword, setNewRootPassword] = useState('');

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
      const data = await UniversityService.getAll();
      TenantDetectionService.rememberTenantMappings(
        data.map((university) => ({
          name: university.name,
          tenantKey: university.db_schema,
        })),
      );
      setUniversities(data);
      const firstTenant = data[0];
      if (firstTenant && !rootTenantSchema) {
        setRootTenantSchema(firstTenant.db_schema);
        await loadRootAdmins(firstTenant.db_schema);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      const message =
        error instanceof Error ? error.message : 'Error loading universities';
      toast.error(message, { id: UNIVERSITIES_LOAD_ERROR_TOAST_ID });
    } finally {
      setIsLoadingTenants(false);
    }
  };

  const loadSuperAdmins = async () => {
    try {
      setIsLoadingSuperAdmins(true);
      const data = await SuperAdminService.getAll();
      setSuperAdmins(data.map((admin: any) => ({
        id: String(admin.id),
        username: admin.username,
        email: admin.email,
        createdAt: admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'
      })));
    } catch (error) {
      console.error('Error loading super admins:', error);
      // Don't show error toast, as it might fail if endpoint not ready
    } finally {
      setIsLoadingSuperAdmins(false);
    }
  };

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.db_schema.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAddUniversity = async () => {
    if (!formData.name || !formData.db_schema || !formData.address || !formData.phone ||
      !formData.email || !formData.website || !formData.established_date || !formData.accreditation) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoadingTenants(true);
      const createdUniversity = await UniversityService.create({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        established_date: formData.established_date,
        accreditation: formData.accreditation,
        db_schema: formData.db_schema,
      });

      TenantDetectionService.rememberTenantMapping(
        createdUniversity.name,
        createdUniversity.db_schema,
      );
      setUniversities([...universities, createdUniversity as University]);
      setShowAddModal(false);
      setFormData({ name: '', db_schema: '', address: '', phone: '', email: '', website: '', established_date: '', accreditation: '' });
      toast.success('University created successfully!');
    } catch (error: any) {
      console.error('Error adding university:', error);
      toast.error(error.message || 'Failed to add university');
    } finally {
      setIsLoadingTenants(false);
    }
  };

  const handleDeleteUniversity = async (id: number) => {
    try {
      await UniversityService.delete(id);
      setUniversities(universities.filter(uni => uni.id !== id));
      if (selectedUniversity === String(id)) {
        setSelectedUniversity(null);
        apiClient.clearTenantOverrideName();
      }
      toast.success('University deleted successfully');
    } catch (error: any) {
      console.error('Error deleting university:', error);
      toast.error(error.message || 'Failed to delete university');
    }
  };

  const handleToggleUniversityStatus = async (university: University) => {
    const activeUniversitiesCount = universities.filter((item) => item.is_active).length;

    if (university.is_active && activeUniversitiesCount === 1) {
      toast.error('You cannot deactivate the last active university.');
      return;
    }

    try {
      const updatedUniversity = university.is_active
        ? await UniversityService.deactivate(university.id)
        : await UniversityService.activate(university.id);

      setUniversities((current) =>
        current.map((item) => (item.id === updatedUniversity.id ? updatedUniversity : item)),
      );
      toast.success(
        updatedUniversity.is_active
          ? 'University activated successfully'
          : 'University deactivated successfully',
      );
    } catch (error: any) {
      console.error('Error toggling university status:', error);
      toast.error(error.message || 'Failed to change university status');
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  // Super Admin handlers
  const filteredSuperAdmins = superAdmins.filter(admin =>
    admin.username.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(adminSearchQuery.toLowerCase())
  );

  const filteredRootAdmins = rootAdmins.filter((admin) => {
    const query = rootAdminSearchQuery.toLowerCase();
    return (
      admin.username.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      `${admin.firstName} ${admin.lastName}`.toLowerCase().includes(query)
    );
  });

  const selectedRootTenant = universities.find((university) => university.db_schema === rootTenantSchema);

  const loadRootAdmins = async (schema = rootTenantSchema) => {
    if (!schema) {
      setRootAdmins([]);
      return;
    }

    try {
      setIsLoadingRootAdmins(true);
      const data = await SuperAdminService.getTenantRootAdmins(schema);
      setRootAdmins(data);
    } catch (error: any) {
      console.error('Error loading root admins:', error);
      toast.error(error.message || 'Failed to load root admins');
    } finally {
      setIsLoadingRootAdmins(false);
    }
  };

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
      const createdAdmin = await SuperAdminService.create({
        username: registerFormData.username,
        email: registerFormData.email,
        password: registerFormData.password
      });

      const newAdmin: SuperAdmin = {
        id: String(createdAdmin.id || Date.now()),
        username: createdAdmin.username,
        email: createdAdmin.email,
        createdAt: createdAdmin.created_at ? new Date(createdAdmin.created_at).toLocaleDateString() : new Date().toLocaleDateString()
      };
      setSuperAdmins([...superAdmins, newAdmin]);
      setShowAddAdminModal(false);
      setRegisterFormData({
        username: '',
        email: '',
        password: ''
      });
      toast.success('SuperAdmin registered successfully! Verification email sent.');
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
      await SuperAdminService.assignRootAccount({
        university_name: selectedUni.name,
        username: adminFormData.username,
        firstName: adminFormData.first_name,
        lastName: adminFormData.last_name,
        email: adminFormData.email,
        password: adminFormData.password,
        phone: adminFormData.phone || '',
        dateOfBirth: adminFormData.date_of_birth || '',
        address: adminFormData.address || '',
        city: adminFormData.city || '',
        country: adminFormData.country || '',
        nationalId: adminFormData.national_id || '',
      });

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
      if (selectedUni.db_schema === rootTenantSchema) {
        await loadRootAdmins(selectedUni.db_schema);
      }
    } catch (error: any) {
      console.error('Error assigning root account:', error);
      toast.error(error.message || 'Failed to create root account');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const handleDeleteSuperAdmin = async (admin: SuperAdmin) => {
    if (superAdmins.length <= 1) {
      toast.error('Cannot delete the last super admin');
      return;
    }
    try {
      await SuperAdminService.delete(admin.username);
      setSuperAdmins(superAdmins.filter((item) => item.id !== admin.id));
      toast.success('Super admin deleted successfully');
    } catch (error: any) {
      console.error('Error deleting super admin:', error);
      toast.error(error.message || 'Failed to delete super admin');
    }
  };

  const handleChangeRootTenant = async (schema: string) => {
    setRootTenantSchema(schema);
    await loadRootAdmins(schema);
  };

  const handleToggleRootAdminActive = async (admin: TenantRootAdmin) => {
    if (!rootTenantSchema) return;

    try {
      const updated = admin.isBlocked
        ? await SuperAdminService.updateTenantRootAdminStatus(rootTenantSchema, admin.id, {
          isBlocked: false,
          isVerified: true,
        })
        : await SuperAdminService.updateTenantRootAdminStatus(rootTenantSchema, admin.id, {
          isBlocked: true,
        });

      setRootAdmins((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast.success(updated.isBlocked ? 'Root admin deactivated' : 'Root admin activated');
    } catch (error: any) {
      console.error('Error changing root admin status:', error);
      toast.error(error.message || 'Failed to change root admin status');
    }
  };

  const handleResendRootVerification = async (admin: TenantRootAdmin) => {
    if (!rootTenantSchema) return;

    try {
      await SuperAdminService.resendTenantRootAdminVerification(rootTenantSchema, admin.id);
      toast.success(`Verification email sent to ${admin.email}`);
    } catch (error: any) {
      console.error('Error sending root verification:', error);
      toast.error(error.message || 'Failed to send verification email');
    }
  };

  const handleResetRootPassword = async () => {
    if (!passwordTarget || !rootTenantSchema || !newRootPassword) {
      toast.error('Please enter a new password');
      return;
    }

    try {
      setIsSubmittingAdmin(true);
      await SuperAdminService.resetTenantRootAdminPassword(
        rootTenantSchema,
        passwordTarget.id,
        newRootPassword,
      );
      toast.success(`Password changed for ${passwordTarget.username}`);
      setPasswordTarget(null);
      setNewRootPassword('');
    } catch (error: any) {
      console.error('Error resetting root password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsSubmittingAdmin(false);
    }
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
          <TabsTrigger value="rootadmins" className="gap-2">
            <UserCog className="w-4 h-4" />
            Root Admins
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
                    placeholder="Search universities by name or schema..."
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
                      <TableHead>Name / Tenant ID</TableHead>
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
                              {university.name}
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
                                onClick={() => {
                                  setSelectedUniversity(String(university.id));
                                  apiClient.setTenantOverrideName(university.name);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Select
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleUniversityStatus(university)}
                              >
                                <Power className="w-4 h-4" />
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

        {/* Root Admins Tab */}
        <TabsContent value="rootadmins" className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Tenant Root Admins</h2>
              <p className="text-slate-600 mt-1">Manage root administrators for every university tenant</p>
            </div>
            <Button variant="outline" onClick={() => setShowAddRootAdminModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Assign Root Admin
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardContent className="p-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">University Tenant</label>
                <select
                  value={rootTenantSchema}
                  onChange={(event) => handleChangeRootTenant(event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoadingTenants || universities.length === 0}
                >
                  <option value="">-- Choose a university --</option>
                  {universities.map((university) => (
                    <option key={university.id} value={university.db_schema}>
                      {university.name} ({university.db_schema})
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-slate-600">Root/Admin Accounts</p>
                  <p className="text-2xl font-semibold text-slate-900">{rootAdmins.length}</p>
                </div>
                <UserCog className="w-8 h-8 text-blue-600" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search root admins by name, username, or email..."
                  value={rootAdminSearchQuery}
                  onChange={(event) => setRootAdminSearchQuery(event.target.value)}
                  className="pl-10"
                  disabled={!rootTenantSchema}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedRootTenant ? selectedRootTenant.name : 'Select a university'}
              </CardTitle>
              <CardDescription>
                Activate, deactivate, resend verification emails, and reset passwords for tenant administrators.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingRootAdmins ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-slate-600">Loading root admins...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admin</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRootAdmins.length > 0 ? (
                      filteredRootAdmins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                <UserCog className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {admin.firstName} {admin.lastName}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {admin.username} • {admin.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {admin.roles.map((role) => (
                                <Badge key={role} variant="outline" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge className={admin.isBlocked ? getStatusColor(false) : getStatusColor(true)}>
                                {admin.isBlocked ? 'Blocked' : 'Active'}
                              </Badge>
                              <Badge variant="outline" className={admin.isVerified ? 'border-green-200 text-green-700' : 'border-amber-200 text-amber-700'}>
                                {admin.isVerified ? 'Verified' : 'Pending verification'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleRootAdminActive(admin)}
                              >
                                <Power className="mr-1 h-4 w-4" />
                                {admin.isBlocked ? 'Activate' : 'Deactivate'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResendRootVerification(admin)}
                              >
                                <Send className="mr-1 h-4 w-4" />
                                Verify Email
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPasswordTarget(admin);
                                  setNewRootPassword('');
                                }}
                              >
                                <KeyRound className="mr-1 h-4 w-4" />
                                Password
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-slate-500">
                          {rootTenantSchema ? 'No root/admin accounts found for this tenant' : 'Choose a university to view root admins'}
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
              <Button onClick={() => setShowAddAdminModal(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Register Super Admin
              </Button>
              <Button variant="outline" onClick={() => setShowAddRootAdminModal(true)} className="gap-2">
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
                              onClick={() => handleDeleteSuperAdmin(admin)}
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

      {/* Add University Modal */}
      <Modal open={showAddModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setFormData({ name: '', db_schema: '', address: '', phone: '', email: '', website: '', established_date: '', accreditation: '' });
        }
      }}>
        <ModalContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <ModalHeader>
            <ModalTitle>Add New University</ModalTitle>
            <ModalDescription>Create a new university in the system</ModalDescription>
          </ModalHeader>

          {/* Scrollable form content */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="grid grid-cols-2 gap-4 pb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  University Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Alexandria National University"
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Database Schema *
                </label>
                <Input
                  value={formData.db_schema}
                  onChange={(e) => setFormData({ ...formData, db_schema: e.target.value })}
                  placeholder="e.g., anu_schema"
                  className="text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">Unique PostgreSQL schema for tenant data isolation</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g., 123 University Street, Cairo"
                  className="text-sm"
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
                  className="text-sm"
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
                  className="text-sm"
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
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Established Date
                </label>
                <Input
                  type="date"
                  value={formData.established_date}
                  onChange={(e) => setFormData({ ...formData, established_date: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Accreditation
                </label>
                <Input
                  value={formData.accreditation}
                  onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                  placeholder="e.g., Accreditation ID or status"
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Fixed footer buttons */}
          <div className="flex justify-end gap-3 p-6 border-t bg-slate-50">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setFormData({ name: '', db_schema: '', address: '', phone: '', email: '', website: '', established_date: '', accreditation: '' });
              }}
              className="px-4"
            >
              Cancel
            </Button>
            <Button onClick={handleAddUniversity} className="px-6">Add University</Button>
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
      <Modal open={showAddRootAdminModal} onOpenChange={(open) => {
        if (!open) {
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
        }
      }}>
        <ModalContent className="max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Assign Root Admin to University</ModalTitle>
            <ModalDescription>Create the first administrator account for a university</ModalDescription>
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

      <Modal open={!!passwordTarget} onOpenChange={(open) => {
        if (!open) {
          setPasswordTarget(null);
          setNewRootPassword('');
        }
      }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Change Root Admin Password</ModalTitle>
            <ModalDescription>
              {passwordTarget
                ? `Set a new password for ${passwordTarget.username}.`
                : 'Set a new password for this root admin.'}
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Password *
              </label>
              <Input
                type="password"
                value={newRootPassword}
                onChange={(event) => setNewRootPassword(event.target.value)}
                placeholder="Enter a secure password"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setPasswordTarget(null);
                  setNewRootPassword('');
                }}
                disabled={isSubmittingAdmin}
              >
                Cancel
              </Button>
              <Button onClick={handleResetRootPassword} disabled={isSubmittingAdmin}>
                {isSubmittingAdmin ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      {/* Loading Dialog - Tenant Creation in Progress */}
      <Modal open={isLoadingTenants && showAddModal} onOpenChange={() => { }}>
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
