import { useState, useRef } from 'react';
import { Settings2, Save, Check } from 'lucide-react';
import { BLOOD_TYPES } from '../../constants';
import type { BloodType } from '../../types';
import { useBloodBags, useBloodInventory, useTransactions, useMonthlyStats } from '../../hooks/useInventory';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';

// ── Sub-components ──
import InventoryBarChart from './inventory-alerts/InventoryBarChart';
import IssuanceTrendChart from './inventory-alerts/IssuanceTrendChart';
import ConsumptionByTypePanel from './inventory-alerts/ConsumptionByTypePanel';
import NearExpiryTable from './inventory-alerts/NearExpiryTable';

const TODAY = new Date();
const DEFAULT_MIN = 10;

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

export default function InventoryAlerts() {
  const { data: bags = [], isLoading: isLoadingBags, isError: isErrorBags } = useBloodBags();
  const { data: inventoryData = [], isLoading: isLoadingInv, isError: isErrorInv } = useBloodInventory();
  const { data: transactions = [], isLoading: isLoadingTx, isError: isErrorTx } = useTransactions();
  const { data: monthlyStats = [], isLoading: isLoadingStats, isError: isErrorStats } = useMonthlyStats();

  // Initialise thresholds from API data (once)
  const thresholdsInitialised = useRef(false);
  const [thresholds, setThresholds] = useState<Record<BloodType, number>>(
    () => BLOOD_TYPES.reduce((acc, t) => { acc[t] = DEFAULT_MIN; return acc; }, {} as Record<BloodType, number>),
  );

  if (!thresholdsInitialised.current && inventoryData.length > 0) {
    thresholdsInitialised.current = true;
    const fromApi = inventoryData.reduce(
      (acc, b) => { acc[b.type] = b.minRequired; return acc; },
      {} as Record<BloodType, number>,
    );
    setThresholds(fromApi);
  }

  const [editThresholds, setEditThresholds] = useState(false);
  const [saved, setSaved] = useState(false);

  const isLoading = isLoadingBags || isLoadingInv || isLoadingTx || isLoadingStats;
  const isError = isErrorBags || isErrorInv || isErrorTx || isErrorStats;

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isError)
    return (
      <ErrorState
        message="فشل في تحميل التنبيهات، يرجى المحاولة لاحقاً"
        onRetry={() => window.location.reload()}
      />
    );

  // Compute live inventory from bags
  const liveInventory = BLOOD_TYPES.map((t) => ({
    type: t,
    available: bags.filter((b) => b.bloodType === t && b.status === 'available').length,
    issued: bags.filter((b) => b.bloodType === t && b.status === 'issued').length,
    min: thresholds[t] ?? DEFAULT_MIN,
  }));

  const outOfStock = liveInventory.filter((i) => i.available === 0);
  const critical = liveInventory.filter((i) => i.available > 0 && i.available < i.min * 0.5);

  const nearExpiry = bags.filter((b) => {
    if (b.status !== 'available') return false;
    const d = daysUntil(b.expiryDate);
    return d >= 0 && d <= 5;
  });
  const wasted = bags.filter((b) => b.status === 'disposed' || b.status === 'expired');

  // Consumption trend: issues per blood type
  const issuedByType = BLOOD_TYPES.map((t) => ({
    type: t,
    issued: transactions
      .filter((tx) => tx.type === 'issue' && tx.bloodType === t)
      .reduce((s, tx) => s + tx.quantity, 0),
  }));

  const handleSaveThresholds = () => {
    setSaved(true);
    setEditThresholds(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalAlerts = outOfStock.length + critical.length + nearExpiry.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            المخزون وتحليلات الدم
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            نظرة شاملة — {totalAlerts} تنبيه نشط
          </p>
        </div>
        <button
          onClick={() => setEditThresholds((p) => !p)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all ${editThresholds ? 'bg-green-600 text-white border-green-600' : 'border-border text-muted-foreground hover:bg-muted/40'}`}
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <Settings2 className="w-4 h-4" />
          {editThresholds ? 'حفظ الحدود' : 'ضبط الحدود الدنيا'}
        </button>
      </div>

      {/* Critical Alerts Banner */}
      {(outOfStock.length > 0 || critical.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {outOfStock.map((i) => (
            <div
              key={i.type}
              className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-2xl"
            >
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-red-700" style={{ fontSize: '14px', fontWeight: 800 }}>
                  {i.type}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-red-700" style={{ fontSize: '14px', fontWeight: 700 }}>
                  ⛔ نفدت فصيلة {i.type} من المخزون
                </p>
                <p className="text-red-500" style={{ fontSize: '12px' }}>
                  الحد الأدنى المطلوب: {i.min} وحدة
                </p>
              </div>
            </div>
          ))}
          {critical.map((i) => (
            <div
              key={i.type}
              className="flex items-center gap-3 p-4 bg-orange-50 border-2 border-orange-300 rounded-2xl"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-orange-700" style={{ fontSize: '14px', fontWeight: 800 }}>
                  {i.type}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-orange-700" style={{ fontSize: '14px', fontWeight: 700 }}>
                  ⚠ مخزون {i.type} في مستوى حرج
                </p>
                <p className="text-orange-500" style={{ fontSize: '12px' }}>
                  متاح: {i.available} — الحد الأدنى: {i.min}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Threshold editor */}
      {editThresholds && (
        <div className="bg-card rounded-2xl p-6 border border-green-200 shadow-sm">
          <h2 className="text-foreground mb-4" style={{ fontSize: '16px', fontWeight: 700 }}>
            ضبط الحدود الدنيا للمخزون
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BLOOD_TYPES.map((t) => (
              <div key={t}>
                <label
                  className="flex items-center gap-2 text-foreground mb-1.5"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  <span
                    className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                    style={{ fontSize: '12px', fontWeight: 800 }}
                  >
                    {t}
                  </span>
                  الحد الأدنى
                </label>
                <input
                  type="number"
                  min={1}
                  value={thresholds[t]}
                  onChange={(e) =>
                    setThresholds((p) => ({
                      ...p,
                      [t]: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 text-center"
                  style={{ fontSize: '14px', fontWeight: 700 }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSaveThresholds}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white transition-all ${saved ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'}`}
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" /> تم الحفظ
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> حفظ
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'إجمالي المتاح',
            value: bags.filter((b) => b.status === 'available').length,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-100',
          },
          {
            label: 'صادر',
            value: bags.filter((b) => b.status === 'issued').length,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100',
          },
          {
            label: 'قريبة الانتهاء',
            value: nearExpiry.length,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
          },
          {
            label: 'مُتلفة',
            value: wasted.length,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-100',
          },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-5 border ${s.border} shadow-sm`}>
            <div className={s.color} style={{ fontSize: '30px', fontWeight: 800 }}>
              {s.value}
            </div>
            <div
              className={`${s.color} opacity-80 mt-0.5`}
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryBarChart data={liveInventory} />
        <IssuanceTrendChart data={monthlyStats} />
      </div>

      {/* Near-expiry table */}
      <NearExpiryTable bags={bags} />

      {/* Consumption by blood type */}
      <ConsumptionByTypePanel issuedByType={issuedByType} liveInventory={liveInventory} />
    </div>
  );
}
