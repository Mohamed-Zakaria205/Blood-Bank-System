import { AlertTriangle, Info } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'inventory' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
}

interface SystemAlertsPanelProps {
  notifications: NotificationItem[];
}

export default function SystemAlertsPanel({ notifications }: SystemAlertsPanelProps) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      <h2 className="text-foreground mb-5" style={{ fontSize: '16px', fontWeight: 700 }}>
        تنبيهات النظام
      </h2>
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-3 rounded-xl ${
              n.severity === 'critical'
                ? 'bg-red-50 border border-red-100'
                : n.severity === 'warning'
                ? 'bg-yellow-50 border border-yellow-100'
                : 'bg-blue-50 border border-blue-100'
            }`}
          >
            {n.severity === 'info' ? (
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle
                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  n.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
                }`}
              />
            )}
            <div>
              <p
                className={`${
                  n.severity === 'critical'
                    ? 'text-red-700'
                    : n.severity === 'warning'
                    ? 'text-yellow-700'
                    : 'text-blue-700'
                }`}
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                {n.title}
              </p>
              <p
                className={`${
                  n.severity === 'critical'
                    ? 'text-red-500'
                    : n.severity === 'warning'
                    ? 'text-yellow-600'
                    : 'text-blue-600'
                }`}
                style={{ fontSize: '12px' }}
              >
                {n.message}
              </p>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="text-muted-foreground text-center py-4" style={{ fontSize: '13px' }}>
            لا توجد تنبيهات نشطة حالياً.
          </p>
        )}
      </div>
    </div>
  );
}
