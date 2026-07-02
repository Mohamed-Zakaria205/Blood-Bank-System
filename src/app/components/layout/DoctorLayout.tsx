import { useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarDays,
  HeartPulse,
  Megaphone,
  Settings,
  Target,
} from 'lucide-react';
import DashboardLayout, { type NavItem } from './DashboardLayout';
import { useCampaigns } from '../../hooks/useCampaigns';

export default function DoctorLayout() {
  const { data: campaigns = [] } = useCampaigns();
  const navigate = useNavigate();
  const activeCampaigns = campaigns.filter((c) => c.status === 'active');

  const navItems: NavItem[] = [
    { path: '/doctor', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
    { path: '/doctor/register', label: 'تسجيل تبرع', icon: UserPlus },
    { path: '/doctor/donations', label: 'التبرعات', icon: Users },
    { path: '/doctor/appointments', label: 'المواعيد', icon: CalendarDays },
    { path: '/doctor/eligibility', label: 'مؤهلية المتبرعين', icon: HeartPulse },
    {
      path: '/doctor/campaigns',
      label: 'حملات التبرع',
      icon: Megaphone,
      badgeCount: activeCampaigns.length,
      badgeColor: 'bg-green-100 text-green-700',
    },
    { path: '/doctor/targets', label: 'أهداف الفرع الرئيسي', icon: Target },
    { path: '/doctor/settings', label: 'الإعدادات', icon: Settings },
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
      <UserPlus className="w-5 h-5" /> تسجيل تبرع جديد
    </button>
  );

  return (
    <DashboardLayout
      navItems={navItems}
      roleLabel="طبيب"
      accentColor="#15803d"
      accentGradient="linear-gradient(135deg, #15803d, #22c55e)"
      sidebarExtra={sidebarExtra}
    />
  );
}
