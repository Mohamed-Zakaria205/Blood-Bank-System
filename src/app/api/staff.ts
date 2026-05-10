// ═══════════════════════════════════════════════════════════
// Staff (users) API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { User, UserRole } from '../types/auth';
import type { PaginatedResponse, ApiResponse, StaffFilters } from '../types/common';
import { users as MOCK_USERS } from '../data/auth.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** Fetch all staff members (excludes admins) */
export async function fetchStaff(): Promise<PaginatedResponse<User>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    // Strip passwords before returning, and filter out admins (staff view only)
    const filtered = MOCK_USERS.filter((u) => u.role !== 'admin').map(({ password: _, ...u }) => u) as User[];
    return { data: filtered, total: filtered.length, page: 1, limit: filtered.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<User>>('/staff');
  return data;
}

/**
 * Fetch staff with filtering and pagination.
 * Mock: client-side filter + slice. Real API: forwarded as query-string.
 */
export async function fetchFilteredStaff(
  filters: StaffFilters = {},
): Promise<PaginatedResponse<User>> {
  const { page = 1, limit = 10, search = '', role = '', status = '' } = filters;

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));

    let result = MOCK_USERS.filter((u) => u.role !== 'admin').map(
      ({ password: _, ...u }) => u,
    ) as User[];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone ?? '').includes(q),
      );
    }
    if (role)   result = result.filter((u) => u.role === role);
    if (status) result = result.filter((u) => u.status === status);

    const total = result.length;
    const data  = result.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  }

  const { data } = await apiClient.get<PaginatedResponse<User>>('/staff', {
    params: { page, limit, search, role, status },
  });
  return data;
}

export async function createStaff(payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  nationalId: string;
  phone: string;
  address: string;
  city: string;
}): Promise<ApiResponse<User>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const newUser: User = {
      id: `USR-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: payload.role as UserRole,
      age: 0,
      nationalId: payload.nationalId,
      phone: payload.phone,
      address: payload.address,
      city: payload.city,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    return { data: newUser, message: 'تم إضافة الموظف بنجاح' };
  }
  const { data } = await apiClient.post<ApiResponse<User>>('/staff', payload);
  return data;
}

export async function deleteStaff(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return;
  }
  await apiClient.delete(`/staff/${id}`);
}
