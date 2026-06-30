export interface SuperAdmin {
  id: number;
  username: string;
  email: string;
  isVerified?: boolean;
  created_at?: string;
}

export interface SuperAdminCreateInput {
  username: string;
  email: string;
  password: string;
}

export interface AssignRootAccountInput {
  university_name: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  nationalId: string;
}

export interface TenantRootAdmin {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt?: string;
  updatedAt?: string;
  roles: string[];
}
