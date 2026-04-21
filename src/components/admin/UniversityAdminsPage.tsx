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
  Loader2,
  RefreshCcw,
  FolderKanban,
  Sparkles,
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

type PermissionGroup = {
  moduleKey: string;
  moduleLabel: string;
  actions: string[];
  rawPermissions: string[];
};

const actionOrder = ['read', 'create', 'update', 'delete', 'assign_role', 'enroll'];
const moduleAccentClasses = [
  'border-blue-200 bg-blue-50/80',
  'border-emerald-200 bg-emerald-50/80',
  'border-violet-200 bg-violet-50/80',
  'border-amber-200 bg-amber-50/80',
  'border-cyan-200 bg-cyan-50/80',
  'border-rose-200 bg-rose-50/80',
];

function formatModuleLabel(moduleName: string): string {
  return moduleName
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatActionLabel(actionName: string): string {
  if (actionName === 'assign_role') return 'assign role';

  return actionName
    .split(/[-_]/)
    .filter(Boolean)
    .join(' ');
}

function comparePermissionActions(left: string, right: string): number {
  const leftIndex = actionOrder.indexOf(left);
  const rightIndex = actionOrder.indexOf(right);

  if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right);
  if (leftIndex === -1) return 1;
  if (rightIndex === -1) return -1;
  return leftIndex - rightIndex;
}

function getActionBadgeClasses(action: string): string {
  switch (action) {
    case 'read':
      return 'border-sky-200 bg-sky-100 text-sky-700';
    case 'create':
      return 'border-emerald-200 bg-emerald-100 text-emerald-700';
    case 'update':
      return 'border-amber-200 bg-amber-100 text-amber-700';
    case 'delete':
      return 'border-rose-200 bg-rose-100 text-rose-700';
    case 'assign_role':
      return 'border-violet-200 bg-violet-100 text-violet-700';
    case 'enroll':
      return 'border-indigo-200 bg-indigo-100 text-indigo-700';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-700';
  }
}

function getModuleAccentClasses(moduleKey: string): string {
  let hash = 0;
  for (let index = 0; index < moduleKey.length; index += 1) {
    hash = (hash * 31 + moduleKey.charCodeAt(index)) % moduleAccentClasses.length;
  }

  return moduleAccentClasses[hash];
}

function getModuleBadgeClasses(moduleKey: string): string {
  return `${getModuleAccentClasses(moduleKey)} text-slate-800 shadow-none`;
}

function groupPermissions(permissionNames: string[]): PermissionGroup[] {
  const groups = new Map<string, PermissionGroup>();

  permissionNames.forEach((permissionName) => {
    const [moduleName, ...actionParts] = permissionName.split('.');
    const normalizedModule = (moduleName || 'general').trim().toLowerCase();
    const normalizedAction = (actionParts.join('.') || 'access').trim().toLowerCase();

    if (!groups.has(normalizedModule)) {
      groups.set(normalizedModule, {
        moduleKey: normalizedModule,
        moduleLabel: formatModuleLabel(normalizedModule),
        actions: [],
        rawPermissions: [],
      });
    }

    const group = groups.get(normalizedModule)!;
    if (!group.actions.includes(normalizedAction)) {
      group.actions.push(normalizedAction);
    }
    group.rawPermissions.push(permissionName);
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      actions: [...group.actions].sort(comparePermissionActions),
      rawPermissions: [...group.rawPermissions].sort(),
    }))
    .sort((left, right) => left.moduleLabel.localeCompare(right.moduleLabel));
}

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

  const permissionGroups = useMemo(
    () =>
      groupPermissions(
        permissions
          .map((permission) => permission.name)
          .filter(Boolean),
      ),
    [permissions],
  );

  const groupedRoles = useMemo(
    () =>
      filteredRoles.map((role) => ({
        ...role,
        permissionGroups: groupPermissions(role.permissions ?? []),
      })),
    [filteredRoles],
  );

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

      <Card className="border-slate-200 shadow-sm">
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

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-slate-50/60">
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
            <div className="overflow-x-auto">
            <Table className="min-w-[1120px]">
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead className="w-[250px]">Role</TableHead>
                  <TableHead className="w-[280px]">Summary</TableHead>
                  <TableHead className="w-[520px]">Permissions by Module</TableHead>
                  <TableHead className="w-[160px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedRoles.length > 0 ? (
                  groupedRoles.map((role) => (
                    <TableRow key={role.id} className="align-top hover:bg-slate-50/70">
                      <TableCell className="align-top">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-sm">
                              <Shield className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 space-y-1">
                              <p className="truncate text-base font-semibold text-slate-900">{role.name}</p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                                  Role #{role.id}
                                </Badge>
                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                  {role.permissionGroups.length} module{role.permissionGroups.length === 1 ? '' : 's'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[280px] align-top">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-slate-500" />
                            <p className="text-sm font-semibold text-slate-900">Role Overview</p>
                          </div>
                          <p className="text-sm leading-6 text-slate-700">
                            {role.description || 'No description provided for this role yet.'}
                          </p>
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Permissions</p>
                              <p className="mt-1 text-lg font-semibold text-slate-900">
                                {(role.permissions ?? []).length}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Coverage</p>
                              <p className="mt-1 text-lg font-semibold text-slate-900">
                                {role.permissionGroups.length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        {(role.permissions ?? []).length > 0 ? (
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                                {(role.permissions ?? []).length} total
                              </Badge>
                              <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
                                {role.permissionGroups.length} modules
                              </Badge>
                            </div>
                            <div className="grid gap-2 lg:grid-cols-2">
                              {role.permissionGroups.map((group) => (
                                <div
                                  key={`${role.id}-${group.moduleKey}`}
                                  className={`rounded-2xl border p-3 ${getModuleAccentClasses(group.moduleKey)}`}
                                >
                                  <div className="mb-2 flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-slate-700 shadow-sm">
                                      <FolderKanban className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-slate-900">
                                        {group.moduleLabel}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {group.actions.length} action{group.actions.length === 1 ? '' : 's'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-1.5">
                                    {group.actions.map((action) => (
                                      <Badge
                                        key={`${group.moduleKey}-${action}`}
                                        variant="outline"
                                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${getActionBadgeClasses(action)}`}
                                      >
                                        {formatActionLabel(action)}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                            No permissions assigned
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="border-slate-200 bg-white" onClick={() => openEditModal(role)}>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
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
            </div>
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
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-700">Permissions</p>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                  {form.permissions.length} selected
                </Badge>
              </div>
              <div className="max-h-72 space-y-4 overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                {permissionGroups.map((group) => (
                  <div key={group.moduleKey} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`border px-2.5 py-1 text-xs font-semibold ${getModuleBadgeClasses(group.moduleKey)}`}>
                        {group.moduleLabel}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {group.actions.length} action{group.actions.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {group.rawPermissions.map((permissionName) => {
                        const permission = permissions.find((item) => item.name === permissionName);
                        if (!permission) return null;

                        const checked = form.permissions.includes(permission.name);
                        const actionName = permission.name.split('.').slice(1).join('.') || 'access';

                        return (
                          <label
                            key={permission.name}
                            className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm transition-colors hover:border-slate-300"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                togglePermission(permission.name, Boolean(value))
                              }
                            />
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-slate-900">{formatActionLabel(actionName)}</p>
                                <Badge
                                  variant="outline"
                                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${getActionBadgeClasses(actionName)}`}
                                >
                                  {permission.name}
                                </Badge>
                              </div>
                              <p className="text-slate-500 break-words">{permission.description || 'No description'}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
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
