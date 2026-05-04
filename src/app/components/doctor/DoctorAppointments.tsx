import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  CalendarDays,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Smartphone,
  Phone,
  Hash,
  Droplets,
  UserPlus,
  Filter,
  Megaphone,
  Bell,
  BellOff,
  Ban,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Slot15, CancellationNotification } from "../../types";
import {
  useSlot15Data,
  useCancelAppointment,
} from "../../hooks/useAppointments";
import { useCampaigns } from "../../hooks/useCampaigns";
import { useAuth } from "../../contexts/AuthContext";
import { CancelModal } from "../shared/CancelModal";
import { PageLoader, ErrorState } from "../shared/LoadingSkeleton";

// ── Constants ──────────────────────────────────────────
const TODAY = "2025-05-02";
const MOCK_CURRENT_HOUR = 10;
const MOCK_CURRENT_MIN = 30;

const DONATION_LABELS: Record<string, string> = {
  whole: "دم كامل",
  plasma: "بلازما",
  platelets: "صفائح",
};
const DONATION_COLORS: Record<string, string> = {
  whole: "bg-red-50 text-red-600 border-red-100",
  plasma: "bg-blue-50 text-blue-600 border-blue-100",
  platelets: "bg-purple-50 text-purple-600 border-purple-100",
};

const WEEK_DATES = [
  "2025-04-27",
  "2025-04-28",
  "2025-04-29",
  "2025-04-30",
  "2025-05-01",
  "2025-05-02",
  "2025-05-03",
];
const WEEK_DAY_NAMES = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const ALL_SLOTS: string[] = [];
for (let h = 8; h < 17; h++) {
  for (const m of [0, 15, 30, 45]) {
    ALL_SLOTS.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    );
  }
}

// ── Helpers ─────────────────────────────────────────────
function isSlotPast(date: string, time: string): boolean {
  if (date < TODAY) return true;
  if (date > TODAY) return false;
  const [h, m] = time.split(":").map(Number);
  return (
    h < MOCK_CURRENT_HOUR || (h === MOCK_CURRENT_HOUR && m <= MOCK_CURRENT_MIN)
  );
}

type EffectiveStatus =
  | "booked"
  | "completed"
  | "no_show"
  | "cancelled"
  | "available";

function getEffectiveStatus(slot: Slot15): EffectiveStatus {
  if (slot.status === "completed") return "completed";
  if (slot.status === "missed") return "no_show";
  if (slot.status === "cancelled") return "cancelled";
  if (slot.status === "disabled") return "cancelled";
  if (slot.status === "booked") {
    if (isSlotPast(slot.date, slot.time)) return "cancelled";
    return "booked";
  }
  return "available";
}

const STATUS_CONFIG: Record<
  EffectiveStatus,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
    icon: React.ReactElement;
  }
> = {
  booked: {
    label: "محجوز",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: <Clock className="w-4 h-4 text-green-500" />,
  },
  completed: {
    label: "مكتمل",
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-600",
    icon: <CheckCircle2 className="w-4 h-4 text-gray-400" />,
  },
  no_show: {
    label: "لم يحضر",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  },
  cancelled: {
    label: "ملغى",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: <XCircle className="w-4 h-4 text-red-500" />,
  },
  available: {
    label: "متاح",
    bg: "bg-white",
    border: "border-dashed border-gray-200",
    text: "text-gray-400",
    icon: <></>,
  },
};

// ── Campaign badge ──────────────────────────────────────
function CampaignBadge({ campaignId }: { campaignId?: string }) {
  // Reads from React Query cache — zero extra network requests
  const { data: campaignsData = [] } = useCampaigns();
  if (!campaignId) return null;
  const campaign = campaignsData.find((c) => c.id === campaignId);
  if (!campaign) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-full"
      style={{ fontSize: "10px", fontWeight: 600 }}
    >
      <Megaphone className="w-2.5 h-2.5" /> {campaign.title.slice(0, 18)}...
    </span>
  );
}

// ── Appointment Card ────────────────────────────────────
function AppointmentCard({
  slot,
  onRegister,
  onCancel,
}: {
  slot: Slot15;
  onRegister: () => void;
  onCancel: () => void;
}) {
  const eff = getEffectiveStatus(slot);
  const cfg = STATUS_CONFIG[eff];

  if (eff === "available") {
    return (
      <div
        className={`rounded-xl border ${cfg.border} ${cfg.bg} px-4 py-3 flex items-center justify-between`}
      >
        <span className="text-gray-300" style={{ fontSize: "13px" }}>
          لا يوجد حجز
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400"
          style={{ fontWeight: 600 }}
        >
          متاح
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {cfg.icon}
          <span
            className={`px-2 py-0.5 rounded-full text-white ${
              eff === "booked"
                ? "bg-green-600"
                : eff === "completed"
                  ? "bg-gray-400"
                  : eff === "no_show"
                    ? "bg-orange-500"
                    : "bg-red-500"
            }`}
            style={{ fontSize: "11px", fontWeight: 700 }}
          >
            {cfg.label}
          </span>
          {slot.campaignId && <CampaignBadge campaignId={slot.campaignId} />}
        </div>
        <div
          className="flex items-center gap-1 text-gray-400"
          style={{ fontSize: "11px" }}
        >
          <Smartphone className="w-3 h-3" /> تطبيق
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span
            className="text-gray-900"
            style={{ fontSize: "14px", fontWeight: 700 }}
          >
            {slot.donorName}
          </span>
          {slot.donorAge && (
            <span className="text-gray-400" style={{ fontSize: "12px" }}>
              ({slot.donorAge} سنة)
            </span>
          )}
          {slot.donorGender && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-white ${slot.donorGender === "male" ? "bg-blue-400" : "bg-pink-400"}`}
              style={{ fontSize: "10px" }}
            >
              {slot.donorGender === "male" ? "ذكر" : "أنثى"}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-gray-400" />
            <span
              className="text-gray-600 font-mono"
              style={{ fontSize: "12px" }}
            >
              {slot.donorNationalId?.slice(0, 6)}...
              {slot.donorNationalId?.slice(-4)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span
              className="text-gray-600"
              style={{ fontSize: "12px" }}
              dir="ltr"
            >
              {slot.donorPhone}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          {slot.donorBloodType && (
            <span
              className="px-2 py-0.5 bg-red-50 border border-red-100 text-red-600 rounded-full"
              style={{ fontSize: "11px", fontWeight: 700 }}
            >
              <Droplets className="w-3 h-3 inline ml-0.5" />
              {slot.donorBloodType}
            </span>
          )}
          {slot.donationType && (
            <span
              className={`px-2 py-0.5 border rounded-full ${DONATION_COLORS[slot.donationType]}`}
              style={{ fontSize: "11px", fontWeight: 600 }}
            >
              {DONATION_LABELS[slot.donationType]}
            </span>
          )}
        </div>
      </div>

      {/* Cancellation log */}
      {eff === "cancelled" && slot.cancelledByName && (
        <div className="mt-3 p-3 bg-red-100/60 rounded-xl border border-red-200 space-y-1">
          <div className="flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5 text-red-500" />
            <span
              className="text-red-700"
              style={{ fontSize: "11px", fontWeight: 700 }}
            >
              سجل الإلغاء
            </span>
          </div>
          <p className="text-red-600" style={{ fontSize: "11px" }}>
            بواسطة: <strong>{slot.cancelledByName}</strong>
          </p>
          {slot.cancelledAt && (
            <p className="text-red-500 font-mono" style={{ fontSize: "10px" }}>
              {slot.cancelledAt}
            </p>
          )}
          {slot.cancellationReason && (
            <p className="text-red-600" style={{ fontSize: "11px" }}>
              السبب: {slot.cancellationReason}
            </p>
          )}
          <p
            className="text-green-600"
            style={{ fontSize: "10px", fontWeight: 600 }}
          >
            ✓ الفترة الزمنية متاحة للحجز مجدداً
          </p>
        </div>
      )}

      {eff === "booked" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-400 flex items-center justify-center gap-1.5 transition-all"
            style={{ fontSize: "12px", fontWeight: 700 }}
          >
            <XCircle className="w-4 h-4" /> إلغاء الموعد
          </button>
          <button
            onClick={onRegister}
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center gap-1.5 transition-all"
            style={{ fontSize: "12px", fontWeight: 700 }}
          >
            <UserPlus className="w-4 h-4" /> بدء التسجيل
          </button>
        </div>
      )}
      {eff === "no_show" && (
        <div className="mt-2 px-3 py-2 bg-orange-100 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <span
            className="text-orange-700"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            ⚠️ لم يحضر المتبرع — تم إلغاء الموعد تلقائياً
          </span>
        </div>
      )}
    </div>
  );
}

// ── Mini row for week/month view ────────────────────────
function AppointmentRow({
  slot,
  onRegister,
  onCancel,
}: {
  slot: Slot15;
  onRegister: () => void;
  onCancel: () => void;
}) {
  const eff = getEffectiveStatus(slot);
  const cfg = STATUS_CONFIG[eff];
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${cfg.border} ${cfg.bg} transition-all`}
    >
      {/* Time */}
      <div className="flex-shrink-0 w-16 text-center">
        <span
          className="text-gray-700 font-mono"
          style={{ fontSize: "14px", fontWeight: 700 }}
          dir="ltr"
        >
          {slot.time}
        </span>
      </div>
      {/* Donor */}
      <div className="flex-1 min-w-0">
        <p
          className="text-gray-900 truncate"
          style={{ fontSize: "13px", fontWeight: 600 }}
        >
          {slot.donorName || "—"}
        </p>
        <p className="text-gray-400 font-mono" style={{ fontSize: "11px" }}>
          {slot.donorNationalId?.slice(0, 8)}...
        </p>
      </div>
      {/* Type + Blood */}
      <div className="hidden sm:flex items-center gap-1.5">
        {slot.donorBloodType && (
          <span
            className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100"
            style={{ fontSize: "11px", fontWeight: 700 }}
          >
            {slot.donorBloodType}
          </span>
        )}
        {slot.donationType && (
          <span
            className={`px-2 py-0.5 border rounded-full ${DONATION_COLORS[slot.donationType]}`}
            style={{ fontSize: "11px" }}
          >
            {DONATION_LABELS[slot.donationType]}
          </span>
        )}
      </div>
      {/* Status + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={`px-2.5 py-1 rounded-full ${cfg.text} ${cfg.bg} border ${cfg.border}`}
          style={{ fontSize: "11px", fontWeight: 700 }}
        >
          {cfg.label}
        </span>
        {eff === "booked" && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              title="إلغاء الموعد"
              className="p-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRegister();
              }}
              title="بدء التسجيل"
              className="p-1.5 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Notifications Panel ────────────────────────────────
interface NotificationsPanelProps {
  notifications: CancellationNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

function NotificationsPanel({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: NotificationsPanelProps) {
  const markNotificationRead = onMarkRead;
  const markAllRead = onMarkAllRead;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-600" />
          <span
            className="text-gray-900"
            style={{ fontSize: "14px", fontWeight: 700 }}
          >
            إشعارات الإلغاء
          </span>
          {notifications.filter((n) => !n.read).length > 0 && (
            <span
              className="px-2 py-0.5 bg-red-500 text-white rounded-full"
              style={{ fontSize: "11px", fontWeight: 700 }}
            >
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.read) && (
            <button
              onClick={markAllRead}
              className="text-green-600 hover:text-green-700"
              style={{ fontSize: "12px", fontWeight: 600 }}
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
            <p className="text-gray-400" style={{ fontSize: "13px" }}>
              لا توجد إشعارات
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`flex gap-3 px-5 py-3.5 cursor-pointer transition-all hover:bg-gray-50 ${!n.read ? "bg-red-50/40" : ""}`}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${!n.read ? "bg-red-500" : "bg-gray-200"}`}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-gray-900"
                  style={{ fontSize: "13px", fontWeight: n.read ? 500 : 700 }}
                >
                  تم إلغاء موعد{" "}
                  <span className="text-red-600">{n.donorName}</span>
                </p>
                <p className="text-gray-500" style={{ fontSize: "11px" }}>
                  {n.date} — {n.time} · بواسطة: {n.cancelledByName}
                </p>
                {n.reason && (
                  <p className="text-gray-400" style={{ fontSize: "11px" }}>
                    السبب: {n.reason}
                  </p>
                )}
                {n.donorPhone && (
                  <p
                    className="text-blue-600 font-mono mt-0.5"
                    style={{ fontSize: "11px" }}
                  >
                    📱 إشعار أُرسل إلى: {n.donorPhone}
                  </p>
                )}
              </div>
              <span
                className="text-gray-300 flex-shrink-0"
                style={{ fontSize: "10px" }}
              >
                {n.cancelledAt}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────
export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Server state via React Query ──
  const { data: slots = [], isLoading, isError, refetch } = useSlot15Data();
  const cancelMutation = useCancelAppointment();

  // ── In-session cancellation notifications (ephemeral, not persisted) ──
  const [notifications, setNotifications] = useState<
    CancellationNotification[]
  >([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const [view, setView] = useState<"today" | "week" | "month">("today");
  const [filterStatus, setFilterStatus] = useState<"all" | EffectiveStatus>(
    "all",
  );
  const [cancelTarget, setCancelTarget] = useState<Slot15 | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  if (isLoading) return <PageLoader message="جاري تحميل المواعيد..." />;
  if (isError)
    return (
      <ErrorState message="تعذر تحميل المواعيد" onRetry={() => refetch()} />
    );

  // Build slot map
  const slotMap = useMemo(() => {
    const map: Record<string, Record<string, Slot15>> = {};
    slots.forEach((s) => {
      if (!map[s.date]) map[s.date] = {};
      map[s.date][s.time] = s;
    });
    return map;
  }, [slots]);

  // Stats for today
  const todaySlots = slots.filter((s) => s.date === TODAY);
  const stats = {
    booked: todaySlots.filter((s) => getEffectiveStatus(s) === "booked").length,
    completed: todaySlots.filter((s) => getEffectiveStatus(s) === "completed")
      .length,
    no_show: todaySlots.filter((s) => getEffectiveStatus(s) === "no_show")
      .length,
    cancelled: todaySlots.filter((s) => getEffectiveStatus(s) === "cancelled")
      .length,
  };

  const noShowSlots = slots.filter(
    (s) => s.date === TODAY && s.status === "missed",
  );

  const handleRegister = (slot: Slot15) =>
    navigate(`/doctor/register?apt=${slot.id}`);

  const handleCancel = (slot: Slot15) => setCancelTarget(slot);

  const confirmCancel = async (reason: string) => {
    if (!cancelTarget) return;
    const now = new Date().toLocaleString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    try {
      await cancelMutation.mutateAsync({ slotId: cancelTarget.id, reason });
      // Build in-session notification
      setNotifications((prev) => [
        {
          id: `NOTIF-${Date.now()}`,
          donorName: cancelTarget.donorName || "—",
          donorPhone: cancelTarget.donorPhone,
          date: cancelTarget.date,
          time: cancelTarget.time,
          campaignId: cancelTarget.campaignId,
          cancelledAt: now,
          cancelledByName: user?.name || "الطبيب",
          reason: reason || undefined,
          read: false,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setCancelTarget(null);
    }
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
                isPast ? "bg-gray-100" : "bg-green-50 border border-green-100"
              }`}
            >
              <span
                className={`font-mono ${isPast ? "text-gray-400" : "text-green-700"}`}
                style={{ fontSize: "13px", fontWeight: 700 }}
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
                  className={`rounded-xl border border-dashed border-gray-200 px-4 py-3 flex items-center gap-2 ${isPast ? "bg-gray-50" : "bg-white"}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${isPast ? "bg-gray-300" : "bg-green-300"}`}
                  />
                  <span className="text-gray-300" style={{ fontSize: "13px" }}>
                    {isPast
                      ? "لا يوجد حجز — انتهى الوقت"
                      : "متاح — لا يوجد حجز"}
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
          filterStatus === "all"
            ? daySlots
            : daySlots.filter((s) => getEffectiveStatus(s) === filterStatus);
        return (
          <div
            key={date}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div
              className={`px-5 py-3 flex items-center justify-between ${date === TODAY ? "bg-green-600 text-white" : "bg-gray-50 border-b border-gray-100"}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={date === TODAY ? "text-white" : "text-gray-900"}
                  style={{ fontSize: "15px", fontWeight: 700 }}
                >
                  {WEEK_DAY_NAMES[idx]} {date === TODAY ? "— اليوم" : ""}
                </span>
                <span
                  className={`font-mono ${date === TODAY ? "text-green-100" : "text-gray-400"}`}
                  style={{ fontSize: "12px" }}
                >
                  {date}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full ${date === TODAY ? "bg-white/20 text-white" : "bg-green-100 text-green-700"}`}
                style={{ fontSize: "12px", fontWeight: 700 }}
              >
                {daySlots.length} موعد
              </span>
            </div>
            <div className="p-4 space-y-2">
              {filtered.length === 0 ? (
                <p
                  className="text-center text-gray-400 py-4"
                  style={{ fontSize: "13px" }}
                >
                  {daySlots.length === 0
                    ? "لا توجد مواعيد هذا اليوم"
                    : "لا توجد نتائج مطابقة للفلتر"}
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
    const allMonthSlots = slots.filter(
      (s) => s.date >= "2025-04-01" && s.date <= "2025-05-31",
    );
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
              filterStatus === "all"
                ? daySlots
                : daySlots.filter(
                    (s) => getEffectiveStatus(s) === filterStatus,
                  );
            return (
              <div
                key={date}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div
                  className={`px-5 py-3 flex items-center justify-between ${date === TODAY ? "bg-green-600 text-white" : "bg-gray-50 border-b border-gray-100"}`}
                >
                  <span
                    className={date === TODAY ? "text-white" : "text-gray-900"}
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    {date} {date === TODAY ? "— اليوم" : ""}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full ${date === TODAY ? "bg-white/20 text-white" : "bg-green-100 text-green-700"}`}
                    style={{ fontSize: "12px", fontWeight: 700 }}
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
          <h1
            className="text-gray-900"
            style={{ fontSize: "22px", fontWeight: 800 }}
          >
            جدول المواعيد
          </h1>
          <p className="text-gray-500" style={{ fontSize: "14px" }}>
            السبت، 2 مايو 2025 — الوقت الحالي: 10:30 ص
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className={`relative p-2.5 rounded-xl border transition-all ${showNotifications ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                style={{ fontSize: "10px", fontWeight: 800 }}
              >
                {unreadCount}
              </span>
            )}
          </button>
          {/* View toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            {(["today", "week", "month"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl transition-all ${view === v ? "bg-white shadow-sm text-green-700" : "text-gray-500 hover:text-gray-700"}`}
                style={{ fontSize: "13px", fontWeight: view === v ? 700 : 500 }}
              >
                {v === "today" ? "اليوم" : v === "week" ? "الأسبوع" : "الشهر"}
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
            <p
              className="text-orange-800"
              style={{ fontSize: "14px", fontWeight: 700 }}
            >
              تنبيه: {noShowSlots.length} مواعيد لم يحضر أصحابها اليوم
            </p>
            <p className="text-orange-600" style={{ fontSize: "12px" }}>
              {noShowSlots.map((s) => s.donorName).join(" • ")} — تم إرسال إشعار
              الإلغاء تلقائياً
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            key: "booked",
            label: "محجوز",
            count: stats.booked,
            color: "bg-green-50 border-green-100 text-green-700",
          },
          {
            key: "completed",
            label: "مكتمل",
            count: stats.completed,
            color: "bg-gray-50 border-gray-200 text-gray-600",
          },
          {
            key: "no_show",
            label: "لم يحضر",
            count: stats.no_show,
            color: "bg-orange-50 border-orange-100 text-orange-700",
          },
          {
            key: "cancelled",
            label: "ملغى",
            count: stats.cancelled,
            color: "bg-red-50 border-red-100 text-red-700",
          },
        ].map((s) => (
          <div
            key={s.key}
            onClick={() =>
              setFilterStatus(
                filterStatus === (s.key as any) ? "all" : (s.key as any),
              )
            }
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${s.color} ${filterStatus === s.key ? "ring-2 ring-offset-1 ring-current shadow-md" : "hover:shadow-sm"}`}
          >
            <p style={{ fontSize: "24px", fontWeight: 800 }}>{s.count}</p>
            <p style={{ fontSize: "12px", fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar (week/month) */}
      {view !== "today" && (
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="flex items-center gap-1 text-gray-500"
            style={{ fontSize: "13px" }}
          >
            <Filter className="w-4 h-4" /> فلتر:
          </span>
          {(
            ["all", "booked", "completed", "no_show", "cancelled"] as const
          ).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${filterStatus === f ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-300"}`}
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              {f === "all" ? "الكل" : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div>
        {view === "today" && renderToday()}
        {view === "week" && renderWeek()}
        {view === "month" && renderMonth()}
      </div>

      {/* Cancel Modal */}
      {cancelTarget && (
        <CancelModal
          slot={cancelTarget}
          doctorName={user?.name || "الطبيب"}
          onConfirm={confirmCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
