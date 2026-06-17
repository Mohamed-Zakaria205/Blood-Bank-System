// ═══════════════════════════════════════════════════════════
// Auth API service — login / logout / token helpers
// All endpoints: /Auth/... (relative to VITE_API_URL base)
// ═══════════════════════════════════════════════════════════
import axios from 'axios';
import apiClient from './client';
import { ApiError, handleApiError, translateErrorMessage } from './errors';
import type {
  LoginRequest,
  LoginResponse,
  GetMeResponse,
  RefreshResponse,
  ChangePasswordRequest,
  User,
  UserRole,
} from '../types/auth';

const reverseRoleMap: Record<string, UserRole> = {
  Admin: 'admin',
  Doctor: 'doctor',
  LabDoctor: 'lab',
  InventoryManager: 'inventory',
};

/**
 * Shared raw Axios instance (bypasses interceptors in client.ts)
 * Used to avoid infinite redirect loops on auth failures,
 * thundering herd refresh loops, and improper token retry loops.
 */
const rawAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1/system',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

/**
 * Basic sanitization to prevent reflecting raw input tags from the backend
 * (Defense-in-depth, as React already escapes JSX)
 */
const sanitizeMsg = (msg?: string) => {
  if (typeof msg !== 'string') return '';
  return msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

/**
 * Authenticate a user.
 * Real mode: POST /Auth/login → { success, message, data: User }
 */
export async function loginApi(credentials: LoginRequest): Promise<User> {
  try {
    const { data: wrapper } = await rawAxios.post<LoginResponse>('/Auth/login', credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!wrapper.success) {
      const msg = translateErrorMessage(wrapper.message || 'فشل تسجيل الدخول');
      throw new ApiError(msg, 401);
    }

    if (!wrapper.data) {
      throw new ApiError('تعذر استرداد بيانات المستخدم من الخادم', 500);
    }

    const user = wrapper.data;
    return {
      ...user,
      role: reverseRoleMap[user.role] || (user.role.toLowerCase() as UserRole),
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw handleApiError(err);
  }
}

/**
 * Fetch the currently authenticated user's profile.
 * Uses apiClient so that if the access token is expired, the interceptor
 * can silently refresh it using the refresh token before returning 401.
 */
export async function getMeApi(): Promise<User> {
  const { data: wrapper } = await apiClient.get<GetMeResponse>('/Auth/me');

  if (!wrapper.success) {
    throw new ApiError(sanitizeMsg(wrapper.message) || 'الجلسة غير صالحة', 401);
  }

  if (!wrapper.data) {
    throw new ApiError('تعذر استرداد بيانات المستخدم من الخادم', 500);
  }

  const user = wrapper.data;
  return {
    ...user,
    role: reverseRoleMap[user.role] || (user.role.toLowerCase() as UserRole),
  };
}

/**
 * Silently refresh the access token using the stored refresh token cookie.
 * Real mode: POST /Auth/refresh — browser sends cookie automatically.
 *
 * IMPORTANT: Uses rawAxios to avoid triggering the 401 interceptor recursively.
 */
export async function refreshTokenApi(): Promise<void> {
  const { data: wrapper } = await rawAxios.post<RefreshResponse>('/Auth/refresh', {});

  if (!wrapper.success) {
    throw new ApiError(
      sanitizeMsg(wrapper.message) || 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً',
      401,
    );
  }
}

/**
 * Logout — clears the HttpOnly cookie on the backend.
 * Real mode: POST /Auth/logout
 */
export async function logoutApi(): Promise<void> {
  try {
    await rawAxios.post('/Auth/logout', {});
  } catch (err) {
    // Swallow errors — we clear local state regardless
    console.error('Logout API failed', err);
  }
}

/**
 * Change the authenticated user's password.
 * Real mode: POST /Auth/change-password
 */
export async function changePasswordApi(
  _userId: string,
  payload: ChangePasswordRequest,
): Promise<void> {
  await apiClient.post('/Auth/change-password', payload);
}
