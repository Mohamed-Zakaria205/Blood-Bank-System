import type { BloodBag, HospitalRequest } from '../../../types';

interface FulfillRequestModalProps {
  request: HospitalRequest;
  compatibleBags: BloodBag[];
  selectedBags: string[];
  onToggleBag: (bagId: string) => void;
  onFulfill: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function FulfillRequestModal({
  request,
  compatibleBags,
  selectedBags,
  onToggleBag,
  onFulfill,
  onCancel,
  isPending,
}: FulfillRequestModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-gray-900 mb-1" style={{ fontSize: '18px', fontWeight: 700 }}>
          صرف طلب {request.hospitalName}
        </h3>
        <p className="text-gray-500 mb-4" style={{ fontSize: '13px' }}>
          مطلوب: {request.quantity} وحدة {request.bloodType} — حدد الحقائب المناسبة
        </p>

        {selectedBags.length > 0 && (
          <div className="mb-3 p-2 bg-green-50 border border-green-100 rounded-xl">
            <p className="text-green-700" style={{ fontSize: '12px', fontWeight: 600 }}>
              محدد: {selectedBags.length} / {request.quantity} وحدة
              {selectedBags.length >= request.quantity && ' ✓ جاهز للصرف'}
            </p>
          </div>
        )}

        <div className="space-y-2 max-h-72 overflow-y-auto mb-5">
          {compatibleBags.length === 0 ? (
            <p className="text-gray-400 text-center py-4" style={{ fontSize: '13px' }}>
              لا توجد حقائب متاحة من هذه الفصيلة
            </p>
          ) : (
            compatibleBags.map((bag) => {
              const days = Math.ceil(
                (new Date(bag.expiryDate).getTime() - new Date('2025-04-29').getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              return (
                <label
                  key={bag.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedBags.includes(bag.id) ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-green-200'}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedBags.includes(bag.id)}
                    onChange={() => onToggleBag(bag.id)}
                    className="w-4 h-4 rounded accent-green-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        {bag.bagCode}
                      </span>
                    </div>
                    <p className="text-gray-500" style={{ fontSize: '11px' }}>
                      ينتهي: {bag.expiryDate}{' '}
                      {days <= 5 && <span className="text-orange-500">(⚠ {days} أيام)</span>}
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onFulfill}
            disabled={selectedBags.length === 0 || isPending}
            className={`flex-1 py-2.5 text-white rounded-xl transition-all ${selectedBags.length === 0 || isPending ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            {isPending ? 'جارٍ الصرف...' : `تأكيد الصرف (${selectedBags.length} حقيبة)`}
          </button>
          <button
            onClick={onCancel}
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
