import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Edit, Eye, EyeOff, Lock, Save, Shield, UserRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { UserService, type CurrentUserProfile, type CurrentUserProfileUpdateInput } from '../api';
import type { User as AppUser } from '../App';

interface ProfilePageProps {
  user: AppUser;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function toDateInputValue(value?: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function buildEditableProfile(profile: CurrentUserProfile | null, user: AppUser): CurrentUserProfileUpdateInput {
  const [fallbackFirstName = '', ...fallbackLastNameParts] = user.name.split(' ');

  return {
    username: profile?.username ?? '',
    firstName: profile?.firstName ?? fallbackFirstName,
    lastName: profile?.lastName ?? fallbackLastNameParts.join(' '),
    email: profile?.email ?? user.email,
    phone: profile?.phone ?? '',
    dateOfBirth: toDateInputValue(profile?.dateOfBirth),
    address: profile?.address ?? '',
    city: profile?.city ?? '',
    country: profile?.country ?? '',
    nationalId: profile?.nationalId ?? '',
    fullname: profile?.student?.fullname ?? profile?.fullName ?? user.name,
    homePhone: profile?.student?.homePhone ?? '',
    position: profile?.staff?.position ?? '',
  };
}

function syncStoredUser(profile: CurrentUserProfile): void {
  try {
    const current = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem(
      'user',
      JSON.stringify({
        ...current,
        id: profile.id,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        student: profile.student
          ? {
            ...(current.student ?? {}),
            fullname: profile.student.fullname,
            universityStudentId: profile.student.universityStudentId,
          }
          : current.student,
      }),
    );
  } catch {
    // The next login will refresh the stored session if local storage is unavailable.
  }
}

export function ProfilePage({ user }: ProfilePageProps) {
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [profileForm, setProfileForm] = useState<CurrentUserProfileUpdateInput>(() => buildEditableProfile(null, user));
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    let isMounted = true;

    UserService.getCurrentUserProfile()
      .then((loadedProfile) => {
        if (!isMounted) return;
        setProfile(loadedProfile);
        setProfileForm(buildEditableProfile(loadedProfile, user));
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Failed to load profile';
        toast.error(message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const displayName = useMemo(() => {
    return profile?.student?.fullname || profile?.fullName || user.name;
  }, [profile, user.name]);

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  const updateProfileField = (field: keyof CurrentUserProfileUpdateInput, value: string) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);

      const payload: CurrentUserProfileUpdateInput = {
        username: profileForm.username,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone,
        dateOfBirth: profileForm.dateOfBirth,
        address: profileForm.address,
        city: profileForm.city,
        country: profileForm.country,
        nationalId: profileForm.nationalId,
      };

      if (profile?.isStudent) {
        payload.fullname = profileForm.fullname;
        payload.homePhone = profileForm.homePhone || null;
      }

      if (profile?.isStaff) {
        payload.position = profileForm.position;
      }

      const updatedProfile = await UserService.updateCurrentUserProfile(payload);
      setProfile(updatedProfile);
      setProfileForm(buildEditableProfile(updatedProfile, user));
      syncStoredUser(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    try {
      setIsChangingPassword(true);
      await UserService.changeCurrentUserPassword(passwordForm);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password changed successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const cancelEdit = () => {
    setProfileForm(buildEditableProfile(profile, user));
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account details and password.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserRound className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Personal and contact details for your account</CardDescription>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={cancelEdit} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button onClick={saveProfile} disabled={isSaving || isLoading}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)} disabled={isLoading}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-xl font-semibold text-white">
                  {initials}
                </div>
                <div>
                  <h2 className="text-lg font-medium">{displayName}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(profile?.roles ?? [user.role]).map((role) => (
                      <Badge key={role} variant="secondary">{role}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm">Username</label>
                  <Input value={profileForm.username ?? ''} onChange={(e) => updateProfileField('username', e.target.value)} disabled={!isEditing} />
                </div>
                <div>
                  <label className="text-sm">Email</label>
                  <Input type="email" value={profileForm.email ?? ''} onChange={(e) => updateProfileField('email', e.target.value)} disabled={!isEditing} />
                </div>
                <div>
                  <label className="text-sm">First Name</label>
                  <Input value={profileForm.firstName ?? ''} onChange={(e) => updateProfileField('firstName', e.target.value)} disabled={!isEditing} />
                </div>
                <div>
                  <label className="text-sm">Last Name</label>
                  <Input value={profileForm.lastName ?? ''} onChange={(e) => updateProfileField('lastName', e.target.value)} disabled={!isEditing} />
                </div>
                {profile?.isStudent && (
                  <div>
                    <label className="text-sm">Full Name</label>
                    <Input value={profileForm.fullname ?? ''} onChange={(e) => updateProfileField('fullname', e.target.value)} disabled={!isEditing} />
                  </div>
                )}
                {profile?.isStaff && (
                  <div>
                    <label className="text-sm">Position</label>
                    <Input value={profileForm.position ?? ''} onChange={(e) => updateProfileField('position', e.target.value)} disabled={!isEditing} />
                  </div>
                )}
                <div>
                  <label className="text-sm">Phone</label>
                  <Input value={profileForm.phone ?? ''} onChange={(e) => updateProfileField('phone', e.target.value)} disabled={!isEditing} />
                </div>
                {profile?.isStudent && (
                  <div>
                    <label className="text-sm">Home Phone</label>
                    <Input value={profileForm.homePhone ?? ''} onChange={(e) => updateProfileField('homePhone', e.target.value)} disabled={!isEditing} />
                  </div>
                )}
                <div>
                  <label className="text-sm">Date of Birth</label>
                  <Input type="date" value={profileForm.dateOfBirth ?? ''} onChange={(e) => updateProfileField('dateOfBirth', e.target.value)} disabled={!isEditing} />
                </div>
                <div>
                  <label className="text-sm">National ID</label>
                  <Input value={profileForm.nationalId ?? ''} onChange={(e) => updateProfileField('nationalId', e.target.value)} disabled={!isEditing} />
                </div>
                <div>
                  <label className="text-sm">City</label>
                  <Input value={profileForm.city ?? ''} onChange={(e) => updateProfileField('city', e.target.value)} disabled={!isEditing} />
                </div>
                <div>
                  <label className="text-sm">Country</label>
                  <Input value={profileForm.country ?? ''} onChange={(e) => updateProfileField('country', e.target.value)} disabled={!isEditing} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm">Address</label>
                  <Input value={profileForm.address ?? ''} onChange={(e) => updateProfileField('address', e.target.value)} disabled={!isEditing} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Academic and staff identity details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {profile?.isStudent && profile.student && (
                <>
                  <div>
                    <label className="text-sm">Student ID</label>
                    <Input value={String(profile.student.universityStudentId)} disabled />
                  </div>
                  <div>
                    <label className="text-sm">Status</label>
                    <Input value={profile.student.status} disabled />
                  </div>
                  <div>
                    <label className="text-sm">Program</label>
                    <Input value={profile.student.program.name} disabled />
                  </div>
                  <div>
                    <label className="text-sm">Level</label>
                    <Input value={String(profile.student.programLevel.level)} disabled />
                  </div>
                  <div>
                    <label className="text-sm">CGPA</label>
                    <Input value={profile.student.cgpa === null || profile.student.cgpa === undefined ? '0' : String(profile.student.cgpa)} disabled />
                  </div>
                </>
              )}

              {profile?.isStaff && profile.staff && (
                <>
                  <div>
                    <label className="text-sm">Staff ID</label>
                    <Input value={String(profile.id)} disabled />
                  </div>
                  <div>
                    <label className="text-sm">Hire Date</label>
                    <Input value={toDateInputValue(profile.staff.hireDate)} disabled />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Password
              </CardTitle>
              <CardDescription>Update the password for your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm">Current Password</label>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((current) => ({ ...current, currentPassword: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm">New Password</label>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((current) => ({ ...current, newPassword: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm">Confirm Password</label>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((current) => ({ ...current, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setShowPasswords((current) => !current)}>
                  {showPasswords ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {showPasswords ? 'Hide' : 'Show'}
                </Button>
                <Button onClick={changePassword} disabled={isChangingPassword}>
                  <Lock className="mr-2 h-4 w-4" />
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
