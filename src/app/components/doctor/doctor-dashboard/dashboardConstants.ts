import {
  UserPlus,
  Megaphone,
  Users,
  Heart,
  TrendingUp,
} from 'lucide-react';

/** Static weekly donor data (will be replaced by API) */
export const weekData = [
  { day: 'الأحد', donors: 3 },
  { day: 'الإثنين', donors: 5 },
  { day: 'الثلاثاء', donors: 2 },
  { day: 'الأربعاء', donors: 7 },
  { day: 'الخميس', donors: 4 },
  { day: 'الجمعة', donors: 1 },
  { day: 'السبت', donors: 6 },
];

/** Today's date constant (simulated) */
export const TODAY = '2025-04-29';
export const TODAY_DATE_DISPLAY = 'الثلاثاء، 29 أبريل 2025';

/** Stat card configuration builder */
export function buildStats(
  donors: { registeredAt?: string; status?: string }[],
  myCampaigns: { status?: string }[],
  myDonors: { status?: string }[],
  navigate: (path: string) => void,
) {
  return [
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
}

/** Quick action definitions */
export function buildQuickActions(navigate: (path: string) => void) {
  return [
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
  ];
}
