export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  permissions?: string[];
  isVerified?: boolean;
}

export interface StaffAccountCreateInput {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role_names: string[];
  phone: string;
  date_of_birth: string;
  address: string;
  city: string;
  country: string;
  national_id: string;
  position: string;
  hireDate: string;
  salary?: number;
}

export interface StaffAccountUpdateInput {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  country?: string;
  national_id?: string;
  position?: string;
  hireDate?: string;
  salary?: number;
}

export interface StaffDirectoryEntry {
  id: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  nationalId?: string;
  position: string;
  hireDate?: string;
  salary?: number | null;
}
