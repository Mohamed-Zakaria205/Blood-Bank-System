import { AlertTriangle, TrendingUp, Users } from 'lucide-react';

interface BloodInventoryItem {
  type: string;
  units: number;
  status: string;
  minRequired: number;
}

interface SystemAlertsPanelProps {
  bloodInventory: BloodInventoryItem[];
}

export default function SystemAlertsPanel({ bloodInventory }: SystemAlertsPanelProps) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      <h2 className="text-foreground mb-5" style={{ fontSize: '16px', fontWeight: 700 }}>
        تنبيهات النظام
      </h2>
      <div className="space-y-3">
        {bloodInventory
          .filter((b) => b.status !== 'normal')
          .map((b) => (
            <div
              key={`alert-${b.type}`}
              className={`flex items-start gap-3 p-3 rounded-xl ${b.status === 'critical' || b.status === 'out_of_stock' ? 'bg-red-50 border border-red-100' : 'bg-yellow-50 border border-yellow-100'}`}
            >
              <AlertTriangle
                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${b.status === 'critical' || b.status === 'out_of_stock' ? 'text-red-500' : 'text-yellow-500'}`}
              />
              <div>
                <p
                  className={`${b.status === 'critical' || b.status === 'out_of_stock' ? 'text-red-700' : 'text-yellow-700'}`}
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  مخزون {b.type} {b.status === 'critical' ? 'حرج' : b.status === 'out_of_stock' ? 'نفد تماماً' : 'منخفض'}
                </p>
                <p
                  className={`${b.status === 'critical' || b.status === 'out_of_stock' ? 'text-red-500' : 'text-yellow-600'}`}
                  style={{ fontSize: '12px' }}
                >
                  متبقي {b.units} وحدات (الحد الأدنى: {b.minRequired})
                </p>
              </div>
            </div>
          ))}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
          <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-700" style={{ fontSize: '13px', fontWeight: 600 }}>
              ارتفاع التبرعات
            </p>
            <p className="text-green-600" style={{ fontSize: '12px' }}>
              زيادة 15% مقارنة بالشهر السابق
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <Users className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-700" style={{ fontSize: '13px', fontWeight: 600 }}>
              حملة جديدة قيد التنفيذ
            </p>
            <p className="text-blue-600" style={{ fontSize: '12px' }}>
              حملة مستشفى ناصر - 42 متبرع
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
