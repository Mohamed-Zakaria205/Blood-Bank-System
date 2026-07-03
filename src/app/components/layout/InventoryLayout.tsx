import {
  LayoutDashboard,
  Package,
  History,
  Activity,
  ClipboardList,
} from 'lucide-react';
import DashboardLayout, { type NavItem } from './DashboardLayout';

export default function InventoryLayout() {
  const navItems: NavItem[] = [
    { path: '/inventory', label: 'لوحة المخزون', icon: LayoutDashboard, end: true },
    { path: '/inventory/bags', label: 'حقائب الدم', icon: Package },
    { path: '/inventory/requests', label: 'طلبات الدم', icon: ClipboardList },
    { path: '/inventory/history', label: 'سجل الصادر', icon: History },
    { path: '/inventory/inventory-alerts', label: 'تحليلات المخزون', icon: Activity },
  ];


  return (
    <DashboardLayout
      navItems={navItems}
      roleLabel="مسؤول مخزون"
      accentColor="#2563eb"
      accentGradient="linear-gradient(135deg, #2563eb, #60a5fa)"
    />
  );
}
