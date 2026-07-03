import { useState } from 'react';
import { X, Building2, Clock, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

import type { BloodDemandDetail } from '../../../types';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';
import { formatLocalizedDateTime } from '../../../utils/date';
import { useCancelBloodDemand } from '../../../hooks/useBloodDemands';
import { ConfirmModal } from '../../shared/ConfirmModal';




interface DemandDetailDrawerProps {
  demand?: BloodDemandDetail;
  isLoading: boolean;
  onClose: () => void;
  onFulfill: (demand: BloodDemandDetail) => void;
}

const STATUS_LABELS: Record<string, string> = {
  Pending: 'معلق',
  PartiallyFulfilled: 'مكتمل جزئياً',
  Fulfilled: 'مكتمل',
  Cancelled: 'ملغي',
};

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  PartiallyFulfilled: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  Fulfilled: 'bg-green-500/10 text-green-500 border border-green-500/20',
  Cancelled: 'bg-red-500/10 text-red-500 border border-red-500/20',
};


const PRIORITY_LABELS: Record<string, string> = {
  Low: 'منخفضة',
  Medium: 'متوسطة',
  High: 'عالية',
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: 'bg-slate-500/10 text-slate-500 border border-slate-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  High: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
};

export default function DemandDetailDrawer({
  demand,
  isLoading,
  onClose,
  onFulfill,
}: DemandDetailDrawerProps) {
  const modalRef = useModalFocusTrap(onClose);
  const cancelMutation = useCancelBloodDemand();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const isPendingOrApproved = demand ? (demand.status === 'Pending' || demand.status === 'Approved') : false;
  const isPartiallyFulfilled = demand ? demand.status === 'PartiallyFulfilled' : false;
  const showCancelButton = isPendingOrApproved || isPartiallyFulfilled;

  const handleCancelClick = () => {
    setConfirmModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!demand) return;
    try {
      await cancelMutation.mutateAsync(demand.id);
      toast.success('تم تعديل حالة الطلب بنجاح');
      setConfirmModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || 'حدث خطأ أثناء تعديل حالة الطلب');
    }
  };



  if (isLoading || !demand) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          className="bg-card w-full max-w-md h-full flex flex-col items-center justify-center p-8 border-l border-border"
        >
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground text-sm">جاري تحميل التفاصيل...</p>
        </div>
      </div>
    );
  }

  const isFulfillable = demand.status === 'Pending' || demand.status === 'PartiallyFulfilled';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="relative bg-card w-full max-w-md h-full shadow-2xl flex flex-col border-l border-border animate-in slide-in-from-left duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20">
          <div>
            <h3 id="drawer-title" className="text-foreground font-bold text-lg">
              تفاصيل طلب الدم
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5 font-mono">
              ID: {demand.id.substring(0, 8)}...
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status and Priority badges */}
          <div className="flex items-center gap-2">
            {(() => {
              const displayStatus = demand.status === 'Approved' ? 'Pending' : demand.status;
              return (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[displayStatus] || ''}`}>
                  {STATUS_LABELS[displayStatus] || displayStatus}
                </span>
              );
            })()}

            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PRIORITY_COLORS[demand.priority]}`}>
              الأولوية: {PRIORITY_LABELS[demand.priority] || demand.priority}
            </span>
          </div>

          {/* Core Info Details */}
          <div className="bg-muted/30 rounded-2xl p-4 border border-border space-y-3.5">
            {/* Requester */}
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground text-[11px]">الجهة الطالبة</p>
                <p className="text-foreground text-sm font-bold">{demand.requesterName}</p>
              </div>
            </div>

            {/* Blood Type & Units */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
              <div>
                <p className="text-muted-foreground text-[11px]">الفصيلة المطلوبة</p>
                <span className="inline-block px-2.5 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold rounded text-sm mt-0.5">
                  {demand.bloodType}
                </span>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">تاريخ الطلب</p>
                <p className="text-foreground text-xs font-mono font-medium mt-0.5">
                  {formatLocalizedDateTime(demand.requestDate)}
                </p>
              </div>
            </div>

            {/* Units Summary */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/40 text-center">
              <div className="bg-card p-2 rounded-xl border border-border/60">
                <p className="text-muted-foreground text-[10px]">المطلوب</p>
                <p className="text-foreground text-base font-extrabold">{demand.requestedUnits}</p>
              </div>
              <div className="bg-card p-2 rounded-xl border border-border/60">
                <p className="text-blue-600 dark:text-blue-400 text-[10px]">المنصرف</p>
                <p className="text-blue-600 dark:text-blue-400 text-base font-extrabold">{demand.issuedUnits}</p>
              </div>
              <div className="bg-card p-2 rounded-xl border border-border/60">
                <p className="text-green-600 dark:text-green-400 text-[10px]">المتبقي</p>
                <p className="text-green-600 dark:text-green-400 text-base font-extrabold">{demand.remainingUnits}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {demand.notes && (
            <div className="space-y-1.5">
              <h4 className="text-foreground text-xs font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" /> ملاحظات الطلب
              </h4>
              <p className="text-muted-foreground text-xs bg-muted/20 p-3 rounded-xl border border-border/50 whitespace-pre-wrap leading-relaxed">
                {demand.notes}
              </p>
            </div>
          )}

          {/* Issuance History */}
          <div className="space-y-3">
            <h4 className="text-foreground text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" /> سجل التوريد والصرف
            </h4>
            {demand.issuanceHistory && demand.issuanceHistory.length > 0 ? (
              <div className="space-y-3">
                {demand.issuanceHistory.map((item, idx) => (
                  <div key={item.issuanceId || idx} className="p-3 bg-muted/20 border border-border rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded">
                        {item.serialNumber}
                      </span>
                      <span className="text-muted-foreground font-mono">
                        {formatLocalizedDateTime(item.issuedAt)}
                      </span>
                    </div>
                    
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>المستلم:</span>
                        <span className="text-foreground font-medium">{item.recipientName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>الرقم القومي:</span>
                        <span className="text-foreground font-mono">{item.nationalId || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>المسؤول المنفذ:</span>
                        <span className="text-foreground font-medium">{item.issuedByName}</span>
                      </div>
                      {item.reason && (
                        <div className="pt-1 border-t border-border/20 mt-1">
                          <span>السبب: </span>
                          <span className="text-foreground">{item.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-muted/10 rounded-xl border border-dashed border-border/60">
                <p className="text-muted-foreground text-xs">لا توجد عمليات صرف مسجلة لهذا الطلب بعد</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {isFulfillable && (
          <div className="p-6 border-t border-border bg-card space-y-2.5">
            <button
              onClick={() => onFulfill(demand)}
              className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
              style={{ fontSize: '14px' }}
            >
              <Upload className="w-4 h-4" /> تحديد حقائب للصرف
            </button>
            {showCancelButton && (
              <button
                disabled={cancelMutation.isPending}
                onClick={handleCancelClick}
                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border disabled:opacity-50 hover:scale-[1.01]
                  ${isPendingOrApproved
                    ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm'
                    : 'bg-card border-border hover:bg-muted text-foreground'
                  }`}
                style={{ fontSize: '14px' }}
              >
                {cancelMutation.isPending
                  ? 'جاري المعالجة...'
                  : isPendingOrApproved
                  ? 'إلغاء الطلب'
                  : 'إنهاء / إغلاق الطلب'}
              </button>
            )}
          </div>
        )}

      {confirmModalOpen && (
        <ConfirmModal
          title={isPendingOrApproved ? 'تأكيد إلغاء الطلب' : 'تأكيد إغلاق الطلب'}
          message={
            isPendingOrApproved
              ? 'هل أنت متأكد من إلغاء هذا الطلب بالكامل؟ لا يمكن التراجع عن هذا الإجراء لاحقاً.'
              : 'هل أنت متأكد من إغلاق هذا الطلب والكتفاء بالكمية المنصرفة حالياً؟'
          }
          confirmLabel={isPendingOrApproved ? 'تأكيد الإلغاء' : 'تأكيد الإغلاق'}
          onConfirm={handleCancelConfirm}
          onClose={() => setConfirmModalOpen(false)}
          isDestructive={isPendingOrApproved}
          isLoading={cancelMutation.isPending}
        />
      )}
      </div>
    </div>
  );
}

