import { Trash2, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { BloodBag } from '../../../types';
import {
  DISPOSAL_REASONS,
  donTypeLabels,
  BagStatusChip,
  getCurrentUserName,
} from './disposalConstants';

interface ConfirmDisposalModalProps {
  selectedBagsData: BloodBag[];
  category: string;
  targetStatus: 'disposed' | 'rejected';
  notes: string;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDisposalModal({
  selectedBagsData,
  category,
  targetStatus,
  notes,
  isPending,
  onConfirm,
  onClose,
}: ConfirmDisposalModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center gap-3 px-6 py-5 bg-red-50 border-b border-red-100">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-gray-900" style={{ fontSize: '17px', fontWeight: 700 }}>
              تأكيد الإتلاف النهائي
            </h3>
            <p className="text-red-600" style={{ fontSize: '12px' }}>
              هذا الإجراء لا يمكن التراجع عنه — سيتم تسجيله في سجل التدقيق
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Bags list */}
          <div>
            <p className="text-gray-500 mb-2" style={{ fontSize: '11px', fontWeight: 600 }}>
              الحقائب المحددة للإتلاف ({selectedBagsData.length})
            </p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {selectedBagsData.map((bag) => (
                <div
                  key={bag.id}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50/60 border border-red-100 rounded-lg"
                >
                  <span
                    className="font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded"
                    style={{ fontSize: '11px', fontWeight: 700 }}
                  >
                    {bag.bagCode}
                  </span>
                  <span
                    className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded"
                    style={{ fontSize: '11px', fontWeight: 800 }}
                  >
                    {bag.bloodType}
                  </span>
                  <span className="text-gray-500" style={{ fontSize: '11px' }}>
                    {donTypeLabels[bag.donationType]}
                  </span>
                  <span className="mr-auto">
                    <BagStatusChip bag={bag} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Details summary */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
            {[
              {
                icon: '🗂️',
                label: 'سبب الإتلاف',
                value: DISPOSAL_REASONS.find((r) => r.value === category)?.label ?? '—',
              },
              {
                icon: '🏷️',
                label: 'الحالة الجديدة',
                value: targetStatus === 'disposed' ? 'مُتلَف 🗑️' : 'مرفوض 🚫',
              },
              { icon: '👨‍⚕️', label: 'المنفذ', value: getCurrentUserName() },
              ...(notes ? [{ icon: '📝', label: 'الملاحظات', value: notes }] : []),
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 px-4 py-2.5">
                <span style={{ fontSize: '14px', lineHeight: 1.6 }}>{item.icon}</span>
                <span
                  className="text-gray-400 w-28 flex-shrink-0 pt-0.5"
                  style={{ fontSize: '12px' }}
                >
                  {item.label}
                </span>
                <span
                  className="text-gray-800 flex-1"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Final warning */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertOctagon className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-amber-700" style={{ fontSize: '11px' }}>
              لن تظهر هذه الحقائب في المخزون المتاح بعد تأكيد الإتلاف. يمكن مراجعتها في سجل
              الإتلاف.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ fontSize: '14px', fontWeight: 700 }}
          >
            {isPending ? (
              'جارٍ الحفظ...'
            ) : (
              <>
                <Trash2 className="w-4 h-4" /> تأكيد الإتلاف
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
