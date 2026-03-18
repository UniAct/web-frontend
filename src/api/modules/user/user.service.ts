import { userApi } from './user.api';
import type {
  StaffAccountCreateInput,
  StaffAccountUpdateInput,
  StaffDirectoryEntry,
} from '../../types';

interface RawStaffRecord {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  nationalId?: string;
  staff?: {
    userId?: number;
    position?: string;
    hireDate?: string;
    salary?: string | number | null;
  };
  userId: number;
  position: string;
  hireDate?: string;
  salary?: string | number | null;
  user: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    country?: string;
    nationalId?: string;
  };
}

function parseSalary(value: string | number | null | undefined): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? undefined : numeric;
}

function mapStaffDirectoryEntry(raw: RawStaffRecord): StaffDirectoryEntry {
  const nestedUser = raw.user;
  const isCreateResponseShape = !nestedUser && !!raw.staff;

  const firstName = nestedUser?.firstName || raw.firstName || '';
  const lastName = nestedUser?.lastName || raw.lastName || '';
  const username = nestedUser?.username || raw.username || '';
  const email = nestedUser?.email || raw.email || '';
  const userId = raw.userId ?? raw.staff?.userId ?? raw.id ?? 0;
  const position = raw.position ?? raw.staff?.position ?? '';
  const hireDate = raw.hireDate ?? raw.staff?.hireDate;
  const salary = raw.salary ?? raw.staff?.salary;

  return {
    id: nestedUser?.id ?? raw.id ?? userId,
    userId,
    username,
    firstName,
    lastName,
    name: [firstName, lastName].filter(Boolean).join(' ').trim() || username || email,
    email,
    phone: nestedUser?.phone || raw.phone,
    dateOfBirth: nestedUser?.dateOfBirth || raw.dateOfBirth,
    address: nestedUser?.address || raw.address,
    city: nestedUser?.city || raw.city,
    country: nestedUser?.country || raw.country,
    nationalId: nestedUser?.nationalId || raw.nationalId,
    position: position || (isCreateResponseShape ? 'Staff' : ''),
    hireDate,
    salary: parseSalary(salary),
  };
}

export const UserService = {
  async createStaffAccount(data: StaffAccountCreateInput): Promise<StaffDirectoryEntry> {
    const res = await userApi.createStaffAccount(data);
    if (!res.data) throw new Error(res.message || 'Failed to create staff account');
    return mapStaffDirectoryEntry(res.data as unknown as RawStaffRecord);
  },

  async getStaffDirectory(): Promise<StaffDirectoryEntry[]> {
    const res = await userApi.getStaffDirectory();
    if (!res.data) throw new Error(res.message || 'Failed to fetch staff directory');
    return (res.data as unknown as RawStaffRecord[]).map(mapStaffDirectoryEntry);
  },

  async updateStaffAccount(id: number, data: StaffAccountUpdateInput): Promise<StaffDirectoryEntry> {
    const res = await userApi.updateStaffAccount(id, data);
    if (!res.data) throw new Error(res.message || 'Failed to update staff account');
    return mapStaffDirectoryEntry(res.data as unknown as RawStaffRecord);
  },

  async deleteStaffAccount(id: number): Promise<void> {
    const res = await userApi.deleteStaffAccount(id);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Failed to delete staff account');
    }
  },
};
