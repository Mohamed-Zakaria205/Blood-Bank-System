// ═══════════════════════════════════════════════════════════
// Auth API service — login / logout / token helpers
// All endpoints: /Auth/... (relative to VITE_API_URL base)
// ═══════════════════════════════════════════════════════════
import axios from 'axios';
import apiClient from './client';
import { ApiError } from './errors';
import type {
  LoginRequest,
  LoginResponse,
  GetMeResponse,
  RefreshResponse,
  ChangePasswordRequest,
  User,
} from '../types/auth';

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
  // Map common English backend messages → Arabic for the UI
  const ERROR_MAP: Record<string, string> = {
    'Invalid credentials.': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'Invalid credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'Account is disabled.': 'هذا الحساب معطل. يرجى التواصل مع المدير',
    'Account is locked.': 'الحساب مقفل مؤقتاً. حاول مرة أخرى لاحقاً',
    'User not found.': 'المستخدم غير موجود',
  };

  try {
    const { data: wrapper } = await rawAxios.post<LoginResponse>(
      '/Auth/login',
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!wrapper.success) {
      const msg = ERROR_MAP[wrapper.message] || sanitizeMsg(wrapper.message) || 'فشل تسجيل الدخول';
      throw new ApiError(msg, 401);
    }

    if (!wrapper.data) {
      throw new ApiError('تعذر استرداد بيانات المستخدم من الخادم', 500);
    }

    return wrapper.data;
  } catch (err) {
    // If it's already our ApiError (from the block above), rethrow
    if (err instanceof ApiError) throw err;

    // Extract message from AxiosError response body
    const responseData = (err as any)?.response?.data;
    const backendMsg =
      typeof responseData === 'string'
        ? responseData
        : responseData?.message || responseData?.Message || '';
    const arabicMsg = ERROR_MAP[backendMsg] || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    const status = (err as any)?.response?.status || 401;
    throw new ApiError(arabicMsg, status);
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

  return wrapper.data;
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
    throw new ApiError(sanitizeMsg(wrapper.message) || 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً', 401);
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
