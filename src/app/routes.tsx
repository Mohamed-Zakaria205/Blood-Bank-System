import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import DashboardLayout, { NavItem } from './components/layout/DashboardLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminDonors from './components/admin/AdminDonors';
import AdminStaff from './components/admin/AdminStaff';
import AdminCampaigns from './components/admin/AdminCampaigns';
import AdminInventory from './components/admin/AdminInventory';
import AdminReports from './components/admin/AdminReports';
import AdminSettings from './components/admin/AdminSettings';
import AdminInventoryAlerts from './components/admin/AdminInventoryAlerts';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import DoctorDonors from './components/doctor/DoctorDonors';
import DonorRegistrationForm from './components/doctor/DonorRegistrationForm';
import DoctorCampaigns from './components/doctor/DoctorCampaigns';
import DoctorAppointments from './components/doctor/DoctorAppointments';
import DoctorEligibility from './components/doctor/DoctorEligibility';
import LabDashboard from './components/lab/LabDashboard';
import LabResults from './components/lab/LabResults';
import InventoryDashboard from './components/inventory/InventoryDashboard';
import InventoryBags from './components/inventory/InventoryBags';
import InventoryHistory from './components/inventory/InventoryHistory';
import InventoryDisposal from './components/inventory/InventoryDisposal';
import ErrorBoundary from './components/shared/ErrorBoundary';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Megaphone,
  BarChart3,
  Settings,
  UserPlus,
  CalendarDays,
  HeartPulse,
  Package,
  History,
  Trash2,
  Activity,
  FlaskConical,
  BarChart2,
} from 'lucide-react';

// Root layout — providers live in App.tsx above RouterProvider
function RootLayout() {
  return (
    <div dir="rtl" className="min-h-screen" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <Outlet />
    </div>
  );
}

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
    <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
          />
        </svg>
      </div>
      <h2 className="text-gray-900 mb-2" style={{ fontSize: '20px', fontWeight: 700 }}>
        غير مصرح بالدخول
      </h2>
      <p className="text-gray-500" style={{ fontSize: '14px' }}>
        ليس لديك صلاحية للوصول إلى هذه الصفحة
      </p>
    </div>
  </div>
);

function RootRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
    else if (user.role === 'admin') navigate('/admin', { replace: true });
    else if (user.role === 'lab') navigate('/lab', { replace: true });
    else if (user.role === 'inventory') navigate('/inventory', { replace: true });
    else navigate('/doctor', { replace: true });
  }, [user, navigate]);

  return null;
}

function AdminGuard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);
  if (!user) return null;
  if (user.role !== 'admin') return <UnauthorizedPage />;
  return <Outlet />;
}

function DoctorGuard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);
  if (!user) return null;
  if (user.role !== 'doctor') return <UnauthorizedPage />;
  return <Outlet />;
}

function LabGuard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);
  if (!user) return null;
  if (user.role !== 'lab') return <UnauthorizedPage />;
  return <Outlet />;
}

function InventoryGuard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);
  if (!user) return null;
  if (user.role !== 'inventory') return <UnauthorizedPage />;
  return <Outlet />;
}

// Admin Layout Configuration
const AdminDashboardLayout = () => {
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
};

// Doctor Layout Configuration
const DoctorDashboardLayout = () => {
  const { data: donors = [] } = useDonors();
  const { data: campaigns = [] } = useCampaigns();
  const navigate = useNavigate();
  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const todayDonors = donors.filter((d) => d.registeredAt === '2025-04-26');

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
};

// Lab Layout Configuration
const LabDashboardLayout = () => {
  const { data: labTests = [] } = useLabTests();
  const pendingTests = labTests.filter((t) => t.status === 'pending');
  const pendingCount = pendingTests.length;

  const notifications = pendingTests.map((t) => ({
    id: `lab-${t.id}`,
    title: `عينة ${t.donorCode} — فصيلة ${t.bloodType}`,
    subtitle: 'في انتظار إدخال نتائج الفحص',
    icon: <FlaskConical className="w-4 h-4" />,
    color: 'yellow' as const,
  }));

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
    />
  );
};

// Inventory Layout Configuration
const InventoryDashboardLayout = () => {
  const { data: bags = [] } = useBloodBags();
  const TODAY = new Date('2025-04-29');
  const nearExpiry = bags.filter((b) => {
    if (b.status !== 'available') return false;
    const diff = (new Date(b.expiryDate).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  });
  const expiredActive = bags.filter((b) => {
    if (b.status !== 'available') return false;
    return new Date(b.expiryDate) < TODAY;
  });
  const rejectedBags = bags.filter((b) => b.status === 'rejected');
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
  ];

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
    />
  );
};

// Import hooks needed for the layouts
import { useBloodInventory, useBloodBags } from './hooks/useInventory';
import { useDonors } from './hooks/useDonors';
import { useCampaigns } from './hooks/useCampaigns';
import { useLabTests } from './hooks/useLabTests';
import { AlertTriangle, Clock, Droplets } from 'lucide-react';

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/', Component: RootRedirect },
      { path: '/login', Component: LoginPage },
      {
        path: '/admin',
        Component: AdminGuard,
        children: [
          {
            Component: AdminDashboardLayout,
            children: [
              { index: true, Component: AdminDashboard },
              { path: 'donors', Component: AdminDonors },
              { path: 'staff', Component: AdminStaff },
              { path: 'campaigns', Component: AdminCampaigns },
              { path: 'inventory', Component: AdminInventory },
              { path: 'reports', Component: AdminReports },
              { path: 'settings', Component: AdminSettings },
            ],
          },
        ],
      },
      {
        path: '/doctor',
        Component: DoctorGuard,
        children: [
          {
            Component: DoctorDashboardLayout,
            children: [
              { index: true, Component: DoctorDashboard },
              { path: 'donors', Component: DoctorDonors },
              { path: 'register', Component: DonorRegistrationForm },
              { path: 'campaigns', Component: DoctorCampaigns },
              { path: 'appointments', Component: DoctorAppointments },
              { path: 'eligibility', Component: DoctorEligibility },
            ],
          },
        ],
      },
      {
        path: '/lab',
        Component: LabGuard,
        children: [
          {
            Component: LabDashboardLayout,
            children: [
              { index: true, Component: LabDashboard },
              { path: 'results', Component: LabResults },
            ],
          },
        ],
      },
      {
        path: '/inventory',
        Component: InventoryGuard,
        children: [
          {
            Component: InventoryDashboardLayout,
            children: [
              { index: true, Component: InventoryDashboard },
              { path: 'bags', Component: InventoryBags },
              { path: 'history', Component: InventoryHistory },
              { path: 'disposal', Component: InventoryDisposal },
              { path: 'inventory-alerts', Component: AdminInventoryAlerts },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
