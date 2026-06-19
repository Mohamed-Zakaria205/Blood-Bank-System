import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  UserPlus,
  Search,
  Eye,
  ChevronDown,
  Building2,
  Smartphone,
  Megaphone,
  CheckCircle2,
  ClipboardList,
  RotateCcw,
} from 'lucide-react';
import { BLOOD_TYPES } from '../../constants';
import CustomDateModal from './doctor-donations/CustomDateModal';
import {
  usePaginatedDonations,
  useDeleteDonation,
  useConfirmDonation,
} from '../../hooks/useDonors';
import { useFilterChange } from '../../hooks/useFilterChange';
import { toast } from 'sonner';
import { handleApiError } from '../../api/errors';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
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
import type { Donation } from '../../types';

// ── Sub-components ──
import { donationTypeLabels, genderLabels, tableHeaders } from './doctor-donations/donorsConstants';
import DonorDetailModal from './doctor-donations/DonorDetailModal';
import DonationActionModal from './doctor-donations/DonationActionModal';

// Central mapping for tentative backend values
export const BACKEND_SOURCE_MAP = {
  mobileapp: 'Application',
  campaign: 'Campaign',
  walkin: 'WalkIn',
};

export const BACKEND_STATUS_MAP = {
  pending: 'Pending',
  sentToLab: 'SentToLab',
};

export default function DoctorDonations() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterBlood, setFilterBlood] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDatePreset, setFilterDatePreset] = useState('');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [viewing, setViewing] = useState<Donation | null>(null);
  const [actionDonation, setActionDonation] = useState<Donation | null>(null);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = usePaginatedDonations({
    page,
    limit: 10,
    search,
    bloodType: filterBlood,
    donationSource: filterSource ? (BACKEND_SOURCE_MAP[filterSource as keyof typeof BACKEND_SOURCE_MAP] || filterSource) : '',
    donationStatus: filterStatus ? (BACKEND_STATUS_MAP[filterStatus as keyof typeof BACKEND_STATUS_MAP] || filterStatus) : '',
    datePreset: filterDatePreset === 'custom' ? '' : filterDatePreset,
    fromDate: filterDatePreset === 'custom' ? customFromDate : '',
    toDate: filterDatePreset === 'custom' ? customToDate : '',
  });

  const donations = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / 10) || 1;

  // When filters change, reset to page 1
  const { handleFilterChange } = useFilterChange(setPage);

  const deleteMutation = useDeleteDonation();
  const confirmMutation = useConfirmDonation();

  const handleDelete = (donationId: string) => {
    deleteMutation.mutate(donationId, {
      onSuccess: (res) => {
        toast.success(res?.message || 'تم حذف التبرع بنجاح');
        setActionDonation(null);
      },
      onError: (err) => {
        const apiErr = handleApiError(err);
        toast.error(apiErr.message || 'تعذر حذف التبرع');
      },
    });
  };

  const handleConfirm = (donationId: string) => {
    confirmMutation.mutate(donationId, {
      onSuccess: (res) => {
        toast.success(res?.message || 'تم إرسال التبرع للمختبر بنجاح');
        setActionDonation(null);
      },
      onError: (err) => {
        const apiErr = handleApiError(err);
        toast.error(apiErr.message || 'تعذر إرسال التبرع للمختبر');
      },
    });
  };

  const getSelectDateValue = () => {
    if (filterDatePreset === 'custom') {
      return 'custom';
    }
    return filterDatePreset;
  };

  const formatCustomDateLabel = () => {
    if (customFromDate && customToDate) {
      const formatPart = (dStr: string) => {
        const parts = dStr.split('-');
        if (parts.length === 3) {
          return `${parts[1]}/${parts[2]}`; // MM/DD
        }
        return dStr;
      };
      return `مخصص (${formatPart(customFromDate)} - ${formatPart(customToDate)})`;
    }
    return 'تاريخ مخصص';
  };

  const handleDatePresetChange = (value: string) => {
    if (value === 'custom' || value === 'edit-custom') {
      setIsCustomDateModalOpen(true);
    } else {
      handleFilterChange(setFilterDatePreset, value);
      setCustomFromDate('');
      setCustomToDate('');
    }
  };

  const handleApplyCustomDate = (fromDate: string, toDate: string) => {
    setIsCustomDateModalOpen(false);
    setCustomFromDate(fromDate);
    setCustomToDate(toDate);
    handleFilterChange<string>(setFilterDatePreset, 'custom');
  };

  const isAnyFilterActive =
    search !== '' ||
    filterBlood !== '' ||
    filterSource !== '' ||
    filterStatus !== '' ||
    filterDatePreset !== '';

  const handleResetFilters = () => {
    setSearch('');
    setFilterBlood('');
    setFilterSource('');
    setFilterStatus('');
    setFilterDatePreset('');
    setCustomFromDate('');
    setCustomToDate('');
    setIsCustomDateModalOpen(false);
    setPage(1);
  };

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={7} cols={10} />
      </div>
    );
  if (isError) return <ErrorState message="تعذر تحميل بيانات التبرعات" onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            التبرعات
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            {total} تبرع مسجل
          </p>
        </div>
        <button
          onClick={() => navigate('/doctor/register')}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #15803d, #16a34a)',
            fontSize: '14px',
            fontWeight: 700,
          }}
        >
          <UserPlus className="w-5 h-5" /> تسجيل تبرع جديد
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الرقم القومي أو رمز التبرع..."
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
            className="w-full pr-9 pl-3 py-2.5 border border-border rounded-xl bg-card outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
            style={{ fontSize: '13px' }}
          />
        </div>

        {/* Blood Type Dropdown */}
        <div className="relative">
          <select
            value={filterBlood}
            onChange={(e) => handleFilterChange(setFilterBlood, e.target.value)}
            className="appearance-none px-4 py-2.5 pr-3 pl-8 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-400"
            style={{ fontSize: '13px' }}
          >
            <option value="">كل الفصائل</option>
            {BLOOD_TYPES.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Donation Source Dropdown */}
        <div className="relative">
          <select
            value={filterSource}
            onChange={(e) => handleFilterChange(setFilterSource, e.target.value)}
            className="appearance-none px-4 py-2.5 pr-3 pl-8 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-400"
            style={{ fontSize: '13px' }}
          >
            <option value="">كل المصادر</option>
            <option value="mobileapp">من التطبيق</option>
            <option value="campaign">من حملة</option>
            <option value="walkin">داخل البنك</option>
          </select>
          <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Donation Status Dropdown */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
            className="appearance-none px-4 py-2.5 pr-3 pl-8 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-400"
            style={{ fontSize: '13px' }}
          >
            <option value="">كل الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="sentToLab">تم الإرسال للمختبر</option>
          </select>
          <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Donation Date Dropdown */}
        <div className="relative">
          <select
            value={getSelectDateValue()}
            onChange={(e) => handleDatePresetChange(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-3 pl-8 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-400"
            style={{ fontSize: '13px' }}
          >
            <option value="">كل الأوقات</option>
            <option value="today">اليوم</option>
            <option value="thisWeek">هذا الأسبوع</option>
            <option value="thisMonth">هذا الشهر</option>
            <option value="custom" hidden={filterDatePreset === 'custom'}>تاريخ مخصص</option>
            {filterDatePreset === 'custom' && (
              <>
                <option value="custom">{formatCustomDateLabel()}</option>
                <option value="edit-custom" className="text-green-600 font-semibold">تعديل التاريخ المخصص...</option>
              </>
            )}
          </select>
          <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Reset Filters Button */}
        {isAnyFilterActive && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-xl bg-card text-muted-foreground hover:bg-muted transition-all cursor-pointer"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            إعادة تعيين الفلاتر
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-right" style={{ fontSize: '13px' }}>
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {tableHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-muted-foreground whitespace-nowrap"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="text-green-600 font-mono"
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      {d.donationCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-foreground" style={{ fontWeight: 600 }}>
                      {d.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-muted-foreground">{genderLabels[d.gender]}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="text-foreground font-mono"
                      style={{ fontSize: '12px' }}
                      dir="ltr"
                    >
                      {d.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-muted-foreground" style={{ fontSize: '13px' }}>
                      {d.district}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      {d.bloodType || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                      {donationTypeLabels[d.donationType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {d.source === 'mobileapp' ? (
                      <span
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full w-fit"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <Smartphone className="w-3 h-3" /> من التطبيق
                      </span>
                    ) : d.source === 'campaign' ? (
                      <span
                        className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full w-fit"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <Megaphone className="w-3 h-3" /> من حملة
                      </span>
                    ) : (
                      <span
                        className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full w-fit"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <Building2 className="w-3 h-3" /> داخل البنك
                      </span>
                    )}
                  </td>
                  {/* ── Action Column ── */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {d.sentToLab ? (
                      <span
                        className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full w-fit"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> تم الإرسال
                      </span>
                    ) : (
                      <button
                        onClick={() => setActionDonation(d)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        مراجعة
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => setViewing(d)}
                      className="p-1.5 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {donations.length === 0 && <EmptyState colSpan={10} message="لا توجد نتائج" />}
            </tbody>
          </table>
        </div>
        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-center bg-muted/40">
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
      </div>

      {/* Detail Modal */}
      {viewing && <DonorDetailModal donation={viewing} onClose={() => setViewing(null)} />}

      {/* Action Modal (SuccessScreen-style) */}
      {actionDonation && (
        <DonationActionModal
          donation={actionDonation}
          onClose={() => setActionDonation(null)}
          onConfirm={handleConfirm}
          onDelete={handleDelete}
          isConfirming={confirmMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      )}

      {/* Custom Date Modal */}
      {isCustomDateModalOpen && (
        <CustomDateModal
          initialFromDate={customFromDate}
          initialToDate={customToDate}
          onClose={() => setIsCustomDateModalOpen(false)}
          onApply={handleApplyCustomDate}
        />
      )}
    </div>
  );
}
