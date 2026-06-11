import { useState } from 'react';
import { Search, Filter, Edit2, ChevronDown, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { BLOOD_TYPES, CITIES } from '../../constants';
import { usePaginatedDonors, useUpdateDonor } from '../../hooks/useDonors';
import { fetchDonorById } from '../../api/donors';
import { useFilterChange } from '../../hooks/useFilterChange';
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
import type { Donor } from '../../types';

// ── Sub-components & constants ──
import {
  statusColors,
  statusLabels,
  adminDonorsHeaders,
} from './admin-donors/donorsConstants';
import EditDonorModal from './admin-donors/EditDonorModal';
import ViewDonorModal from './admin-donors/ViewDonorModal';

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
    limit: 10,
    search,
    bloodType: filterBlood,
    status: filterStatus,
    district: filterCity,
  });

  const donors = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / 10) || 1;

  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [editForm, setEditForm] = useState<Partial<Donor>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [viewingDonorId, setViewingDonorId] = useState<string | null>(null);
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);

  const updateMutation = useUpdateDonor();

  // When filters change, reset to page 1
  // ⚠ Must be before any early return to maintain hooks call order
  const { handleFilterChange } = useFilterChange(setPage);

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={7} cols={8} />
      </div>
    );
  if (isError)
    return <ErrorState message="تعذر تحميل بيانات المتبرعين" onRetry={() => refetch()} />;
  const openEdit = async (d: Donor) => {
    setLoadingDetailsId(d.id);
    setFormErrors({});
    try {
      const res = await fetchDonorById(d.id);
      setEditingDonor(res.data);
      setEditForm({ ...res.data });
    } catch (err) {
      toast.error('تعذر تحميل بيانات المتبرع الكاملة للتعديل');
    } finally {
      setLoadingDetailsId(null);
    }
  };

  const saveEdit = async () => {
    if (!editingDonor) return;

    setFormErrors({});

    const name = editForm.name || '';
    if (!name.trim()) {
      setFormErrors({ name: 'يرجى إدخال الاسم الكامل' });
      toast.error('يرجى إدخال الاسم الكامل');
      return;
    }

    const phone = editForm.phone || '';
    const egPhoneRegex = /^01[0125]\d{8}$/;
    if (!phone) {
      setFormErrors({ phone: 'يرجى إدخال رقم الهاتف' });
      toast.error('يرجى إدخال رقم الهاتف');
      return;
    }
    if (!egPhoneRegex.test(phone)) {
      setFormErrors({ phone: 'رقم الهاتف المحمول غير صحيح، يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015' });
      toast.error('رقم الهاتف المحمول غير صحيح، يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015');
      return;
    }

    const nationalId = editForm.nationalId || '';
    const nationalIdRegex = /^\d{14}$/;
    if (!nationalId) {
      setFormErrors({ nationalId: 'يرجى إدخال الرقم القومي' });
      toast.error('يرجى إدخال الرقم القومي');
      return;
    }
    if (!nationalIdRegex.test(nationalId)) {
      setFormErrors({ nationalId: 'الرقم القومي غير صحيح، يجب أن يتكون من 14 رقماً' });
      toast.error('الرقم القومي غير صحيح، يجب أن يتكون من 14 رقماً');
      return;
    }

    setFormErrors({});

    // ── Optimistic Locking Check ──
    try {
      const freshRes = await fetchDonorById(editingDonor.id);
      // Compare the serialized objects to detect concurrent background changes
      if (JSON.stringify(freshRes.data) !== JSON.stringify(editingDonor)) {
        toast.error(
          'تحذير: تم تعديل بيانات هذا المتبرع بواسطة مستخدم آخر منذ فتحك للنافذة. تم تحديث النافذة بالإصدار الأخير، يرجى المراجعة والمحاولة مجدداً.'
        );
        setEditingDonor(freshRes.data);
        setEditForm({ ...freshRes.data });
        return; // Prevent overwrite
      }
    } catch (err) {
      // If we fail to verify, we log it and proceed gracefully
      console.warn('Optimistic lock verification failed', err);
    }

    updateMutation.mutate(
      { id: editingDonor.id, payload: editForm },
      {
        onSuccess: (res) => {
          let msg = res.message || 'تم تحديث بيانات المتبرع بنجاح';
          if (msg.toLowerCase() === 'success') {
            msg = 'تم تحديث بيانات المتبرع بنجاح';
          }
          toast.success(msg);
          setEditingDonor(null);
        },
        onError: (err) => {
          const apiErr = handleApiError(err);
          const rawMsg = (apiErr.message || '').toLowerCase();
          let userFriendlyMsg = apiErr.message || 'حدث خطأ أثناء التحديث';
          const backendErrors: Record<string, string> = {};

          // English to Arabic error mapping
          if (rawMsg.includes('phone') || rawMsg.includes('رقم الهاتف')) {
            backendErrors.phone = 'رقم الهاتف هذا مسجل بالفعل لمتبرع آخر';
            userFriendlyMsg = 'رقم الهاتف هذا مسجل بالفعل لمتبرع آخر';
          } 
          if (rawMsg.includes('nationalid') || rawMsg.includes('national id') || rawMsg.includes('الرقم القومي')) {
            backendErrors.nationalId = 'الرقم القومي هذا مسجل بالفعل لمتبرع آخر';
            userFriendlyMsg = 'الرقم القومي هذا مسجل بالفعل لمتبرع آخر';
          } 
          if (rawMsg.includes('not found')) {
            userFriendlyMsg = 'المتبرع غير موجود في النظام';
          } else if (rawMsg.includes('blood') || rawMsg.includes('bloodtype')) {
            userFriendlyMsg = 'فصيلة الدم غير صالحة';
          } else if (rawMsg.includes('validation')) {
            userFriendlyMsg = 'يوجد خطأ في البيانات المدخلة، يرجى مراجعتها';
          } else if (rawMsg.includes('unauthorized') || rawMsg.includes('forbidden')) {
            userFriendlyMsg = 'ليس لديك صلاحية لتعديل بيانات هذا المتبرع';
          } else if (rawMsg.includes('network error')) {
            userFriendlyMsg = 'خطأ في الاتصال بالخادم، يرجى التحقق من الإنترنت';
          } else if (rawMsg.includes('server error') || rawMsg.includes('500')) {
            userFriendlyMsg = 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً';
          }

          const validationErrors = apiErr.data?.errors;
          if (validationErrors && typeof validationErrors === 'object') {
            Object.keys(validationErrors).forEach(key => {
              const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
              const msgs = validationErrors[key];
              if (Array.isArray(msgs) && msgs.length > 0) {
                backendErrors[fieldName] = msgs[0];
              } else if (typeof msgs === 'string') {
                backendErrors[fieldName] = msgs;
              }
            });
          }

          setFormErrors(backendErrors);
          toast.error(userFriendlyMsg);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            المتبرعون
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
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
      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              placeholder="ابحث بالاسم أو الرمز أو الهاتف..."
              className="w-full pr-9 pl-4 py-2.5 border border-border rounded-xl text-foreground bg-input-background outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-muted-foreground"
              style={{ fontSize: '13px' }}
            />
          </div>
          <div className="relative">
            <select
              value={filterBlood}
              onChange={(e) => handleFilterChange(setFilterBlood, e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-border rounded-xl text-foreground bg-input-background outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: '13px' }}
            >
              <option value="">كل الفصائل</option>
              {BLOOD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-border rounded-xl text-foreground bg-input-background outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: '13px' }}
            >
              <option value="">كل الحالات</option>
              <option value="eligible">مؤهل</option>
              <option value="ineligible">غير مؤهل</option>
              <option value="deferred">موجل</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterCity}
              onChange={(e) => handleFilterChange(setFilterCity, e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-border rounded-xl text-foreground bg-input-background outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: '13px' }}
            >
              <option value="">كل المدن</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats row can be hidden or removed since we have server pagination and these numbers would be inaccurate if only derived from the current page. Leaving them out or just displaying the total count is better. */}

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground" style={{ fontSize: '13px' }}>
              {total} نتيجة
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-muted/40">
                {adminDonorsHeaders.map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 ${h === 'إجراء' ? 'text-center' : 'text-right'} text-muted-foreground whitespace-nowrap`}
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {donors.map((d) => (
                <tr key={d.id} className="hover:bg-accent/40 transition-colors">
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
                        className="text-muted-foreground/50 bg-muted px-2 py-0.5 rounded border border-dashed border-border"
                        style={{ fontSize: '11px' }}
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-foreground" style={{ fontSize: '13px', fontWeight: 600 }}>
                      {d.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-muted-foreground" style={{ fontSize: '13px' }}>
                      {d.address || '—'}
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
                    <span className="text-muted-foreground font-mono" style={{ fontSize: '13px' }}>
                      {d.lastDonationDate || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-muted-foreground" style={{ fontSize: '13px' }}>
                      {d.donations !== undefined ? d.donations : 0}
                    </span>
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
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setViewingDonorId(d.id)}
                        className="text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-1"
                        style={{ fontSize: '12px', fontWeight: 600 }}
                      >
                        <Eye className="w-3.5 h-3.5" /> عرض
                      </button>
                      <button
                        onClick={() => openEdit(d)}
                        disabled={loadingDetailsId === d.id}
                        className={`text-green-600 hover:text-green-700 px-2.5 py-1 rounded-lg hover:bg-green-50 transition-all flex items-center gap-1 ${loadingDetailsId === d.id ? 'opacity-50 cursor-wait' : ''}`}
                        style={{ fontSize: '12px', fontWeight: 600 }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        {loadingDetailsId === d.id ? 'جارٍ التحميل...' : 'تعديل'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {donors.length === 0 && <EmptyState colSpan={8} message="لا توجد نتائج مطابقة" />}
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

      {/* Edit Modal */}
      {editingDonor && (
        <EditDonorModal
          donor={editingDonor}
          form={editForm}
          onFormChange={setEditForm}
          onSave={saveEdit}
          onCancel={() => { setEditingDonor(null); setFormErrors({}); updateMutation.reset(); }}
          loading={updateMutation.isPending}
          saved={updateMutation.isSuccess}
          errors={formErrors}
        />
      )}

      {/* View Modal */}
      {viewingDonorId && (
        <ViewDonorModal
          donorId={viewingDonorId}
          onClose={() => setViewingDonorId(null)}
        />
      )}
    </div>
  );
}


