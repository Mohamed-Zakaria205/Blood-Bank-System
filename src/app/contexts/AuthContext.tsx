import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { loginApi } from '../api/auth';
import type { User, UserRole } from '../types/auth';

// ── Context shape ──────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('bloodlink_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { token, refreshToken, user: loggedInUser } = await loginApi({ email, password });

      // Persist tokens + user
      localStorage.setItem('bloodlink_token', token);
      if (refreshToken) {
        localStorage.setItem('bloodlink_refresh_token', refreshToken);
      }
      localStorage.setItem('bloodlink_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      return { success: true };
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('bloodlink_token');
    localStorage.removeItem('bloodlink_refresh_token');
    localStorage.removeItem('bloodlink_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export type { UserRole };
