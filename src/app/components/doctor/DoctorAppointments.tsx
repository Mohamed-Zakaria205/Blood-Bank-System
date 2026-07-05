import { useState, useCallback, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { AlertTriangle, Filter, Bell } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { AppointmentSlot, CancellationNotification } from '../../types';
import {
  useAppointmentSlots,
  useAppointmentStats,
  useCancelAppointment,
  useMarkNoShow,
} from '../../hooks/useAppointments';
import { useAppointmentsHub } from '../../hooks/useAppointmentsHub';
import { useAuth } from '../../contexts/AuthContext';
import { CancelModal } from '../shared/CancelModal';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';

// ── Sub-components ──
import { WEEK_DAY_NAMES, STATUS_CONFIG, STATUS_CANCELLED } from './doctor-appointments/appointmentConstants';
import type { EffectiveStatus } from './doctor-appointments/appointmentConstants';
import AppointmentCard from './doctor-appointments/AppointmentCard';
import AppointmentRow from './doctor-appointments/AppointmentRow';
import NotificationsPanel from './doctor-appointments/NotificationsPanel';

// (Global month variables removed in favor of dynamic evaluation)

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState<'today' | 'week' | 'month'>('today');
  const [filterStatus, setFilterStatus] = useState<'all' | EffectiveStatus>('all');
  const [cancelTarget, setCancelTarget] = useState<AppointmentSlot | null>(null);
  const [showCancelled, setShowCancelled] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // ── Force reactivity on date boundaries ──
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  // ── In-session cancellation notifications (real-time via SignalR + local optimistic) ──
  const [notifications, setNotifications] = useState<CancellationNotification[]>(() => {
    try {
      const stored = localStorage.getItem('doctor_notifications');
      let parsed = stored ? JSON.parse(stored) : [];
      // Clean up old notifications (e.g. older than 7 days)
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      parsed = parsed.filter(
        (n: CancellationNotification) =>
          new Date(n.cancelledAt || Date.now()).getTime() > sevenDaysAgo,
      );
      // Limit to 50 items
      return parsed.slice(0, 50);
    } catch (error) {
      console.error('Failed to parse doctor_notifications from localStorage:', error);
      try {
        localStorage.removeItem('doctor_notifications');
      } catch (e) {
        // Ignore storage access errors in some environments
      }
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('doctor_notifications', JSON.stringify(notifications));
  }, [notifications]);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const markNotificationRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const qc = useQueryClient();

  // Real-time push from SignalR: a donor cancelled a confirmed appointment
  const handleRemoteCancellation = useCallback(
    (notification: CancellationNotification) => {
      setNotifications((prev) => {
        // Deduplicate by id in case the push fires more than once
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [{ ...notification, read: false }, ...prev].slice(0, 50);
      });
      // Refresh the slots + stats so the cancelled slot disappears from the list
      qc.invalidateQueries({ queryKey: ['appointment-slots'] });
      qc.invalidateQueries({ queryKey: ['appointment-stats'] });
      toast.info(`إلغاء جديد: ${notification.donorName || 'متبرع'} — ${notification.date}`);
    },
    [qc],
  );

  // Connect to SignalR hub — null centerId joins "Global" broadcast group
  useAppointmentsHub({
    centerId: null,
    onCancelled: handleRemoteCancellation,
    enabled: !!user,
  });

  // ── Determine date range dynamically ──
  const { TODAY, WEEK_DATES, dateRange } = useMemo(() => {
    const formatLocalDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const tStr = formatLocalDate(currentTime);

    // Week
    const startOfWeek = new Date(currentTime);
    const offset = (currentTime.getDay() + 1) % 7;
    startOfWeek.setDate(currentTime.getDate() - offset);
    const wDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return formatLocalDate(d);
    });

    // Month
    const lastDay = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 0).getDate();
    const mStart = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-01`;
    const mEnd = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const range =
      view === 'today'
        ? { date: tStr }
        : view === 'week'
          ? { dateFrom: wDates[0], dateTo: wDates[6] }
          : { dateFrom: mStart, dateTo: mEnd };

    return { TODAY: tStr, WEEK_DATES: wDates, dateRange: range };
  }, [view, currentTime]);

  // ── Slots filter: date range + server-side status filter ──
  // 'all' = no status param → backend returns all non-available slots
  const slotsFilter = {
    ...dateRange,
    ...(filterStatus !== 'all' ? { status: filterStatus } : {}),
  };

  // ── Server state via React Query ──
  // Server already filters by status, so no client-side filtering needed
  const { data: slots = [], isLoading, isError, refetch } = useAppointmentSlots(slotsFilter);

  // ── Derived filtered collection ──
  const visibleAppointments = useMemo(() => {
    if (showCancelled) return slots;
    return slots.filter((s) => s.status !== STATUS_CANCELLED);
  }, [slots, showCancelled]);

  const { data: stats } = useAppointmentStats(dateRange);
  const cancelMutation = useCancelAppointment();
  const noShowMutation = useMarkNoShow();

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isError) return <ErrorState message="تعذر تحميل المواعيد" onRetry={() => refetch()} />;

  // Today's no-show slots (backend sets status = 'missed')
  const noShowSlots = slots.filter((s) => s.date === TODAY && s.status === 'missed');

  const handleRegister = (slot: AppointmentSlot) => navigate(`/doctor/register?apt=${slot.id}`);
  const handleCancel = (slot: AppointmentSlot) => setCancelTarget(slot);

  const handleNoShow = async (slot: AppointmentSlot) => {
    try {
      await noShowMutation.mutateAsync(slot.id);
      toast.warning(`تم تسجيل غياب ${slot.donorName || 'المتبرع'}`);
    } catch {
      toast.error('تعذر تسجيل الغياب');
    }
  };

  const confirmCancel = async (reason: string) => {
    if (!cancelTarget) return;
    const now = new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    await cancelMutation.mutateAsync({ slotId: cancelTarget.id, reason });

    // Build in-session notification
    setNotifications((prev) => [
      {
        id: `NOTIF-${Date.now()}`,
        donorName: cancelTarget.donorName || '—',
        donorPhone: cancelTarget.donorPhone,
        date: cancelTarget.date,
        time: cancelTarget.time,
        campaignId: cancelTarget.campaignId,
        cancelledAt: now,
        cancelledByName: user?.name || 'الطبيب',
        reason: reason || undefined,
        read: false,
      },
      ...prev,
    ]);

    toast.success('تم إلغاء الموعد بنجاح');
    setCancelTarget(null);
  };

  // ── No more client-side status filter — the backend handles it ──
  const applyFilter = (daySlots: AppointmentSlot[]) => daySlots;

  // ── TODAY timeline — dynamic: render only slots the backend returned ──
  const renderToday = () => {
    const todaySlots = visibleAppointments
      .filter((s) => s.date === TODAY)
      .sort((a, b) => a.time.localeCompare(b.time));

    if (todaySlots.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
          <p style={{ fontSize: '14px' }}>لا توجد مواعيد اليوم</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {todaySlots.map((slot) => {
          return (
            <div key={slot.id} className="flex gap-3 items-stretch">
              <div
                className={`flex-shrink-0 w-16 flex flex-col items-center justify-center rounded-xl py-2 ${slot.status === 'completed' ||
                    slot.status === 'missed' ||
                    slot.status === STATUS_CANCELLED
                    ? 'bg-muted'
                    : 'bg-green-50 border border-green-100'
                  }`}
              >
                <span
                  className={`font-mono ${slot.status === 'completed' ||
                      slot.status === 'missed' ||
                      slot.status === STATUS_CANCELLED
                      ? 'text-muted-foreground'
                      : 'text-green-700'
                    }`}
                  style={{ fontSize: '13px', fontWeight: 700 }}
                  dir="ltr"
                >
                  {slot.time}
                </span>
              </div>
              <div className="flex-1">
                <AppointmentCard
                  slot={slot}
                  onRegister={() => handleRegister(slot)}
                  onCancel={() => handleCancel(slot)}
                  onNoShow={() => handleNoShow(slot)}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── WEEK view ──
  const renderWeek = () => (
    <div className="space-y-6">
      {WEEK_DATES.map((date, idx) => {
        const originalDaySlots = slots.filter((s) => s.date === date);
        const hasOnlyCancelled = originalDaySlots.length > 0 && originalDaySlots.every((s) => s.status === STATUS_CANCELLED);
        if (!showCancelled && hasOnlyCancelled) return null;

        const daySlots = visibleAppointments.filter((s) => s.date === date);
        const filtered = applyFilter(daySlots);
        return (
          <div
            key={date}
            className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div
              className={`px-5 py-3 flex items-center justify-between ${date === TODAY ? 'bg-green-600 text-white' : 'bg-muted/40 border-b border-border'}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={date === TODAY ? 'text-white' : 'text-foreground'}
                  style={{ fontSize: '15px', fontWeight: 700 }}
                >
                  {WEEK_DAY_NAMES[idx]} {date === TODAY ? '— اليوم' : ''}
                </span>
                <span
                  className={`font-mono ${date === TODAY ? 'text-green-100' : 'text-muted-foreground'}`}
                  style={{ fontSize: '12px' }}
                >
                  {date}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full ${date === TODAY ? 'bg-card/20 text-white' : 'bg-green-100 text-green-700'}`}
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                {daySlots.length} موعد
              </span>
            </div>
            <div className="p-4 space-y-2">
              {filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-4" style={{ fontSize: '13px' }}>
                  {daySlots.length === 0
                    ? 'لا توجد مواعيد هذا اليوم'
                    : 'لا توجد نتائج مطابقة للفلتر'}
                </p>
              ) : (
                filtered
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((slot) => (
                    <AppointmentRow
                      key={slot.id}
                      slot={slot}
                      onRegister={() => handleRegister(slot)}
                      onCancel={() => handleCancel(slot)}
                      onNoShow={() => handleNoShow(slot)}
                    />
                  ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── MONTH view ──
  const renderMonth = () => {
    const grouped: Record<string, AppointmentSlot[]> = {};
    visibleAppointments.forEach((s) => {
      if (!grouped[s.date]) grouped[s.date] = [];
      grouped[s.date].push(s);
    });
    return (
      <div className="space-y-4">
        {Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, daySlots]) => {
            const filtered = applyFilter(daySlots);
            return (
              <div
                key={date}
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                <div
                  className={`px-5 py-3 flex items-center justify-between ${date === TODAY ? 'bg-green-600 text-white' : 'bg-muted/40 border-b border-border'}`}
                >
                  <span
                    className={date === TODAY ? 'text-white' : 'text-foreground'}
                    style={{ fontSize: '14px', fontWeight: 700 }}
                  >
                    {date} {date === TODAY ? '— اليوم' : ''}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full ${date === TODAY ? 'bg-card/20 text-white' : 'bg-green-100 text-green-700'}`}
                    style={{ fontSize: '12px', fontWeight: 700 }}
                  >
                    {daySlots.length} موعد
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {filtered
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((slot) => (
                      <AppointmentRow
                        key={slot.id}
                        slot={slot}
                        onRegister={() => handleRegister(slot)}
                        onCancel={() => handleCancel(slot)}
                        onNoShow={() => handleNoShow(slot)}
                      />
                    ))}
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            جدول المواعيد
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            {format(new Date(), 'EEEE، d MMMM yyyy — HH:mm', { locale: ar })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className={`relative p-2.5 rounded-xl border transition-all ${showNotifications ? 'bg-red-50 border-red-200 text-red-600' : 'bg-card border-border text-muted-foreground hover:border-border'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                style={{ fontSize: '10px', fontWeight: 800 }}
              >
                {unreadCount}
              </span>
            )}
          </button>
          {/* View toggle */}
          <div className="flex bg-muted p-1 rounded-xl gap-1">
            {(['today', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl transition-all ${view === v ? 'bg-card shadow-sm text-green-700' : 'text-muted-foreground hover:text-foreground'}`}
                style={{ fontSize: '13px', fontWeight: view === v ? 700 : 500 }}
              >
                {v === 'today' ? 'اليوم' : v === 'week' ? 'الأسبوع' : 'الشهر'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications panel */}
      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={markNotificationRead}
          onMarkAllRead={markAllRead}
        />
      )}

      {/* No-show alert */}
      {noShowSlots.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-800" style={{ fontSize: '14px', fontWeight: 700 }}>
              تنبيه: {noShowSlots.length} مواعيد لم يحضر أصحابها اليوم
            </p>
            <p className="text-orange-600" style={{ fontSize: '12px' }}>
              {noShowSlots.map((s) => s.donorName).join(' • ')} — تم إرسال إشعار الإلغاء تلقائياً
            </p>
          </div>
        </div>
      )}

      {/* Stats — use backend stats for today, fallback to counting from loaded slots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            key: 'booked' as EffectiveStatus,
            label: 'محجوز',
            count:
              stats?.booked ??
              slots.filter((s) => s.date === TODAY && s.status === 'booked').length,
            color: 'bg-green-50 border-green-100 text-green-700',
          },
          {
            key: 'completed' as EffectiveStatus,
            label: 'مكتمل',
            count:
              stats?.completed ??
              slots.filter((s) => s.date === TODAY && s.status === 'completed').length,
            color: 'bg-muted/40 border-border text-muted-foreground',
          },
          {
            key: 'missed' as EffectiveStatus,
            label: 'لم يحضر',
            count:
              stats?.missed ??
              slots.filter((s) => s.date === TODAY && s.status === 'missed').length,
            color: 'bg-orange-50 border-orange-100 text-orange-700',
          },
          {
            key: 'cancelled' as EffectiveStatus,
            label: 'ملغى',
            count:
              stats?.cancelled ??
              slots.filter((s) => s.date === TODAY && s.status === STATUS_CANCELLED).length,
            color: 'bg-red-50 border-red-100 text-red-700',
          },
        ].map((s) => (
          <div
            key={s.key}
            onClick={() => setFilterStatus(filterStatus === s.key ? 'all' : s.key)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${s.color} ${filterStatus === s.key ? 'ring-2 ring-offset-1 ring-current shadow-md' : 'hover:shadow-sm'}`}
          >
            <p style={{ fontSize: '24px', fontWeight: 800 }}>{s.count}</p>
            <p style={{ fontSize: '12px', fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar (all views) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="flex items-center gap-1 text-muted-foreground"
            style={{ fontSize: '13px' }}
          >
            <Filter className="w-4 h-4" /> فلتر:
          </span>
          {(['all', 'booked', 'completed', 'missed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${filterStatus === f ? 'bg-green-600 text-white border-green-600' : 'bg-card text-muted-foreground border-border hover:border-green-300'}`}
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              {f === 'all' ? 'الكل' : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none bg-card px-3 py-1.5 rounded-xl border border-border hover:border-green-300 transition-all animate-in fade-in duration-200">
          <input
            type="checkbox"
            checked={showCancelled}
            onChange={(e) => setShowCancelled(e.target.checked)}
            className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500 cursor-pointer"
          />
          <span className="text-muted-foreground" style={{ fontSize: '12px', fontWeight: 600 }}>
            إظهار المواعيد الملغية
          </span>
        </label>
      </div>

      {/* Content */}
      <div>
        {view === 'today' && renderToday()}
        {view === 'week' && renderWeek()}
        {view === 'month' && renderMonth()}
      </div>

      {/* Cancel Modal */}
      {cancelTarget && (
        <CancelModal
          slot={cancelTarget}
          doctorName={user?.name || 'الطبيب'}
          onConfirm={confirmCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
