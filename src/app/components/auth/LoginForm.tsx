// ═══════════════════════════════════════════════════════════
// LoginForm — email / password fields + submit button
// ═══════════════════════════════════════════════════════════
import { useState } from 'react';
import {
  Droplet,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '../ui/form';
import { loginSchema, type LoginFormValues } from './loginConstants';

interface LoginFormProps {
  /** Auth error message to display (e.g. invalid credentials) */
  authError: string;
  /** Whether a login request is in-flight */
  loading: boolean;
  /** Called when the user submits valid credentials */
  onSubmit: (values: LoginFormValues) => void;
  /** Called when the user types, to clear parent-level error/role state */
  onInputChange: () => void;
}

export default function LoginForm({
  authError,
  loading,
  onSubmit,
  onInputChange,
}: LoginFormProps) {
  const [showPass, setShowPass] = useState(false);

  const formMethods = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
    resolver: zodResolver(loginSchema),
  });

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = formMethods;

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit(values);
  });

  const handleFieldChange = () => {
    onInputChange();
  };

  return (
    <>
      {/* ── Error Alert ─────────────────────────────────── */}
      {authError && (
        <div
          className="flex items-start gap-3 p-3.5 rounded-xl mb-5 border"
          style={{ background: '#fef2f2', borderColor: '#fecaca' }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
          <p style={{ fontSize: '13px', color: '#dc2626' }}>{authError}</p>
        </div>
      )}

      {/* ── Form ─────────────────────────────────────────── */}
      <Form {...formMethods}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}
            >
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
              <input
                id="email"
                type="email"
                {...register('email', {
                  onChange: () => {
                    handleFieldChange();
                    clearErrors('email');
                  },
                })}
                placeholder="example@bloodlink.benisuef.eg"
                required
                dir="ltr"
                className="w-full pr-10 pl-4 py-3.5 rounded-xl border outline-none transition-all focus:border-green-600 focus:ring-3 focus:ring-green-600/10 focus:bg-white"
                style={{
                  fontSize: '13px',
                  background: '#f9fafb',
                  borderColor: '#e5e7eb',
                  color: '#111827',
                }}
              />
            </div>
            {errors.email?.message && (
              <p style={{ fontSize: '12px', color: '#dc2626' }}>{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}
            >
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                {...register('password', {
                  onChange: () => {
                    handleFieldChange();
                    clearErrors('password');
                  },
                })}
                placeholder="••••••••"
                required
                className="w-full pr-10 pl-11 py-3.5 rounded-xl border outline-none transition-all focus:border-green-600 focus:ring-3 focus:ring-green-600/10 focus:bg-white"
                style={{
                  fontSize: '14px',
                  background: '#f9fafb',
                  borderColor: '#e5e7eb',
                  color: '#111827',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
                aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password?.message && (
              <p style={{ fontSize: '12px', color: '#dc2626' }}>{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white flex items-center justify-center gap-2.5 transition-all duration-200 mt-1"
            style={{
              fontSize: '15px',
              fontWeight: 700,
              background: loading
                ? '#9ca3af'
                : 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(22,163,74,0.28)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                جارٍ التحقق من بياناتك...
              </>
            ) : (
              <>
                <Droplet className="w-5 h-5" />
                دخول النظام
              </>
            )}
          </button>
        </form>
      </Form>
    </>
  );
}
