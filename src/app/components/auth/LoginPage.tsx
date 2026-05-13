// ═══════════════════════════════════════════════════════════
// LoginPage — orchestrator for the full login screen
//
// Delegates rendering to:
//   • LoginBrandPanel   — left green branding panel (desktop)
//   • DemoAccountPicker — 2×2 quick-login role grid (dev)
//   • LoginForm         — email / password / submit
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Droplet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { demoAccounts, getRoleDashboardPath, type DemoAccount, type LoginFormValues } from './loginConstants';
import LoginBrandPanel from './LoginBrandPanel';
import DemoAccountPicker from './DemoAccountPicker';
import LoginForm from './LoginForm';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<DemoAccount | null>(null);

  /* Redirect if already logged in */
  useEffect(() => {
    if (!user) return;
    navigate(getRoleDashboardPath(user.role), { replace: true });
  }, [user, navigate]);

  /* Handle demo account selection */
  const handleDemoSelect = (acc: DemoAccount) => {
    setActiveRole(acc);
    setAuthError('');
  };

  /* Handle login form submission */
  const handleSubmit = async (values: LoginFormValues) => {
    setAuthError('');
    setLoading(true);
    const result = await login(values.email.trim(), values.password);
    setLoading(false);

    if (result.success) {
      // Use the user object already set in AuthContext by login()
      // (the useEffect above will handle the redirect)
    } else {
      setAuthError(result.error || 'بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً');
    }
  };

  /* Reset parent-level state when user types */
  const handleInputChange = () => {
    setActiveRole(null);
    setAuthError('');
  };

  return (
    <div
      className="min-h-screen flex"
      dir="rtl"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 50%, #f8fafc 100%)',
      }}
    >
      {/* Subtle background circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(22,163,74,0.07) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(22,163,74,0.05) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(22,163,74,0.04) 0%, transparent 70%)',
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
            <p style={{ fontSize: '26px', fontWeight: 800, color: '#111827' }}>BloodLink</p>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>نظام إدارة بنك الدم — بني سويف</p>
          </div>

          {/* Greeting */}
          <div className="mb-7">
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#111827',
                marginBottom: '6px',
              }}
            >
              مرحباً بك 👋
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>سجّل دخولك للوصول إلى لوحة التحكم</p>
          </div>

          {/* Demo account picker (dev convenience) */}
          {import.meta.env.DEV && (
            <DemoAccountPicker
              accounts={demoAccounts}
              activeRole={activeRole}
              onSelect={handleDemoSelect}
            />
          )}

          {/* Divider */}
          {import.meta.env.DEV && (
            <div className="relative flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  whiteSpace: 'nowrap',
                }}
              >
                أو أدخل بياناتك يدوياً
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          {/* Login form */}
          <LoginForm
            authError={authError}
            loading={loading}
            onSubmit={handleSubmit}
            onInputChange={handleInputChange}
            demoAccount={activeRole}
          />

          {/* Footer note */}
          <div
            className="mt-6 p-4 rounded-xl border border-gray-100 text-center"
            style={{ background: 'rgba(255,255,255,0.8)' }}
          >
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
              🔒 النظام للاستخدام الداخلي فقط — لا يسمح بالتسجيل الذاتي
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '3px' }}>
              لإنشاء حساب جديد يُرجى التواصل مع المدير العام
            </p>
          </div>

          <p className="text-center mt-4" style={{ fontSize: '11px', color: '#d1d5db' }}>
            BloodLink © 2025 — محافظة بني سويف
          </p>
        </div>
      </div>
    </div>
  );
}
