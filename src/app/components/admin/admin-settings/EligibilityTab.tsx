import { useState, useEffect } from 'react';
import { Save, Check, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useEligibilitySettings, useUpdateEligibilitySettings } from '../../../hooks/useDonors';
import type { EligibilitySettings } from '../../../types/donor';

export default function EligibilityTab() {
  const { data: settings, isLoading, isError, refetch } = useEligibilitySettings();
  const updateMutation = useUpdateEligibilitySettings();

  const [wholeBloodMaleDays, setWholeBloodMaleDays] = useState(90);
  const [wholeBloodFemaleDays, setWholeBloodFemaleDays] = useState(120);
  const [plasmaDays, setPlasmaDays] = useState(28);
  const [plateletsDays, setPlateletsDays] = useState(7);
  const [defaultScreeningLockoutDays, setDefaultScreeningLockoutDays] = useState(7);

  const [initialValues, setInitialValues] = useState<EligibilitySettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Sync state when data is loaded
  useEffect(() => {
    if (settings) {
      setWholeBloodMaleDays(settings.wholeBloodMaleDays);
      setWholeBloodFemaleDays(settings.wholeBloodFemaleDays);
      setPlasmaDays(settings.plasmaDays);
      setPlateletsDays(settings.plateletsDays);
      setDefaultScreeningLockoutDays(settings.defaultScreeningLockoutDays);
      setInitialValues(settings);
      setValidationErrors({});
    }
  }, [settings]);

  // Track unsaved changes
  const hasUnsavedChanges = initialValues
    ? wholeBloodMaleDays !== initialValues.wholeBloodMaleDays ||
      wholeBloodFemaleDays !== initialValues.wholeBloodFemaleDays ||
      plasmaDays !== initialValues.plasmaDays ||
      plateletsDays !== initialValues.plateletsDays ||
      defaultScreeningLockoutDays !== initialValues.defaultScreeningLockoutDays
    : false;

  // Retrieve field-specific error message case-insensitively
  const getFieldError = (fieldKey: string): string | null => {
    if (validationErrors[fieldKey] && validationErrors[fieldKey].length > 0) {
      return validationErrors[fieldKey][0];
    }
    const searchKey = fieldKey.toLowerCase();
    const foundEntry = Object.entries(validationErrors).find(
      ([k]) => k.toLowerCase() === searchKey
    );
    if (foundEntry && foundEntry[1] && foundEntry[1].length > 0) {
      return foundEntry[1][0];
    }
    return null;
  };

  // Client-side validation
  const validateFields = (): boolean => {
    const errors: Record<string, string[]> = {};
    
    const validateField = (key: string, label: string, val: number) => {
      if (val === undefined || val === null || isNaN(val) || String(val).trim() === '') {
        errors[key] = [`حقل ${label} مطلوب ويجب أن يكون رقماً`];
      } else if (val <= 0) {
        errors[key] = [`فترة ${label} يجب أن تكون أكبر من الصفر`];
      } else if (!Number.isInteger(val)) {
        errors[key] = [`فترة ${label} يجب أن تكون رقماً صحيحاً`];
      } else if (val > 365) {
        errors[key] = [`فترة ${label} يجب أن لا تتجاوز 365 يوماً`];
      }
    };

    validateField('wholeBloodMaleDays', 'انتظار الذكور', wholeBloodMaleDays);
    validateField('wholeBloodFemaleDays', 'انتظار الإناث', wholeBloodFemaleDays);
    validateField('plasmaDays', 'انتظار البلازما', plasmaDays);
    validateField('plateletsDays', 'انتظار الصفائح الدموية', plateletsDays);
    validateField('defaultScreeningLockoutDays', 'الاستبعاد المؤقت التلقائية', defaultScreeningLockoutDays);

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    setValidationErrors({});
    if (!validateFields()) {
      toast.error('يرجى التحقق من صحة البيانات المدخلة');
      return;
    }

    const payload: EligibilitySettings = {
      wholeBloodMaleDays,
      wholeBloodFemaleDays,
      plasmaDays,
      plateletsDays,
      defaultScreeningLockoutDays,
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('تم حفظ التغييرات بنجاح');
        setSaved(true);
        setInitialValues(payload);
        setValidationErrors({});
        setTimeout(() => setSaved(false), 2500);
      },
      onError: (err: any) => {
        if (err.data && err.data.errors && typeof err.data.errors === 'object') {
          setValidationErrors(err.data.errors);
          toast.error('فشل الحفظ، يرجى مراجعة الأخطاء الموضحة أدناه');
        } else {
          toast.error(err.message || 'تعذر تحديث الإعدادات. يرجى المحاولة لاحقاً');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-2" />
        <span className="text-muted-foreground text-sm">جاري تحميل إعدادات مؤهلية التبرع...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
        <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
        <p className="text-destructive mb-4 text-sm font-semibold">
          تعذر تحميل إعدادات مؤهلية التبرع. يرجى التحقق من اتصال الخادم.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl bg-card hover:bg-muted/40 text-foreground transition-all text-xs font-bold"
        >
          <RefreshCw className="w-4 h-4" /> إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-foreground text-lg font-bold">إعدادات فترات مؤهلية التبرع</h2>
          <p className="text-muted-foreground text-xs mt-1">
            تحديد فترات الانتظار الآمنة (بالأيام) بين عمليات التبرع وفترات الاستبعاد المؤقت في حال عدم مطابقة الشروط.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending || !hasUnsavedChanges}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all text-sm font-semibold select-none ${
            !hasUnsavedChanges
              ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
              : saved
              ? 'bg-green-500'
              : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-sm'
          }`}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...
            </>
          ) : saved ? (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Field 1: Male Cooldown */}
        <div>
          <label className="block text-foreground text-xs font-semibold mb-1.5">
            فترة انتظار الذكور (أيام)
          </label>
          <input
            type="number"
            min={1}
            max={365}
            disabled={updateMutation.isPending}
            value={wholeBloodMaleDays}
            onChange={(e) => setWholeBloodMaleDays(Number(e.target.value))}
            className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none text-sm transition-all focus:ring-2 focus:ring-green-100 ${
              getFieldError('wholeBloodMaleDays') ? 'border-destructive focus:border-destructive' : 'border-border focus:border-green-400'
            }`}
          />
          {getFieldError('wholeBloodMaleDays') && (
            <p className="text-destructive text-xs mt-1 font-medium">{getFieldError('wholeBloodMaleDays')}</p>
          )}
        </div>

        {/* Field 2: Female Cooldown */}
        <div>
          <label className="block text-foreground text-xs font-semibold mb-1.5">
            فترة انتظار الإناث (أيام)
          </label>
          <input
            type="number"
            min={1}
            max={365}
            disabled={updateMutation.isPending}
            value={wholeBloodFemaleDays}
            onChange={(e) => setWholeBloodFemaleDays(Number(e.target.value))}
            className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none text-sm transition-all focus:ring-2 focus:ring-green-100 ${
              getFieldError('wholeBloodFemaleDays') ? 'border-destructive focus:border-destructive' : 'border-border focus:border-green-400'
            }`}
          />
          {getFieldError('wholeBloodFemaleDays') && (
            <p className="text-destructive text-xs mt-1 font-medium">{getFieldError('wholeBloodFemaleDays')}</p>
          )}
        </div>

        {/* Field 3: Plasma Cooldown */}
        <div>
          <label className="block text-foreground text-xs font-semibold mb-1.5">
            فترة انتظار البلازما (أيام)
          </label>
          <input
            type="number"
            min={1}
            max={365}
            disabled={updateMutation.isPending}
            value={plasmaDays}
            onChange={(e) => setPlasmaDays(Number(e.target.value))}
            className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none text-sm transition-all focus:ring-2 focus:ring-green-100 ${
              getFieldError('plasmaDays') ? 'border-destructive focus:border-destructive' : 'border-border focus:border-green-400'
            }`}
          />
          {getFieldError('plasmaDays') && (
            <p className="text-destructive text-xs mt-1 font-medium">{getFieldError('plasmaDays')}</p>
          )}
        </div>

        {/* Field 4: Platelets Cooldown */}
        <div>
          <label className="block text-foreground text-xs font-semibold mb-1.5">
            فترة انتظار الصفائح الدموية (أيام)
          </label>
          <input
            type="number"
            min={1}
            max={365}
            disabled={updateMutation.isPending}
            value={plateletsDays}
            onChange={(e) => setPlateletsDays(Number(e.target.value))}
            className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none text-sm transition-all focus:ring-2 focus:ring-green-100 ${
              getFieldError('plateletsDays') ? 'border-destructive focus:border-destructive' : 'border-border focus:border-green-400'
            }`}
          />
          {getFieldError('plateletsDays') && (
            <p className="text-destructive text-xs mt-1 font-medium">{getFieldError('plateletsDays')}</p>
          )}
        </div>

        {/* Field 5: Screening Lockout */}
        <div>
          <label className="block text-foreground text-xs font-semibold mb-1.5">
            فترة الاستبعاد المؤقت التلقائية (أيام)
          </label>
          <input
            type="number"
            min={1}
            max={365}
            disabled={updateMutation.isPending}
            value={defaultScreeningLockoutDays}
            onChange={(e) => setDefaultScreeningLockoutDays(Number(e.target.value))}
            className={`w-full px-4 py-2.5 border rounded-xl bg-muted/40 text-foreground outline-none text-sm transition-all focus:ring-2 focus:ring-green-100 ${
              getFieldError('defaultScreeningLockoutDays') ? 'border-destructive focus:border-destructive' : 'border-border focus:border-green-400'
            }`}
          />
          {getFieldError('defaultScreeningLockoutDays') && (
            <p className="text-destructive text-xs mt-1 font-medium">{getFieldError('defaultScreeningLockoutDays')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
