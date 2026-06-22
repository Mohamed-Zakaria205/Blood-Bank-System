import {
  LayoutDashboard,
  Users,
  UserCog,
  Megaphone,
  Droplets,
  BarChart3,
  Settings,
} from 'lucide-react';
import DashboardLayout, { type NavItem } from './DashboardLayout';

export default function AdminLayout() {
  const navItems: NavItem[] = [
    { path: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
    { path: '/admin/donors', label: 'المتبرعين', icon: Users },
    { path: '/admin/staff', label: 'إدارة الأطباء', icon: UserCog },
    { path: '/admin/campaigns', label: 'حملات التبرع', icon: Megaphone },
    {
      path: '/admin/inventory',
      label: 'مخزون الدم',
      icon: Droplets,
    },
    { path: '/admin/reports', label: 'التقارير', icon: BarChart3 },
    { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      roleLabel="مدير عام"
      accentColor="#15803d"
      accentGradient="linear-gradient(135deg, #15803d, #22c55e)"
    />
  );
}
