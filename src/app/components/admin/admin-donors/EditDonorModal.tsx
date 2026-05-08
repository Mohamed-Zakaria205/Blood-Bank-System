import { X, Save } from 'lucide-react';
import { BLOOD_TYPES, CITIES } from '../../../constants';
import type { Donor } from '../../../types';

interface EditDonorModalProps {
  donor: Donor;
  form: Partial<Donor>;
  onFormChange: (updated: Partial<Donor>) => void;
  onSave: () => void;
  onCancel: () => void;
  saved: boolean;
}

export default function EditDonorModal({
  donor,
  form,
  onFormChange,
  onSave,
  onCancel,
  saved,
}: EditDonorModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 700 }}>
              تعديل بيانات المتبرع
            </h3>
            <p className="text-green-600 font-mono" style={{ fontSize: '12px' }}>
              {donor.donorCode}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-gray-700 mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                الاسم الكامل
              </label>
              <input
                value={form.name || ''}
                onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                style={{ fontSize: '13px' }}
              />
            </div>
            <div>
              <label
                className="block text-gray-700 mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                رقم الهاتف
              </label>
              <input
                value={form.phone || ''}
                onChange={(e) => onFormChange({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                style={{ fontSize: '13px' }}
                dir="ltr"
              />
            </div>
            <div>
              <label
                className="block text-gray-700 mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                فصيلة الدم
              </label>
              <select
                value={form.bloodType || ''}
                onChange={(e) =>
                  onFormChange({ ...form, bloodType: e.target.value as Donor['bloodType'] })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                style={{ fontSize: '13px' }}
              >
                {BLOOD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-gray-700 mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                المدينة
              </label>
              <select
                value={form.city || ''}
                onChange={(e) => onFormChange({ ...form, city: e.target.value })}
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
            <div>
              <label
                className="block text-gray-700 mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                الحالة
              </label>
              <select
                value={form.status || ''}
                onChange={(e) =>
                  onFormChange({ ...form, status: e.target.value as Donor['status'] })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                style={{ fontSize: '13px' }}
              >
                <option value="eligible">مؤهل</option>
                <option value="ineligible">غير مؤهل</option>
                <option value="deferred">موجل</option>
              </select>
            </div>
            <div>
              <label
                className="block text-gray-700 mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                العنوان
              </label>
              <input
                value={form.address || ''}
                onChange={(e) => onFormChange({ ...form, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إلغاء
          </button>
          <button
            onClick={onSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white transition-all ${saved ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'}`}
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            <Save className="w-4 h-4" />
            {saved ? 'تم الحفظ ✓' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>
    </div>
  );
}
