import { useState } from "react";
import { useNavigate } from "react-router";
import {
  UserPlus,
  Search,
  Eye,
  ChevronDown,
  X,
  Building2,
  Smartphone,
  Megaphone,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { BLOOD_TYPES, CITIES } from "../../constants";
import { useDonors } from "../../hooks/useDonors";
import { ErrorState, CardSkeleton, TableSkeleton } from "../shared/LoadingSkeleton";
import { EmptyState } from "../shared/EmptyState";

import type { Donor } from "../../types";
type BloodType = string;

const statusColors: Record<string, string> = {
  eligible: "bg-green-100 text-green-700",
  ineligible: "bg-red-100 text-red-700",
  deferred: "bg-orange-100 text-orange-700",
};
const statusLabels: Record<string, string> = {
  eligible: "مؤهل",
  ineligible: "غير مؤهل",
  deferred: "موجل",
};
const donationTypeLabels: Record<string, string> = {
  whole: "دم كامل",
  plasma: "بلازما",
  platelets: "صفائح",
};
const genderLabels: Record<string, string> = { male: "ذكر", female: "أنثى" };

export default function DoctorDonors() {
  const navigate = useNavigate();
  const { data: donors = [], isLoading, isError, refetch } = useDonors();
  const [search, setSearch] = useState("");
  const [filterBlood, setFilterBlood] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [viewing, setViewing] = useState<Donor | null>(null);

  if (isLoading) return (
    <div className="space-y-6 p-2">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <CardSkeleton count={3} />
      <TableSkeleton rows={7} cols={10} />
    </div>
  );
  if (isError)
    return (
      <ErrorState
        message="تعذر تحميل بيانات المتبرعين"
        onRetry={() => refetch()}
      />
    );

  const filtered = donors.filter((d) => {
    const matchSearch =
      d.name.includes(search) ||
      d.donorCode.includes(search) ||
      d.phone.includes(search);
    const matchBlood = !filterBlood || d.bloodType === filterBlood;
    const matchStatus = !filterStatus || d.status === filterStatus;
    const matchCity = !filterCity || d.city === filterCity;
    return matchSearch && matchBlood && matchStatus && matchCity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-gray-900"
            style={{ fontSize: "22px", fontWeight: 800 }}
          >
            المتبرعون
          </h1>
          <p className="text-gray-500" style={{ fontSize: "14px" }}>
            {donors.length} متبرع مسجل
          </p>
        </div>
        <button
          onClick={() => navigate("/doctor/register")}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all shadow-sm"
          style={{
            background: "linear-gradient(135deg, #15803d, #16a34a)",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          <UserPlus className="w-5 h-5" /> تسجيل متبرع جديد
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بلاسم أو الرمز..."
              className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
              style={{ fontSize: "13px" }}
            />
          </div>
          <div className="relative">
            <select
              value={filterBlood}
              onChange={(e) => setFilterBlood(e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: "13px" }}
            >
              <option value="">كل الفصائل</option>
              {BLOOD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: "13px" }}
            >
              <option value="">كل الحالات</option>
              <option value="eligible">مؤهل</option>
              <option value="ineligible">غير مؤهل</option>
              <option value="deferred">موجل لفترة</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: "13px" }}
            >
              <option value="">كل المدن</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "مؤهلون",
            count: donors.filter((d) => d.status === "eligible").length,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "موجلون",
            count: donors.filter((d) => d.status === "deferred").length,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            label: "غير مؤهلين",
            count: donors.filter((d) => d.status === "ineligible").length,
            color: "text-red-600",
            bg: "bg-red-50",
          },
        ].map((s, i) => null)}
      </div>

      {/* Donors Cards (mobile) + Table (desktop) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <span className="text-gray-500" style={{ fontSize: "13px" }}>
            {filtered.length} نتيجة
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "رمز المتبرع",
                  "الاسم",
                  "الجنس",
                  "الهاتف",
                  "المدينة",
                  "الفصيلة",
                  "نوع التبرع",
                  "المصدر",
                  "الحالة",
                  "عرض",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right text-gray-500 whitespace-nowrap"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {d.status === "eligible" ? (
                      <span
                        className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded"
                        style={{ fontSize: "11px", fontWeight: 700 }}
                      >
                        {d.donorCode}
                      </span>
                    ) : (
                      <span
                        className="text-gray-300 bg-gray-50 px-2 py-0.5 rounded border border-dashed border-gray-200"
                        style={{ fontSize: "11px" }}
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="text-gray-900"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      {d.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="text-gray-500"
                      style={{ fontSize: "13px" }}
                    >
                      {genderLabels[d.gender]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="text-gray-700 font-mono"
                      style={{ fontSize: "12px" }}
                      dir="ltr"
                    >
                      {d.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="text-gray-500"
                      style={{ fontSize: "13px" }}
                    >
                      {d.city}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="px-2 py-0.5 bg-red-50 text-red-600 rounded"
                      style={{ fontSize: "12px", fontWeight: 700 }}
                    >
                      {d.bloodType}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="text-gray-500"
                      style={{ fontSize: "12px" }}
                    >
                      {donationTypeLabels[d.donationType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {d.source === "app" ? (
                      <span
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full w-fit"
                        style={{ fontSize: "11px", fontWeight: 700 }}
                      >
                        <Smartphone className="w-3 h-3" /> من التطبيق
                      </span>
                    ) : d.source === "campaign" ? (
                      <span
                        className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full w-fit"
                        style={{ fontSize: "11px", fontWeight: 700 }}
                      >
                        <Megaphone className="w-3 h-3" /> من حملة
                      </span>
                    ) : (
                      <span
                        className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full w-fit"
                        style={{ fontSize: "11px", fontWeight: 700 }}
                      >
                        <Building2 className="w-3 h-3" /> داخل البنك
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full w-fit ${statusColors[d.status]}`}
                        style={{ fontSize: "11px", fontWeight: 600 }}
                      >
                        {d.status === "eligible" && (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {d.status === "ineligible" && (
                          <XCircle className="w-3 h-3" />
                        )}
                        {d.status === "deferred" && (
                          <Clock className="w-3 h-3" />
                        )}
                        {statusLabels[d.status]}
                      </span>
                      {d.status === "deferred" && d.deferredUntil && (
                        <span
                          className="text-orange-500 flex items-center gap-0.5"
                          style={{ fontSize: "10px" }}
                        >
                          <Clock className="w-3 h-3" /> حتى {d.deferredUntil}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => setViewing(d)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <EmptyState colSpan={10} message="لا توجد نتائج" />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewing && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewing(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h3
                  className="text-gray-900"
                  style={{ fontSize: "18px", fontWeight: 700 }}
                >
                  تفاصيل المتبرع
                </h3>
                <p
                  className="text-green-600 font-mono"
                  style={{ fontSize: "12px" }}
                >
                  {viewing.donorCode}
                </p>
              </div>
              <button
                onClick={() => setViewing(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Personal Info */}
              <div>
                <h4
                  className="text-gray-700 mb-3"
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  البيانات الشخصية
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["الاسم الكامل", viewing.name],
                    ["الجنس", genderLabels[viewing.gender]],
                    ["العمر", `${viewing.age} سنة`],
                    ["الرقم القومي", viewing.nationalId],
                    ["الهاتف", viewing.phone],
                    ["المدينة", viewing.city],
                    ["العنوان", viewing.address],
                    ["فصيلة الدم", viewing.bloodType],
                  ].map(([label, val]) => (
                    <div key={label} className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-gray-400" style={{ fontSize: "11px" }}>
                        {label}
                      </p>
                      <p
                        className="text-gray-900 mt-0.5"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        {val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Sample code — only for eligible donors */}
              {viewing.status === "eligible" && (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
                  <span className="text-gray-500" style={{ fontSize: "12px" }}>
                    رمز العينة
                  </span>
                  <span
                    className="font-mono text-green-700 bg-green-100 px-3 py-1 rounded-lg"
                    style={{ fontSize: "13px", fontWeight: 700 }}
                  >
                    {viewing.donorCode}
                  </span>
                </div>
              )}
              {viewing.status !== "eligible" && (
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                  <span className="text-gray-500" style={{ fontSize: "12px" }}>
                    رمز العينة
                  </span>
                  <span
                    className="text-gray-400 flex items-center gap-1.5"
                    style={{ fontSize: "12px" }}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                    غير مفعّل (
                    {viewing.status === "deferred" ? "موجل" : "غير مؤهل"})
                  </span>
                </div>
              )}
              {/* Donation Details */}
              <div>
                <h4
                  className="text-gray-700 mb-3"
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  بيانات التبرع
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-400" style={{ fontSize: "11px" }}>
                      نوع التبرع
                    </p>
                    <p
                      className="text-gray-900 mt-0.5"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      {donationTypeLabels[viewing.donationType]}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-400" style={{ fontSize: "11px" }}>
                      آخر تبرع
                    </p>
                    <p
                      className="text-gray-900 mt-0.5"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      {viewing.lastDonationDate || "—"}
                    </p>
                  </div>
                  {/* Source */}
                  <div
                    className={`p-3 rounded-xl ${viewing.source === "campaign" ? "bg-purple-50" : viewing.source === "app" ? "bg-blue-50" : "bg-green-50"}`}
                  >
                    <p className="text-gray-400" style={{ fontSize: "11px" }}>
                      مصدر التبرع
                    </p>
                    <p
                      className={`mt-0.5 flex items-center gap-1 ${viewing.source === "campaign" ? "text-purple-700" : viewing.source === "app" ? "text-blue-700" : "text-green-700"}`}
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      {viewing.source === "app" ? (
                        <>
                          <Smartphone className="w-3.5 h-3.5" /> من التطبيق
                        </>
                      ) : viewing.source === "campaign" ? (
                        <>
                          <Megaphone className="w-3.5 h-3.5" /> من حملة
                        </>
                      ) : (
                        <>
                          <Building2 className="w-3.5 h-3.5" /> داخل البنك
                        </>
                      )}
                    </p>
                  </div>
                  {/* Campaign name if applicable */}
                  {viewing.source === "campaign" && viewing.campaignName && (
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <p className="text-gray-400" style={{ fontSize: "11px" }}>
                        اسم الحملة
                      </p>
                      <p
                        className="text-purple-700 mt-0.5"
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      >
                        {viewing.campaignName}
                      </p>
                    </div>
                  )}
                  {/* Deferred until */}
                  {viewing.status === "deferred" && viewing.deferredUntil && (
                    <div className="p-3 bg-orange-50 rounded-xl col-span-2">
                      <p className="text-gray-400" style={{ fontSize: "11px" }}>
                        موجل حتى
                      </p>
                      <p
                        className="text-orange-700 mt-0.5 flex items-center gap-1"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        <Clock className="w-3.5 h-3.5" />{" "}
                        {viewing.deferredUntil}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* Additional Data */}
              {viewing.additionalData && (
                <div>
                  <h4
                    className="text-gray-700 mb-3"
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    البيانات الطبية التكميلية
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      [
                        "الوزن",
                        viewing.additionalData.weight
                          ? `${viewing.additionalData.weight} كجم`
                          : "—",
                      ],
                      [
                        "الطول",
                        viewing.additionalData.height
                          ? `${viewing.additionalData.height} سم`
                          : "—",
                      ],
                      [
                        "الهيموجلوبين",
                        viewing.additionalData.hemoglobin
                          ? `${viewing.additionalData.hemoglobin} g/dL`
                          : "—",
                      ],
                      ["ضغط الدم", viewing.additionalData.bloodPressure || "—"],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        className="p-3 bg-blue-50 rounded-xl text-center"
                      >
                        <p
                          className="text-blue-400"
                          style={{ fontSize: "11px" }}
                        >
                          {label}
                        </p>
                        <p
                          className="text-blue-900 mt-0.5"
                          style={{ fontSize: "14px", fontWeight: 700 }}
                        >
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Status */}
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-gray-200">
                <span
                  className="text-gray-600"
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  حالة التأهل
                </span>
                <span
                  className={`px-3 py-1.5 rounded-full ${statusColors[viewing.status]}`}
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  {statusLabels[viewing.status]}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
