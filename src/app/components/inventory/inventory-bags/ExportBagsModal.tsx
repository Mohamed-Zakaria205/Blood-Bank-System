import { useState } from 'react';
import { Check, X, Upload, AlertCircle, ChevronLeft } from 'lucide-react';
import type { BloodBag } from '../../../types';
import type { ExportFormState } from './bagsConstants';
import { getCurrentUserName } from './bagsConstants';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

interface ExportBagsModalProps {
  selectedBagsData: BloodBag[];
  isPending: boolean;
  onConfirm: (form: ExportFormState) => void;
  onClose: () => void;
  initialRecipientName?: string;
  initialReason?: string;
  isFulfillmentMode?: boolean;
}

export default function ExportBagsModal({
  selectedBagsData,
  isPending,
  onConfirm,
  onClose,
  initialRecipientName = '',
  initialReason = '',
  isFulfillmentMode = false,
}: ExportBagsModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<ExportFormState>({
    recipientName: initialRecipientName,
    nationalId: '',
    phone: '',
    reason: initialReason,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};

    // ── Recipient name ──
    const name = form.recipientName.trim();
    if (!name) {
      e.recipientName = 'مطلوب';
    } else if (name.length < 6) {
      e.recipientName = 'يجب أن يكون الاسم 6 أحرف على الأقل';
    } else if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(name)) {
      e.recipientName = 'يجب أن يحتوي على حروف فقط (عربي أو إنجليزي)';
    }

    // ── National ID (14 digits) ──
    const nid = form.nationalId.trim();
    if (!nid) {
      e.nationalId = 'مطلوب';
    } else if (!/^\d{14}$/.test(nid)) {
      e.nationalId = 'يجب أن يكون 14 رقم بالضبط';
    }

    // ── Phone (optional but validated if provided) ──
    const phone = form.phone.trim();
    if (phone && !/^01[0125]\d{8}$/.test(phone)) {
      e.phone = 'صيغة غير صحيحة (01xxxxxxxxx)';
    }

    // ── Reason ──
    if (!form.reason.trim()) e.reason = 'مطلوب';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextStep = () => {
    if (validate()) setStep(2);
  };

  const modalRef = useModalFocusTrap(onClose);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden outline-none"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-green-50 dark:bg-green-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-950/50 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3
                id="modal-title"
                className="text-foreground"
                style={{ fontSize: '17px', fontWeight: 700 }}
              >
                تصدير{' '}
                {selectedBagsData.length > 1 ? `${selectedBagsData.length} حقائب` : 'حقيبة دم'}
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                {step === 1 ? 'أدخل بيانات المستلِم' : 'مراجعة وتأكيد نهائي'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* step dots */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: step >= 1 ? '#16a34a' : '#d1d5db',
                }}
              >
                1
              </div>
              <div className={`w-6 h-0.5 ${step >= 2 ? 'bg-green-600' : 'bg-muted'}`} />
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: step >= 2 ? '#16a34a' : '#d1d5db',
                }}
              >
                2
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-card transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selected bags chips */}
        <div className="px-6 pt-4">
          <div className="p-3 bg-muted/40 rounded-xl border border-border">
            <p className="text-muted-foreground mb-2" style={{ fontSize: '11px', fontWeight: 600 }}>
              الحقائب المحددة
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedBagsData.map((bag) => (
                <span
                  key={bag.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-card border border-border rounded-lg"
                >
                  <span
                    className="font-mono text-green-600"
                    style={{ fontSize: '11px', fontWeight: 700 }}
                  >
                    {bag.bagCode}
                  </span>
                  <span
                    className="px-1 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded"
                    style={{ fontSize: '10px', fontWeight: 800 }}
                  >
                    {bag.bloodType}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Step 1: form ── */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <div>
              <label
                className="block text-foreground mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                اسم المريض المستلِم *
              </label>
              <input
                value={form.recipientName}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    recipientName: e.target.value,
                  }))
                }
                disabled={isFulfillmentMode}
                placeholder="الاسم بالكامل"
                className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 disabled:opacity-75 disabled:bg-muted/20 disabled:cursor-not-allowed
                  ${errors.recipientName ? 'border-red-300' : 'border-border'}`}
                style={{ fontSize: '13px' }}
              />
              {isFulfillmentMode && (
                <p className="text-muted-foreground mt-1" style={{ fontSize: '10px' }}>
                  💡 تم الملء تلقائياً بناءً على طلب الدم وقفل التعديل
                </p>
              )}

              {errors.recipientName && (
                <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                  {errors.recipientName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-foreground mb-1.5"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  الرقم القومي <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.nationalId}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      nationalId: e.target.value,
                    }))
                  }
                  placeholder="14 رقم"
                  maxLength={14}
                  className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400
                    ${errors.nationalId ? 'border-red-300' : 'border-border'}`}
                  style={{ fontSize: '13px' }}
                />
                {errors.nationalId && (
                  <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                    {errors.nationalId}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block text-foreground mb-1.5"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  رقم الهاتف
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="01xxxxxxxxx"
                  maxLength={11}
                  className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400
                    ${errors.phone ? 'border-red-300' : 'border-border'}`}
                  style={{ fontSize: '13px' }}
                />
                {errors.phone && (
                  <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                className="block text-foreground mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                سبب التصدير *
              </label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                disabled={isFulfillmentMode}
                rows={2}
                placeholder="مثال: نقل دم بعد عملية جراحية"
                className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 resize-none disabled:opacity-75 disabled:bg-muted/20 disabled:cursor-not-allowed
                  ${errors.reason ? 'border-red-300' : 'border-border'}`}
                style={{ fontSize: '13px' }}
              />
              {isFulfillmentMode && (
                <p className="text-muted-foreground mt-1" style={{ fontSize: '10px' }}>
                  💡 تم الملء تلقائياً بناءً على طلب الدم وقفل التعديل
                </p>
              )}

              {errors.reason && (
                <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                  {errors.reason}
                </p>
              )}
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 rounded-xl">
              <p className="text-green-700 dark:text-green-400" style={{ fontSize: '11px' }}>
                📋 سيتم تسجيل هذا التصدير تلقائياً باسم: <strong>{getCurrentUserName()}</strong>{' '}
                مع التاريخ والوقت
              </p>
            </div>
          </div>
        )}

        {/* ── Step 2: confirmation ── */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 dark:text-amber-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                  مراجعة بيانات التصدير
                </p>
                <p className="text-amber-600 dark:text-amber-400" style={{ fontSize: '11px', marginTop: '2px' }}>
                  يُرجى التحقق من صحة جميع البيانات قبل التأكيد النهائي. لا يمكن التراجع عن هذه
                  العملية.
                </p>
              </div>
            </div>

            <div className="bg-muted/40 rounded-xl border border-border divide-y divide-border">
              {[
                {
                  icon: '👤',
                  label: 'اسم المستلِم',
                  value: form.recipientName,
                },
                {
                  icon: '🪪',
                  label: 'الرقم القومي',
                  value: form.nationalId,
                },
                {
                  icon: '📞',
                  label: 'رقم الهاتف',
                  value: form.phone || '—',
                },
                {
                  icon: '📋',
                  label: 'سبب التصدير',
                  value: form.reason,
                },
                {
                  icon: '🩸',
                  label: 'عدد الحقائب',
                  value: `${selectedBagsData.length} حقيبة`,
                },
                {
                  icon: '👨‍⚕️',
                  label: 'المنفذ',
                  value: getCurrentUserName(),
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 px-4 py-2.5">
                  <span style={{ fontSize: '15px', lineHeight: 1.5 }}>{item.icon}</span>
                  <span
                    className="text-muted-foreground w-28 flex-shrink-0 pt-0.5"
                    style={{ fontSize: '12px' }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-foreground flex-1"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex gap-3 px-6 pb-6">
          {step === 1 ? (
            <>
              <button
                onClick={handleNextStep}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                style={{ fontSize: '14px', fontWeight: 700 }}
              >
                التالي <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted transition-all"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                إلغاء
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onConfirm(form)}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontSize: '14px', fontWeight: 700 }}
              >
                {isPending ? (
                  'جارٍ التصدير...'
                ) : (
                  <>
                    <Check className="w-4 h-4" /> تأكيد التصدير النهائي
                  </>
                )}
              </button>
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted transition-all"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                رجوع
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
