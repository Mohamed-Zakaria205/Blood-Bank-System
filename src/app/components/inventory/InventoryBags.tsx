import { useState, useMemo } from "react";
import {
  Search,
  Package,
  Check,
  X,
  AlertTriangle,
  Upload,
  Trash2,
  ShoppingCart,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import type { BloodBag, BloodType } from "../../types";
import {
  useBloodBags,
  useExportBags,
  useDisposeBag,
} from "../../hooks/useInventory";
import { ErrorState, CardSkeleton, TableSkeleton } from "../shared/LoadingSkeleton";
import { BLOOD_TYPES } from "../../constants";

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

export default function InventoryBags() {
  const { data: bags = [], isLoading, isError } = useBloodBags();
  const exportBagsMutation = useExportBags();
  const disposeBagMutation = useDisposeBag();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<BloodType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<
    "available" | "expired_only" | "all"
  >("all");

  // ── Multi-select ──
  const [selectedBagIds, setSelectedBagIds] = useState<string[]>([]);

  // ── Export modal ──
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportStep, setExportStep] = useState<1 | 2>(1); // 1=form  2=confirm

  // ── Dispose modal ──
  const [disposeModal, setDisposeModal] = useState<BloodBag | null>(null);
  const [disposeReason, setDisposeReason] = useState("");

  const [exportForm, setExportForm] = useState({
    recipientName: "",
    nationalId: "",
    phone: "",
    reason: "",
  });
  const [exportErrors, setExportErrors] = useState<Record<string, string>>({});

  if (isLoading) return (
    <div className="space-y-6 p-2">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <CardSkeleton count={3} />
      <TableSkeleton rows={5} cols={6} />
    </div>
  );
  if (isError)
    return (
      <ErrorState
        message="فشل في تحميل حقائب الدم، يرجى المحاولة لاحقاً"
        onRetry={() => window.location.reload()}
      />
    );

  /* ── derived ──────────────────────────────────────────────── */
  const displayBags = useMemo(() => {
    return bags.filter((b) => {
      if (b.status === "disposed") return false;
      const days = daysUntil(b.expiryDate);
      const isExpired = b.status === "available" && days < 0;
      const isAvail = b.status === "available" && days >= 0;

      if (filterStatus === "available" && !isAvail) return false;
      if (filterStatus === "expired_only" && !isExpired) return false;
      if (filterType !== "all" && b.bloodType !== filterType) return false;

      return (
        b.bagCode.toLowerCase().includes(search.toLowerCase()) ||
        b.bloodType.includes(search) ||
        (b.donorCode ?? "").includes(search)
      );
    });
  }, [bags, search, filterType, filterStatus]);

  const availableCount = bags.filter(
    (b) => b.status === "available" && daysUntil(b.expiryDate) >= 0,
  ).length;
  const expiredCount = bags.filter(
    (b) => b.status === "available" && daysUntil(b.expiryDate) < 0,
  ).length;
  const issuedCount = bags.filter((b) => b.status === "issued").length;

  const selectedBagsData = useMemo(
    () => bags.filter((b) => selectedBagIds.includes(b.id)),
    [bags, selectedBagIds],
  );

  /* ── helpers ──────────────────────────────────────────────── */
  const toggleSelect = (bagId: string) =>
    setSelectedBagIds((prev) =>
      prev.includes(bagId)
        ? prev.filter((id) => id !== bagId)
        : [...prev, bagId],
    );

  const openExportForBag = (bag: BloodBag) => {
    setSelectedBagIds([bag.id]);
    setExportStep(1);
    setExportModalOpen(true);
  };

  const openBulkExport = () => {
    setExportStep(1);
    setExportModalOpen(true);
  };

  const closeExportModal = () => {
    setExportModalOpen(false);
    setExportStep(1);
    setExportErrors({});
  };

  const validateExport = () => {
    const e: Record<string, string> = {};
    if (!exportForm.recipientName.trim()) e.recipientName = "مطلوب";
    if (!exportForm.nationalId.trim()) e.nationalId = "مطلوب";
    if (!exportForm.reason.trim()) e.reason = "مطلوب";
    setExportErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextStep = () => {
    if (validateExport()) setExportStep(2);
  };

  const handleConfirmExport = async () => {
    try {
      await exportBagsMutation.mutateAsync({
        bagIds: selectedBagIds,
        recipient: exportForm,
      });
      closeExportModal();
      setSelectedBagIds([]);
      setExportForm({
        recipientName: "",
        nationalId: "",
        phone: "",
        reason: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispose = async () => {
    if (!disposeModal) return;
    try {
      await disposeBagMutation.mutateAsync({
        bagId: disposeModal.id,
        reason: disposeReason || "إتلاف وفق البروتوكول",
      });
      setDisposeModal(null);
      setDisposeReason("");
    } catch (err) {
      console.error(err);
    }
  };

  const getBagStatus = (bag: BloodBag) => {
    const days = daysUntil(bag.expiryDate);
    if (bag.status === "available" && days < 0)
      return {
        label: "منتهية",
        cls: "bg-red-100 text-red-700",
        isExpired: true,
        isAvailable: false,
      };
    if (bag.status === "available")
      return {
        label: "متاح",
        cls: "bg-green-100 text-green-700",
        isExpired: false,
        isAvailable: true,
      };
    if (bag.status === "issued")
      return {
        label: "مُصدَّر",
        cls: "bg-blue-100 text-blue-700",
        isExpired: false,
        isAvailable: false,
      };
    if (bag.status === "rejected")
      return {
        label: "مرفوض",
        cls: "bg-orange-100 text-orange-700",
        isExpired: false,
        isAvailable: false,
      };
    return {
      label: bag.status,
      cls: "bg-gray-100 text-gray-500",
      isExpired: false,
      isAvailable: false,
    };
  };

  /* ── render ───────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-gray-900"
          style={{ fontSize: "22px", fontWeight: 800 }}
        >
          حقائب الدم
        </h1>
        <p className="text-gray-500" style={{ fontSize: "14px" }}>
          جرد شامل لجميع الحقائب المخزنة
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "متاحة وصالحة",
            value: availableCount,
            color: "text-green-700",
            bg: "bg-green-50 border-green-200",
            filter: "available" as const,
          },
          {
            label: "منتهية الصلاحية",
            value: expiredCount,
            color: "text-red-700",
            bg: "bg-red-50 border-red-200",
            filter: "expired_only" as const,
          },
          {
            label: "مُصدَّرة",
            value: issuedCount,
            color: "text-blue-700",
            bg: "bg-blue-50 border-blue-200",
            filter: "all" as const,
          },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() =>
              setFilterStatus(filterStatus === s.filter ? "all" : s.filter)
            }
            className={`${s.bg} border rounded-2xl p-4 text-right transition-all ${filterStatus === s.filter ? "ring-2 ring-green-400 ring-offset-1" : ""}`}
          >
            <div
              className={s.color}
              style={{ fontSize: "26px", fontWeight: 800 }}
            >
              {s.value}
            </div>
            <div
              className={`${s.color} opacity-80`}
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              {s.label}
            </div>
          </button>
        ))}
      </div>

      {/* ── Bulk-export action bar ── */}
      {selectedBagIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p
                className="text-green-800"
                style={{ fontSize: "14px", fontWeight: 700 }}
              >
                {selectedBagIds.length}{" "}
                {selectedBagIds.length === 1
                  ? "حقيبة محددة"
                  : "حقائب محددة للتصدير"}
              </p>
              <p
                className="text-green-600 font-mono"
                style={{ fontSize: "11px" }}
              >
                {selectedBagsData.map((b) => b.bagCode).join(" · ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedBagIds([])}
              className="px-3 py-1.5 text-green-700 hover:bg-green-100 rounded-lg transition-all"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              إلغاء التحديد
            </button>
            <button
              onClick={openBulkExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm"
              style={{ fontSize: "13px", fontWeight: 700 }}
            >
              <Upload className="w-4 h-4" />
              تصدير ({selectedBagIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بكود الحقيبة أو الفصيلة..."
            className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
            style={{ fontSize: "13px" }}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3" style={{ width: "44px" }} />
                {[
                  "كود الحقيبة",
                  "الفصيلة",
                  "نوع الدم",
                  "تاريخ التسجيل",
                  "تاريخ الانتهاء",
                  "الحالة",
                  "إجراء",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right text-gray-500"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayBags.map((bag) => {
                const { label, cls, isExpired, isAvailable } =
                  getBagStatus(bag);
                const days = daysUntil(bag.expiryDate);
                const isNear = isAvailable && days >= 0 && days <= 5;
                const isSelected = selectedBagIds.includes(bag.id);
                return (
                  <tr
                    key={bag.id}
                    className={`hover:bg-gray-50 transition-colors
                      ${isExpired ? "bg-red-50/30" : ""}
                      ${isSelected ? "bg-green-50/60" : ""}`}
                  >
                    {/* checkbox */}
                    <td className="px-4 py-3">
                      {isAvailable && (
                        <button
                          onClick={() => toggleSelect(bag.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                            ${
                              isSelected
                                ? "bg-green-600 border-green-600"
                                : "border-gray-300 hover:border-green-400"
                            }`}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded"
                          style={{ fontSize: "11px", fontWeight: 700 }}
                        >
                          {bag.bagCode}
                        </span>
                        {(isExpired || isNear) && (
                          <AlertTriangle
                            className={`w-3.5 h-3.5 ${isExpired ? "text-red-500" : "text-orange-400"}`}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                        style={{ fontSize: "12px", fontWeight: 800 }}
                      >
                        {bag.bloodType}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-gray-600"
                      style={{ fontSize: "12px" }}
                    >
                      {donTypeLabels[bag.donationType]}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-600"
                      style={{ fontSize: "12px" }}
                    >
                      {bag.collectedDate}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`${isExpired ? "text-red-600" : isNear ? "text-orange-500" : "text-gray-600"}`}
                        style={{
                          fontSize: "12px",
                          fontWeight: isExpired || isNear ? 700 : 400,
                        }}
                      >
                        {bag.expiryDate}
                        {isExpired && (
                          <span className="mr-1" style={{ fontSize: "10px" }}>
                            (منتهية)
                          </span>
                        )}
                        {isNear && (
                          <span className="mr-1" style={{ fontSize: "10px" }}>
                            ({days}د)
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full ${cls}`}
                        style={{ fontSize: "11px", fontWeight: 700 }}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {isAvailable && (
                          <button
                            onClick={() => openExportForBag(bag)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                            style={{ fontSize: "11px", fontWeight: 700 }}
                          >
                            <Upload className="w-3.5 h-3.5" /> تصدير
                          </button>
                        )}
                        {(isAvailable ||
                          isExpired ||
                          bag.status === "rejected") && (
                          <button
                            onClick={() => setDisposeModal(bag)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                              isExpired || bag.status === "rejected"
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                            }`}
                            style={{ fontSize: "11px", fontWeight: 700 }}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> إتلاف
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {displayBags.length === 0 && (
            <div className="py-14 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400" style={{ fontSize: "14px" }}>
                لا توجد حقائب
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ══ EXPORT MODAL (two-step) ══════════════════════════════ */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3
                    className="text-gray-900"
                    style={{ fontSize: "17px", fontWeight: 700 }}
                  >
                    تصدير{" "}
                    {selectedBagsData.length > 1
                      ? `${selectedBagsData.length} حقائب`
                      : "حقيبة دم"}
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: "12px" }}>
                    {exportStep === 1
                      ? "أدخل بيانات المستلِم"
                      : "مراجعة وتأكيد نهائي"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* step dots */}
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: exportStep >= 1 ? "#16a34a" : "#d1d5db",
                    }}
                  >
                    1
                  </div>
                  <div
                    className={`w-6 h-0.5 ${exportStep >= 2 ? "bg-green-600" : "bg-gray-200"}`}
                  />
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: exportStep >= 2 ? "#16a34a" : "#d1d5db",
                    }}
                  >
                    2
                  </div>
                </div>
                <button
                  onClick={closeExportModal}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Selected bags chips */}
            <div className="px-6 pt-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p
                  className="text-gray-400 mb-2"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                >
                  الحقائب المحددة
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBagsData.map((bag) => (
                    <span
                      key={bag.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-lg"
                    >
                      <span
                        className="font-mono text-green-600"
                        style={{ fontSize: "11px", fontWeight: 700 }}
                      >
                        {bag.bagCode}
                      </span>
                      <span
                        className="px-1 py-0.5 bg-red-50 text-red-600 rounded"
                        style={{ fontSize: "10px", fontWeight: 800 }}
                      >
                        {bag.bloodType}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Step 1: form ── */}
            {exportStep === 1 && (
              <div className="p-6 space-y-4">
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    اسم المريض المستلِم *
                  </label>
                  <input
                    value={exportForm.recipientName}
                    onChange={(e) =>
                      setExportForm((p) => ({
                        ...p,
                        recipientName: e.target.value,
                      }))
                    }
                    placeholder="الاسم بالكامل"
                    className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400
                      ${exportErrors.recipientName ? "border-red-300" : "border-gray-200"}`}
                    style={{ fontSize: "13px" }}
                  />
                  {exportErrors.recipientName && (
                    <p
                      className="text-red-500 mt-1"
                      style={{ fontSize: "11px" }}
                    >
                      {exportErrors.recipientName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-gray-700 mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      الرقم القومي <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={exportForm.nationalId}
                      onChange={(e) =>
                        setExportForm((p) => ({
                          ...p,
                          nationalId: e.target.value,
                        }))
                      }
                      placeholder="14 رقم"
                      className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400
                        ${exportErrors.nationalId ? "border-red-300" : "border-gray-200"}`}
                      style={{ fontSize: "13px" }}
                    />
                    {exportErrors.nationalId && (
                      <p
                        className="text-red-500 mt-1"
                        style={{ fontSize: "11px" }}
                      >
                        {exportErrors.nationalId}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      رقم الهاتف
                    </label>
                    <input
                      value={exportForm.phone}
                      onChange={(e) =>
                        setExportForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="01xxxxxxxxx"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                      style={{ fontSize: "13px" }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    سبب التصدير *
                  </label>
                  <textarea
                    value={exportForm.reason}
                    onChange={(e) =>
                      setExportForm((p) => ({ ...p, reason: e.target.value }))
                    }
                    rows={2}
                    placeholder="مثال: نقل دم بعد عملية جراحية"
                    className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 resize-none
                      ${exportErrors.reason ? "border-red-300" : "border-gray-200"}`}
                    style={{ fontSize: "13px" }}
                  />
                  {exportErrors.reason && (
                    <p
                      className="text-red-500 mt-1"
                      style={{ fontSize: "11px" }}
                    >
                      {exportErrors.reason}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                  <p className="text-green-700" style={{ fontSize: "11px" }}>
                    📋 سيتم تسجيل هذا التصدير تلقائياً باسم:{" "}
                    <strong>{getCurrentUserName()}</strong> مع التاريخ والوقت
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 2: confirmation ── */}
            {exportStep === 2 && (
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p
                      className="text-amber-800"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      مراجعة بيانات التصدير
                    </p>
                    <p
                      className="text-amber-600"
                      style={{ fontSize: "11px", marginTop: "2px" }}
                    >
                      يُرجى التحقق من صحة جميع البيانات قبل التأكيد النهائي. لا
                      يمكن التراجع عن هذه العملية.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
                  {[
                    {
                      icon: "👤",
                      label: "اسم المستلِم",
                      value: exportForm.recipientName,
                    },
                    {
                      icon: "🪪",
                      label: "الرقم القومي",
                      value: exportForm.nationalId,
                    },
                    {
                      icon: "📞",
                      label: "رقم الهاتف",
                      value: exportForm.phone || "—",
                    },
                    {
                      icon: "📋",
                      label: "سبب التصدير",
                      value: exportForm.reason,
                    },
                    {
                      icon: "🩸",
                      label: "عدد الحقائب",
                      value: `${selectedBagsData.length} حقيبة`,
                    },
                    {
                      icon: "👨‍⚕️",
                      label: "المنفذ",
                      value: getCurrentUserName(),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 px-4 py-2.5"
                    >
                      <span style={{ fontSize: "15px", lineHeight: 1.5 }}>
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
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex gap-3 px-6 pb-6">
              {exportStep === 1 ? (
                <>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    التالي <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={closeExportModal}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                    style={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    إلغاء
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConfirmExport}
                    disabled={exportBagsMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    {exportBagsMutation.isPending ? (
                      "جارٍ التصدير..."
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> تأكيد التصدير النهائي
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setExportStep(1)}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                    style={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    رجوع
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ DISPOSE MODAL ═══════════════════════════════════════ */}
      {disposeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3
                  className="text-gray-900"
                  style={{ fontSize: "17px", fontWeight: 700 }}
                >
                  تأكيد الإتلاف
                </h3>
                <p className="text-gray-500" style={{ fontSize: "12px" }}>
                  {disposeModal.bagCode} — فصيلة {disposeModal.bloodType}
                </p>
              </div>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
              <p className="text-red-600" style={{ fontSize: "12px" }}>
                ⚠ هذا الإجراء نهائي ولا يمكن التراجع عنه. سيُسجَّل في سجل
                الصادر.
              </p>
            </div>
            <div className="mb-5">
              <label
                className="block text-gray-700 mb-1.5"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                سبب الإتلاف
              </label>
              <textarea
                value={disposeReason}
                onChange={(e) => setDisposeReason(e.target.value)}
                rows={2}
                placeholder="انتهاء الصلاحية / رفض طبي / تلف..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-red-400 resize-none"
                style={{ fontSize: "13px" }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDispose}
                disabled={disposeBagMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontSize: "14px", fontWeight: 700 }}
              >
                {disposeBagMutation.isPending ? (
                  "جارٍ الإتلاف..."
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> تأكيد الإتلاف
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setDisposeModal(null);
                  setDisposeReason("");
                }}
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

function getCurrentUserName() {
  try {
    const u = JSON.parse(localStorage.getItem("bloodlink_user") || "{}");
    return u.name ?? "أمين المخزن";
  } catch {
    return "أمين المخزن";
  }
}
