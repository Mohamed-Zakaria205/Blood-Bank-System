import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Droplet,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  ShieldCheck,
  Stethoscope,
  FlaskConical,
  Package,
  Activity,
  Users,
  TestTube2,
  Shield,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "يرجى إدخال البريد الإلكتروني")
    .email("يرجى إدخال بريد إلكتروني صحيح"),
  password: z.string().min(1, "يرجى إدخال كلمة المرور"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/* ─── Demo accounts ─────────────────────────────────────────── */
const demoAccounts = [
  {
    role: "admin" as const,
    label: "المدير العام",
    desc: "إدارة النظام والتقارير",
    sublabel: "admin123",
    email: "admin@bloodlink.benisuef.eg",
    password: "admin123",
    icon: ShieldCheck,
    accent: "#15803d",
    light: "#f0fdf4",
    border: "#bbf7d0",
    textColor: "#15803d",
  },
  {
    role: "doctor" as const,
    label: "الطبيب",
    desc: "تسجيل المتبرعين والحملات",
    sublabel: "doctor123",
    email: "dr.ahmed.hassan@bloodlink.benisuef.eg",
    password: "doctor123",
    icon: Stethoscope,
    accent: "#0369a1",
    light: "#f0f9ff",
    border: "#bae6fd",
    textColor: "#0369a1",
  },
  {
    role: "lab" as const,
    label: "طبيب التحاليل",
    desc: "فحص العينات وإدخال النتائج",
    sublabel: "lab123",
    email: "lab.yasmin.hossam@bloodlink.benisuef.eg",
    password: "lab123",
    icon: FlaskConical,
    accent: "#7c3aed",
    light: "#faf5ff",
    border: "#ddd6fe",
    textColor: "#7c3aed",
  },
  {
    role: "inventory" as const,
    label: "أمين المخزون",
    desc: "إدارة حقائب الدم والمخزون",
    sublabel: "inventory123",
    email: "inv.nadia.fathi@bloodlink.benisuef.eg",
    password: "inventory123",
    icon: Package,
    accent: "#b45309",
    light: "#fffbeb",
    border: "#fde68a",
    textColor: "#b45309",
  },
];

/* ─── System stats ──────────────────────────────────────────── */
const stats = [
  { icon: Activity, value: "190+", label: "وحدة دم متاحة" },
  { icon: Users, value: "10", label: "متبرع نشط" },
  { icon: TestTube2, value: "4", label: "فحوصات معيارية" },
  { icon: Shield, value: "4", label: "أدوار النظام" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<(typeof demoAccounts)[0] | null>(
    null,
  );

  const formMethods = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
    resolver: zodResolver(loginSchema),
  });
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = formMethods;

  /* redirect if already logged in */
  useEffect(() => {
    if (!user) return;
    const dest =
      user.role === "admin"
        ? "/admin"
        : user.role === "lab"
          ? "/lab"
          : user.role === "inventory"
            ? "/inventory"
            : "/doctor";
    navigate(dest, { replace: true });
  }, [user, navigate]);

  /* fill demo account */
  const fillDemo = (acc: (typeof demoAccounts)[0]) => {
    setValue("email", acc.email, { shouldDirty: true });
    setValue("password", acc.password, { shouldDirty: true });
    setActiveRole(acc);
    setAuthError("");
    clearErrors();
  };

  /* submit */
  const onSubmit = handleSubmit(async (values) => {
    setAuthError("");
    setLoading(true);
    const result = await login(values.email.trim(), values.password);
    setLoading(false);
    if (result.success) {
      const u = JSON.parse(localStorage.getItem("bloodlink_user") || "{}");
      const dest =
        u.role === "admin"
          ? "/admin"
          : u.role === "lab"
            ? "/lab"
            : u.role === "inventory"
              ? "/inventory"
              : "/doctor";
      navigate(dest, { replace: true });
    } else {
      setAuthError(
        result.error || "بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً",
      );
    }
  });

  return (
    <div
      className="min-h-screen flex"
      dir="rtl"
      style={{
        background:
          "linear-gradient(135deg, #f8fafc 0%, #f0fdf4 50%, #f8fafc 100%)",
      }}
    >
      {/* ── Subtle background circles ────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(22,163,74,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(22,163,74,0.05) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(22,163,74,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════
          LEFT PANEL — Brand / Info
      ═══════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[44%] flex-col relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #14532d 0%, #166534 35%, #15803d 70%, #16a34a 100%)",
        }}
      >
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full border border-white/10" />
        <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full border border-white/8" />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/20"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Droplet className="w-7 h-7 text-white" />
            </div>
            <div>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-0.3px",
                }}
              >
                BloodLink
              </p>
              <p style={{ fontSize: "12px", color: "#86efac" }}>
                نظام إدارة بنك الدم
              </p>
            </div>
          </div>

          {/* Headline */}
          <div className="flex-1 flex flex-col justify-center">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 mb-5 w-fit"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              <span
                style={{ fontSize: "12px", fontWeight: 600, color: "#bbf7d0" }}
              >
                محافظة بني سويف
              </span>
            </div>

            <h2
              style={{
                fontSize: "38px",
                fontWeight: 800,
                lineHeight: "1.25",
                color: "white",
                marginBottom: "14px",
              }}
            >
              منصة طبية
              <br />
              <span style={{ color: "#86efac" }}>متكاملة للدم</span>
            </h2>
            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.7",
                color: "#bbf7d0",
                maxWidth: "360px",
                marginBottom: "36px",
              }}
            >
              نظام داخلي متكامل يربط جميع أقسام بنك الدم بكفاءة طبية عالية
            </p>

            {/* 4 Roles list */}
            <div className="space-y-2.5 mb-10">
              {demoAccounts.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "white",
                      }}
                    >
                      {label}
                    </p>
                    <p style={{ fontSize: "11px", color: "#86efac" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2">
              {stats.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="text-center p-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <Icon className="w-4 h-4 text-green-300 mx-auto mb-1" />
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "white",
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#86efac",
                      lineHeight: "1.3",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.4)",
              marginTop: "24px",
            }}
          >
            BloodLink © 2025 — محافظة بني سويف
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          RIGHT PANEL — Login Form
      ═══════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-5 lg:p-10">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md"
              style={{
                background: "linear-gradient(135deg, #15803d, #22c55e)",
              }}
            >
              <Droplet className="w-8 h-8 text-white" />
            </div>
            <p style={{ fontSize: "26px", fontWeight: 800, color: "#111827" }}>
              BloodLink
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              نظام إدارة بنك الدم — بني سويف
            </p>
          </div>

          {/* Greeting */}
          <div className="mb-7">
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#111827",
                marginBottom: "6px",
              }}
            >
              مرحباً بك 👋
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              سجّل دخولك للوصول إلى لوحة التحكم
            </p>
          </div>

          {/* ── Role selection 2×2 grid ─────────────────── */}
          <div className="mb-5">
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#6b7280",
                marginBottom: "8px",
              }}
            >
              🔑 اختر دوراً للدخول السريع:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                const isActive = activeRole?.role === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className="relative text-right p-3 rounded-xl border-2 transition-all duration-200 overflow-hidden"
                    style={{
                      background: isActive ? acc.light : "#ffffff",
                      borderColor: isActive ? acc.accent : "#e5e7eb",
                      boxShadow: isActive
                        ? `0 0 0 3px ${acc.accent}15, 0 2px 8px rgba(0,0,0,0.05)`
                        : "0 1px 3px rgba(0,0,0,0.04)",
                      transform: isActive ? "translateY(-1px)" : "",
                    }}
                  >
                    {/* Top accent line */}
                    {isActive && (
                      <div
                        className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl"
                        style={{ background: acc.accent }}
                      />
                    )}

                    <div className="flex items-center gap-2.5">
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: isActive ? acc.accent : "#f3f4f6",
                          boxShadow: isActive
                            ? `0 3px 8px ${acc.accent}35`
                            : "none",
                        }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: isActive ? "white" : "#9ca3af" }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Label */}
                        <p
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: isActive ? acc.accent : "#374151",
                            marginBottom: "1px",
                          }}
                        >
                          {acc.label}
                        </p>
                        {/* Password badge */}
                        <span
                          className="inline-block px-1.5 py-0 rounded"
                          style={{
                            fontSize: "9px",
                            fontFamily: "monospace",
                            fontWeight: 700,
                            background: isActive
                              ? `${acc.accent}14`
                              : "#f3f4f6",
                            color: isActive ? acc.accent : "#9ca3af",
                            border: `1px solid ${isActive ? acc.accent + "25" : "#e5e7eb"}`,
                          }}
                        >
                          {acc.sublabel}
                        </span>
                      </div>

                      {/* Active check */}
                      {isActive && (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: acc.accent }}
                        >
                          <svg
                            className="w-2.5 h-2.5"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="white"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                whiteSpace: "nowrap",
              }}
            >
              أو أدخل بياناتك يدوياً
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── Error Alert ─────────────────────────────── */}
          {authError && (
            <div
              className="flex items-start gap-3 p-3.5 rounded-xl mb-5 border"
              style={{ background: "#fef2f2", borderColor: "#fecaca" }}
            >
              <AlertCircle
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "#ef4444" }}
              />
              <p style={{ fontSize: "13px", color: "#dc2626" }}>{authError}</p>
            </div>
          )}

          {/* ── Login Form ──────────────────────────────── */}
          <Form {...formMethods}>
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1.5"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    {...register("email", {
                      onChange: () => {
                        setActiveRole(null);
                        setAuthError("");
                        clearErrors("email");
                      },
                    })}
                    placeholder="example@bloodlink.benisuef.eg"
                    required
                    dir="ltr"
                    className="w-full pr-10 pl-4 py-3.5 rounded-xl border outline-none transition-all"
                    style={{
                      fontSize: "13px",
                      background: "#f9fafb",
                      borderColor: "#e5e7eb",
                      color: "#111827",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#16a34a";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(22,163,74,0.10)";
                      e.target.style.background = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "#f9fafb";
                    }}
                  />
                </div>
                {errors.email?.message && (
                  <p style={{ fontSize: "12px", color: "#dc2626" }}>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-1.5"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    {...register("password", {
                      onChange: () => {
                        setAuthError("");
                        setActiveRole(null);
                        clearErrors("password");
                      },
                    })}
                    placeholder="••••••••"
                    required
                    className="w-full pr-10 pl-11 py-3.5 rounded-xl border outline-none transition-all"
                    style={{
                      fontSize: "14px",
                      background: "#f9fafb",
                      borderColor: "#e5e7eb",
                      color: "#111827",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#16a34a";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(22,163,74,0.10)";
                      e.target.style.background = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "#f9fafb";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password?.message && (
                  <p style={{ fontSize: "12px", color: "#dc2626" }}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white flex items-center justify-center gap-2.5 transition-all duration-200 mt-1"
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  background: loading
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
                  boxShadow: loading
                    ? "none"
                    : "0 6px 20px rgba(22,163,74,0.28)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
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
                    جارٍ التحقق من بياناتك...
                  </>
                ) : (
                  <>
                    <Droplet className="w-5 h-5" />
                    دخول النظام
                  </>
                )}
              </button>
            </form>
          </Form>

          {/* Footer note */}
          <div
            className="mt-6 p-4 rounded-xl border border-gray-100 text-center"
            style={{ background: "rgba(255,255,255,0.8)" }}
          >
            <p style={{ fontSize: "12px", color: "#9ca3af" }}>
              🔒 النظام للاستخدام الداخلي فقط — لا يسمح بالتسجيل الذاتي
            </p>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "3px" }}>
              لإنشاء حساب جديد يُرجى التواصل مع المدير العام
            </p>
          </div>

          <p
            className="text-center mt-4"
            style={{ fontSize: "11px", color: "#d1d5db" }}
          >
            BloodLink © 2025 — محافظة بني سويف
          </p>
        </div>
      </div>
    </div>
  );
}
