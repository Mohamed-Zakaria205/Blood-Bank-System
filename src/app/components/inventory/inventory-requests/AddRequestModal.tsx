import type { BloodType, RequestUrgency } from '../../../types';
import { BLOOD_TYPES, HOSPITALS } from '../../../constants';
import { urgencyColors, urgencyLabels } from './requestsConstants';

interface NewRequestForm {
  hospitalName: string;
  bloodType: BloodType;
  quantity: number;
  urgency: RequestUrgency;
  notes: string;
}

interface AddRequestModalProps {
  form: NewRequestForm;
  onChange: (updated: NewRequestForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function AddRequestModal({
  form,
  onChange,
  onSubmit,
  onCancel,
}: AddRequestModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-gray-900 mb-5" style={{ fontSize: '18px', fontWeight: 700 }}>
          طلب دم جديد
        </h3>
        <div className="space-y-4">
          <div>
            <label
              className="block text-gray-700 mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              المستشفى
            </label>
            <select
              value={form.hospitalName}
              onChange={(e) => onChange({ ...form, hospitalName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
              style={{ fontSize: '13px' }}
            >
              <option value="">اختر المستشفى</option>
              {HOSPITALS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-gray-700 mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                الفصيلة
              </label>
              <select
                value={form.bloodType}
                onChange={(e) =>
                  onChange({ ...form, bloodType: e.target.value as BloodType })
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
                الكمية
              </label>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) =>
                  onChange({ ...form, quantity: parseInt(e.target.value) || 1 })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>
          <div>
            <label
              className="block text-gray-700 mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              الأولوية
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'urgent', 'emergency'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => onChange({ ...form, urgency: u })}
                  className={`py-2 rounded-xl border-2 transition-all ${form.urgency === u ? urgencyColors[u] + ' border-current' : 'border-gray-200 text-gray-500'}`}
                  style={{ fontSize: '12px', fontWeight: 600 }}
                >
                  {urgencyLabels[u]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              className="block text-gray-700 mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              ملاحظات
            </label>
            <input
              value={form.notes}
              onChange={(e) => onChange({ ...form, notes: e.target.value })}
              placeholder="اختياري"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onSubmit}
            disabled={!form.hospitalName}
            className={`flex-1 py-2.5 text-white rounded-xl transition-all ${!form.hospitalName ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إضافة الطلب
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
