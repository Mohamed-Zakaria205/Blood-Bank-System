import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router';
import { useEffect, lazy, Suspense } from 'react';
import { useAuth } from './contexts/AuthContext';
import { PageLoader } from './components/shared/LoadingSkeleton';

// ── Auth (eagerly loaded — needed immediately) ──
import LoginPage from './components/auth/LoginPage';
import RoleGuard from './components/auth/RoleGuard';

// ── Shared (eagerly loaded — needed for error boundaries) ──
import ErrorBoundary from './components/shared/ErrorBoundary';

// ── Layouts (lazy loaded per role) ──
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const DoctorLayout = lazy(() => import('./components/layout/DoctorLayout'));
const LabLayout = lazy(() => import('./components/layout/LabLayout'));
const InventoryLayout = lazy(() => import('./components/layout/InventoryLayout'));

// ── Admin Pages (lazy loaded) ──
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AdminDonors = lazy(() => import('./components/admin/AdminDonors'));
const AdminStaff = lazy(() => import('./components/admin/AdminStaff'));
const AdminCampaigns = lazy(() => import('./components/admin/AdminCampaigns'));
const AdminInventory = lazy(() => import('./components/admin/AdminInventory'));
const AdminReports = lazy(() => import('./components/admin/AdminReports'));
const AdminSettings = lazy(() => import('./components/admin/AdminSettings'));

// ── Doctor Pages (lazy loaded) ──
const DoctorDashboard = lazy(() => import('./components/doctor/DoctorDashboard'));
const DoctorDonations = lazy(() => import('./components/doctor/DoctorDonations'));
const DonationRegistrationForm = lazy(() => import('./components/doctor/DonationRegistrationForm'));
const DoctorCampaigns = lazy(() => import('./components/doctor/DoctorCampaigns'));
const DoctorAppointments = lazy(() => import('./components/doctor/DoctorAppointments'));
const DoctorEligibility = lazy(() => import('./components/doctor/DoctorEligibility'));

// ── Lab Pages (lazy loaded) ──
const LabDashboard = lazy(() => import('./components/lab/LabDashboard'));
const LabResults = lazy(() => import('./components/lab/LabResults'));

// ── Inventory Pages (lazy loaded) ──
const InventoryDashboard = lazy(() => import('./components/inventory/InventoryDashboard'));
const InventoryBags = lazy(() => import('./components/inventory/InventoryBags'));
const InventoryHistory = lazy(() => import('./components/inventory/InventoryHistory'));
const InventoryAlerts = lazy(() => import('./components/inventory/InventoryAlerts'));

// ── Suspense wrapper — shows PageLoader while a lazy chunk is loading ──
function SuspenseOutlet() {
  return (
    <Suspense fallback={<PageLoader message="جاري تحميل الصفحة..." />}>
      <Outlet />
    </Suspense>
  );
}

// ── Root layout — providers live in App.tsx above RouterProvider ──
function RootLayout() {
  useEffect(() => {
    sessionStorage.removeItem('chunk_retry_failed');
  }, []);

  return (
    <div dir="rtl" className="min-h-screen" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </div>
  );
}

// ── Redirects unauthenticated users to login, authenticated to their dashboard ──
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

// ── Router Definition ──
export const router = createBrowserRouter([
  {
    Component: RootLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/', Component: RootRedirect },
      { path: '/login', Component: LoginPage },

      // ── Admin Routes ──
      {
        path: '/admin',
        element: <RoleGuard allowedRole="admin" />,
        children: [
          {
            Component: AdminLayout,
            children: [
              {
                Component: SuspenseOutlet,
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
        ],
      },

      // ── Doctor Routes ──
      {
        path: '/doctor',
        element: <RoleGuard allowedRole="doctor" />,
        children: [
          {
            Component: DoctorLayout,
            children: [
              {
                Component: SuspenseOutlet,
                children: [
                  { index: true, Component: DoctorDashboard },
                  { path: 'donations', Component: DoctorDonations },
                  { path: 'register', Component: DonationRegistrationForm },
                  { path: 'campaigns', Component: DoctorCampaigns },
                  { path: 'appointments', Component: DoctorAppointments },
                  { path: 'eligibility', Component: DoctorEligibility },
                ],
              },
            ],
          },
        ],
      },

      // ── Lab Routes ──
      {
        path: '/lab',
        element: <RoleGuard allowedRole="lab" />,
        children: [
          {
            Component: LabLayout,
            children: [
              {
                Component: SuspenseOutlet,
                children: [
                  { index: true, Component: LabDashboard },
                  { path: 'results', Component: LabResults },
                ],
              },
            ],
          },
        ],
      },

      // ── Inventory Routes ──
      {
        path: '/inventory',
        element: <RoleGuard allowedRole="inventory" />,
        children: [
          {
            Component: InventoryLayout,
            children: [
              {
                Component: SuspenseOutlet,
                children: [
                  { index: true, Component: InventoryDashboard },
                  { path: 'bags', Component: InventoryBags },
                  { path: 'history', Component: InventoryHistory },
                  { path: 'inventory-alerts', Component: InventoryAlerts },
                ],
              },
            ],
          },
        ],
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
