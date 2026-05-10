// ═══════════════════════════════════════════════════════════
// Auth API service — login / logout / token helpers
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  ChangePasswordRequest,
  User,
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
      throw {
        response: {
          status: 422,
          data: { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        },
      };
    }
    if (found.status === 'inactive') {
      throw {
        response: {
          status: 403,
          data: { message: 'هذا الحساب معطل. يرجى التواصل مع المدير' },
        },
      };
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
      throw {
        response: { status: 404, data: { message: 'المستخدم غير موجود' } },
      };
    }
    if (found.password !== payload.currentPassword) {
      throw {
        response: {
          status: 422,
          data: { message: 'كلمة المرور الحالية غير صحيحة' },
        },
      };
    }
    if (payload.newPassword.length < 6) {
      throw {
        response: {
          status: 422,
          data: { message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' },
        },
      };
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
export async function refreshTokenApi(): Promise<RefreshTokenResponse> {
  const storedRefresh = localStorage.getItem('bloodlink_refresh_token');

  if (!storedRefresh) {
    throw { response: { status: 401, data: { message: 'No refresh token available' } } };
  }

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));

    // In mock mode the refresh token is always valid as long as it
    // matches the mock-refresh-USR-xxx pattern.
    if (!storedRefresh.startsWith('mock-refresh-')) {
      throw { response: { status: 401, data: { message: 'Invalid refresh token' } } };
    }

    const userNum = storedRefresh.split('-')[3]; // "001"
    const newToken = `mock-jwt-USR-${userNum}-${Date.now()}`;
    const newRefresh = `mock-refresh-USR-${userNum}-${Date.now()}`;

    return { token: newToken, refreshToken: newRefresh };
  }

  // ── Real API call ──
  // Use a bare axios import to avoid the apiClient interceptor loop.
  const { default: axios } = await import('axios');
  const baseURL = import.meta.env.VITE_API_URL ?? '/api';

  const { data } = await axios.post<RefreshTokenResponse>(
    `${baseURL}/auth/refresh`,
    { refreshToken: storedRefresh },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10_000 },
  );

  return data;
}
