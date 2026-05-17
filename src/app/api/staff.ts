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

  const roleMap: Record<string, string> = {
    admin: 'Admin',
    doctor: 'Doctor',
    lab: 'LabDoctor',
    inventory: 'InventoryManager',
  };

  const mappedRole = role ? roleMap[role] || role : '';

  // Use 'any' for the generic to bypass strict typing because the backend sends 'items' instead of 'data'
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<any>>('/Staff', {
    params: { page, limit, search, role: mappedRole, status }, signal: options?.signal,
  });

  if (!wrapper.success) {
    throw new ApiError(wrapper.message || 'حدث خطأ أثناء جلب بيانات فريق العمل');
  }

  const reverseRoleMap: Record<string, string> = {
    Admin: 'admin',
    Doctor: 'doctor',
    LabDoctor: 'lab',
    InventoryManager: 'inventory',
  };

  // The backend returns an array in `items`, but our frontend `PaginatedResponse` expects it in `data`
  const rawItems = wrapper.data.items || [];
  
  const mappedData = rawItems.map((u: any) => ({
    ...u,
    role: (reverseRoleMap[u.role] || u.role) as User['role'],
  }));

  return {
    data: mappedData,
    total: wrapper.data.total || 0,
    page: wrapper.data.page || 1,
    limit: wrapper.data.limit || 10,
  };
}

export async function createStaff(payload: CreateStaffRequest): Promise<string> {
  const roleMap: Record<string, string> = {
    admin: 'Admin',
    doctor: 'Doctor',
    lab: 'LabDoctor',
    inventory: 'InventoryManager',
  };

  const backendPayload = {
    ...payload,
    role: roleMap[payload.role] || payload.role,
  };

  const { data: wrapper } = await apiClient.post<ApiResponseWrapper<string>>('/Staff', backendPayload);
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
  const { data: wrapper } = await apiClient.delete<ApiResponseWrapper<any>>(`/Staff/${id}`);
  if (!wrapper.success) {
    throw new ApiError(wrapper.message || 'حدث خطأ أثناء الحذف');
  }
}
