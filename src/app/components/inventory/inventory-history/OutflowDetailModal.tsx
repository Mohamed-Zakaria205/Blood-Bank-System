import {
  X,
  Upload,
  Trash2,
  User,
  Phone,
  CreditCard,
  FileText,
  Clock,
  UserCheck,
} from 'lucide-react';
import type { OutflowRecord } from '../../../types';
import { donTypeLabels } from './historyConstants';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

interface OutflowDetailModalProps {
  record: OutflowRecord;
  onClose: () => void;
}

export default function OutflowDetailModal({ record, onClose }: OutflowDetailModalProps) {
  const isExport = record.actionType === 'exported';
  const modalRef = useModalFocusTrap(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 rounded-t-2xl border-b ${isExport ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${isExport ? 'bg-blue-100' : 'bg-red-100'}`}
            >
              {isExport ? (
                <Upload className="w-4 h-4 text-blue-600" />
              ) : (
                <Trash2 className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div>
              <p
                id="modal-title"
                className={`${isExport ? 'text-blue-700' : 'text-red-700'}`}
                style={{ fontSize: '15px', fontWeight: 700 }}
              >
                {isExport ? 'تفاصيل عملية التصدير' : 'تفاصيل عملية الإتلاف'}
              </p>
              <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                {record.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-card transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Bag info */}
          <div className="p-4 bg-muted/40 rounded-xl space-y-2">
            <p className="text-muted-foreground" style={{ fontSize: '11px', fontWeight: 600 }}>
              معلومات الحقيبة
            </p>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                كود الحقيبة
              </span>
              <span
                className="font-mono text-foreground bg-muted px-2 py-0.5 rounded"
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                {record.bagCode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                الفصيلة
              </span>
              <span
                className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                style={{ fontSize: '13px', fontWeight: 800 }}
              >
                {record.bloodType}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                نوع الدم
              </span>
              <span className="text-foreground" style={{ fontSize: '12px' }}>
                {donTypeLabels[record.donationType] ?? record.donationType}
              </span>
            </div>
          </div>

          {/* Recipient info (export only) */}
          {isExport && (
            <div className="space-y-3">
              <p className="text-muted-foreground" style={{ fontSize: '11px', fontWeight: 600 }}>
                بيانات المستلم
              </p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                    اسم المريض
                  </p>
                  <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 600 }}>
                    {record.recipientName || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                    الرقم القومي
                  </p>
                  <p
                    className="text-foreground font-mono"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    {record.nationalId || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                    رقم الهاتف
                  </p>
                  <p
                    className="text-foreground font-mono"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    {record.phone || '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                {isExport ? 'سبب التصدير' : 'سبب الإتلاف'}
              </p>
              <p className="text-foreground" style={{ fontSize: '13px' }}>
                {record.reason}
              </p>
            </div>
          </div>

          {/* Audit info */}
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                  المنفذ
                </p>
                <p className="text-foreground" style={{ fontSize: '13px', fontWeight: 600 }}>
                  {record.performedByName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                  التاريخ والوقت
                </p>
                <p
                  className="text-foreground font-mono"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  {record.timestamp}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
