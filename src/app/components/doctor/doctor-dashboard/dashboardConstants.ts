import { UserPlus, Megaphone, Users, Heart, TrendingUp } from 'lucide-react';
import { formatLocalizedDate, toISODate } from '../../../utils/date';
import type { DashboardStatistics } from '../../../types/doctorDashboard';

/** Today's date constant (dynamic) */
export const TODAY = toISODate(new Date());
export const TODAY_DATE_DISPLAY = formatLocalizedDate(new Date(), { weekday: 'long' });

/** Stat card configuration builder */
export function buildStats(stats: DashboardStatistics, navigate: (path: string) => void) {
  return [
    {
      label: 'تبرعات اليوم',
      value: stats.todayDonationsCount,
      sub: `${stats.totalDonationsCount} إجمالي التبرعات`,
      icon: Heart,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
      action: () => navigate('/doctor/donations'),
    },
    {
      label: 'إجمالي المتبرعين',
      value: stats.totalDonorsCount,
      sub: `${stats.eligibleDonorsCount} مؤهل`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      action: () => navigate('/doctor/eligibility'),
    },
    {
      label: 'حملاتي النشطة',
      value: stats.myActiveCampaignsCount,
      sub: `${stats.myTotalCampaignsCount} إجمالي`,
      icon: Megaphone,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      action: () => navigate('/doctor/campaigns'),
    },
    {
      label: 'متبرعوني',
      value: stats.myDonorsCount,
      sub: `${stats.myEligibleDonorsCount} مؤهل`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      action: () => navigate('/doctor/eligibility'),
    },
  ];
}

/** Quick action definitions */
export function buildQuickActions(navigate: (path: string) => void) {
  return [
    {
      label: 'تسجيل تبرع جديد',
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
      label: 'عرض التبرعات',
      icon: Users,
      color: 'bg-orange-50 text-orange-600 border-orange-100',
      action: () => navigate('/doctor/donations'),
    },
    {
      label: 'مؤهلية المتبرعين',
      icon: Heart,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
      action: () => navigate('/doctor/eligibility'),
    },
  ];
}
