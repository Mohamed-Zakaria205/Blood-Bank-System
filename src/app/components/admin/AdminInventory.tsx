import { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Droplets, RefreshCw } from 'lucide-react';
import type { BloodInventoryItem } from '../../types';
import { useBloodInventory } from '../../hooks/useInventory';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statusColors: Record<string, string> = {
  normal: 'bg-green-100 text-green-700',
  low: 'bg-yellow-100 text-yellow-700',
  critical: 'bg-red-100 text-red-700',
};
const statusLabels: Record<string, string> = {
  normal: 'طبيعي',
  low: 'منخفض',
  critical: 'حرج',
};
const barColors: Record<string, string> = {
  normal: '#22c55e',
  low: '#f59e0b',
  critical: '#ef4444',
};

export default function AdminInventory() {
  const { data: inventoryData = [], isLoading, isError, refetch } = useBloodInventory();
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editUnits, setEditUnits] = useState('');

  // Sync local state with hook data on first load
  if (!initialized && inventoryData.length > 0) {
    setInventory(inventoryData);
    setInitialized(true);
  }

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isError) return <ErrorState message="تعذر تحميل مخزون الدم" onRetry={() => refetch()} />;

  const totalUnits = inventory.reduce((s, b) => s + b.units, 0);
  const criticalCount = inventory.filter((b) => b.status === 'critical').length;
  const lowCount = inventory.filter((b) => b.status === 'low').length;

  const getStatus = (units: number, min: number): BloodInventoryItem['status'] => {
    if (units >= min) return 'normal';
    if (units >= min * 0.5) return 'low';
    return 'critical';
  };

  const saveEdit = (type: string, minRequired: number) => {
    const units = parseInt(editUnits);
    if (isNaN(units) || units < 0) return;
    setInventory((prev) =>
      prev.map((b) =>
        b.type === type
          ? {
              ...b,
              units,
              status: getStatus(units, minRequired),
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : b,
      ),
    );
    setEditId(null);
    setEditUnits('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            مخزون الدم
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            آخر تحديث: اليوم، {new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-600" style={{ fontSize: '12px', fontWeight: 600 }}>
                {criticalCount} فصائل حرجة
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'إجمالي الوحدات',
            value: totalUnits,
            color: 'text-foreground',
            bg: 'bg-card border border-border',
            icon: Droplets,
            iconColor: 'text-green-600',
            iconBg: 'bg-green-50',
          },
          {
            label: 'فصائل طبيعية',
            value: inventory.filter((b) => b.status === 'normal').length,
            color: 'text-green-600',
            bg: 'bg-green-50',
            icon: TrendingUp,
            iconColor: 'text-green-600',
            iconBg: 'bg-green-100',
          },
          {
            label: 'فصائل منخفضة',
            value: lowCount,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
            icon: TrendingDown,
            iconColor: 'text-yellow-600',
            iconBg: 'bg-yellow-100',
          },
          {
            label: 'فصائل حرجة',
            value: criticalCount,
            color: 'text-red-600',
            bg: 'bg-red-50',
            icon: AlertTriangle,
            iconColor: 'text-red-600',
            iconBg: 'bg-red-100',
          },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-5 shadow-sm`}>
            <div
              className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}
            >
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <div className={s.color} style={{ fontSize: '28px', fontWeight: 800 }}>
              {s.value}
            </div>
            <div className="text-muted-foreground" style={{ fontSize: '13px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-foreground mb-5" style={{ fontSize: '16px', fontWeight: 700 }}>
            مستويات المخزون بالفصائل
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={inventory} barSize={32}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                key="x-axis"
                dataKey="type"
                tick={{ fontSize: 12, fill: '#6b7280', fontFamily: 'Tajawal' }}
              />
              <YAxis key="y-axis" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                key="tooltip"
                contentStyle={{
                  fontFamily: 'Tajawal',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  fontSize: '13px',
                }}
                formatter={(v: number) => [`${v} وحدة`, 'المخزون']}
              />
              <Bar
                key="bar-units"
                dataKey="units"
                radius={[6, 6, 0, 0]}
                shape={(props: unknown) => {
                  const { x, y, width, height, index } = props as { x: number; y: number; width: number; height: number; index: number };
                  const item = inventory[index];
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={Math.max(height, 0)}
                      rx={6}
                      ry={6}
                      fill={barColors[item?.status ?? 'normal']}
                    />  
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-3">
            {[
              ['طبيعي', '#22c55e'],
              ['منخفض', '#f59e0b'],
              ['حرج', '#ef4444'],
            ].map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory List */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-foreground mb-5" style={{ fontSize: '16px', fontWeight: 700 }}>
            تفاصيل المخزون
          </h2>
          <div className="space-y-3">
            {inventory.map((b) => (
              <div
                key={b.type}
                className={`p-4 rounded-xl border ${b.status === 'critical' ? 'bg-red-50 border-red-100' : b.status === 'low' ? 'bg-yellow-50 border-yellow-100' : 'bg-muted/40 border-border'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border">
                      <span className="text-red-600" style={{ fontSize: '13px', fontWeight: 800 }}>
                        {b.type}
                      </span>
                    </div>
                    <div>
                      {editId === b.type ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editUnits}
                            onChange={(e) => setEditUnits(e.target.value)}
                            className="w-20 px-2 py-1 border border-green-300 rounded-lg text-foreground outline-none focus:border-green-500 text-center"
                            style={{ fontSize: '14px', fontWeight: 700 }}
                            autoFocus
                          />
                          <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                            وحدة
                          </span>
                          <button
                            onClick={() => saveEdit(b.type, b.minRequired)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                            style={{ fontSize: '12px', fontWeight: 600 }}
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="px-2 py-1 text-muted-foreground hover:bg-muted rounded-lg"
                            style={{ fontSize: '12px' }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span
                            className="text-foreground"
                            style={{ fontSize: '16px', fontWeight: 800 }}
                          >
                            {b.units}
                          </span>
                          <span className="text-muted-foreground mr-1" style={{ fontSize: '13px' }}>
                            وحدة
                          </span>
                        </div>
                      )}
                      <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                        الحد الأدنى: {b.minRequired} | آخر تحديث: {b.lastUpdated}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full ${statusColors[b.status]}`}
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {statusLabels[b.status]}
                    </span>
                    <button
                      onClick={() => {
                        setEditId(b.type);
                        setEditUnits(String(b.units));
                      }}
                      className="p-1.5 text-muted-foreground hover:text-green-600 hover:bg-card rounded-lg transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColors[b.status] === '#22c55e' ? 'bg-green-500' : barColors[b.status] === '#f59e0b' ? 'bg-yellow-400' : 'bg-red-500'}`}
                    style={{
                      width: `${Math.min((b.units / 50) * 100, 100)}%`,
                      backgroundColor: barColors[b.status],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(criticalCount > 0 || lowCount > 0) && (
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-foreground mb-4" style={{ fontSize: '16px', fontWeight: 700 }}>
            تنبيهات المخزون
          </h2>
          <div className="space-y-3">
            {inventory
              .filter((b) => b.status !== 'normal')
              .map((b) => (
                <div
                  key={`alert-inv-${b.type}`}
                  className={`flex items-start gap-3 p-4 rounded-xl ${b.status === 'critical' ? 'bg-red-50 border border-red-100' : 'bg-yellow-50 border border-yellow-100'}`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${b.status === 'critical' ? 'text-red-500' : 'text-yellow-500'}`}
                  />
                  <div className="flex-1">
                    <p
                      className={`${b.status === 'critical' ? 'text-red-700' : 'text-yellow-700'}`}
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      فصيلة {b.type}: المخزون {b.status === 'critical' ? 'في مستوى حرج' : 'منخفض'}
                    </p>
                    <p
                      className={`${b.status === 'critical' ? 'text-red-500' : 'text-yellow-600'}`}
                      style={{ fontSize: '13px' }}
                    >
                      متبقي {b.units} وحدات — الحد الأدنى المطلوب: {b.minRequired} وحدة
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full ${statusColors[b.status]}`}
                    style={{ fontSize: '12px', fontWeight: 700 }}
                  >
                    {statusLabels[b.status]}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
