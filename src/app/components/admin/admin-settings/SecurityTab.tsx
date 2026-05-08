import { useState } from 'react';
import { Lock, Check } from 'lucide-react';
import { useChangePassword } from '../../../hooks/useAuth';

export default function SecurityTab() {
  const changePasswordMutation = useChangePassword();

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const handleChangePassword = async () => {
    setPassError('');
    setPassSuccess(false);

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

  const passwordFields = [
    { label: 'كلمة المرور الحالية', key: 'current' },
    { label: 'كلمة المرور الجديدة (لا تقل عن 6 أحرف)', key: 'newPass' },
    { label: 'تأكيد كلمة المرور الجديدة', key: 'confirm' },
  ] as const;

  return (
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

      {/* Info note */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-5 flex items-start gap-2">
        <Lock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-blue-700" style={{ fontSize: '12px' }}>
          يتم التحقق من كلمة المرور الحالية بواسطة الخادم — لا تُخزّن كلمة المرور في المتصفح.
        </p>
      </div>

      <div className="space-y-4 max-w-md">
        {passwordFields.map((f) => (
          <div key={f.key}>
            <label
              className="block text-gray-700 mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              {f.label}
            </label>
            <input
              type="password"
              value={passwords[f.key]}
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
  );
}
