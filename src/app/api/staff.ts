// ═══════════════════════════════════════════════════════════
// Staff (users) API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import { ApiError } from './errors';
import type { User, CreateStaffRequest, UpdateStaffRequest, ApiResponseWrapper } from '../types/auth';
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
  filters: StaffFilters = {}, options?: { signal?: AbortSignal }
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
    params: { page, limit, search, role, status }, signal: options?.signal,
  });
  return data;
}

export async function createStaff(payload: CreateStaffRequest): Promise<string> {
  const { data: wrapper } = await apiClient.post<ApiResponseWrapper<string>>('/Staff', payload);
  if (!wrapper.success) {
    throw new ApiError(wrapper.message || 'حدث خطأ أثناء إضافة الكادر الطبي');
  }
  return wrapper.data;
}

/** PATCH /staff/:id — partial update (no password change via this endpoint) */
export async function updateStaff(
  id: string,
  payload: UpdateStaffRequest,
): Promise<ApiResponse<User>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    // Staff mock reads from MOCK_USERS directly (no mutable store yet)
    const user = MOCK_USERS.find((u) => u.id === id);
    if (!user) throw new ApiError('الموظف غير موجود', 404);
    const { password: _, ...safeUser } = user;
    const updated: User = { ...safeUser, ...payload } as User;
    return { data: updated, message: 'تم تحديث بيانات الموظف بنجاح' };
  }
  const { data } = await apiClient.patch<ApiResponse<User>>(`/staff/${id}`, payload);
  return data;
}

export async function deleteStaff(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return;
  }
  await apiClient.delete(`/staff/${id}`);
}
