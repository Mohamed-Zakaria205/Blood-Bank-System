import { useNavigate } from 'react-router';
import {
  UserPlus,
  Megaphone,
  Building2,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDonors } from '../../hooks/useDonors';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useSlot15Data } from '../../hooks/useAppointments';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';

// ── Sub-components ──
import { TODAY, TODAY_DATE_DISPLAY, buildStats, buildQuickActions } from './doctor-dashboard/dashboardConstants';
import WeeklyChart from './doctor-dashboard/WeeklyChart';
import ActiveCampaignsPanel from './doctor-dashboard/ActiveCampaignsPanel';
import UpcomingAppointments from './doctor-dashboard/UpcomingAppointments';
import RecentDonors from './doctor-dashboard/RecentDonors';

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

  const myDonors = donors.filter((d) => d.registeredBy === user?.id);
  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const myCampaigns = campaigns.filter((c) => c.createdBy === user?.id);

  const walkinToday = donors.filter((d) => d.registeredAt === '2025-04-26' && d.source === 'walkin').length;
  const appToday = donors.filter((d) => d.registeredAt === '2025-04-26' && d.source === 'app').length;
  const campaignToday = donors.filter((d) => d.registeredAt === '2025-04-26' && d.source === 'campaign').length;
  const campaignDonors = donors.filter((d) => d.source === 'campaign');

  const upcomingToday = slot15Data.filter((s) => s.date === TODAY && s.status === 'booked');

  const stats = buildStats(donors, myCampaigns, myDonors, navigate);
  const quickActions = buildQuickActions(navigate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
            لوحة التحكم
          </h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: '14px' }}>
            مرحباً {user?.name} — {TODAY_DATE_DISPLAY}
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
            <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>تبرع داخل البنك</div>
            <div className="text-gray-400" style={{ fontSize: '11px' }}>{walkinToday} اليوم</div>
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
            <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>عن طريق حملة</div>
            <div className="text-gray-400" style={{ fontSize: '11px' }}>{campaignToday} اليوم</div>
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
            <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>حجز من التطبيق</div>
            <div className="text-gray-400" style={{ fontSize: '11px' }}>{appToday} اليوم</div>
          </div>
        </div>
      </div>

      {/* Chart + Campaigns Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WeeklyChart />
        <ActiveCampaignsPanel
          campaigns={activeCampaigns}
          onViewAll={() => navigate('/doctor/campaigns')}
        />
      </div>

      {/* Today's Appointments */}
      <UpcomingAppointments
        appointments={upcomingToday}
        onViewAll={() => navigate('/doctor/appointments')}
        onRegister={(aptId) => navigate(`/doctor/register?apt=${aptId}`)}
      />

      {/* Recent Donors */}
      <RecentDonors
        donors={donors}
        onViewAll={() => navigate('/doctor/donors')}
      />

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-gray-900 mb-5" style={{ fontSize: '16px', fontWeight: 700 }}>
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((a, i) => (
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
