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
  age: number;
  nationalId: string;
  phone: string;
  address: string;
  city: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

/** POST /auth/login — request body */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /auth/login — response body */
export interface LoginResponse {
  token?: string;
  refreshToken?: string;
  user: User;
}

/**
 * POST /auth/refresh — response body.
 * The backend returns a fresh access token (and optionally rotates
 * the refresh token itself for added security).
 */


/**
 * POST /auth/change-password — request body.
 * The backend validates currentPassword server-side against the stored
 * hash. The frontend never holds the plaintext password on the User object.
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
