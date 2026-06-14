import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

interface CustomDateModalProps {
  onClose: () => void;
  onApply: (fromDate: string, toDate: string) => void;
  initialFromDate?: string;
  initialToDate?: string;
}

export default function CustomDateModal({
  onClose,
  onApply,
  initialFromDate = '',
  initialToDate = '',
}: CustomDateModalProps) {
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [error, setError] = useState('');

  const modalRef = useModalFocusTrap(onClose);

  // Clear error when user makes changes
  useEffect(() => {
    setError('');
  }, [fromDate, toDate]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      setError('يرجى تحديد تاريخ البدء وتاريخ الانتهاء.');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setError('تاريخ البدء لا يمكن أن يكون بعد تاريخ الانتهاء.');
      return;
    }

    onApply(fromDate, toDate);
  };

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
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden outline-none border border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-card">
          <h3 id="modal-title" className="text-foreground" style={{ fontSize: '16px', fontWeight: 700 }}>
            تحديد فترة مخصصة
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition-all"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleApply} className="p-5 space-y-4">
          <div className="space-y-3">
            <div>
              <label
                htmlFor="from-date-input"
                className="block text-muted-foreground mb-1.5"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                من تاريخ
              </label>
              <input
                id="from-date-input"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all text-right"
                style={{ fontSize: '13px' }}
              />
            </div>

            <div>
              <label
                htmlFor="to-date-input"
                className="block text-muted-foreground mb-1.5"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                إلى تاريخ
              </label>
              <input
                id="to-date-input"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all text-right"
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Validation Error Message */}
          {error && (
            <div
              className="text-red-600 bg-red-50/50 border border-red-100 px-3 py-2 rounded-xl text-center"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 text-white rounded-xl shadow-sm hover:opacity-90 transition-all"
              style={{
                background: 'linear-gradient(135deg, #15803d, #16a34a)',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              تطبيق
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-border rounded-xl bg-card text-muted-foreground hover:bg-muted transition-all"
              style={{
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
