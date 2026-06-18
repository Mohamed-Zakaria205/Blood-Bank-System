import { useState, useRef } from 'react';
import { Settings2, Save, Check } from 'lucide-react';
import { BLOOD_TYPES } from '../../constants';
import type { BloodType } from '../../types';
import {
  useInventoryAnalytics,
  useInventoryThresholds,
  useUpdateInventoryThresholds,
} from '../../hooks/useInventory';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';

// ── Sub-components ──
import InventoryBarChart from './inventory-alerts/InventoryBarChart';
import IssuanceTrendChart from './inventory-alerts/IssuanceTrendChart';
import ConsumptionByTypePanel from './inventory-alerts/ConsumptionByTypePanel';
import NearExpiryTable from './inventory-alerts/NearExpiryTable';

const DEFAULT_MIN = 10;

export default function InventoryAlerts() {
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    isError: isErrorAnalytics,
  } = useInventoryAnalytics();

  const {
    data: currentThresholds,
    isLoading: isLoadingThresholds,
    isError: isErrorThresholds,
  } = useInventoryThresholds();

  const updateThresholdsMutation = useUpdateInventoryThresholds();

  const thresholdsInitialised = useRef(false);
  const [thresholds, setThresholds] = useState<Record<BloodType, number>>(() =>
    BLOOD_TYPES.reduce(
      (acc, t) => {
        acc[t] = DEFAULT_MIN;
        return acc;
      },
      {} as Record<BloodType, number>,
    ),
  );

  const [editThresholds, setEditThresholds] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync thresholds from API once loaded
  if (!thresholdsInitialised.current && currentThresholds) {
    thresholdsInitialised.current = true;
    const merged = { ...thresholds };
    BLOOD_TYPES.forEach((t) => {
      if (currentThresholds[t] !== undefined) {
        merged[t] = currentThresholds[t];
      }
    });
    setThresholds(merged);
  }

  const isLoading = isLoadingAnalytics || isLoadingThresholds;
  const isError = isErrorAnalytics || isErrorThresholds;

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );

  if (isError || !analytics)
    return (
      <ErrorState
        message="فشل في تحميل التحليلات والتنبيهات، يرجى المحاولة لاحقاً"
        onRetry={() => window.location.reload()}
      />
    );

  // Extract alerts directly calculated by the backend
  const bloodTypeAlerts = analytics.bloodTypeAlerts ?? [];
  const outOfStock = bloodTypeAlerts.filter((i) => i.alertStatus === 'out_of_stock');
  const critical = bloodTypeAlerts.filter((i) => i.alertStatus === 'critical');

  const nearExpiryBags = analytics.expiringSoonBags ?? [];
  const expiringSoonCount = analytics.summary?.expiringSoonCount ?? 0;
  const totalAlerts = outOfStock.length + critical.length + expiringSoonCount;

  const handleSaveThresholds = async () => {
    try {
      await updateThresholdsMutation.mutateAsync(thresholds);
      setSaved(true);
      setEditThresholds(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const availableUnitsMap = analytics.inventoryByBloodType.reduce(
    (acc, item) => {
      acc[item.bloodType] = item.availableUnits;
      return acc;
    },
    {} as Record<BloodType, number>,
  );

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
              key={i.bloodType}
              className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-2xl"
            >
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-red-700" style={{ fontSize: '14px', fontWeight: 800 }}>
                  {i.bloodType}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-red-700" style={{ fontSize: '14px', fontWeight: 700 }}>
                  ⛔ نفدت فصيلة {i.bloodType} من المخزون
                </p>
                <p className="text-red-500" style={{ fontSize: '12px' }}>
                  الحد الأدنى المطلوب: {i.minimumThreshold} وحدة
                </p>
              </div>
            </div>
          ))}
          {critical.map((i) => (
            <div
              key={i.bloodType}
              className="flex items-center gap-3 p-4 bg-orange-50 border-2 border-orange-300 rounded-2xl"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-orange-700" style={{ fontSize: '14px', fontWeight: 800 }}>
                  {i.bloodType}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-orange-700" style={{ fontSize: '14px', fontWeight: 700 }}>
                  ⚠ مخزون {i.bloodType} في مستوى حرج
                </p>
                <p className="text-orange-500" style={{ fontSize: '12px' }}>
                  متاح: {i.availableUnits} — الحد الأدنى: {i.minimumThreshold}
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
            value: analytics.summary?.availableCount ?? 0,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-100',
          },
          {
            label: 'صادر',
            value: analytics.summary?.issuedCount ?? 0,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100',
          },
          {
            label: 'قريبة الانتهاء',
            value: expiringSoonCount,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
          },
          {
            label: 'مُتلفة',
            value: analytics.summary?.disposedCount ?? 0,
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
        <InventoryBarChart data={analytics.inventoryByBloodType ?? []} />
        <IssuanceTrendChart data={analytics.monthlyTrends ?? []} />
      </div>

      {/* Near-expiry table */}
      <NearExpiryTable bags={nearExpiryBags} />

      {/* Consumption by blood type */}
      <ConsumptionByTypePanel
        data={analytics.consumptionByBloodType ?? []}
        availableUnitsMap={availableUnitsMap}
      />
    </div>
  );
}
