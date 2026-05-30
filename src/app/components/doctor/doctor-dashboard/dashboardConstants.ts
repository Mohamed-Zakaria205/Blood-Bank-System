import {
  UserPlus,
  Megaphone,
  Users,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { formatLocalizedDate, toISODate } from '../../../utils/date';


/** Today's date constant (dynamic) */
export const TODAY = toISODate(new Date());
export const TODAY_DATE_DISPLAY = formatLocalizedDate(new Date(), { weekday: 'long' });

/** Stat card configuration builder */
export function buildStats(
  donors: { registeredAt?: string; status?: string }[],
  donations: { donationDate?: string }[],
  myCampaigns: { status?: string }[],
  myDonors: { status?: string }[],
  navigate: (path: string) => void,
) {
  return [
    {
      label: 'تبرعات اليوم',
      value: donations.filter((d) => {
        if (!d.donationDate) return false;
        if (d.donationDate.includes('T')) {
          const dObj = new Date(d.donationDate);
          if (isNaN(dObj.getTime())) return false;
          const localStr = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
          return localStr === TODAY;
        }
        return d.donationDate === TODAY;
      }).length,
      sub: `${donations.length} إجمالي التبرعات`,
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
  ];
}
