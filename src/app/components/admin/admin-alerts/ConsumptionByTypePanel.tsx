import { AlertTriangle } from 'lucide-react';

interface ConsumptionItem {
  type: string;
  issued: number;
}

interface InventoryItem {
  type: string;
  available: number;
}

interface ConsumptionByTypePanelProps {
  issuedByType: ConsumptionItem[];
  liveInventory: InventoryItem[];
}

export default function ConsumptionByTypePanel({
  issuedByType,
  liveInventory,
}: ConsumptionByTypePanelProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <AlertTriangle className="w-5 h-5 text-green-600" />
        <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
          الاستهلاك حسب الفصيلة
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {issuedByType.map(({ type, issued }) => {
          const inv = liveInventory.find((i) => i.type === type)!;
          const ratio = inv.available > 0 ? issued / (issued + inv.available) : 1;
          const isHigh = ratio > 0.7;
          return (
            <div
              key={type}
              className={`p-4 rounded-xl border ${isHigh ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                  style={{ fontSize: '12px', fontWeight: 800 }}
                >
                  {type}
                </span>
                {isHigh && <AlertTriangle className="w-4 h-4 text-red-500" />}
              </div>
              <div className="text-gray-900" style={{ fontSize: '20px', fontWeight: 800 }}>
                {issued}
              </div>
              <div className="text-gray-500" style={{ fontSize: '11px' }}>
                وحدة مُصرفة
              </div>
              <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isHigh ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                />
              </div>
              <div
                className={`mt-1 ${isHigh ? 'text-red-500' : 'text-gray-400'}`}
                style={{ fontSize: '10px' }}
              >
                {isHigh ? 'استهلاك مرتفع' : 'طبيعي'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
