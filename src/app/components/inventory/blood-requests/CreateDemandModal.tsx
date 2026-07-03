import { useState } from 'react';
import { X, ClipboardList, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateBloodDemand } from '../../../hooks/useBloodDemands';
import { BLOOD_TYPES } from '../../../constants';
import type { BloodDemandPriority, BloodType } from '../../../types';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

interface CreateDemandModalProps {
  onClose: () => void;
}

const BLOOD_TYPE_IDS: Record<BloodType, number> = {
  'A+': 1,
  'A-': 2,
  'B+': 3,
  'B-': 4,
  'AB+': 5,
  'AB-': 6,
  'O+': 7,
  'O-': 8,
};

export default function CreateDemandModal({ onClose }: CreateDemandModalProps) {
  const createDemandMutation = useCreateBloodDemand();
  const [form, setForm] = useState({
    requesterName: '',
    bloodType: 'A+' as BloodType,
    requestedUnits: 1,
    priority: 'Medium' as BloodDemandPriority,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    const requester = form.requesterName.trim();
    
    if (!requester) {
      e.requesterName = 'مطلوب';
    } else if (requester.length < 3) {
      e.requesterName = 'يجب أن يكون الاسم 3 أحرف على الأقل';
    }

    if (form.requestedUnits <= 0) {
      e.requestedUnits = 'يجب أن يكون عدد الوحدات أكبر من الصفر';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createDemandMutation.mutateAsync({
        bloodTypeId: BLOOD_TYPE_IDS[form.bloodType],
        requesterName: form.requesterName.trim(),
        requestedUnits: form.requestedUnits,
        priority: form.priority,
        notes: form.notes.trim() || undefined,
      });

      toast.success('تم إنشاء طلب الدم بنجاح');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء إنشاء طلب الدم');
    }
  };

  const modalRef = useModalFocusTrap(onClose) as React.RefObject<any>;


  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-green-50 dark:bg-green-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-950/50 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3
                id="modal-title"
                className="text-foreground"
                style={{ fontSize: '17px', fontWeight: 700 }}
              >
                إضافة طلب دم جديد
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                تسجيل طلب توريد حقائب دم جديدة للمستشفيات والجهات
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-card transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div>
            <label
              className="block text-foreground mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              اسم الجهة المستدعية / المستشفى *
            </label>
            <input
              value={form.requesterName}
              onChange={(e) => setForm((p) => ({ ...p, requesterName: e.target.value }))}
              placeholder="مثال: مستشفى القاهرة، الهلال الأحمر"
              className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400
                ${errors.requesterName ? 'border-red-300' : 'border-border'}`}
              style={{ fontSize: '13px' }}
            />
            {errors.requesterName && (
              <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                {errors.requesterName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Blood Type */}
            <div>
              <label
                className="block text-foreground mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                الفصيلة المطلوبة *
              </label>
              <select
                value={form.bloodType}
                onChange={(e) => setForm((p) => ({ ...p, bloodType: e.target.value as BloodType }))}
                className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-400"
                style={{ fontSize: '13px' }}
              >
                {BLOOD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Requested Units */}
            <div>
              <label
                className="block text-foreground mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                عدد الوحدات المطلوبة *
              </label>
              <input
                type="number"
                min={1}
                value={form.requestedUnits}
                onChange={(e) =>
                  setForm((p) => ({ ...p, requestedUnits: parseInt(e.target.value) || 0 }))
                }
                className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400
                  ${errors.requestedUnits ? 'border-red-300' : 'border-border'}`}
                style={{ fontSize: '13px' }}
              />
              {errors.requestedUnits && (
                <p className="text-red-500 mt-1" style={{ fontSize: '11px' }}>
                  {errors.requestedUnits}
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label
                className="block text-foreground mb-1.5"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                الأولوية *
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((p) => ({ ...p, priority: e.target.value as BloodDemandPriority }))
                }
                className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-400"
                style={{ fontSize: '13px' }}
              >
                <option value="Low">منخفضة</option>
                <option value="Medium">متوسطة</option>
                <option value="High">عالية (عاجل)</option>
              </select>
            </div>
          </div>

          <div>
            <label
              className="block text-foreground mb-1.5"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              ملاحظات إضافية
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
              placeholder="تفاصيل الحالات المرضية أو معلومات تسليم إضافية..."
              className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 resize-none"
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6 pt-2 border-t border-border/40">
          <button
            type="submit"
            disabled={createDemandMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
            style={{ fontSize: '14px', fontWeight: 700 }}
          >
            {createDemandMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> حفظ الطلب
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all border border-border"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
