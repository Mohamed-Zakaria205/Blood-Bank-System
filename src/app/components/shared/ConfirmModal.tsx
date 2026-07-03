import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';

interface ConfirmModalProps {
  isOpen?: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose?: () => void;
  onCancel?: () => void;
  isDestructive?: boolean;
  variant?: 'success' | 'danger';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen = true,
  title,
  message,
  confirmLabel,
  cancelLabel = 'تراجع',
  onConfirm,
  onClose,
  onCancel,
  isDestructive = false,
  variant,
  isLoading = false,
}: ConfirmModalProps) {
  // Support both cancel actions
  const handleCancel = onCancel || onClose || (() => {});
  const modalRef = useModalFocusTrap(handleCancel);

  // Map variant to isDestructive
  const finalDestructive = isDestructive || variant === 'danger';
  const finalConfirmLabel = confirmLabel || (finalDestructive ? 'تأكيد الإجراء' : 'تأكيد');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border outline-none animate-in scale-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${finalDestructive ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
              {finalDestructive ? (
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            <h3
              id="confirm-modal-title"
              className="text-foreground font-bold"
              style={{ fontSize: '15px' }}
            >
              {title}
            </h3>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed text-right">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl hover:bg-muted transition-all text-sm font-semibold disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-2.5 text-white rounded-xl transition-all font-bold text-sm shadow-sm disabled:opacity-70
                ${finalDestructive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              {isLoading ? 'جاري المعالجة...' : finalConfirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
