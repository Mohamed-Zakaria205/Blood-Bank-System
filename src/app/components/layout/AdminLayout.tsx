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
import { useBloodInventory } from '../../hooks/useInventory';

export default function AdminLayout() {
  const { data: bloodInventory = [] } = useBloodInventory();
  const criticalItems = bloodInventory.filter((b) => b.status === 'critical');

  const navItems: NavItem[] = [
    { path: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
    { path: '/admin/donors', label: 'المتبرعين', icon: Users },
    { path: '/admin/staff', label: 'إدارة الأطباء', icon: UserCog },
    { path: '/admin/campaigns', label: 'حملات التبرع', icon: Megaphone },
    {
      path: '/admin/inventory',
      label: 'مخزون الدم',
      icon: Droplets,
      badgeCount: criticalItems.length,
      badgeColor: 'bg-red-100 text-red-600',
    },
    { path: '/admin/reports', label: 'التقارير', icon: BarChart3 },
    { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
  ];

  const headerAlert =
    criticalItems.length > 0 ? (
      <div className="hidden sm:flex items-center gap-1.5 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-red-600" style={{ fontSize: '12px', fontWeight: 600 }}>
          {criticalItems.length} فصائل بمستوى حرج
        </span>
      </div>
    ) : undefined;

  return (
    <DashboardLayout
      navItems={navItems}
      roleLabel="مدير عام"
      accentColor="#15803d"
      accentGradient="linear-gradient(135deg, #15803d, #22c55e)"
      headerAlert={headerAlert}
    />
  );
}
