# Multi-Tenant Frontend-Backend Integration Setup & Implementation Guide

## Overview

This document provides complete setup and implementation details for the multi-tenant authentication and role-based access control system for the UniAct platform.

---

## Architecture

### Multi-Tenant Routing

The system uses **subdomain-based tenant detection** similar to Ruby on Rails Apartment gem:

```
http://localhost:5173      → SuperAdmin Context (Manage tenants)
http://anu:5173            → ANU Tenant (Students, Staff, Admins)
http://auc:5173            → AUC Tenant (Students, Staff, Admins)
```

Each tenant:
- Has its own PostgreSQL schema (e.g., `anu`, `auc`)
- Uses the same application code
- Accesses isolated data

### Authentication Flow

#### SuperAdmin Login (localhost:5173)
```
1. User navigates to http://localhost:5173
2. Clicks "Sign In" → Login Modal
3. Email: superadmin@gmail.com
4. Password: [superadmin password]
5. OTP: 123456 (dummy)
6. Backend validates via /superadmin/login
7. Token stored in localStorage
8. Redirect to Tenant Management Page (only page accessible to SuperAdmin)
```

#### Tenant User Login (anu:5173)
```
1. User navigates to http://anu:5173
2. Clicks "Sign In" → Login Modal
3. Email: any email (no restriction like @anu.edu.eg)
4. Password: [user password]
5. Role: Select (Student/Staff/Admin/Alumni)
6. OTP: 123456 (dummy)
7. Backend validates via /user/login
8. Token stored in localStorage
9. Route based on role:
   - Admin → Admin Panel (RBAC Management)
   - Student/Staff/Alumni → Dashboard
```

---

## Setup Instructions

### Prerequisites

```bash
# Required
Node.js v16+
npm v8+
PostgreSQL 12+
```

### Hosts File Configuration

Add to your Windows hosts file (`C:\Windows\System32\drivers\etc\hosts`):

```
127.0.0.1       localhost
127.0.0.1       anu
127.0.0.1       auc
127.0.0.1       uniact.local
```

### Backend Setup

```bash
cd web-backend

# Install dependencies
npm install

# Make sure .env file exist with correct DB credentials

# Configure database connection
# DATABASE_URL=postgresql://user:password@localhost:5432/uniact

# Run migrations
npm run migrate

# Seed dummy data (optional)
npm run seed

# Start development server
npm run dev
# Server runs on http://localhost:3000
```

### Frontend Setup

```bash
cd web-frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Server runs on http://localhost:5173
# Also accessible from http://anu:5173 and http://auc:5173
```

---

## API Endpoints Used

### Authentication

| Method | Endpoint | Context | Body |
|--------|----------|---------|------|
| POST | `/api/superadmin/login` | SuperAdmin | `{email, password}` |
| POST | `/api/user/login` | Tenant | `{email, password}` |

### Tenant Management (SuperAdmin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenant` | List all tenants |
| POST | `/api/tenant` | Create new tenant |
| PUT | `/api/tenant/:id` | Update tenant |
| DELETE | `/api/tenant/:id` | Delete tenant |

### RBAC Management (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rbac/role` | List all roles |
| POST | `/api/rbac/role` | Create new role |
| PUT | `/api/rbac/role/:id` | Update role |
| DELETE | `/api/rbac/role/:id` | Delete role |
| GET | `/api/rbac/permission` | List all permissions |
| POST | `/api/rbac/assign-permissions` | Assign permissions to role |
| POST | `/api/rbac/assign-roles` | Assign role to user |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user` | List users |
| POST | `/api/user` | Create user (staff) |
| DELETE | `/api/user/:id` | Delete user |

---

## Frontend File Structure

```
web-frontend/src/
├── api/
│   └── client.ts              # API client with tenant awareness
├── services/
│   └── TenantDetectionService.ts  # Detects tenant from hostname
├── pages/
│   ├── HomePage.tsx           # Login page + home page
│   ├── TenantNotFoundPage.tsx  # Error page for invalid tenants
│   ├── Dashboard.tsx           # Student/Staff/Alumni dashboard
│   ├── SuperAdminPanel.tsx     # Admin panel (Tenant Management)
│   └── UniversityAdminsPage.tsx # Admin page (RBAC Management)
├── contexts/
│   └── AuthContext.tsx         # Global auth state
└── App.tsx                     # Main app with routing
```

---

## Key Components

### 1. TenantDetectionService

**File**: `src/services/TenantDetectionService.ts`

Detects current tenant from browser hostname:

```typescript
import { TenantDetectionService } from './services/TenantDetectionService';

const tenantContext = TenantDetectionService.detectTenant();

// Output for http://anu:5173:
{
  isSuperAdmin: false,
  subdomain: 'anu',
  apiBaseUrl: 'http://anu:3000',
  displayName: 'ANU'
}

// Output for http://localhost:5173:
{
  isSuperAdmin: true,
  apiBaseUrl: 'http://localhost:3000',
  displayName: 'System Administrator'
}
```

### 2. API Client

**File**: `src/api/client.ts`

All API calls go through this centralized client:

```typescript
import { apiClient } from './api/client';

// SuperAdmin login
const response = await apiClient.loginSuperAdmin('superadmin@gmail.com', 'password');

// Tenant user login
const response = await apiClient.loginStaff('user@example.com', 'password');

// Tenant management (SuperAdmin)
await apiClient.createTenant({ name: 'ANU', subdomain: 'anu', db_schema: 'anu' });
await apiClient.getTenants();

// RBAC (Admin)
await apiClient.createRole({ name: 'Editor', description: 'Can edit content' });
await apiClient.getRoles();
await apiClient.assignPermissionsToRole(roleId, ['create', 'edit']);

// Users (Admin)
await apiClient.createStaffAccount(userData, cvFile);
await apiClient.getUsers();
```

### 3. HomePage Login Modal

**File**: `src/pages/HomePage.tsx`

Handles login for both SuperAdmin and Tenant contexts:

```typescript
// Automatically detects context:
// - If localhost:5173 → SuperAdmin login only
// - If anu:5173 → Tenant user login (role selection required)

// User flow:
// 1. Email step (validates based on context)
// 2. Password step (shows role selector for tenant context)
// 3. OTP step (final verification)
// 4. Redirect based on role and context
```

### 4. App Routing

**File**: `src/App.tsx`

Routes pages based on authentication and context:

```typescript
// SuperAdmin (localhost:5173):
user.role === 'superadmin' → SuperAdminPanel (Tenant Management)

// Tenant Admin (anu:5173):
user.role === 'admin' → SuperAdminPanel (RBAC Management)

// Tenant Users (anu:5173):
user.role === 'student|faculty|alumni' → Dashboard
```

---

## Testing Scenarios

### Scenario 1: SuperAdmin Creates Tenant

**Prerequisites**:
- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:5173`
- PostgreSQL has default tenants (anu, auc)

**Steps**:
1. Navigate to `http://localhost:5173`
2. Click "Sign In"
3. Email: `superadmin@gmail.com`
4. Password: `admin123` (or set password)
5. OTP: `123456`
6. Click "Create New Tenant"
7. Fill tenant details:
   - Name: `Cairo University`
   - Subdomain: `cu`
   - DB Schema: `cu`
8. Verify tenant appears in list

### Scenario 2: Admin Creates Role and Assigns Permissions

**Prerequisites**:
- Tenant created (e.g., anu)
- Admin user created and logged in
- Backend has permissions defined

**Steps**:
1. Navigate to `http://anu:5173`
2. Click "Sign In"
3. Email: `admin@anu.edu.eg` (or registered admin)
4. Password: `password123`
5. Role: Select "Administrator"
6. OTP: `123456`
7. Should redirect to Admin Panel
8. Go to "RBAC Management" or "Roles" section
9. Create new role:
   - Name: `Editor`
   - Description: `Can edit content`
10. Assign permissions:
    - Select checkboxes for desired permissions
    - Save role
11. Create another role:
    - Name: `Viewer`
    - Assign read-only permissions
12. Verify roles appear in list

### Scenario 3: Student Logs In

**Prerequisites**:
- Tenant created (e.g., anu)
- Student user created in database
- Backend has student account with email/password

**Steps**:
1. Navigate to `http://anu:5173`
2. Click "Sign In"
3. Email: `student@anu.edu.eg` (registered student)
4. Password: `student123`
5. Role: Select "Student"
6. OTP: `123456`
7. Should redirect to Dashboard
8. Verify student sees their courses, assignments, grades

### Scenario 4: Invalid Tenant Access

**Prerequisites**:
- Browser has hosts file entries

**Steps**:
1. Navigate to `http://invalid:5173`
2. Page should show "Unfortunately Tenant not registered with us"
3. User cannot navigate to other pages
4. User can click "Go to Super Admin" to go to `http://localhost:5173`

---

## Backend Implementation Details

### TenantResolver Middleware

**File**: `web-backend/src/Middlewares/TenantResolver.ts`

Extracts tenant from request headers and switches Prisma schema:

```typescript
// Gets Host header from request
// Extracts subdomain (e.g., "anu" from "anu:3000")
// If not localhost, looks up tenant in database
// Switches Prisma client to tenant's schema
// Stores tenant info in req.tenant for use in controllers
```

### Authentication Controllers

**Files**:
- `web-backend/src/Controllers/SuperAdminController.ts` - SuperAdmin login
- `web-backend/src/Controllers/UserController.ts` - Tenant user login

Both return JSend format responses:

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["admin"],
      "permissions": ["create", "read", "update", "delete"]
    }
  }
}
```

### RBAC Implementation

**Files**:
- `web-backend/src/Controllers/RBACController.ts` - Role and permission management
- `web-backend/src/Repositories/RBACRepository.ts` - Database operations

Permissions defined in `RBACRepository.ts`:

```typescript
const availablePermissions = [
  { name: 'create_course', description: 'Create new course' },
  { name: 'edit_course', description: 'Edit existing course' },
  { name: 'delete_course', description: 'Delete course' },
  // ... more permissions
];
```

---

## Common Issues & Solutions

### Issue: Frontend can't reach backend at `anu:3000`

**Cause**: Vite proxy not configured for dynamic hosts

**Solution**: Already fixed in `vite.config.ts` with `proxy` configuration and `allowedHosts`

### Issue: "Tenant not found" error

**Cause**: Tenant doesn't exist in database for that subdomain

**Solution**: 
1. Create tenant via SuperAdmin panel
2. Or manually insert into `public.Tenant` table:
   ```sql
   INSERT INTO public."Tenant" (name, subdomain, db_schema, is_active)
   VALUES ('ANU', 'anu', 'anu', true);
   ```

### Issue: Login fails with "Invalid credentials"

**Cause**: User doesn't exist in tenant's schema

**Solution**:
1. Create user via Admin panel
2. Or manually insert into tenant schema:
   ```sql
   -- Switch to tenant schema
   CREATE SCHEMA IF NOT EXISTS anu;
   SET search_path TO anu;
   
   -- Insert user
   INSERT INTO "User" (email, password, firstName, lastName)
   VALUES ('student@anu.edu.eg', 'hashed_password', 'John', 'Doe');
   ```

### Issue: Role selection not showing for SuperAdmin

**Cause**: HomePage detecting SuperAdmin context incorrectly

**Solution**: 
- Check hosts file has `127.0.0.1 localhost`
- Clear browser cache and localStorage
- Restart frontend dev server

---

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/uniact
JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=development
```

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:3000
```

---

## Database Schema

### Public Schema (Shared)

```sql
-- Tenants table
CREATE TABLE public."Tenant" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) NOT NULL UNIQUE,
  db_schema VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SuperAdmins table
CREATE TABLE public."SuperAdmin" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tenant Schemas (Per Tenant)

Each tenant has its own schema with:

```sql
-- Users table (in tenant schema, e.g., anu schema)
CREATE TABLE anu."User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE anu."Role" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  tenant_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE anu."Permission" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permission junction table
CREATE TABLE anu."RolePermission" (
  role_id INT REFERENCES "Role"(id),
  permission_id INT REFERENCES "Permission"(id),
  PRIMARY KEY (role_id, permission_id)
);

-- User-Role junction table
CREATE TABLE anu."UserRole" (
  user_id INT REFERENCES "User"(id),
  role_id INT REFERENCES "Role"(id),
  PRIMARY KEY (user_id, role_id)
);
```

---

## Next Steps

1. **Implement Student Login** (Currently in progress)
   - Create student user table schema
   - Implement student registration
   - Add student-specific endpoints

2. **Implement Alumni Features**
   - Alumni registration
   - Alumni dashboard
   - Alumni job board

3. **Add UI Customization**
   - Apply Figma design
   - Customize colors and branding per tenant
   - Add tenant logo support

4. **Enhanced RBAC**
   - Implement permission inheritance
   - Add role hierarchies
   - Add permission-based UI element visibility

5. **Testing & QA**
   - Unit tests for API client
   - Integration tests for auth flow
   - E2E tests for multi-tenant scenarios

---

## Support & Documentation

- API Documentation: See `web-backend/README.md`
- Frontend Architecture: See `web-frontend/README.md`
- Figma Design: [Link to Figma Design]
- Database Schema: See `web-backend/prisma/schema.prisma`

---

## Quick Reference Commands

```bash
# Start both servers
# Terminal 1:
cd web-backend && npm run dev

# Terminal 2:
cd web-frontend && npm run dev

# Test SuperAdmin
# Open: http://localhost:5173

# Test ANU Tenant
# Open: http://anu:5173

# Test AUC Tenant
# Open: http://auc:5173

# View backend logs
# Check Terminal 1 output

# View frontend logs
# Open DevTools (F12) → Console tab

# Clear frontend cache
# Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
# Or run: localStorage.clear() in console
```

---

**Last Updated**: December 6, 2025
**Version**: 1.0.0
