import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import {
  Plus,
  Users,
  Mail,
  Phone,
  Loader2,
  UserPlus,
  Pencil,
  Trash2,
  RefreshCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { RBACService, UserService } from '../../api';
import type { Role, StaffAccountCreateInput, StaffAccountUpdateInput, StaffDirectoryEntry } from '../../api';

interface StaffManagementPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

interface StaffDraft extends StaffAccountCreateInput { }

interface StaffEditDraft extends StaffAccountUpdateInput {
  id: number;
}

const emptyDraft: StaffDraft = {
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role_names: [],
  phone: '',
  date_of_birth: '',
  address: '',
  city: '',
  country: '',
  national_id: '',
  position: '',
  hireDate: '',
  salary: undefined,
};

export function StaffManagementPage({ selectedUniversity }: StaffManagementPageProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [draft, setDraft] = useState<StaffDraft>(emptyDraft);
  const [editDraft, setEditDraft] = useState<StaffEditDraft | null>(null);
  const [staffAccounts, setStaffAccounts] = useState<StaffDirectoryEntry[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const loadStaffAccounts = async () => {
    if (!selectedUniversity) return;

    try {
      setLoading(true);
      const entries = await UserService.getStaffDirectory();
      setStaffAccounts(entries);
    } catch (error: any) {
      console.error('Failed to load staff accounts:', error);
      toast.error(error.message || 'Failed to load staff accounts');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableRoles = async () => {
    if (!selectedUniversity) return;

    try {
      setLoadingRoles(true);
      const roles = await RBACService.getAllRoles();
      setAvailableRoles(roles);
    } catch (error: any) {
      console.error('Failed to load roles:', error);
      toast.error(error.message || 'Failed to load roles');
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    void loadStaffAccounts();
    void loadAvailableRoles();
  }, [selectedUniversity]);

  const filteredAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return staffAccounts;

    return staffAccounts.filter((account) => {
      return (
        account.username.toLowerCase().includes(query) ||
        account.name.toLowerCase().includes(query) ||
        account.email.toLowerCase().includes(query) ||
        (account.position || '').toLowerCase().includes(query)
      );
    });
  }, [staffAccounts, searchQuery]);

  const stats = useMemo(() => {
    return {
      totalAccounts: staffAccounts.length,
      emailsConfigured: staffAccounts.filter((user) => !!user.email).length,
      withSalary: staffAccounts.filter((user) => typeof user.salary === 'number').length,
    };
  }, [staffAccounts]);

  const resetDraft = () => setDraft(emptyDraft);

  const openEditDialog = (entry: StaffDirectoryEntry) => {
    setEditDraft({
      id: entry.userId,
      username: entry.username,
      first_name: entry.firstName,
      last_name: entry.lastName,
      email: entry.email,
      phone: entry.phone,
      date_of_birth: entry.dateOfBirth?.slice(0, 10),
      address: entry.address,
      city: entry.city,
      country: entry.country,
      national_id: entry.nationalId,
      position: entry.position,
      hireDate: entry.hireDate?.slice(0, 10),
      salary: entry.salary ?? undefined,
      password: '',
    });
    setIsEditOpen(true);
  };

  const handleCreateStaff = async () => {
    const requiredFields: Array<keyof StaffDraft> = [
      'username',
      'first_name',
      'last_name',
      'email',
      'password',
      'phone',
      'date_of_birth',
      'address',
      'city',
      'country',
      'national_id',
      'position',
      'hireDate',
    ];

    const missing = requiredFields.some((field) => {
      const value = draft[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing) {
      toast.error('Please fill in every required field before creating the account');
      return;
    }

    if (!draft.role_names.length) {
      toast.error('Please select at least one role for this staff account');
      return;
    }

    try {
      setSaving(true);
      const createdUser = await UserService.createStaffAccount({
        ...draft,
        salary:
          draft.salary === undefined || Number.isNaN(Number(draft.salary))
            ? undefined
            : Number(draft.salary),
      });

      setStaffAccounts((current) => [createdUser, ...current]);
      setIsCreateOpen(false);
      resetDraft();
      toast.success(`Staff account "${createdUser.username}" created successfully`);
    } catch (error: any) {
      console.error('Failed to create staff account:', error);
      toast.error(error.message || 'Failed to create staff account');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!editDraft) return;

    const payload: StaffAccountUpdateInput = {
      username: editDraft.username,
      first_name: editDraft.first_name,
      last_name: editDraft.last_name,
      email: editDraft.email,
      phone: editDraft.phone,
      date_of_birth: editDraft.date_of_birth,
      address: editDraft.address,
      city: editDraft.city,
      country: editDraft.country,
      national_id: editDraft.national_id,
      position: editDraft.position,
      hireDate: editDraft.hireDate,
      salary:
        editDraft.salary === undefined || Number.isNaN(Number(editDraft.salary))
          ? undefined
          : Number(editDraft.salary),
    };

    if (editDraft.password && editDraft.password.trim()) {
      payload.password = editDraft.password;
    }

    try {
      setSaving(true);
      const updated = await UserService.updateStaffAccount(editDraft.id, payload);
      setStaffAccounts((current) =>
        current.map((account) => (account.userId === updated.userId ? updated : account)),
      );
      setIsEditOpen(false);
      setEditDraft(null);
      toast.success(`Staff account "${updated.username}" updated successfully`);
    } catch (error: any) {
      console.error('Failed to update staff account:', error);
      toast.error(error.message || 'Failed to update staff account');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (userId: number) => {
    try {
      setDeletingId(userId);
      await UserService.deleteStaffAccount(userId);
      setStaffAccounts((current) => current.filter((account) => account.userId !== userId));
      toast.success('Staff account deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete staff account:', error);
      toast.error(error.message || 'Failed to delete staff account');
    } finally {
      setDeletingId(null);
    }
  };

  if (!selectedUniversity) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="mb-4 h-12 w-12 text-slate-400" />
          <h3 className="mb-2 text-lg font-medium text-slate-900">No University Selected</h3>
          <p className="text-center text-slate-600">
            Please select a university before creating tenant staff accounts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Staff Accounts</h2>
          <p className="mt-1 text-slate-600">Create, search, edit, and delete tenant staff accounts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void loadStaffAccounts()} disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Staff Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Total Staff Accounts</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.totalAccounts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Emails Configured</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.emailsConfigured}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">With Salary</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.withSalary}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            Browse current staff records and quickly find accounts by name, email, or role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search by username, full name, email, or position"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : filteredAccounts.length > 0 ? (
            filteredAccounts.map((account) => (
              <div
                key={`${account.userId}-${account.email}`}
                className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-slate-900">{account.username}</span>
                    <Badge variant="outline">{account.position}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {account.email}
                    </span>
                    {account.phone ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {account.phone}
                      </span>
                    ) : null}
                    {account.firstName || account.lastName ? (
                      <span>
                        Name: {[account.firstName, account.lastName].filter(Boolean).join(' ')}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(account)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === account.userId}
                    onClick={() => void handleDeleteStaff(account.userId)}
                  >
                    {deletingId === account.userId ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-slate-500">
              No staff accounts found.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) resetDraft();
          setIsCreateOpen(open);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Staff Account</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new staff account for this university.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Username *</label>
                <Input
                  value={draft.username}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, username: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email *</label>
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">First Name *</label>
                <Input
                  value={draft.first_name}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, first_name: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Last Name *</label>
                <Input
                  value={draft.last_name}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, last_name: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password *</label>
                <Input
                  type="password"
                  value={draft.password}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Phone *</label>
                <Input
                  value={draft.phone}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Date of Birth *</label>
                <Input
                  type="date"
                  value={draft.date_of_birth}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, date_of_birth: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Hire Date *</label>
                <Input
                  type="date"
                  value={draft.hireDate}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, hireDate: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Position *</label>
                <Input
                  value={draft.position}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, position: event.target.value }))
                  }
                  placeholder="e.g. Lecturer"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Roles *</label>
                {loadingRoles ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading available roles...
                  </div>
                ) : availableRoles.length ? (
                  <div className="grid grid-cols-1 gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-2">
                    {availableRoles.map((role) => {
                      const isSelected = draft.role_names.includes(role.name);
                      return (
                        <label
                          key={role.id}
                          className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1 hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => {
                              setDraft((current) => ({
                                ...current,
                                role_names: event.target.checked
                                  ? [...current.role_names, role.name]
                                  : current.role_names.filter((name) => name !== role.name),
                              }));
                            }}
                          />
                          <div>
                            <p className="text-sm text-slate-900">{role.name}</p>
                            {role.description ? (
                              <p className="text-xs text-slate-500">{role.description}</p>
                            ) : null}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-amber-700">
                    No roles found. Create roles first from RBAC management.
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Salary</label>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.salary ?? ''}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      salary: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">National ID *</label>
                <Input
                  value={draft.national_id}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, national_id: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">City *</label>
                <Input
                  value={draft.city}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, city: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Country *</label>
                <Input
                  value={draft.country}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, country: event.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Address *</label>
                <Textarea
                  rows={3}
                  value={draft.address}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, address: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  resetDraft();
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={() => void handleCreateStaff()} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Staff Account'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) setEditDraft(null);
          setIsEditOpen(open);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Account</DialogTitle>
            <DialogDescription>Update the fields you need, then save changes.</DialogDescription>
          </DialogHeader>

          {editDraft ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                  <Input
                    value={editDraft.username || ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, username: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <Input
                    type="email"
                    value={editDraft.email || ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, email: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
                  <Input
                    value={editDraft.first_name || ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, first_name: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
                  <Input
                    value={editDraft.last_name || ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, last_name: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                  <Input
                    value={editDraft.phone || ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, phone: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Position</label>
                  <Input
                    value={editDraft.position || ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, position: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Date of Birth</label>
                  <Input
                    type="date"
                    value={editDraft.date_of_birth || ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, date_of_birth: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Hire Date</label>
                  <Input
                    type="date"
                    value={editDraft.hireDate || ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, hireDate: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Salary</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editDraft.salary ?? ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current
                          ? {
                            ...current,
                            salary: event.target.value ? Number(event.target.value) : undefined,
                          }
                          : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">New Password (optional)</label>
                  <Input
                    type="password"
                    value={editDraft.password || ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, password: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">National ID</label>
                  <Input
                    value={editDraft.national_id || ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, national_id: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
                  <Input
                    value={editDraft.city || ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, city: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Country</label>
                  <Input
                    value={editDraft.country || ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, country: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
                  <Textarea
                    rows={3}
                    value={editDraft.address || ''}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, address: event.target.value } : current,
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={() => void handleUpdateStaff()} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
