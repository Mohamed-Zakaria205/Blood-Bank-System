import { useState, useEffect } from 'react';
import { Save, Check, Loader2, Info, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useWeeklyTargets, useUpdateWeeklyTargets } from '../../hooks/useTargets';
import { calculateProgressPercentage } from '../../utils/math';
import { CardSkeleton, ErrorState } from '../shared/LoadingSkeleton';
import type { BloodType } from '../../types/common';


export default function DoctorWeeklyTargets() {
  const { data, isLoading, isError, refetch } = useWeeklyTargets();
  const updateMutation = useUpdateWeeklyTargets();

  const [formValues, setFormValues] = useState<Record<BloodType, string>>({} as Record<BloodType, string>);
  const [validationErrors, setValidationErrors] = useState<Record<BloodType, string>>({} as Record<BloodType, string>);
  const [showSuccessCheck, setShowSuccessCheck] = useState(false);

  // Sync state when data is loaded/refetched
  useEffect(() => {
    if (data) {
      const initialValues = {} as Record<BloodType, string>;
      data.forEach((item) => {
        initialValues[item.bloodType] = String(item.targetCount);
      });
      setFormValues(initialValues);
      setValidationErrors({} as Record<BloodType, string>);
    }
  }, [data]);

  // Dirty State calculation comparing current inputs with the last loaded server data
  const isDirty = data
    ? data.some((item) => formValues[item.bloodType] !== String(item.targetCount))
    : false;

  const validateField = (rawVal: string): string | null => {
    if (rawVal === undefined || rawVal === null || rawVal.trim() === '') {
      return 'مطلوب';
    }
    const trimmed = rawVal.trim();
    if (!/^\d+$/.test(trimmed)) {
      return 'رقم صحيح غير سالب فقط';
    }
    const val = Number(trimmed);
    if (val < 0) {
      return 'يجب أن يكون 0 أو أكثر';
    }
    return null;
  };

  const handleInputChange = (bloodType: BloodType, value: string) => {
    setFormValues((prev) => ({ ...prev, [bloodType]: value }));
    const err = validateField(value);
    setValidationErrors((prev) => ({
      ...prev,
      [bloodType]: err ? err : '',
    }));
  };

  const handleSave = () => {
    if (updateMutation.isPending || !data) return;

    // Validate all fields
    const errors = {} as Record<BloodType, string>;
    let hasErrors = false;
    data.forEach((item) => {
      const bt = item.bloodType;
      const rawVal = formValues[bt] || '';
      const err = validateField(rawVal);
      if (err) {
        errors[bt] = err;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setValidationErrors(errors);
      toast.error('يرجى التحقق من صحة الأهداف المدخلة');
      return;
    }

    // Map payload
    const payload = data.map((item) => ({
      bloodType: item.bloodType,
      targetCount: Number(formValues[item.bloodType]),
    }));

    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('تم حفظ الأهداف الأسبوعية بنجاح');
        setShowSuccessCheck(true);
        setTimeout(() => setShowSuccessCheck(false), 2000);
      },
      onError: (err: any) => {
        toast.error(err.message || 'فشل تحديث الأهداف الأسبوعية');
      },
    });
  };

  const hasValidationErrors = Object.values(validationErrors).some((err) => !!err);
  const isSaveDisabled = !isDirty || hasValidationErrors || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Shimmer */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-72 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
        <CardSkeleton count={8} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            أهداف الفرع الرئيسي
          </h1>
        </div>
        <ErrorState message="تعذر تحميل أهداف فصائل الدم الأسبوعية. يرجى التحقق من اتصال الخادم." onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 800 }}>
            أهداف الفرع الرئيسي
          </h1>
          <p className="text-muted-foreground mt-0.5" style={{ fontSize: '14px' }}>
            إدارة ومتابعة أهداف التبرع الأسبوعية لفصائل الدم المختلفة بالفرع الرئيسي
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaveDisabled}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all text-sm font-semibold select-none shadow-sm ${
            isSaveDisabled
              ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border shadow-none'
              : showSuccessCheck
              ? 'bg-green-500'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
          }`}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...
            </>
          ) : showSuccessCheck ? (
            <>
              <Check className="w-4 h-4" /> تم الحفظ
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> حفظ التغييرات
            </>
          )}
        </button>
      </div>

      {/* Grid of Targets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.map((item) => {
          const bt = item.bloodType;
          const current = item.currentDonationsCount ?? 0;
          const target = Number(formValues[bt] || 0);
          const pct = calculateProgressPercentage(current, target);
          const errorMsg = validationErrors[bt];

          return (
            <div
              key={bt}
              className="bg-card rounded-2xl p-5 border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-extrabold text-green-700 bg-green-50 px-3.5 py-1 rounded-xl">
                  {bt}
                </span>
                <span className="text-xs text-muted-foreground font-medium">الهدف الأسبوعي</span>
              </div>

              {/* Progress info */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                  <span>التقدم الحالي: {current} / {target || 0} كيس</span>
                  <span className="text-green-600">{pct}% مكتمل</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Input for target count */}
              <div className="mt-2">
                <label htmlFor={`target-${bt}`} className="sr-only">
                  الهدف لفصيلة {bt}
                </label>
                <input
                  id={`target-${bt}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formValues[bt] ?? ''}
                  onChange={(e) => handleInputChange(bt, e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl bg-muted/40 text-foreground outline-none text-sm transition-all focus:ring-2 focus:ring-green-100 font-semibold ${
                    errorMsg ? 'border-destructive focus:border-destructive' : 'border-border focus:border-green-400'
                  }`}
                />
                {errorMsg && (
                  <p className="text-destructive text-xs mt-1 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {errorMsg}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Date Cooldown Notice Card */}
      <div className="bg-muted/40 rounded-2xl p-5 border border-border flex items-start gap-4">
        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-foreground text-sm font-bold">تنويه حول احتساب التقدم الأسبوعي</h4>
          <p className="text-muted-foreground text-xs leading-relaxed">
            يتم احتساب التقدم المحرز في التبرعات بشكل أسبوعي تلقائياً بدءاً من يوم <strong>السبت</strong> وحتى يوم <strong>الجمعة</strong>. في تمام الساعة <strong>12:00 منتصف الليل بين الجمعة والسبت بالتوقيت المحلي</strong>، يتم تدوير الفترة تلقائياً وتصفير أعداد الأكياس التي تم جمعها لبدء أسبوع جديد.
          </p>
        </div>
      </div>
    </div>
  );
}
