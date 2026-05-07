import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

// ── Auth ──
import LoginPage from './components/auth/LoginPage';
import RoleGuard from './components/auth/RoleGuard';

// ── Layouts ──
import AdminLayout from './components/layout/AdminLayout';
import DoctorLayout from './components/layout/DoctorLayout';
import LabLayout from './components/layout/LabLayout';
import InventoryLayout from './components/layout/InventoryLayout';

// ── Admin Pages ──
import AdminDashboard from './components/admin/AdminDashboard';
import AdminDonors from './components/admin/AdminDonors';
import AdminStaff from './components/admin/AdminStaff';
import AdminCampaigns from './components/admin/AdminCampaigns';
import AdminInventory from './components/admin/AdminInventory';
import AdminReports from './components/admin/AdminReports';
import AdminSettings from './components/admin/AdminSettings';
import AdminInventoryAlerts from './components/admin/AdminInventoryAlerts';

// ── Doctor Pages ──
import DoctorDashboard from './components/doctor/DoctorDashboard';
import DoctorDonors from './components/doctor/DoctorDonors';
import DonorRegistrationForm from './components/doctor/DonorRegistrationForm';
import DoctorCampaigns from './components/doctor/DoctorCampaigns';
import DoctorAppointments from './components/doctor/DoctorAppointments';
import DoctorEligibility from './components/doctor/DoctorEligibility';

// ── Lab Pages ──
import LabDashboard from './components/lab/LabDashboard';
import LabResults from './components/lab/LabResults';

// ── Inventory Pages ──
import InventoryDashboard from './components/inventory/InventoryDashboard';
import InventoryBags from './components/inventory/InventoryBags';
import InventoryHistory from './components/inventory/InventoryHistory';
import InventoryDisposal from './components/inventory/InventoryDisposal';

// ── Shared ──
import ErrorBoundary from './components/shared/ErrorBoundary';

// ── Root layout — providers live in App.tsx above RouterProvider ──
function RootLayout() {
  return (
    <div dir="rtl" className="min-h-screen" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <Outlet />
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

      // ── Doctor Routes ──
      {
        path: '/doctor',
        element: <RoleGuard allowedRole="doctor" />,
        children: [
          {
            Component: DoctorLayout,
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

      // ── Lab Routes ──
      {
        path: '/lab',
        element: <RoleGuard allowedRole="lab" />,
        children: [
          {
            Component: LabLayout,
            children: [
              { index: true, Component: LabDashboard },
              { path: 'results', Component: LabResults },
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
