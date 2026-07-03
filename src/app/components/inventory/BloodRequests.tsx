import { useState } from 'react';
import { Search, Plus, Eye } from 'lucide-react';


import { useNavigate } from 'react-router';
import { BLOOD_TYPES } from '../../constants';
import {
  usePaginatedBloodDemands,
  useBloodDemandDetail,
  useBloodDemandDashboard,
} from '../../hooks/useBloodDemands';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { formatLocalizedDate } from '../../utils/date';
import CreateDemandModal from './blood-requests/CreateDemandModal';
import DemandDetailDrawer from './blood-requests/DemandDetailDrawer';
import type { BloodDemandDetail, BloodDemandFilters, BloodDemandStatus, BloodDemandPriority, BloodType } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  Pending: 'معلق',
  PartiallyFulfilled: 'مكتمل جزئياً',
  Fulfilled: 'مكتمل',
  Cancelled: 'ملغي',
};

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  PartiallyFulfilled: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  Fulfilled: 'bg-green-500/10 text-green-500 border border-green-500/20',
  Cancelled: 'bg-red-500/10 text-red-500 border border-red-500/20',
};



const PRIORITY_LABELS: Record<string, string> = {
  Low: 'منخفضة',
  Medium: 'متوسطة',
  High: 'عالية',
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: 'bg-slate-500/10 text-slate-500 border border-slate-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  High: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
};

export default function BloodRequests() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<BloodDemandStatus | ''>('');
  const [filterBloodType, setFilterBloodType] = useState<BloodType | ''>('');
  const [filterPriority, setFilterPriority] = useState<BloodDemandPriority | ''>('');
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDemandId, setSelectedDemandId] = useState<string | null>(null);

  // Fetch paginated requests
  const filters: BloodDemandFilters = {
    page,
    limit: 10,
    search: search.trim() || undefined,
    status: filterStatus || undefined,
    bloodType: filterBloodType || undefined,
    priority: filterPriority || undefined,
  };

  const {
    data: demandsResponse,
    isLoading: isLoadingList,
    isError: isErrorList,
  } = usePaginatedBloodDemands(filters);

  // Fetch dashboard summary counts
  const {
    data: dashboardStats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useBloodDemandDashboard();

  // Lazy-load details for selected demand drawer
  const {
    data: detailDemand,
    isLoading: isLoadingDetail,
  } = useBloodDemandDetail(selectedDemandId);

  const isLoading = isLoadingList || isLoadingStats;
  const isError = isErrorList || isErrorStats;

  if (isLoading) {
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton count={4} />
        <TableSkeleton rows={5} cols={8} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="فشل في تحميل طلبات الدم، يرجى المحاولة لاحقاً"
        onRetry={() => window.location.reload()}
      />
    );
  }

  const demands = demandsResponse?.data ?? [];
  const totalCount = demandsResponse?.total ?? 0;
  const totalPages = demandsResponse?.totalPages ?? 1;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setFilterStatus(val as BloodDemandStatus | '');
    setPage(1);
  };

  const handleBloodTypeFilterChange = (val: string) => {
    setFilterBloodType(val as BloodType | '');
    setPage(1);
  };

  const handlePriorityFilterChange = (val: string) => {
    setFilterPriority(val as BloodDemandPriority | '');
    setPage(1);
  };

  const handleTriggerFulfillment = (demand: BloodDemandDetail) => {
    setSelectedDemandId(null);
    navigate(`/inventory/bags?demandId=${demand.id}`);
  };

  const hasActiveFilters = search !== '' || filterStatus !== '' || filterBloodType !== '' || filterPriority !== '' || page !== 1;

  return (
    <div className="space-y-6">
      {/* Detail Drawer */}
      {selectedDemandId && (
        <DemandDetailDrawer
          demand={detailDemand}
          isLoading={isLoadingDetail}
          onClose={() => setSelectedDemandId(null)}
          onFulfill={handleTriggerFulfillment}
        />
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <CreateDemandModal onClose={() => setCreateModalOpen(false)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground font-extrabold text-2xl">طلبات الدم</h1>
          <p className="text-muted-foreground text-sm">
            إدارة ومتابعة طلبات الفئات والمستشفيات لتوريد حقائب الدم
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-md font-bold hover:scale-[1.01]"
          style={{ fontSize: '13px' }}
        >
          <Plus className="w-4.5 h-4.5" /> طلب جديد
        </button>
      </div>

      {/* Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'إجمالي الطلبات',
            value: dashboardStats?.total ?? 0,
            color: 'text-foreground',
            bg: 'bg-card border-border/80',
            icon: '📋',
          },
          {
            label: 'طلبات معلقة',
            value: dashboardStats?.pending ?? 0,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/30',
            icon: '⏳',
          },
          {
            label: 'مكتملة جزئياً',
            value: dashboardStats?.partiallyFulfilled ?? 0,
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-950/15 border-orange-200 dark:border-orange-900/30',
            icon: '🔄',
          },
          {
            label: 'طلبات مكتملة',
            value: dashboardStats?.fulfilled ?? 0,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-950/15 border-green-200 dark:border-green-900/30',
            icon: '✅',
          },
        ].map((c) => (
          <div key={c.label} className={`${c.bg} border rounded-2xl p-5 shadow-sm relative overflow-hidden`}>
            <span className="absolute left-4 top-4 text-2xl opacity-40">{c.icon}</span>
            <div className={c.color} style={{ fontSize: '28px', fontWeight: 800 }}>
              {c.value}
            </div>
            <div className={`${c.color} opacity-80 font-bold`} style={{ fontSize: '12px', marginTop: '4px' }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters Panel */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="بحث بالجهة المستدعية..."
              className="w-full pr-9 pl-4 py-2.5 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-500 focus:bg-card transition-all"
              style={{ fontSize: '13px' }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="px-3 py-2.5 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-500"
            style={{ fontSize: '13px' }}
          >
            <option value="">كل الحالات</option>
            <option value="Pending">معلق (Pending)</option>
            <option value="PartiallyFulfilled">مكتمل جزئياً (Partially)</option>
            <option value="Fulfilled">مكتمل (Fulfilled)</option>
            <option value="Cancelled">ملغي (Cancelled)</option>
          </select>



          {/* Blood Type Filter */}
          <select
            value={filterBloodType}
            onChange={(e) => handleBloodTypeFilterChange(e.target.value)}
            className="px-3 py-2.5 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-500"
            style={{ fontSize: '13px' }}
          >
            <option value="">كل الفصائل</option>
            {BLOOD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => handlePriorityFilterChange(e.target.value)}
            className="px-3 py-2.5 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-500"
            style={{ fontSize: '13px' }}
          >
            <option value="">كل المستويات</option>
            <option value="Low">منخفضة</option>
            <option value="Medium">متوسطة</option>
            <option value="High">عالية (عاجل)</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end pt-1 border-t border-border/40">
            <button
              onClick={() => {
                setSearch('');
                setFilterStatus('');
                setFilterBloodType('');
                setFilterPriority('');
                setPage(1);
              }}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold border border-dashed border-red-200 dark:border-red-900/50 px-3 py-1.5 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-all"
            >
              إعادة ضبط كل الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-muted/40">
                {[
                  'كود الطلب',
                  'المستشفى / الجهة',
                  'الفصيلة',
                  'المطلوب',
                  'المنصرف',
                  'المتبقي',
                  'الأولوية',
                  'الحالة',
                  'تاريخ الطلب',
                  'إجراءات',
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
              {demands.map((demand) => (
                <tr
                  key={demand.id}
                  onClick={() => setSelectedDemandId(demand.id)}
                  className="hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  {/* ID */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2.5 py-0.5 rounded text-xs font-bold">
                      #{demand.id.substring(0, 8)}
                    </span>
                  </td>
                  {/* Hospital */}
                  <td className="px-4 py-3 text-foreground font-bold" style={{ fontSize: '13px' }}>
                    {demand.requesterName}
                  </td>
                  {/* Blood Type */}
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded text-xs font-bold">
                      {demand.bloodType}
                    </span>
                  </td>
                  {/* Required */}
                  <td className="px-4 py-3 text-foreground font-bold" style={{ fontSize: '13px' }}>
                    {demand.requestedUnits}
                  </td>
                  {/* Issued */}
                  <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-bold" style={{ fontSize: '13px' }}>
                    {demand.issuedUnits}
                  </td>
                  {/* Remaining */}
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 font-bold" style={{ fontSize: '13px' }}>
                    {demand.remainingUnits}
                  </td>
                  {/* Priority */}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${PRIORITY_COLORS[demand.priority]}`}>
                      {PRIORITY_LABELS[demand.priority]}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    {(() => {
                      const displayStatus = demand.status === 'Approved' ? 'Pending' : demand.status;
                      return (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[displayStatus] || ''}`}>
                          {STATUS_LABELS[displayStatus] || displayStatus}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                    {formatLocalizedDate(demand.requestDate)}
                  </td>
                  {/* Action */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedDemandId(demand.id)}
                      className="p-1.5 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {demands.length === 0 && (
                <EmptyState colSpan={10} message="لا توجد طلبات دم متطابقة مع التصفية الحالية" />
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/10">
            <p className="text-muted-foreground text-xs">
              عرض الصفحة {page} من {totalPages} (إجمالي {totalCount} طلب)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-border rounded-xl bg-card text-foreground hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold"
              >
                السابق
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
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
