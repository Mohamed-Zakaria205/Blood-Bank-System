import { useEffect, useState } from "react";
import {
  UserPlus,
  Search,
  Trash2,
  Copy,
  Check,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  FlaskConical,
  Stethoscope,
  Phone,
  MapPin,
  CreditCard,
  User as UserIcon,
  Mail,
  Package,
} from "lucide-react";
import { CITIES } from "../../constants";
import { useStaff, useCreateStaff, useDeleteStaff } from "../../hooks/useStaff";
import { ErrorState, CardSkeleton, TableSkeleton } from "../shared/LoadingSkeleton";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type StaffRole = "doctor" | "lab" | "inventory";

const roleConfig: Record<
  StaffRole,
  {
    label: string;
    badge: string;
    prefix: string;
    color: string;
    borderColor: string;
    bgColor: string;
    icon: any;
  }
> = {
  doctor: {
    label: "طبيب",
    badge: "bg-teal-100 text-teal-700",
    prefix: "dr",
    color: "text-teal-700",
    borderColor: "border-teal-200",
    bgColor: "bg-teal-50",
    icon: Stethoscope,
  },
  lab: {
    label: "دكتور تحاليل",
    badge: "bg-green-100 text-green-700",
    prefix: "lab",
    color: "text-green-700",
    borderColor: "border-green-200",
    bgColor: "bg-green-50",
    icon: FlaskConical,
  },
  inventory: {
    label: "أمين مخزن",
    badge: "bg-blue-100 text-blue-700",
    prefix: "inv",
    color: "text-blue-700",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
    icon: Package,
  },
};

const staffSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "أدخل الاسم الثلاثي على الأقل")
    .refine(
      (value) => value.split(/\s+/).filter(Boolean).length >= 2,
      "أدخل الاسم الثلاثي على الأقل",
    ),
  nationalId: z.string().regex(/^\d{14}$/, "رقم الهوية يجب أن يكون 14 رقماً"),
  phone: z.string().min(11, "رقم الهاتف يجب أن يكون 11 رقماً على الأقل"),
  address: z.string().trim().min(1, "أدخل العنوان"),
  city: z.string(),
  email: z.string().trim().email("أدخل بريداً إلكترونياً صحيحاً"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
  role: z.enum(["doctor", "lab", "inventory"]),
});

type StaffForm = z.infer<typeof staffSchema>;

const initialForm: StaffForm = {
  fullName: "",
  nationalId: "",
  phone: "",
  address: "",
  city: "بني سويف",
  email: "",
  password: "",
  role: "doctor",
};

export default function AdminStaff() {
  const { data: staffData = [], isLoading, isError } = useStaff();
  const createStaff = useCreateStaff();
  const deleteStaff = useDeleteStaff();

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const formMethods = useForm<StaffForm>({
    defaultValues: initialForm,
    mode: "onTouched",
    resolver: zodResolver(staffSchema),
  });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = formMethods;
  const roleValue = watch("role");

  useEffect(() => {
    register("role");
  }, [register]);

  const staff = staffData.filter((u) => u.role !== "admin");

  const filtered = staff.filter((u) => {
    const matchSearch =
      u.name.includes(search) ||
      u.email.includes(search) ||
      (u.phone || "").includes(search);
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const addStaff = handleSubmit(async (values) => {
    try {
      await createStaff.mutateAsync({
        name: values.fullName.trim(),
        email: values.email,
        password: values.password,
        role: values.role as any,
        nationalId: values.nationalId,
        phone: values.phone,
        address: values.address,
        city: values.city,
      });
      setShowModal(false);
      reset(initialForm);
    } catch (err) {
      console.error(err);
    }
  });

  const deleteUser = async (id: string) => {
    try {
      await deleteStaff.mutateAsync(id);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email).catch(() => {});
    setCopied(email);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading)
    return <PageLoader message="جارٍ تحميل بيانات الكوادر الطبية..." />;
  if (isError)
    return (
      <ErrorState
        message="فشل تحميل الكوادر الطبية"
        onRetry={() => window.location.reload()}
      />
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-gray-900"
            style={{ fontSize: "22px", fontWeight: 800 }}
          >
            إدارة الكوادر الطبية
          </h1>
          <p className="text-gray-500" style={{ fontSize: "14px" }}>
            {staff.length} حساب مسجل في النظام
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-sm"
          style={{ fontSize: "14px", fontWeight: 700 }}
        >
          <UserPlus className="w-5 h-5" /> إضافة كادر طبي جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "إجمالي الكوادر",
            count: staff.length,
            color: "text-gray-900",
            bg: "bg-gray-50",
            onClick: () => setFilterRole(""),
          },
          {
            label: "أطباء",
            count: staff.filter((u) => u.role === "doctor").length,
            color: "text-teal-700",
            bg: "bg-teal-50",
            onClick: () => setFilterRole("doctor"),
          },
          {
            label: "دكاترة تحاليل",
            count: staff.filter((u) => u.role === "lab").length,
            color: "text-green-700",
            bg: "bg-green-50",
            onClick: () => setFilterRole("lab"),
          },
          {
            label: "أميناء المخازن",
            count: staff.filter((u) => u.role === "inventory").length,
            color: "text-blue-700",
            bg: "bg-blue-50",
            onClick: () => setFilterRole("inventory"),
          },
        ].map((s, i) => (
          <button
            key={i}
            onClick={s.onClick}
            className={`${s.bg} rounded-xl p-4 text-center hover:opacity-80 transition-opacity`}
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

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو البريد أو الهاتف..."
              className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
              style={{ fontSize: "13px" }}
            />
          </div>
          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: "13px" }}
            >
              <option value="">كل الأدوار</option>
              <option value="doctor">طبيب</option>
              <option value="lab">دكتور تحاليل</option>
              <option value="inventory">أمين مخزن</option>
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
              <option value="active">نشط</option>
              <option value="inactive">معطل</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <span className="text-gray-500" style={{ fontSize: "13px" }}>
            {filtered.length} نتيجة
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "الاسم والدور",
                  "رقم الهوية",
                  "الهاتف",
                  "البريد الإلكتروني",
                  "العنوان",
                  "تاريخ الإضافة",
                  "الحالة",
                  "إجراءات",
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
              {filtered.map((u) => {
                const cfg =
                  roleConfig[u.role as StaffRole] || roleConfig.doctor;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${cfg.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}
                        >
                          <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div>
                          <p
                            className="text-gray-900"
                            style={{ fontSize: "13px", fontWeight: 600 }}
                          >
                            {u.name}
                          </p>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full ${cfg.badge}`}
                            style={{ fontSize: "10px", fontWeight: 700 }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="text-gray-600 font-mono"
                        style={{ fontSize: "12px" }}
                      >
                        {u.nationalId || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="text-gray-600 font-mono"
                        style={{ fontSize: "12px" }}
                      >
                        {u.phone || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-gray-600 font-mono"
                          style={{ fontSize: "11px" }}
                        >
                          {u.email}
                        </span>
                        <button
                          onClick={() => copyEmail(u.email)}
                          className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        >
                          {copied === u.email ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="text-gray-500"
                        style={{ fontSize: "12px" }}
                      >
                        {u.address || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="text-gray-400"
                        style={{ fontSize: "12px" }}
                      >
                        {u.createdAt}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        style={{ fontSize: "11px", fontWeight: 700 }}
                      >
                        {u.status === "active" ? "نشط" : "معطل"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setDeleteId(u.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-gray-400"
                    style={{ fontSize: "14px" }}
                  >
                    لا توجد نتائج
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h3
                  className="text-gray-900"
                  style={{ fontSize: "18px", fontWeight: 700 }}
                >
                  إضافة كادر طبي جديد
                </h3>
                <p
                  className="text-gray-500 mt-0.5"
                  style={{ fontSize: "13px" }}
                >
                  أدخل جميع البيانات المطلوبة
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Form {...formMethods}>
              <form onSubmit={addStaff} className="p-6 space-y-5">
                {/* Role Selector */}
                <div>
                  <label
                    className="block text-gray-700 mb-2"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    نوع الحساب *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["doctor", "lab", "inventory"] as StaffRole[]).map(
                      (r) => {
                        const cfg = roleConfig[r];
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() =>
                              setValue("role", r, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${roleValue === r ? `${cfg.borderColor} ${cfg.bgColor}` : "border-gray-200 bg-white hover:border-gray-300"}`}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${roleValue === r ? cfg.bgColor : "bg-gray-100"}`}
                            >
                              <cfg.icon
                                className={`w-5 h-5 ${roleValue === r ? cfg.color : "text-gray-400"}`}
                              />
                            </div>
                            <div className="text-right">
                              <p
                                className={
                                  roleValue === r ? cfg.color : "text-gray-600"
                                }
                                style={{ fontSize: "14px", fontWeight: 700 }}
                              >
                                {cfg.label}
                              </p>
                            </div>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Personal Info Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <UserIcon className="w-4 h-4 text-green-600" />
                    <span
                      className="text-gray-700"
                      style={{ fontSize: "13px", fontWeight: 700 }}
                    >
                      البيانات الشخصية
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label
                        className="block text-gray-700 mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        الاسم الكامل *
                      </label>
                      <input
                        type="text"
                        {...register("fullName")}
                        placeholder="مثال: د. أحمد محمد عبد الله"
                        className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.fullName ? "border-red-300" : "border-gray-200"}`}
                        style={{ fontSize: "13px" }}
                      />
                      {errors.fullName?.message && (
                        <p
                          className="text-red-500 mt-1"
                          style={{ fontSize: "11px" }}
                        >
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    {/* National ID */}
                    <div>
                      <label
                        className="block text-gray-700 mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        <CreditCard className="w-3.5 h-3.5 inline ml-1 text-green-600" />
                        رقم الهوية الوطنية *
                      </label>
                      <input
                        type="text"
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
                        className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.nationalId ? "border-red-300" : "border-gray-200"}`}
                        style={{ fontSize: "13px" }}
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

                    {/* Phone */}
                    <div>
                      <label
                        className="block text-gray-700 mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        <Phone className="w-3.5 h-3.5 inline ml-1 text-green-600" />
                        رقم الهاتف *
                      </label>
                      <input
                        type="tel"
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
                        className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.phone ? "border-red-300" : "border-gray-200"}`}
                        style={{ fontSize: "13px" }}
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

                    {/* Address */}
                    <div>
                      <label
                        className="block text-gray-700 mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        <MapPin className="w-3.5 h-3.5 inline ml-1 text-green-600" />
                        العنوان *
                      </label>
                      <input
                        type="text"
                        {...register("address")}
                        placeholder="شارع، حي، رقم..."
                        className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.address ? "border-red-300" : "border-gray-200"}`}
                        style={{ fontSize: "13px" }}
                      />
                      {errors.address?.message && (
                        <p
                          className="text-red-500 mt-1"
                          style={{ fontSize: "11px" }}
                        >
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label
                        className="block text-gray-700 mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        المدينة
                      </label>
                      <select
                        {...register("city")}
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
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Account Info Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-green-600" />
                    <span
                      className="text-gray-700"
                      style={{ fontSize: "13px", fontWeight: 700 }}
                    >
                      بيانات الحساب
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label
                        className="block text-gray-700 mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        البريد الإلكتروني *
                      </label>
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="example@bloodlink.benisuef.eg"
                        className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${errors.email ? "border-red-300" : "border-gray-200"}`}
                        style={{ fontSize: "13px" }}
                        dir="ltr"
                      />
                      {errors.email?.message && (
                        <p
                          className="text-red-500 mt-1"
                          style={{ fontSize: "11px" }}
                        >
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label
                        className="block text-gray-700 mb-1.5"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        كلمة المرور *
                      </label>
                      <div className="relative">
                        <input
                          type={showPass ? "text" : "password"}
                          {...register("password")}
                          placeholder="6 أحرف على الأقل"
                          className={`w-full px-4 pl-10 py-2.5 border rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 ${errors.password ? "border-red-300" : "border-gray-200"}`}
                          style={{ fontSize: "13px" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.password?.message && (
                        <p
                          className="text-red-500 mt-1"
                          style={{ fontSize: "11px" }}
                        >
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      reset(initialForm);
                    }}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
                    style={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-sm"
                    style={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    <UserPlus className="w-4 h-4" /> إضافة الحساب
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3
              className="text-gray-900 mb-2"
              style={{ fontSize: "18px", fontWeight: 700 }}
            >
              حذف الحساب
            </h3>
            <p className="text-gray-500 mb-6" style={{ fontSize: "14px" }}>
              هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                إلغاء
              </button>
              <button
                onClick={() => deleteUser(deleteId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
