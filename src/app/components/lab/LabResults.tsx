import { useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  FlaskConical,
  Filter,
  CreditCard,
  Check,
} from "lucide-react";
import { useTestResults, useSamples } from "../../hooks/useLabTests";
import { useDonors } from "../../hooks/useDonors";
import { PageLoader, ErrorState } from "../shared/LoadingSkeleton";
import type { TestResult, Sample } from "../../types/lab";
import type { Donor } from "../../types/donor";

/** 4 standard screening tests */
const SCREENING_TESTS = [
  {
    key: "hcv",
    label: "التهاب الكبد الوبائي C",
    abbr: "HCV",
    desc: "Hepatitis C Virus",
  },
  {
    key: "hbv",
    label: "التهاب الكبد الوبائي B",
    abbr: "HBV",
    desc: "Hepatitis B Virus",
  },
  {
    key: "syphilis",
    label: "مرض الزهري",
    abbr: "Syphilis",
    desc: "Treponema Pallidum",
  },
  {
    key: "hiv",
    label: "فيروس نقص المناعة",
    abbr: "HIV",
    desc: "Human Immunodeficiency Virus (AIDS)",
  },
];

// ────────────────────────────────────────────────────────
// Build combined list (pending samples + completed results)
// ────────────────────────────────────────────────────────
function buildCombinedList(
  testResults: TestResult[],
  samplesData: Sample[],
  donorsData: Donor[],
) {
  function getDonorNationalId(donorCode: string): string {
    const donor = donorsData.find((d) => d.donorCode === donorCode);
    return donor?.nationalId || "—";
  }

  const completed = testResults.map((r) => ({
    id: r.id,
    sampleId: r.sampleId,
    sampleCode: r.donorCode,
    donorCode: r.donorCode,
    donorName: r.donorName,
    nationalId: getDonorNationalId(r.donorCode),
    bloodType: r.bloodType,
    confirmedBloodType: r.confirmedBloodType,
    hcv: r.hcv,
    hbv: r.hbv,
    syphilis: r.syphilis,
    hiv: r.hiv,
    result: r.result as "safe" | "unsafe",
    labDoctor: r.labDoctor,
    date: r.date,
    notes: r.notes,
    displayStatus: r.result === "safe" ? "safe" : "unsafe",
  }));

  const completedSampleIds = new Set(completed.map((r) => r.sampleId));
  const pendingEntries = samplesData
    .filter((s) => !completedSampleIds.has(s.id))
    .map((s) => ({
      id: `PENDING-${s.id}`,
      sampleId: s.id,
      sampleCode: s.donorCode,
      donorCode: s.donorCode,
      donorName: s.donorName,
      nationalId: getDonorNationalId(s.donorCode),
      bloodType: s.bloodType,
      confirmedBloodType: null as any,
      hcv: null as any,
      hbv: null as any,
      syphilis: null as any,
      hiv: null as any,
      result: "pending" as any,
      labDoctor: s.labDoctor || "—",
      date: s.collectedDate,
      notes: undefined as string | undefined,
      displayStatus: "pending",
    }));

  return [...pendingEntries, ...completed].sort((a) =>
    a.displayStatus === "pending" ? -1 : 1,
  );
}

type CombinedEntry = ReturnType<typeof buildCombinedList>[0];

// ────────────────────────────────────────────────────────
// Detail Modal
// ────────────────────────────────────────────────────────
function DetailModal({
  entry,
  onClose,
}: {
  entry: CombinedEntry;
  onClose: () => void;
}) {
  const isPending = entry.displayStatus === "pending";
  const isSafe = entry.result === "safe";

  const headerGradient = isPending
    ? "linear-gradient(135deg, #d97706, #f59e0b)"
    : isSafe
      ? "linear-gradient(135deg, #15803d, #22c55e)"
      : "linear-gradient(135deg, #dc2626, #ef4444)";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="p-5 flex items-center justify-between"
          style={{ background: headerGradient }}
        >
          <div>
            <h3
              className="text-white"
              style={{ fontSize: "17px", fontWeight: 700 }}
            >
              تفاصيل نتائج الفحص
            </h3>
            <p className="text-white/80" style={{ fontSize: "12px" }}>
              {entry.donorName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Identifiers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <FlaskConical className="w-3 h-3 text-green-600" />
                <div
                  className="text-green-600"
                  style={{ fontSize: "10px", fontWeight: 600 }}
                >
                  كود العينة
                </div>
              </div>
              <div
                className="font-mono text-green-800"
                style={{ fontSize: "12px", fontWeight: 800 }}
              >
                {entry.sampleCode}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3 h-3 text-gray-400" />
                <div className="text-gray-400" style={{ fontSize: "10px" }}>
                  رقم الهوية
                </div>
              </div>
              <div
                className="font-mono text-gray-900"
                style={{ fontSize: "12px", fontWeight: 700 }}
              >
                {entry.nationalId}
              </div>
            </div>
          </div>

          {/* Overall Result */}
          <div
            className={`flex items-center gap-3 p-4 rounded-2xl border ${
              isPending
                ? "bg-yellow-50 border-yellow-100"
                : isSafe
                  ? "bg-green-50 border-green-100"
                  : "bg-red-50 border-red-100"
            }`}
          >
            {isPending ? (
              <>
                <Clock className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                <div>
                  <div
                    className="text-yellow-700"
                    style={{ fontSize: "16px", fontWeight: 700 }}
                  >
                    ⏳ معلق
                  </div>
                  <div className="text-yellow-600" style={{ fontSize: "13px" }}>
                    لم يتم الفحص بعد
                  </div>
                </div>
              </>
            ) : isSafe ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <div
                    className="text-green-700"
                    style={{ fontSize: "16px", fontWeight: 700 }}
                  >
                    الدم آمن ✓
                  </div>
                  <div className="text-green-600" style={{ fontSize: "13px" }}>
                    جميع الفحوصات سالبة — مقبول
                    {entry.confirmedBloodType && (
                      <>
                        {" "}
                        • فصيلة: <strong>{entry.confirmedBloodType}</strong>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div>
                  <div
                    className="text-red-700"
                    style={{ fontSize: "16px", fontWeight: 700 }}
                  >
                    الدم مرفوض ✗
                  </div>
                  <div className="text-red-600" style={{ fontSize: "13px" }}>
                    نتيجة إيجابية — غير مقبول
                    {entry.confirmedBloodType && (
                      <>
                        {" "}
                        • فصيلة: <strong>{entry.confirmedBloodType}</strong>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Test Details */}
          {!isPending && (
            <div>
              <div
                className="text-gray-700 mb-2.5"
                style={{ fontSize: "13px", fontWeight: 700 }}
              >
                تفصيل الفحوصات الأربعة:
              </div>
              <div className="space-y-2">
                {SCREENING_TESTS.map((test) => {
                  const val = (entry as any)[test.key];
                  const isPositive = val === "positive";
                  return (
                    <div
                      key={test.key}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${isPositive ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isPositive ? "bg-red-100" : "bg-green-50"}`}
                        >
                          <span
                            className={
                              isPositive ? "text-red-700" : "text-green-700"
                            }
                            style={{ fontSize: "8px", fontWeight: 900 }}
                          >
                            {test.abbr}
                          </span>
                        </div>
                        <div>
                          <p
                            className="text-gray-800"
                            style={{ fontSize: "12px", fontWeight: 600 }}
                          >
                            {test.label}
                          </p>
                          <p
                            className="text-gray-400"
                            style={{ fontSize: "10px" }}
                          >
                            {test.desc}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${!isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        style={{ fontSize: "11px", fontWeight: 700 }}
                      >
                        {!isPositive ? (
                          <>
                            <Check className="w-3 h-3" /> سالب
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" /> موجب
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          {entry.notes && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
              <div className="text-yellow-700" style={{ fontSize: "13px" }}>
                <span style={{ fontWeight: 600 }}>ملاحظات: </span>
                {entry.notes}
              </div>
            </div>
          )}

          {/* Footer info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-gray-400" style={{ fontSize: "10px" }}>
                طبيب المختبر
              </div>
              <div
                className="text-gray-800"
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                {entry.labDoctor}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-gray-400" style={{ fontSize: "10px" }}>
                التاريخ
              </div>
              <div
                className="text-gray-800"
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                {entry.date}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            style={{ fontSize: "14px", fontWeight: 600 }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────
export default function LabResults() {
  const {
    data: testResultsData = [],
    isLoading: isLoadingResults,
    isError: isErrorResults,
    refetch: refetchResults,
  } = useTestResults();
  const {
    data: samplesData = [],
    isLoading: isLoadingSamples,
    isError: isErrorSamples,
    refetch: refetchSamples,
  } = useSamples();
  const { data: donorsData = [], isLoading: isLoadingDonors } = useDonors();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewEntry, setViewEntry] = useState<CombinedEntry | null>(null);

  const isLoading = isLoadingResults || isLoadingSamples || isLoadingDonors;
  const isError = isErrorResults || isErrorSamples;

  if (isLoading) return <PageLoader message="جاري تحميل نتائج الفحوصات..." />;
  if (isError)
    return (
      <ErrorState
        message="تعذر تحميل نتائج الفحوصات"
        onRetry={() => {
          refetchResults();
          refetchSamples();
        }}
      />
    );

  const allEntries = buildCombinedList(
    testResultsData,
    samplesData,
    donorsData,
  );

  const filtered = allEntries.filter((r) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      r.sampleCode.toLowerCase().includes(q) ||
      r.donorCode.toLowerCase().includes(q) ||
      r.donorName.includes(search) ||
      r.sampleId.toLowerCase().includes(q) ||
      r.nationalId.includes(search);
    const matchFilter =
      filter === "all" ||
      (filter === "safe" && r.displayStatus === "safe") ||
      (filter === "unsafe" && r.displayStatus === "unsafe") ||
      (filter === "pending" && r.displayStatus === "pending");
    return matchSearch && matchFilter;
  });

  const getRowBg = (entry: CombinedEntry) => {
    if (entry.displayStatus === "pending") return "rgba(251,191,36,0.06)";
    if (entry.displayStatus === "unsafe") return "rgba(248,113,113,0.05)";
    return "";
  };

  const getStatusBadge = (entry: CombinedEntry) => {
    if (entry.displayStatus === "pending")
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{
            background: "rgba(251,191,36,0.12)",
            border: "1px solid rgba(251,191,36,0.3)",
            fontSize: "10px",
            fontWeight: 700,
            color: "#92400e",
          }}
        >
          <Clock className="w-3 h-3" />
          معلق
        </span>
      );
    if (entry.displayStatus === "safe")
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{
            background: "rgba(74,222,128,0.1)",
            border: "1px solid rgba(74,222,128,0.25)",
            fontSize: "10px",
            fontWeight: 700,
            color: "#14532d",
          }}
        >
          <CheckCircle2 className="w-3 h-3" />
          آمن
        </span>
      );
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap"
        style={{
          background: "rgba(248,113,113,0.1)",
          border: "1px solid rgba(248,113,113,0.25)",
          fontSize: "10px",
          fontWeight: 700,
          color: "#7f1d1d",
        }}
      >
        <XCircle className="w-3 h-3" />
        مرفوض
      </span>
    );
  };

  const totals = {
    all: allEntries.length,
    pending: allEntries.filter((r) => r.displayStatus === "pending").length,
    safe: allEntries.filter((r) => r.displayStatus === "safe").length,
    unsafe: allEntries.filter((r) => r.displayStatus === "unsafe").length,
  };

  // Inline test result badge for table
  const testBadge = (val: "negative" | "positive" | null) => {
    if (!val)
      return (
        <span className="text-yellow-400" style={{ fontSize: "14px" }}>
          —
        </span>
      );
    return (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${val === "negative" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
        style={{ fontSize: "11px", fontWeight: 800 }}
      >
        {val === "negative" ? "−" : "+"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {viewEntry && (
        <DetailModal entry={viewEntry} onClose={() => setViewEntry(null)} />
      )}

      {/* Page Header */}
      <div>
        <h1
          className="text-gray-900"
          style={{ fontSize: "22px", fontWeight: 700 }}
        >
          نتائج الفحوصات
        </h1>
        <p className="text-gray-400 mt-1" style={{ fontSize: "13px" }}>
          سجل شامل لجميع العينات — الفحوصات: HCV · HBV · Syphilis · HIV
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "إجمالي العينات",
            value: totals.all,
            icon: "🔬",
            btn: "all",
            bg: "bg-white border-gray-100",
          },
          {
            label: "معلقة",
            value: totals.pending,
            icon: "⏳",
            btn: "pending",
            bg: "",
            style: {
              background: "rgba(251,191,36,0.08)",
              borderColor: "rgba(251,191,36,0.25)",
            },
          },
          {
            label: "آمنة",
            value: totals.safe,
            icon: "✅",
            btn: "safe",
            bg: "",
            style: {
              background: "rgba(74,222,128,0.08)",
              borderColor: "rgba(74,222,128,0.25)",
            },
          },
          {
            label: "مرفوضة",
            value: totals.unsafe,
            icon: "❌",
            btn: "unsafe",
            bg: "",
            style: {
              background: "rgba(248,113,113,0.08)",
              borderColor: "rgba(248,113,113,0.25)",
            },
          },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => setFilter(s.btn)}
            className={`rounded-2xl p-4 border shadow-sm text-center hover:opacity-80 transition-all ${filter === s.btn ? "ring-2 ring-green-400 ring-offset-1" : ""} ${s.bg}`}
            style={"style" in s ? s.style : undefined}
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div
              className="text-gray-900"
              style={{ fontSize: "24px", fontWeight: 700 }}
            >
              {s.value}
            </div>
            <div className="text-gray-500" style={{ fontSize: "11px" }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      {/* Tests Reference Strip */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-4 h-4 text-green-600" />
          <span
            className="text-green-800"
            style={{ fontSize: "13px", fontWeight: 700 }}
          >
            الفحوصات المعيارية — 4 تحاليل
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SCREENING_TESTS.map((t, i) => (
            <div
              key={t.key}
              className="bg-white rounded-xl px-3 py-2.5 border border-green-100 flex items-center gap-2.5"
            >
              <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span
                  className="text-white"
                  style={{ fontSize: "8px", fontWeight: 900 }}
                >
                  {i + 1}
                </span>
              </div>
              <div>
                <p
                  className="text-green-700"
                  style={{ fontSize: "12px", fontWeight: 700 }}
                >
                  {t.abbr}
                </p>
                <p className="text-gray-500" style={{ fontSize: "10px" }}>
                  {t.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex flex-wrap gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{
            background: "rgba(251,191,36,0.08)",
            borderColor: "rgba(251,191,36,0.25)",
          }}
        >
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span
            className="text-yellow-700"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            معلق — لم يُفحص بعد
          </span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{
            background: "rgba(248,113,113,0.08)",
            borderColor: "rgba(248,113,113,0.25)",
          }}
        >
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span
            className="text-red-700"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            مرفوض — نتيجة إيجابية
          </span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{
            background: "rgba(74,222,128,0.08)",
            borderColor: "rgba(74,222,128,0.25)",
          }}
        >
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span
            className="text-green-700"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            آمن — جميع الفحوصات سالبة
          </span>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بكود العينة (= كود المتبرع) أو رقم الهوية أو اسم المتبرع..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 text-gray-900"
            style={{ fontSize: "13px" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 mt-3 flex-wrap items-center">
          <Filter className="w-4 h-4 text-gray-400" />
          {[
            {
              key: "all",
              label: "الكل",
              count: totals.all,
              activeBg: "#374151",
            },
            {
              key: "pending",
              label: "⏳ معلق",
              count: totals.pending,
              activeBg: "#d97706",
            },
            {
              key: "safe",
              label: "✅ آمن",
              count: totals.safe,
              activeBg: "#16a34a",
            },
            {
              key: "unsafe",
              label: "❌ مرفوض",
              count: totals.unsafe,
              activeBg: "#dc2626",
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-3 py-1.5 rounded-xl border-2 transition-all"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                background: filter === tab.key ? tab.activeBg : "white",
                color: filter === tab.key ? "white" : "#374151",
                borderColor: filter === tab.key ? tab.activeBg : "#e5e7eb",
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <span
            className="text-gray-600"
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            النتائج ({filtered.length})
          </span>
          {search && (
            <span className="text-gray-400" style={{ fontSize: "12px" }}>
              نتائج البحث عن: "<span className="text-green-600">{search}</span>"
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th
                  className="text-right px-4 py-3.5 text-gray-500 whitespace-nowrap"
                  style={{ fontSize: "11px", fontWeight: 700 }}
                >
                  <span className="flex items-center gap-1.5">
                    <FlaskConical className="w-3 h-3" />
                    كود العينة
                  </span>
                </th>
                <th
                  className="text-right px-3 py-3.5 text-gray-500 whitespace-nowrap"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                >
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    رقم الهوية
                  </span>
                </th>
                <th
                  className="text-right px-3 py-3.5 text-gray-500"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                >
                  المتبرع
                </th>
                <th
                  className="text-right px-3 py-3.5 text-gray-500"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                >
                  الفصيلة
                </th>
                {/* 4 test columns */}
                {SCREENING_TESTS.map((t) => (
                  <th
                    key={t.key}
                    className="text-center px-3 py-3.5 text-gray-500 whitespace-nowrap"
                    style={{ fontSize: "11px", fontWeight: 700 }}
                  >
                    {t.abbr}
                  </th>
                ))}
                <th
                  className="text-right px-3 py-3.5 text-gray-500"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                >
                  الحالة
                </th>
                <th
                  className="text-right px-3 py-3.5 text-gray-500"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                >
                  التاريخ
                </th>
                <th className="px-3 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  style={{ background: getRowBg(entry) }}
                >
                  {/* كود العينة = كود المتبرع */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <FlaskConical className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span
                        className="font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100"
                        style={{ fontSize: "11px", fontWeight: 700 }}
                      >
                        {entry.sampleCode}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span
                        className="font-mono text-gray-600"
                        style={{ fontSize: "11px" }}
                      >
                        {entry.nationalId}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div>
                      <div
                        className="text-gray-900"
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      >
                        {entry.donorName}
                      </div>
                      <div
                        className="font-mono text-gray-400"
                        style={{ fontSize: "10px" }}
                      >
                        {entry.donorCode}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span
                      className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-mono"
                      style={{ fontSize: "12px", fontWeight: 700 }}
                    >
                      {entry.confirmedBloodType || entry.bloodType}
                    </span>
                  </td>
                  {/* Test result cells */}
                  {SCREENING_TESTS.map((t) => (
                    <td key={t.key} className="px-3 py-3.5 text-center">
                      {testBadge((entry as any)[t.key])}
                    </td>
                  ))}
                  <td className="px-3 py-3.5">{getStatusBadge(entry)}</td>
                  <td
                    className="px-3 py-3.5 text-gray-500 whitespace-nowrap"
                    style={{ fontSize: "11px" }}
                  >
                    {entry.date}
                  </td>
                  <td className="px-3 py-3.5">
                    <button
                      onClick={() => setViewEntry(entry)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-green-50"
                      style={{ background: "rgba(22,163,74,0.07)" }}
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-3.5 h-3.5 text-green-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-400" style={{ fontSize: "14px" }}>
                {search
                  ? `لا توجد نتائج لـ "${search}"`
                  : "لا توجد نتائج في هذه الفئة"}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-2 text-green-600 hover:underline"
                  style={{ fontSize: "12px" }}
                >
                  مسح البحث
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
