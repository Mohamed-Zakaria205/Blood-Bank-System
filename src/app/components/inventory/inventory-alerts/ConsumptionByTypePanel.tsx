import { AlertTriangle } from 'lucide-react';
import type { ConsumptionByBloodTypeItem, BloodType } from '../../../types';

interface ConsumptionByTypePanelProps {
  data: ConsumptionByBloodTypeItem[];
  availableUnitsMap: Record<BloodType, number>;
}

export default function ConsumptionByTypePanel({
  data,
  availableUnitsMap,
}: ConsumptionByTypePanelProps) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <AlertTriangle className="w-5 h-5 text-green-600" />
        <h2 className="text-foreground" style={{ fontSize: '16px', fontWeight: 700 }}>
          الاستهلاك حسب الفصيلة
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {data.map((item) => {
          const type = item.bloodType;
          const issued = item.issuedUnits;
          const isHigh = item.consumptionStatus === 'high';
          const available = availableUnitsMap[type] || 0;
          const total = issued + available;
          const ratio = total > 0 ? issued / total : 0;

          return (
            <div
              key={type}
              className={`p-4 rounded-xl border ${isHigh ? 'bg-red-50 border-red-200' : 'bg-muted/40 border-border'}`}
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
              <div className="text-foreground" style={{ fontSize: '20px', fontWeight: 800 }}>
                {issued}
              </div>
              <div className="text-muted-foreground" style={{ fontSize: '11px' }}>
                وحدة مُصرفة
              </div>
              <div className="mt-2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isHigh ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                />
              </div>
              <div
                className={`mt-1 ${isHigh ? 'text-red-500' : 'text-muted-foreground'}`}
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
