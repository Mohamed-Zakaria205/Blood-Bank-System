import { useState } from "react";
import {
  FlaskConical,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Check,
  AlertCircle,
  Droplets,
  AlertTriangle,
  Activity,
  ChevronRight,
} from "lucide-react";
import { LabTest, BLOOD_TYPES } from "../../data/mockData";
import { useLabTests, useSubmitLabResult } from "../../hooks/useLabTests";
import { PageLoader, ErrorState } from "../shared/LoadingSkeleton";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";

const donationTypeLabels: Record<string, string> = {
  whole: "دم كامل",
  plasma: "بلازما",
  platelets: "صفائح",
};

type TestKey = "hcv" | "hbv" | "syphilis" | "hiv";

interface ScreeningForm {
  confirmedBloodType: string;
  hcv: "negative" | "positive";
  hbv: "negative" | "positive";
  syphilis: "negative" | "positive";
  hiv: "negative" | "positive";
  notes: string;
}

const screeningTests: {
  key: TestKey;
  label: string;
  abbr: string;
  desc: string;
}[] = [
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
    label: "فيروس نقص المناعة البشري",
    abbr: "HIV",
    desc: "Human Immunodeficiency Virus (AIDS)",
  },
];

const defaultScreeningForm = (bloodType: string): ScreeningForm => ({
  confirmedBloodType: bloodType,
  hcv: "negative",
  hbv: "negative",
  syphilis: "negative",
  hiv: "negative",
  notes: "",
});

export default function LabDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: tests = [], isLoading, isError } = useLabTests();
  const submitLabResult = useSubmitLabResult();

  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    "pending",
  );
  const [entryModal, setEntryModal] = useState<LabTest | null>(null);
  const [viewModal, setViewModal] = useState<LabTest | null>(null);
  const [form, setForm] = useState<ScreeningForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const pending = tests.filter((t) => t.status === "pending");
  const completed = tests.filter((t) => t.status === "completed");
  const suitableCount = completed.filter((t) => t.result?.suitable).length;
  const notSuitableCount = completed.filter((t) => !t.result?.suitable).length;

  const openEntry = (test: LabTest) => {
    setEntryModal(test);
    setForm(defaultScreeningForm(test.bloodType));
    setErrors({});
  };

  const isUnsafe = form
    ? form.hcv === "positive" ||
      form.hbv === "positive" ||
      form.syphilis === "positive" ||
      form.hiv === "positive"
    : false;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form?.confirmedBloodType) e.bloodType = "تأكيد فصيلة الدم مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitResult = async () => {
    if (!validate() || !entryModal || !form) return;
    setSubmitting(true);
    try {
      await submitLabResult.mutateAsync({
        testId: entryModal.id,
        result: {
          confirmedBloodType: form.confirmedBloodType,
          hcv: form.hcv,
          hbv: form.hbv,
          syphilis: form.syphilis,
          hiv: form.hiv,
          notes: form.notes,
          suitable: !isUnsafe,
        },
      });
      setEntryModal(null);
      setSuccessMsg(
        `تم إدخال نتائج حقيبة ${entryModal.bloodType} — ${entryModal.donorCode} بنجاح (${!isUnsafe ? "آمنة ✅" : "غير آمنة ⚠️"})`,
      );
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateTest = (key: TestKey, value: "negative" | "positive") => {
    setForm((p) => (p ? { ...p, [key]: value } : p));
  };

  if (isLoading) return <PageLoader message="جارٍ تحميل بيانات المختبر..." />;
  if (isError)
    return (
      <ErrorState
        message="فشل تحميل بيانات المختبر"
        onRetry={() => window.location.reload()}
      />
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-gray-900"
            style={{ fontSize: "22px", fontWeight: 800 }}
          >
            فحص حقائب الدم
          </h1>
          <p className="text-gray-500" style={{ fontSize: "14px" }}>
            مرحباً {user?.name} — الاثنين، 27 أبريل 2025
          </p>
        </div>
        <button
          onClick={() => navigate("/lab/samples")}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all text-sm"
          style={{ fontWeight: 600 }}
        >
          <FlaskConical className="w-4 h-4" /> فحص العينات
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Success notification */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p
            className="text-green-700"
            style={{ fontSize: "14px", fontWeight: 600 }}
          >
            {successMsg}
          </p>
          <button
            onClick={() => setSuccessMsg("")}
            className="mr-auto text-green-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "حقائب معلقة",
            value: pending.length,
            icon: Clock,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
            border: "border-yellow-100",
          },
          {
            label: "مكتملة",
            value: completed.length,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-100",
          },
          {
            label: "آمنة ✅",
            value: suitableCount,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-100",
          },
          {
            label: "مرفوضة ❌",
            value: notSuitableCount,
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-100",
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`bg-white rounded-2xl p-5 border ${s.border} shadow-sm`}
          >
            <div
              className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-4`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div
              className="text-gray-900"
              style={{ fontSize: "30px", fontWeight: 800 }}
            >
              {s.value}
            </div>
            <div
              className="text-gray-600"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Blood Screening Tests Info */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-green-600" />
          <span
            className="text-green-800"
            style={{ fontSize: "13px", fontWeight: 700 }}
          >
            الفحوصات المعيارية المطلوبة لكل حقيبة دم
          </span>
          <span
            className="mr-auto px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full"
            style={{ fontSize: "11px", fontWeight: 700 }}
          >
            4 فحوصات
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {screeningTests.map((t, idx) => (
            <div
              key={t.key}
              className="bg-white rounded-xl px-4 py-3 border border-green-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                  <span
                    className="text-white"
                    style={{ fontSize: "8px", fontWeight: 900 }}
                  >
                    {idx + 1}
                  </span>
                </div>
                <span
                  className="text-green-700"
                  style={{ fontSize: "13px", fontWeight: 800 }}
                >
                  {t.abbr}
                </span>
              </div>
              <p
                className="text-gray-700"
                style={{ fontSize: "11px", fontWeight: 600 }}
              >
                {t.label}
              </p>
              <p className="text-gray-400 mt-0.5" style={{ fontSize: "9px" }}>
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "pending" ? "bg-white shadow-sm text-green-700" : "text-gray-500 hover:text-gray-700"}`}
              style={{
                fontSize: "13px",
                fontWeight: activeTab === "pending" ? 700 : 500,
              }}
            >
              <Clock className="w-4 h-4" />
              معلقة
              {pending.length > 0 && (
                <span
                  className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full"
                  style={{ fontSize: "11px", fontWeight: 700 }}
                >
                  {pending.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "completed" ? "bg-white shadow-sm text-green-700" : "text-gray-500 hover:text-gray-700"}`}
              style={{
                fontSize: "13px",
                fontWeight: activeTab === "completed" ? 700 : 500,
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              مكتملة
              <span
                className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full"
                style={{ fontSize: "11px", fontWeight: 700 }}
              >
                {completed.length}
              </span>
            </button>
          </div>
        </div>

        {/* PENDING TESTS */}
        {activeTab === "pending" && (
          <div>
            {pending.length === 0 ? (
              <div className="py-16 text-center">
                <Droplets className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400" style={{ fontSize: "15px" }}>
                  لا توجد حقائب معلقة 🎉
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pending.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-yellow-50/40 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-yellow-100">
                        <span
                          className="text-yellow-700"
                          style={{ fontSize: "13px", fontWeight: 800 }}
                        >
                          {t.bloodType}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-gray-900"
                            style={{ fontSize: "14px", fontWeight: 700 }}
                          >
                            {t.donorName}
                          </span>
                          <span
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md"
                            style={{ fontSize: "11px" }}
                          >
                            {donationTypeLabels[t.donationType]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-100 rounded-lg">
                            <FlaskConical className="w-3 h-3 text-green-600" />
                            <span
                              className="text-green-700 font-mono"
                              style={{ fontSize: "11px", fontWeight: 700 }}
                            >
                              كود العينة: {t.donorCode}
                            </span>
                          </div>
                          <span
                            className="text-gray-400"
                            style={{ fontSize: "11px" }}
                          >
                            {t.requestedAt}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full"
                        style={{ fontSize: "11px", fontWeight: 700 }}
                      >
                        <Clock className="w-3 h-3" />
                        معلق
                      </span>
                      <button
                        onClick={() => openEntry(t)}
                        className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl transition-all shadow-sm bg-green-600 hover:bg-green-700"
                        style={{ fontSize: "13px", fontWeight: 700 }}
                      >
                        <FlaskConical className="w-3.5 h-3.5" /> بدء الفحص
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMPLETED TESTS */}
        {activeTab === "completed" && (
          <div>
            {completed.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-400" style={{ fontSize: "15px" }}>
                  لا توجد حقائب مكتملة
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {completed.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between px-5 py-4 transition-colors border-b border-gray-50 last:border-0 ${t.result?.suitable ? "hover:bg-green-50/20" : "hover:bg-red-50/20"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${t.result?.suitable ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}
                      >
                        {t.result?.suitable ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-gray-900"
                            style={{ fontSize: "14px", fontWeight: 700 }}
                          >
                            {t.donorName}
                          </span>
                          <span
                            className="px-2 py-0.5 bg-gray-100 rounded-lg font-mono text-gray-600"
                            style={{ fontSize: "12px", fontWeight: 700 }}
                          >
                            {t.result?.confirmedBloodType || t.bloodType}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full ${t.result?.suitable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            style={{ fontSize: "11px", fontWeight: 700 }}
                          >
                            {t.result?.suitable ? "✅ آمنة" : "❌ مرفوضة"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-100 rounded-lg">
                            <FlaskConical className="w-3 h-3 text-green-600" />
                            <span
                              className="text-green-700 font-mono"
                              style={{ fontSize: "11px", fontWeight: 700 }}
                            >
                              كود العينة: {t.donorCode}
                            </span>
                          </div>
                          <span
                            className="text-gray-400"
                            style={{ fontSize: "11px" }}
                          >
                            {t.result?.completedAt}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewModal(t)}
                      className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Entry Modal - Blood Screening Tests */}
      {entryModal && form && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEntryModal(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div
              className={`flex items-center justify-between p-5 rounded-t-2xl ${isUnsafe ? "bg-gradient-to-r from-red-600 to-red-500" : "bg-gradient-to-r from-green-700 to-green-600"}`}
            >
              <div>
                <h3
                  className="text-white"
                  style={{ fontSize: "17px", fontWeight: 700 }}
                >
                  فحص حقيبة الدم — الفحوصات المعيارية
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="bg-white/20 text-white px-2.5 py-0.5 rounded-lg font-mono"
                    style={{ fontSize: "13px", fontWeight: 800 }}
                  >
                    {entryModal.bloodType}
                  </span>
                  <span
                    className="bg-white/15 text-white/90 px-2.5 py-0.5 rounded-lg"
                    style={{ fontSize: "11px" }}
                  >
                    كود العي��ة:{" "}
                    <span className="font-mono font-bold">
                      {entryModal.donorCode}
                    </span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEntryModal(null)}
                className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center hover:bg-white/25 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Donor / Sample Info */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-100">
                    <Droplets className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-gray-900"
                      style={{ fontSize: "14px", fontWeight: 700 }}
                    >
                      {entryModal.donorName}
                    </p>
                    <p className="text-gray-500" style={{ fontSize: "12px" }}>
                      {donationTypeLabels[entryModal.donationType]}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <p className="text-gray-400" style={{ fontSize: "10px" }}>
                      كود العينة
                    </p>
                    <p
                      className="text-green-700 font-mono"
                      style={{ fontSize: "12px", fontWeight: 700 }}
                    >
                      {entryModal.donorCode}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <p className="text-gray-400" style={{ fontSize: "10px" }}>
                      تاريخ الطلب
                    </p>
                    <p
                      className="text-gray-700"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      {entryModal.requestedAt}
                    </p>
                  </div>
                </div>
              </div>

              {/* Blood Type Confirmation */}
              <div>
                <label
                  className="block text-gray-700 mb-2"
                  style={{ fontSize: "13px", fontWeight: 700 }}
                >
                  🩸 تأكيد فصيلة الدم *
                  <span
                    className="text-gray-400 mr-2"
                    style={{ fontWeight: 400 }}
                  >
                    (المُعلن: {entryModal.bloodType})
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() =>
                        setForm((p) =>
                          p ? { ...p, confirmedBloodType: bt } : p,
                        )
                      }
                      className={`py-2.5 rounded-xl border-2 transition-all ${
                        form.confirmedBloodType === bt
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-600 hover:border-green-200"
                      }`}
                      style={{
                        fontSize: "14px",
                        fontWeight: form.confirmedBloodType === bt ? 800 : 500,
                      }}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
                {errors.bloodType && (
                  <p className="text-red-500 mt-1" style={{ fontSize: "11px" }}>
                    {errors.bloodType}
                  </p>
                )}
              </div>

              {/* Screening Tests */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-gray-500" />
                  <label
                    className="text-gray-700"
                    style={{ fontSize: "13px", fontWeight: 700 }}
                  >
                    الفحوصات المخبرية المعيارية
                  </label>
                  <span
                    className="mr-auto text-gray-400"
                    style={{ fontSize: "11px" }}
                  >
                    سالب = طبيعي / موجب = مرضي
                  </span>
                </div>
                <div className="space-y-2">
                  {screeningTests.map((test, idx) => (
                    <div
                      key={test.key}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                        form[test.key] === "positive"
                          ? "bg-red-50 border-red-200"
                          : "bg-white border-gray-100 hover:border-green-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                            form[test.key] === "positive"
                              ? "bg-red-100"
                              : "bg-green-50"
                          }`}
                        >
                          <span
                            className={`${form[test.key] === "positive" ? "text-red-700" : "text-green-700"}`}
                            style={{ fontSize: "9px", fontWeight: 900 }}
                          >
                            {test.abbr}
                          </span>
                        </div>
                        <div>
                          <p
                            className="text-gray-800"
                            style={{ fontSize: "13px", fontWeight: 600 }}
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateTest(test.key, "negative")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                            form[test.key] === "negative"
                              ? "bg-green-600 text-white shadow-sm"
                              : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-300"
                          }`}
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        >
                          <Check className="w-3 h-3" /> سالب
                        </button>
                        <button
                          onClick={() => updateTest(test.key, "positive")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                            form[test.key] === "positive"
                              ? "bg-red-500 text-white shadow-sm"
                              : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-300"
                          }`}
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        >
                          <X className="w-3 h-3" /> موجب
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto Result */}
              <div
                className={`flex items-center gap-3 p-4 rounded-xl ${isUnsafe ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}
              >
                {isUnsafe ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p
                        className="text-red-700"
                        style={{ fontSize: "13px", fontWeight: 700 }}
                      >
                        ⚠️ تحذير: نتيجة إيجابية واحدة أو أكثر
                      </p>
                      <p className="text-red-500" style={{ fontSize: "11px" }}>
                        سيتم تص��يف الدم كـ (غير آمن ومرفوض)
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p
                        className="text-green-700"
                        style={{ fontSize: "13px", fontWeight: 700 }}
                      >
                        ✓ جميع الفحوصات سالبة
                      </p>
                      <p
                        className="text-green-500"
                        style={{ fontSize: "11px" }}
                      >
                        سيتم قبول الدم كـ (آمن ومناسب للاستخدام)
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Notes */}
              <div>
                <label
                  className="block text-gray-700 mb-1.5"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  ملاحظات إضافية{" "}
                  <span className="text-gray-400">(اختياري)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => (p ? { ...p, notes: e.target.value } : p))
                  }
                  placeholder="أي ملاحظات على الحقيبة أو نتائج الفحص..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400 resize-none"
                  style={{ fontSize: "13px" }}
                />
              </div>

              {/* Lab Doctor */}
              <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-gray-400" style={{ fontSize: "11px" }}>
                    طبيب المختبر:{" "}
                  </span>
                  <span
                    className="text-gray-800"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    {user?.name}
                  </span>
                </div>
                <span className="text-gray-400" style={{ fontSize: "11px" }}>
                  {new Date().toLocaleDateString("ar-EG")}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEntryModal(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  إلغاء
                </button>
                <button
                  onClick={submitResult}
                  disabled={submitting}
                  className={`flex-1 py-3 rounded-xl text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 ${
                    isUnsafe
                      ? "bg-gradient-to-r from-red-600 to-red-500"
                      : "bg-gradient-to-r from-green-700 to-green-600"
                  }`}
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      جاري الحفظ...
                    </span>
                  ) : isUnsafe ? (
                    "⚠️ حفظ — دم غير آمن"
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> حفظ — دم آمن
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Completed Modal */}
      {viewModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewModal(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div
              className={`flex items-center justify-between p-5 rounded-t-2xl ${viewModal.result?.suitable ? "bg-gradient-to-r from-green-700 to-green-600" : "bg-gradient-to-r from-red-600 to-red-500"}`}
            >
              <div>
                <h3
                  className="text-white"
                  style={{ fontSize: "17px", fontWeight: 700 }}
                >
                  نتائج فحص الحقيبة
                </h3>
                <p className="text-white/80" style={{ fontSize: "12px" }}>
                  كود العينة:{" "}
                  <span className="font-mono font-bold">
                    {viewModal.donorCode}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setViewModal(null)}
                className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center hover:bg-white/25"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Result Summary */}
              <div
                className={`flex items-center gap-3 p-4 rounded-xl ${viewModal.result?.suitable ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}
              >
                {viewModal.result?.suitable ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <p
                    className={`${viewModal.result?.suitable ? "text-green-700" : "text-red-700"}`}
                    style={{ fontSize: "16px", fontWeight: 800 }}
                  >
                    {viewModal.result?.suitable
                      ? "✅ الدم آمن ومقبول"
                      : "❌ الدم مرفوض"}
                  </p>
                  <p className="text-gray-600" style={{ fontSize: "13px" }}>
                    فصيلة مؤكدة:{" "}
                    <strong>{viewModal.result?.confirmedBloodType}</strong> •{" "}
                    {donationTypeLabels[viewModal.donationType]}
                  </p>
                </div>
              </div>

              {/* Test Results Detail */}
              <div>
                <p
                  className="text-gray-700 mb-3"
                  style={{ fontSize: "13px", fontWeight: 700 }}
                >
                  تفاصيل الفحوصات الأربعة:
                </p>
                <div className="space-y-2">
                  {viewModal.result &&
                    screeningTests.map((test) => {
                      const val = (viewModal.result as any)[test.key];
                      const isPositive = val === "positive";
                      return (
                        <div
                          key={test.key}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${isPositive ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isPositive ? "bg-red-100" : "bg-green-50"}`}
                            >
                              <span
                                className={
                                  isPositive ? "text-red-700" : "text-green-700"
                                }
                                style={{ fontSize: "9px", fontWeight: 900 }}
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

              {viewModal.result?.notes && (
                <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                  <p
                    className="text-yellow-700"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    ملاحظات:
                  </p>
                  <p
                    className="text-yellow-600 mt-0.5"
                    style={{ fontSize: "13px" }}
                  >
                    {viewModal.result.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>
                    وقت الإكمال
                  </p>
                  <p
                    className="text-gray-700"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    {viewModal.result?.completedAt}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>
                    طلب التحليل
                  </p>
                  <p
                    className="text-gray-700"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    {viewModal.requestedAt}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewModal(null)}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
