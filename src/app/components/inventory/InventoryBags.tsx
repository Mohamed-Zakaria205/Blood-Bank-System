import { useState } from 'react';
import {
  Search,
  Check,
  AlertTriangle,
  Upload,
  Trash2,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import type { BloodBag, BloodType, BloodBagStatus } from '../../types';
import { useBloodBagsStats, usePaginatedBloodBags, useExportBags, useDisposeBag } from '../../hooks/useInventory';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { BLOOD_TYPES } from '../../constants';

// ── Sub-components ──
import { daysUntil, donTypeLabels, getBagStatus } from './inventory-bags/bagsConstants';
import type { ExportFormState } from './inventory-bags/bagsConstants';
import ExportBagsModal from './inventory-bags/ExportBagsModal';
import DisposeBagModal from './inventory-bags/DisposeBagModal';

export default function InventoryBags() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedBloodTypes, setSelectedBloodTypes] = useState<BloodType[]>([]);
  const [donationType, setDonationType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<BloodBagStatus | 'active'>('active');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch backend-driven statistics counts
  const { data: statsData, isLoading: isLoadingStats, isError: isErrorStats } = useBloodBagsStats();

  // Fetch paginated, filtered bags from server
  const {
    data: paginatedResponse,
    isLoading: isLoadingPaginated,
    isError: isErrorPaginated,
  } = usePaginatedBloodBags({
    page,
    limit: 10,
    search: search.trim() || undefined,
    bloodTypes: selectedBloodTypes.length > 0 ? selectedBloodTypes.join(',') : undefined,
    donationType: donationType === 'all' ? undefined : donationType,
    status: filterStatus === 'active' ? 'all' : filterStatus,
    sortBy: 'createdAt',
    sortOrder,
  });

  const exportBagsMutation = useExportBags();
  const disposeBagMutation = useDisposeBag();

  // ── Multi-select ──
  const [selectedBagIds, setSelectedBagIds] = useState<string[]>([]);
  const [selectedBags, setSelectedBags] = useState<BloodBag[]>([]);

  // ── Export modal ──
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // ── Dispose modal ──
  const [bagsToDispose, setBagsToDispose] = useState<BloodBag[] | null>(null);

  const isLoading = isLoadingStats || isLoadingPaginated;
  const isError = isErrorStats || isErrorPaginated;

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
        message="فشل في تحميل حقائب الدم، يرجى المحاولة لاحقاً"
        onRetry={() => window.location.reload()}
      />
    );

  /* ── derived state ── */
  const displayBags = paginatedResponse?.data ?? [];
  const totalCount = paginatedResponse?.total ?? 0;
  const totalPages = paginatedResponse?.totalPages ?? 1;

  const availableCount = statsData?.availableCount ?? 0;
  const expiredCount = statsData?.expiredCount ?? 0;
  const testingCount = statsData?.testingCount ?? 0;
  const issuedCount = statsData?.issuedCount ?? 0;
  const disposedCount = statsData?.disposedCount ?? 0;

  const selectedBagsData = selectedBags;

  const hasActiveFilters =
    search !== '' ||
    selectedBloodTypes.length > 0 ||
    donationType !== 'all' ||
    filterStatus !== 'active' ||
    sortOrder !== 'desc' ||
    page !== 1;

  // Determine selectable bags on page (available or expired)
  const selectablePageIds = displayBags
    .filter((b) => b.status === 'available' || b.status === 'expired')
    .map((b) => b.id);
  const isAllPageSelected =
    selectablePageIds.length > 0 && selectablePageIds.every((id) => selectedBagIds.includes(id));

  /* ── helpers ── */
  const toggleSelect = (bag: BloodBag) => {
    setSelectedBagIds((prev) =>
      prev.includes(bag.id) ? prev.filter((id) => id !== bag.id) : [...prev, bag.id]
    );
    setSelectedBags((prev) =>
      prev.some((b) => b.id === bag.id)
        ? prev.filter((b) => b.id !== bag.id)
        : [...prev, bag]
    );
  };

  const toggleSelectAllPage = () => {
    if (isAllPageSelected) {
      setSelectedBagIds((prev) => prev.filter((id) => !selectablePageIds.includes(id)));
      setSelectedBags((prev) => prev.filter((b) => !selectablePageIds.includes(b.id)));
    } else {
      const pageSelectableBags = displayBags.filter(
        (b) => b.status === 'available' || b.status === 'expired'
      );
      setSelectedBagIds((prev) => {
        const next = [...prev];
        pageSelectableBags.forEach((b) => {
          if (!next.includes(b.id)) next.push(b.id);
        });
        return next;
      });
      setSelectedBags((prev) => {
        const next = [...prev];
        pageSelectableBags.forEach((b) => {
          if (!next.some((existing) => existing.id === b.id)) next.push(b);
        });
        return next;
      });
    }
  };

  const openExportForBag = (bag: BloodBag) => {
    setSelectedBagIds([bag.id]);
    setSelectedBags([bag]);
    setExportModalOpen(true);
  };

  const handleConfirmExport = async (form: ExportFormState) => {
    try {
      const res = await exportBagsMutation.mutateAsync({
        bagIds: selectedBagIds,
        recipient: form,
      });

      if (res.processed > 0 && res.failed > 0) {
        toast.warning(`تم صرف ${res.processed} حقائب بنجاح، وفشل صرف ${res.failed} حقائب.`);
      } else if (res.processed === 0) {
        toast.error(`فشل صرف جميع الحقائب المحددة (${res.failed} حقائب)`);
      } else {
        toast.success(`تم صرف ${res.processed} حقيبة بنجاح`);
      }

      setExportModalOpen(false);
      setSelectedBagIds([]);
      setSelectedBags([]);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء إتمام عملية الصرف');
    }
  };

  const handleDispose = async (reason: string, notes?: string) => {
    if (!bagsToDispose) return;
    try {
      const bagIds = bagsToDispose.map((b) => b.id);
      const res = await disposeBagMutation.mutateAsync({
        bagIds,
        reason,
        notes,
      });

      if (res.processed > 0 && res.failed > 0) {
        toast.warning(`تم إتلاف ${res.processed} حقائب بنجاح، وفشل إتلاف ${res.failed} حقائب.`);
      } else if (res.processed === 0) {
        toast.error(`فشل إتلاف جميع الحقائب المحددة (${res.failed} حقائب)`);
      } else {
        toast.success(`تم إتلاف ${res.processed} حقيبة بنجاح`);
      }

      setBagsToDispose(null);
      setSelectedBagIds([]);
      setSelectedBags([]);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تسجيل عملية الإتلاف');
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const toggleBloodTypeSelection = (type: BloodType) => {
    setSelectedBloodTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setPage(1);
  };

  const clearBloodTypes = () => {
    setSelectedBloodTypes([]);
    setPage(1);
  };

  const handleDonationTypeChange = (val: string) => {
    setDonationType(val);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  };

  const handleStatusFilterChange = (statusVal: BloodBagStatus | 'active') => {
    setFilterStatus(statusVal);
    setPage(1);
  };

  /* ── render ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
          حقائب الدم
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
          جرد شامل لجميع الحقائب المخزنة
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'متاحة وصالحة',
            value: availableCount,
            color: 'text-green-700 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/40',
            ring: 'ring-green-400',
            filter: 'available' as const,
          },
          {
            label: 'منتهية الصلاحية',
            value: expiredCount,
            color: 'text-red-700 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40',
            ring: 'ring-red-400',
            filter: 'expired' as const,
          },
          {
            label: 'يتم اختبارها',
            value: testingCount,
            color: 'text-purple-700 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40',
            ring: 'ring-purple-400',
            filter: 'testing' as const,
          },
          {
            label: 'مُصرَّفة',
            value: issuedCount,
            color: 'text-blue-700 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40',
            ring: 'ring-blue-400',
            filter: 'issued' as const,
          },
          {
            label: 'تالفة / مستبعدة',
            value: disposedCount,
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40',
            ring: 'ring-amber-400',
            filter: 'disposed' as const,
          },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => handleStatusFilterChange(filterStatus === s.filter ? 'active' : s.filter)}
            className={`${s.bg} border rounded-2xl p-4 text-right transition-all hover:scale-[1.01] duration-200 ${filterStatus === s.filter ? `ring-2 ${s.ring} ring-offset-1` : ''
              }`}
          >
            <div className={s.color} style={{ fontSize: '26px', fontWeight: 800 }}>
              {s.value}
            </div>
            <div className={`${s.color} opacity-80`} style={{ fontSize: '12px', fontWeight: 600 }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      {/* ── Bulk Actions Bar ── */}
      {selectedBagIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-2xl shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 dark:bg-green-950/50 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-green-800 dark:text-green-300 font-bold" style={{ fontSize: '14px' }}>
                {selectedBagIds.length}{' '}
                {selectedBagIds.length === 1 ? 'حقيبة محددة' : 'حقائب محددة للعمليات الجماعية'}
              </p>
              <p className="text-green-600 dark:text-green-400 font-mono text-xs truncate max-w-md">
                {selectedBagsData.map((b) => b.bagCode).join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedBagIds([]);
                setSelectedBags([]);
              }}
              className="px-3 py-1.5 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/40 rounded-lg transition-all"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              إلغاء التحديد
            </button>
            <button
              onClick={() => setBagsToDispose(selectedBagsData)}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 dark:bg-red-700 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-600 transition-all shadow-sm"
              style={{ fontSize: '12px', fontWeight: 700 }}
            >
              <Trash2 className="w-4 h-4" />
              إتلاف ({selectedBagIds.length})
            </button>
            <button
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-all shadow-sm"
              style={{ fontSize: '13px', fontWeight: 700 }}
            >
              <Upload className="w-4 h-4" />
              صرف ({selectedBagIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Filters & Sorting Panel */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4 shadow-sm">
        {/* First row: Search, Donation Type, Sort Order */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="بحث بكود الحقيبة أو كود المتبرع..."
              className="w-full pr-9 pl-4 py-2.5 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-500 focus:bg-card transition-all"
              style={{ fontSize: '13px' }}
            />
          </div>

          {/* Donation Type select */}
          <select
            value={donationType}
            onChange={(e) => handleDonationTypeChange(e.target.value)}
            className="px-3 py-2.5 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-500"
            style={{ fontSize: '13px' }}
          >
            <option value="all">كل أنواع التبرع</option>
            <option value="wholeblood">دم كامل (Whole Blood)</option>
            <option value="plasma">بلازما (Plasma)</option>
            <option value="platelets">صفائح دموية (Platelets)</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={toggleSortOrder}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl bg-card hover:bg-muted/40 text-foreground transition-all"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            {sortOrder === 'asc' ? (
              <>
                <ArrowUp className="w-4 h-4 text-green-600" />
                <span>تصاعدي</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-4 h-4 text-green-600" />
                <span>تنازلي</span>
              </>
            )}
          </button>
        </div>

        {/* Second row: Blood Types multi-select pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <span className="text-muted-foreground" style={{ fontSize: '12px', fontWeight: 600 }}>
            تصفية بالفصيلة (تحديد متعدد):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {BLOOD_TYPES.map((type) => {
              const isSelected = selectedBloodTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleBloodTypeSelection(type)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all border
                    ${isSelected
                      ? 'bg-red-600 border-red-600 text-white shadow-sm'
                      : 'bg-card border-border text-foreground hover:bg-muted/50'
                    }`}
                >
                  {type}
                </button>
              );
            })}
            {selectedBloodTypes.length > 0 && (
              <button
                onClick={clearBloodTypes}
                className="px-2.5 py-1 text-xs text-muted-foreground hover:text-red-500 transition-all font-semibold"
              >
                إلغاء التحديد
              </button>
            )}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedBloodTypes([]);
                  setDonationType('all');
                  setFilterStatus('active');
                  setSortOrder('desc');
                  setPage(1);
                }}
                className="px-2.5 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-lg transition-all font-semibold border border-dashed border-red-200 dark:border-red-900/50"
              >
                إعادة ضبط كل الفلاتر
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40">
                <th className="px-4 py-3" style={{ width: '44px' }}>
                  {selectablePageIds.length > 0 && (
                    <button
                      onClick={toggleSelectAllPage}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                        ${isAllPageSelected
                          ? 'bg-green-600 border-green-600'
                          : 'border-border hover:border-green-400'
                        }`}
                    >
                      {isAllPageSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  )}
                </th>
                {[
                  'كود الحقيبة',
                  'الفصيلة',
                  'نوع التبرع',
                  'تاريخ التسجيل',
                  'تاريخ الانتهاء',
                  'الحالة',
                  'إجراء',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right text-muted-foreground"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayBags.map((bag) => {
                const { label, cls, isExpired, isAvailable } = getBagStatus(bag);
                const days = daysUntil(bag.expiryDate);
                // Proximity warning: expires in 5 days or less (and is available status)
                const isNear = isAvailable && days >= 0 && days <= 5;
                const isSelected = selectedBagIds.includes(bag.id);
                return (
                  <tr
                    key={bag.id}
                    className={`hover:bg-muted/40 transition-colors
                      ${isExpired ? 'bg-red-500/5 dark:bg-red-500/10' : ''}
                      ${isSelected ? 'bg-green-500/10 dark:bg-green-500/15' : ''}`}
                  >
                    {/* Checkbox column */}
                    <td className="px-4 py-3">
                      {(bag.status === 'available' || bag.status === 'expired') && (
                        <button
                          onClick={() => toggleSelect(bag)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                            ${isSelected
                              ? 'bg-green-600 border-green-600'
                              : 'border-border hover:border-green-400'
                            }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      )}
                    </td>
                    {/* Code column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded"
                          style={{ fontSize: '11px', fontWeight: 700 }}
                        >
                          {bag.bagCode}
                        </span>
                        {(isExpired || isNear) && (
                          <AlertTriangle
                            className={`w-3.5 h-3.5 ${isExpired ? 'text-red-500' : 'text-orange-400'}`}
                          />
                        )}
                      </div>
                    </td>
                    {/* Blood Type column */}
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded"
                        style={{ fontSize: '12px', fontWeight: 800 }}
                      >
                        {bag.bloodType || '—'}
                      </span>
                    </td>
                    {/* Donation Type column */}
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '12px' }}>
                      {donTypeLabels[bag.donationType] || bag.donationType}
                    </td>
                    {/* Registration Date column */}
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: '12px' }}>
                      {bag.collectedDate}
                    </td>
                    {/* Expiry Date column */}
                    <td className="px-4 py-3">
                      <span
                        className={`${isExpired ? 'text-red-600 dark:text-red-400' : isNear ? 'text-orange-500 dark:text-orange-400' : 'text-muted-foreground'}`}
                        style={{
                          fontSize: '12px',
                          fontWeight: isExpired || isNear ? 700 : 400,
                        }}
                      >
                        {bag.expiryDate}
                        {isExpired && (
                          <span className="mr-1 text-[10px]">
                            (منتهية)
                          </span>
                        )}
                        {isNear && (
                          <span className="mr-1 text-[10px]">
                            ({days}د)
                          </span>
                        )}
                      </span>
                    </td>
                    {/* Status Badge column */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full ${cls}`}
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        {label}
                      </span>
                    </td>
                    {/* Action buttons column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {isAvailable && (
                          <button
                            onClick={() => openExportForBag(bag)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-500/20 transition-all"
                            style={{ fontSize: '11px', fontWeight: 700 }}
                          >
                            <Upload className="w-3.5 h-3.5" /> صرف
                          </button>
                        )}
                        {(isAvailable || isExpired) && (
                          <button
                            onClick={() => setBagsToDispose([bag])}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${isExpired
                              ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20'
                              : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20'
                              }`}
                            style={{ fontSize: '11px', fontWeight: 700 }}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> إتلاف
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {displayBags.length === 0 && <EmptyState colSpan={8} message="لا توجد حقائب متطابقة" />}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
            <p className="text-muted-foreground text-xs">
              عرض الصفحة {page} من {totalPages} (إجمالي {totalCount} حقيبة)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={paginatedResponse ? !paginatedResponse.hasPreviousPage : page === 1}
                className="px-3 py-1.5 border border-border rounded-xl bg-card text-foreground hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold"
              >
                السابق
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={paginatedResponse ? !paginatedResponse.hasNextPage : page === totalPages}
                className="px-3 py-1.5 border border-border rounded-xl bg-card text-foreground hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {exportModalOpen && (
        <ExportBagsModal
          selectedBagsData={selectedBagsData}
          isPending={exportBagsMutation.isPending}
          onConfirm={handleConfirmExport}
          onClose={() => {
            setExportModalOpen(false);
          }}
        />
      )}

      {/* Dispose Modal */}
      {bagsToDispose && (
        <DisposeBagModal
          bags={bagsToDispose}
          isPending={disposeBagMutation.isPending}
          onConfirm={handleDispose}
          onClose={() => {
            setBagsToDispose(null);
          }}
        />
      )}
    </div>
  );
}
