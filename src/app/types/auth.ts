// ═══════════════════════════════════════════════════════════
// Auth types — Login, token, user session
// ═══════════════════════════════════════════════════════════

export type UserRole = 'admin' | 'doctor' | 'lab' | 'inventory';

/**
 * The user object returned by the backend after login.
 * NOTE: No `password` field — the backend must never send it.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  nationalId: string;
  phone: string;
  address: string;
  city: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

/**
 * Generic API response wrapper — every endpoint returns this shape.
 *   { success, message, data, errors }
 */
export interface ApiResponseWrapper<T> {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, string[]> | null;
}

/** POST /Auth/login — request body */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /Auth/login — response: data field contains User */
export type LoginResponse = ApiResponseWrapper<User>;

/** GET /Auth/me — response: data field contains User */
export type GetMeResponse = ApiResponseWrapper<User>;

/** POST /Auth/refresh — response: data field contains User */
export type RefreshResponse = ApiResponseWrapper<User>;

/**
 * POST /Auth/change-password — request body.
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * POST /staff — request body.
 * Password is required on creation; the backend hashes it.
 */
export interface CreateStaffRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  nationalId: string;
  phone: string;
  address: string;
  city: string;
}

/**
 * PATCH /staff/:id — request body.
 * Partial update: only the fields that changed need to be sent.
 * Password is excluded — use change-password flow instead.
 */
export type UpdateStaffRequest = Partial<Omit<CreateStaffRequest, 'password'>>;
