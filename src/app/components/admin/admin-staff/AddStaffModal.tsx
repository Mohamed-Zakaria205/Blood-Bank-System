import { useEffect, useState } from 'react';
import {
  UserPlus,
  X,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  CreditCard,
  User as UserIcon,
  Mail,
} from 'lucide-react';
import { CITIES } from '../../../constants';
import { useForm } from 'react-hook-form';
import { Form } from '../../ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { StaffRole, StaffForm } from './staffConstants';
import { roleConfig, staffSchema, initialForm } from './staffConstants';

interface AddStaffModalProps {
  onClose: () => void;
  onSubmit: (values: StaffForm) => Promise<void>;
}

export default function AddStaffModal({ onClose, onSubmit }: AddStaffModalProps) {
  const [showPass, setShowPass] = useState(false);

  const formMethods = useForm<StaffForm>({
    defaultValues: initialForm,
    mode: 'onTouched',
    resolver: zodResolver(staffSchema),
  });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = formMethods;
  const roleValue = watch('role');

  useEffect(() => {
    register('role');
  }, [register]);

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
    reset(initialForm);
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 700 }}>
              إضافة كادر طبي جديد
            </h3>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: '13px' }}>
              أدخل جميع البيانات المطلوبة
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Form {...formMethods}>
          <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
            {/* Role Selector */}
            <div>
              <label
                className="block text-gray-700 mb-2"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                نوع الحساب *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['doctor', 'lab', 'inventory'] as StaffRole[]).map((r) => {
                  const cfg = roleConfig[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setValue('role', r, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${roleValue === r ? `${cfg.borderColor} ${cfg.bgColor}` : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${roleValue === r ? cfg.bgColor : 'bg-gray-100'}`}
                      >
                        <cfg.icon
                          className={`w-5 h-5 ${roleValue === r ? cfg.color : 'text-gray-400'}`}
                        />
                      </div>
                      <div className="text-right">
                        <p
                          className={roleValue === r ? cfg.color : 'text-gray-600'}
                          style={{ fontSize: '14px', fontWeight: 700 }}
                        >
                          {cfg.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Personal Info Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="w-4 h-4 text-green-600" />
                <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 700 }}>
                  البيانات الشخصية
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    {...register('fullName')}
                    placeholder="مثال: د. أحمد محمد عبد الله"
                    className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.fullName ? 'border-red-300' : 'border-gray-200'}`}
                    style={{ fontSize: '13px' }}
                  />
                  {errors.fullName?.message && (
                    <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* National ID */}
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    <CreditCard className="w-3.5 h-3.5 inline ml-1 text-green-600" />
                    رقم الهوية الوطنية *
                  </label>
                  <input
                    type="text"
                    {...register('nationalId', {
                      setValueAs: (value) =>
                        typeof value === 'string'
                          ? value.replace(/\D/g, '').slice(0, 14)
                          : value,
                    })}
                    placeholder="14 رقماً"
                    maxLength={14}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.nationalId ? 'border-red-300' : 'border-gray-200'}`}
                    style={{ fontSize: '13px' }}
                    dir="ltr"
                  />
                  {errors.nationalId?.message && (
                    <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                      {errors.nationalId.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    <Phone className="w-3.5 h-3.5 inline ml-1 text-green-600" />
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    {...register('phone', {
                      setValueAs: (value) =>
                        typeof value === 'string'
                          ? value.replace(/\D/g, '').slice(0, 11)
                          : value,
                    })}
                    placeholder="01xxxxxxxxx"
                    maxLength={11}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
                    style={{ fontSize: '13px' }}
                    dir="ltr"
                  />
                  {errors.phone?.message && (
                    <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    <MapPin className="w-3.5 h-3.5 inline ml-1 text-green-600" />
                    العنوان *
                  </label>
                  <input
                    type="text"
                    {...register('address')}
                    placeholder="شارع، حي، رقم..."
                    className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.address ? 'border-red-300' : 'border-gray-200'}`}
                    style={{ fontSize: '13px' }}
                  />
                  {errors.address?.message && (
                    <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    المدينة
                  </label>
                  <select
                    {...register('city')}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                    style={{ fontSize: '13px' }}
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Account Info Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-green-600" />
                <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 700 }}>
                  بيانات الحساب
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="example@bloodlink.benisuef.eg"
                    className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
                    style={{ fontSize: '13px' }}
                    dir="ltr"
                  />
                  {errors.email?.message && (
                    <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    كلمة المرور *
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="6 أحرف على الأقل"
                      className={`w-full px-4 pl-10 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 ${errors.password ? 'border-red-300' : 'border-gray-200'}`}
                      style={{ fontSize: '13px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password?.message && (
                    <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-sm"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                <UserPlus className="w-4 h-4" /> إضافة الحساب
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
