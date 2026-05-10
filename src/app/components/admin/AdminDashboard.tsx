import { useNavigate } from 'react-router';
import {
  Heart,
  Megaphone,
  UserCog,
  Droplets,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAdminDashboardData } from './hooks/useAdminDashboardData';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';

// ── Sub-components & constants ──
import { donationTypeLabels, recentDonorsHeaders } from './admin-dashboard/dashboardConstants';
import DonationTrendsChart from './admin-dashboard/DonationTrendsChart';
import BloodInventoryPanel from './admin-dashboard/BloodInventoryPanel';
import SystemAlertsPanel from './admin-dashboard/SystemAlertsPanel';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── React Query hook + Derived Data ────────────────────────────────────
  const {
    donors,
    bloodInventory,
    monthlyStatsData,
    isLoading,
    errorDonors,
    refetchDonors,
    doctors,
    labDoctors,
    totalUnits,
    criticalCount,
    recentDonors,
    campaignDonors,
    walkinDonors,
    appDonors,
    totalDonors,
    eligibleDonors,
    totalCampaigns,
    activeCampaigns,
  } = useAdminDashboardData();

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
  if (errorDonors)
    return <ErrorState message="تعذر تحميل بيانات المتبرعين" onRetry={() => refetchDonors()} />;



  const stats = [
    {
      label: 'إجمالي المتبرعين',
      value: totalDonors,
      sub: `${eligibleDonors} مؤهل`,
      icon: Heart,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
      action: () => navigate('/admin/donors'),
    },
    {
      label: 'حملات التبرع',
      value: totalCampaigns,
      sub: `${activeCampaigns} نشطة`,
      icon: Megaphone,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      action: () => navigate('/admin/campaigns'),
    },
    {
      label: 'الكوادر الطبية',
      value: doctors.length + labDoctors.length,
      sub: `${doctors.length} طبيب • ${labDoctors.length} تحاليل`,
      icon: UserCog,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      action: () => navigate('/admin/staff'),
    },
    {
      label: 'وحدات الدم المتاحة',
      value: totalUnits,
      sub: `${criticalCount} فصائل حرجة`,
      icon: Droplets,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
      action: () => navigate('/admin/inventory'),
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
            مرحباً {user?.name} — {format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar })}
          </p>
        </div>
        {criticalCount > 0 && (
          <button
            onClick={() => navigate('/admin/inventory')}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-all"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            <AlertTriangle className="w-4 h-4" />
            {criticalCount} فصائل تحتاج تجديد
          </button>
        )}
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

      {/* Donor Sources */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-green-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-gray-900" style={{ fontSize: '26px', fontWeight: 800 }}>
              {walkinDonors.length}
            </div>
            <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>
              تبرع داخل البنك
            </div>
            <div className="text-gray-400" style={{ fontSize: '11px' }}>
              {donors.length > 0 ? Math.round((walkinDonors.length / donors.length) * 100) : 0}% من
              الإجمالي
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
              {donors.length > 0 ? Math.round((campaignDonors.length / donors.length) * 100) : 0}%
              من الإجمالي
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-gray-900" style={{ fontSize: '26px', fontWeight: 800 }}>
              {appDonors.length}
            </div>
            <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>
              حجز من التطبيق
            </div>
            <div className="text-gray-400" style={{ fontSize: '11px' }}>
              {donors.length > 0 ? Math.round((appDonors.length / donors.length) * 100) : 0}% من
              الإجمالي
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonationTrendsChart data={monthlyStatsData} />
        <BloodInventoryPanel
          inventory={bloodInventory}
          onViewAll={() => navigate('/admin/inventory')}
        />
      </div>

      {/* Recent Donors + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Donors */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
              أحدث المتبرعين
            </h2>
            <button
              onClick={() => navigate('/admin/donors')}
              className="flex items-center gap-1 text-green-600 hover:underline"
              style={{ fontSize: '12px' }}
            >
              عرض الكل <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {recentDonorsHeaders.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-right text-gray-500"
                      style={{ fontSize: '12px', fontWeight: 600 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentDonors.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        {d.donorCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                        {d.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-500" style={{ fontSize: '13px' }}>
                        {d.city}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                        style={{ fontSize: '12px', fontWeight: 700 }}
                      >
                        {d.bloodType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-500" style={{ fontSize: '12px' }}>
                        {donationTypeLabels[d.donationType]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full ${d.status === 'eligible' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        style={{ fontSize: '11px', fontWeight: 600 }}
                      >
                        {d.status === 'eligible' ? 'مؤهل' : 'غير مؤهل'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate('/admin/donors')}
                        className="text-green-600 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50 transition-all"
                        style={{ fontSize: '12px', fontWeight: 600 }}
                      >
                        تعديل
                      </button>
                    </td>
                  </tr>
                ))}
                {recentDonors.length === 0 && (
                  <EmptyState colSpan={7} message="لا توجد بيانات للمتبرعين" />
                )}
              </tbody>
            </table>
          </div>
        </div>

        <SystemAlertsPanel bloodInventory={bloodInventory} />
      </div>
    </div>
  );
}
