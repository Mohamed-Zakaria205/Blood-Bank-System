import { useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'red' | 'yellow' | 'green' | 'blue';
}

interface Props {
  notifications: Notification[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const colorMap = {
  red:    { bg: 'rgba(248,113,113,0.12)', icon: '#ef4444', text: '#dc2626', sub: '#f87171' },
  yellow: { bg: 'rgba(251,191,36,0.12)',  icon: '#d97706', text: '#b45309', sub: '#fbbf24' },
  green:  { bg: 'rgba(34,197,94,0.12)',   icon: '#16a34a', text: '#15803d', sub: '#22c55e' },
  blue:   { bg: 'rgba(96,165,250,0.12)',  icon: '#2563eb', text: '#1d4ed8', sub: '#60a5fa' },
};

export default function NotificationDropdown({ notifications, open, onToggle, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={onToggle}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        title="الإشعارات"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white rounded-full flex items-center justify-center"
            style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#ef4444' }}
          >
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full mt-2 w-80 rounded-2xl border z-50 overflow-hidden"
          style={{
            right: 'auto',
            left: 0,
            backgroundColor: 'var(--popover, #ffffff)',
            borderColor: 'var(--border, #e5e7eb)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--border, #e5e7eb)' }}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-green-600" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground, #111)' }}>
                الإشعارات
              </span>
              {notifications.length > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-white"
                  style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#16a34a' }}
                >
                  {notifications.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: 'var(--muted-foreground, #6b7280)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Items */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell className="w-8 h-8" style={{ color: 'var(--muted-foreground, #9ca3af)' }} />
                <p style={{ fontSize: '13px', color: 'var(--muted-foreground, #6b7280)' }}>لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const c = colorMap[n.color];
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors"
                    style={{
                      borderBottom: i < notifications.length - 1 ? `1px solid var(--border, #e5e7eb)` : 'none',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: c.bg }}
                    >
                      <span style={{ color: c.icon }}>{n.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground, #111)', marginBottom: '2px' }}>
                        {n.title}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--muted-foreground, #6b7280)' }}>
                        {n.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className="px-4 py-2 border-t text-center"
              style={{ borderColor: 'var(--border, #e5e7eb)' }}
            >
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, cursor: 'pointer' }}>
                تمت المراجعة
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}