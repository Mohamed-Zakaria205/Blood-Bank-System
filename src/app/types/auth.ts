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
  token: string;
  user: User;
}
