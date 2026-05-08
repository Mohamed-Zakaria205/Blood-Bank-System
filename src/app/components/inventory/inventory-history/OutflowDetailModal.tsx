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

interface OutflowDetailModalProps {
  record: OutflowRecord;
  onClose: () => void;
}

export default function OutflowDetailModal({ record, onClose }: OutflowDetailModalProps) {
  const isExport = record.actionType === 'exported';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
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
                className={`${isExport ? 'text-blue-700' : 'text-red-700'}`}
                style={{ fontSize: '15px', fontWeight: 700 }}
              >
                {isExport ? 'تفاصيل عملية التصدير' : 'تفاصيل عملية الإتلاف'}
              </p>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>
                {record.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Bag info */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-2">
            <p className="text-gray-500" style={{ fontSize: '11px', fontWeight: 600 }}>
              معلومات الحقيبة
            </p>
            <div className="flex items-center justify-between">
              <span className="text-gray-600" style={{ fontSize: '12px' }}>
                كود الحقيبة
              </span>
              <span
                className="font-mono text-gray-800 bg-gray-200 px-2 py-0.5 rounded"
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                {record.bagCode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600" style={{ fontSize: '12px' }}>
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
              <span className="text-gray-600" style={{ fontSize: '12px' }}>
                نوع الدم
              </span>
              <span className="text-gray-700" style={{ fontSize: '12px' }}>
                {donTypeLabels[record.donationType] ?? record.donationType}
              </span>
            </div>
          </div>

          {/* Recipient info (export only) */}
          {isExport && (
            <div className="space-y-3">
              <p className="text-gray-500" style={{ fontSize: '11px', fontWeight: 600 }}>
                بيانات المستلم
              </p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-500" style={{ fontSize: '11px' }}>
                    اسم المريض
                  </p>
                  <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                    {record.recipientName || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-gray-500" style={{ fontSize: '11px' }}>
                    الرقم القومي
                  </p>
                  <p
                    className="text-gray-900 font-mono"
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
                  <p className="text-gray-500" style={{ fontSize: '11px' }}>
                    رقم الهاتف
                  </p>
                  <p
                    className="text-gray-900 font-mono"
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
              <p className="text-gray-500" style={{ fontSize: '11px' }}>
                {isExport ? 'سبب التصدير' : 'سبب الإتلاف'}
              </p>
              <p className="text-gray-800" style={{ fontSize: '13px' }}>
                {record.reason}
              </p>
            </div>
          </div>

          {/* Audit info */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-500" style={{ fontSize: '11px' }}>
                  المنفذ
                </p>
                <p className="text-gray-800" style={{ fontSize: '13px', fontWeight: 600 }}>
                  {record.performedByName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-500" style={{ fontSize: '11px' }}>
                  التاريخ والوقت
                </p>
                <p
                  className="text-gray-800 font-mono"
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
            className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
