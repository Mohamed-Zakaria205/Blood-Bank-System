import { useNavigate } from 'react-router';
import {
  UserPlus,
  Megaphone,
  Users,
  Heart,
  TrendingUp,
  ArrowUpRight,
  Building2,
  Smartphone,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDonors } from '../../hooks/useDonors';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useSlot15Data } from '../../hooks/useAppointments';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';

const weekData = [
  { day: 'الأحد', donors: 3 },
  { day: 'الإثنين', donors: 5 },
  { day: 'الثلاثاء', donors: 2 },
  { day: 'الأربعاء', donors: 7 },
  { day: 'الخميس', donors: 4 },
  { day: 'الجمعة', donors: 1 },
  { day: 'السبت', donors: 6 },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: donors = [], isLoading: loadingDonors, isError, refetch } = useDonors();
  const { data: campaigns = [], isLoading: loadingCampaigns } = useCampaigns();
  const { data: slot15Data = [], isLoading: loadingSlots } = useSlot15Data();

  const isLoading = loadingDonors || loadingCampaigns || loadingSlots;
  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TableSkeleton rows={4} cols={5} />
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
            <div className="h-48 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  if (isError) return <ErrorState message="تعذر تحميل البيانات" onRetry={() => refetch()} />;

  const myDonors = donors.filter((d: any) => d.registeredBy === user?.id);
  const activeCampaigns = campaigns.filter((c: any) => c.status === 'active');
  const myCampaigns = campaigns.filter((c: any) => c.createdBy === user?.id);
  const walkinToday = donors.filter(
    (d: any) => d.registeredAt === '2025-04-26' && d.source === 'walkin',
  ).length;
  const appToday = donors.filter(
    (d: any) => d.registeredAt === '2025-04-26' && d.source === 'app',
  ).length;
  const campaignToday = donors.filter(
    (d: any) => d.registeredAt === '2025-04-26' && d.source === 'campaign',
  ).length;
  const campaignDonors = donors.filter((d: any) => d.source === 'campaign');

  // Today's upcoming appointments (13:00 onwards — simulated current time 10:30)
  const TODAY = '2025-04-29';
  const upcomingToday = slot15Data.filter((s) => s.date === TODAY && s.status === 'booked');

  const stats = [
    {
      label: 'متبرعو اليوم',
      value: donors.filter((d) => d.registeredAt === '2025-04-26').length,
      sub: 'مسجلون اليوم',
      icon: Heart,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
      action: () => navigate('/doctor/donors'),
    },
    {
      label: 'إجمالي المتبرعين',
      value: donors.length,
      sub: `${donors.filter((d) => d.status === 'eligible').length} مؤهل`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      action: () => navigate('/doctor/donors'),
    },
    {
      label: 'حملاتي النشطة',
      value: myCampaigns.filter((c) => c.status === 'active').length,
      sub: `${myCampaigns.length} إجمالي`,
      icon: Megaphone,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      action: () => navigate('/doctor/campaigns'),
    },
    {
      label: 'متبرعوني',
      value: myDonors.length,
      sub: `${myDonors.filter((d) => d.status === 'eligible').length} مؤهل`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      action: () => navigate('/doctor/donors'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
            لوحة التحكم
          </h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: '14px' }}>
            مرحباً {user?.name} — الثلاثاء، 29 أبريل 2025
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate('/doctor/register')}
            className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl transition-all shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #15803d, #16a34a)',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            <UserPlus className="w-5 h-5" /> تسجيل متبرع
          </button>
          <button
            onClick={() => navigate('/doctor/campaigns')}
            className="flex items-center gap-2 px-4 py-2.5 border border-green-200 text-green-600 rounded-xl hover:bg-green-50 transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            <Megaphone className="w-4 h-4" /> حملة جديدة
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <button
            key={i}
            onClick={s.action}
            className={`bg-white rounded-2xl p-5 border ${s.border} shadow-sm hover:shadow-md transition-all text-right`}
          >
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-gray-900" style={{ fontSize: '30px', fontWeight: 800 }}>
              {s.value}
            </div>
            <div className="text-gray-700 mt-0.5" style={{ fontSize: '13px', fontWeight: 600 }}>
              {s.label}
            </div>
            <div className="text-gray-400 mt-0.5" style={{ fontSize: '12px' }}>
              {s.sub}
            </div>
          </button>
        ))}
      </div>

      {/* Source badges summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-green-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-gray-900" style={{ fontSize: '26px', fontWeight: 800 }}>
              {donors.filter((d) => d.source === 'walkin').length}
            </div>
            <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>
              تبرع داخل البنك
            </div>
            <div className="text-gray-400" style={{ fontSize: '11px' }}>
              {walkinToday} اليوم
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-gray-900" style={{ fontSize: '26px', fontWeight: 800 }}>
              {campaignDonors.length}
            </div>
            <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>
              عن طريق حملة
            </div>
            <div className="text-gray-400" style={{ fontSize: '11px' }}>
              {campaignToday} اليوم
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-gray-900" style={{ fontSize: '26px', fontWeight: 800 }}>
              {donors.filter((d) => d.source === 'app').length}
            </div>
            <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>
              حجز من التطبيق
            </div>
            <div className="text-gray-400" style={{ fontSize: '11px' }}>
              {appToday} اليوم
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
            <div>
              <h2 className="text-gray-900" style={{ fontSize: '15px', fontWeight: 700 }}>
                المتبرعون هذا الأسبوع
              </h2>
              <p className="text-gray-400 mt-0.5" style={{ fontSize: '11px' }}>
                إجمالي {weekData.reduce((a, b) => a + b.donors, 0)} متبرع — المعدل اليومي{' '}
                {Math.round(weekData.reduce((a, b) => a + b.donors, 0) / weekData.length)}
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
              style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}
            >
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d' }}>
                ↑ 12% عن الأسبوع الماضي
              </span>
            </div>
          </div>

          {/* Chart area */}
          <div className="px-6 pt-5 pb-4">
            {/* Chart with grid */}
            <div className="relative" style={{ height: '176px' }}>
              {/* Horizontal grid lines + y-axis labels */}
              {[7, 5, 3, 1].map((v, i) => (
                <div
                  key={v}
                  className="absolute w-full flex items-center gap-3 pointer-events-none"
                  style={{ bottom: `${(v / 7) * 140 + 24}px` }}
                >
                  <span
                    className="text-gray-300 flex-shrink-0 text-right"
                    style={{ fontSize: '9px', fontWeight: 600, width: '14px' }}
                  >
                    {v}
                  </span>
                  <div className="flex-1 border-t border-dashed border-gray-100" />
                </div>
              ))}

              {/* Bars */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 pl-5">
                {weekData.map((d) => {
                  const max = Math.max(...weekData.map((w) => w.donors));
                  const barHeightPx = Math.max((d.donors / max) * 140, 10);
                  const isToday = d.day === 'الثلاثاء';
                  return (
                    <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1 group">
                      {/* Value label */}
                      <div
                        className={`px-1.5 py-0.5 rounded-md transition-all ${
                          isToday
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-700'
                        }`}
                        style={{ fontSize: '11px', fontWeight: 700, lineHeight: '1.4' }}
                      >
                        {d.donors}
                      </div>
                      {/* Bar */}
                      <div
                        className="w-full rounded-t-xl transition-all"
                        style={{
                          height: `${barHeightPx}px`,
                          background: isToday
                            ? 'linear-gradient(180deg, #15803d 0%, #22c55e 100%)'
                            : 'linear-gradient(180deg, #86efac 0%, #bbf7d0 100%)',
                          boxShadow: isToday ? '0 4px 12px rgba(34,197,94,0.30)' : undefined,
                        }}
                      />
                      {/* Day name */}
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className={isToday ? 'text-green-700' : 'text-gray-400'}
                          style={{ fontSize: '10px', fontWeight: isToday ? 700 : 500 }}
                        >
                          {d.day.slice(0, 3)}
                        </span>
                        {isToday && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend + footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: 'linear-gradient(180deg, #15803d, #22c55e)' }}
                  />
                  <span className="text-gray-500" style={{ fontSize: '11px' }}>
                    اليوم الحالي
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
                  <span className="text-gray-500" style={{ fontSize: '11px' }}>
                    أيام الأسبوع
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-500" style={{ fontSize: '11px' }}>
                  الأعلى:{' '}
                  <span style={{ fontWeight: 700, color: '#374151' }}>
                    {Math.max(...weekData.map((w) => w.donors))} متبرع
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
              الحملات النشطة
            </h2>
            <button
              onClick={() => navigate('/doctor/campaigns')}
              className="flex items-center gap-1 text-green-600 hover:underline"
              style={{ fontSize: '12px' }}
            >
              الكل <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-48">
            {activeCampaigns.slice(0, 4).map((c) => {
              const pct = Math.round((c.registeredDonors / c.targetDonors) * 100);
              return (
                <div key={c.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between mb-1.5">
                    <p
                      className="text-gray-900 text-right"
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      {c.title}
                    </p>
                    <span
                      className={`px-1.5 py-0.5 rounded-full flex-shrink-0 mr-2 ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
                      style={{ fontSize: '10px', fontWeight: 700 }}
                    >
                      {c.status === 'active' ? 'نشطة' : 'قادمة'}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500" style={{ fontSize: '10px' }}>
                      {c.registeredDonors} / {c.targetDonors}
                    </span>
                    <span className="text-green-600" style={{ fontSize: '10px', fontWeight: 700 }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {activeCampaigns.length === 0 && (
              <div className="py-6 text-center text-gray-400">
                <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p style={{ fontSize: '13px' }}>لا توجد حملات نشطة</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Today's Appointments ─── */}
      {upcomingToday.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-gray-900" style={{ fontSize: '15px', fontWeight: 700 }}>
                  مواعيد اليوم القادمة
                </h2>
                <p className="text-gray-400" style={{ fontSize: '11px' }}>
                  من التطبيق — {upcomingToday.length} موعد محجوز
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/doctor/appointments')}
              className="text-green-600 hover:text-green-700 flex items-center gap-1"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              عرض الكل <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingToday.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-green-50 cursor-pointer transition-all group"
                onClick={() => navigate(`/doctor/register?apt=${apt.id}`)}
              >
                {/* Time */}
                <div className="flex-shrink-0 w-14 text-center">
                  <span
                    className="text-green-700 font-mono"
                    style={{ fontSize: '14px', fontWeight: 800 }}
                    dir="ltr"
                  >
                    {apt.time}
                  </span>
                </div>
                {/* Donor info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-gray-900 truncate"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    {apt.donorName}
                  </p>
                  <p className="text-gray-400 font-mono" style={{ fontSize: '11px' }}>
                    {apt.donorNationalId?.slice(0, 10)}...
                  </p>
                </div>
                {/* Blood type + status */}
                <div className="hidden sm:flex items-center gap-2">
                  {apt.donorBloodType && (
                    <span
                      className="px-2 py-0.5 bg-red-50 border border-red-100 text-red-600 rounded-full"
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {apt.donorBloodType}
                    </span>
                  )}
                  <span
                    className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full"
                    style={{ fontSize: '11px', fontWeight: 700 }}
                  >
                    محجوز
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Donors */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
            آخر المتبرعين
          </h2>
          <button
            onClick={() => navigate('/doctor/donors')}
            className="flex items-center gap-1 text-green-600 hover:underline"
            style={{ fontSize: '12px' }}
          >
            عرض الكل <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {donors.slice(0, 6).map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-red-600" style={{ fontSize: '11px', fontWeight: 800 }}>
                  {d.bloodType}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 truncate" style={{ fontSize: '13px', fontWeight: 600 }}>
                  {d.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {d.source === 'app' ? (
                    <span
                      className="flex items-center gap-0.5 text-blue-600"
                      style={{ fontSize: '10px' }}
                    >
                      <Smartphone className="w-2.5 h-2.5" /> تطبيق
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-0.5 text-green-600"
                      style={{ fontSize: '10px' }}
                    >
                      <Building2 className="w-2.5 h-2.5" /> البنك
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full flex-shrink-0 ${d.status === 'eligible' ? 'bg-green-100 text-green-700' : d.status === 'deferred' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}
                style={{ fontSize: '10px', fontWeight: 700 }}
              >
                {d.status === 'eligible' ? 'مؤهل' : d.status === 'deferred' ? 'موجل' : 'غير مؤهل'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-gray-900 mb-5" style={{ fontSize: '16px', fontWeight: 700 }}>
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'تسجيل متبرع جديد',
              icon: UserPlus,
              color: 'bg-green-50 text-green-600 border-green-100',
              action: () => navigate('/doctor/register'),
            },
            {
              label: 'إنشاء حملة',
              icon: Megaphone,
              color: 'bg-purple-50 text-purple-600 border-purple-100',
              action: () => navigate('/doctor/campaigns'),
            },
            {
              label: 'عرض المتبرعين',
              icon: Users,
              color: 'bg-orange-50 text-orange-600 border-orange-100',
              action: () => navigate('/doctor/donors'),
            },
            {
              label: 'مؤهلية المتبرعين',
              icon: Heart,
              color: 'bg-teal-50 text-teal-600 border-teal-100',
              action: () => navigate('/doctor/eligibility'),
            },
          ].map((a, i) => (
            <button
              key={i}
              onClick={a.action}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border hover:shadow-md transition-all group ${a.color}`}
            >
              <a.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span style={{ fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
