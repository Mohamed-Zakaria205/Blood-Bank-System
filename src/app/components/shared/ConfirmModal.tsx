import { AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';

export type ConfirmModalVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'warning',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-600" />,
          bgIcon: 'bg-red-100',
          btnConfirm: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
          bgIcon: 'bg-emerald-100',
          btnConfirm: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        };
      case 'info':
        return {
          icon: <Info className="w-6 h-6 text-blue-600" />,
          bgIcon: 'bg-blue-100',
          btnConfirm: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
      case 'warning':
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          bgIcon: 'bg-amber-100',
          btnConfirm: 'bg-amber-600 hover:bg-amber-700 text-white',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${styles.bgIcon}`}>
              {styles.icon}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-foreground" style={{ fontSize: '18px', fontWeight: 800 }}>
                {title}
              </h3>
              <p className="text-muted-foreground mt-2 leading-relaxed" style={{ fontSize: '14px' }}>
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-foreground hover:bg-muted border border-border transition-colors font-semibold"
            style={{ fontSize: '14px' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl transition-colors font-semibold shadow-sm ${styles.btnConfirm}`}
            style={{ fontSize: '14px' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
