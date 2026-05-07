import { CheckCircle2, XCircle, X, Check } from 'lucide-react';
import type { LabTest } from '../../../types';
import { screeningTests, donationTypeLabels } from './labConstants';

interface ViewResultModalProps {
  viewModal: LabTest;
  onClose: () => void;
}

export default function ViewResultModal({ viewModal, onClose }: ViewResultModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div
          className={`flex items-center justify-between p-5 rounded-t-2xl ${viewModal.result?.suitable ? 'bg-gradient-to-r from-green-700 to-green-600' : 'bg-gradient-to-r from-red-600 to-red-500'}`}
        >
          <div>
            <h3 className="text-white" style={{ fontSize: '17px', fontWeight: 700 }}>
              نتائج فحص الحقيبة
            </h3>
            <p className="text-white/80" style={{ fontSize: '12px' }}>
              كود العينة: <span className="font-mono font-bold">{viewModal.donorCode}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center hover:bg-white/25"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Result Summary */}
          <div
            className={`flex items-center gap-3 p-4 rounded-xl ${viewModal.result?.suitable ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}
          >
            {viewModal.result?.suitable ? (
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            )}
            <div>
              <p
                className={`${viewModal.result?.suitable ? 'text-green-700' : 'text-red-700'}`}
                style={{ fontSize: '16px', fontWeight: 800 }}
              >
                {viewModal.result?.suitable ? '✅ الدم آمن ومقبول' : '❌ الدم مرفوض'}
              </p>
              <p className="text-gray-600" style={{ fontSize: '13px' }}>
                فصيلة مؤكدة: <strong>{viewModal.result?.confirmedBloodType}</strong> •{' '}
                {donationTypeLabels[viewModal.donationType]}
              </p>
            </div>
          </div>

          {/* Test Results Detail */}
          <div>
            <p className="text-gray-700 mb-3" style={{ fontSize: '13px', fontWeight: 700 }}>
              تفاصيل الفحوصات الأربعة:
            </p>
            <div className="space-y-2">
              {viewModal.result &&
                screeningTests.map((test) => {
                  const val = viewModal.result![test.key];
                  const isPositive = val === 'positive';
                  return (
                    <div
                      key={test.key}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${isPositive ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isPositive ? 'bg-red-100' : 'bg-green-50'}`}
                        >
                          <span
                            className={isPositive ? 'text-red-700' : 'text-green-700'}
                            style={{ fontSize: '9px', fontWeight: 900 }}
                          >
                            {test.abbr}
                          </span>
                        </div>
                        <div>
                          <p
                            className="text-gray-800"
                            style={{ fontSize: '12px', fontWeight: 600 }}
                          >
                            {test.label}
                          </p>
                          <p className="text-gray-400" style={{ fontSize: '10px' }}>
                            {test.desc}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${!isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        {!isPositive ? (
                          <>
                            <Check className="w-3 h-3" /> سالب
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" /> موجب
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {viewModal.result?.notes && (
            <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
              <p className="text-yellow-700" style={{ fontSize: '12px', fontWeight: 600 }}>
                ملاحظات:
              </p>
              <p className="text-yellow-600 mt-0.5" style={{ fontSize: '13px' }}>
                {viewModal.result.notes}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-400" style={{ fontSize: '10px' }}>
                وقت الإكمال
              </p>
              <p className="text-gray-700" style={{ fontSize: '12px', fontWeight: 600 }}>
                {viewModal.result?.completedAt}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-400" style={{ fontSize: '10px' }}>
                طلب التحليل
              </p>
              <p className="text-gray-700" style={{ fontSize: '12px', fontWeight: 600 }}>
                {viewModal.requestedAt}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
