import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import type { BloodBag } from '../../../types';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';
import { donTypeLabels } from './bagsConstants';

interface DisposeBagModalProps {
  bags: BloodBag[];
  isPending: boolean;
  onConfirm: (reason: string, notes?: string) => void;
  onClose: () => void;
}

const DISPOSAL_REASONS = [
  { value: 'expired', label: 'انتهاء الصلاحية' },
  { value: 'failed_screening', label: 'فشل الفحص المخبري' },
  { value: 'damaged_storage', label: 'تلف أثناء التخزين' },
  { value: 'contaminated', label: 'تلوث' },
  { value: 'preparation_error', label: 'خطأ في التحضير' },
  { value: 'other', label: 'أخرى' },
];

export default function DisposeBagModal({
  bags,
  isPending,
  onConfirm,
  onClose,
}: DisposeBagModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');
  const modalRef = useModalFocusTrap(onClose);

  const isOther = selectedReason === 'other';
  const isValid = selectedReason !== '' && (!isOther || notes.trim() !== '');

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(selectedReason, notes.trim() || undefined);
    }
  };

  const isBulk = bags.length > 1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 outline-none overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 id="modal-title" className="text-foreground" style={{ fontSize: '17px', fontWeight: 700 }}>
              {isBulk ? `تأكيد إتلاف ${bags.length} حقائب` : 'تأكيد الإتلاف'}
            </h3>
            <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
              {isBulk ? 'عملية إتلاف جماعية لمجموعة من الحقائب' : `${bags[0]?.bagCode} — فصيلة ${bags[0]?.bloodType}`}
            </p>
          </div>
        </div>

        {/* Bags List for bulk / Details for single */}
        <div className="mb-4 max-h-36 overflow-y-auto border border-border rounded-xl p-3 bg-muted/20">
          {isBulk ? (
            <div className="space-y-1.5">
              {bags.map((b) => (
                <div key={b.id} className="flex justify-between items-center text-xs border-b border-border/40 pb-1 last:border-0 last:pb-0">
                  <span className="font-mono text-green-700 bg-green-50 px-1.5 py-0.5 rounded">{b.bagCode}</span>
                  <span className="px-1.5 py-0.5 bg-red-50 text-red-600 font-bold rounded">{b.bloodType}</span>
                  <span className="text-muted-foreground">{donTypeLabels[b.donationType]}</span>
                </div>
              ))}
            </div>
          ) : (
            bags[0] && (
              <div className="text-xs space-y-1.5 text-muted-foreground">
                <div className="flex justify-between">
                  <span>كود الحقيبة:</span>
                  <span className="font-mono text-foreground font-semibold">{bags[0].bagCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>الفصيلة:</span>
                  <span className="text-foreground font-bold">{bags[0].bloodType}</span>
                </div>
                <div className="flex justify-between">
                  <span>مكون الدم:</span>
                  <span className="text-foreground">{donTypeLabels[bags[0].donationType]}</span>
                </div>
                <div className="flex justify-between">
                  <span>الحجم:</span>
                  <span className="text-foreground font-mono">{bags[0].volume} مل</span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ الانتهاء:</span>
                  <span className="text-foreground font-mono">{bags[0].expiryDate}</span>
                </div>
              </div>
            )
          )}
        </div>

        <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
          <p className="text-red-600 text-xs flex gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>هذا الإجراء نهائي. سيتم وضع علامة على حقيبة الدم كحقيبة تالفة وإزالتها من المخزون النشط.</span>
          </p>
        </div>

        {/* Reason Select */}
        <div className="mb-4">
          <label
            className="block text-foreground mb-1.5 text-xs font-semibold"
          >
            سبب الإتلاف *
          </label>
          <select
            value={selectedReason}
            onChange={(e) => {
              setSelectedReason(e.target.value);
              setNotes('');
            }}
            className="w-full px-4 py-2 border border-border rounded-xl bg-card text-foreground text-xs outline-none focus:border-red-400"
          >
            <option value="">— اختر سبب الإتلاف —</option>
            {DISPOSAL_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional custom notes */}
        {isOther && (
          <div className="mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <label
              className="block text-foreground mb-1.5 text-xs font-semibold"
            >
              تفاصيل السبب (مطلوب) *
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="يرجى كتابة تفاصيل سبب الإتلاف هنا..."
              className="w-full px-4 py-2 border border-border rounded-xl bg-muted/20 text-foreground text-xs outline-none focus:border-red-400 resize-none"
            />
          </div>
        )}

        {/* Button controls */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={handleConfirm}
            disabled={isPending || !isValid}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-sm"
          >
            {isPending ? (
              'جارٍ الإتلاف...'
            ) : (
              <>
                <Trash2 className="w-4 h-4" /> تأكيد الإتلاف
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all text-sm font-semibold"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
