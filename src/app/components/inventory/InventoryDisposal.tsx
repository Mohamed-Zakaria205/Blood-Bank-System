import { useState, useMemo } from "react";
import {
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Package,
  Clock,
  X,
  Check,
  XCircle,
  AlertOctagon,
  ShieldOff,
} from "lucide-react";
import { BloodBag, BLOOD_TYPES, BloodType } from "../../data/mockData";
import {
  useBloodBags,
  useOutflowRecords,
  useDisposeBag,
} from "../../hooks/useInventory";
import { PageLoader, ErrorState } from "../shared/LoadingSkeleton";

/* ── constants ──────────────────────────────────────────── */
const TODAY = new Date("2025-04-29");
function daysUntil(d: string) {
  return Math.ceil(
    (new Date(d).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24),
  );
}

const donTypeLabels: Record<string, string> = {
  whole: "دم كامل",
  plasma: "بلازما",
  platelets: "صفائح",
};

export const DISPOSAL_REASONS = [
  {
    value: "expired",
    label: "انتهاء الصلاحية",
    icon: "⏰",
    suggested: "disposed" as const,
  },
  {
    value: "damaged",
    label: "تلف الحقيبة",
    icon: "💔",
    suggested: "disposed" as const,
  },
  {
    value: "contaminated",
    label: "تلوث العينة",
    icon: "⚗️",
    suggested: "disposed" as const,
  },
  {
    value: "lab_failed",
    label: "فشل في التحاليل المخبرية",
    icon: "🧪",
    suggested: "rejected" as const,
  },
  {
    value: "storage",
    label: "مشكلة في التخزين",
    icon: "❄️",
    suggested: "disposed" as const,
  },
  { value: "other", label: "أخرى", icon: "📋", suggested: "disposed" as const },
];

function getCategoryLabel(cat?: string) {
  return DISPOSAL_REASONS.find((r) => r.value === cat)?.label ?? cat ?? "—";
}

function getCurrentUserName() {
  try {
    const u = JSON.parse(localStorage.getItem("bloodlink_user") || "{}");
    return u.name ?? "أمين المخزن";
  } catch {
    return "أمين المخزن";
  }
}

/* ── sub-component: BagRow ──────────────────────────────── */
function BagStatusChip({ bag }: { bag: BloodBag }) {
  const days = daysUntil(bag.expiryDate);
  if (bag.status === "rejected")
    return (
      <span
        className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 whitespace-nowrap"
        style={{ fontSize: "10px", fontWeight: 700 }}
      >
        مرفوضة مخبرياً
      </span>
    );
  if (days < 0)
    return (
      <span
        className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap"
        style={{ fontSize: "10px", fontWeight: 700 }}
      >
        منتهية الصلاحية
      </span>
    );
  if (days <= 3)
    return (
      <span
        className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 whitespace-nowrap"
        style={{ fontSize: "10px", fontWeight: 700 }}
      >
        تنتهي خلال {days} أيام
      </span>
    );
  if (days <= 5)
    return (
      <span
        className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 whitespace-nowrap"
        style={{ fontSize: "10px", fontWeight: 700 }}
      >
        تنتهي خلال {days} أيام
      </span>
    );
  return (
    <span
      className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 whitespace-nowrap"
      style={{ fontSize: "10px", fontWeight: 700 }}
    >
      متاحة
    </span>
  );
}

/* ── main component ─────────────────────────────────────── */
export default function InventoryDisposal() {
  const {
    data: bags = [],
    isLoading: isLoadingBags,
    isError: isErrorBags,
  } = useBloodBags();
  const {
    data: outflowRecords = [],
    isLoading: isLoadingOutflow,
    isError: isErrorOutflow,
  } = useOutflowRecords();
  const disposeBagMutation = useDisposeBag();

  /* form state */
  const [bagSearch, setBagSearch] = useState("");
  const [selectedBagIds, setSelectedBagIds] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [targetStatus, setTargetStatus] = useState<"disposed" | "rejected">(
    "disposed",
  );
  const [notes, setNotes] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  /* history state */
  const [histSearch, setHistSearch] = useState("");
  const [histCategory, setHistCategory] = useState("all");
  const [histBloodType, setHistBloodType] = useState<BloodType | "all">("all");
  const [histStaff, setHistStaff] = useState("");

  if (isLoadingBags || isLoadingOutflow) return <PageLoader />;
  if (isErrorBags || isErrorOutflow)
    return (
      <ErrorState
        message="فشل في تحميل البيانات، يرجى المحاولة لاحقاً"
        onRetry={() => window.location.reload()}
      />
    );

  /* ── computed ─────────────────────────────────────────── */
  const nearExpiryCount = useMemo(
    () =>
      bags.filter((b) => {
        const d = daysUntil(b.expiryDate);
        return b.status === "available" && d >= 0 && d <= 5;
      }).length,
    [bags],
  );
  const expiredCount = useMemo(
    () =>
      bags.filter(
        (b) => b.status === "available" && daysUntil(b.expiryDate) < 0,
      ).length,
    [bags],
  );
  const rejectedCount = useMemo(
    () => bags.filter((b) => b.status === "rejected").length,
    [bags],
  );
  const disposedCount = useMemo(
    () => bags.filter((b) => b.status === "disposed").length,
    [bags],
  );
  const flaggedCount = nearExpiryCount + expiredCount + rejectedCount;

  const candidateBags = useMemo(() => {
    const eligible = bags.filter(
      (b) =>
        b.status !== "disposed" &&
        b.status !== "issued" &&
        b.status !== "expired",
    );
    const searched = bagSearch.trim()
      ? eligible.filter(
          (b) =>
            b.bagCode.toLowerCase().includes(bagSearch.toLowerCase()) ||
            b.bloodType.toLowerCase().includes(bagSearch.toLowerCase()),
        )
      : eligible.slice(0, 40);

    return searched.sort((a, b) => {
      const priority = (bag: BloodBag) => {
        if (bag.status === "rejected") return 0;
        const d = daysUntil(bag.expiryDate);
        if (d < 0) return 1;
        if (d <= 3) return 2;
        if (d <= 5) return 3;
        return 4;
      };
      const pa = priority(a),
        pb = priority(b);
      if (pa !== pb) return pa - pb;
      return daysUntil(a.expiryDate) - daysUntil(b.expiryDate);
    });
  }, [bags, bagSearch]);

  const selectedBagsData = useMemo(
    () => bags.filter((b) => selectedBagIds.includes(b.id)),
    [bags, selectedBagIds],
  );

  const disposalRecords = useMemo(
    () => outflowRecords.filter((r) => r.actionType === "disposed"),
    [outflowRecords],
  );

  const staffList = useMemo(
    () => [...new Set(disposalRecords.map((r) => r.performedByName))],
    [disposalRecords],
  );

  const filteredHistory = useMemo(
    () =>
      disposalRecords.filter((r) => {
        if (histBloodType !== "all" && r.bloodType !== histBloodType)
          return false;
        if (histCategory !== "all" && r.disposalCategory !== histCategory)
          return false;
        if (histStaff && r.performedByName !== histStaff) return false;
        if (
          histSearch &&
          !r.bagCode.includes(histSearch) &&
          !(r.performedByName ?? "").includes(histSearch) &&
          !r.reason.includes(histSearch)
        )
          return false;
        return true;
      }),
    [disposalRecords, histBloodType, histCategory, histStaff, histSearch],
  );

  /* ── handlers ─────────────────────────────────────────── */
  const toggleSelect = (bagId: string) => {
    setSelectedBagIds((prev) =>
      prev.includes(bagId)
        ? prev.filter((id) => id !== bagId)
        : [...prev, bagId],
    );
    if (formErrors.bags) setFormErrors((p) => ({ ...p, bags: "" }));
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    const r = DISPOSAL_REASONS.find((r) => r.value === val);
    if (r) setTargetStatus(r.suggested);
    if (formErrors.category) setFormErrors((p) => ({ ...p, category: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (selectedBagIds.length === 0) e.bags = "يجب تحديد حقيبة واحدة على الأقل";
    if (!category) e.category = "يجب اختيار سبب الإتلاف";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOpenConfirm = () => {
    if (validate()) setShowConfirm(true);
  };

  const handleConfirmDispose = async () => {
    const label =
      DISPOSAL_REASONS.find((r) => r.value === category)?.label ?? category;
    try {
      await Promise.all(
        selectedBagIds.map((id) =>
          disposeBagMutation.mutateAsync({ bagId: id, reason: label }),
        ),
      );
      setShowConfirm(false);
      setSelectedBagIds([]);
      setCategory("");
      setNotes("");
      setFormErrors({});
    } catch (err) {
      console.error(err);
    }
  };

  const clearHistFilters = () => {
    setHistSearch("");
    setHistBloodType("all");
    setHistCategory("all");
    setHistStaff("");
  };
  const hasHistFilters =
    histSearch ||
    histBloodType !== "all" ||
    histCategory !== "all" ||
    histStaff;

  /* ── render ───────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-gray-900"
          style={{ fontSize: "22px", fontWeight: 800 }}
        >
          إتلاف وإخراج الحقائب
        </h1>
        <p className="text-gray-500" style={{ fontSize: "14px" }}>
          تسجيل إتلاف الحقائب التالفة أو المنتهية أو المرفوضة مع الحفاظ على سجل
          تدقيق كامل
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "قريبة الانتهاء",
            value: nearExpiryCount,
            color: "text-orange-600",
            bg: "bg-orange-50 border-orange-200",
            Icon: Clock,
          },
          {
            label: "منتهية الصلاحية",
            value: expiredCount,
            color: "text-red-600",
            bg: "bg-red-50 border-red-200",
            Icon: AlertTriangle,
          },
          {
            label: "مرفوضة مخبرياً",
            value: rejectedCount,
            color: "text-purple-600",
            bg: "bg-purple-50 border-purple-200",
            Icon: XCircle,
          },
          {
            label: "إجمالي المُتلَف",
            value: disposedCount,
            color: "text-gray-500",
            bg: "bg-gray-50 border-gray-200",
            Icon: CheckCircle,
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} border rounded-2xl p-5 shadow-sm`}
          >
            <div
              className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}
            >
              <s.Icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div
              className={s.color}
              style={{ fontSize: "28px", fontWeight: 800 }}
            >
              {s.value}
            </div>
            <div
              className={`${s.color} opacity-80 mt-0.5`}
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Flagged alert banner */}
      {flaggedCount > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertOctagon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p
              className="text-red-700"
              style={{ fontSize: "13px", fontWeight: 700 }}
            >
              {flaggedCount} حقيبة تحتاج إجراء عاجل
            </p>
            <p
              className="text-red-500"
              style={{ fontSize: "11px", marginTop: "2px" }}
            >
              {expiredCount > 0 && `${expiredCount} منتهية الصلاحية`}
              {expiredCount > 0 && nearExpiryCount > 0 && " · "}
              {nearExpiryCount > 0 && `${nearExpiryCount} قريبة الانتهاء`}
              {(expiredCount > 0 || nearExpiryCount > 0) &&
                rejectedCount > 0 &&
                " · "}
              {rejectedCount > 0 && `${rejectedCount} مرفوضة مخبرياً`}
              {" — حددها من القائمة أدناه لتسجيل الإتلاف"}
            </p>
          </div>
        </div>
      )}

      {/* ══ NEW DISPOSAL FORM ══════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Form header */}
        <div
          className="flex items-center gap-3 px-6 py-4 border-b border-gray-100"
          style={{ background: "linear-gradient(to left, #fff7f7, #fff)" }}
        >
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2
              className="text-gray-900"
              style={{ fontSize: "15px", fontWeight: 700 }}
            >
              تسجيل إتلاف جديد
            </h2>
            <p className="text-gray-500" style={{ fontSize: "11px" }}>
              حدد الحقيبة (أو أكثر) وأدخل تفاصيل الإتلاف
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* ── Bag selection ── */}
          <div>
            <label
              className="block text-gray-700 mb-2"
              style={{ fontSize: "13px", fontWeight: 600 }}
            >
              تحديد الحقيبة / الحقائب <span className="text-red-500">*</span>
            </label>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={bagSearch}
                onChange={(e) => setBagSearch(e.target.value)}
                placeholder="بحث بكود الحقيبة أو فصيلة الدم..."
                className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-red-300"
                style={{ fontSize: "13px" }}
              />
            </div>

            {/* Bag table */}
            <div
              className="border border-gray-100 rounded-xl overflow-hidden"
              style={{ maxHeight: "220px", overflowY: "auto" }}
            >
              {candidateBags.length === 0 ? (
                <div className="py-10 text-center">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400" style={{ fontSize: "13px" }}>
                    لا توجد حقائب مطابقة للبحث
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <tbody className="divide-y divide-gray-50">
                    {candidateBags.map((bag) => {
                      const isSelected = selectedBagIds.includes(bag.id);
                      return (
                        <tr
                          key={bag.id}
                          onClick={() => toggleSelect(bag.id)}
                          className={`cursor-pointer transition-colors hover:bg-gray-50 ${isSelected ? "bg-red-50/70" : ""}`}
                        >
                          <td className="px-3 py-2.5 w-10">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-red-600 border-red-600"
                                  : "border-gray-300 hover:border-red-400"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className="font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded"
                              style={{ fontSize: "11px", fontWeight: 700 }}
                            >
                              {bag.bagCode}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                              style={{ fontSize: "12px", fontWeight: 800 }}
                            >
                              {bag.bloodType}
                            </span>
                          </td>
                          <td
                            className="px-3 py-2.5 text-gray-400"
                            style={{ fontSize: "11px" }}
                          >
                            {donTypeLabels[bag.donationType]}
                          </td>
                          <td className="px-3 py-2.5">
                            <BagStatusChip bag={bag} />
                          </td>
                          <td
                            className="px-3 py-2.5 text-gray-400"
                            style={{ fontSize: "10px" }}
                          >
                            {bag.expiryDate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Selected chips */}
            {selectedBagsData.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {selectedBagsData.map((bag) => (
                  <span
                    key={bag.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <span
                      className="font-mono text-red-700"
                      style={{ fontSize: "11px", fontWeight: 700 }}
                    >
                      {bag.bagCode}
                    </span>
                    <span
                      className="text-red-400"
                      style={{ fontSize: "10px", fontWeight: 700 }}
                    >
                      {bag.bloodType}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(bag.id);
                      }}
                      className="text-red-300 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {formErrors.bags && (
              <p className="text-red-500 mt-1" style={{ fontSize: "11px" }}>
                {formErrors.bags}
              </p>
            )}
          </div>

          {/* ── Category + Status ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label
                className="block text-gray-700 mb-1.5"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                سبب الإتلاف <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-red-300 ${formErrors.category ? "border-red-300" : "border-gray-200"}`}
                style={{ fontSize: "13px" }}
              >
                <option value="">— اختر السبب —</option>
                {DISPOSAL_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.icon} {r.label}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p className="text-red-500 mt-1" style={{ fontSize: "11px" }}>
                  {formErrors.category}
                </p>
              )}
            </div>

            {/* Target Status */}
            <div>
              <label
                className="block text-gray-700 mb-1.5"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                الحالة الجديدة للحقيبة
              </label>
              <div className="flex gap-4 pt-2">
                {(
                  [
                    ["disposed", "🗑️ مُتلَف"],
                    ["rejected", "🚫 مرفوض"],
                  ] as [string, string][]
                ).map(([val, lbl]) => (
                  <label
                    key={val}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <div
                      onClick={() =>
                        setTargetStatus(val as "disposed" | "rejected")
                      }
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                        targetStatus === val
                          ? "border-red-600"
                          : "border-gray-300"
                      }`}
                    >
                      {targetStatus === val && (
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                      )}
                    </div>
                    <span
                      className="text-gray-700"
                      style={{ fontSize: "13px" }}
                    >
                      {lbl}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Notes ── */}
          <div>
            <label
              className="block text-gray-700 mb-1.5"
              style={{ fontSize: "13px", fontWeight: 600 }}
            >
              ملاحظات إضافية <span className="text-gray-400">(اختياري)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="أي تفاصيل إضافية حول سبب الإتلاف أو حالة الحقيبة..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-red-300 resize-none"
              style={{ fontSize: "13px" }}
            />
          </div>

          {/* Staff info */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl">
            <span style={{ fontSize: "14px" }}>📋</span>
            <p className="text-gray-500" style={{ fontSize: "11px" }}>
              سيتم تسجيل هذا الإتلاف تلقائياً باسم{" "}
              <strong className="text-gray-700">{getCurrentUserName()}</strong>{" "}
              مع التاريخ والوقت الحالي
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleOpenConfirm}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
              selectedBagIds.length > 0
                ? "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            style={{ fontSize: "14px", fontWeight: 700 }}
          >
            <Trash2 className="w-4 h-4" />
            {selectedBagIds.length > 0
              ? `تسجيل إتلاف ${selectedBagIds.length === 1 ? "الحقيبة" : `${selectedBagIds.length} حقائب`}`
              : "حدد حقيبة واحدة على الأقل"}
          </button>
        </div>
      </div>

      {/* ══ DISPOSAL HISTORY ════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* History header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2
            className="text-gray-900"
            style={{ fontSize: "16px", fontWeight: 700 }}
          >
            سجل الإتلاف الكامل
          </h2>
          <p className="text-gray-500" style={{ fontSize: "12px" }}>
            {disposalRecords.length} عملية إتلاف مسجلة
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-50 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={histSearch}
                onChange={(e) => setHistSearch(e.target.value)}
                placeholder="بحث بكود الحقيبة أو المنفذ..."
                className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                style={{ fontSize: "13px" }}
              />
            </div>
            <select
              value={histBloodType}
              onChange={(e) => setHistBloodType(e.target.value as any)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-700 outline-none"
              style={{ fontSize: "13px" }}
            >
              <option value="all">كل الفصائل</option>
              {BLOOD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={histCategory}
              onChange={(e) => setHistCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-700 outline-none"
              style={{ fontSize: "13px" }}
            >
              <option value="all">كل الأسباب</option>
              {DISPOSAL_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {staffList.length > 1 && (
              <select
                value={histStaff}
                onChange={(e) => setHistStaff(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-700 outline-none"
                style={{ fontSize: "13px" }}
              >
                <option value="">كل المنفذين</option>
                {staffList.map((s) => (
                  <option key={s} value={s}>
                    {s.split(" ").slice(1, 3).join(" ")}
                  </option>
                ))}
              </select>
            )}
            {hasHistFilters && (
              <button
                onClick={clearHistFilters}
                className="px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 rounded-xl transition-all"
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                × مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "رقم السجل",
                  "كود الحقيبة",
                  "الفصيلة",
                  "النوع",
                  "سبب الإتلاف",
                  "الحالة",
                  "ملاحظات",
                  "المنفذ",
                  "التاريخ",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right text-gray-500 whitespace-nowrap"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredHistory.map((r) => {
                const catLabel = getCategoryLabel(r.disposalCategory);
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-red-50/20 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded"
                        style={{ fontSize: "11px", fontWeight: 700 }}
                      >
                        {r.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
                        style={{ fontSize: "11px" }}
                      >
                        {r.bagCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                        style={{ fontSize: "12px", fontWeight: 800 }}
                      >
                        {r.bloodType}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-gray-500 whitespace-nowrap"
                      style={{ fontSize: "11px" }}
                    >
                      {donTypeLabels[r.donationType] ?? r.donationType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 border border-orange-100 text-orange-700 rounded-full"
                        style={{ fontSize: "11px", fontWeight: 600 }}
                      >
                        {DISPOSAL_REASONS.find(
                          (d) => d.value === r.disposalCategory,
                        )?.icon ?? "📋"}{" "}
                        {catLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600"
                        style={{ fontSize: "11px", fontWeight: 600 }}
                      >
                        مُتلَف
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-gray-400 max-w-xs truncate"
                      style={{ fontSize: "11px" }}
                    >
                      {r.notes || "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-600 whitespace-nowrap"
                      style={{ fontSize: "11px" }}
                    >
                      {r.performedByName.split(" ").slice(1, 3).join(" ")}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-400 whitespace-nowrap"
                      style={{ fontSize: "11px" }}
                    >
                      {r.timestamp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredHistory.length === 0 && (
            <div className="py-14 text-center">
              <ShieldOff className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400" style={{ fontSize: "14px" }}>
                لا توجد سجلات إتلاف
              </p>
              {hasHistFilters && (
                <button
                  onClick={clearHistFilters}
                  className="mt-2 text-green-600 hover:underline"
                  style={{ fontSize: "13px" }}
                >
                  مسح الفلاتر
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══ CONFIRMATION MODAL ══════════════════════════════════ */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center gap-3 px-6 py-5 bg-red-50 border-b border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3
                  className="text-gray-900"
                  style={{ fontSize: "17px", fontWeight: 700 }}
                >
                  تأكيد الإتلاف النهائي
                </h3>
                <p className="text-red-600" style={{ fontSize: "12px" }}>
                  هذا الإجراء لا يمكن التراجع عنه — سيت�� تسجيله في سجل التدقيق
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Bags list */}
              <div>
                <p
                  className="text-gray-500 mb-2"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                >
                  الحقائب المحددة للإتلاف ({selectedBagsData.length})
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedBagsData.map((bag) => (
                    <div
                      key={bag.id}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50/60 border border-red-100 rounded-lg"
                    >
                      <span
                        className="font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded"
                        style={{ fontSize: "11px", fontWeight: 700 }}
                      >
                        {bag.bagCode}
                      </span>
                      <span
                        className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded"
                        style={{ fontSize: "11px", fontWeight: 800 }}
                      >
                        {bag.bloodType}
                      </span>
                      <span
                        className="text-gray-500"
                        style={{ fontSize: "11px" }}
                      >
                        {donTypeLabels[bag.donationType]}
                      </span>
                      <span className="mr-auto">
                        <BagStatusChip bag={bag} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details summary */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
                {[
                  {
                    icon: "🗂️",
                    label: "سبب الإتلاف",
                    value:
                      DISPOSAL_REASONS.find((r) => r.value === category)
                        ?.label ?? "—",
                  },
                  {
                    icon: "🏷️",
                    label: "الحالة الجديدة",
                    value:
                      targetStatus === "disposed" ? "مُتلَف 🗑️" : "مرفوض 🚫",
                  },
                  { icon: "👨‍⚕️", label: "المنفذ", value: getCurrentUserName() },
                  ...(notes
                    ? [{ icon: "📝", label: "الملاحظات", value: notes }]
                    : []),
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 px-4 py-2.5"
                  >
                    <span style={{ fontSize: "14px", lineHeight: 1.6 }}>
                      {item.icon}
                    </span>
                    <span
                      className="text-gray-400 w-28 flex-shrink-0 pt-0.5"
                      style={{ fontSize: "12px" }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="text-gray-800 flex-1"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Final warning */}
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertOctagon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-amber-700" style={{ fontSize: "11px" }}>
                  لن تظهر هذه الحقائب في المخزون المتاح بعد تأكيد الإتلاف. يمكن
                  مراجعتها في سجل الإتلاف.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleConfirmDispose}
                disabled={disposeBagMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontSize: "14px", fontWeight: 700 }}
              >
                {disposeBagMutation.isPending ? (
                  "جارٍ الحفظ..."
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> تأكيد الإتلاف
                  </>
                )}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
