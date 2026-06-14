import { useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarDays,
  HeartPulse,
  Megaphone,
} from 'lucide-react';
import { useState } from 'react';
import DashboardLayout, { type NavItem } from './DashboardLayout';
import { useDonations } from '../../hooks/useDonors';
import { useCampaigns } from '../../hooks/useCampaigns';

export default function DoctorLayout() {
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());
  const { data: donations = [] } = useDonations();
  const { data: campaigns = [] } = useCampaigns();
  const navigate = useNavigate();
  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDonations = donations.filter((d) => d.donationDate === todayStr);

  const notifications = [
    ...activeCampaigns.map((c) => ({
      id: `camp-${c.id}`,
      title: `${c.title} (${c.campaignCode})`,
      subtitle: `${c.registeredDonors} / ${c.targetDonors} متبرع مسجّل`,
      icon: <Megaphone className="w-4 h-4" />,
      color: 'green' as const,
    })),
    ...(todayDonations.length > 0
      ? [
          {
            id: 'today-donations',
            title: `${todayDonations.length} تبرع مسجّل اليوم`,
            subtitle: 'تم تسجيلهم بنجاح في السجل الطبي',
            icon: <UserPlus className="w-4 h-4" />,
            color: 'blue' as const,
          },
        ]
      : []),
  ].filter((n) => !dismissedNotifs.has(n.id));

  const navItems: NavItem[] = [
    { path: '/doctor', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
    { path: '/doctor/register', label: 'تسجيل تبرع', icon: UserPlus },
    { path: '/doctor/donations', label: 'التبرعات', icon: Users },
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
      <UserPlus className="w-5 h-5" /> تسجيل تبرع جديد
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
      onMarkAllRead={() => {
        const newSet = new Set(dismissedNotifs);
        notifications.forEach((n) => newSet.add(n.id));
        setDismissedNotifs(newSet);
      }}
    />
  );
}
