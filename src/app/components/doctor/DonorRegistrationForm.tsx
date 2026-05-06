import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  CheckCircle2,
  User,
  Droplets,
  Phone,
  Activity,
  Building2,
  MapPin,
  CreditCard,
  UserCheck,
  UserX,
  Megaphone,
  Scale,
  Heart,
  FlaskConical,
  AlertTriangle,
  CalendarDays,
  Clock,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Check,
  Timer,
} from "lucide-react";
import { BLOOD_TYPES, DISEASES, CITIES } from "../../constants";
import { useAuth } from "../../contexts/AuthContext";
import { useCampaigns } from "../../hooks/useCampaigns";
import { useSlot15Data } from "../../hooks/useAppointments";
import { useCreateDonor } from "../../hooks/useDonors";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const donorSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "أدخل الاسم الثنائي على الأقل")
      .refine(
        (value) => value.split(/\s+/).filter(Boolean).length >= 2,
        "أدخل الاسم الثنائي على الأقل",
      ),
    gender: z.string().min(1, "اختر الجنس"),
    age: z.string().refine((value) => {
      const num = Number(value);
      return !!value && !Number.isNaN(num) && num >= 18 && num <= 65;
    }, "العمر يجب أن يكون بين 18 و65 سنة"),
    phone: z.string().min(11, "رقم هاتف غير صحيح"),
    nationalId: z.string().regex(/^\d{14}$/, "رقم الهوية يجب أن يكون 14 رقماً"),
    governorate: z.string(),
    district: z.string().min(1, "اختر المركز"),
    area: z.string().trim().min(1, "أدخل المنطقة"),
    bloodType: z.string(),
    donationType: z.string(),
    diseases: z.array(z.string()),
    source: z.enum(["walkin", "campaign", "app"]),
    campaignId: z.string(),
    status: z.enum(["eligible", "ineligible", "deferred"]),
    weight: z.string(),
    bloodPressure: z.string(),
    hemoglobin: z.string(),
    isAllergic: z.boolean(),
    rejectionReason: z.string(),
    lockoutUntil: z.string(),
    deferredUntil: z.string(),
    donationTime: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.source === "campaign" && !data.campaignId.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "اختر الحملة",
        path: ["campaignId"],
      });
    }
  });

type SimpleForm = z.infer<typeof donorSchema>;

const DISTRICTS = [
  "بني سويف",
  "ناصر",
  "الواسطى",
  "ببا",
  "الفشن",
  "إهناسيا",
  "سمسطا",
  "نزلة",
];

const initialForm: SimpleForm = {
  name: "",
  gender: "",
  age: "",
  phone: "",
  nationalId: "",
  governorate: "بني سويف",
  district: "بني سويف",
  area: "",
  bloodType: "",
  donationType: "whole",
  diseases: [],
  source: "walkin",
  campaignId: "",
  status: "eligible",
  weight: "",
  bloodPressure: "",
  hemoglobin: "",
  isAllergic: false,
  rejectionReason: "",
  lockoutUntil: "",
  deferredUntil: "",
  donationTime: new Date().toTimeString().slice(0, 5),
};

export default function DonorRegistrationForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { data: campaignsData = [] } = useCampaigns();
  const { data: slot15DataFromHook = [] } = useSlot15Data();
  const createDonor = useCreateDonor();

  // Pre-fill from appointment if ?apt=S15-xxx
  const aptId = searchParams.get("apt");
  const appointment = aptId
    ? slot15DataFromHook.find((s) => s.id === aptId)
    : null;

  const getInitialForm = (): SimpleForm => {
    if (appointment) {
      return {
        ...initialForm,
        name: appointment.donorName || "",
        gender: appointment.donorGender || "",
        age: appointment.donorAge ? String(appointment.donorAge) : "",
        phone: appointment.donorPhone || "",
        nationalId: appointment.donorNationalId || "",
        district: appointment.donorDistrict || "بني سويف",
        area: appointment.donorArea || "",
        bloodType: appointment.donorBloodType || "",
        donationType: appointment.donationType || "whole",
        source: "app",
        donationTime: appointment.time || new Date().toTimeString().slice(0, 5),
      };
    }
    return initialForm;
  };

  const [submitting, setSubmitting] = useState(false);
  const [donorCode] = useState(
    `DNR-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`,
  );
  const [step, setStep] = useState<1 | 2>(1);
  const [bagVolume, setBagVolume] = useState("400"); // ← added outside selected element

  const formMethods = useForm<SimpleForm>({
    defaultValues: getInitialForm(),
    mode: "onTouched",
    resolver: zodResolver(donorSchema),
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = formMethods;
  const form = watch();

  useEffect(() => {
    reset(getInitialForm());
    setStep(1);
  }, [appointment?.id, reset]);

  useEffect(() => {
    register("source");
    register("gender");
    register("bloodType");
    register("donationType");
    register("status");
    register("diseases");
    register("isAllergic");
    register("governorate");
    register("donationTime");
  }, [register]);

  const success = createDonor.isSuccess;

  const activeCampaigns = campaignsData.filter((c) => c.status === "active");

  const updateField = <K extends keyof SimpleForm>(
    key: K,
    value: SimpleForm[K],
  ) => {
    setValue(key, value, { shouldDirty: true, shouldValidate: true });
    if (key === "source" && value !== "campaign") {
      setValue("campaignId", "", { shouldDirty: true, shouldValidate: true });
    }
  };

  const toggleDisease = (id: string) => {
    const current = getValues("diseases") || [];
    const next = current.includes(id)
      ? current.filter((d) => d !== id)
      : [...current, id];
    setValue("diseases", next, { shouldDirty: true, shouldValidate: true });
  };

  const submitForm = handleSubmit((values) => {
    setSubmitting(true);
    createDonor.mutate(
      {
        name: values.name,
        gender: values.gender as any,
        age: Number(values.age),
        phone: values.phone,
        nationalId: values.nationalId,
        city: values.governorate,
        address: [values.area, values.district].filter(Boolean).join(" - "),
        bloodType: (values.bloodType || undefined) as any,
        donationType: values.donationType as any,
        diseases: values.diseases,
        source: values.source,
        campaignId: values.campaignId || undefined,
        status: values.status as any,
        additionalData: {
          weight: Number(values.weight) || undefined,
          bloodPressure: values.bloodPressure || undefined,
          hemoglobin: Number(values.hemoglobin) || undefined,
        },
        isAllergic: values.isAllergic,
        rejectionReason: values.rejectionReason || undefined,
        lockoutUntil: values.lockoutUntil || undefined,
        deferredUntil: values.deferredUntil || undefined,
      },
      {
        onSuccess: () => {
          toast.success("تم تسجيل المتبرع بنجاح");
        },
        onError: () => {
          toast.error("تعذر تسجيل المتبرع، حاول مرة أخرى");
        },
        onSettled: () => {
          setSubmitting(false);
        },
      },
    );
  });

  const handleNextStep = async () => {
    const step1Fields: (keyof SimpleForm)[] = [
      "name",
      "gender",
      "age",
      "phone",
      "nationalId",
      "area",
    ];
    if (getValues("source") === "campaign") {
      step1Fields.push("campaignId");
    }
    const isValid = await trigger(step1Fields as any);
    if (isValid) {
      setStep(2);
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step !== 2) {
      void handleNextStep();
      return;
    }
    submitForm();
  };

  const selectedCampaign = activeCampaigns.find(
    (c) => c.id === form.campaignId,
  );

  if (success) {
    const today = new Date().toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const donationTypeLabel: Record<string, string> = {
      whole: "دم كامل",
      plasma: "بلازما",
      platelets: "صفائح دموية",
    };
    const isEligible = form.status === "eligible";

    /* ══════════════════════════════════════════════════════
       BRANCH A — Ineligible / Deferred
       No confirmation step, no lab transfer UI.
       Data is silently recorded & auto-synced in background.
    ══════════════════════════════════════════════════════ */
    if (!isEligible) {
      const isDeferred = form.status === "deferred";
      return (
        <div className="min-h-[60vh] flex items-center justify-center py-6">
          <div className="w-full max-w-md mx-auto">
            {/* Status Icon */}
            <div className="text-center mb-6">
              <div
                className={`rounded-full flex items-center justify-center mx-auto mb-4 ${isDeferred ? "bg-orange-100" : "bg-red-100"}`}
                style={{ width: 72, height: 72 }}
              >
                {isDeferred ? (
                  <Clock className="w-9 h-9 text-orange-500" />
                ) : (
                  <UserX className="w-9 h-9 text-red-500" />
                )}
              </div>
              <h2
                className="text-gray-900 mb-1"
                style={{ fontSize: "20px", fontWeight: 800 }}
              >
                {isDeferred ? "تم تأجيل المتبرع" : "تم رفض المتبرع"}
              </h2>
              <p className="text-gray-400" style={{ fontSize: "13px" }}>
                {isDeferred
                  ? "التبرع موجل مؤقتاً — تم حفظ البيانات في سجلات الطبيب"
                  : "المتبرع غير مؤهل — تم حفظ البيانات في سجلات الطبيب"}
              </p>
            </div>

            {/* Donor summary card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className="text-gray-500"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  اسم المتبرع
                </span>
                <span
                  className="text-gray-900"
                  style={{ fontSize: "13px", fontWeight: 700 }}
                >
                  {form.name}
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <span
                  className="text-gray-500"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  فصيلة الدم
                </span>
                <span
                  className="text-red-700 font-mono"
                  style={{ fontSize: "14px", fontWeight: 800 }}
                >
                  {form.bloodType || "—"}
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <span
                  className="text-gray-500"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  الحالة
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full ${isDeferred ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}
                  style={{ fontSize: "12px", fontWeight: 700 }}
                >
                  {isDeferred ? "⏳ موجل" : "❌ غير مؤهل"}
                </span>
              </div>
              {form.rejectionReason && (
                <>
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className="text-gray-500 flex-shrink-0"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      السبب
                    </span>
                    <span
                      className="text-gray-700 text-right"
                      style={{ fontSize: "12px" }}
                    >
                      {form.rejectionReason}
                    </span>
                  </div>
                </>
              )}
              {isDeferred && form.deferredUntil && (
                <>
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-center justify-between">
                    <span
                      className="text-gray-500"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      موجل حتى
                    </span>
                    <span
                      className="text-orange-700 font-mono"
                      style={{ fontSize: "13px", fontWeight: 700 }}
                    >
                      {form.deferredUntil}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Silent auto-sync notice */}

            {/* Action buttons — no "Send to Lab" button */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  createDonor.reset();
                  reset(initialForm);
                  setStep(1);
                  setBagVolume("400");
                }}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                تسجيل متبرع آخر
              </button>
              <button
                onClick={() => navigate("/doctor/donors")}
                className="flex-1 py-3.5 text-white rounded-xl transition-all flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #374151, #1f2937)",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                <User className="w-4 h-4" />
                عرض المتبرعين
              </button>
            </div>
          </div>
        </div>
      );
    }

    /* ══════════════════════════════════════════════════════
       BRANCH B — Eligible
       Full review + manual confirmation + transfer to lab.
    ══════════════════════════════════════════════════════ */
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-6">
        <div className="w-full max-w-lg mx-auto">
          {/* ── Header ── */}
          <div className="text-center mb-5">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <h2
              className="text-gray-900 mb-1"
              style={{ fontSize: "20px", fontWeight: 800 }}
            >
              مراجعة وتأكيد بيانات التبرع
            </h2>
            <p className="text-gray-400" style={{ fontSize: "13px" }}>
              يرجى مراجعة البيانات أدناه قبل الإرسال للمختبر
            </p>
          </div>

          {/* ── Sample Code — prominent ── */}
          <div className="p-4 bg-gradient-to-l from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl mb-4 flex items-center justify-between">
            <div>
              <p
                className="text-gray-500 mb-0.5"
                style={{ fontSize: "11px", fontWeight: 600 }}
              >
                رمز العينة (مولّد تلقائياً)
              </p>
              <p
                className="text-green-700 font-mono"
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                }}
              >
                {donorCode}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* ── Auto-filled medical info (read-only) ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
            <p
              className="text-gray-500 mb-3 flex items-center gap-1.5"
              style={{ fontSize: "12px", fontWeight: 700 }}
            >
              <Activity className="w-3.5 h-3.5 text-green-600" /> البيانات
              الطبية (مُعبَّأة تلقائياً — للقراءة فقط)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                <p
                  className="text-gray-400 mb-1"
                  style={{ fontSize: "10px", fontWeight: 600 }}
                >
                  فصيلة الدم
                </p>
                <p
                  className="text-red-700 font-mono"
                  style={{ fontSize: "20px", fontWeight: 900 }}
                >
                  {form.bloodType || "—"}
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                <p
                  className="text-gray-400 mb-1"
                  style={{ fontSize: "10px", fontWeight: 600 }}
                >
                  نوع التبرع
                </p>
                <p
                  className="text-blue-700"
                  style={{ fontSize: "13px", fontWeight: 700 }}
                >
                  {donationTypeLabel[form.donationType] || "—"}
                </p>
              </div>
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-center">
                <p
                  className="text-gray-400 mb-1"
                  style={{ fontSize: "10px", fontWeight: 600 }}
                >
                  حالة التأهل
                </p>
                <p
                  className="text-green-700"
                  style={{ fontSize: "13px", fontWeight: 700 }}
                >
                  ✅ مؤهل
                </p>
              </div>
            </div>
          </div>

          {/* ── Blood Bag Volume ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
            <p
              className="text-gray-500 mb-3 flex items-center gap-1.5"
              style={{ fontSize: "12px", fontWeight: 700 }}
            >
              <Droplets className="w-3.5 h-3.5 text-red-500" /> حجم حقيبة الدم
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={bagVolume}
                  onChange={(e) =>
                    setBagVolume(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  onBlur={() => {
                    if (!bagVolume || +bagVolume <= 0) setBagVolume("400");
                  }}
                  onFocus={(e) => e.target.select()}
                  dir="ltr"
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-xl bg-red-50 text-red-700 font-mono outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-center"
                  style={{ fontSize: "22px", fontWeight: 800 }}
                />
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  مل
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {["400", "450", "500"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setBagVolume(v)}
                    className={`px-3 py-1.5 rounded-lg border transition-all text-center ${bagVolume === v ? "border-red-400 bg-red-600 text-white" : "border-red-200 bg-white text-red-600 hover:bg-red-50"}`}
                    style={{ fontSize: "11px", fontWeight: 700 }}
                  >
                    {v} مل
                  </button>
                ))}
              </div>
            </div>
            <p
              className="text-gray-400 mt-2 flex items-center gap-1"
              style={{ fontSize: "11px" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-300 inline-block" />
              القيمة الافتراضية 400 مل — انقر على الرقم لتعديله يدوياً
            </p>
          </div>

          {/* ── Date & Time ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
            <p
              className="text-gray-500 mb-3 flex items-center gap-1.5"
              style={{ fontSize: "12px", fontWeight: 700 }}
            >
              <CalendarDays className="w-3.5 h-3.5 text-purple-500" /> تاريخ
              ووقت التبرع
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                <p
                  className="text-gray-400 mb-0.5"
                  style={{ fontSize: "10px" }}
                >
                  التاريخ
                </p>
                <p
                  className="text-purple-700"
                  style={{ fontSize: "12px", fontWeight: 700 }}
                >
                  {today}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p
                  className="text-gray-400 mb-0.5"
                  style={{ fontSize: "10px" }}
                >
                  وقت التبرع
                </p>
                <p
                  className="text-indigo-700 font-mono"
                  style={{ fontSize: "18px", fontWeight: 800 }}
                >
                  {form.donationTime || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Source ── */}
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl mb-4 flex items-center justify-center gap-2">
            {form.source === "walkin" ? (
              <>
                <Building2 className="w-4 h-4 text-green-600" />
                <span
                  className="text-green-700"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  تبرع داخل البنك
                </span>
              </>
            ) : form.source === "campaign" ? (
              <>
                <Megaphone className="w-4 h-4 text-purple-600" />
                <span
                  className="text-purple-700"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  تبرع من حملة
                  {selectedCampaign ? ` — ${selectedCampaign.title}` : ""}
                </span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span
                  className="text-blue-700"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  حجز من التطبيق
                </span>
              </>
            )}
          </div>

          {/* ── Lab Notice ── */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p
              className="text-amber-700"
              style={{ fontSize: "12px", lineHeight: "1.6" }}
            >
              بعد الضغط على <strong>«تأكيد وإرسال للمختبر»</strong>، ستُقفَل
              البيانات وتُرسَل تلقائياً إلى دكتور التحاليل لاستكمال الفحوصات
              المخبرية.
            </p>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                createDonor.reset();
                reset(initialForm);
                setStep(1);
                setBagVolume("400");
              }}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              تسجيل متبرع آخر
            </button>
            <button
              onClick={() => navigate("/doctor/donors")}
              className="flex-1 py-3.5 text-white rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #15803d, #16a34a)",
                fontSize: "14px",
                fontWeight: 700,
                boxShadow: "0 4px 14px rgba(22,163,74,0.30)",
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              تأكيد وإرسال للمختبر
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form {...formMethods}>
      <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1
            className="text-gray-900"
            style={{ fontSize: "22px", fontWeight: 800 }}
          >
            تسجيل متبرع جديد
          </h1>
          <p className="text-gray-500" style={{ fontSize: "14px" }}>
            أدخل البيانات الأساسية للمتبرع
          </p>
        </div>

        {/* Appointment pre-fill banner */}
        {appointment && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p
                className="text-blue-800"
                style={{ fontSize: "14px", fontWeight: 700 }}
              >
                📱 موعد محجوز من التطبيق — {appointment.time}
              </p>
              <p className="text-blue-600" style={{ fontSize: "12px" }}>
                تم جلب بيانات المتبرع تلقائياً. يمكنك تعديلها إذا لزم الأمر، ثم
                أضف البيانات الطبية في الخطوة التالية.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          {/* ── Step Indicator ── */}
          <div className="flex items-center gap-3 pb-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${step >= 1 ? "bg-green-600" : "bg-gray-200"}`}
              >
                {step > 1 ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span
                    className="text-white"
                    style={{ fontSize: "13px", fontWeight: 800 }}
                  >
                    1
                  </span>
                )}
              </div>
              <span
                className={`${step === 1 ? "text-green-700" : "text-gray-400"} text-center`}
                style={{ fontSize: "11px", fontWeight: 600 }}
              >
                البيانات
                <br />
                الأساسية
              </span>
            </div>
            <div className="flex-1 mb-5">
              <div
                className={`h-0.5 w-full transition-all ${step > 1 ? "bg-green-500" : "bg-gray-200"}`}
              />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${step === 2 ? "bg-green-600" : "bg-gray-200"}`}
              >
                <span
                  className={step === 2 ? "text-white" : "text-gray-400"}
                  style={{ fontSize: "13px", fontWeight: 800 }}
                >
                  2
                </span>
              </div>
              <span
                className={`${step === 2 ? "text-green-700" : "text-gray-400"} text-center`}
                style={{ fontSize: "11px", fontWeight: 600 }}
              >
                البيانات
                <br />
                الطبية
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* ══════════════ STEP 1 ══════════════ */}
          {step === 1 && (
            <>
              {/* Source Selection */}
              <div>
                <label
                  className="block text-gray-700 mb-2"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  <Activity className="w-4 h-4 inline ml-1 text-green-600" />
                  مصدر المتبرع
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Walk-in */}
                  <button
                    type="button"
                    onClick={() => updateField("source", "walkin")}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.source === "walkin" ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-200"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${form.source === "walkin" ? "bg-green-600" : "bg-gray-100"}`}
                    >
                      <Building2
                        className={`w-4 h-4 ${form.source === "walkin" ? "text-white" : "text-gray-400"}`}
                      />
                    </div>
                    <div className="text-right">
                      <p
                        className={
                          form.source === "walkin"
                            ? "text-green-700"
                            : "text-gray-700"
                        }
                        style={{ fontSize: "12px", fontWeight: 700 }}
                      >
                        داخل البنك
                      </p>
                      <p className="text-gray-400" style={{ fontSize: "10px" }}>
                        Walk-in
                      </p>
                    </div>
                  </button>

                  {/* App */}

                  {/* Campaign */}
                  <button
                    type="button"
                    onClick={() => updateField("source", "campaign")}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.source === "campaign" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-200"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${form.source === "campaign" ? "bg-purple-500" : "bg-gray-100"}`}
                    >
                      <Megaphone
                        className={`w-4 h-4 ${form.source === "campaign" ? "text-white" : "text-gray-400"}`}
                      />
                    </div>
                    <div className="text-right">
                      <p
                        className={
                          form.source === "campaign"
                            ? "text-purple-700"
                            : "text-gray-700"
                        }
                        style={{ fontSize: "12px", fontWeight: 700 }}
                      >
                        من حملة
                      </p>
                      <p className="text-gray-400" style={{ fontSize: "10px" }}>
                        Campaign
                      </p>
                    </div>
                  </button>
                </div>

                {/* Campaign Selector */}
                {form.source === "campaign" && (
                  <div className="mt-3">
                    <select
                      {...register("campaignId")}
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all ${errors.campaignId ? "border-red-300" : "border-gray-200"}`}
                      style={{ fontSize: "13px" }}
                    >
                      <option value="">— اختر الحملة —</option>
                      {activeCampaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                    {errors.campaignId?.message && (
                      <p
                        className="text-red-500 mt-1"
                        style={{ fontSize: "11px" }}
                      >
                        {errors.campaignId.message}
                      </p>
                    )}
                    {selectedCampaign && (
                      <div className="mt-2 p-2.5 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
                        <span
                          className="text-purple-700"
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        >
                          {selectedCampaign.title}
                        </span>
                        <span
                          className="text-purple-500"
                          style={{ fontSize: "11px" }}
                        >
                          {selectedCampaign.registeredDonors} /{" "}
                          {selectedCampaign.targetDonors} متبرع
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100" />

              {/* Full Name */}
              <div>
                <label
                  className="block text-gray-700 mb-1.5"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  <User className="w-4 h-4 inline ml-1 text-green-600" />
                  الاسم الكامل *
                </label>
                <input
                  {...register("name")}
                  placeholder="مثال: أحمد محمد علي"
                  className={`w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all ${errors.name ? "border-red-300" : "border-gray-200"}`}
                  style={{ fontSize: "14px" }}
                />
                {errors.name?.message && (
                  <p className="text-red-500 mt-1" style={{ fontSize: "11px" }}>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Gender + Age */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    الجنس *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["male", "ذكر"],
                      ["female", "أنثى"],
                    ].map(([v, l]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => updateField("gender", v)}
                        className={`py-3 rounded-xl border-2 transition-all ${form.gender === v ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                        style={{
                          fontSize: "13px",
                          fontWeight: form.gender === v ? 700 : 500,
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  {errors.gender?.message && (
                    <p
                      className="text-red-500 mt-1"
                      style={{ fontSize: "11px" }}
                    >
                      {errors.gender.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    العمر * <span className="text-gray-400">(18-65)</span>
                  </label>
                  <input
                    type="number"
                    {...register("age")}
                    placeholder="مثال: 28"
                    min="18"
                    max="65"
                    className={`w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.age ? "border-red-300" : "border-gray-200"}`}
                    style={{ fontSize: "14px" }}
                  />
                  {errors.age?.message && (
                    <p
                      className="text-red-500 mt-1"
                      style={{ fontSize: "11px" }}
                    >
                      {errors.age.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone + National ID */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    <Phone className="w-4 h-4 inline ml-1 text-green-600" />
                    رقم الهاتف *
                  </label>
                  <input
                    {...register("phone", {
                      setValueAs: (value) =>
                        typeof value === "string"
                          ? value.replace(/\D/g, "").slice(0, 11)
                          : value,
                    })}
                    placeholder="01xxxxxxxxx"
                    maxLength={11}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.phone ? "border-red-300" : "border-gray-200"}`}
                    style={{ fontSize: "14px" }}
                    dir="ltr"
                  />
                  {errors.phone?.message && (
                    <p
                      className="text-red-500 mt-1"
                      style={{ fontSize: "11px" }}
                    >
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-gray-700 mb-1.5"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    <CreditCard className="w-4 h-4 inline ml-1 text-green-600" />
                    رقم الهوية الوطنية *
                  </label>
                  <input
                    {...register("nationalId", {
                      setValueAs: (value) =>
                        typeof value === "string"
                          ? value.replace(/\D/g, "").slice(0, 14)
                          : value,
                    })}
                    placeholder="14 رقماً"
                    maxLength={14}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.nationalId ? "border-red-300" : "border-gray-200"}`}
                    style={{ fontSize: "14px" }}
                    dir="ltr"
                  />
                  {errors.nationalId?.message && (
                    <p
                      className="text-red-500 mt-1"
                      style={{ fontSize: "11px" }}
                    >
                      {errors.nationalId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address → Governorate + District + Area */}
              <div>
                <label
                  className="block text-gray-700 mb-2"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  <MapPin className="w-4 h-4 inline ml-1 text-green-600" />
                  العنوان التفصيلي
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Governorate — fixed */}
                  <div>
                    <label
                      className="block text-gray-500 mb-1.5"
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    >
                      المحافظة
                    </label>
                    <div
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 flex items-center gap-1.5"
                      style={{ fontSize: "13px" }}
                    >
                      <MapPin className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      بني سويف
                    </div>
                  </div>
                  {/* District */}
                  <div>
                    <label
                      className="block text-gray-500 mb-1.5"
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    >
                      المركز *
                    </label>
                    <select
                      {...register("district")}
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                      style={{ fontSize: "13px" }}
                    >
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Area */}
                  <div>
                    <label
                      className="block text-gray-500 mb-1.5"
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    >
                      المنطقة / الشارع *
                    </label>
                    <input
                      {...register("area")}
                      placeholder="مثال: شارع النيل"
                      className={`w-full px-3 py-3 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all ${errors.area ? "border-red-300" : "border-gray-200"}`}
                      style={{ fontSize: "13px" }}
                    />
                    {errors.area?.message && (
                      <p
                        className="text-red-500 mt-1"
                        style={{ fontSize: "11px" }}
                      >
                        {errors.area.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Donation Time */}

              {/* Next button */}
              <div className="border-t border-gray-100 pt-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-sm"
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  التالي — البيانات الطبية
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </>
          )}

          {/* ══════════════ STEP 2 ══════════════ */}
          {step === 2 && (
            <>
              {/* Blood Type — optional */}
              <div>
                <label
                  className="block text-gray-700 mb-2"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  <Droplets className="w-4 h-4 inline ml-1 text-red-500" />
                  فصيلة الدم{" "}
                  <span className="text-gray-400" style={{ fontWeight: 400 }}>
                    (اختياري)
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        updateField("bloodType", form.bloodType === t ? "" : t)
                      }
                      className={`py-3 rounded-xl border-2 transition-all ${form.bloodType === t ? "border-red-500 bg-red-50 text-red-600" : "border-gray-200 text-gray-600 hover:border-red-200"}`}
                      style={{
                        fontSize: "15px",
                        fontWeight: form.bloodType === t ? 800 : 500,
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Donation Type */}
              <div>
                <label
                  className="block text-gray-700 mb-2"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  نوع التبرع
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["whole", "دم كامل", "🩸"],
                    ["plasma", "بلازما", "💧"],
                    ["platelets", "صفائح", "🔬"],
                  ].map(([v, l, e]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => updateField("donationType", v)}
                      className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${form.donationType === v ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-200"}`}
                    >
                      <span style={{ fontSize: "20px" }}>{e}</span>
                      <span
                        className={
                          form.donationType === v
                            ? "text-green-700"
                            : "text-gray-600"
                        }
                        style={{
                          fontSize: "12px",
                          fontWeight: form.donationType === v ? 700 : 500,
                        }}
                      >
                        {l}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ── Medical Screening ── */}
              <div>
                <p
                  className="text-gray-700 mb-3 flex items-center gap-2"
                  style={{ fontSize: "13px", fontWeight: 700 }}
                >
                  <FlaskConical className="w-4 h-4 text-blue-500" />
                  الفحص الطبي{" "}
                  <span className="text-gray-400" style={{ fontWeight: 400 }}>
                    (اختياري)
                  </span>
                </p>

                {/* Weight + Blood Pressure + Hemoglobin */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label
                      className="block text-gray-600 mb-1.5 flex items-center gap-1"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      <Scale className="w-3.5 h-3.5 text-blue-500" /> الوزن (كغ)
                    </label>
                    <input
                      type="number"
                      {...register("weight")}
                      placeholder="مثال: 75"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      style={{ fontSize: "13px" }}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-600 mb-1.5 flex items-center gap-1"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      <Heart className="w-3.5 h-3.5 text-red-500" /> ضغط الدم
                    </label>
                    <input
                      {...register("bloodPressure")}
                      placeholder="120/80"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      style={{ fontSize: "13px" }}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-600 mb-1.5 flex items-center gap-1"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      <Droplets className="w-3.5 h-3.5 text-purple-500" />{" "}
                      الهيموجلوبين
                    </label>
                    <input
                      type="number"
                      {...register("hemoglobin")}
                      placeholder="مثال: 13.5"
                      step="0.1"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      style={{ fontSize: "13px" }}
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* IsAllergic */}
                <button
                  type="button"
                  onClick={() => updateField("isAllergic", !form.isAllergic)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${form.isAllergic ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 ${form.isAllergic ? "text-orange-500" : "text-gray-400"}`}
                    />
                    <span
                      className={
                        form.isAllergic ? "text-orange-700" : "text-gray-600"
                      }
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      لديه حساسية (IsAllergic)
                    </span>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full transition-all relative ${form.isAllergic ? "bg-orange-500" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isAllergic ? "left-5" : "left-0.5"}`}
                    />
                  </div>
                </button>
              </div>

              <div className="border-t border-gray-100" />

              {/* Chronic Diseases */}
              <div>
                <label
                  className="block text-gray-700 mb-2"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  <Activity className="w-4 h-4 inline ml-1 text-orange-500" />
                  الأمراض المزمنة{" "}
                  <span className="text-gray-400" style={{ fontWeight: 400 }}>
                    (اختياري — اضغط للتحديد)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DISEASES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDisease(d.id)}
                      className={`px-3 py-1.5 rounded-full border-2 transition-all ${
                        form.diseases.includes(d.id)
                          ? "border-red-400 bg-red-50 text-red-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                      style={{
                        fontSize: "12px",
                        fontWeight: form.diseases.includes(d.id) ? 700 : 400,
                      }}
                    >
                      {form.diseases.includes(d.id) ? "✕ " : ""}
                      {d.label}
                    </button>
                  ))}
                </div>
                {form.diseases.length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-xl">
                    <p
                      className="text-red-600"
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    >
                      محدد:{" "}
                      {form.diseases
                        .map((id) => DISEASES.find((d) => d.id === id)?.label)
                        .join("، ")}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100" />

              {/* Donor Status */}
              <div>
                <label
                  className="block text-gray-700 mb-2"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  حالة المتبرع *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => updateField("status", "eligible")}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.status === "eligible" ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-200"}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${form.status === "eligible" ? "bg-green-600" : "bg-gray-100"}`}
                    >
                      <UserCheck
                        className={`w-4 h-4 ${form.status === "eligible" ? "text-white" : "text-gray-400"}`}
                      />
                    </div>
                    <div className="text-right">
                      <p
                        className={
                          form.status === "eligible"
                            ? "text-green-700"
                            : "text-gray-700"
                        }
                        style={{ fontSize: "12px", fontWeight: 700 }}
                      >
                        مؤهل ✅
                      </p>
                      <p className="text-gray-400" style={{ fontSize: "10px" }}>
                        يمكنه التبرع
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("status", "deferred")}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.status === "deferred" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${form.status === "deferred" ? "bg-orange-500" : "bg-gray-100"}`}
                    >
                      <Clock
                        className={`w-4 h-4 ${form.status === "deferred" ? "text-white" : "text-gray-400"}`}
                      />
                    </div>
                    <div className="text-right">
                      <p
                        className={
                          form.status === "deferred"
                            ? "text-orange-700"
                            : "text-gray-700"
                        }
                        style={{ fontSize: "12px", fontWeight: 700 }}
                      >
                        موجل ⏳
                      </p>
                      <p className="text-gray-400" style={{ fontSize: "10px" }}>
                        تأجيل مؤقت
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("status", "ineligible")}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.status === "ineligible" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-200"}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${form.status === "ineligible" ? "bg-red-500" : "bg-gray-100"}`}
                    >
                      <UserX
                        className={`w-4 h-4 ${form.status === "ineligible" ? "text-white" : "text-gray-400"}`}
                      />
                    </div>
                    <div className="text-right">
                      <p
                        className={
                          form.status === "ineligible"
                            ? "text-red-700"
                            : "text-gray-700"
                        }
                        style={{ fontSize: "12px", fontWeight: 700 }}
                      >
                        غير مؤهل ❌
                      </p>
                      <p className="text-gray-400" style={{ fontSize: "10px" }}>
                        لا يمكنه التبرع
                      </p>
                    </div>
                  </button>
                </div>

                {/* Deferred details */}
                {form.status === "deferred" && (
                  <div className="mt-3 space-y-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                    <div>
                      <label
                        className="block text-orange-700 mb-1.5 flex items-center gap-1"
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> سبب التأجيل{" "}
                        <span style={{ fontWeight: 400 }}>(اختياري)</span>
                      </label>
                      <textarea
                        {...register("rejectionReason")}
                        placeholder="اذكر سبب تأجيل التبرع..."
                        rows={2}
                        className="w-full px-3 py-2.5 border border-orange-200 rounded-xl bg-white text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
                        style={{ fontSize: "13px" }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-orange-700 mb-1.5 flex items-center gap-1"
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      >
                        <Clock className="w-3.5 h-3.5" /> موجل حتى{" "}
                        <span style={{ fontWeight: 400 }}>اختياري</span>
                      </label>
                      <input
                        type="date"
                        {...register("deferredUntil")}
                        className="w-full px-3 py-2.5 border border-orange-200 rounded-xl bg-white text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        style={{ fontSize: "13px" }}
                        dir="ltr"
                      />
                    </div>
                  </div>
                )}

                {/* Rejection details — shows when ineligible */}
                {form.status === "ineligible" && (
                  <div className="mt-3 space-y-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <div>
                      <label
                        className="block text-red-700 mb-1.5 flex items-center gap-1"
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> سبب ال��فض{" "}
                        <span style={{ fontWeight: 400 }}>(اختياري)</span>
                      </label>
                      <textarea
                        {...register("rejectionReason")}
                        placeholder="اذكر سبب رفض التبرع..."
                        rows={2}
                        className="w-full px-3 py-2.5 border border-red-200 rounded-xl bg-white text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
                        style={{ fontSize: "13px" }}
                      />
                      {errors.rejectionReason?.message && (
                        <p
                          className="text-red-500 mt-1"
                          style={{ fontSize: "11px" }}
                        >
                          {errors.rejectionReason.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className="block text-red-700 mb-1.5 flex items-center gap-1"
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      >
                        <CalendarDays className="w-3.5 h-3.5" /> محظور حتى
                        (LockoutUntil){" "}
                        <span style={{ fontWeight: 400 }}>اختياري</span>
                      </label>
                      <input
                        type="date"
                        {...register("lockoutUntil")}
                        className="w-full px-3 py-2.5 border border-red-200 rounded-xl bg-white text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        style={{ fontSize: "13px" }}
                        dir="ltr"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2 navigation */}
              <div className="border-t border-gray-100 pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  <ChevronRight className="w-5 h-5" /> رجوع
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-sm disabled:opacity-70"
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  {submitting ? (
                    <>
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="w-5 h-5 animate-spin"
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
                        جارٍ الحفظ...
                      </span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" /> تسجيل المتبرع
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/doctor/donors")}
            className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
            style={{ fontSize: "14px", fontWeight: 600 }}
          >
            إلغاء
          </button>
        </div>
      </form>
    </Form>
  );
}
