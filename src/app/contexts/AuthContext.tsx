import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { loginApi, logoutApi, getMeApi } from '../api/auth';
import type { User, UserRole } from '../types/auth';
import { PageLoader } from '../components/shared/LoadingSkeleton';
import { toast } from 'sonner';

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
    // Verify session with the backend on mount.
    // If the access token is expired, the Axios interceptor in client.ts
    // will silently refresh it before this promise resolves.
    // We must NOT dispatch 'session-expired' here — that event is only
    // for when forceLogout() confirms the refresh token is truly dead.
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
        // Session truly invalid (interceptor already tried refreshing).
        // Just clear local state — forceLogout() already handled the event
        // if a refresh was attempted and failed.
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

  // ── Handle forced logout (token expired) ──
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      toast.error('انتهت جلسة الدخول، يرجى تسجيل الدخول مجدداً');
    };
    window.addEventListener('bloodlink:session-expired', handleSessionExpired);
    return () => window.removeEventListener('bloodlink:session-expired', handleSessionExpired);
  }, []);

  // ── Periodic session re-validation ──
  useEffect(() => {
    if (!user?.id) return; // Only poll if logged in

    const validateSession = async () => {
      try {
        const currentUser = await getMeApi();
        setUser((prev) => {
          // If role or name changed server-side, update client
          if (prev && (prev.role !== currentUser.role || prev.name !== currentUser.name)) {
            const newUser = { id: currentUser.id, name: currentUser.name, role: currentUser.role };
            localStorage.setItem('bloodlink_user', JSON.stringify(newUser));

            if (prev.role !== currentUser.role) {
              toast.info('تم تحديث صلاحيات حسابك. قد يتم إعادة توجيهك.');
            }
            return currentUser;
          }
          return prev;
        });
      } catch (err) {
        // Ignored. Axios interceptors handle 401s and token refreshes or forced logouts.
      }
    };

    // Re-validate every 5 minutes
    const interval = setInterval(validateSession, 5 * 60 * 1000);

    // Also re-validate on window focus
    const onFocus = () => validateSession();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [user?.id]);

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
        (err instanceof Error ? err.message : null) ||
        'بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً';
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
