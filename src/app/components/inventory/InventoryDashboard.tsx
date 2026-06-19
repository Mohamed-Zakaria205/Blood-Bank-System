import { useNavigate } from 'react-router';
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Droplets,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { BLOOD_TYPES } from '../../constants';
import type { BloodType } from '../../types';
import { useInventoryDashboard } from '../../hooks/useInventory';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { formatLocalizedDateTime } from '../../utils/date';

export default function InventoryDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: responseData, isLoading, isError } = useInventoryDashboard();

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isError || !responseData)
    return (
      <ErrorState
        message="فشل في تحميل بيانات لوحة التحكم، يرجى المحاولة لاحقاً"
        onRetry={() => window.location.reload()}
      />
    );

  const { summary, alerts, inventoryByBloodType, indicators, recentActivities } = responseData;

  const available = summary.availableCount;
  const expired = alerts.expiredCount;
  const nearExpiryCount = alerts.nearExpiryCount;
  const nearExpiryPreview = alerts.nearExpiryPreview || [];
  const totalExported = summary.issuedCount;
  const totalDisposed = summary.disposedCount;
  const testingCount = summary.testingCount ?? 0;

  // Available by blood type mapping
  const byTypeMap = (inventoryByBloodType || []).reduce(
    (acc, item) => {
      acc[item.bloodType] = item;
      return acc;
    },
    {} as Record<BloodType, (typeof inventoryByBloodType)[0]>,
  );

  // Insights
  const totalBags = indicators.totalBags;
  const expiredRatio = indicators.wastePercentage;
  const grandTotal = totalBags + totalExported + totalDisposed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
          لوحة مخزون الدم
        </h1>
        <p className="text-muted-foreground mt-0.5" style={{ fontSize: '14px' }}>
          مرحباً {user?.name?.split(' ').slice(1, 3).join(' ')} —{' '}
          {format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar })}
        </p>
      </div>

      {/* Critical alerts */}
      {(expired > 0 || nearExpiryCount > 0) && (
        <div className="space-y-2">
          {expired > 0 && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700" style={{ fontSize: '14px', fontWeight: 700 }}>
                  ⛔ {expired} حقيبة منتهية الصلاحية تحتاج إتلافاً فورياً
                </p>
              </div>
              <button
                onClick={() => navigate('/inventory/bags')}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                إجراء <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {nearExpiryCount > 0 && (
            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
              <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <p className="text-orange-700 flex-1" style={{ fontSize: '13px', fontWeight: 600 }}>
                {nearExpiryCount} حقيبة تنتهي خلال 5 أيام:{' '}
                {nearExpiryPreview
                  .map((b) => `${b.bagCode} (${b.bloodType})`)
                  .join(' • ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'حقائب متاحة',
            value: available,
            icon: Package,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-100',
            action: () => navigate('/inventory/bags'),
          },
          {
            label: 'مُصدَّرة',
            value: totalExported,
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            action: () => navigate('/inventory/history'),
          },
          {
            label: 'مُتلَفة',
            value: totalDisposed,
            icon: TrendingDown,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-100',
            action: () => navigate('/inventory/history'),
          },
          {
            label: 'قريبة الانتهاء',
            value: nearExpiryCount,
            icon: Clock,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            action: () => navigate('/inventory/bags'),
          },
        ].map((s, i) => (
          <button
            key={i}
            onClick={s.action}
            className={`bg-card rounded-2xl p-5 border ${s.border} shadow-sm hover:shadow-md transition-all text-right`}
          >
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-foreground" style={{ fontSize: '30px', fontWeight: 800 }}>
              {s.value}
            </div>
            <div className="text-foreground mt-0.5" style={{ fontSize: '13px', fontWeight: 600 }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood type bar */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-foreground" style={{ fontSize: '16px', fontWeight: 700 }}>
              المتاح حسب الفصيلة
            </h2>
            <button
              onClick={() => navigate('/inventory/bags')}
              className="flex items-center gap-1 text-green-600 hover:underline"
              style={{ fontSize: '12px' }}
            >
              الكل <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {BLOOD_TYPES.map((type) => {
              const item = byTypeMap[type];
              const count = item?.availableUnits ?? 0;
              const status = item?.status ?? 'normal';
              const threshold = item?.minimumThreshold ?? 10;
              const pct = threshold > 0 ? Math.min((count / threshold) * 100, 100) : 0;
              const color =
                status === 'out_of_stock'
                  ? 'bg-red-500'
                  : status === 'critical'
                    ? 'bg-orange-400'
                    : 'bg-green-500';
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600" style={{ fontSize: '12px', fontWeight: 800 }}>
                      {type}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all`}
                        style={{
                          width: `${Math.max(pct, count > 0 ? 3 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="text-foreground w-8 text-left"
                    style={{ fontSize: '13px', fontWeight: 700 }}
                  >
                    {count}
                  </span>
                  {status === 'out_of_stock' && (
                    <span
                      className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded"
                      style={{ fontSize: '10px', fontWeight: 700 }}
                    >
                      نفد
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights panel */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Droplets className="w-5 h-5 text-green-600" />
            <h2 className="text-foreground" style={{ fontSize: '16px', fontWeight: 700 }}>
              مؤشرات المخزون
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                label: 'إجمالي الحقائب الفعّالة',
                value: totalBags,
                total: null,
                color: 'text-foreground',
              },
              {
                label: 'المتاحة للاستخدام',
                value: available,
                total: totalBags,
                color: 'text-green-600',
                bar: 'bg-green-500',
              },
              {
                label: 'تحت الفحص المخبري',
                value: testingCount,
                total: totalBags,
                color: 'text-purple-600',
                bar: 'bg-purple-500',
              },
              {
                label: 'مُصدَّرة',
                value: totalExported,
                total: grandTotal,
                color: 'text-blue-600',
                bar: 'bg-blue-500',
              },
              {
                label: 'مُتلَفة (إتلاف / منتهية)',
                value: totalDisposed,
                total: grandTotal,
                color: 'text-red-600',
                bar: 'bg-red-500',
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground" style={{ fontSize: '13px' }}>
                    {item.label}
                  </span>
                  <span className={item.color} style={{ fontSize: '14px', fontWeight: 800 }}>
                    {item.value}
                  </span>
                </div>
                {item.total !== null && item.bar && (
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.bar}`}
                      style={{
                        width: `${item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}

            <div className="mt-2 p-3 bg-muted/40 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground" style={{ fontSize: '13px' }}>
                  نسبة الهدر (إتلاف/منتهي)
                </span>
                <span
                  className={`${expiredRatio > 20 ? 'text-red-600' : 'text-green-600'}`}
                  style={{ fontSize: '14px', fontWeight: 800 }}
                >
                  {expiredRatio}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent outflow */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-foreground" style={{ fontSize: '16px', fontWeight: 700 }}>
            آخر الحركات
          </h2>
          <button
            onClick={() => navigate('/inventory/history')}
            className="flex items-center gap-1 text-green-600 hover:underline"
            style={{ fontSize: '12px' }}
          >
            السجل الكامل <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-muted/40">
                {['رقم السجل', 'الكود', 'الفصيلة', 'النوع', 'المستلم', 'المنفذ', 'التوقيت'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-right text-muted-foreground"
                      style={{ fontSize: '12px', fontWeight: 600 }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentActivities.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded"
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {r.recordCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded"
                      style={{ fontSize: '11px' }}
                    >
                      {r.bagCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                      style={{ fontSize: '12px', fontWeight: 800 }}
                    >
                      {r.bloodType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full ${r.actionType === 'issued' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {r.actionType === 'issued' ? '↑ تصدير' : '✕ إتلاف'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '12px' }}>
                    {r.recipientName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '12px' }}>
                    {(r.performedByName || '').split(' ').slice(1, 3).join(' ')}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '11px' }}>
                    {formatLocalizedDateTime(r.performedAt)}
                  </td>
                </tr>
              ))}
              {recentActivities.length === 0 && (
                <EmptyState colSpan={7} message="لا توجد حركات مسجلة" />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

