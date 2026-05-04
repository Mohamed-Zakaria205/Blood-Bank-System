import { createContext, useContext, useState, ReactNode } from 'react';
import { slot15Data, Slot15 } from '../data/mockData';

// ── Notification shape ─────────────────────────────────
export interface CancellationNotification {
  id: string;
  donorName: string;
  donorPhone?: string;
  date: string;
  time: string;
  campaignId?: string;
  cancelledAt: string;
  cancelledByName: string;
  reason?: string;
  read: boolean;
}

// ── Context shape ──────────────────────────────────────
interface AppointmentContextType {
  slots: Slot15[];
  notifications: CancellationNotification[];
  unreadCount: number;
  cancelAppointment: (slotId: string, reason: string, doctorId: string, doctorName: string) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

const AppointmentContext = createContext<AppointmentContextType | null>(null);

// ── Provider ───────────────────────────────────────────
export function AppointmentProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<Slot15[]>(() =>
    slot15Data.map(s => ({ ...s }))
  );
  const [notifications, setNotifications] = useState<CancellationNotification[]>([]);

  const cancelAppointment = (
    slotId: string,
    reason: string,
    doctorId: string,
    doctorName: string,
  ) => {
    const now = new Date().toLocaleString('ar-EG', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });

    let cancelled: Slot15 | undefined;

    setSlots(prev =>
      prev.map(s => {
        if (s.id !== slotId) return s;
        cancelled = s;
        return {
          ...s,
          status: 'cancelled',
          cancelledAt: now,
          cancelledBy: doctorId,
          cancelledByName: doctorName,
          cancellationReason: reason || undefined,
        };
      })
    );

    // Build notification for the donor
    const target = slots.find(s => s.id === slotId);
    if (target) {
      const notif: CancellationNotification = {
        id: `NOTIF-${Date.now()}`,
        donorName: target.donorName || '—',
        donorPhone: target.donorPhone,
        date: target.date,
        time: target.time,
        campaignId: target.campaignId,
        cancelledAt: now,
        cancelledByName: doctorName,
        reason: reason || undefined,
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const markNotificationRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppointmentContext.Provider value={{
      slots, notifications, unreadCount,
      cancelAppointment, markNotificationRead, markAllRead,
    }}>
      {children}
    </AppointmentContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────
export function useAppointments() {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error('useAppointments must be used inside AppointmentProvider');
  return ctx;
}
