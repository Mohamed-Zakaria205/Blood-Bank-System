// ═══════════════════════════════════════════════════════════
// Auth API service — login / logout / token helpers
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import { ApiError } from './errors';
import type {
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,

} from '../types/auth';
import { users as MOCK_USERS } from '../data/auth.mock';

// ── Mock mode flag ─────────────────────────────────────────
// When the backend is not yet available, the app falls back to
// the hardcoded mock users so the UI remains fully usable.
// Flip this to `false` once your backend's /auth/login is live.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Mock users are centralized in src/app/data/auth.mock.ts

/**
 * Authenticate a user.
 * In mock mode: checks against MOCK_USERS above.
 * In real mode: POSTs to /auth/login.
 */
export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 500));

    const found = MOCK_USERS.find(
      (u) => u.email === credentials.email && u.password === credentials.password,
    );

    if (!found) {
      throw new ApiError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 422);
    }
    if (found.status === 'inactive') {
      throw new ApiError('هذا الحساب معطل. يرجى التواصل مع المدير', 403);
    }

    // Strip password before returning
    const { password: _, ...user } = found;
    return {
      token: `mock-jwt-${user.id}`,
      refreshToken: `mock-refresh-${user.id}-${Date.now()}`,
      user,
    };
  }

  // ── Real API call ──
  const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return data;
}

/**
 * Change the authenticated user's password.
 *
 * Mock mode: looks up the user in MOCK_USERS by ID and compares the
 * currentPassword against the stored plaintext (dev-only shortcut).
 * The User object returned by the API never carries a password field.
 *
 * Real mode: delegates validation entirely to the backend — the
 * frontend never sees or stores the password hash.
 */
export async function changePasswordApi(
  userId: string,
  payload: ChangePasswordRequest,
): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));

    const found = MOCK_USERS.find((u) => u.id === userId);
    if (!found) {
      throw new ApiError('المستخدم غير موجود', 404);
    }
    if (found.password !== payload.currentPassword) {
      throw new ApiError('كلمة المرور الحالية غير صحيحة', 422);
    }
    if (payload.newPassword.length < 6) {
      throw new ApiError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل', 422);
    }
    // Update in-memory mock so the change persists within the dev session
    found.password = payload.newPassword;
    return;
  }

  // ── Real API call — backend validates against stored hash ──
  await apiClient.post('/auth/change-password', payload);
}

/**
 * Silently refresh the access token using the stored refresh token.
 *
 * Mock mode: returns a fresh mock JWT after a short delay (simulates
 * network latency). The mock refresh token never actually expires.
 *
 * Real mode: POSTs the refresh token to /auth/refresh. The backend
 * validates the refresh token, returns a new access token (and
 * optionally rotates the refresh token for added security).
 *
 * IMPORTANT: This function uses a raw axios.post() call — NOT the
 * apiClient instance — to avoid triggering the 401 interceptor
 * recursively (the refresh endpoint itself may return a 401 if the
 * refresh token is invalid/expired).
 */
export async function refreshTokenApi(): Promise<void> {
  const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
  
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return;
  }

  // Real mode relies on HttpOnly cookies to refresh automatically
  const { default: axios } = await import('axios');
  const baseURL = import.meta.env.VITE_API_URL ?? '/api';
  await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
}

/**
 * Logout
 * Sends a request to the backend to clear the HttpOnly cookies.
 */
export async function logoutApi(): Promise<void> {
  const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
  if (USE_MOCK) return; // In mock mode, we just clear local state

  try {
    const { default: axios } = await import('axios');
    const baseURL = import.meta.env.VITE_API_URL ?? '/api';
    await axios.post(`${baseURL}/auth/logout`, {}, { withCredentials: true });
  } catch (err) {
    console.error('Logout API failed', err);
  }
}
