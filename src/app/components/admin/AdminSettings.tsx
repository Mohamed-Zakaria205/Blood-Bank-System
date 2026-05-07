import { useState } from 'react';
import {
  Save,
  Lock,
  Building2,
  Bell,
  Shield,
  Check,
  Palette,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useChangePassword } from '../../hooks/useAuth';

export default function AdminSettings() {
  const { user } = useAuth();
  const { isDark, toggleDark } = useTheme();

  // ── Password change mutation (replaces the broken (user as any)?.password check) ─
  const changePasswordMutation = useChangePassword();

  const [activeTab, setActiveTab] = useState('system');

  // ── Settings save (facility info, notifications) ─
  const [saved, setSaved] = useState(false);

  const [sysInfo, setSysInfo] = useState({
    hospitalName: 'مستشفى بني سويف العام',
    governorate: 'بني سويف',
    phone: '082-2320000',
    email: 'info@bsgh.gov.eg',
    workingHours: '8:00 صباحاً - 4:00 مساءاً',
  });

  // ── Password form (separated from the general saved/error state) ─
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    criticalInventory: true,
    newDonor: true,
    campaignUpdate: true,
    dailyReport: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangePassword = async () => {
    setPassError('');
    setPassSuccess(false);

    // ── Client-side format validation (before hitting the network) ──
    if (!passwords.current) {
      setPassError('أدخل كلمة المرور الحالية');
      return;
    }
    if (passwords.newPass.length < 6) {
      setPassError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPassError('كلمات المرور غير متطابقة');
      return;
    }
    if (passwords.newPass === passwords.current) {
      setPassError('كلمة المرور الجديدة يجب أن تختلف عن الحالية');
      return;
    }

    // ── Server-side validation via mutation ──
    // The backend (or mock) verifies currentPassword against the stored hash.
    // The User object never carries a password field.
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      setPasswords({ current: '', newPass: '', confirm: '' });
      setPassSuccess(true);
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : undefined;
      setPassError(msg || 'فشل تغيير كلمة المرور، يرجى المحاولة مجدداً');
    }
  };

  const tabs = [
    { id: 'system', label: 'بيانات المنشأة', icon: Building2 },
    { id: 'security', label: 'الأمان', icon: Lock },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'appearance', label: 'المظهر', icon: Palette },
    { id: 'permissions', label: 'الصلاحيات', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
          الإعدادات
        </h1>
        <p className="text-gray-500" style={{ fontSize: '14px' }}>
          إدارة إعدادات النظام والمنشأة
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-right transition-all border-b border-gray-50 last:border-0 ${activeTab === t.id ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <t.icon
                  className={`w-5 h-5 ${activeTab === t.id ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: activeTab === t.id ? 700 : 500,
                  }}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'system' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-gray-900 mb-6" style={{ fontSize: '18px', fontWeight: 700 }}>
                بيانات المنشأة الصحية
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'اسم المنشأة', key: 'hospitalName', type: 'text' },
                  { label: 'المحافظة', key: 'governorate', type: 'text' },
                  { label: 'رقم الهاتف', key: 'phone', type: 'text' },
                  { label: 'البريد الإلكتروني', key: 'email', type: 'email' },
                  { label: 'ساعات العمل', key: 'workingHours', type: 'text' },
                ].map((f) => (
                  <div key={f.key} className={f.key === 'workingHours' ? 'col-span-2' : ''}>
                    <label
                      className="block text-gray-700 mb-1.5"
                      style={{ fontSize: '13px', fontWeight: 600 }}
                    >
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      value={sysInfo[f.key as keyof typeof sysInfo]}
                      onChange={(e) => setSysInfo((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white transition-all ${saved ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'}`}
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" /> تم الحفظ
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> حفظ التغييرات
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-gray-900 mb-6" style={{ fontSize: '18px', fontWeight: 700 }}>
                تغيير كلمة المرور
              </h2>
              {passError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl mb-4 flex items-start gap-2">
                  <span className="text-red-500 flex-shrink-0" style={{ fontSize: '16px' }}>
                    &#9888;
                  </span>
                  <p className="text-red-600" style={{ fontSize: '13px' }}>
                    {passError}
                  </p>
                </div>
              )}
              {passSuccess && (
                <div className="p-3 bg-green-50 border border-green-100 rounded-xl mb-4 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-green-700" style={{ fontSize: '13px', fontWeight: 600 }}>
                    تم تغيير كلمة المرور بنجاح ✔
                  </p>
                </div>
              )}

              {/* Info note: who validates the password */}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-5 flex items-start gap-2">
                <Lock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-blue-700" style={{ fontSize: '12px' }}>
                  يتم التحقق من كلمة المرور الحالية بواسطة الخادم — لا تُخزّن كلمة المرور في
                  المتصفح.
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                {[
                  { label: 'كلمة المرور الحالية', key: 'current' },
                  {
                    label: 'كلمة المرور الجديدة (لا تقل عن 6 أحرف)',
                    key: 'newPass',
                  },
                  { label: 'تأكيد كلمة المرور الجديدة', key: 'confirm' },
                ].map((f) => (
                  <div key={f.key}>
                    <label
                      className="block text-gray-700 mb-1.5"
                      style={{ fontSize: '13px', fontWeight: 600 }}
                    >
                      {f.label}
                    </label>
                    <input
                      type="password"
                      value={passwords[f.key as keyof typeof passwords]}
                      onChange={(e) => setPasswords((p) => ({ ...p, [f.key]: e.target.value }))}
                      disabled={changePasswordMutation.isPending}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 disabled:opacity-60"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                ))}
                <button
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl transition-all"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  <Lock className="w-4 h-4" />
                  {changePasswordMutation.isPending ? 'جارٍ التحقق...' : 'تحديث كلمة المرور'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-gray-900 mb-6" style={{ fontSize: '18px', fontWeight: 700 }}>
                إعدادات الإشعارات
              </h2>
              <div className="space-y-4">
                {[
                  {
                    key: 'criticalInventory',
                    label: 'تنبيه المخزون الحرج',
                    desc: 'إشعار عند انخفاض مخزون أي فصيلة لمستوى حرج',
                  },
                  {
                    key: 'newDonor',
                    label: 'متبرع جديد',
                    desc: 'إشعار عند تسجيل متبرع جديد في النظام',
                  },
                  {
                    key: 'campaignUpdate',
                    label: 'تحديثات الحملات',
                    desc: 'إشعار عند إنشاء أو تحديث حملة تبرع',
                  },
                  {
                    key: 'dailyReport',
                    label: 'التقرير اليومي',
                    desc: 'إرسال ملخص يومي بإحصاءات النظام',
                  },
                ].map((n) => (
                  <div
                    key={n.key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                        {n.label}
                      </p>
                      <p className="text-gray-500" style={{ fontSize: '12px' }}>
                        {n.desc}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifSettings((p) => ({
                          ...p,
                          [n.key]: !p[n.key as keyof typeof notifSettings],
                        }))
                      }
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notifSettings[n.key as keyof typeof notifSettings] ? 'bg-green-600' : 'bg-gray-300'}`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifSettings[n.key as keyof typeof notifSettings] ? 'right-0.5' : 'left-0.5'}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white transition-all ${saved ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'}`}
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" /> تم الحفظ
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> حفظ
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-gray-900 mb-2" style={{ fontSize: '18px', fontWeight: 700 }}>
                إعدادات المظهر
              </h2>
              <p className="text-gray-500 mb-6" style={{ fontSize: '13px' }}>
                اختر واجهة تناسب بيئة عملك
              </p>

              {/* Mode Toggle */}
              <div className="mb-6">
                <p className="text-gray-700 mb-3" style={{ fontSize: '14px', fontWeight: 600 }}>
                  وضع العرض
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  <button
                    onClick={() => {
                      if (isDark) toggleDark();
                    }}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      !isDark
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${!isDark ? 'bg-green-100' : 'bg-gray-100'}`}
                    >
                      <Sun className={`w-5 h-5 ${!isDark ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-center">
                      <p
                        className={`${!isDark ? 'text-green-700' : 'text-gray-600'}`}
                        style={{ fontSize: '13px', fontWeight: 700 }}
                      >
                        وضع النهار
                      </p>
                      <p className="text-gray-400" style={{ fontSize: '11px' }}>
                        خلفية بيضاء
                      </p>
                    </div>
                    {!isDark && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (!isDark) toggleDark();
                    }}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      isDark
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-green-100' : 'bg-gray-100'}`}
                    >
                      <Moon className={`w-5 h-5 ${isDark ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-center">
                      <p
                        className={`${isDark ? 'text-green-700' : 'text-gray-600'}`}
                        style={{ fontSize: '13px', fontWeight: 700 }}
                      >
                        وضع الليل
                      </p>
                      <p className="text-gray-400" style={{ fontSize: '11px' }}>
                        خلفية داكنة طبية
                      </p>
                    </div>
                    {isDark && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Dark mode info card */}
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl max-w-sm">
                <div className="flex items-start gap-3">
                  <Monitor className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-700" style={{ fontSize: '13px', fontWeight: 600 }}>
                      وضع الليل الطبي
                    </p>
                    <p className="text-green-600" style={{ fontSize: '12px', marginTop: '4px' }}>
                      تصميم هادئ بخلفية خضراء داكنة مريحة للعين — مثالي للاستخدام في البيئات الطبية
                      ليلاً
                    </p>
                  </div>
                </div>
              </div>

              {/* Current status indicator */}
              <div className="mt-4 flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-500' : 'bg-yellow-400'}`}
                />
                <span className="text-gray-500" style={{ fontSize: '12px' }}>
                  الوضع الحالي:{' '}
                  <span className="text-gray-700" style={{ fontWeight: 600 }}>
                    {isDark ? 'وضع الليل' : 'وضع النهار'}
                  </span>
                  &nbsp;— يتم حفظ تفضيلك تلقائياً
                </span>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-gray-900 mb-6" style={{ fontSize: '18px', fontWeight: 700 }}>
                صلاحيات الأدوار
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th
                        className="px-4 py-3 text-right text-gray-500"
                        style={{ fontSize: '12px', fontWeight: 600 }}
                      >
                        الصلاحية
                      </th>
                      <th
                        className="px-4 py-3 text-center text-gray-500"
                        style={{ fontSize: '12px', fontWeight: 600 }}
                      >
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          مدير عام
                        </span>
                      </th>
                      <th
                        className="px-4 py-3 text-center text-gray-500"
                        style={{ fontSize: '12px', fontWeight: 600 }}
                      >
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                          طبيب
                        </span>
                      </th>
                      <th
                        className="px-4 py-3 text-center text-gray-500"
                        style={{ fontSize: '12px', fontWeight: 600 }}
                      >
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                          دكتور تحاليل
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      ['عرض المتبرعين', true, true, false],
                      ['تعديل بيانات المتبرعين', true, false, false],
                      ['تسجيل متبرع جديد', false, true, false],
                      ['إنشاء حملات تبرع', false, true, false],
                      ['عرض حملات التبرع', true, true, false],
                      ['إدارة الأطباء ودكاترة التحاليل', true, false, false],
                      ['عرض مخزون الدم', true, false, false],
                      ['تحديث مخزون الدم', true, false, false],
                      ['عرض التقارير (Power BI)', true, false, false],
                      ['إدارة المواعيد', false, true, false],
                      ['عرض طلبات التحاليل', false, false, true],
                      ['إدخال نتائج التحاليل', false, false, true],
                      ['تحديد صلاحية التبرع', false, false, true],
                      ['إعدادات النظام', true, false, false],
                    ].map(([label, admin, doc, lab], i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td
                          className="px-4 py-3 text-gray-700"
                          style={{ fontSize: '13px', fontWeight: 500 }}
                        >
                          {label as string}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {admin ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {doc ? (
                            <Check className="w-5 h-5 text-blue-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {lab ? (
                            <Check className="w-5 h-5 text-purple-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
