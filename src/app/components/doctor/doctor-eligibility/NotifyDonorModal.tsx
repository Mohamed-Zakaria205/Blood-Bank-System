import { useState } from 'react';
import { Bell, Zap, Send, Smartphone, Users, AlertTriangle, ChevronDown } from 'lucide-react';
import type { NotifModal } from './eligibilityConstants';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';
import { useDonorNotificationPreview } from '../../../hooks/useDonors';
import type { NotificationPreviewRequest } from '../../../types/donor';
import FailedDonorsList from './FailedDonorsList';

interface NotifyDonorModalProps {
  modal: NotifModal;
  previewPayload: NotificationPreviewRequest | null;
  onSend: () => void;
  onCancel: () => void;
  isPending?: boolean;
}

export default function NotifyDonorModal({
  modal,
  previewPayload,
  onSend,
  onCancel,
  isPending = false,
}: NotifyDonorModalProps) {
  const isEmergency = modal.type === 'emergency';
  const modalRef = useModalFocusTrap(onCancel);
  const isBulk = modal.selectionMode === 'filtered' || modal.donors.length > 1;
  const singleDonor = isBulk ? null : modal.donors[0];
  const [showSkips, setShowSkips] = useState(false);

  const { data: previewResponse, isLoading: isPreviewLoading, isError: isPreviewError } = useDonorNotificationPreview(previewPayload);
  const previewData = previewResponse?.data;

  const totalSelected = previewData
    ? (previewData.recipientCount + previewData.failedCount)
    : (modal.selectionMode === 'filtered' ? modal.totalCount ?? 0 : modal.donors.length);
  const recipientCount = previewData?.recipientCount ?? totalSelected;
  const failedCount = previewData?.failedCount ?? 0;
  const failedDonors = previewData?.failedDonors ?? [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div
          className={`p-5 border-b ${isEmergency ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${isEmergency ? 'bg-red-100' : 'bg-green-100'}`}
            >
              {isEmergency ? (
                <Zap className="w-6 h-6 text-red-600" />
              ) : (
                <Bell className="w-6 h-6 text-green-600" />
              )}
            </div>
            <div>
              <h3
                id="modal-title"
                className="text-foreground font-bold"
                style={{ fontSize: '17px' }}
              >
                {isEmergency ? 'إشعار طارئ' : 'إشعار جاهزية للتبرع'}
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                {isBulk ? `إرسال إلى ${isPreviewLoading ? '...' : recipientCount} متبرع` : singleDonor!.name}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Recipient info */}
          <div className="p-3.5 bg-muted/40 rounded-xl space-y-2">
            {isBulk ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                      تم اختيار:
                    </span>
                  </div>
                  <span className="text-foreground font-bold" style={{ fontSize: '13px' }}>
                    {isPreviewLoading ? '...' : `${totalSelected} متبرع`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 dark:text-green-400 font-semibold" style={{ fontSize: '12px' }}>
                    ✅ سيتم الإرسال إلى:
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-bold" style={{ fontSize: '13px' }}>
                    {isPreviewLoading ? '...' : recipientCount}
                  </span>
                </div>
                {!isPreviewLoading && failedCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-amber-600 dark:text-amber-500 font-semibold" style={{ fontSize: '12px' }}>
                      ⚠️ سيتم استبعاد:
                    </span>
                    <span className="text-amber-600 dark:text-amber-500 font-bold" style={{ fontSize: '13px' }}>
                      {failedCount}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: '12px' }}>المتبرع</span>
                  <span className="text-foreground font-semibold" style={{ fontSize: '13px' }}>{singleDonor!.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: '12px' }}>الفصيلة</span>
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded font-extrabold" style={{ fontSize: '12px' }}>
                    {singleDonor!.bloodType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: '12px' }}>الهاتف</span>
                  <span className="text-foreground font-mono" style={{ fontSize: '13px' }}>{singleDonor!.phone}</span>
                </div>
                {!isPreviewLoading && failedCount > 0 && (
                  <div className="flex items-center justify-between border-t border-border pt-1.5 mt-1.5 text-amber-600 dark:text-amber-500">
                    <span style={{ fontSize: '12px' }}>حالة الإرسال:</span>
                    <span className="font-semibold" style={{ fontSize: '12px' }}>⚠️ سيتم استبعاده</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Skip Warning and Collapsible Details */}
          {!isPreviewLoading && failedCount > 0 && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed font-semibold text-right">
                  سيتم استبعاد {failedCount} من المتبرعين لعدم استيفاء الشروط (مثل حد الـ 24 ساعة أو عدم توفر حساب نشط).
                </p>
              </div>

              <div className="border border-border rounded-xl overflow-hidden bg-muted/10">
                <button
                  type="button"
                  onClick={() => setShowSkips(!showSkips)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-muted/20 hover:bg-muted/30 transition-colors text-right"
                >
                  <span className="text-foreground text-xs font-bold">
                    عرض المتبرعين المستبعدين وتفاصيل السبب ({failedCount})
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${showSkips ? 'rotate-180' : ''}`} />
                </button>
                {showSkips && (
                  <div className="p-3 border-t border-border max-h-40 overflow-y-auto bg-card">
                    <FailedDonorsList failedDonors={failedDonors} compact={true} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message preview */}
          <div>
            <label
              htmlFor="message-preview"
              className="block text-foreground mb-2"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              {isPreviewLoading ? 'محتوى الإشعار' : (previewData?.title ?? 'محتوى الإشعار')}
            </label>
            <div id="message-preview" className="p-3 bg-muted/40 border border-border rounded-xl">
              {isPreviewLoading ? (
                <div className="space-y-2 animate-pulse py-2">
                  <div className="h-3.5 bg-muted-foreground/20 rounded w-3/4" />
                  <div className="h-3.5 bg-muted-foreground/20 rounded w-5/6" />
                  <div className="h-3.5 bg-muted-foreground/20 rounded w-2/3" />
                </div>
              ) : isPreviewError ? (
                <p className="text-red-500 text-xs text-center py-2">
                  تعذر تحميل معاينة الإشعار.
                </p>
              ) : (
                <p className="text-foreground" style={{ fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {previewData?.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className="text-blue-600" style={{ fontSize: '12px' }}>
              سيُرسَل الإشعار للتطبيق والرسائل النصية
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onSend}
            disabled={isPending || isPreviewLoading || isPreviewError}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-white rounded-xl transition-all ${isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} ${isPending || isPreviewLoading || isPreviewError ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            style={{ fontSize: '14px', fontWeight: 700 }}
          >
            <Send className="w-4 h-4" /> {isPending ? 'جاري الإرسال...' : 'إرسال الإشعار'}
          </button>
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
