import { Bell, BellOff, ChevronUp } from 'lucide-react';
import type { CancellationNotification } from '../../../types';

interface NotificationsPanelProps {
  notifications: CancellationNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function NotificationsPanel({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: NotificationsPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>
            إشعارات الإلغاء
          </span>
          {notifications.filter((n) => !n.read).length > 0 && (
            <span
              className="px-2 py-0.5 bg-red-500 text-white rounded-full"
              style={{ fontSize: '11px', fontWeight: 700 }}
            >
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.read) && (
            <button
              onClick={onMarkAllRead}
              className="text-green-600 hover:text-green-700"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              تحديد الكل كمقروء
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <BellOff className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400" style={{ fontSize: '13px' }}>
              لا توجد إشعارات
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => onMarkRead(n.id)}
              className={`flex gap-3 px-5 py-3.5 cursor-pointer transition-all hover:bg-gray-50 ${!n.read ? 'bg-red-50/40' : ''}`}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${!n.read ? 'bg-red-500' : 'bg-gray-200'}`}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-gray-900"
                  style={{ fontSize: '13px', fontWeight: n.read ? 500 : 700 }}
                >
                  تم إلغاء موعد <span className="text-red-600">{n.donorName}</span>
                </p>
                <p className="text-gray-500" style={{ fontSize: '11px' }}>
                  {n.date} — {n.time} · بواسطة: {n.cancelledByName}
                </p>
                {n.reason && (
                  <p className="text-gray-400" style={{ fontSize: '11px' }}>
                    السبب: {n.reason}
                  </p>
                )}
                {n.donorPhone && (
                  <p className="text-blue-600 font-mono mt-0.5" style={{ fontSize: '11px' }}>
                    📱 إشعار أُرسل إلى: {n.donorPhone}
                  </p>
                )}
              </div>
              <span className="text-gray-300 flex-shrink-0" style={{ fontSize: '10px' }}>
                {n.cancelledAt}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
