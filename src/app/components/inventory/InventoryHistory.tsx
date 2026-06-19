import { useState } from 'react';
import { Search, Upload, Trash2, Download, TrendingDown, Package, Eye } from 'lucide-react';
import { OutflowActionType, BloodType } from '../../types';
import { BLOOD_TYPES } from '../../constants';
import { useOutflowRecords, useBloodBagsStats, useOutflowRecordDetail } from '../../hooks/useInventory';
import { exportOutflowReport } from '../../api/inventory';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { formatLocalizedDateTime } from '../../utils/date';


// ── Sub-components & constants ──
import { historyTableHeaders } from './inventory-history/historyConstants';
import OutflowDetailModal from './inventory-history/OutflowDetailModal';

export default function InventoryHistory() {
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState<OutflowActionType | 'all'>('all');
  const [filterBloodType, setFilterBloodType] = useState<BloodType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch stats count and wastePercentage from backend
  const { data: statsData, isLoading: isLoadingStats, isError: isErrorStats } = useBloodBagsStats();

  // Fetch paginated history from server
  const {
    data: outflowResponse,
    isLoading: isLoadingOutflow,
    isError: isErrorOutflow,
  } = useOutflowRecords({
    page,
    limit: 10,
    search: search.trim() || undefined,
    actionType: filterAction === 'all' ? undefined : filterAction,
    bloodType: filterBloodType === 'all' ? undefined : filterBloodType,
  });

  // Fetch lazily full details for modal
  const { data: detailRecord, isLoading: isLoadingDetail } = useOutflowRecordDetail(selectedRecordId);

  if (isLoadingStats || isLoadingOutflow)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isErrorStats || isErrorOutflow)
    return (
      <ErrorState
        message="فشل في تحميل سجل الصادر، يرجى المحاولة لاحقاً"
        onRetry={() => window.location.reload()}
      />
    );

  const outflowRecords = outflowResponse?.data ?? [];
  const totalCount = outflowResponse?.total ?? 0;
  const totalPages = outflowResponse?.totalPages ?? 1;

  const availableNow = statsData?.availableCount ?? 0;
  const totalExported = statsData?.issuedCount ?? 0;
  const totalDisposed = statsData?.disposedCount ?? 0;
  const expiredRatio = statsData?.wastePercentage ?? 0;
  const total = availableNow + totalExported + totalDisposed;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportOutflowReport({
        search: search.trim() || undefined,
        actionType: filterAction === 'all' ? undefined : filterAction,
        bloodType: filterBloodType === 'all' ? undefined : filterBloodType,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `outflow_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterActionChange = (action: OutflowActionType | 'all') => {
    setFilterAction(action);
    setPage(1);
  };

  const handleFilterBloodTypeChange = (bloodType: BloodType | 'all') => {
    setFilterBloodType(bloodType);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {selectedRecordId && (
        <OutflowDetailModal
          record={detailRecord}
          isLoading={isLoadingDetail}
          onClose={() => setSelectedRecordId(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            سجل الصادر
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            {totalCount} عملية مسجلة (تصدير + إتلاف)
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2.5 border border-border text-muted-foreground rounded-xl hover:bg-muted/40 transition-all disabled:opacity-50"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <Download className="w-4 h-4" /> {isExporting ? 'جاري التصدير...' : 'تصدير التقرير'}
        </button>
      </div>

      {/* Insights panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'إجمالي الحقائب الفعّالة',
            value: availableNow,
            icon: Package,
            color: 'text-green-600',
            bg: 'bg-green-50 border-green-100',
          },
          {
            label: 'مُصدَّرة',
            value: totalExported,
            icon: Upload,
            color: 'text-blue-600',
            bg: 'bg-blue-50 border-blue-100',
          },
          {
            label: 'مُتلَفة',
            value: totalDisposed,
            icon: Trash2,
            color: 'text-red-600',
            bg: 'bg-red-50 border-red-100',
          },
          {
            label: 'نسبة الهدر',
            value: `${expiredRatio}%`,
            icon: TrendingDown,
            color: expiredRatio > 20 ? 'text-red-600' : 'text-orange-500',
            bg: expiredRatio > 20 ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100',
          },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border rounded-2xl p-5 shadow-sm`}>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={s.color} style={{ fontSize: '26px', fontWeight: 800 }}>
              {s.value}
            </div>
            <div
              className={`${s.color} opacity-80 mt-0.5`}
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Ratio bar */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-foreground" style={{ fontSize: '14px', fontWeight: 700 }}>
            نسبة التوزيع الكلي
          </span>
          <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
            إجمالي: {total} حقيبة
          </span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          <div
            className="bg-green-500 rounded-r-full"
            style={{
              width: `${total > 0 ? (availableNow / total) * 100 : 0}%`,
            }}
            title="متاح"
          />
          <div
            className="bg-blue-500"
            style={{
              width: `${total > 0 ? (totalExported / total) * 100 : 0}%`,
            }}
            title="مُصدَّر"
          />
          <div
            className="bg-red-500 rounded-l-full"
            style={{
              width: `${total > 0 ? (totalDisposed / total) * 100 : 0}%`,
            }}
            title="مُتلَف"
          />
        </div>
        <div className="flex items-center gap-4 mt-2">
          {[
            { color: 'bg-green-500', label: `متاح (${availableNow})` },
            { color: 'bg-blue-500', label: `مُصدَّر (${totalExported})` },
            { color: 'bg-red-500', label: `مُتلَف (${totalDisposed})` },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
              <span className="text-muted-foreground" style={{ fontSize: '11px' }}>
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="بحث بكود الحقيبة أو الفصيلة أو المستلم..."
              className="w-full pr-9 pl-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400"
              style={{ fontSize: '13px' }}
            />
          </div>
          <select
            value={filterBloodType}
            onChange={(e) => handleFilterBloodTypeChange(e.target.value as BloodType | 'all')}
            className="px-4 py-2.5 border border-border rounded-xl bg-card text-foreground outline-none"
            style={{ fontSize: '13px' }}
          >
            <option value="all">كل الفصائل</option>
            {BLOOD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {(
            [
              ['all', 'الكل'],
              ['issued', 'تصدير فقط'],
              ['disposed', 'إتلاف فقط'],
            ] as [OutflowActionType | 'all', string][]
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => handleFilterActionChange(val)}
              className={`px-4 py-2 rounded-xl transition-all ${filterAction === val ? 'bg-green-600 text-white' : 'bg-card border border-border text-muted-foreground hover:bg-muted/40'}`}
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              {label}
            </button>
          ))}
          {(filterAction !== 'all' || filterBloodType !== 'all' || search) && (
            <button
              onClick={() => {
                setFilterAction('all');
                setFilterBloodType('all');
                setSearch('');
                setPage(1);
              }}
              className="px-3 py-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 border border-border rounded-xl transition-all"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              × مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* History Table */}

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-muted/40">
                {historyTableHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap"
                    style={{ fontSize: '11px', fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {outflowRecords.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded"
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {r.recordCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
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
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${r.actionType === 'issued' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {r.actionType === 'issued' ? (
                        <>
                          <Upload className="w-3 h-3" /> تصدير
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3" /> إتلاف
                        </>
                      )}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-foreground whitespace-nowrap"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  >
                    {r.recipientName ?? '—'}
                  </td>
                  <td
                    className="px-4 py-3 text-muted-foreground whitespace-nowrap"
                    style={{ fontSize: '11px' }}
                  >
                    {(r.performedByName || '').split(' ').slice(1, 3).join(' ')}
                  </td>
                  <td
                    className="px-4 py-3 text-muted-foreground whitespace-nowrap"
                    style={{ fontSize: '11px' }}
                  >
                    {formatLocalizedDateTime(r.performedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedRecordId(r.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                      style={{ fontSize: '11px', fontWeight: 600 }}
                    >
                      <Eye className="w-3.5 h-3.5" /> عرض
                    </button>
                  </td>
                </tr>
              ))}
              {outflowRecords.length === 0 && <EmptyState colSpan={8} message="لا توجد سجلات" />}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
            <p className="text-muted-foreground text-xs">
              عرض الصفحة {page} من {totalPages} (إجمالي {totalCount} عملية)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={outflowResponse ? !outflowResponse.hasPreviousPage : page === 1}
                className="px-3 py-1.5 border border-border rounded-xl bg-card text-foreground hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold"
              >
                السابق
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={outflowResponse ? !outflowResponse.hasNextPage : page === totalPages}
                className="px-3 py-1.5 border border-border rounded-xl bg-card text-foreground hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
