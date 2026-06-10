import { useState, useMemo, useEffect } from 'react';
import {
  Heart,
  Bell,
  Phone,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Donor } from '../../types/donor';
import type { BloodType } from '../../types/common';
import type { ApiResponse } from '../../types/common';
// import type { AxiosError } from 'axios';
import { useDebounce } from '../../hooks/useDebounce';
import { BLOOD_TYPES } from '../../constants';
import { usePaginatedEligibleDonors, useDonorEligibilityStats, useSendDonorNotification } from '../../hooks/useDonors';
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'eligible' | 'soon' | 'not_yet' | 'deferred' | 'ineligible'>('all');
  const [filterBlood, setFilterBlood] = useState<BloodType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [notifModal, setNotifModal] = useState<NotifModal | null>(null);
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

  const { data: response, isLoading, isError, refetch } = usePaginatedEligibleDonors({
    page,
    limit: 10,
    search: debouncedSearch,
    bloodType: filterBlood === 'all' ? '' : filterBlood,
    status: filterStatus === 'all' ? '' : filterStatus,
  });

  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useDonorEligibilityStats();
  const sendNotifMutation = useSendDonorNotification();

  const donorsData = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / 10) || 1;

  const enriched: EnrichedDonor[] = useMemo(
    () => donorsData.map((d: Donor) => ({ ...d, elig: d.eligibility || calcEligibility(d) })),
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

    const message = notifModal.type === 'emergency'
      ? `🚨 طلب دم طارئ — بنك دم بني سويف\nفصيلة الدم: ${notifModal.donor.bloodType}\nيرجى التواصل فوراً على: 082-XXXXXXX`
      : `💚 أنت الآن مؤهل للتبرع بالدم مجدداً!\nآخر تبرع: ${notifModal.donor.lastDonationDate ?? 'لم يتبرع'}\nاحجز موعدك عبر التطبيق أو تواصل معنا.`;

    if (message.length > 320) {
      toast.error('محتوى الرسالة طويل جداً (الحد الأقصى 320 حرف)');
      return;
    }

    sendNotifMutation.mutate(
      {
        donorId: notifModal.donor.id,
        payload: {
          type: notifModal.type,
          message,
        },
      },
      {
        onSuccess: (res: ApiResponse<string>) => {
          setSentNotifs((prev: Set<string>) => new Set([...prev, `${notifModal.donor.id}-${notifModal.type}`]));
          toast.success(
            res.message || (
              notifModal.type === 'emergency'
                ? `تم إرسال إشعار طارئ إلى ${notifModal.donor.name}`
                : `تم إرسال إشعار جاهزية إلى ${notifModal.donor.name}`
            )
          );
          setNotifModal(null);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'تعذر إرسال الإشعار. يرجى المحاولة لاحقاً');
        },
      }
    );
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
              'text-foreground',
              'bg-muted/40 border-border',
            ],
            [
              'eligible',
              'مؤهلون الآن',
              counts.eligible,
              'text-green-700',
              'bg-green-50 border-green-200',
            ],
            [
              'soon',
              'قريباً (14 يوم)',
              counts.soon,
              'text-yellow-700',
              'bg-yellow-50 border-yellow-200',
            ],
            [
              'not_yet',
              'لم يحن وقتهم',
              counts.not_yet,
              'text-muted-foreground',
              'bg-muted/40 border-border',
            ],
            [
              'deferred',
              'مؤجلون مؤقتاً',
              counts.deferred,
              'text-orange-700',
              'bg-orange-50 border-orange-200',
            ],
            [
              'ineligible',
              'غير مؤهلين طبياً',
              counts.ineligible,
              'text-red-700',
              'bg-red-50 border-red-200',
            ],
          ] as const
        ).map(([val, lbl, cnt, color, bg]) => (
          <button
            key={val}
            onClick={() => { setFilterStatus(val); setPage(1); }}
            role="radio"
            aria-checked={filterStatus === val}
            aria-label={`${lbl} (${cnt} متبرع)`}
            className={`${bg} border rounded-2xl p-4 text-right transition-all ${filterStatus === val ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}
          >
            <div className={color} style={{ fontSize: '24px', fontWeight: 800 }}>
              {cnt}
            </div>
            <div className={`${color} opacity-80`} style={{ fontSize: '12px', fontWeight: 600 }}>
              {lbl}
            </div>
          </button>
        ))}
      </div>

      {/* Blood type eligibility bar */}
      <BloodTypeBar enriched={enriched} stats={stats} filterBlood={filterBlood} onToggle={(blood) => { setFilterBlood(blood); setPage(1); }} />

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            maxLength={100}
            aria-label="بحث بالاسم أو رقم الهاتف أو الفصيلة"
            placeholder="بحث بالاسم أو رقم الهاتف أو الفصيلة..."
            className="w-full pr-9 pl-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400"
            style={{ fontSize: '13px' }}
          />
        </div>
        <select
          value={filterBlood}
          onChange={(e) => { setFilterBlood(e.target.value as BloodType | 'all'); setPage(1); }}
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

      {/* Total results count */}
      <div className="flex items-center justify-between text-muted-foreground px-1" style={{ fontSize: '13px' }}>
        <span>تم العثور على {total} نتيجة</span>
      </div>

      {/* Donors list */}
      <div className="space-y-3">
        {donorsList.map((donor) => {
          const { elig } = donor;
          const cfg = statusCfg[elig.status];
          const hasSentReady = sentNotifs.has(`${donor.id}-ready`);
          const hasSentEmergency = sentNotifs.has(`${donor.id}-emergency`);
          return (
            <div
              key={donor.id}
              className={`bg-card rounded-2xl p-4 border-2 shadow-sm hover:shadow-md transition-all ${cfg.row}`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
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
                      {elig.status === 'eligible' && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span
                            className="text-green-600"
                            style={{ fontSize: '12px', fontWeight: 600 }}
                          >
                            جاهز للتبرع —{' '}
                            {elig.daysAgo < 999
                              ? `مرّ ${elig.daysAgo} يوم منذ آخر تبرع`
                              : 'متبرع جديد'}
                          </span>
                        </div>
                      )}
                      {elig.status === 'soon' && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <span
                            className="text-yellow-600"
                            style={{ fontSize: '12px', fontWeight: 600 }}
                          >
                            يصبح مؤهلاً خلال {elig.daysLeft} يوم — في {elig.eligibleDate}
                          </span>
                        </div>
                      )}
                      {elig.status === 'not_yet' && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                            باقي {elig.daysLeft} يوم — موعد التأهل: {elig.eligibleDate}
                          </span>
                        </div>
                      )}
                      {elig.status === 'deferred' && (
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-orange-600" style={{ fontSize: '12px' }}>
                            موجّل حتى {donor.deferredUntil} (باقي {elig.daysLeft} يوم)
                          </span>
                        </div>
                      )}
                      {elig.status === 'ineligible' && (
                        <span className="text-red-500" style={{ fontSize: '12px' }}>
                          غير مؤهل طبياً
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {(elig.status === 'eligible' || elig.status === 'soon') && (
                    <>
                      <button
                        onClick={() =>
                          !hasSentEmergency && setNotifModal({ donor, type: 'emergency' })
                        }
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${hasSentEmergency ? 'bg-muted text-muted-foreground border-border cursor-default' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {hasSentEmergency ? 'أُرسل' : 'طارئ'}
                      </button>
                      <button
                        onClick={() => !hasSentReady && setNotifModal({ donor, type: 'ready' })}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${hasSentReady ? 'bg-muted text-muted-foreground border-border cursor-default' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <Bell className="w-3.5 h-3.5" />
                        {hasSentReady ? 'أُرسل' : 'إشعار'}
                      </button>
                    </>
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
