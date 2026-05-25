// ═══════════════════════════════════════════════════════════
// Auth API service — login / logout / token helpers
// All endpoints: /Auth/... (relative to VITE_API_URL base)
// ═══════════════════════════════════════════════════════════
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
 * Authenticate a user.
 * Real mode: POST /Auth/login → { success, message, data: User }
 */
export async function loginApi(credentials: LoginRequest): Promise<User> {

  // ── Real API call ──
  // Uses raw axios (NOT apiClient) to bypass the 401 interceptor.
  // A 401 here means "wrong credentials", not "expired token".
  const { default: axios } = await import('axios');
  const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1/system';

  // Map common English backend messages → Arabic for the UI
  const ERROR_MAP: Record<string, string> = {
    'Invalid credentials.': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'Invalid credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'Account is disabled.': 'هذا الحساب معطل. يرجى التواصل مع المدير',
    'Account is locked.': 'الحساب مقفل مؤقتاً. حاول مرة أخرى لاحقاً',
    'User not found.': 'المستخدم غير موجود',
  };

  try {
    const { data: wrapper } = await axios.post<LoginResponse>(
      `${baseURL}/Auth/login`,
      credentials,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    );

    if (!wrapper.success) {
      const msg = ERROR_MAP[wrapper.message] || wrapper.message || 'فشل تسجيل الدخول';
      throw new ApiError(msg, 401);
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
 * Uses a RAW axios instance (not apiClient) intentionally — a 401 here
 * means "no session", not "token expired". We must NOT trigger the
 * refresh interceptor or it causes an infinite redirect loop on app load.
 */
export async function getMeApi(): Promise<User> {

  const { default: axios } = await import('axios');
  const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1/system';
  const { data: wrapper } = await axios.get<GetMeResponse>(
    `${baseURL}/Auth/me`,
    { withCredentials: true, headers: { 'X-Requested-With': 'XMLHttpRequest' } },
  );

  if (!wrapper.success) {
    throw new ApiError(wrapper.message || 'الجلسة غير صالحة', 401);
  }

  return wrapper.data;
}

/**
 * Silently refresh the access token using the stored refresh token cookie.
 * Real mode: POST /Auth/refresh — browser sends cookie automatically.
 *
 * IMPORTANT: Uses a raw axios call (not apiClient) to avoid triggering
 * the 401 interceptor recursively.
 */
export async function refreshTokenApi(): Promise<void> {

  const { default: axios } = await import('axios');
  const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1/system';
  const { data: wrapper } = await axios.post<RefreshResponse>(
    `${baseURL}/Auth/refresh`,
    {},
    { withCredentials: true, headers: { 'X-Requested-With': 'XMLHttpRequest' } },
  );

  if (!wrapper.success) {
    throw new ApiError(wrapper.message || 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً', 401);
  }
}

/**
 * Logout — clears the HttpOnly cookie on the backend.
 * Real mode: POST /Auth/logout
 */
export async function logoutApi(): Promise<void> {
  try {
    const { default: axios } = await import('axios');
    const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1/system';
    await axios.post(
      `${baseURL}/Auth/logout`,
      {},
      {
        withCredentials: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    );
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
