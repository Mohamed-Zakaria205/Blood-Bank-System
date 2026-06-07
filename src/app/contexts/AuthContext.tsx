import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { loginApi, logoutApi, getMeApi } from '../api/auth';
import type { User, UserRole } from '../types/auth';
import { PageLoader } from '../components/shared/LoadingSkeleton';

// ── Context shape ──────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isVerifying: boolean;
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

  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Verify session with the backend on mount
    getMeApi()
      .then((currentUser) => {
        setUser(currentUser);
        localStorage.setItem(
          'bloodlink_user',
          JSON.stringify({
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
          }),
        );
      })
      .catch(() => {
        // Session invalid or expired
        setUser(null);
        localStorage.removeItem('bloodlink_user');
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, []);

  // ── Cross-tab logout synchronization ──
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bloodlink_user' && e.newValue === null) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const loggedInUser = await loginApi({ email, password });

      // Persist safe minimal UI state
      localStorage.setItem(
        'bloodlink_user',
        JSON.stringify({
          id: loggedInUser.id,
          name: loggedInUser.name,
          role: loggedInUser.role,
        }),
      );
      setUser(loggedInUser);

      return { success: true };
    } catch (err: unknown) {
      const message =
        (err instanceof Error ? err.message : null) || 'بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // 1. Call backend to clear HttpOnly cookies (fire-and-forget)
    logoutApi().catch(console.error);

    // 2. Clear UI state
    setUser(null);
    localStorage.removeItem('bloodlink_user');
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <PageLoader message="جاري التحقق من الجلسة والاتصال بالخادم..." />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isVerifying }}>
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
