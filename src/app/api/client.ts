// ═══════════════════════════════════════════════════════════
// Axios client — single instance used by all API calls
// ═══════════════════════════════════════════════════════════
import axios from "axios";

const apiClient = axios.create({
  baseURL:
    (import.meta as any).env?.VITE_API_URL || "http://localhost:3000/api",
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
