import { useState, useMemo } from 'react';
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
import { BLOOD_TYPES } from '../../constants';
import { useDonors } from '../../hooks/useDonors';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';

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
  const { data: donorsData = [], isLoading, isError, refetch } = useDonors();

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isError)
    return <ErrorState message="تعذر تحميل بيانات المتبرعين" onRetry={() => refetch()} />;

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'eligible' | 'soon' | 'not_yet'>('all');
  const [filterBlood, setFilterBlood] = useState<BloodType | 'all'>('all');
  const [notifModal, setNotifModal] = useState<NotifModal | null>(null);
  const [sentNotifs, setSentNotifs] = useState<Set<string>>(new Set());

  const enriched: EnrichedDonor[] = useMemo(
    () => donorsData.map((d: Donor) => ({ ...d, elig: calcEligibility(d) })),
    [donorsData],
  );

  const filtered = useMemo(() => {
    return enriched.filter((d) => {
      const matchSearch =
        d.name.includes(search) || d.phone.includes(search) || d.bloodType.includes(search);
      const matchStatus = filterStatus === 'all' || d.elig.status === filterStatus;
      const matchBlood = filterBlood === 'all' || d.bloodType === filterBlood;
      return matchSearch && matchStatus && matchBlood;
    });
  }, [enriched, search, filterStatus, filterBlood]);

  const counts = {
    eligible: enriched.filter((d) => d.elig.status === 'eligible').length,
    soon: enriched.filter((d) => d.elig.status === 'soon').length,
    not_yet: enriched.filter((d) => d.elig.status === 'not_yet').length,
    deferred: enriched.filter((d) => d.elig.status === 'deferred').length,
    ineligible: enriched.filter((d) => d.elig.status === 'ineligible').length,
  };

  const sendNotification = () => {
    if (!notifModal) return;
    setSentNotifs((prev) => new Set([...prev, `${notifModal.donor.id}-${notifModal.type}`]));
    toast.success(
      notifModal.type === 'emergency'
        ? `تم إرسال إشعار طارئ إلى ${notifModal.donor.name}`
        : `تم إرسال إشعار جاهزية إلى ${notifModal.donor.name}`,
    );
    setNotifModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
            مؤهلية المتبرعين
          </h1>
          <p className="text-gray-500" style={{ fontSize: '14px' }}>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            [
              'all',
              'الجميع',
              counts.eligible + counts.soon + counts.not_yet + counts.deferred,
              'text-gray-700',
              'bg-gray-50 border-gray-200',
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
              'text-gray-600',
              'bg-gray-50 border-gray-200',
            ],
          ] as const
        ).map(([val, lbl, cnt, color, bg]) => (
          <button
            key={val}
            onClick={() => setFilterStatus(val)}
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
      <BloodTypeBar enriched={enriched} filterBlood={filterBlood} onToggle={setFilterBlood} />

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو رقم الهاتف أو الفصيلة..."
            className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
            style={{ fontSize: '13px' }}
          />
        </div>
        <select
          value={filterBlood}
          onChange={(e) => setFilterBlood(e.target.value as BloodType | 'all')}
          className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-700 outline-none"
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

      {/* Donors list */}
      <div className="space-y-3">
        {filtered.map((donor) => {
          const { elig } = donor;
          const cfg = statusCfg[elig.status];
          const hasSentReady = sentNotifs.has(`${donor.id}-ready`);
          const hasSentEmergency = sentNotifs.has(`${donor.id}-emergency`);
          return (
            <div
              key={donor.id}
              className={`bg-white rounded-2xl p-4 border-2 shadow-sm hover:shadow-md transition-all ${cfg.row}`}
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
                      <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>
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
                        className="flex items-center gap-1 text-gray-500"
                        style={{ fontSize: '12px' }}
                      >
                        <Phone className="w-3 h-3" /> {donor.phone}
                      </span>
                      {donor.lastDonationDate && (
                        <span
                          className="flex items-center gap-1 text-gray-500"
                          style={{ fontSize: '12px' }}
                        >
                          <Heart className="w-3 h-3 text-red-400" /> آخر تبرع:{' '}
                          {donor.lastDonationDate}
                        </span>
                      )}
                      {!donor.lastDonationDate && (
                        <span className="text-gray-400" style={{ fontSize: '12px' }}>
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
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500" style={{ fontSize: '12px' }}>
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
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${hasSentEmergency ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {hasSentEmergency ? 'أُرسل' : 'طارئ'}
                      </button>
                      <button
                        onClick={() => !hasSentReady && setNotifModal({ donor, type: 'ready' })}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${hasSentReady ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
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
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400" style={{ fontSize: '14px' }}>
              لا توجد نتائج
            </p>
          </div>
        )}
      </div>

      {/* Notification modal */}
      {notifModal && (
        <NotifyDonorModal
          modal={notifModal}
          onSend={sendNotification}
          onCancel={() => setNotifModal(null)}
        />
      )}
    </div>
  );
}
