import { useState, useCallback, useEffect } from 'react';
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
import {
  TODAY,
  WEEK_DATES,
  WEEK_DAY_NAMES,
  STATUS_CONFIG,
} from './doctor-appointments/appointmentConstants';
import type { EffectiveStatus } from './doctor-appointments/appointmentConstants';
import AppointmentCard from './doctor-appointments/AppointmentCard';
import AppointmentRow from './doctor-appointments/AppointmentRow';
import NotificationsPanel from './doctor-appointments/NotificationsPanel';

// Compute month range for the month view
const _d = new Date();
const _lastDay = new Date(_d.getFullYear(), _d.getMonth() + 1, 0).getDate();
const MONTH_START = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-01`;
const MONTH_END = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_lastDay).padStart(2, '0')}`;

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState<'today' | 'week' | 'month'>('today');
  const [filterStatus, setFilterStatus] = useState<'all' | EffectiveStatus>('all');
  const [cancelTarget, setCancelTarget] = useState<AppointmentSlot | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // ── In-session cancellation notifications (real-time via SignalR + local optimistic) ──
  const [notifications, setNotifications] = useState<CancellationNotification[]>(() => {
    try {
      const stored = localStorage.getItem('doctor_notifications');
      return stored ? JSON.parse(stored) : [];
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
  const handleRemoteCancellation = useCallback((notification: CancellationNotification) => {
    setNotifications((prev) => {
      // Deduplicate by id in case the push fires more than once
      if (prev.some((n) => n.id === notification.id)) return prev;
      return [{ ...notification, read: false }, ...prev];
    });
    // Refresh the slots + stats so the cancelled slot disappears from the list
    qc.invalidateQueries({ queryKey: ['appointment-slots'] });
    qc.invalidateQueries({ queryKey: ['appointment-stats'] });
    toast.info(`إلغاء جديد: ${notification.donorName || 'متبرع'} — ${notification.date}`);
  }, [qc]);

  // Connect to SignalR hub — null centerId joins "Global" broadcast group
  useAppointmentsHub({
    centerId: null,
    onCancelled: handleRemoteCancellation,
    enabled: !!user,
  });

  // ── Determine date range based on view (shared by stats & slots) ──
  const dateRange =
    view === 'today'
      ? { date: TODAY }
      : view === 'week'
        ? { dateFrom: WEEK_DATES[0], dateTo: WEEK_DATES[6] }
        : { dateFrom: MONTH_START, dateTo: MONTH_END };

  // ── Slots filter: date range + server-side status filter ──
  // 'all' = no status param → backend returns all non-available slots
  const slotsFilter = {
    ...dateRange,
    ...(filterStatus !== 'all' ? { status: filterStatus } : {}),
  };

  // ── Server state via React Query ──
  // Server already filters by status, so no client-side filtering needed
  const { data: slots = [], isLoading, isError, refetch } = useAppointmentSlots(slotsFilter);
  
  const { data: stats } = useAppointmentStats(dateRange);
  const cancelMutation = useCancelAppointment();
  const noShowMutation = useMarkNoShow();

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
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
    const todaySlots = slots
      .filter((s) => s.date === TODAY)
      .sort((a, b) => a.time.localeCompare(b.time));

    if (todaySlots.length === 0) {
      return (
        <div className="py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
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
                className={`flex-shrink-0 w-16 flex flex-col items-center justify-center rounded-xl py-2 ${
                  slot.status === 'completed' || slot.status === 'missed' || slot.status === 'cancelled'
                    ? 'bg-gray-100'
                    : 'bg-green-50 border border-green-100'
                }`}
              >
                <span
                  className={`font-mono ${
                    slot.status === 'completed' || slot.status === 'missed' || slot.status === 'cancelled'
                      ? 'text-gray-400'
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
        const daySlots = slots.filter((s) => s.date === date);
        const filtered = applyFilter(daySlots);
        return (
          <div
            key={date}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div
              className={`px-5 py-3 flex items-center justify-between ${date === TODAY ? 'bg-green-600 text-white' : 'bg-gray-50 border-b border-gray-100'}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={date === TODAY ? 'text-white' : 'text-gray-900'}
                  style={{ fontSize: '15px', fontWeight: 700 }}
                >
                  {WEEK_DAY_NAMES[idx]} {date === TODAY ? '— اليوم' : ''}
                </span>
                <span
                  className={`font-mono ${date === TODAY ? 'text-green-100' : 'text-gray-400'}`}
                  style={{ fontSize: '12px' }}
                >
                  {date}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full ${date === TODAY ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                {daySlots.length} موعد
              </span>
            </div>
            <div className="p-4 space-y-2">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-4" style={{ fontSize: '13px' }}>
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
    slots.forEach((s) => {
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
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div
                  className={`px-5 py-3 flex items-center justify-between ${date === TODAY ? 'bg-green-600 text-white' : 'bg-gray-50 border-b border-gray-100'}`}
                >
                  <span
                    className={date === TODAY ? 'text-white' : 'text-gray-900'}
                    style={{ fontSize: '14px', fontWeight: 700 }}
                  >
                    {date} {date === TODAY ? '— اليوم' : ''}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full ${date === TODAY ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}
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
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
            جدول المواعيد
          </h1>
          <p className="text-gray-500" style={{ fontSize: '14px' }}>
            {format(new Date(), 'EEEE، d MMMM yyyy — HH:mm', { locale: ar })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className={`relative p-2.5 rounded-xl border transition-all ${showNotifications ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
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
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            {(['today', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl transition-all ${view === v ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
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
            count: stats?.booked ?? slots.filter((s) => s.date === TODAY && s.status === 'booked').length,
            color: 'bg-green-50 border-green-100 text-green-700',
          },
          {
            key: 'completed' as EffectiveStatus,
            label: 'مكتمل',
            count: stats?.completed ?? slots.filter((s) => s.date === TODAY && s.status === 'completed').length,
            color: 'bg-gray-50 border-gray-200 text-gray-600',
          },
          {
            key: 'missed' as EffectiveStatus,
            label: 'لم يحضر',
            count: stats?.missed ?? slots.filter((s) => s.date === TODAY && s.status === 'missed').length,
            color: 'bg-orange-50 border-orange-100 text-orange-700',
          },
          {
            key: 'cancelled' as EffectiveStatus,
            label: 'ملغى',
            count: stats?.cancelled ?? slots.filter((s) => s.date === TODAY && s.status === 'cancelled').length,
            color: 'bg-red-50 border-red-100 text-red-700',
          },
        ].map((s) => (
          <div
            key={s.key}
            onClick={() =>
              setFilterStatus(filterStatus === s.key ? 'all' : s.key)
            }
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${s.color} ${filterStatus === s.key ? 'ring-2 ring-offset-1 ring-current shadow-md' : 'hover:shadow-sm'}`}
          >
            <p style={{ fontSize: '24px', fontWeight: 800 }}>{s.count}</p>
            <p style={{ fontSize: '12px', fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar (all views) */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: '13px' }}>
          <Filter className="w-4 h-4" /> فلتر:
        </span>
        {(['all', 'booked', 'completed', 'missed', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`px-3 py-1.5 rounded-xl border transition-all ${filterStatus === f ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}
            style={{ fontSize: '12px', fontWeight: 600 }}
          >
            {f === 'all' ? 'الكل' : STATUS_CONFIG[f].label}
          </button>
        ))}
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
