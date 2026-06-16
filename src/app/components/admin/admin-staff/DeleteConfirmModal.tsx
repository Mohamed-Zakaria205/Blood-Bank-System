import { Trash2 } from 'lucide-react';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ onConfirm, onCancel }: DeleteConfirmModalProps) {
  const modalRef = useModalFocusTrap(onCancel);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-card rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center outline-none"
      >
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7 text-red-600" />
        </div>
        <h3
          id="modal-title"
          className="text-foreground mb-2"
          style={{ fontSize: '18px', fontWeight: 700 }}
        >
          حذف الحساب
        </h3>
        <p className="text-muted-foreground mb-6" style={{ fontSize: '14px' }}>
          هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl hover:bg-muted/40 transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
