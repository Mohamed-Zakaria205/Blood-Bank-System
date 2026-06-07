// ═══════════════════════════════════════════════════════════
// LoginPage — orchestrator for the full login screen
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Droplet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getRoleDashboardPath, type LoginFormValues } from './loginConstants';
import LoginBrandPanel from './LoginBrandPanel';
import LoginForm from './LoginForm';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { isDark } = useTheme();

  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Load lockout state on mount
  useEffect(() => {
    const lockedUntil = localStorage.getItem('bloodlink_login_lockout');
    if (lockedUntil) {
      const remaining = parseInt(lockedUntil, 10) - Date.now();
      if (remaining > 0) {
        setLockoutTime(remaining);
      } else {
        localStorage.removeItem('bloodlink_login_lockout');
        localStorage.removeItem('bloodlink_login_attempts');
      }
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1000) {
            localStorage.removeItem('bloodlink_login_lockout');
            localStorage.removeItem('bloodlink_login_attempts');
            setAuthError('');
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  /* Redirect if already logged in */
  useEffect(() => {
    if (!user) return;
    navigate(getRoleDashboardPath(user.role), { replace: true });
  }, [user, navigate]);

  /* Handle login form submission */
  const handleSubmit = async (values: LoginFormValues) => {
    if (lockoutTime > 0) return;

    setAuthError('');
    setLoading(true);

    const attempts = parseInt(localStorage.getItem('bloodlink_login_attempts') || '0', 10);
    if (attempts >= 5) {
      const lockUntil = Date.now() + 60 * 1000;
      localStorage.setItem('bloodlink_login_lockout', lockUntil.toString());
      setLockoutTime(60 * 1000);
      setLoading(false);
      setAuthError('تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار دقيقة.');
      return;
    }

    const result = await login(values.email.trim(), values.password);
    setLoading(false);

    if (!result.success) {
      const newAttempts = attempts + 1;
      localStorage.setItem('bloodlink_login_attempts', newAttempts.toString());
      
      if (newAttempts >= 5) {
        const lockUntil = Date.now() + 60 * 1000;
        localStorage.setItem('bloodlink_login_lockout', lockUntil.toString());
        setLockoutTime(60 * 1000);
        setAuthError('تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار دقيقة.');
      } else {
        setAuthError(result.error || 'بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً');
      }
    } else {
      localStorage.removeItem('bloodlink_login_attempts');
      localStorage.removeItem('bloodlink_login_lockout');
    }
  };

  /* Reset error when user types */
  const handleInputChange = () => {
    setAuthError('');
  };

  return (
    <div
      className="min-h-screen flex bg-background"
      dir="rtl"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0a1914 0%, #0f1f1c 50%, #0a1914 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 50%, #f8fafc 100%)',
      }}
    >
      {/* Subtle background circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(77,158,120,0.07) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(22,163,74,0.07) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(77,158,120,0.05) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(22,163,74,0.05) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(77,158,120,0.04) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(22,163,74,0.04) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ═══ LEFT PANEL — Brand / Info ═══ */}
      <LoginBrandPanel />

      {/* ═══ RIGHT PANEL — Login Form ═══ */}
      <div className="flex-1 flex items-center justify-center p-5 lg:p-10">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md"
              style={{
                background: 'linear-gradient(135deg, #15803d, #22c55e)',
              }}
            >
              <Droplet className="w-8 h-8 text-white" />
            </div>
            <p className="text-foreground" style={{ fontSize: '26px', fontWeight: 800 }}>BloodLink</p>
            <p className="text-muted-foreground" style={{ fontSize: '13px' }}>نظام إدارة بنك الدم — بني سويف</p>
          </div>

          {/* Greeting */}
          <div className="mb-7">
            <h2
              className="text-foreground"
              style={{
                fontSize: '28px',
                fontWeight: 800,
                marginBottom: '6px',
              }}
            >
              مرحباً بك 👋
            </h2>
            <p className="text-muted-foreground" style={{ fontSize: '14px' }}>سجّل دخولك للوصول إلى لوحة التحكم</p>
          </div>

          {/* Login form */}
          <LoginForm
            authError={
              lockoutTime > 0
                ? `تم قفل الدخول مؤقتاً. يرجى الانتظار ${Math.ceil(lockoutTime / 1000)} ثانية.`
                : authError
            }
            loading={loading || lockoutTime > 0}
            onSubmit={handleSubmit}
            onInputChange={handleInputChange}
          />

          {/* Footer note */}
          <div
            className="mt-6 p-4 rounded-xl border border-border text-center bg-card/80"
          >
            <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
              🔒 النظام للاستخدام الداخلي فقط — لا يسمح بالتسجيل الذاتي
            </p>
            <p className="text-muted-foreground" style={{ fontSize: '12px', marginTop: '3px' }}>
              لإنشاء حساب جديد يُرجى التواصل مع المدير العام
            </p>
          </div>

          <p className="text-center mt-4 text-muted-foreground/60" style={{ fontSize: '11px' }}>
            BloodLink © 2025 — محافظة بني سويف
          </p>
        </div>
      </div>
    </div>
  );
}
