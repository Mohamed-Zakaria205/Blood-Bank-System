import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Package, History, LogOut, Menu, X,
  ChevronDown, Droplet, Clock, AlertTriangle, Activity, Trash2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBloodBags } from '../../hooks/useInventory';
import NotificationDropdown, { Notification } from './NotificationDropdown';

const navItems = [
  { path: '/inventory',          label: 'لوحة المخزون',    icon: LayoutDashboard, end: true },
  { path: '/inventory/bags',     label: 'حقائب الدم',      icon: Package },
  { path: '/inventory/disposal', label: 'إتلاف الحقائب',   icon: Trash2 },
  { path: '/inventory/history',  label: 'سجل الصادر',      icon: History },
  { path: '/inventory/inventory-alerts', label: 'تحليلات المخزون', icon: Activity },
];

export default function InventoryLayout() {
  const { user, logout } = useAuth();
  const { data: bags = [] } = useBloodBags();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const TODAY = new Date('2025-04-29');
  const nearExpiry = bags.filter(b => {
    if (b.status !== 'available') return false;
    const diff = (new Date(b.expiryDate).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  });
  const expiredActive = bags.filter(b => {
    if (b.status !== 'available') return false;
    return new Date(b.expiryDate) < TODAY;
  });
  const rejectedBags = bags.filter(b => b.status === 'rejected');
  const available = bags.filter(b => b.status === 'available').length;
  const totalAlerts = nearExpiry.length + expiredActive.length;
  const disposalAlerts = nearExpiry.length + expiredActive.length + rejectedBags.length;

  const notifications: Notification[] = [
    ...expiredActive.map(b => ({
      id: `exp-${b.id}`, title: `حقيبة ${b.bagCode} منتهية الصلاحية`, subtitle: `${b.bloodType} — انتهت في ${b.expiryDate}`,
      icon: <AlertTriangle className="w-4 h-4" />, color: 'red' as const,
    })),
    ...nearExpiry.map(b => ({
      id: `near-${b.id}`, title: `حقيبة ${b.bagCode} — قريبة الانتهاء`, subtitle: `${b.bloodType} — تنتهي في ${b.expiryDate}`,
      icon: <Clock className="w-4 h-4" />, color: 'yellow' as const,
    })),
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #15803d, #22c55e)' }}>
            <Droplet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: '18px', fontWeight: 800 }}>BloodLink</p>
            <p className="text-gray-500" style={{ fontSize: '11px' }}>إدارة مخزون الدم</p>
          </div>
        </div>
      </div>

      {/* Status card */}
      <div className="px-4 py-3">
        <div className={`p-3 border rounded-xl space-y-2 ${totalAlerts > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-100'}`}>
          <div className="flex items-center gap-2">
            <Package className={`w-4 h-4 ${totalAlerts > 0 ? 'text-red-600' : 'text-green-600'}`} />
            <span className={totalAlerts > 0 ? 'text-red-700' : 'text-green-700'} style={{ fontSize: '12px', fontWeight: 700 }}>أمين مخزن</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-opacity-30" style={{ borderColor: totalAlerts > 0 ? '#fca5a5' : '#86efac' }}>
            <span className={totalAlerts > 0 ? 'text-red-600' : 'text-green-600'} style={{ fontSize: '11px' }}>
              {totalAlerts > 0 ? 'تنبيهات الحقائب' : 'الحقائب المتاحة'}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-white ${totalAlerts > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-600'}`}
              style={{ fontSize: '11px', fontWeight: 700 }}>
              {totalAlerts > 0 ? totalAlerts : available}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-gray-400 px-3 mb-3" style={{ fontSize: '11px', fontWeight: 600 }}>القائمة الرئيسية</p>
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }
            onClick={() => setSidebarOpen(false)}>
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                {item.path === '/inventory/bags' && (expiredActive.length > 0 || nearExpiry.length > 0) && (
                  <span className={`mr-auto px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}
                    style={{ fontSize: '11px', fontWeight: 700 }}>{expiredActive.length + nearExpiry.length}</span>
                )}
                {item.path === '/inventory/disposal' && disposalAlerts > 0 && (
                  <span className={`mr-auto px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}
                    style={{ fontSize: '11px', fontWeight: 700 }}>{disposalAlerts}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-green-700" style={{ fontSize: '14px', fontWeight: 700 }}>{user?.name?.charAt(2) || 'م'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 truncate" style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name}</p>
            <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full" style={{ fontSize: '10px', fontWeight: 700 }}>أمين مخزن</span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-1"><LogOut className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className="fixed top-0 right-0 h-screen w-64 bg-white border-l border-gray-200 z-40 hidden lg:block shadow-sm"><SidebarContent /></aside>
      <aside className={`fixed top-0 right-0 h-screen w-72 bg-white border-l border-gray-200 z-40 lg:hidden shadow-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button onClick={() => setSidebarOpen(false)} className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
        <SidebarContent />
      </aside>
      <div className="lg:mr-64 min-h-screen flex flex-col">
        <header className="sticky top-0 bg-white border-b border-gray-200 z-20 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Menu className="w-5 h-5" /></button>
              <div className="hidden lg:flex items-center gap-2 text-gray-500" style={{ fontSize: '13px' }}>
                <span className="text-green-600" style={{ fontWeight: 600 }}>BloodLink</span>
                <span>/</span>
                <span>إدارة المخزون — الثلاثاء، 29 أبريل 2025</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(expiredActive.length > 0 || nearExpiry.length > 0) && (
                <div className="hidden sm:flex items-center gap-1.5 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-600" style={{ fontSize: '12px', fontWeight: 600 }}>{expiredActive.length + nearExpiry.length} حقيبة تحتاج إجراء</span>
                </div>
              )}
              <NotificationDropdown notifications={notifications} open={notifOpen} onToggle={() => setNotifOpen(p => !p)} onClose={() => setNotifOpen(false)} />
              <div className="flex items-center gap-2 pr-2 border-r border-gray-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-700" style={{ fontSize: '12px', fontWeight: 700 }}>{user?.name?.charAt(2) || 'م'}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name?.split(' ').slice(0, 2).join(' ')}</p>
                  <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full" style={{ fontSize: '10px', fontWeight: 700 }}>أمين مخزن</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6"><Outlet /></main>
      </div>
    </div>
  );
}