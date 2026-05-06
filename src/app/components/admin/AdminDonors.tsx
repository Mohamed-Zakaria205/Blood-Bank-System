import { useState } from "react";
import {
  Search,
  Filter,
  Edit2,
  X,
  Save,
  ChevronDown,
  Building2,
  Smartphone,
} from "lucide-react";
import { BLOOD_TYPES, CITIES } from "../../constants";
import { useDonors } from "../../hooks/useDonors";
import { PageLoader, ErrorState } from "../shared/LoadingSkeleton";

type Donor = any;

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

export default function AdminDonors() {
  const { data: donorsData = [], isLoading, isError, refetch } = useDonors();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState("");
  const [filterBlood, setFilterBlood] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [editForm, setEditForm] = useState<Partial<Donor>>({});
  const [saved, setSaved] = useState(false);

  // Sync local state with hook data on first load
  if (!initialized && donorsData.length > 0) {
    setDonors(donorsData);
    setInitialized(true);
  }

  if (isLoading) return <PageLoader message="جاري تحميل بيانات المتبرعين..." />;
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

  const openEdit = (d: Donor) => {
    setEditingDonor(d);
    setEditForm({ ...d });
    setSaved(false);
  };

  const saveEdit = () => {
    if (!editingDonor) return;
    setDonors((prev) =>
      prev.map((d) =>
        d.id === editingDonor.id ? ({ ...d, ...editForm } as Donor) : d,
      ),
    );
    setSaved(true);
    setTimeout(() => {
      setEditingDonor(null);
      setSaved(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-gray-900"
            style={{ fontSize: "22px", fontWeight: 800 }}
          >
            المتبرعون
          </h1>
          <p className="text-gray-500" style={{ fontSize: "14px" }}>
            {donors.length} متبرع مسجل في النظام
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <span
            className="text-amber-700"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            ⚠ صلاحية التعديل فقط
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو الرمز أو الهاتف..."
              className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
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
              <option value="deferred">موجل</option>
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

      {/* Stats row */}
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
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4 text-center`}>
            <div
              className={s.color}
              style={{ fontSize: "24px", fontWeight: 800 }}
            >
              {s.count}
            </div>
            <div className="text-gray-600" style={{ fontSize: "12px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600" style={{ fontSize: "13px" }}>
              {filtered.length} نتيجة
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "رمز المتبرع",
                  "الاسم",
                  "المدينة",
                  "الفصيلة",
                  "نوع التبرع",
                  "المصدر",
                  "الحالة",
                  "إجراء",
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
                    <span
                      className={`px-2 py-0.5 rounded-full ${statusColors[d.status]}`}
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    >
                      {statusLabels[d.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => openEdit(d)}
                      className="text-green-600 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50 transition-all flex items-center gap-1"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      <Edit2 className="w-3.5 h-3.5" /> تعديل
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="py-16 text-center text-gray-400"
                    style={{ fontSize: "14px" }}
                  >
                    لا توجد نتائج مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingDonor && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingDonor(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h3
                  className="text-gray-900"
                  style={{ fontSize: "18px", fontWeight: 700 }}
                >
                  تعديل بيانات المتبرع
                </h3>
                <p
                  className="text-green-600 font-mono"
                  style={{ fontSize: "12px" }}
                >
                  {editingDonor.donorCode}
                </p>
              </div>
              <button
                onClick={() => setEditingDonor(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    الاسم الكامل
                  </label>
                  <input
                    value={editForm.name || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                    style={{ fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    رقم الهاتف
                  </label>
                  <input
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                    style={{ fontSize: "13px" }}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    فصيلة الدم
                  </label>
                  <select
                    value={editForm.bloodType || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        bloodType: e.target.value as any,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                    style={{ fontSize: "13px" }}
                  >
                    {BLOOD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    المدينة
                  </label>
                  <select
                    value={editForm.city || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, city: e.target.value }))
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
                    الحالة
                  </label>
                  <select
                    value={editForm.status || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        status: e.target.value as any,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400"
                    style={{ fontSize: "13px" }}
                  >
                    <option value="eligible">مؤهل</option>
                    <option value="ineligible">غير مؤهل</option>
                    <option value="deferred">موجل</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    العنوان
                  </label>
                  <input
                    value={editForm.address || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, address: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                    style={{ fontSize: "13px" }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setEditingDonor(null)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                إلغاء
              </button>
              <button
                onClick={saveEdit}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white transition-all ${saved ? "bg-green-500" : "bg-green-600 hover:bg-green-700"}`}
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                <Save className="w-4 h-4" />
                {saved ? "تم الحفظ ✓" : "حفظ التعديلات"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
