import { useState, ReactNode } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { LogOut, Menu, X, Droplet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown, { Notification } from './NotificationDropdown';
import { ThemeToggle } from '../shared/ThemeToggle';
import { formatLocalizedDate } from '../../utils/date';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';

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
  const mobileSidebarRef = useModalFocusTrap(() => setSidebarOpen(false), sidebarOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={
              accentGradient ? { background: accentGradient } : { backgroundColor: accentColor }
            }
          >
            <Droplet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p
              id="sidebar-title"
              className="text-foreground"
              style={{ fontSize: '18px', fontWeight: 800 }}
            >
              BloodLink
            </p>
            <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
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
          className="text-muted-foreground px-3 mb-3"
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
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                ? 'text-white shadow-md'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                />
                <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500 }}>
                  {item.label}
                </span>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={`mr-auto text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-card/20 text-white' : item.badgeColor || 'bg-red-100 text-red-600'}`}
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
      <div className="p-4 border-t border-border">
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
    };
    return formatLocalizedDate(today, options);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="fixed top-0 right-0 h-screen w-64 bg-card border-l border-border z-40 hidden lg:block shadow-sm">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        ref={mobileSidebarRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
        className={`fixed top-0 right-0 h-screen w-72 bg-card border-l border-border z-40 lg:hidden shadow-xl transition-transform duration-300 outline-none ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="lg:mr-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 bg-card border-b border-border z-20 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              {showDateInHeader && (
                <div
                  className="hidden lg:flex items-center gap-2 text-muted-foreground"
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
              {/* ── Theme Toggle ── */}
              <ThemeToggle />
              {/* ── User Info ── */}
              <div className="flex items-center gap-2 pr-2 border-r border-border">
                <div>
                  <p className="text-foreground" style={{ fontSize: '13px', fontWeight: 600 }}>
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
