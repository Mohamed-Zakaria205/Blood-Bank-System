import { X, Save } from 'lucide-react';
import { BLOOD_TYPES } from '../../../constants';
import type { Donor } from '../../../types';
import { EGYPT_DATA } from '../../../data/egypt';

interface EditDonorModalProps {
  donor: Donor;
  form: Partial<Donor>;
  onFormChange: (updated: Partial<Donor>) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  saved: boolean;
}

export default function EditDonorModal({
  donor,
  form,
  onFormChange,
  onSave,
  onCancel,
  loading,
  saved,
}: EditDonorModalProps) {
  const currentGovernorateObj = EGYPT_DATA.find((g) => g.name_ar === form.governorate);
  const currentCities = currentGovernorateObj?.cities || [];
  const currentDistrictObj = currentCities.find((c) => c.city_name_ar === form.district);
  const currentAreas = currentDistrictObj?.areas || [];

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
                الرقم القومي
              </label>
              <input
                value={form.nationalId || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 14);
                  onFormChange({ ...form, nationalId: val });
                }}
                maxLength={14}
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
                تاريخ الميلاد
              </label>
              <input
                type="date"
                value={form.dateOfBirth || ''}
                onChange={(e) => onFormChange({ ...form, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                style={{ fontSize: '13px' }}
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
                  onFormChange({
                    ...form,
                    bloodType: (e.target.value || undefined) as Donor['bloodType'],
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                style={{ fontSize: '13px' }}
              >
                <option value=""></option>
                {BLOOD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>


            {/* العنوان (المحافظة + المركز + المنطقة) */}
            <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
              <h4 className="text-gray-900 mb-3" style={{ fontSize: '14px', fontWeight: 700 }}>
                العنوان بالتفصيل
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {/* Governorate */}
                <div>
                  <label
                    className="block text-gray-500 mb-1.5"
                    style={{ fontSize: '11px', fontWeight: 600 }}
                  >
                    المحافظة *
                  </label>
                  <select
                    value={form.governorate || ''}
                    onChange={(e) => {
                      onFormChange({
                        ...form,
                        governorate: e.target.value,
                        district: '',
                        area: '',
                      });
                    }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                    style={{ fontSize: '13px' }}
                  >
                    <option value="">— اختر المحافظة —</option>
                    {EGYPT_DATA.map((g) => (
                      <option key={g.id} value={g.name_ar}>
                        {g.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label
                    className="block text-gray-500 mb-1.5"
                    style={{ fontSize: '11px', fontWeight: 600 }}
                  >
                    المركز *
                  </label>
                  <select
                    value={form.district || ''}
                    onChange={(e) => {
                      onFormChange({
                        ...form,
                        district: e.target.value,
                        area: '',
                      });
                    }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                    style={{ fontSize: '13px' }}
                  >
                    <option value="">— اختر المركز —</option>
                    {currentCities.map((d) => (
                      <option key={d.id} value={d.city_name_ar}>
                        {d.city_name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area */}
                <div>
                  <label
                    className="block text-gray-500 mb-1.5"
                    style={{ fontSize: '11px', fontWeight: 600 }}
                  >
                    المنطقة / الشارع *
                  </label>
                  {currentAreas.length > 0 ? (
                    <select
                      value={form.area || ''}
                      onChange={(e) => onFormChange({ ...form, area: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                      style={{ fontSize: '13px' }}
                    >
                      <option value="">— اختر المنطقة —</option>
                      {currentAreas.map((a) => (
                        <option key={a.id} value={a.name_ar}>
                          {a.name_ar}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={form.area || ''}
                      onChange={(e) => onFormChange({ ...form, area: e.target.value })}
                      placeholder="أدخل المنطقة / الشارع"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                      style={{ fontSize: '13px' }}
                    />
                  )}
                </div>
              </div>
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
            disabled={loading || saved}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white transition-all ${saved ? 'bg-green-500' : loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            <Save className="w-4 h-4" />
            {saved ? 'تم الحفظ ✓' : loading ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>
    </div>
  );
}
