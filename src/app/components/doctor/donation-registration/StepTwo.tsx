import {
  Droplets,
  Activity,
  FlaskConical,
  Scale,
  Heart,
  AlertTriangle,
  Clock,
  UserCheck,
  UserX,
  ChevronRight,
  Check,
} from 'lucide-react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { SimpleForm } from './donationFormSchema';
import { BLOOD_TYPES, DISEASES } from '../../../constants';

interface StepTwoProps {
  form: SimpleForm;
  register: UseFormRegister<SimpleForm>;
  errors: FieldErrors<SimpleForm>;
  submitting: boolean;
  updateField: <K extends keyof SimpleForm>(key: K, value: SimpleForm[K]) => void;
  toggleDisease: (id: string) => void;
  onBack: () => void;
}

export default function StepTwo({
  form,
  register,
  errors,
  submitting,
  updateField,
  toggleDisease,
  onBack,
}: StepTwoProps) {
  return (
    <>
      {/* Blood Type — optional */}
      <div>
        <label
          className="block text-foreground mb-2"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <Droplets className="w-4 h-4 inline ml-1 text-red-500" />
          فصيلة الدم{' '}
          <span className="text-muted-foreground" style={{ fontWeight: 400 }}>
            (اختياري)
          </span>
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {BLOOD_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => updateField('bloodType', form.bloodType === t ? '' : t)}
              className={`py-3 rounded-xl border-2 transition-all ${form.bloodType === t ? 'border-red-500 bg-red-50 text-red-600' : 'border-border text-muted-foreground hover:border-red-200'}`}
              style={{
                fontSize: '15px',
                fontWeight: form.bloodType === t ? 800 : 500,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Donation Type */}
      <div>
        <label
          className="block text-foreground mb-2"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          نوع التبرع
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ['wholeblood', 'دم كامل', '🩸'],
            ['plasma', 'بلازما', '💧'],
            ['platelets', 'صفائح', '🔬'],
          ].map(([v, l, e]) => (
            <button
              key={v}
              type="button"
              onClick={() => updateField('donationType', v)}
              className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${form.donationType === v ? 'border-green-600 bg-green-50' : 'border-border hover:border-green-200'}`}
            >
              <span style={{ fontSize: '20px' }}>{e}</span>
              <span
                className={form.donationType === v ? 'text-green-700' : 'text-muted-foreground'}
                style={{
                  fontSize: '12px',
                  fontWeight: form.donationType === v ? 700 : 500,
                }}
              >
                {l}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* ── Medical Screening ── */}
      <div>
        <p
          className="text-foreground mb-3 flex items-center gap-2"
          style={{ fontSize: '13px', fontWeight: 700 }}
        >
          <FlaskConical className="w-4 h-4 text-blue-500" />
          الفحص الطبي{' '}
          <span className="text-muted-foreground" style={{ fontWeight: 400 }}>
            (اختياري)
          </span>
        </p>

        {/* Weight + Blood Pressure + Hemoglobin */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label
              className="text-muted-foreground mb-1.5 flex items-center gap-1"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              <Scale className="w-3.5 h-3.5 text-blue-500" /> الوزن (كغ)
            </label>
            <input
              type="number"
              {...register('weight')}
              placeholder="مثال: 75"
              className={`w-full px-3 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:ring-2 ${
                errors.weight ? 'border-red-400 focus:ring-red-100' : 'border-border focus:border-blue-400 focus:ring-blue-100'
              }`}
              style={{ fontSize: '13px' }}
              dir="ltr"
            />
            {errors.weight && <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>{errors.weight.message}</p>}
          </div>
          <div>
            <label
              className="text-muted-foreground mb-1.5 flex items-center gap-1"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              <Heart className="w-3.5 h-3.5 text-red-500" /> ضغط الدم
            </label>
            <input
              {...register('bloodPressure')}
              placeholder="120/80"
              className={`w-full px-3 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:ring-2 ${
                errors.bloodPressure ? 'border-red-400 focus:ring-red-100' : 'border-border focus:border-red-400 focus:ring-red-100'
              }`}
              style={{ fontSize: '13px' }}
              dir="ltr"
            />
            {errors.bloodPressure && <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>{errors.bloodPressure.message}</p>}
          </div>
          <div>
            <label
              className="text-muted-foreground mb-1.5 flex items-center gap-1"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              <Droplets className="w-3.5 h-3.5 text-purple-500" /> الهيموجلوبين
            </label>
            <input
              type="number"
              {...register('hemoglobin')}
              placeholder="مثال: 13.5"
              step="0.1"
              className={`w-full px-3 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:ring-2 ${
                errors.hemoglobin ? 'border-red-400 focus:ring-red-100' : 'border-border focus:border-purple-400 focus:ring-purple-100'
              }`}
              style={{ fontSize: '13px' }}
              dir="ltr"
            />
            {errors.hemoglobin && <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>{errors.hemoglobin.message}</p>}
          </div>
        </div>

        {/* IsAllergic */}
        <button
          type="button"
          onClick={() => updateField('isAllergic', !form.isAllergic)}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${form.isAllergic ? 'border-orange-400 bg-orange-50' : 'border-border hover:border-orange-200'}`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={`w-4 h-4 ${form.isAllergic ? 'text-orange-500' : 'text-muted-foreground'}`}
            />
            <span
              className={form.isAllergic ? 'text-orange-700' : 'text-muted-foreground'}
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              لديه حساسية (IsAllergic)
            </span>
          </div>
          <div
            className={`w-10 h-5 rounded-full transition-all relative ${form.isAllergic ? 'bg-orange-500' : 'bg-muted'}`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-card rounded-full shadow transition-all ${form.isAllergic ? 'left-5' : 'left-0.5'}`}
            />
          </div>
        </button>
      </div>

      <div className="border-t border-border" />

      {/* Chronic Diseases */}
      <div>
        <label
          className="block text-foreground mb-2"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <Activity className="w-4 h-4 inline ml-1 text-orange-500" />
          الأمراض المزمنة{' '}
          <span className="text-muted-foreground" style={{ fontWeight: 400 }}>
            (اختياري — اضغط للتحديد)
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {DISEASES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => toggleDisease(d.id)}
              className={`px-3 py-1.5 rounded-full border-2 transition-all ${
                form.diseases.includes(d.id)
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-border text-muted-foreground hover:border-border'
              }`}
              style={{
                fontSize: '12px',
                fontWeight: form.diseases.includes(d.id) ? 700 : 400,
              }}
            >
              {form.diseases.includes(d.id) ? '✕ ' : ''}
              {d.label}
            </button>
          ))}
        </div>
        {form.diseases.length > 0 && (
          <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-red-600" style={{ fontSize: '11px', fontWeight: 600 }}>
              محدد:{' '}
              {form.diseases
                .map((id) => DISEASES.find((d) => d.id === id)?.label)
                .join('، ')}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-border" />

      {/* Donor Status */}
      <div>
        <label
          className="block text-foreground mb-2"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          حالة المتبرع *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => updateField('status', 'eligible')}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.status === 'eligible' ? 'border-green-600 bg-green-50' : 'border-border hover:border-green-200'}`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${form.status === 'eligible' ? 'bg-green-600' : 'bg-muted'}`}
            >
              <UserCheck
                className={`w-4 h-4 ${form.status === 'eligible' ? 'text-white' : 'text-muted-foreground'}`}
              />
            </div>
            <div className="text-right">
              <p
                className={form.status === 'eligible' ? 'text-green-700' : 'text-foreground'}
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                مؤهل ✅
              </p>
              <p className="text-muted-foreground" style={{ fontSize: '10px' }}>
                يمكنه التبرع
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => updateField('status', 'deferred')}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.status === 'deferred' ? 'border-orange-500 bg-orange-50' : 'border-border hover:border-orange-200'}`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${form.status === 'deferred' ? 'bg-orange-500' : 'bg-muted'}`}
            >
              <Clock
                className={`w-4 h-4 ${form.status === 'deferred' ? 'text-white' : 'text-muted-foreground'}`}
              />
            </div>
            <div className="text-right">
              <p
                className={form.status === 'deferred' ? 'text-orange-700' : 'text-foreground'}
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                موجل ⏳
              </p>
              <p className="text-muted-foreground" style={{ fontSize: '10px' }}>
                تأجيل مؤقت
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => updateField('status', 'rejected')}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.status === 'rejected' ? 'border-red-500 bg-red-50' : 'border-border hover:border-red-200'}`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${form.status === 'rejected' ? 'bg-red-500' : 'bg-muted'}`}
            >
              <UserX
                className={`w-4 h-4 ${form.status === 'rejected' ? 'text-white' : 'text-muted-foreground'}`}
              />
            </div>
            <div className="text-right">
              <p
                className={form.status === 'rejected' ? 'text-red-700' : 'text-foreground'}
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                غير مؤهل ❌
              </p>
              <p className="text-muted-foreground" style={{ fontSize: '10px' }}>
                لا يمكنه التبرع
              </p>
            </div>
          </button>
        </div>

        {/* Deferred details */}
        {form.status === 'deferred' && (
          <div className="mt-3 space-y-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
            <div>
              <label
                className="text-orange-700 mb-1.5 flex items-center gap-1"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> سبب التأجيل{' '}
                <span style={{ fontWeight: 400 }}>(اختياري)</span>
              </label>
              <textarea
                {...register('rejectionReason')}
                placeholder="اذكر سبب تأجيل التبرع..."
                rows={2}
                className="w-full px-3 py-2.5 border border-orange-200 rounded-xl bg-card text-foreground outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
                style={{ fontSize: '13px' }}
              />
            </div>
            <div>
              <label
                className="text-orange-700 mb-1.5 flex items-center gap-1"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                <Clock className="w-3.5 h-3.5" /> موجل حتى{' '}
                <span style={{ fontWeight: 400 }}>اختياري</span>
              </label>
              <input
                type="date"
                {...register('deferredUntil')}
                className="w-full px-3 py-2.5 border border-orange-200 rounded-xl bg-card text-foreground outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                style={{ fontSize: '13px' }}
                dir="ltr"
              />
            </div>
          </div>
        )}

        {/* Rejection details — shows when rejected */}
        {form.status === 'rejected' && (
          <div className="mt-3 space-y-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <div>
              <label
                className="text-red-700 mb-1.5 flex items-center gap-1"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> سبب الرفض{' '}
                <span style={{ fontWeight: 400 }}>(اختياري)</span>
              </label>
              <textarea
                {...register('rejectionReason')}
                placeholder="اذكر سبب رفض التبرع..."
                rows={2}
                className="w-full px-3 py-2.5 border border-red-200 rounded-xl bg-card text-foreground outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
                style={{ fontSize: '13px' }}
              />
              {errors.rejectionReason?.message && (
                <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                  {errors.rejectionReason.message}
                </p>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Step 2 navigation */}
      <div className="border-t border-border pt-2 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-5 py-3.5 border border-border text-muted-foreground rounded-xl hover:bg-muted/40 transition-all"
          style={{ fontSize: '14px', fontWeight: 600 }}
        >
          <ChevronRight className="w-5 h-5" /> رجوع
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-sm disabled:opacity-70"
          style={{ fontSize: '14px', fontWeight: 700 }}
        >
          {submitting ? (
            <>
              <span className="flex items-center justify-center gap-2">
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
                جارٍ الحفظ...
              </span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5" /> تسجيل التبرع
            </>
          )}
        </button>
      </div>
    </>
  );
}

