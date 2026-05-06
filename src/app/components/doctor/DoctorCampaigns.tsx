import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  MapPin,
  Calendar,
  Users,
  Plus,
  X,
  TrendingUp,
  Check,
  CalendarDays,
  ChevronDown,
  UserPlus,
  XCircle,
  Clock,
  LayoutGrid,
  Info,
} from "lucide-react";
import { CITIES } from "../../constants";
import { useCampaigns, useCreateCampaign } from "../../hooks/useCampaigns";
import { useAuth } from "../../contexts/AuthContext";
import {
  useSlot15Data,
  useCancelAppointment,
} from "../../hooks/useAppointments";
import { CancelModal } from "../shared/CancelModal";
import type { Campaign } from "../../types/campaign";
import type { Slot15 } from "../../types/appointment";
import { PageLoader, ErrorState } from "../shared/LoadingSkeleton";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-gray-100 text-gray-600",
};
const statusLabels: Record<string, string> = {
  active: "نشطة",
  completed: "منتهية",
};

// ── Slot duration options ──────────────────────────────
const DURATION_OPTIONS = [
  { value: "15", label: "١٥ دقيقة" },
  { value: "30", label: "٣٠ دقيقة" },
  { value: "45", label: "٤٥ دقيقة" },
  { value: "60", label: "ساعة كاملة" },
  { value: "90", label: "ساعة ونصف" },
  { value: "120", label: "ساعتان" },
];

// ── Helper: compute generated slots ───────────────────
interface GeneratedSlot {
  time: string;
  endTime: string;
  capacity: number;
  booked: number;
}

function buildSlots(
  startTime: string,
  endTime: string,
  duration: string,
  capacity: string,
): GeneratedSlot[] {
  if (!startTime || !endTime || !duration) return [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const dur = parseInt(duration) || 30;
  const cap = Math.max(1, parseInt(capacity) || 1);
  if (endMin <= startMin || dur <= 0) return [];
  const result: GeneratedSlot[] = [];
  for (let t = startMin; t + dur <= endMin; t += dur) {
    const fmt = (min: number) =>
      `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
    result.push({
      time: fmt(t),
      endTime: fmt(t + dur),
      capacity: cap,
      booked: 0,
    });
  }
  return result;
}

// ── Slot Preview Card ──────────────────────────────────
function SlotPreviewCard({
  slot,
  index,
}: {
  slot: GeneratedSlot;
  index: number;
}) {
  const fill = slot.capacity === 0 ? 0 : slot.booked / slot.capacity;
  const isFull = slot.booked >= slot.capacity;
  const isNearFull = !isFull && fill >= 0.5;

  const borderColor = isFull
    ? "border-red-200"
    : isNearFull
      ? "border-orange-200"
      : "border-green-200";
  const bgColor = isFull
    ? "bg-red-50"
    : isNearFull
      ? "bg-orange-50"
      : "bg-green-50";
  const timeColor = isFull
    ? "text-red-600"
    : isNearFull
      ? "text-orange-600"
      : "text-green-700";
  const badgeColor = isFull
    ? "bg-red-500"
    : isNearFull
      ? "bg-orange-400"
      : "bg-green-500";
  const label = isFull ? "ممتلئ" : isNearFull ? "يوشك" : "متاح";

  return (
    <div
      className={`rounded-xl border ${borderColor} ${bgColor} p-2.5 flex flex-col items-center gap-1.5 min-w-0`}
    >
      {/* Slot number */}
      <span
        className="text-gray-400"
        style={{ fontSize: "9px", fontWeight: 700 }}
      >
        #{index + 1}
      </span>

      {/* Time */}
      <span
        className={`font-mono ${timeColor}`}
        style={{ fontSize: "12px", fontWeight: 800 }}
        dir="ltr"
      >
        {slot.time}
      </span>
      <span className="text-gray-400" style={{ fontSize: "9px" }} dir="ltr">
        ↓ {slot.endTime}
      </span>

      {/* Dot indicators */}
      <div className="flex gap-1 flex-wrap justify-center mt-0.5">
        {Array.from({ length: slot.capacity }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${i < slot.booked ? "bg-red-400" : "bg-gray-200"}`}
          />
        ))}
      </div>

      {/* Count + badge */}
      <div className="flex flex-col items-center gap-0.5">
        <span
          className="text-gray-500"
          style={{ fontSize: "10px", fontWeight: 600 }}
        >
          {slot.booked}/{slot.capacity}
        </span>
        <span
          className={`px-1.5 py-0.5 rounded-full text-white ${badgeColor}`}
          style={{ fontSize: "9px", fontWeight: 700 }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export default function DoctorCampaigns() {
  const { user } = useAuth();
  const { data: slots = [] } = useSlot15Data();
  const { data: campaignsData = [], isLoading, isError, refetch } = useCampaigns();
  const createCampaignMutation = useCreateCampaign();
  const cancelMutation = useCancelAppointment();
  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Slot15 | null>(null);
  const navigate = useNavigate();

  // Merge hook data with locally-created campaigns (optimistic UI)
  const campaigns = [...campaignsData, ...localCampaigns];

  if (isLoading) return <PageLoader message="جاري تحميل بيانات الحملات..." />;
  if (isError) return <ErrorState message="تعذر تحميل بيانات الحملات" onRetry={() => refetch()} />;

  // ── Form state ───────────────────────────────────────
  const FORM_DEFAULTS = {
    title: "",
    location: "",
    city: "بني سويف",
    date: "",
    targetDonors: "",
    description: "",
    startTime: "08:00",
    endTime: "16:00",
    slotDuration: "30",
    slotCapacity: "2",
  };
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Computed slots (live preview) ────────────────────
  const computedSlots = useMemo(
    () =>
      buildSlots(
        form.startTime,
        form.endTime,
        form.slotDuration,
        form.slotCapacity,
      ),
    [form.startTime, form.endTime, form.slotDuration, form.slotCapacity],
  );
  const totalCapacity =
    computedSlots.length * (parseInt(form.slotCapacity) || 1);

  const filtered = campaigns.filter(
    (c) => !filterStatus || c.status === filterStatus,
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "أدخل عنوان الحملة";
    if (!form.location.trim()) e.location = "أدخل موقع الحملة";
    if (!form.date) e.date = "اختر تاريخ الحملة";
    if (!form.targetDonors || +form.targetDonors < 1)
      e.targetDonors = "أدخل العدد المستهدف";
    if (form.startTime >= form.endTime)
      e.startTime = "وقت البداية يجب أن يكون قبل وقت الانتهاء";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createCampaign = () => {
    if (!validate()) return;
    const newCampaign: Campaign = {
      id: `CAM-${Date.now()}`,
      title: form.title,
      location: form.location,
      city: form.city,
      date: form.date,
      targetDonors: +form.targetDonors,
      registeredDonors: 0,
      status: "active",
      createdBy: user?.id || "USR-002",
      createdByName: user?.name || "طبيب",
      description: form.description,
    };
    // Optimistically add to local state while mutation runs in background
    setLocalCampaigns((prev) => [newCampaign, ...prev]);
    createCampaignMutation.mutate(newCampaign);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setShowModal(false);
      setForm(FORM_DEFAULTS);
      setErrors({});
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-gray-900"
            style={{ fontSize: "22px", fontWeight: 800 }}
          >
            حملات التبرع
          </h1>
          <p className="text-gray-500" style={{ fontSize: "14px" }}>
            {campaigns.length} حملة مسجلة
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all shadow-sm bg-green-600 hover:bg-green-700"
          style={{ fontSize: "14px", fontWeight: 700 }}
        >
          <Plus className="w-5 h-5" /> إنشاء حملة جديدة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "حملات نشطة",
            count: campaigns.filter((c) => c.status === "active").length,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
            val: "active",
          },
          {
            label: "حملات منتهية",
            count: campaigns.filter((c) => c.status === "completed").length,
            color: "text-gray-600",
            bg: "bg-gray-100",
            val: "completed",
          },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => setFilterStatus(filterStatus === s.val ? "" : s.val)}
            className={`${s.bg} rounded-xl p-4 text-center transition-all hover:opacity-80 ${filterStatus === s.val ? "ring-2 ring-offset-1 ring-green-400" : ""}`}
          >
            <div
              className={s.color}
              style={{ fontSize: "24px", fontWeight: 800 }}
            >
              {s.count}
            </div>
            <div className="text-gray-600" style={{ fontSize: "12px" }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((c) => {
          const pct = Math.round((c.registeredDonors / c.targetDonors) * 100);
          const isMyCamera = c.createdBy === user?.id;
          const progressColor =
            c.status === "completed"
              ? "bg-green-500"
              : pct >= 75
                ? "bg-green-500"
                : pct >= 40
                  ? "bg-yellow-400"
                  : "bg-red-400";
          const progressTextColor =
            c.status === "completed"
              ? "text-green-600"
              : pct >= 75
                ? "text-green-600"
                : pct >= 40
                  ? "text-yellow-500"
                  : "text-red-500";
          return (
            <div
              key={c.id}
              className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all ${isMyCamera ? "border-green-100" : "border-gray-100"}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full ${statusColors[c.status]}`}
                      style={{ fontSize: "11px", fontWeight: 700 }}
                    >
                      {statusLabels[c.status]}
                    </span>
                    {isMyCamera && (
                      <span
                        className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full"
                        style={{ fontSize: "10px", fontWeight: 700 }}
                      >
                        حملتي
                      </span>
                    )}
                  </div>
                  <h3
                    className="text-gray-900"
                    style={{ fontSize: "15px", fontWeight: 700 }}
                  >
                    {c.title}
                  </h3>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span style={{ fontSize: "13px" }}>
                    {c.location} — {c.city}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span style={{ fontSize: "13px" }}>{c.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Users className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span style={{ fontSize: "13px" }}>{c.createdByName}</span>
                </div>
              </div>
              {c.description && (
                <p className="text-gray-400 mb-4" style={{ fontSize: "12px" }}>
                  {c.description}
                </p>
              )}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span
                    className="text-gray-600"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    الإنجاز
                  </span>
                  <span
                    className={progressTextColor}
                    style={{ fontSize: "12px", fontWeight: 700 }}
                  >
                    {c.registeredDonors} / {c.targetDonors}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${progressColor}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span
                    className={`${progressTextColor}`}
                    style={{ fontSize: "11px" }}
                  >
                    {pct}% مكتمل
                  </span>
                  {c.status !== "completed" && (
                    <div className="flex items-center gap-1 text-gray-400">
                      <TrendingUp className="w-3 h-3" />
                      <span style={{ fontSize: "11px" }}>
                        يتبقى {c.targetDonors - c.registeredDonors} متبرع
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Campaign Appointments */}
              {(() => {
                const campApts = slots.filter((s) => s.campaignId === c.id);
                if (campApts.length === 0) return null;
                const isExpanded = expandedCampaign === c.id;
                return (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() =>
                        setExpandedCampaign(isExpanded ? null : c.id)
                      }
                      className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all ${isExpanded ? "bg-green-50 border border-green-100" : "hover:bg-gray-50 border border-gray-100"}`}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-green-600" />
                        <span
                          className="text-green-700"
                          style={{ fontSize: "13px", fontWeight: 700 }}
                        >
                          المواعيد من التطبيق
                        </span>
                        <span
                          className="px-2 py-0.5 bg-green-600 text-white rounded-full"
                          style={{ fontSize: "11px", fontWeight: 700 }}
                        >
                          {campApts.length}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-green-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        {campApts.map((apt) => {
                          const isCancelled = apt.status === "cancelled";
                          const isCompleted = apt.status === "completed";
                          const isMissed = apt.status === "missed";
                          const isBooked = apt.status === "booked";
                          return (
                            <div
                              key={apt.id}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${
                                isCancelled
                                  ? "bg-red-50 border-red-100"
                                  : isCompleted
                                    ? "bg-gray-50 border-gray-100"
                                    : "bg-gray-50 border-gray-100 hover:border-green-200 hover:bg-green-50 cursor-pointer"
                              }`}
                              onClick={() =>
                                isBooked &&
                                navigate(`/doctor/register?apt=${apt.id}`)
                              }
                            >
                              <div className="flex-shrink-0 text-center w-14">
                                <span
                                  className={`font-mono ${isCancelled ? "text-red-400 line-through" : "text-green-700"}`}
                                  style={{ fontSize: "13px", fontWeight: 700 }}
                                  dir="ltr"
                                >
                                  {apt.time}
                                </span>
                                <p
                                  className="text-gray-400"
                                  style={{ fontSize: "10px" }}
                                >
                                  {apt.date}
                                </p>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`truncate ${isCancelled ? "text-red-400 line-through" : "text-gray-900"}`}
                                  style={{ fontSize: "13px", fontWeight: 600 }}
                                >
                                  {apt.donorName}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {apt.donorBloodType && (
                                    <span
                                      className={`${isCancelled ? "text-red-300" : "text-red-600"}`}
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {apt.donorBloodType}
                                    </span>
                                  )}
                                  {isCancelled && apt.cancelledByName && (
                                    <span
                                      className="text-red-400"
                                      style={{ fontSize: "10px" }}
                                    >
                                      ألغاه: {apt.cancelledByName}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-white ${
                                    isCompleted
                                      ? "bg-gray-400"
                                      : isMissed
                                        ? "bg-orange-500"
                                        : isCancelled
                                          ? "bg-red-500"
                                          : "bg-green-600"
                                  }`}
                                  style={{ fontSize: "10px", fontWeight: 700 }}
                                >
                                  {isCompleted
                                    ? "مكتمل"
                                    : isMissed
                                      ? "لم يحضر"
                                      : isCancelled
                                        ? "ملغى"
                                        : "محجوز"}
                                </span>
                                {isBooked && (
                                  <>
                                    <UserPlus className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCancelTarget(apt);
                                      }}
                                      className="p-1 rounded-lg border border-red-200 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                                      title="إلغاء الموعد"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p style={{ fontSize: "14px" }}>لا توجد حملات</p>
          </div>
        )}
      </div>

      {/* ── Create Campaign Modal ─────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3
                className="text-gray-900"
                style={{ fontSize: "18px", fontWeight: 700 }}
              >
                إنشاء حملة تبرع جديدة
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-9 h-9 text-green-600" />
                </div>
                <p
                  className="text-gray-900"
                  style={{ fontSize: "18px", fontWeight: 700 }}
                >
                  تم إنشاء الحملة بنجاح!
                </p>
                <p className="text-gray-500 mt-1" style={{ fontSize: "13px" }}>
                  {computedSlots.length > 0
                    ? `تم إنشاء ${computedSlots.length} فترة زمنية بسعة ${totalCapacity} متبرع`
                    : "الحملة جاهزة للاستقبال"}
                </p>
              </div>
            ) : (
              <>
                {/* ══ FORM BODY (selected element) ══════════════════════════════ */}
                <div className="p-6 space-y-5">
                  {/* ── Basic Info ─────────────────────────── */}
                  <div>
                    <label
                      className="block text-gray-700 mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      عنوان الحملة *
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, title: e.target.value }))
                      }
                      placeholder="مثال: حملة التبرع بالدم - مستشفى بني سويف"
                      className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.title ? "border-red-300" : "border-gray-200"}`}
                      style={{ fontSize: "13px" }}
                    />
                    {errors.title && (
                      <p
                        className="text-red-500 mt-1"
                        style={{ fontSize: "11px" }}
                      >
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-gray-700 mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        موقع الحملة *
                      </label>
                      <input
                        value={form.location}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, location: e.target.value }))
                        }
                        placeholder="اسم المستشفى أو المركز"
                        className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.location ? "border-red-300" : "border-gray-200"}`}
                        style={{ fontSize: "13px" }}
                      />
                      {errors.location && (
                        <p
                          className="text-red-500 mt-1"
                          style={{ fontSize: "11px" }}
                        >
                          {errors.location}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        المدينة
                      </label>
                      <select
                        value={form.city}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, city: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                        style={{ fontSize: "13px" }}
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        تاريخ الحملة *
                      </label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, date: e.target.value }))
                        }
                        className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 ${errors.date ? "border-red-300" : "border-gray-200"}`}
                        style={{ fontSize: "13px" }}
                      />
                      {errors.date && (
                        <p
                          className="text-red-500 mt-1"
                          style={{ fontSize: "11px" }}
                        >
                          {errors.date}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        العدد المستهدف *
                      </label>
                      <input
                        type="number"
                        value={form.targetDonors}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            targetDonors: e.target.value,
                          }))
                        }
                        placeholder="مثال: 100"
                        className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 ${errors.targetDonors ? "border-red-300" : "border-gray-200"}`}
                        style={{ fontSize: "13px" }}
                      />
                      {errors.targetDonors && (
                        <p
                          className="text-red-500 mt-1"
                          style={{ fontSize: "11px" }}
                        >
                          {errors.targetDonors}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      وصف الحملة{" "}
                      <span className="text-gray-400">(اختياري)</span>
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, description: e.target.value }))
                      }
                      rows={2}
                      placeholder="تفاصيل إضافية عن الحملة..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 resize-none"
                      style={{ fontSize: "13px" }}
                    />
                  </div>

                  {/* ── Slot Scheduler Section ─────────────── */}
                  <div className="rounded-2xl border border-green-100 overflow-hidden">
                    {/* Section header */}
                    <div className="flex items-center gap-2.5 px-5 py-3.5 bg-green-50 border-b border-green-100">
                      <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                        <Clock className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p
                          className="text-green-800"
                          style={{ fontSize: "13px", fontWeight: 700 }}
                        >
                          جدولة أوقات الحملة
                        </p>
                        <p
                          className="text-green-600"
                          style={{ fontSize: "11px" }}
                        >
                          حدد ساعات العمل ومدة كل فترة زمنية وسعتها
                        </p>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Working hours + slot config */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Start time */}
                        <div>
                          <label
                            className="block text-gray-700 mb-1.5"
                            style={{ fontSize: "13px", fontWeight: 600 }}
                          >
                            وقت البداية
                          </label>
                          <input
                            type="time"
                            value={form.startTime}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                startTime: e.target.value,
                              }))
                            }
                            className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 font-mono ${errors.startTime ? "border-red-300" : "border-gray-200"}`}
                            style={{ fontSize: "13px" }}
                          />
                        </div>
                        {/* End time */}
                        <div>
                          <label
                            className="block text-gray-700 mb-1.5"
                            style={{ fontSize: "13px", fontWeight: 600 }}
                          >
                            وقت الانتهاء
                          </label>
                          <input
                            type="time"
                            value={form.endTime}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                endTime: e.target.value,
                              }))
                            }
                            className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 font-mono ${errors.startTime ? "border-red-300" : "border-gray-200"}`}
                            style={{ fontSize: "13px" }}
                          />
                          {errors.startTime && (
                            <p
                              className="text-red-500 mt-1"
                              style={{ fontSize: "11px" }}
                            >
                              {errors.startTime}
                            </p>
                          )}
                        </div>
                        {/* Slot duration */}
                        <div>
                          <label
                            className="block text-gray-700 mb-1.5"
                            style={{ fontSize: "13px", fontWeight: 600 }}
                          >
                            مدة الفترة الواحدة
                          </label>
                          <select
                            value={form.slotDuration}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                slotDuration: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                            style={{ fontSize: "13px" }}
                          >
                            {DURATION_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* Capacity per slot */}
                        <div>
                          <label
                            className="block text-gray-700 mb-1.5"
                            style={{ fontSize: "13px", fontWeight: 600 }}
                          >
                            سعة كل فترة
                            <span
                              className="text-gray-400 mr-1"
                              style={{ fontWeight: 400 }}
                            >
                              (متبرع)
                            </span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={form.slotCapacity}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                slotCapacity: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                            style={{ fontSize: "13px" }}
                          />
                        </div>
                      </div>

                      {/* ── Live Preview ──────────────────────── */}
                      {computedSlots.length > 0 ? (
                        <div className="space-y-3">
                          {/* Summary chips */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-xl">
                              <LayoutGrid className="w-3.5 h-3.5 text-green-600" />
                              <span
                                className="text-green-800"
                                style={{ fontSize: "12px", fontWeight: 700 }}
                              >
                                {computedSlots.length} فترة زمنية
                              </span>
                            </div>
                            <span
                              className="text-gray-400"
                              style={{ fontSize: "12px" }}
                            >
                              ×
                            </span>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-xl">
                              <Users className="w-3.5 h-3.5 text-blue-500" />
                              <span
                                className="text-blue-700"
                                style={{ fontSize: "12px", fontWeight: 700 }}
                              >
                                {form.slotCapacity} متبرع / فترة
                              </span>
                            </div>
                            <span
                              className="text-gray-400"
                              style={{ fontSize: "12px" }}
                            >
                              =
                            </span>
                            <div
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                              style={{
                                background:
                                  "linear-gradient(135deg,#dcfce7,#d1fae5)",
                                border: "1px solid #86efac",
                              }}
                            >
                              <Check className="w-3.5 h-3.5 text-green-600" />
                              <span
                                className="text-green-800"
                                style={{ fontSize: "12px", fontWeight: 800 }}
                              >
                                {totalCapacity} متبرع إجمالاً
                              </span>
                            </div>

                            {/* Time range pill */}
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-xl mr-auto">
                              <Clock className="w-3.5 h-3.5 text-gray-500" />
                              <span
                                className="text-gray-600 font-mono"
                                style={{ fontSize: "11px", fontWeight: 600 }}
                                dir="ltr"
                              >
                                {form.startTime} – {form.endTime}
                              </span>
                            </div>
                          </div>

                          {/* Legend */}
                          <div className="flex items-center gap-4">
                            <span
                              className="text-gray-500"
                              style={{ fontSize: "11px" }}
                            >
                              مؤشرات الحالة:
                            </span>
                            {[
                              { color: "bg-green-500", label: "متاح" },
                              {
                                color: "bg-orange-400",
                                label: "يو��ك الامتلاء",
                              },
                              { color: "bg-red-500", label: "ممتلئ" },
                            ].map((l) => (
                              <div
                                key={l.label}
                                className="flex items-center gap-1.5"
                              >
                                <div
                                  className={`w-2.5 h-2.5 rounded-full ${l.color}`}
                                />
                                <span
                                  className="text-gray-500"
                                  style={{ fontSize: "11px" }}
                                >
                                  {l.label}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Slot grid */}
                          <div
                            className="rounded-xl border border-gray-100 bg-gray-50 p-3 overflow-y-auto"
                            style={{ maxHeight: "200px" }}
                          >
                            <div
                              className="grid gap-2"
                              style={{
                                gridTemplateColumns:
                                  "repeat(auto-fill, minmax(80px, 1fr))",
                              }}
                            >
                              {computedSlots.map((slot, idx) => (
                                <SlotPreviewCard
                                  key={slot.time}
                                  slot={slot}
                                  index={idx}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Info note */}
                          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p
                              className="text-blue-700"
                              style={{ fontSize: "11px", lineHeight: "1.6" }}
                            >
                              عند امتلاء فترة زمنية بالكامل، تُغلق تلقائياً أمام
                              الحجوزات الجديدة. يمكن للمتبرعين الحجز في الفترات
                              المتاحة عبر التطبيق .
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Empty state */
                        <div className="py-8 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50">
                          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p
                            className="text-gray-400"
                            style={{ fontSize: "13px" }}
                          >
                            حدد وقت البداية والانتهاء لمعاينة الفترات الزمنية
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* ══ END OF SELECTED ELEMENT ══════════════════════════════════ */}
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
                    style={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={createCampaign}
                    className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl transition-all bg-green-600 hover:bg-green-700"
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    <Plus className="w-4 h-4" /> إنشاء الحملة
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {cancelTarget && (
        <CancelModal
          slot={cancelTarget}
          doctorName={user?.name || "الطبيب"}
          onConfirm={async (reason: string) => {
            try {
              await cancelMutation.mutateAsync({
                slotId: cancelTarget.id,
                reason,
              });
            } catch (err) {
              console.error(err);
            } finally {
              setCancelTarget(null);
            }
          }}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
