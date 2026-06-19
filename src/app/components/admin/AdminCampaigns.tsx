import { MapPin, Calendar, Users, TrendingUp, Eye } from 'lucide-react';
import { useState } from 'react';
import { useFilteredCampaigns } from '../../hooks/useCampaigns';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import {
  DONATION_TYPE_LABELS,
  statusColors,
  statusLabels,
} from '../doctor/doctor-campaigns/campaignConstants';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
  generatePaginationNumbers,
} from '../ui/pagination';

export default function AdminCampaigns() {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useFilteredCampaigns({
    page,
    limit: 4,
    status: filterStatus,
  });

  const campaigns = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / 4) || 1;

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isError) return <ErrorState message="تعذر تحميل الحملات" onRetry={() => refetch()} />;

  const handleFilterStatus = (status: string) => {
    setFilterStatus(filterStatus === status ? '' : status);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            حملات التبرع
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            {total} حملة مسجلة (عرض فقط)
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-amber-700" style={{ fontSize: '12px', fontWeight: 600 }}>
            ⚠ صلاحية العرض فقط
          </span>
        </div>
      </div>

      {/* Stats/Filters */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'حملات نشطة',
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            val: 'active',
          },
          {
            label: 'حملات غير نشطة',
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            val: 'notactive',
          },
          {
            label: 'حملات منتهية',
            color: 'text-muted-foreground',
            bg: 'bg-muted',
            val: 'completed',
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`${s.bg} rounded-xl p-4 text-center cursor-pointer hover:opacity-80 transition-all ${filterStatus === s.val ? 'ring-2 ring-emerald-500' : ''}`}
            onClick={() => handleFilterStatus(s.val)}
          >
            <div className={`${s.color}`} style={{ fontSize: '18px', fontWeight: 800 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      {filterStatus && (
        <button
          onClick={() => handleFilterStatus(filterStatus)}
          className="flex items-center gap-2 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted transition-all"
          style={{ fontSize: '12px', fontWeight: 600 }}
        >
          عرض الكل ×
        </button>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {campaigns.map((c) => {
          const pct = Math.round((c.registeredDonors / c.targetDonors) * 100);
          return (
            <div
              key={c.id}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full ${statusColors[c.status]}`}
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {statusLabels[c.status]}
                    </span>
                  </div>
                  <h3
                    className="text-foreground mt-1"
                    style={{ fontSize: '15px', fontWeight: 700 }}
                  >
                    {c.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelected(c)}
                  className="p-2 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                  title="عرض تفاصيل الحملة"
                  aria-label="عرض تفاصيل الحملة"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  <span style={{ fontSize: '13px' }}>{c.city}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  <span style={{ fontSize: '13px' }}>{c.date}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  <span style={{ fontSize: '13px' }}>منظم بواسطة: {c.createdByName}</span>
                </div>
              </div>
              {c.availableDonationTypes && c.availableDonationTypes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.availableDonationTypes.map((type) => {
                    const lowerType = type.toLowerCase();
                    return (
                      <span
                        key={type}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 rounded-lg text-[11px] font-semibold"
                      >
                        {DONATION_TYPE_LABELS[lowerType] || type}
                      </span>
                    );
                  })}
                </div>
              )}
              {/* Progress */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span
                    className="text-muted-foreground"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  >
                    التقدم
                  </span>
                  <span className="text-green-600" style={{ fontSize: '12px', fontWeight: 700 }}>
                    {c.registeredDonors} / {c.targetDonors} متبرع
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${c.status === 'completed' ? 'bg-gray-400' : pct >= 80 ? 'bg-green-600' : pct >= 50 ? 'bg-green-500' : 'bg-green-400'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-muted-foreground" style={{ fontSize: '11px' }}>
                    {pct}% مكتمل
                  </span>
                  {c.status !== 'completed' && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span style={{ fontSize: '11px' }}>
                        {c.targetDonors - c.registeredDonors} متبقي
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {campaigns.length === 0 && (
          <div className="col-span-2 py-16 text-center text-muted-foreground bg-card rounded-2xl border border-border">
            <p style={{ fontSize: '14px' }}>لا توجد حملات</p>
          </div>
        )}
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {generatePaginationNumbers(page, totalPages).map((item, i) => (
                <PaginationItem key={item === 'ellipsis' ? `ellipsis-${i}` : item}>
                  {item === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={page === item}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(item as number);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-foreground" style={{ fontSize: '18px', fontWeight: 700 }}>
                تفاصيل الحملة
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-xl"
                title="إغلاق النافذة"
                aria-label="إغلاق النافذة"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <h4 className="text-foreground" style={{ fontSize: '16px', fontWeight: 700 }}>
                {selected.title}
              </h4>
              <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                {selected.description}
              </p>
              {selected.availableDonationTypes && selected.availableDonationTypes.length > 0 && (
                <div className="space-y-1.5 p-3 bg-muted/40 rounded-xl">
                  <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                    أنواع التبرع المتاحة
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.availableDonationTypes.map((type: string) => {
                      const lowerType = type.toLowerCase();
                      return (
                        <span
                          key={type}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg text-[11px] font-semibold"
                        >
                          {DONATION_TYPE_LABELS[lowerType] || type}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'الموقع (إحداثيات)',
                    value: `${selected.latitude || ''}, ${selected.longitude || ''}`,
                  },
                  { label: 'المدينة', value: selected.city },
                  { label: 'التاريخ', value: selected.date },
                  { label: 'المنظم', value: selected.createdByName },
                  { label: 'المستهدف', value: `${selected.targetDonors} متبرع` },
                  { label: 'المسجلون', value: `${selected.registeredDonors} متبرع` },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 bg-muted/40 rounded-xl">
                    <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                      {label}
                    </p>
                    <p
                      className="text-foreground mt-0.5"
                      style={{ fontSize: '13px', fontWeight: 600 }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span
                    className="text-muted-foreground"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    نسبة الإنجاز
                  </span>
                  <span className="text-green-600" style={{ fontSize: '13px', fontWeight: 700 }}>
                    {Math.round((selected.registeredDonors / selected.targetDonors) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${Math.min((selected.registeredDonors / selected.targetDonors) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
