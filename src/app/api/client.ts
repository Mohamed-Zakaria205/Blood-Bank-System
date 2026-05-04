// ═══════════════════════════════════════════════════════════
// Axios client — single instance used by all API calls
// ═══════════════════════════════════════════════════════════
import axios from "axios";

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
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000, // 15 s
});

// ── Request interceptor: attach JWT token ──────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bloodlink_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 (session expired) ─────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored credentials and force re-login
      localStorage.removeItem("bloodlink_token");
      localStorage.removeItem("bloodlink_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
