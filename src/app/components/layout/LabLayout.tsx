import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  FlaskConical,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Droplet,
  BarChart2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLabTests } from '../../hooks/useLabTests';
import NotificationDropdown, { Notification } from './NotificationDropdown';

const navItems = [
  { path: '/lab', label: 'فحص حقائب الدم', icon: LayoutDashboard, end: true },
  { path: '/lab/results', label: 'نتائج الفحوصات', icon: BarChart2, end: false },
];

export default function LabLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: labTests = [] } = useLabTests();
  const pendingTests = labTests.filter((t: any) => t.status === 'pending');
  const pendingCount = pendingTests.length;

  const notifications: Notification[] = pendingTests.map((t) => ({
    id: `lab-${t.id}`,
    title: `عينة ${t.donorCode} — فصيلة ${t.bloodType}`,
    subtitle: 'في انتظار إدخال نتائج الفحص',
    icon: <FlaskConical className="w-4 h-4" />,
    color: 'yellow' as const,
  }));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #15803d, #22c55e)' }}
          >
            <Droplet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: '18px', fontWeight: 800 }}>
              BloodLink
            </p>
            <p className="text-gray-500" style={{ fontSize: '11px' }}>
              قسم التحاليل المخبرية
            </p>
          </div>
        </div>
      </div>

      {/* Status card */}
      <div className="px-4 py-3">
        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-700" style={{ fontSize: '12px', fontWeight: 700 }}>
              دكتور تحاليل
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-yellow-100">
            <span className="text-yellow-600" style={{ fontSize: '11px' }}>
              حقائب معلقة
            </span>
            {pendingCount > 0 ? (
              <span
                className="px-2 py-0.5 bg-yellow-500 text-white rounded-full animate-pulse"
                style={{ fontSize: '11px', fontWeight: 700 }}
              >
                {pendingCount}
              </span>
            ) : (
              <span
                className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full"
                style={{ fontSize: '11px', fontWeight: 700 }}
              >
                لا شيء
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-gray-400 px-3 mb-3" style={{ fontSize: '11px', fontWeight: 600 }}>
          القائمة
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`}
                />
                <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500 }}>
                  {item.path === '/lab/samples' ? 'العينات' : item.label}
                </span>
                {pendingCount > 0 && item.path === '/lab' && (
                  <span
                    className={`mr-auto px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-700'}`}
                    style={{ fontSize: '11px', fontWeight: 700 }}
                  >
                    {pendingCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Restricted notice */}
      <div className="px-4 pb-2"></div>

      {/* User info */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-green-700" style={{ fontSize: '14px', fontWeight: 700 }}>
              {user?.name?.charAt(2) || 'ت'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 truncate" style={{ fontSize: '13px', fontWeight: 600 }}>
              {user?.name}
            </p>
            <span
              className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full"
              style={{ fontSize: '10px', fontWeight: 700 }}
            >
              دكتور تحاليل
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="fixed top-0 right-0 h-screen w-64 bg-white border-l border-gray-200 z-40 hidden lg:block shadow-sm">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed top-0 right-0 h-screen w-72 bg-white border-l border-gray-200 z-40 lg:hidden shadow-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="lg:mr-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 bg-white border-b border-gray-200 z-20 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div
                className="hidden lg:flex items-center gap-2 text-gray-500"
                style={{ fontSize: '13px' }}
              >
                <span className="text-green-600" style={{ fontWeight: 600 }}>
                  BloodLink
                </span>
                <span>/</span>
                <span>قسم التحاليل — الأحد، 26 أبريل 2025</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-700" style={{ fontSize: '12px', fontWeight: 600 }}>
                    {pendingCount} حقيبة معلقة
                  </span>
                </div>
              )}
              <NotificationDropdown
                notifications={notifications}
                open={notifOpen}
                onToggle={() => setNotifOpen((p) => !p)}
                onClose={() => setNotifOpen(false)}
              />
              <div className="flex items-center gap-2 pr-2 border-r border-gray-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-700" style={{ fontSize: '12px', fontWeight: 700 }}>
                    {user?.name?.charAt(2) || 'ت'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                    {user?.name?.split(' ').slice(0, 2).join(' ')}
                  </p>
                  <span
                    className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full"
                    style={{ fontSize: '10px', fontWeight: 700 }}
                  >
                    دكتور تحاليل
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
