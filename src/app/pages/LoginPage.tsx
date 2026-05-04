import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Droplets, Eye, EyeOff, Lock, Mail, AlertCircle,
  ShieldCheck, Stethoscope, FlaskConical, Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const roleInfo = {
  admin: {
    label: 'مدير النظام',
    icon: ShieldCheck,
    color: 'text-[#C62828]',
    bg: 'bg-red-50',
  },
  doctor: {
    label: 'طبيب',
    icon: Stethoscope,
    color: 'text-[#1976D2]',
    bg: 'bg-blue-50',
  },
  lab: {
    label: 'طبيب مختبر',
    icon: FlaskConical,
    color: 'text-[#388E3C]',
    bg: 'bg-green-50',
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email.trim(), password);

    if (result.success) {
      // التوجيه بناءً على الدور المُعاد من localStorage بعد الحفظ
      const saved = localStorage.getItem('bloodlink_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'admin') navigate('/admin', { replace: true });
        else if (u.role === 'doctor') navigate('/doctor', { replace: true });
        else if (u.role === 'lab') navigate('/lab', { replace: true });
      }
    } else {
      setError(result.error || 'حدث خطأ في تسجيل الدخول');
    }

    setLoading(false);
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const demoAccounts = [
    { label: 'المدير العام', email: 'admin@bloodbank.sa', password: 'Admin@2025', role: 'admin' },
    { label: 'الطبيب', email: 'ahmed@bloodbank.sa', password: 'Doctor@2025', role: 'doctor' },
    { label: 'طبيب المختبر', email: 'nora@bloodbank.sa', password: 'Lab@2025', role: 'lab' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FC] via-[#FEF2F2] to-[#F8F9FC] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-red-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-red-50 rounded-full opacity-40 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left / Brand Side */}
          <div className="hidden lg:block text-center lg:text-right">
            <div className="flex items-center gap-4 mb-8 justify-center lg:justify-start">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C62828] to-[#B71C1C] rounded-2xl flex items-center justify-center shadow-xl">
                <Droplets className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-[#1E293B]" style={{ fontSize: '22px', fontWeight: 800 }}>
                  نظام إدارة بنك الدم
                </h1>
                <p className="text-gray-500" style={{ fontSize: '14px' }}>منصة آستر الطبية المتكاملة</p>
              </div>
            </div>

            <h2 className="text-[#1E293B] mb-4" style={{ fontSize: '32px', fontWeight: 700, lineHeight: '1.4' }}>
              إدارة احترافية<br />
              <span className="text-[#C62828]">لبنك الدم</span>
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed" style={{ fontSize: '15px' }}>
              نظام متكامل يضمن سير العمليات الطبية بكفاءة عالية من خلال إدارة المتبرعين وفحوصات الدم وتتبع المخزون.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Activity, label: 'وحدات دم متاحة', value: '190', color: 'text-[#C62828]', bg: 'bg-red-50' },
                { icon: Stethoscope, label: 'كوادر طبية نشطة', value: '5', color: 'text-[#1976D2]', bg: 'bg-blue-50' },
                { icon: Droplets, label: 'متبرع مسجل', value: '10', color: 'text-[#388E3C]', bg: 'bg-green-50' },
                { icon: FlaskConical, label: 'فحوصات مكتملة', value: '3', color: 'text-[#F57C00]', bg: 'bg-orange-50' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <div className={`${s.color}`} style={{ fontSize: '20px', fontWeight: 700 }}>{s.value}</div>
                    <div className="text-gray-500" style={{ fontSize: '11px' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right / Login Form */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#B71C1C] to-[#C62828] p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Droplets className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-white" style={{ fontSize: '22px', fontWeight: 700 }}>تسجيل الدخول</h2>
              <p className="text-red-200 mt-1" style={{ fontSize: '14px' }}>نظام إدارة بنك الدم الداخلي</p>
            </div>

            <div className="p-8">
              {/* Demo Accounts */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
                <p className="text-blue-700 mb-3" style={{ fontSize: '12px', fontWeight: 700 }}>
                  🔑 حسابات تجريبية - انقر للتعبئة التلقائية:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {demoAccounts.map((acc) => {
                    const info = roleInfo[acc.role as keyof typeof roleInfo];
                    const Icon = info.icon;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => fillDemo(acc.email, acc.password)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl ${info.bg} border border-current/10 hover:opacity-80 transition-opacity`}
                      >
                        <Icon className={`w-5 h-5 ${info.color}`} />
                        <span className={`${info.color}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                          {acc.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 mb-5">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-red-600" style={{ fontSize: '13px' }}>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-[#374151] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="أدخل بريدك الإلكتروني"
                      required
                      className="w-full bg-[#F8F9FC] border border-gray-200 rounded-xl py-3.5 pr-12 pl-4 focus:outline-none focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/10 transition-all"
                      style={{ fontSize: '14px' }}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#374151] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور"
                      required
                      className="w-full bg-[#F8F9FC] border border-gray-200 rounded-xl py-3.5 pr-12 pl-12 focus:outline-none focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/10 transition-all"
                      style={{ fontSize: '14px' }}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl text-white bg-gradient-to-r from-[#B71C1C] to-[#C62828] shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 mt-2"
                  style={{ fontSize: '15px', fontWeight: 700 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      جارٍ التحقق من البيانات...
                    </span>
                  ) : (
                    'دخول النظام'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-gray-400" style={{ fontSize: '12px' }}>
                  🔒 النظام للاستخدام الداخلي فقط — لا يسمح بالتسجيل الذاتي
                </p>
                <p className="text-gray-400 mt-1" style={{ fontSize: '12px' }}>
                  لإنشاء حساب جديد يُرجى التواصل مع المدير العام
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}