import { CheckCircle2, XCircle, X, FlaskConical, CreditCard, Check } from 'lucide-react';
import type { ResultEntry } from './labResultsConstants';
import { SCREENING_TESTS } from './labResultsConstants';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';
import { formatLocalizedDateTime } from '../../../utils/date';

interface ResultDetailModalProps {
  entry: ResultEntry;
  onClose: () => void;
}

export default function ResultDetailModal({ entry, onClose }: ResultDetailModalProps) {
  const isSafe = entry.outcome === 'safe';
  const modalRef = useModalFocusTrap(onClose);

  const headerGradient = isSafe
    ? 'linear-gradient(135deg, #15803d, #22c55e)'
    : 'linear-gradient(135deg, #dc2626, #ef4444)';

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden outline-none"
      >
        {/* Header */}
        <div
          className="p-5 flex items-center justify-between"
          style={{ background: headerGradient }}
        >
          <div>
            <h3
              id="modal-title"
              className="text-white"
              style={{ fontSize: '17px', fontWeight: 700 }}
            >
              تفاصيل نتائج الفحص
            </h3>
            <p className="text-white/80" style={{ fontSize: '12px' }}>
              {entry.donorName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-card/20 transition-colors"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Identifiers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <FlaskConical className="w-3 h-3 text-green-600" />
                <div className="text-green-600" style={{ fontSize: '10px', fontWeight: 600 }}>
                  كود العينة
                </div>
              </div>
              <div
                className="font-mono text-green-800"
                style={{ fontSize: '12px', fontWeight: 800 }}
              >
                {entry.sampleCode}
              </div>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3 h-3 text-muted-foreground" />
                <div className="text-muted-foreground" style={{ fontSize: '10px' }}>
                  رقم الهوية
                </div>
              </div>
              <div
                className="font-mono text-foreground"
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                {entry.nationalId}
              </div>
            </div>
          </div>

          {/* Overall Result */}
          <div
            className={`flex items-center gap-3 p-4 rounded-2xl border ${
              isSafe ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
            }`}
          >
            {isSafe ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <div className="text-green-700" style={{ fontSize: '16px', fontWeight: 700 }}>
                    الدم آمن ✓
                  </div>
                  <div className="text-green-600" style={{ fontSize: '13px' }}>
                    جميع الفحوصات سالبة — مقبول
                    {entry.confirmedBloodType && (
                      <>
                        {' '}
                        • فصيلة: <strong>{entry.confirmedBloodType}</strong>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div>
                  <div className="text-red-700" style={{ fontSize: '16px', fontWeight: 700 }}>
                    الدم مرفوض ✗
                  </div>
                  <div className="text-red-600" style={{ fontSize: '13px' }}>
                    نتيجة إيجابية — غير مقبول
                    {entry.confirmedBloodType && (
                      <>
                        {' '}
                        • فصيلة: <strong>{entry.confirmedBloodType}</strong>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Test Details */}
          <div>
            <div className="text-foreground mb-2.5" style={{ fontSize: '13px', fontWeight: 700 }}>
              تفصيل الفحوصات الأربعة:
            </div>
            <div className="space-y-2">
              {SCREENING_TESTS.map((test) => {
                const val = (entry as Record<string, unknown>)[test.key] as string | null;
                const isPositive = val === 'positive';
                return (
                  <div
                    key={test.key}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${isPositive ? 'bg-red-50 border-red-100' : 'bg-muted/40 border-border'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isPositive ? 'bg-red-100' : 'bg-green-50'}`}
                      >
                        <span
                          className={isPositive ? 'text-red-700' : 'text-green-700'}
                          style={{ fontSize: '8px', fontWeight: 900 }}
                        >
                          {test.abbr}
                        </span>
                      </div>
                      <div>
                        <p
                          className="text-foreground"
                          style={{ fontSize: '12px', fontWeight: 600 }}
                        >
                          {test.label}
                        </p>
                        <p className="text-muted-foreground" style={{ fontSize: '10px' }}>
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

          {/* Notes */}
          {entry.notes && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
              <div className="text-yellow-700" style={{ fontSize: '13px' }}>
                <span style={{ fontWeight: 600 }}>ملاحظات: </span>
                {entry.notes}
              </div>
            </div>
          )}

          {/* Footer info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/40 rounded-xl p-3 text-center">
              <div className="text-muted-foreground" style={{ fontSize: '10px' }}>
                طبيب المختبر
              </div>
              <div className="text-foreground" style={{ fontSize: '12px', fontWeight: 600 }}>
                {entry.labDoctor}
              </div>
            </div>
            <div className="bg-muted/40 rounded-xl p-3 text-center">
              <div className="text-muted-foreground" style={{ fontSize: '10px' }}>
                التاريخ
              </div>
              <div className="text-foreground" style={{ fontSize: '12px', fontWeight: 600 }}>
                {entry.date ? formatLocalizedDateTime(entry.date) : ''}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-muted text-muted-foreground hover:bg-muted transition-colors"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
