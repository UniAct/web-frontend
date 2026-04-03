import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '../ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import {
  Plus,
  Search,
  Trash2,
  Shield,
  KeyRound,
  Loader2,
  RefreshCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { RBACService } from '../../api';
import type { Permission, Role } from '../../api';

interface UniversityAdminsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (id: string | null) => void;
}

interface RoleFormState {
  name: string;
  description: string;
  permissions: string[];
}

const emptyForm: RoleFormState = {
  name: '',
  description: '',
  permissions: [],
};

export function UniversityAdminsPage({ selectedUniversity }: UniversityAdminsPageProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleFormState>(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loadedRoles, loadedPermissions] = await Promise.all([
        RBACService.getAllRoles(),
        RBACService.getAllPermissions(),
      ]);

      setRoles(loadedRoles);
      setPermissions(loadedPermissions);
    } catch (error: any) {
      console.error('Failed to load RBAC data:', error);
      toast.error(error.message || 'Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedUniversity) return;
    void loadData();
  }, [selectedUniversity]);

  const filteredRoles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return roles;

    return roles.filter((role) => {
      const rolePermissions = role.permissions ?? [];
      return (
        role.name.toLowerCase().includes(query) ||
        (role.description ?? '').toLowerCase().includes(query) ||
        rolePermissions.some((permission) => permission.toLowerCase().includes(query))
      );
    });
  }, [roles, searchQuery]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingRole(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowRoleModal(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setForm({
      name: role.name,
      description: role.description ?? '',
      permissions: role.permissions ?? [],
    });
    setShowRoleModal(true);
  };

  const togglePermission = (permissionName: string, checked: boolean) => {
    setForm((current) => ({
      ...current,
      permissions: checked
        ? [...new Set([...current.permissions, permissionName])]
        : current.permissions.filter((item) => item !== permissionName),
    }));
  };

  const handleSaveRole = async () => {
    if (!form.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      setSaving(true);

      let savedRole: Role;
      if (editingRole) {
        savedRole = await RBACService.updateRole(editingRole.id, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        });
      } else {
        savedRole = await RBACService.createRole({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        });
      }

      if (form.permissions.length > 0) {
        await RBACService.assignPermissionsToRole(savedRole.id, form.permissions);
      }

      await loadData();
      setShowRoleModal(false);
      resetForm();
      toast.success(editingRole ? 'Role updated successfully' : 'Role created successfully');
    } catch (error: any) {
      console.error('Failed to save role:', error);
      toast.error(error.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    try {
      await RBACService.deleteRole(role.id);
      setRoles((current) => current.filter((item) => item.id !== role.id));
      toast.success(`Role "${role.name}" deleted successfully`);
    } catch (error: any) {
      console.error('Failed to delete role:', error);
      toast.error(error.message || 'Failed to delete role');
    }
  };

  if (!selectedUniversity) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="mb-4 h-12 w-12 text-slate-400" />
          <h3 className="mb-2 text-lg font-medium text-slate-900">No University Selected</h3>
          <p className="text-center text-slate-600">
            Please select a university first so we can manage its roles and permissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Roles & Permissions</h2>
          <p className="mt-1 text-slate-600">
            Create role templates and choose what each admin can do in this university.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            New Role
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Total Roles</p>
            <p className="text-2xl font-semibold text-slate-900">{roles.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Available Permissions</p>
            <p className="text-2xl font-semibold text-slate-900">{permissions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Configured Roles</p>
            <p className="text-2xl font-semibold text-slate-900">
              {roles.filter((role) => (role.permissions?.length ?? 0) > 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="Search roles or permissions..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configured Roles</CardTitle>
          <CardDescription>
            Create role templates and assign permissions so each admin can access the right tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-600">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading roles...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-slate-900">{role.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{role.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {(role.permissions ?? []).length > 0 ? (
                            (role.permissions ?? []).map((permission) => (
                              <Badge key={permission} variant="outline" className="gap-1">
                                <KeyRound className="h-3 w-3" />
                                {permission}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-slate-500">No permissions assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(role)}>
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => void handleDeleteRole(role)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-slate-500">
                      No roles matched your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        open={showRoleModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowRoleModal(false);
            resetForm();
          }
        }}
        maxWidth="max-w-[min(82vw,34rem)]"
      >
        <ModalContent className="w-full max-h-[80vh] overflow-hidden p-0 flex flex-col mx-auto">
          <ModalHeader className="px-6 pt-6">
            <ModalTitle>{editingRole ? 'Edit Role' : 'Create Role'}</ModalTitle>
            <ModalDescription>
              Create or update a role, then choose the permissions it should include.
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-6 overflow-y-auto overflow-x-hidden px-6 pb-6 min-h-0">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Role Name *</label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="e.g. Registrar"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                <Input
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Short role description"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Permissions</p>
              <div className="grid max-h-72 grid-cols-1 gap-3 overflow-y-auto overflow-x-hidden rounded-lg border p-4 lg:grid-cols-2">
                {permissions.map((permission) => {
                  const checked = form.permissions.includes(permission.name);
                  return (
                    <label
                      key={permission.name}
                      className="flex min-w-0 items-start gap-3 rounded-md border p-3 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          togglePermission(permission.name, Boolean(value))
                        }
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 break-all">{permission.name}</p>
                        <p className="text-slate-500 break-words">{permission.description || 'No description'}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false);
                  resetForm();
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={() => void handleSaveRole()} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingRole ? (
                  'Update Role'
                ) : (
                  'Create Role'
                )}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
