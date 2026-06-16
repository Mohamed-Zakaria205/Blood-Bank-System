import { Trash2 } from 'lucide-react';
import type { BloodBag } from '../../../types';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

interface DisposeBagModalProps {
  bag: BloodBag;
  reason: string;
  isPending: boolean;
  onReasonChange: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DisposeBagModal({
  bag,
  reason,
  isPending,
  onReasonChange,
  onConfirm,
  onClose,
}: DisposeBagModalProps) {
  const modalRef = useModalFocusTrap(onClose);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 outline-none"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3
              id="modal-title"
              className="text-foreground"
              style={{ fontSize: '17px', fontWeight: 700 }}
            >
              تأكيد الإتلاف
            </h3>
            <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
              {bag.bagCode} — فصيلة {bag.bloodType}
            </p>
          </div>
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
          <p className="text-red-600" style={{ fontSize: '12px' }}>
            ⚠ هذا الإجراء نهائي ولا يمكن التراجع عنه. سيُسجَّل في سجل الصادر.
          </p>
        </div>
        <div className="mb-5">
          <label
            className="block text-foreground mb-1.5"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            سبب الإتلاف
          </label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={2}
            placeholder="انتهاء الصلاحية / رفض طبي / تلف..."
            className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-red-400 resize-none"
            style={{ fontSize: '13px' }}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ fontSize: '14px', fontWeight: 700 }}
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
            className="flex-1 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
