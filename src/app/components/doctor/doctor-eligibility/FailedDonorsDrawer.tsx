import { useState } from 'react';
import { X, FileText, Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';
import { exportFailedDonorsPdf } from '../../../api/donors';
import type { FailedDonorDetail } from '../../../types/donor';

interface FailedDonorsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appealId: string;
  failedDonors: FailedDonorDetail[];
}

export default function FailedDonorsDrawer({
  isOpen,
  onClose,
  appealId,
  failedDonors,
}: FailedDonorsDrawerProps) {
  const modalRef = useModalFocusTrap(onClose, isOpen);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const blob = await exportFailedDonorsPdf(appealId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `تقرير_فشل_الإرسال_${appealId.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('تم تحميل تقرير PDF بنجاح');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('تعذر تحميل ملف الـ PDF. يرجى المحاولة مرة أخرى.', {
        action: {
          label: 'إعادة المحاولة',
          onClick: () => handleDownload(),
        },
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="failed-drawer-title"
        className="relative bg-card w-full max-w-md h-full shadow-2xl flex flex-col border-l border-border animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20">
          <div>
            <h3 id="failed-drawer-title" className="text-foreground font-bold text-base">
              متلقي الإشعارات الفاشلة
            </h3>
            <p className="text-muted-foreground text-[10px] mt-0.5 font-mono">
              ID: {appealId.substring(0, 8)}...
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Download PDF button */}
            <button
              disabled={isExporting}
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-all text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              title="تحميل تقرير PDF"
              aria-label="تحميل تقرير PDF"
            >
              {isExporting ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              {isExporting ? 'جاري التحميل...' : 'تحميل PDF'}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of failed donors */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-300 text-xs leading-relaxed text-right">
              فشلت عملية إرسال الإشعارات إلى المتبرعين التاليين. يمكنك نسخ أرقام هواتفهم للتواصل معهم يدوياً أو تحميل تقرير PDF.
            </p>
          </div>

          <div className="space-y-3">
            {failedDonors.map((donor) => (
              <div
                key={donor.donorId}
                className="p-4 bg-muted/30 border border-border rounded-2xl flex items-start justify-between gap-4 hover:border-border/80 transition-colors text-right"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-foreground text-sm font-bold truncate">
                      {donor.fullName}
                    </span>
                    <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold rounded text-[10px]">
                      {donor.bloodType}
                    </span>
                  </div>
                  <p className="text-red-500 dark:text-red-400 text-xs leading-normal">
                    {donor.failureReason}
                  </p>
                  <div className="flex items-center gap-2 pt-1 justify-start dir-ltr">
                    <span className="text-muted-foreground font-mono text-xs">
                      {donor.phoneNumber}
                    </span>
                    <button
                      onClick={() => handleCopyPhone(donor.phoneNumber, donor.donorId)}
                      className="p-1 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="نسخ رقم الهاتف"
                      aria-label="نسخ رقم الهاتف"
                    >
                      {copiedId === donor.donorId ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
