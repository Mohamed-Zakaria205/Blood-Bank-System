import {
  LayoutDashboard,
  Package,
  Trash2,
  History,
  Activity,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useState } from 'react';
import DashboardLayout, { type NavItem } from './DashboardLayout';
import { useBloodBags } from '../../hooks/useInventory';

export default function InventoryLayout() {
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());
  const { data: bags = [] } = useBloodBags();
  const TODAY = new Date();
  const nearExpiry = bags.filter((b) => {
    if (b.status !== 'available') return false;
    const diff = (new Date(b.expiryDate).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  });
  const expiredActive = bags.filter((b) => {
    if (b.status !== 'available') return false;
    return new Date(b.expiryDate) < TODAY;
  });
  const rejectedBags = bags.filter((b) => b.status === 'disposed' && b.disposeReason === 'failed_screening');
  const totalAlerts = nearExpiry.length + expiredActive.length;

  const notifications = [
    ...nearExpiry.map((b) => ({
      id: `near-${b.id}`,
      title: `حقبة ${b.bagCode} — تنتهي خلال 3 أيام`,
      subtitle: `تنتهي في ${b.expiryDate}`,
      icon: <Clock className="w-4 h-4" />,
      color: 'yellow' as const,
    })),
    ...expiredActive.map((b) => ({
      id: `exp-${b.id}`,
      title: `حقبة ${b.bagCode} — منتهية الصلاحية`,
      subtitle: `منتهية منذ ${Math.floor((TODAY.getTime() - new Date(b.expiryDate).getTime()) / (1000 * 60 * 60 * 24))} يوم`,
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'red' as const,
    })),
    ...rejectedBags.map((b) => ({
      id: `rej-${b.id}`,
      title: `حقبة ${b.bagCode} — مرفوضة`,
      subtitle: `فصيلة ${b.bloodType}`,
      icon: <Trash2 className="w-4 h-4" />,
      color: 'red' as const,
    })),
  ].filter((n) => !dismissedNotifs.has(n.id));

  const navItems: NavItem[] = [
    { path: '/inventory', label: 'لوحة المخزون', icon: LayoutDashboard, end: true },
    { path: '/inventory/bags', label: 'حقائب الدم', icon: Package },
    { path: '/inventory/disposal', label: 'إتلاف الحقائب', icon: Trash2 },
    { path: '/inventory/history', label: 'سجل الصادر', icon: History },
    { path: '/inventory/inventory-alerts', label: 'تحليلات المخزون', icon: Activity },
  ];

  const headerAlert = totalAlerts > 0 ? (
    <div className="hidden sm:flex items-center gap-1.5 bg-yellow-50 border border-yellow-100 px-3 py-1.5 rounded-lg">
      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
      <span className="text-yellow-600" style={{ fontSize: '12px', fontWeight: 600 }}>
        {totalAlerts} حقائب تحتاج مراجعة
      </span>
    </div>
  ) : undefined;

  return (
    <DashboardLayout
      navItems={navItems}
      roleLabel="مسؤول مخزون"
      accentColor="#2563eb"
      accentGradient="linear-gradient(135deg, #2563eb, #60a5fa)"
      notifications={notifications}
      headerAlert={headerAlert}
      onMarkAllRead={() => {
        const newSet = new Set(dismissedNotifs);
        notifications.forEach((n) => newSet.add(n.id));
        setDismissedNotifs(newSet);
      }}
    />
  );
}
