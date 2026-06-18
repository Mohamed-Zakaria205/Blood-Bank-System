import { bloodStatusColor } from './dashboardConstants';

interface BloodInventoryItem {
  type: string;
  units: number;
  status: string;
  minRequired: number;
}

interface BloodInventoryPanelProps {
  inventory: BloodInventoryItem[];
  onViewAll: () => void;
}

export default function BloodInventoryPanel({ inventory, onViewAll }: BloodInventoryPanelProps) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-foreground" style={{ fontSize: '16px', fontWeight: 700 }}>
          مخزون الدم
        </h2>
        <button
          onClick={onViewAll}
          className="text-green-600 hover:underline"
          style={{ fontSize: '12px' }}
        >
          عرض الكل
        </button>
      </div>
      <div className="space-y-3">
        {inventory.map((b) => (
          <div key={`inv-${b.type}`} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-red-600" style={{ fontSize: '12px', fontWeight: 800 }}>
                {b.type}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-foreground" style={{ fontSize: '12px', fontWeight: 600 }}>
                  {b.units} وحدة
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-white ${bloodStatusColor[b.status]}`}
                  style={{ fontSize: '10px', fontWeight: 700 }}
                >
                  {b.status === 'normal' ? 'طبيعي' : b.status === 'low' ? 'منخفض' : b.status === 'out_of_stock' ? 'نفد' : 'حرج'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${bloodStatusColor[b.status]}`}
                  style={{ width: `${Math.min((b.units / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
