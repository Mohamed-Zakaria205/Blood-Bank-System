// ═══════════════════════════════════════════════════════════
// Staff (users) API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import { ApiError } from './errors';
import type {
  User,
  CreateStaffRequest,
  UpdateStaffRequest,
  ApiResponseWrapper,
} from '../types/auth';
import type { PaginatedResponse, StaffFilters } from '../types/common';

/** Fetch all staff members (excludes admins) */
export async function fetchStaff(): Promise<PaginatedResponse<User>> {
  // Delegate to fetchFilteredStaff to ensure the wrapper and role mappings are applied correctly
  return fetchFilteredStaff({ limit: 1000 });
}

/**
 * Fetch staff with filtering and pagination.
 * Real API: forwarded as query-string.
 */
export async function fetchFilteredStaff(
  filters: StaffFilters = {},
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<User>> {
  const { page = 1, limit = 10, search = '', role = '', status = '' } = filters;

  const roleMap: Record<string, string> = {
    admin: 'Admin',
    doctor: 'Doctor',
    lab: 'LabDoctor',
    inventory: 'InventoryManager',
  };

  const mappedRole = role ? roleMap[role] || role : '';

  /**
   * The backend sends a paginated response with 'items' instead of 'data'.
   * We use a dedicated interface to make this contract explicit.
   */
  interface RawStaffResponse {
    items: Array<Omit<User, 'role'> & { role: string }>;
    total: number;
    page: number;
    limit: number;
  }

  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<RawStaffResponse>>('/Staff', {
    params: { page, limit, search, role: mappedRole, status },
    signal: options?.signal,
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

  const rawItems = wrapper.data.items || [];

  const mappedData = rawItems.map((u) => ({
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

  const { data: wrapper } = await apiClient.post<ApiResponseWrapper<string>>(
    '/Staff',
    backendPayload,
  );
  if (!wrapper.success) {
    throw new ApiError(wrapper.message || 'حدث خطأ أثناء إضافة الكادر الطبي');
  }
  return wrapper.data;
}

export async function updateStaff(id: string, payload: UpdateStaffRequest): Promise<string> {
  const roleMap: Record<string, string> = {
    admin: 'Admin',
    doctor: 'Doctor',
    lab: 'LabDoctor',
    inventory: 'InventoryManager',
  };

  const backendPayload = {
    ...payload,
    role: payload.role ? roleMap[payload.role] || payload.role : undefined,
  };

  const { data: wrapper } = await apiClient.patch<ApiResponseWrapper<string>>(
    `/Staff/${id}`,
    backendPayload,
  );
  if (!wrapper.success) {
    throw new ApiError(wrapper.message || 'حدث خطأ أثناء تعديل بيانات الكادر الطبي');
  }
  return wrapper.data;
}

export async function deleteStaff(id: string): Promise<void> {
  const { data: wrapper } = await apiClient.delete<ApiResponseWrapper<null>>(`/Staff/${id}`);
  if (!wrapper.success) {
    throw new ApiError(wrapper.message || 'حدث خطأ أثناء الحذف');
  }
}
