import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { AlertTriangle, Filter, Bell } from 'lucide-react';
import type { Slot15, CancellationNotification } from '../../types';
import { useSlot15Data, useCancelAppointment } from '../../hooks/useAppointments';
import { useAuth } from '../../contexts/AuthContext';
import { CancelModal } from '../shared/CancelModal';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';

// ── Sub-components ──
import {
  TODAY,
  ALL_SLOTS,
  WEEK_DATES,
  WEEK_DAY_NAMES,
  STATUS_CONFIG,
  isSlotPast,
  getEffectiveStatus,
} from './doctor-appointments/appointmentConstants';
import type { EffectiveStatus } from './doctor-appointments/appointmentConstants';
import AppointmentCard from './doctor-appointments/AppointmentCard';
import AppointmentRow from './doctor-appointments/AppointmentRow';
import NotificationsPanel from './doctor-appointments/NotificationsPanel';

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Server state via React Query ──
  const { data: slots = [], isLoading, isError, refetch } = useSlot15Data();
  const cancelMutation = useCancelAppointment();

  // ── In-session cancellation notifications (ephemeral, not persisted) ──
  const [notifications, setNotifications] = useState<CancellationNotification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const [view, setView] = useState<'today' | 'week' | 'month'>('today');
  const [filterStatus, setFilterStatus] = useState<'all' | EffectiveStatus>('all');
  const [cancelTarget, setCancelTarget] = useState<Slot15 | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isError) return <ErrorState message="تعذر تحميل المواعيد" onRetry={() => refetch()} />;

  // Build slot map
  const slotMap: Record<string, Record<string, Slot15>> = {};
  slots.forEach((s) => {
    if (!slotMap[s.date]) slotMap[s.date] = {};
    slotMap[s.date][s.time] = s;
  });

  // Stats for today
  const todaySlots = slots.filter((s) => s.date === TODAY);
  const stats = {
    booked: todaySlots.filter((s) => getEffectiveStatus(s) === 'booked').length,
    completed: todaySlots.filter((s) => getEffectiveStatus(s) === 'completed').length,
    no_show: todaySlots.filter((s) => getEffectiveStatus(s) === 'no_show').length,
    cancelled: todaySlots.filter((s) => getEffectiveStatus(s) === 'cancelled').length,
  };

  const noShowSlots = slots.filter((s) => s.date === TODAY && s.status === 'missed');

  const handleRegister = (slot: Slot15) => navigate(`/doctor/register?apt=${slot.id}`);

  const handleCancel = (slot: Slot15) => setCancelTarget(slot);

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

  // ── TODAY timeline ──
  const renderToday = () => (
    <div className="space-y-2">
      {ALL_SLOTS.map((time) => {
        const slot = slotMap[TODAY]?.[time];
        const isPast = isSlotPast(TODAY, time);
        return (
          <div key={time} className="flex gap-3 items-stretch">
            <div
              className={`flex-shrink-0 w-16 flex flex-col items-center justify-center rounded-xl py-2 ${
                isPast ? 'bg-gray-100' : 'bg-green-50 border border-green-100'
              }`}
            >
              <span
                className={`font-mono ${isPast ? 'text-gray-400' : 'text-green-700'}`}
                style={{ fontSize: '13px', fontWeight: 700 }}
                dir="ltr"
              >
                {time}
              </span>
            </div>
            <div className="flex-1">
              {slot ? (
                <AppointmentCard
                  slot={slot}
                  onRegister={() => handleRegister(slot)}
                  onCancel={() => handleCancel(slot)}
                />
              ) : (
                <div
                  className={`rounded-xl border border-dashed border-gray-200 px-4 py-3 flex items-center gap-2 ${isPast ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${isPast ? 'bg-gray-300' : 'bg-green-300'}`}
                  />
                  <span className="text-gray-300" style={{ fontSize: '13px' }}>
                    {isPast ? 'لا يوجد حجز — انتهى الوقت' : 'متاح — لا يوجد حجز'}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── WEEK view ──
  const renderWeek = () => (
    <div className="space-y-6">
      {WEEK_DATES.map((date, idx) => {
        const daySlots = slots.filter((s) => s.date === date);
        const filtered =
          filterStatus === 'all'
            ? daySlots
            : daySlots.filter((s) => getEffectiveStatus(s) === filterStatus);
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
                filtered.map((slot) => (
                  <AppointmentRow
                    key={slot.id}
                    slot={slot}
                    onRegister={() => handleRegister(slot)}
                    onCancel={() => handleCancel(slot)}
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
    const allMonthSlots = slots.filter((s) => s.date >= '2025-04-01' && s.date <= '2025-05-31');
    const grouped: Record<string, Slot15[]> = {};
    allMonthSlots.forEach((s) => {
      if (!grouped[s.date]) grouped[s.date] = [];
      grouped[s.date].push(s);
    });
    return (
      <div className="space-y-4">
        {Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, daySlots]) => {
            const filtered =
              filterStatus === 'all'
                ? daySlots
                : daySlots.filter((s) => getEffectiveStatus(s) === filterStatus);
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
                  {filtered.map((slot) => (
                    <AppointmentRow
                      key={slot.id}
                      slot={slot}
                      onRegister={() => handleRegister(slot)}
                      onCancel={() => handleCancel(slot)}
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
            السبت، 2 مايو 2025 — الوقت الحالي: 10:30 ص
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            key: 'booked',
            label: 'محجوز',
            count: stats.booked,
            color: 'bg-green-50 border-green-100 text-green-700',
          },
          {
            key: 'completed',
            label: 'مكتمل',
            count: stats.completed,
            color: 'bg-gray-50 border-gray-200 text-gray-600',
          },
          {
            key: 'no_show',
            label: 'لم يحضر',
            count: stats.no_show,
            color: 'bg-orange-50 border-orange-100 text-orange-700',
          },
          {
            key: 'cancelled',
            label: 'ملغى',
            count: stats.cancelled,
            color: 'bg-red-50 border-red-100 text-red-700',
          },
        ].map((s) => (
          <div
            key={s.key}
            onClick={() =>
              setFilterStatus(filterStatus === (s.key as EffectiveStatus) ? 'all' : (s.key as EffectiveStatus))
            }
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${s.color} ${filterStatus === s.key ? 'ring-2 ring-offset-1 ring-current shadow-md' : 'hover:shadow-sm'}`}
          >
            <p style={{ fontSize: '24px', fontWeight: 800 }}>{s.count}</p>
            <p style={{ fontSize: '12px', fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar (week/month) */}
      {view !== 'today' && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: '13px' }}>
            <Filter className="w-4 h-4" /> فلتر:
          </span>
          {(['all', 'booked', 'completed', 'no_show', 'cancelled'] as const).map((f) => (
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
      )}

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
