import { useEffect } from 'react';
import {
  X,
  Phone,
  MapPin,
  CreditCard,
  User as UserIcon,
  Mail,
  Edit2,
} from 'lucide-react';
import { CITIES } from '../../../constants';
import { useForm } from 'react-hook-form';
import { Form } from '../../ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '../../../types/auth';
import type { StaffRole, EditStaffForm } from './staffConstants';
import { roleConfig, editStaffSchema } from './staffConstants';

interface EditStaffModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (values: EditStaffForm) => Promise<void>;
}

export default function EditStaffModal({ user, onClose, onSubmit }: EditStaffModalProps) {
  const formMethods = useForm<EditStaffForm>({
    defaultValues: {
      fullName: user.name,
      nationalId: user.nationalId,
      phone: user.phone,
      address: user.address,
      city: user.city,
      email: user.email,
      role: user.role as StaffRole,
    },
    mode: 'onTouched',
    resolver: zodResolver(editStaffSchema),
  });
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = formMethods;
  const roleValue = watch('role');

  useEffect(() => {
    register('role');
  }, [register]);

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h3 className="text-foreground" style={{ fontSize: '18px', fontWeight: 700 }}>
              تعديل بيانات الكادر الطبي
            </h3>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: '13px' }}>
              تعديل تفاصيل حساب: {user.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Form {...formMethods}>
          <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
            {/* Role Selector */}
            <div>
              <label
                className="block text-foreground mb-2"
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
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${roleValue === r ? `${cfg.borderColor} ${cfg.bgColor}` : 'border-border bg-card hover:border-border'}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${roleValue === r ? cfg.bgColor : 'bg-muted'}`}
                      >
                        <cfg.icon
                          className={`w-5 h-5 ${roleValue === r ? cfg.color : 'text-muted-foreground'}`}
                        />
                      </div>
                      <div className="text-right">
                        <p
                          className={roleValue === r ? cfg.color : 'text-muted-foreground'}
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

            <div className="border-t border-border" />

            {/* Personal Info Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="w-4 h-4 text-green-600" />
                <span className="text-foreground" style={{ fontSize: '13px', fontWeight: 700 }}>
                  البيانات الشخصية
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label
                    className="block text-foreground mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    {...register('fullName')}
                    placeholder="مثال: د. أحمد محمد عبد الله"
                    className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.fullName ? 'border-red-300' : 'border-border'}`}
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
                    className="block text-foreground mb-1.5"
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
                    className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.nationalId ? 'border-red-300' : 'border-border'}`}
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
                    className="block text-foreground mb-1.5"
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
                    className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.phone ? 'border-red-300' : 'border-border'}`}
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
                    className="block text-foreground mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    <MapPin className="w-3.5 h-3.5 inline ml-1 text-green-600" />
                    العنوان *
                  </label>
                  <input
                    type="text"
                    {...register('address')}
                    placeholder="شارع، حي، رقم..."
                    className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.address ? 'border-red-300' : 'border-border'}`}
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
                    className="block text-foreground mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    المدينة
                  </label>
                  <select
                    {...register('city')}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400"
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

            <div className="border-t border-border" />

            {/* Account Info Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-green-600" />
                <span className="text-foreground" style={{ fontSize: '13px', fontWeight: 700 }}>
                  بيانات الحساب
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label
                    className="block text-foreground mb-1.5"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="example@bloodlink.benisuef.eg"
                    className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.email ? 'border-red-300' : 'border-border'}`}
                    style={{ fontSize: '13px' }}
                    dir="ltr"
                  />
                  {errors.email?.message && (
                    <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 border border-border text-muted-foreground rounded-xl hover:bg-muted/40 transition-all disabled:opacity-50"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-sm disabled:opacity-50"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                <Edit2 className="w-4 h-4" /> {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
