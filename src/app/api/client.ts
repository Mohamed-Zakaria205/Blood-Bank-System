// ═══════════════════════════════════════════════════════════
// Axios client — single instance used by all API calls
// ═══════════════════════════════════════════════════════════
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { handleApiError } from './errors';

// ── Base URL resolution ──────────────────────────────────────
//
// Development  (.env  VITE_API_URL=/api)
//   All requests go to /api/* on the same origin.
//   Vite's dev proxy (vite.config.ts › server.proxy) then forwards
//   them to http://localhost:3000/api/*, keeping the browser's
//   origin at localhost:5173 and eliminating CORS pre-flights.
//
// Production  (.env.production  VITE_API_URL=https://api.bloodlink.eg/api)
//   Requests go directly to the deployed backend. The backend must
//   allow the production origin in its CORS policy.
//
// The fallback '/api' is only a safety net for misconfigured envs;
// it also routes through Vite proxy when running `vite dev`.
// ──────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000, // 15 s
  withCredentials: true, // 🍪 Required for HttpOnly cookies to be sent with requests
});

// ── Request interceptor ──────────────────────────────────────
// No need to attach Authorization header manually since the backend 
// uses HttpOnly cookies. The browser attaches them automatically
// thanks to `withCredentials: true`.
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// ═══════════════════════════════════════════════════════════
// Silent Token Refresh — Response Interceptor
// ═══════════════════════════════════════════════════════════
//
// When a request fails with 401 (expired access token), this
// interceptor:
//
//   1. Attempts to refresh the access token silently using the
//      stored refresh token (via refreshTokenApi).
//
//   2. Queues all concurrent requests that arrive during the
//      refresh so they wait instead of each triggering their own
//      refresh call (thundering-herd prevention).
//
//   3. Retries the original (and all queued) requests with the
//      new access token.
//
//   4. If the refresh itself fails (e.g., refresh token expired),
//      clears all credentials and redirects to /login.
//
// The import of refreshTokenApi is done lazily (inside the handler)
// to avoid a circular dependency: client.ts → auth.ts → client.ts.
// ═══════════════════════════════════════════════════════════

/** Tracks whether a refresh is currently in progress */
let isRefreshing = false;

/**
 * Queue of requests waiting for the refresh to complete.
 * Each entry stores resolve/reject callbacks that are called
 * once the new token is available (or if refresh fails).
 */
let failedQueue: {
  resolve: () => void;
  reject: (error: unknown) => void;
}[] = [];

/**
 * Flush the queue — either retry all with the new token
 * or reject all with the refresh error.
 */
function processQueue(error: unknown) {
  failedQueue.forEach((prom) => {
    if (!error) {
      prom.resolve();
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
}

/**
 * Force-logout: clear all stored credentials and redirect.
 * Called when the refresh token itself is invalid/expired.
 */
function forceLogout() {
  localStorage.removeItem('bloodlink_user');
  window.location.href = '/login';
}

apiClient.interceptors.response.use(
  // ── Success path — pass through ──
  (response) => response,

  // ── Error path — attempt silent refresh on 401 ──
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only intercept 401s, and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(handleApiError(error));
    }

    // ── Check if user is actually logged in (UI state) ──
    // If not logged in at all, don't try to refresh
    const storedUser = localStorage.getItem('bloodlink_user');
    if (!storedUser) {
      forceLogout();
      return Promise.reject(handleApiError(error));
    }

    // ── If a refresh is already in progress, queue this request ──
    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(handleApiError(err)));
    }

    // ── Start the refresh ──
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // The API call to /auth/refresh automatically sets the new HttpOnly cookie
      // so we don't need to manually extract or set any tokens here.
      const { refreshTokenApi } = await import('./auth');
      await refreshTokenApi();

      // Retry all queued requests (they will automatically include the new cookie)
      processQueue(null);

      // Retry the original request
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed — reject all queued requests and force logout
      processQueue(refreshError);
      forceLogout();
      return Promise.reject(handleApiError(refreshError));
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
