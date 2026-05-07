import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import AdminLayout from './components/layout/AdminLayout';
import DoctorLayout from './components/layout/DoctorLayout';
import LabLayout from './components/layout/LabLayout';
import InventoryLayout from './components/layout/InventoryLayout';
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
      {
        path: '/doctor',
        Component: DoctorGuard,
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
      {
        path: '/lab',
        Component: LabGuard,
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
      {
        path: '/inventory',
        Component: InventoryGuard,
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
