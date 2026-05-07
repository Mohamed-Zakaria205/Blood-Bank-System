import {
  LayoutDashboard,
  Users,
  UserCog,
  Megaphone,
  Droplets,
  BarChart3,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import DashboardLayout, { type NavItem } from './DashboardLayout';
import { useBloodInventory } from '../../hooks/useInventory';

export default function AdminLayout() {
  const { data: bloodInventory = [] } = useBloodInventory();
  const criticalItems = bloodInventory.filter((b) => b.status === 'critical');
  const lowItems = bloodInventory.filter((b) => b.status === 'low');

  const notifications = [
    ...criticalItems.map((b) => ({
      id: `crit-${b.type}`,
      title: `فصيلة ${b.type} — مستوى حرج`,
      subtitle: `متبقي ${b.units} وحدات فقط (الحد الأدنى: ${b.minRequired})`,
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'red' as const,
    })),
    ...lowItems.map((b) => ({
      id: `low-${b.type}`,
      title: `فصيلة ${b.type} — مخزون منخفض`,
      subtitle: `متبقي ${b.units} وحدات (الحد الأدنى: ${b.minRequired})`,
      icon: <Droplets className="w-4 h-4" />,
      color: 'yellow' as const,
    })),
  ];

  const navItems: NavItem[] = [
    { path: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
    { path: '/admin/donors', label: 'المتبرعون', icon: Users },
    { path: '/admin/staff', label: 'إدارة الأطباء', icon: UserCog },
    { path: '/admin/campaigns', label: 'حملات التبرع', icon: Megaphone },
    { path: '/admin/inventory', label: 'مخزون الدم', icon: Droplets, badgeCount: criticalItems.length, badgeColor: 'bg-red-100 text-red-600' },
    { path: '/admin/reports', label: 'التقارير', icon: BarChart3 },
    { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
  ];

  const headerAlert = criticalItems.length > 0 ? (
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
      notifications={notifications}
      headerAlert={headerAlert}
    />
  );
}
