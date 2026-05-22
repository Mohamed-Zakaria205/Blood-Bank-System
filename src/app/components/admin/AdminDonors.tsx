import { useState } from 'react';
import { Search, Filter, Edit2, ChevronDown, Building2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { BLOOD_TYPES, CITIES } from '../../constants';
import { usePaginatedDonors, useUpdateDonor } from '../../hooks/useDonors';
import { useFilterChange } from '../../hooks/useFilterChange';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import type { Donor } from '../../types';

// ── Sub-components & constants ──
import {
  statusColors,
  statusLabels,
  adminDonorsHeaders,
} from './admin-donors/donorsConstants';
import EditDonorModal from './admin-donors/EditDonorModal';

export default function AdminDonors() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterBlood, setFilterBlood] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCity, setFilterCity] = useState('');

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = usePaginatedDonors({
    page,
    limit: 5,
    search,
    bloodType: filterBlood,
    status: filterStatus,
    district: filterCity,
  });

  const donors = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / 5) || 1;

  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [editForm, setEditForm] = useState<Partial<Donor>>({});

  const updateMutation = useUpdateDonor();

  // When filters change, reset to page 1
  // ⚠ Must be before any early return to maintain hooks call order
  const { handleFilterChange } = useFilterChange(setPage);

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={7} cols={8} />
      </div>
    );
  if (isError)
    return <ErrorState message="تعذر تحميل بيانات المتبرعين" onRetry={() => refetch()} />;
  const openEdit = (d: Donor) => {
    setEditingDonor(d);
    setEditForm({ ...d });
  };

  const saveEdit = () => {
    if (!editingDonor) return;
    updateMutation.mutate(
      { id: editingDonor.id, payload: editForm },
      {
        onSuccess: (res) => {
          toast.success(res.message || 'تم تحديث بيانات المتبرع بنجاح');
          setTimeout(() => setEditingDonor(null), 800);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء التحديث');
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
            المتبرعون
          </h1>
          <p className="text-gray-500" style={{ fontSize: '14px' }}>
            {total} متبرع مسجل في النظام
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-amber-700" style={{ fontSize: '12px', fontWeight: 600 }}>
            ⚠ صلاحية التعديل فقط
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              placeholder="ابحث بالاسم أو الرمز أو الهاتف..."
              className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
              style={{ fontSize: '13px' }}
            />
          </div>
          <div className="relative">
            <select
              value={filterBlood}
              onChange={(e) => handleFilterChange(setFilterBlood, e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: '13px' }}
            >
              <option value="">كل الفصائل</option>
              {BLOOD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: '13px' }}
            >
              <option value="">كل الحالات</option>
              <option value="eligible">مؤهل</option>
              <option value="ineligible">غير مؤهل</option>
              <option value="deferred">موجل</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterCity}
              onChange={(e) => handleFilterChange(setFilterCity, e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: '13px' }}
            >
              <option value="">كل المدن</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats row can be hidden or removed since we have server pagination and these numbers would be inaccurate if only derived from the current page. Leaving them out or just displaying the total count is better. */}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600" style={{ fontSize: '13px' }}>
              {total} نتيجة
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50">
                {adminDonorsHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right text-gray-500 whitespace-nowrap"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {donors.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {d.status === 'eligible' ? (
                      <span
                        className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        {d.donorCode}
                      </span>
                    ) : (
                      <span
                        className="text-gray-300 bg-gray-50 px-2 py-0.5 rounded border border-dashed border-gray-200"
                        style={{ fontSize: '11px' }}
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                      {d.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-500" style={{ fontSize: '13px' }}>
                      {d.district}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      {d.bloodType}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {d.source === 'app' ? (
                      <span
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full w-fit"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <Smartphone className="w-3 h-3" /> من التطبيق
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
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full ${statusColors[d.status]}`}
                      style={{ fontSize: '11px', fontWeight: 600 }}
                    >
                      {statusLabels[d.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => openEdit(d)}
                      className="text-green-600 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50 transition-all flex items-center gap-1"
                      style={{ fontSize: '12px', fontWeight: 600 }}
                    >
                      <Edit2 className="w-3.5 h-3.5" /> تعديل
                    </button>
                  </td>
                </tr>
              ))}
              {donors.length === 0 && <EmptyState colSpan={7} message="لا توجد نتائج مطابقة" />}
            </tbody>
          </table>
        </div>
        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-center bg-gray-50">
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
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      href="#"
                      isActive={page === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
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

      {/* Edit Modal */}
      {editingDonor && (
        <EditDonorModal
          donor={editingDonor}
          form={editForm}
          onFormChange={setEditForm}
          onSave={saveEdit}
          onCancel={() => { setEditingDonor(null); updateMutation.reset(); }}
          loading={updateMutation.isPending}
          saved={updateMutation.isSuccess}
        />
      )}
    </div>
  );
}


