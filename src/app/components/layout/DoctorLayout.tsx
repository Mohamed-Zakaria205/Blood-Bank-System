import { useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarDays,
  HeartPulse,
  Megaphone,
} from 'lucide-react';
import DashboardLayout, { type NavItem } from './DashboardLayout';
import { useDonors } from '../../hooks/useDonors';
import { useCampaigns } from '../../hooks/useCampaigns';

export default function DoctorLayout() {
  const { data: donors = [] } = useDonors();
  const { data: campaigns = [] } = useCampaigns();
  const navigate = useNavigate();
  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDonors = donors.filter((d) => d.registeredAt === todayStr);

  const notifications = [
    ...activeCampaigns.map((c) => ({
      id: `camp-${c.id}`,
      title: c.title,
      subtitle: `${c.registeredDonors} / ${c.targetDonors} متبرع مسجّل`,
      icon: <Megaphone className="w-4 h-4" />,
      color: 'green' as const,
    })),
    ...(todayDonors.length > 0
      ? [
          {
            id: 'today-donors',
            title: `${todayDonors.length} متبرع مسجّل اليوم`,
            subtitle: 'تم تسجيلهم بنجاح في السجل الطبي',
            icon: <UserPlus className="w-4 h-4" />,
            color: 'blue' as const,
          },
        ]
      : []),
  ];

  const navItems: NavItem[] = [
    { path: '/doctor', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
    { path: '/doctor/register', label: 'تسجيل متبرع', icon: UserPlus },
    { path: '/doctor/donors', label: 'المتبرعون', icon: Users },
    { path: '/doctor/appointments', label: 'المواعيد', icon: CalendarDays },
    { path: '/doctor/eligibility', label: 'مؤهلية المتبرعين', icon: HeartPulse },
    { path: '/doctor/campaigns', label: 'حملات التبرع', icon: Megaphone, badgeCount: activeCampaigns.length, badgeColor: 'bg-green-100 text-green-700' },
  ];

  const sidebarExtra = (
    <button
      onClick={() => navigate('/doctor/register')}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white transition-all"
      style={{
        background: 'linear-gradient(135deg, #15803d, #22c55e)',
        fontSize: '14px',
        fontWeight: 700,
      }}
    >
      <UserPlus className="w-5 h-5" /> تسجيل متبرع جديد
    </button>
  );

  return (
    <DashboardLayout
      navItems={navItems}
      roleLabel="طبيب"
      accentColor="#15803d"
      accentGradient="linear-gradient(135deg, #15803d, #22c55e)"
      notifications={notifications}
      sidebarExtra={sidebarExtra}
    />
  );
}
