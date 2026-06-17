import { useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';

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
  onMarkAllRead?: () => void;
}

const lightColorMap = {
  red: { bg: 'rgba(248,113,113,0.12)', icon: '#ef4444', text: '#dc2626', sub: '#f87171' },
  yellow: { bg: 'rgba(251,191,36,0.12)', icon: '#d97706', text: '#b45309', sub: '#fbbf24' },
  green: { bg: 'rgba(34,197,94,0.12)', icon: '#16a34a', text: '#15803d', sub: '#22c55e' },
  blue: { bg: 'rgba(96,165,250,0.12)', icon: '#2563eb', text: '#1d4ed8', sub: '#60a5fa' },
};

const darkColorMap = {
  red: { bg: 'rgba(180,90,90,0.15)', icon: '#c97a74', text: '#d48880', sub: '#c97a74' },
  yellow: { bg: 'rgba(200,160,60,0.15)', icon: '#cfa040', text: '#cfa040', sub: '#d4b050' },
  green: { bg: 'rgba(77,158,120,0.15)', icon: '#4d9e78', text: '#7dc4a6', sub: '#6dc49a' },
  blue: { bg: 'rgba(107,174,214,0.15)', icon: '#6baed6', text: '#7eb3e0', sub: '#6baed6' },
};

export default function NotificationDropdown({
  notifications,
  open,
  onToggle,
  onClose,
  onMarkAllRead,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useModalFocusTrap(onClose, open);
  const { isDark } = useTheme();
  const colorMap = isDark ? darkColorMap : lightColorMap;

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
        className="relative p-2 text-muted-foreground hover:bg-accent rounded-xl transition-colors"
        title="الإشعارات"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white rounded-full flex items-center justify-center bg-red-500"
            style={{ fontSize: '10px', fontWeight: 700 }}
          >
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          role="dialog"
          aria-modal="true"
          className="absolute top-full mt-2 w-80 rounded-2xl border border-border z-50 overflow-hidden bg-popover shadow-xl outline-none"
          style={{ right: 'auto', left: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-green-600" />
              <span className="text-foreground" style={{ fontSize: '14px', fontWeight: 700 }}>
                الإشعارات
              </span>
              {notifications.length > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-white bg-green-600"
                  style={{ fontSize: '11px', fontWeight: 700 }}
                >
                  {notifications.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Items */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell className="w-8 h-8 text-muted-foreground" />
                <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                  لا توجد إشعارات
                </p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const c = colorMap[n.color];
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                    style={{
                      borderBottom:
                        i < notifications.length - 1 ? `1px solid var(--border)` : 'none',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: c.bg }}
                    >
                      <span style={{ color: c.icon }}>{n.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-foreground"
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          marginBottom: '2px',
                        }}
                      >
                        {n.title}
                      </p>
                      <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
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
              className="px-4 py-2 border-t border-border text-center hover:bg-accent transition-colors cursor-pointer"
              onClick={() => {
                if (onMarkAllRead) onMarkAllRead();
                onClose();
              }}
            >
              <span className="text-primary" style={{ fontSize: '12px', fontWeight: 600 }}>
                تمت المراجعة
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
