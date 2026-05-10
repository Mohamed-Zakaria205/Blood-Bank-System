import { useState, ReactNode } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import {
  LogOut,
  Menu,
  X,
  Droplet,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown, { Notification } from './NotificationDropdown';

export interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  badgeCount?: number;
  badgeColor?: string;
}

export interface DashboardLayoutProps {
  navItems: NavItem[];
  roleLabel: string;
  accentColor: string;
  accentGradient?: string;
  notifications: Notification[];
  headerAlert?: ReactNode;
  sidebarExtra?: ReactNode;
  showDateInHeader?: boolean;
  onMarkAllRead?: () => void;
}

export default function DashboardLayout({
  navItems,
  roleLabel,
  accentColor,
  accentGradient,
  notifications,
  headerAlert,
  sidebarExtra,
  showDateInHeader = true,
  onMarkAllRead,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

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
            style={accentGradient ? { background: accentGradient } : { backgroundColor: accentColor }}
          >
            <Droplet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: '18px', fontWeight: 800 }}>
              BloodLink
            </p>
            <p className="text-gray-500" style={{ fontSize: '11px' }}>
              بنك الدم - بني سويف
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar extra content (e.g., Register Donor button for doctors) */}
      {sidebarExtra && <div className="px-4 py-3">{sidebarExtra}</div>}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p
          className="text-gray-400 px-3 mb-3"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          القائمة الرئيسية
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? accentColor : undefined,
            })}
            onClick={() => setSidebarOpen(false)}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`}
                />
                <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500 }}>
                  {item.label}
                </span>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={`mr-auto text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-red-100 text-red-600'}`}
                    style={{ fontSize: '11px', fontWeight: 700 }}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all"
          style={{ fontSize: '13px', fontWeight: 700 }}
        >
          <LogOut className="w-4 h-4" />
          تسجيل خروج
        </button>
      </div>
    </div>
  );

  // Format date for header
  const formatDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return today.toLocaleDateString('ar-SA', options);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile overlay */}
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
              {showDateInHeader && (
                <div
                  className="hidden lg:flex items-center gap-2 text-gray-500"
                  style={{ fontSize: '13px' }}
                >
                  <span className="text-green-600" style={{ fontWeight: 600 }}>
                    BloodLink
                  </span>
                  <span>/</span>
                  <span>{formatDate()}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {headerAlert}
              <NotificationDropdown
                notifications={notifications}
                open={notifOpen}
                onToggle={() => setNotifOpen((p) => !p)}
                onClose={() => setNotifOpen(false)}
                onMarkAllRead={onMarkAllRead}
              />
              <div className="flex items-center gap-2 pr-2 border-r border-gray-200">
                <div>
                  <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                    {user?.name}
                  </p>
                  <span
                    className="inline-block px-1.5 py-0.5 rounded-full"
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: `${accentColor}20`,
                      color: accentColor,
                    }}
                  >
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}