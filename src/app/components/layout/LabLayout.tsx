import {
  LayoutDashboard,
  BarChart2,
  FlaskConical,
} from 'lucide-react';
import { useState } from 'react';
import DashboardLayout, { type NavItem } from './DashboardLayout';
import { useLabTests } from '../../hooks/useLabTests';

export default function LabLayout() {
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());
  const { data: labTests = [] } = useLabTests();
  const pendingTests = labTests.filter((t) => t.status === 'pending');
  const pendingCount = pendingTests.length;

  const notifications = pendingTests.map((t) => ({
    id: `lab-${t.id}`,
    title: `عينة ${t.donationCode} — فصيلة ${t.bloodType}`,
    subtitle: 'في انتظار إدخال نتائج الفحص',
    icon: <FlaskConical className="w-4 h-4" />,
    color: 'yellow' as const,
  })).filter((n) => !dismissedNotifs.has(n.id));

  const navItems: NavItem[] = [
    { path: '/lab', label: 'فحص حقائب الدم', icon: LayoutDashboard, end: true, badgeCount: pendingCount, badgeColor: 'bg-yellow-100 text-yellow-700' },
    { path: '/lab/results', label: 'نتائج الفحوصات', icon: BarChart2, end: false },
  ];

  const headerAlert = pendingCount > 0 ? (
    <div className="hidden sm:flex items-center gap-1.5 bg-yellow-50 border border-yellow-100 px-3 py-1.5 rounded-lg">
      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
      <span className="text-yellow-600" style={{ fontSize: '12px', fontWeight: 600 }}>
        {pendingCount} عينات في انتظار الفحص
      </span>
    </div>
  ) : undefined;

  return (
    <DashboardLayout
      navItems={navItems}
      roleLabel="فني مختبر"
      accentColor="#d97706"
      accentGradient="linear-gradient(135deg, #d97706, #fbbf24)"
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
