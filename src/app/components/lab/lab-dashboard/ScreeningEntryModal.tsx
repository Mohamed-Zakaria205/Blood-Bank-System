import { CheckCircle2, X, Check, AlertCircle, Droplets, AlertTriangle } from 'lucide-react';
import type { LabTest } from '../../../types';
import { formatLocalizedDate } from '../../../utils/date';
import { BLOOD_TYPES } from '../../../constants';
import type { ScreeningForm, TestKey } from './labConstants';
import { screeningTests, donationTypeLabels } from './labConstants';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

interface ScreeningEntryModalProps {
  entryModal: LabTest;
  form: ScreeningForm;
  errors: Record<string, string>;
  submitting: boolean;
  userName: string | undefined;
  onClose: () => void;
  onUpdateForm: (updater: (prev: ScreeningForm) => ScreeningForm) => void;
  onSubmit: () => void;
}

export default function ScreeningEntryModal({
  entryModal,
  form,
  errors,
  submitting,
  userName,
  onClose,
  onUpdateForm,
  onSubmit,
}: ScreeningEntryModalProps) {
  const isRejected =
    form.hcv === 'positive' ||
    form.hbv === 'positive' ||
    form.syphilis === 'positive' ||
    form.hiv === 'positive';

  const updateTest = (key: TestKey, value: 'negative' | 'positive') => {
    onUpdateForm((p) => ({ ...p, [key]: value }));
  };

  const modalRef = useModalFocusTrap(onClose);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto outline-none"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-5 rounded-t-2xl ${isRejected ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-green-700 to-green-600'}`}
        >
          <div>
            <h3
              id="modal-title"
              className="text-white"
              style={{ fontSize: '17px', fontWeight: 700 }}
            >
              فحص حقيبة الدم — الفحوصات المعيارية
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="bg-card/20 text-white px-2.5 py-0.5 rounded-lg font-mono"
                style={{ fontSize: '13px', fontWeight: 800 }}
              >
                {entryModal.bloodType}
              </span>
              <span
                className="bg-card/15 text-white/90 px-2.5 py-0.5 rounded-lg"
                style={{ fontSize: '11px' }}
              >
                كود العينة: <span className="font-mono font-bold">{entryModal.donationCode}</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-card/15 rounded-xl flex items-center justify-center hover:bg-card/25 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Donor / Sample Info */}
          <div className="p-4 bg-muted/40 rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-100">
                <Droplets className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 700 }}>
                  {entryModal.donorName}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  {donationTypeLabels[entryModal.donationType]}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-card rounded-lg px-3 py-2 border border-border">
                <p className="text-muted-foreground" style={{ fontSize: '10px' }}>
                  كود العينة
                </p>
                <p
                  className="text-green-700 font-mono"
                  style={{ fontSize: '12px', fontWeight: 700 }}
                >
                  {entryModal.donationCode}
                </p>
              </div>
              <div className="bg-card rounded-lg px-3 py-2 border border-border">
                <p className="text-muted-foreground" style={{ fontSize: '10px' }}>
                  تاريخ الطلب
                </p>
                <p className="text-foreground" style={{ fontSize: '12px', fontWeight: 600 }}>
                  {entryModal.requestedAt ? formatLocalizedDate(entryModal.requestedAt) : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Blood Type Confirmation */}
          <div>
            <label
              className="block text-foreground mb-2"
              style={{ fontSize: '13px', fontWeight: 700 }}
            >
              🩸 تأكيد فصيلة الدم *
              <span className="text-muted-foreground mr-2" style={{ fontWeight: 400 }}>
                (المُعلن: {entryModal.bloodType})
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_TYPES.map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => onUpdateForm((p) => ({ ...p, confirmedBloodType: bt }))}
                  className={`py-2.5 rounded-xl border-2 transition-all ${form.confirmedBloodType === bt
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-border text-muted-foreground hover:border-green-200'
                    }`}
                  style={{
                    fontSize: '14px',
                    fontWeight: form.confirmedBloodType === bt ? 800 : 500,
                  }}
                >
                  {bt}
                </button>
              ))}
            </div>
            {errors.bloodType && (
              <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                {errors.bloodType}
              </p>
            )}
          </div>

          {/* Screening Tests */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <label className="text-foreground" style={{ fontSize: '13px', fontWeight: 700 }}>
                الفحوصات المخبرية المعيارية
              </label>
              <span className="mr-auto text-muted-foreground" style={{ fontSize: '11px' }}>
                سالب = طبيعي / موجب = مرضي
              </span>
            </div>
            <div className="space-y-2">
              {screeningTests.map((test) => (
                <div
                  key={test.key}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${form[test.key] === 'positive'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-card border-border hover:border-green-200'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${form[test.key] === 'positive' ? 'bg-red-100' : 'bg-green-50'
                        }`}
                    >
                      <span
                        className={`${form[test.key] === 'positive' ? 'text-red-700' : 'text-green-700'}`}
                        style={{ fontSize: '9px', fontWeight: 900 }}
                      >
                        {test.abbr}
                      </span>
                    </div>
                    <div>
                      <p className="text-foreground" style={{ fontSize: '13px', fontWeight: 600 }}>
                        {test.label}
                      </p>
                      <p className="text-muted-foreground" style={{ fontSize: '10px' }}>
                        {test.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateTest(test.key, 'negative')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${form[test.key] === 'negative'
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-muted/40 border border-border text-muted-foreground hover:bg-green-50 hover:border-green-300'
                        }`}
                      style={{ fontSize: '12px', fontWeight: 600 }}
                    >
                      <Check className="w-3 h-3" /> سالب
                    </button>
                    <button
                      onClick={() => updateTest(test.key, 'positive')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${form[test.key] === 'positive'
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'bg-muted/40 border border-border text-muted-foreground hover:bg-red-50 hover:border-red-300'
                        }`}
                      style={{ fontSize: '12px', fontWeight: 600 }}
                    >
                      <X className="w-3 h-3" /> موجب
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auto Result */}
          <div
            className={`flex items-center gap-3 p-4 rounded-xl ${isRejected ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}
          >
            {isRejected ? (
              <>
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-red-700" style={{ fontSize: '13px', fontWeight: 700 }}>
                    ⚠️ تحذير: نتيجة إيجابية واحدة أو أكثر
                  </p>
                  <p className="text-red-500" style={{ fontSize: '11px' }}>
                    سيتم تصنيف الدم كـ (غير آمن ومرفوض)
                  </p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-green-700" style={{ fontSize: '13px', fontWeight: 700 }}>
                    ✓ جميع الفحوصات سالبة
                  </p>
                  <p className="text-green-500" style={{ fontSize: '11px' }}>
                    سيتم قبول الدم كـ (آمن ومناسب للاستخدام)
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              className="block text-foreground mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              ملاحظات إضافية <span className="text-muted-foreground">(اختياري)</span>
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => onUpdateForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="أي ملاحظات على الحقيبة أو نتائج الفحص..."
              className="w-full bg-muted/40 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-green-400 resize-none"
              style={{ fontSize: '13px' }}
            />
          </div>

          {/* Lab Doctor */}
          <div className="bg-muted/40 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-muted-foreground" style={{ fontSize: '11px' }}>
                طبيب المختبر:{' '}
              </span>
              <span className="text-foreground" style={{ fontSize: '12px', fontWeight: 600 }}>
                {userName}
              </span>
            </div>
            <span className="text-muted-foreground" style={{ fontSize: '11px' }}>
              {formatLocalizedDate(new Date())}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted/40 transition-colors"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              إلغاء
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className={`flex-1 py-3 rounded-xl text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 ${isRejected
                  ? 'bg-gradient-to-r from-red-600 to-red-500'
                  : 'bg-gradient-to-r from-green-700 to-green-600'
                }`}
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
                  جاري الحفظ...
                </span>
              ) : isRejected ? (
                '⚠️ حفظ — دم غير آمن'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> حفظ — دم آمن
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
