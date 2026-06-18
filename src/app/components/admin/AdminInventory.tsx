import { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Droplets, RefreshCw } from 'lucide-react';
import { useAdminInventoryDashboard } from '../../hooks/useInventory';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statusColors: Record<string, string> = {
  normal: 'bg-green-100 text-green-700',
  low: 'bg-yellow-100 text-yellow-700',
  critical: 'bg-red-100 text-red-700',
  out_of_stock: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  normal: 'طبيعي',
  low: 'منخفض',
  critical: 'حرج',
  out_of_stock: 'نفد المخزون',
};

const barColors: Record<string, string> = {
  normal: '#22c55e',
  low: '#f59e0b',
  critical: '#ef4444',
  out_of_stock: '#991b1b',
};

export default function AdminInventory() {
  const { data: dashboardData, isLoading, isError, refetch } = useAdminInventoryDashboard();

  // Temporary UI state for local edits simulation
  const [localEdits, setLocalEdits] = useState<Record<string, number>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [editUnits, setEditUnits] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  if (isError || !dashboardData) {
    return <ErrorState message="تعذر تحميل مخزون الدم" onRetry={() => refetch()} />;
  }

  // Derive the active inventory list by overlaying local edits
  const inventory = (dashboardData.inventory ?? []).map((item) => {
    const editedUnits = localEdits[item.bloodType];
    if (editedUnits === undefined) {
      return item;
    }
    // Calculate status locally ONLY for the simulated edit
    const availableUnits = editedUnits;
    const minimumThreshold = item.minimumThreshold;
    const status: 'normal' | 'low' | 'critical' | 'out_of_stock' =
      availableUnits <= 0
        ? 'out_of_stock'
        : availableUnits >= minimumThreshold
        ? 'normal'
        : availableUnits >= minimumThreshold * 0.5
        ? 'low'
        : 'critical';

    return {
      ...item,
      availableUnits,
      status,
      lastUpdated: `${new Date().toISOString().split('T')[0]} (محاكاة مؤقتة)`,
    };
  });

  const hasLocalEdits = Object.keys(localEdits).length > 0;

  // Deriving summary and alerts strictly based on whether simulation is active
  const totalUnits = hasLocalEdits
    ? inventory.reduce((sum, item) => sum + item.availableUnits, 0)
    : dashboardData.summary.totalUnits;

  const normalCount = hasLocalEdits
    ? inventory.filter((item) => item.status === 'normal').length
    : dashboardData.summary.normalCount;

  const lowCount = hasLocalEdits
    ? inventory.filter((item) => item.status === 'low').length
    : dashboardData.summary.lowCount;

  const criticalCount = hasLocalEdits
    ? inventory.filter((item) => item.status === 'critical').length
    : dashboardData.summary.criticalCount;

  const outOfStockCount = hasLocalEdits
    ? inventory.filter((item) => item.status === 'out_of_stock').length
    : dashboardData.summary.outOfStockCount;

  const alerts = hasLocalEdits
    ? inventory
        .filter((item) => item.status !== 'normal')
        .map((item) => ({
          bloodType: item.bloodType,
          availableUnits: item.availableUnits,
          minimumThreshold: item.minimumThreshold,
          status: item.status as 'low' | 'critical' | 'out_of_stock',
        }))
    : dashboardData.alerts ?? [];

  const handleSaveEdit = (bloodType: string) => {
    const units = parseInt(editUnits);
    if (isNaN(units) || units < 0) return;
    setLocalEdits((prev) => ({
      ...prev,
      [bloodType]: units,
    }));
    setEditId(null);
    setEditUnits('');
  };

  const handleClearEdits = () => {
    setLocalEdits({});
  };

  const formattedDate = dashboardData.generatedAt
    ? new Intl.DateTimeFormat('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dashboardData.generatedAt))
    : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            مخزون الدم
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
              آخر تحديث: {formattedDate}
            </p>
            {hasLocalEdits && (
              <button
                onClick={handleClearEdits}
                className="text-xs text-red-600 hover:text-red-800 font-semibold underline"
              >
                إعادة ضبط التعديلات المؤقتة
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(criticalCount > 0 || outOfStockCount > 0) && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-600" style={{ fontSize: '12px', fontWeight: 600 }}>
                {criticalCount + outOfStockCount} فصائل حرجة / نفدت
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
            value: normalCount,
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
            label: 'حرجة / نفدت',
            value: criticalCount + outOfStockCount,
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
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col h-full">
          <h2 className="text-foreground mb-5" style={{ fontSize: '16px', fontWeight: 700 }}>
            مستويات المخزون بالفصائل
          </h2>
          <div className="relative flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventory} barSize={32} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  key="x-axis"
                  dataKey="bloodType"
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
                  dataKey="availableUnits"
                  radius={[6, 6, 0, 0]}
                  shape={(props: unknown) => {
                    const { x, y, width, height, index } = props as {
                      x: number;
                      y: number;
                      width: number;
                      height: number;
                      index: number;
                    };
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
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            {[
              ['طبيعي', '#22c55e'],
              ['منخفض', '#f59e0b'],
              ['حرج', '#ef4444'],
              ['نفد المخزون', '#991b1b'],
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
                key={b.bloodType}
                className={`p-4 rounded-xl border ${b.status === 'critical' || b.status === 'out_of_stock' ? 'bg-red-50 border-red-100' : b.status === 'low' ? 'bg-yellow-50 border-yellow-100' : 'bg-muted/40 border-border'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border">
                      <span className="text-red-600" style={{ fontSize: '13px', fontWeight: 800 }}>
                        {b.bloodType}
                      </span>
                    </div>
                    <div>
                      {editId === b.bloodType ? (
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
                            onClick={() => handleSaveEdit(b.bloodType)}
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
                            {b.availableUnits}
                          </span>
                          <span className="text-muted-foreground mr-1" style={{ fontSize: '13px' }}>
                            وحدة
                          </span>
                        </div>
                      )}
                      <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                        الحد الأدنى: {b.minimumThreshold} | آخر تحديث: {b.lastUpdated}
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
                        setEditId(b.bloodType);
                        setEditUnits(String(b.availableUnits));
                      }}
                      className="p-1.5 text-muted-foreground hover:text-green-600 hover:bg-card rounded-lg transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full`}
                    style={{
                      width: `${Math.min((b.availableUnits / 50) * 100, 100)}%`,
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
      {alerts.length > 0 && (
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-foreground mb-4" style={{ fontSize: '16px', fontWeight: 700 }}>
            تنبيهات المخزون
          </h2>
          <div className="space-y-3">
            {alerts.map((b) => (
              <div
                key={`alert-inv-${b.bloodType}`}
                className={`flex items-start gap-3 p-4 rounded-xl ${b.status === 'critical' || b.status === 'out_of_stock' ? 'bg-red-50 border border-red-100' : 'bg-yellow-50 border border-yellow-100'}`}
              >
                <AlertTriangle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${b.status === 'critical' || b.status === 'out_of_stock' ? 'text-red-500' : 'text-yellow-500'}`}
                />
                <div className="flex-1">
                  <p
                    className={`${b.status === 'critical' || b.status === 'out_of_stock' ? 'text-red-700' : 'text-yellow-700'}`}
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    فصيلة {b.bloodType}: المخزون {b.status === 'critical' ? 'في مستوى حرج' : b.status === 'out_of_stock' ? 'نفد تماماً' : 'منخفض'}
                  </p>
                  <p
                    className={`${b.status === 'critical' || b.status === 'out_of_stock' ? 'text-red-500' : 'text-yellow-600'}`}
                    style={{ fontSize: '13px' }}
                  >
                    متبقي {b.availableUnits} وحدات — الحد الأدنى المطلوب: {b.minimumThreshold} وحدة
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
