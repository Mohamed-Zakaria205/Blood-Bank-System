import { useState, useMemo, useEffect } from 'react';
import {
  Heart,
  Phone,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Users,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Donor, SendNotificationResponse } from '../../types/donor';
import type { BloodType } from '../../types/common';
import type { ApiResponse } from '../../types/common';
// import type { AxiosError } from 'axios';
import { useDebounce } from '../../hooks/useDebounce';
import { CITIES } from '../../constants';
import {
  usePaginatedEligibleDonors,
  useDonorEligibilityStats,
  useSendDonorNotifications,
} from '../../hooks/useDonors';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
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

// ── Sub-components & constants ──
import {
  calcEligibility,
  statusCfg,
  type NotifModal,
  type EnrichedDonor,
} from './doctor-eligibility/eligibilityConstants';
import NotifyDonorModal from './doctor-eligibility/NotifyDonorModal';
import BloodTypeBar from './doctor-eligibility/BloodTypeBar';

export default function DoctorEligibility() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'eligible' | 'soon' | 'not_yet' | 'deferred' | 'ineligible'
  >('all');
  const [filterBlood, setFilterBlood] = useState<BloodType | 'all'>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [notifModal, setNotifModal] = useState<NotifModal | null>(null);
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());
  const [sentNotifs, setSentNotifs] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = sessionStorage.getItem('donor_sent_notifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('donor_sent_notifications', JSON.stringify(Array.from(sentNotifs)));
    } catch (e) {
      console.error(e);
    }
  }, [sentNotifs]);

  // Reset selection whenever filters or page change to avoid stale selected IDs
  useEffect(() => {
    setSelectedDonors(new Set());
  }, [debouncedSearch, filterStatus, filterBlood, filterGender, filterDistrict, page]);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = usePaginatedEligibleDonors({
    page,
    limit: 10,
    search: debouncedSearch,
    bloodType: filterBlood === 'all' ? '' : filterBlood,
    status: filterStatus === 'all' ? '' : filterStatus,
    gender: filterGender === 'all' ? '' : filterGender,
    district: filterDistrict === 'all' ? '' : filterDistrict,
  });

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useDonorEligibilityStats();
  const sendNotifMutation = useSendDonorNotifications();

  const donorsData = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / 10) || 1;

  const enriched: EnrichedDonor[] = useMemo(
    () => donorsData.map((d: Donor) => ({ ...d, eligibility: d.eligibility || calcEligibility(d) })),
    [donorsData],
  );

  // We no longer need client-side filtering since we are using the paginated backend endpoint
  const donorsList = enriched;

  if (isLoading || statsLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isError || statsError)
    return (
      <ErrorState
        message="تعذر تحميل بيانات المتبرعين والإحصائيات"
        onRetry={() => {
          refetch();
          refetchStats();
        }}
      />
    );

  const counts = {
    all: stats?.statusCounts?.all ?? 0,
    eligible: stats?.statusCounts?.eligible ?? 0,
    soon: stats?.statusCounts?.soon ?? 0,
    not_yet: stats?.statusCounts?.not_yet ?? 0,
    deferred: stats?.statusCounts?.deferred ?? 0,
    ineligible: stats?.statusCounts?.ineligible ?? 0,
  };

  const sendNotification = () => {
    if (!notifModal) return;

    const isBulk = notifModal.donors.length > 1;
    const singleDonor = isBulk ? null : notifModal.donors[0];

    const message = notifModal.type === 'emergency'
      ? `🚨 طلب دم طارئ — بنك دم بني سويف\nفصيلة الدم: ${isBulk ? 'حسب احتياجنا الطارئ' : singleDonor!.bloodType}\nيرجى التواصل فوراً على: 082-XXXXXXX`
      : `💚 أنت الآن مؤهل للتبرع بالدم مجدداً!\nآخر تبرع: ${isBulk ? 'موضح في سجلك لدينا' : (singleDonor!.lastDonationDate ?? 'لم يتبرع')}\nاحجز موعدك عبر التطبيق أو تواصل معنا.`;

    if (message.length > 320) {
      toast.error('محتوى الرسالة طويل جداً (الحد الأقصى 320 حرف)');
      return;
    }

    sendNotifMutation.mutate(
      {
        donorIds: notifModal.donors.map(d => d.id),
        type: notifModal.type,
        message,
      },
      {
        onSuccess: (res: ApiResponse<SendNotificationResponse>) => {
          const failedIds = new Set<string>(res.data?.failedDonorIds || []);
          const sentNotifIds: string[] = [];

          notifModal.donors.forEach(d => {
            if (!failedIds.has(d.id)) {
              sentNotifIds.push(`${d.id}-${notifModal.type}`);
            }
          });

          setSentNotifs((prev: Set<string>) => {
            const next = new Set(prev);
            sentNotifIds.forEach(id => next.add(id));
            return next;
          });

          const requestedCount = res.data?.requested ?? notifModal.donors.length;
          const sentCount = res.data?.sent ?? (requestedCount - failedIds.size);
          const failedCount = res.data?.failed ?? failedIds.size;

          if (failedCount > 0) {
            if (sentCount > 0) {
              toast.warning(`تم إرسال الإشعار إلى ${sentCount} من المتبرعين بنجاح، بينما فشل إرساله إلى ${failedCount}.`);
            } else {
              toast.error(`تعذر إرسال الإشعار لجميع المتبرعين المستهدفين (${failedCount} متبرع).`);
            }
          } else {
            toast.success(
              res.message || (
                notifModal.type === 'emergency'
                  ? `تم إرسال الإشعار الطارئ بنجاح إلى ${sentCount} متبرع.`
                  : `تم إرسال إشعار الجاهزية بنجاح إلى ${sentCount} متبرع.`
              )
            );
          }
          setNotifModal(null);
          setSelectedDonors(new Set());
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          toast.error(msg || 'تعذر إرسال الإشعار. يرجى المحاولة لاحقاً');
        },
      },
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const eligibleIds = donorsList
        .filter(d => (d.eligibility.status === 'eligible' || d.eligibility.status === 'soon') && d.hasAppAccount)
        .map(d => d.id);
      setSelectedDonors(new Set(eligibleIds));
    } else {
      setSelectedDonors(new Set());
    }
  };

  const handleSelectDonor = (id: string, checked: boolean) => {
    setSelectedDonors(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const openBulkModal = (type: 'emergency' | 'ready') => {
    const selected = donorsList.filter(d => selectedDonors.has(d.id));
    if (selected.length === 0) return;
    setNotifModal({ donors: selected, type });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            مؤهلية المتبرعين
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            ذكر: انتظار 90 يوماً — أنثى: 120 يوماً — حساب تلقائي
          </p>
        </div>
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <Zap className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-green-700" style={{ fontSize: '13px', fontWeight: 700 }}>
              {counts.eligible} متبرع جاهز الآن
            </p>
            <p className="text-green-600" style={{ fontSize: '11px' }}>
              {counts.soon} سيصبح جاهزاً خلال أسبوعين
            </p>
          </div>
        </div>
      </div>

      {/* Status filter cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(
          [
            [
              'all',
              'الجميع',
              counts.all,
              // Selected classes:
              'bg-muted border-muted-foreground/30 text-foreground ring-2 ring-green-400 ring-offset-1 dark:bg-muted/80',
              // Unselected classes:
              'bg-card border-border text-muted-foreground hover:bg-muted/30 hover:border-muted-foreground/20 hover:text-foreground',
              // Selected count text:
              'text-foreground',
              // Unselected count text:
              'text-muted-foreground',
            ],
            [
              'eligible',
              'مؤهلون الآن',
              counts.eligible,
              'bg-green-50 border-green-200 text-green-700 ring-2 ring-green-400 ring-offset-1 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400',
              'bg-card border-border text-muted-foreground hover:bg-green-50/20 hover:border-green-200/50 hover:text-green-600 dark:hover:bg-green-950/10 dark:hover:text-green-400',
              'text-green-700 dark:text-green-400',
              'text-muted-foreground',
            ],
            [
              'soon',
              'قريباً (14 يوم)',
              counts.soon,
              'bg-yellow-50 border-yellow-200 text-yellow-700 ring-2 ring-green-400 ring-offset-1 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-400',
              'bg-card border-border text-muted-foreground hover:bg-yellow-50/20 hover:border-yellow-200/50 hover:text-yellow-600 dark:hover:bg-yellow-950/10 dark:hover:text-yellow-400',
              'text-yellow-700 dark:text-yellow-400',
              'text-muted-foreground',
            ],
            [
              'not_yet',
              'لم يحن وقتهم',
              counts.not_yet,
              'bg-muted/80 border-muted-foreground/30 text-foreground ring-2 ring-green-400 ring-offset-1 dark:bg-muted/60 dark:border-muted-foreground/20',
              'bg-card border-border text-muted-foreground hover:bg-muted/30 hover:border-muted-foreground/20 hover:text-foreground',
              'text-foreground/80 dark:text-foreground/70',
              'text-muted-foreground',
            ],
            [
              'deferred',
              'مؤجلون مؤقتاً',
              counts.deferred,
              'bg-orange-50 border-orange-200 text-orange-700 ring-2 ring-green-400 ring-offset-1 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-400',
              'bg-card border-border text-muted-foreground hover:bg-orange-50/20 hover:border-orange-200/50 hover:text-orange-600 dark:hover:bg-orange-950/10 dark:hover:text-orange-400',
              'text-orange-700 dark:text-orange-400',
              'text-muted-foreground',
            ],
            [
              'ineligible',
              'غير مؤهلين طبياً',
              counts.ineligible,
              'bg-red-50 border-red-200 text-red-700 ring-2 ring-green-400 ring-offset-1 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400',
              'bg-card border-border text-muted-foreground hover:bg-red-50/20 hover:border-red-200/50 hover:text-red-600 dark:hover:bg-red-950/10 dark:hover:text-red-400',
              'text-red-700 dark:text-red-400',
              'text-muted-foreground',
            ],
          ] as const
        ).map(([val, lbl, cnt, selClass, unselClass, selCountColor, unselCountColor]) => {
          const isSelected = filterStatus === val;
          return (
            <button
              key={val}
              onClick={() => { setFilterStatus(val); setPage(1); }}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${lbl} (${cnt} متبرع)`}
              className={`border rounded-2xl p-4 text-right transition-all cursor-pointer ${isSelected ? selClass : unselClass}`}
            >
              <div className={isSelected ? selCountColor : unselCountColor} style={{ fontSize: '24px', fontWeight: 800 }}>
                {cnt}
              </div>
              <div className={isSelected ? 'text-current opacity-90' : 'text-muted-foreground opacity-80'} style={{ fontSize: '12px', fontWeight: 600 }}>
                {lbl}
              </div>
            </button>
          );
        })}
      </div>

      {/* Blood type eligibility bar */}
      <BloodTypeBar
        enriched={enriched}
        stats={stats}
        filterBlood={filterBlood}
        onToggle={(blood) => {
          setFilterBlood(blood);
          setPage(1);
        }}
      />

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            maxLength={100}
            aria-label="بحث بالاسم أو رقم الهاتف أو الفصيلة"
            placeholder="بحث بالاسم أو رقم الهاتف أو الفصيلة..."
            className="w-full pr-9 pl-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400"
            style={{ fontSize: '13px' }}
          />
        </div>

        <div className="relative">
          <select
            value={filterGender}
            onChange={(e) => { setFilterGender(e.target.value); setPage(1); }}
            className="appearance-none px-4 py-2.5 pr-3 pl-8 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-400 w-full sm:w-auto cursor-pointer hover:border-green-400/50 dark:hover:border-green-500/30 transition-all duration-200"
            style={{ fontSize: '13px' }}
          >
            <option value="all">الكل (النوع)</option>
            <option value="male">ذكور فقط</option>
            <option value="female">إناث فقط</option>
          </select>
          <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filterDistrict}
            onChange={(e) => { setFilterDistrict(e.target.value); setPage(1); }}
            className="appearance-none px-4 py-2.5 pr-3 pl-8 border border-border rounded-xl bg-card text-foreground outline-none focus:border-green-400 w-full sm:w-auto max-w-[200px] truncate cursor-pointer hover:border-green-400/50 dark:hover:border-green-500/30 transition-all duration-200"
            style={{ fontSize: '13px' }}
          >
            <option value="all">كل المراكز</option>
            {CITIES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Total results count & Bulk Actions */}
      <div className="flex items-center justify-between px-1" style={{ fontSize: '13px' }}>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-foreground font-semibold">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500"
              checked={
                donorsList.filter(d => (d.eligibility.status === 'eligible' || d.eligibility.status === 'soon') && d.hasAppAccount).length > 0 &&
                selectedDonors.size === donorsList.filter(d => (d.eligibility.status === 'eligible' || d.eligibility.status === 'soon') && d.hasAppAccount).length
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            تحديد الكل <span className="text-muted-foreground font-normal">(هذه الصفحة)</span>
          </label>
          <span className="text-muted-foreground">تم العثور على {total} نتيجة</span>
        </div>
        {selectedDonors.size > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
            <span className="text-green-700 font-bold bg-green-50 px-2 py-1 rounded-md">
              {selectedDonors.size} محدد
            </span>
            <button
              onClick={() => openBulkModal('emergency')}
              className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/80 dark:text-red-400 dark:hover:bg-red-700 dark:hover:text-white rounded-lg flex items-center gap-1 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" /> طارئ
            </button>
          </div>
        )}
      </div>

      {/* Donors list */}
      <div className="space-y-3">
        {donorsList.map((donor) => {
          const { eligibility } = donor;
          const cfg = statusCfg[eligibility.status];
          const hasSentEmergency = sentNotifs.has(`${donor.id}-emergency`);
          return (
            <div
              key={donor.id}
              className={`bg-card rounded-2xl p-4 border-2 shadow-sm hover:shadow-md transition-all ${cfg.row}`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Checkbox */}
                  {(eligibility.status === 'eligible' || eligibility.status === 'soon') && donor.hasAppAccount && (
                    <div className="pt-2">
                      <input
                        type="checkbox"
                        checked={selectedDonors.has(donor.id)}
                        onChange={(e) => handleSelectDonor(donor.id, e.target.checked)}
                        className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500 cursor-pointer"
                      />
                    </div>
                  )}
                  {/* Blood type + indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                      <span className="text-red-600" style={{ fontSize: '13px', fontWeight: 800 }}>
                        {donor.bloodType}
                      </span>
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${cfg.dot}`}
                    />
                  </div>
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 700 }}>
                        {donor.name}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full ${cfg.badge}`}
                        style={{ fontSize: '10px', fontWeight: 700 }}
                      >
                        {cfg.label}
                      </span>
                      {donor.gender === 'male' ? (
                        <span
                          className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full"
                          style={{ fontSize: '10px' }}
                        >
                          ذكر
                        </span>
                      ) : (
                        <span
                          className="px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded-full"
                          style={{ fontSize: '10px' }}
                        >
                          أنثى
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="flex items-center gap-1 text-muted-foreground"
                        style={{ fontSize: '12px' }}
                      >
                        <Phone className="w-3 h-3" /> {donor.phone}
                      </span>
                      {donor.lastDonationDate && (
                        <span
                          className="flex items-center gap-1 text-muted-foreground"
                          style={{ fontSize: '12px' }}
                        >
                          <Heart className="w-3 h-3 text-red-400" /> آخر تبرع:{' '}
                          {donor.lastDonationDate}
                        </span>
                      )}
                      {!donor.lastDonationDate && (
                        <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                          لم يتبرع من قبل
                        </span>
                      )}
                    </div>

                    {/* Eligibility detail */}
                    <div className="mt-2">
                      {eligibility.status === 'eligible' && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span
                            className="text-green-600"
                            style={{ fontSize: '12px', fontWeight: 600 }}
                          >
                            جاهز للتبرع —{' '}
                            {donor.lastDonationDate
                              ? `مرّ ${eligibility.daysAgo} يوم منذ آخر تبرع`
                              : 'متبرع جديد'}
                          </span>
                        </div>
                      )}
                      {eligibility.status === 'soon' && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <span
                            className="text-yellow-600"
                            style={{ fontSize: '12px', fontWeight: 600 }}
                          >
                            يصبح مؤهلاً خلال {eligibility.daysLeft} يوم — في {eligibility.eligibleDate}
                          </span>
                        </div>
                      )}
                      {eligibility.status === 'not_yet' && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                            باقي {eligibility.daysLeft} يوم — موعد التأهل: {eligibility.eligibleDate}
                          </span>
                        </div>
                      )}
                      {eligibility.status === 'deferred' && (
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-orange-600" style={{ fontSize: '12px' }}>
                            موجّل حتى {donor.deferredUntil} (باقي {eligibility.daysLeft} يوم)
                          </span>
                        </div>
                      )}
                      {eligibility.status === 'ineligible' && (
                        <span className="text-red-500" style={{ fontSize: '12px' }}>
                          غير مؤهل طبياً
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {donor.hasAppAccount ? (
                    (eligibility.status === 'eligible' || eligibility.status === 'soon') && (
                      <button
                        onClick={() =>
                          !hasSentEmergency && setNotifModal({ donors: [donor], type: 'emergency' })
                        }
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all shadow-sm ${hasSentEmergency ? 'bg-muted text-muted-foreground border-border cursor-not-allowed' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:scale-105 active:scale-95 dark:bg-red-950/80 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-700 dark:hover:border-red-600 dark:hover:text-white cursor-pointer'}`}
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {hasSentEmergency ? 'أُرسل' : 'طارئ'}
                      </button>
                    )
                  ) : (
                    <div
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-muted/30 text-muted-foreground shadow-sm"
                      style={{ fontSize: '11px', fontWeight: 600 }}
                    >
                      ليس لديه حساب على التطبيق
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {donorsList.length === 0 && (
          <div className="bg-card rounded-2xl p-12 border border-border text-center">
            <Users className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
              لا توجد نتائج
            </p>
          </div>
        )}
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="p-4 flex items-center justify-center bg-card rounded-2xl border border-border shadow-sm">
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

      {/* Notification modal */}
      {notifModal && (
        <NotifyDonorModal
          modal={notifModal}
          onSend={sendNotification}
          onCancel={() => setNotifModal(null)}
          isPending={sendNotifMutation.isPending}
        />
      )}
    </div>
  );
}
