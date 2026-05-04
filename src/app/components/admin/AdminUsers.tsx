import { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Heart,
  CheckCircle2,
  XCircle,
  X,
  MapPin,
  Phone,
} from "lucide-react";
import { useDonors } from "../../hooks/useDonors";
import { PageLoader, ErrorState } from "../shared/LoadingSkeleton";

type Donor = any;

const bloodTypeColors: Record<string, string> = {
  "A+": "bg-red-100 text-red-700",
  "A-": "bg-red-50 text-red-600",
  "B+": "bg-orange-100 text-orange-700",
  "B-": "bg-orange-50 text-orange-600",
  "AB+": "bg-purple-100 text-purple-700",
  "AB-": "bg-purple-50 text-purple-600",
  "O+": "bg-blue-100 text-blue-700",
  "O-": "bg-blue-50 text-blue-600",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  eligible: { label: "مؤهل", color: "bg-green-100 text-green-700" },
  ineligible: { label: "غير مؤهل", color: "bg-red-100 text-red-700" },
  deferred: { label: "موجل", color: "bg-orange-100 text-orange-700" },
};

function DonorModal({ donor, onClose }: { donor: Donor; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#C62828] to-[#B71C1C] p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <span
                className="text-white"
                style={{ fontSize: "24px", fontWeight: 700 }}
              >
                {donor.name[0]}
              </span>
            </div>
            <div>
              <h3
                className="text-white"
                style={{ fontSize: "20px", fontWeight: 700 }}
              >
                {donor.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="bg-white/20 text-white px-2.5 py-0.5 rounded-full"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  {donor.bloodType}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full bg-white/20 text-white`}
                  style={{ fontSize: "13px" }}
                >
                  {statusConfig[donor.status].label}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 text-center">
            {[
              { label: "إجمالي التبرعات", value: donor.donations },
              { label: "النقاط المكتسبة", value: donor.points },
              { label: "العمر", value: `${donor.age} سنة` },
            ].map((s, i) => (
              <div
                key={i}
                className={`py-3 ${i < 2 ? "border-l border-gray-100" : ""}`}
              >
                <div
                  className="text-[#1E293B]"
                  style={{ fontSize: "22px", fontWeight: 700 }}
                >
                  {s.value}
                </div>
                <div className="text-gray-400" style={{ fontSize: "12px" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Phone className="w-4 h-4 text-gray-400" />
              <span
                className="text-[#374151]"
                style={{ fontSize: "14px" }}
                dir="ltr"
              >
                {donor.phone}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-[#374151]" style={{ fontSize: "14px" }}>
                {donor.city}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Heart className="w-4 h-4 text-gray-400" />
              <span className="text-[#374151]" style={{ fontSize: "14px" }}>
                آخر تبرع: {donor.lastDonation}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C62828] to-[#B71C1C] text-white shadow-md hover:shadow-lg transition-all"
            style={{ fontSize: "14px", fontWeight: 600 }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { data: donors = [], isLoading, isError, refetch } = useDonors();
  const [search, setSearch] = useState("");
  const [bloodFilter, setBloodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDonor, setViewDonor] = useState<Donor | null>(null);

  if (isLoading) return <PageLoader message="جاري تحميل بيانات المتبرعين..." />;
  if (isError)
    return (
      <ErrorState
        message="تعذر تحميل بيانات المتبرعين"
        onRetry={() => refetch()}
      />
    );

  const filtered = donors.filter((d: any) => {
    const matchSearch = d.name.includes(search) || d.city.includes(search);
    const matchBlood = bloodFilter === "all" || d.bloodType === bloodFilter;
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchBlood && matchStatus;
  });

  return (
    <div className="space-y-6">
      {viewDonor && (
        <DonorModal donor={viewDonor} onClose={() => setViewDonor(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-[#1E293B]"
            style={{ fontSize: "22px", fontWeight: 700 }}
          >
            إدارة المتبرعين
          </h1>
          <p className="text-gray-400 mt-1" style={{ fontSize: "13px" }}>
            قاعدة بيانات المتبرعين المسجلين
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-[#C62828] to-[#B71C1C] text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
          style={{ fontSize: "14px", fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          إضافة متبرع
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "إجمالي المتبرعين", value: donors.length, icon: "👥" },
          {
            label: "مؤهلون",
            value: donors.filter((d) => d.status === "eligible").length,
            icon: "✅",
          },
          {
            label: "موجلون",
            value: donors.filter((d) => d.status === "deferred").length,
            icon: "⏳",
          },
          {
            label: "إجمالي التبرعات",
            value: donors.reduce((a, d) => a + (d.donations || 0), 0),
            icon: "🩸",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center"
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div
              className="text-[#1E293B]"
              style={{ fontSize: "24px", fontWeight: 700 }}
            >
              {s.value}
            </div>
            <div className="text-gray-500" style={{ fontSize: "12px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو المدينة..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pr-10 pl-4 focus:outline-none"
            style={{ fontSize: "13px" }}
          />
        </div>
        <select
          value={bloodFilter}
          onChange={(e) => setBloodFilter(e.target.value)}
          className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 focus:outline-none"
          style={{ fontSize: "13px" }}
        >
          <option value="all">جميع الفصائل</option>
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
            <option key={bt} value={bt}>
              {bt}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 focus:outline-none"
          style={{ fontSize: "13px" }}
        >
          <option value="all">جميع الحالات</option>
          <option value="eligible">مؤهل</option>
          <option value="deferred">موجل</option>
          <option value="ineligible">غير مؤهل</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "المتبرع",
                  "فصيلة الدم",
                  "العمر",
                  "المدينة",
                  "التبرعات",
                  "آخر تبرع",
                  "النقاط",
                  "الحالة",
                  "إجراءات",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-right px-5 py-4 text-gray-500"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((donor) => (
                <tr
                  key={donor.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#FFEBEE] to-[#FFCDD2] rounded-xl flex items-center justify-center flex-shrink-0">
                        <span
                          className="text-[#C62828]"
                          style={{ fontSize: "14px", fontWeight: 700 }}
                        >
                          {donor.name[0]}
                        </span>
                      </div>
                      <span
                        className="text-[#1E293B]"
                        style={{ fontSize: "14px", fontWeight: 600 }}
                      >
                        {donor.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg ${bloodTypeColors[donor.bloodType]}`}
                      style={{ fontSize: "12px", fontWeight: 700 }}
                    >
                      {donor.bloodType}
                    </span>
                  </td>
                  <td
                    className="px-5 py-4 text-gray-500"
                    style={{ fontSize: "13px" }}
                  >
                    {donor.age} سنة
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span style={{ fontSize: "13px" }}>{donor.city}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-[#C62828]" />
                      <span
                        className="text-[#1E293B]"
                        style={{ fontSize: "14px", fontWeight: 600 }}
                      >
                        {(donor as any).donations || 1}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-5 py-4 text-gray-500"
                    style={{ fontSize: "13px" }}
                  >
                    {donor.lastDonationDate || "غير محدد"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-[#F57C00]">⭐</span>
                      <span
                        className="text-[#1E293B]"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        {(donor as any).points || 50}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg ${statusConfig[donor.status].color}`}
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      {statusConfig[donor.status].label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewDonor(donor)}
                        className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                        title="عرض"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <span className="text-gray-500" style={{ fontSize: "13px" }}>
            عرض {filtered.length} من {donors.length} متبرع
          </span>
          <div className="flex gap-2">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-8 h-8 rounded-lg text-sm ${p === 1 ? "bg-[#C62828] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
