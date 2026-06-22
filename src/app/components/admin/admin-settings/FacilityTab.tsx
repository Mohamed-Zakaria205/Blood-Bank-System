import { useState, useEffect } from 'react';
import { Save, Check, Loader2, RefreshCw, Plus, Trash2, Edit, X, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useMainBranchSettings, useUpdateMainBranchSettings } from '../../../hooks/useMainBranchSettings';
import type { MainBranchSettings, Exclusion, UpdateMainBranchSettingsRequest } from '../../../types/donationCenter';

const DAYS_OF_WEEK_NAMES = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

interface ExclusionModalState {
  isOpen: boolean;
  exclusionIndex: number | null; // index of edited exclusion, or null if creating new
  date: string;
  isClosed: boolean;
  specialOpeningTime: string;
  specialClosingTime: string;
  reason: string;
}

const initialModalState: ExclusionModalState = {
  isOpen: false,
  exclusionIndex: null,
  date: '',
  isClosed: true,
  specialOpeningTime: '',
  specialClosingTime: '',
  reason: '',
};

export default function FacilityTab() {
  const { data: settings, isLoading, isError, refetch } = useMainBranchSettings();
  const updateMutation = useUpdateMainBranchSettings();

  const [formState, setFormState] = useState<MainBranchSettings | null>(null);
  const [initialState, setInitialState] = useState<MainBranchSettings | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'weekly' | 'exclusions'>('info');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modal State for Holidays & Exceptions
  const [modalState, setModalState] = useState<ExclusionModalState>(initialModalState);

  // Sync state when data is loaded
  useEffect(() => {
    if (settings) {
      const clone = JSON.parse(JSON.stringify(settings));
      setFormState(clone);
      setInitialState(clone);
    }
  }, [settings]);

  // Determine if there are unsaved changes
  const hasUnsavedChanges = formState && initialState
    ? JSON.stringify(formState) !== JSON.stringify(initialState)
    : false;

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
        <span className="text-muted-foreground text-sm">جاري تحميل إعدادات الفرع الرئيسي...</span>
      </div>
    );
  }

  if (isError || !formState) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-destructive font-semibold mb-4 text-sm">
          تعذر تحميل إعدادات الفرع الرئيسي. يرجى التحقق من اتصال الشبكة.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl bg-card hover:bg-muted/40 text-foreground transition-all text-sm font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> إعادة المحاولة
        </button>
      </div>
    );
  }

  // Handle donation type checkboxes
  const handleDonationTypeChange = (type: string, checked: boolean) => {
    if (!formState) return;
    let updatedTypes = [...formState.supportedDonationTypes];
    if (checked) {
      if (!updatedTypes.includes(type)) {
        updatedTypes.push(type);
      }
    } else {
      updatedTypes = updatedTypes.filter((t) => t !== type);
    }
    setFormState({ ...formState, supportedDonationTypes: updatedTypes });
  };

  // Open exception modal
  const openModal = (index: number | null = null) => {
    if (index !== null) {
      const ex = formState.exclusions[index];
      setModalState({
        isOpen: true,
        exclusionIndex: index,
        date: ex.date,
        isClosed: ex.isClosed,
        specialOpeningTime: ex.specialOpeningTime || '',
        specialClosingTime: ex.specialClosingTime || '',
        reason: ex.reason,
      });
    } else {
      // Default to today's date in YYYY-MM-DD
      const todayStr = new Date().toISOString().split('T')[0];
      setModalState({
        ...initialModalState,
        isOpen: true,
        date: todayStr,
      });
    }
  };

  const closeModal = () => {
    setModalState(initialModalState);
  };

  // Save exception from modal
  const handleSaveExclusion = () => {
    if (!modalState.date) {
      toast.error('التاريخ مطلوب');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (modalState.date < todayStr) {
      toast.error('التاريخ لا يمكن أن يكون في الماضي');
      return;
    }
    if (!modalState.reason.trim()) {
      toast.error('السبب مطلوب');
      return;
    }
    if (!modalState.isClosed) {
      if (!modalState.specialOpeningTime || !modalState.specialClosingTime) {
        toast.error('وقت الفتح ووقت الإغلاق الخاص مطلوبان لساعات العمل الخاصة');
        return;
      }
      if (modalState.specialOpeningTime >= modalState.specialClosingTime) {
        toast.error('وقت الفتح يجب أن يكون قبل وقت الإغلاق');
        return;
      }
    }

    const newExclusion: Exclusion = {
      date: modalState.date,
      isClosed: modalState.isClosed,
      specialOpeningTime: modalState.isClosed ? null : modalState.specialOpeningTime,
      specialClosingTime: modalState.isClosed ? null : modalState.specialClosingTime,
      reason: modalState.reason.trim(),
    };

    // If editing existing, preserve its ID
    if (modalState.exclusionIndex !== null) {
      const original = formState.exclusions[modalState.exclusionIndex];
      if (original.id) {
        newExclusion.id = original.id;
      }
    }

    const updatedExclusions = [...formState.exclusions];
    if (modalState.exclusionIndex !== null) {
      updatedExclusions[modalState.exclusionIndex] = newExclusion;
    } else {
      updatedExclusions.push(newExclusion);
    }

    // Sort exclusions by date
    updatedExclusions.sort((a, b) => a.date.localeCompare(b.date));

    setFormState({ ...formState, exclusions: updatedExclusions });
    closeModal();
  };

  // Delete exception
  const handleDeleteExclusion = (index: number) => {
    const updated = formState.exclusions.filter((_, idx) => idx !== index);
    setFormState({ ...formState, exclusions: updated });
  };

  // Validate whole form before PUT submit
  const validateForm = (): boolean => {
    if (!formState.name.trim()) {
      toast.error('اسم الفرع مطلوب');
      return false;
    }
    if (!formState.location.trim()) {
      toast.error('الموقع مطلوب');
      return false;
    }
    if (formState.supportedDonationTypes.length === 0) {
      toast.error('يجب اختيار نوع واحد على الأقل من أنواع التبرع المدعومة');
      return false;
    }
    if (formState.slotDurationMinutes <= 0) {
      toast.error('مدة الفترة يجب أن تكون أكبر من الصفر');
      return false;
    }
    if (formState.maxDonorsPerSlot <= 0) {
      toast.error('أقصى عدد متبرعين بالفترة يجب أن يكون أكبر من الصفر');
      return false;
    }

    // Validate open weekdays times
    for (const wh of formState.weeklyHours) {
      if (!wh.isClosed) {
        if (!wh.openingTime || !wh.closingTime) {
          toast.error(`يرجى تحديد أوقات العمل ليوم ${DAYS_OF_WEEK_NAMES[wh.dayOfWeek]}`);
          return false;
        }
        if (wh.openingTime >= wh.closingTime) {
          toast.error(`وقت الفتح يجب أن يكون قبل وقت الإغلاق ليوم ${DAYS_OF_WEEK_NAMES[wh.dayOfWeek]}`);
          return false;
        }
      }
    }

    // Validate exceptions times
    for (const ex of formState.exclusions) {
      if (!ex.isClosed) {
        if (!ex.specialOpeningTime || !ex.specialClosingTime) {
          toast.error(`يرجى تحديد أوقات العمل الخاصة للاستثناء في تاريخ ${ex.date}`);
          return false;
        }
        if (ex.specialOpeningTime >= ex.specialClosingTime) {
          toast.error(`وقت الفتح الخاص يجب أن يكون قبل وقت الإغلاق للاستثناء في تاريخ ${ex.date}`);
          return false;
        }
      }
    }

    return true;
  };

  // Submit all settings
  const handleSaveAll = () => {
    if (!validateForm()) return;

    // Build the request payload, strictly excluding read-only fields
    const payload: UpdateMainBranchSettingsRequest = {
      name: formState.name.trim(),
      location: formState.location.trim(),
      addressDetails: formState.addressDetails?.trim() || '',
      supportedDonationTypes: formState.supportedDonationTypes,
      slotDurationMinutes: Number(formState.slotDurationMinutes),
      maxDonorsPerSlot: Number(formState.maxDonorsPerSlot),
      // Keep ordering of dayOfWeek 0 -> 6
      weeklyHours: [...formState.weeklyHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek),
      exclusions: formState.exclusions.map((ex) => ({
        id: ex.id,
        date: ex.date,
        isClosed: ex.isClosed,
        specialOpeningTime: ex.isClosed ? null : (ex.specialOpeningTime || null),
        specialClosingTime: ex.isClosed ? null : (ex.specialClosingTime || null),
        reason: ex.reason.trim(),
      })),
      version: formState.version !== undefined ? formState.version : null,
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('تم حفظ إعدادات الفرع الرئيسي بنجاح');
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ الإعدادات';
        toast.error(msg);
      },
    });
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-foreground text-lg font-bold">إعدادات الفرع الرئيسي والجدولة</h2>
          <p className="text-muted-foreground text-xs mt-1">تعديل بيانات المنشأة ومواعيد الحجز الأسبوعية والطارئة</p>
        </div>

        {/* Global Save Button */}
        <button
          onClick={handleSaveAll}
          disabled={updateMutation.isPending || !hasUnsavedChanges}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all text-sm font-semibold select-none ${
            !hasUnsavedChanges
              ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
              : savedSuccess
              ? 'bg-green-500'
              : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-sm'
          }`}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...
            </>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4" /> تم الحفظ بنجاح
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> حفظ التغييرات
            </>
          )}
        </button>
      </div>

      {/* Sub tabs Menu */}
      <div className="flex border-b border-border mb-6 overflow-x-auto whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveSubTab('info')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeSubTab === 'info'
              ? 'border-green-600 text-green-700 bg-green-50/10'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="w-4 h-4" />
          بيانات الفرع والجدولة
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('weekly')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeSubTab === 'weekly'
              ? 'border-green-600 text-green-700 bg-green-50/10'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="w-4 h-4" />
          ساعات العمل الأسبوعية
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('exclusions')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeSubTab === 'exclusions'
              ? 'border-green-600 text-green-700 bg-green-50/10'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          أيام الإجازات والاستثناءات
        </button>
      </div>

      {/* Tabs Content */}
      <div className="flex-1">
        {/* SUBTAB 1: Basic Info & Slots */}
        {activeSubTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground text-xs font-semibold mb-1.5">اسم الفرع</label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-foreground text-xs font-semibold mb-1.5">الموقع</label>
                <input
                  type="text"
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 text-sm"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-foreground text-xs font-semibold mb-1.5">تفاصيل العنوان</label>
                <textarea
                  value={formState.addressDetails || ''}
                  rows={2}
                  onChange={(e) => setFormState({ ...formState, addressDetails: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-xs font-semibold mb-1.5">رقم الهاتف (للقراءة فقط)</label>
                <input
                  type="text"
                  value={formState.phoneNumber}
                  disabled
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/20 text-muted-foreground opacity-75 cursor-not-allowed text-sm"
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-xs font-semibold mb-1.5">البريد الإلكتروني (للقراءة فقط)</label>
                <input
                  type="email"
                  value={formState.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/20 text-muted-foreground opacity-75 cursor-not-allowed text-sm"
                />
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-foreground text-sm font-bold mb-4">قواعد حجز الفترات الزمنية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-foreground text-xs font-semibold mb-1.5">مدة الفترة (بالدقائق)</label>
                  <select
                    value={formState.slotDurationMinutes}
                    onChange={(e) => setFormState({ ...formState, slotDurationMinutes: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 text-sm"
                  >
                    <option value={15}>15 دقيقة</option>
                    <option value={30}>30 دقيقة</option>
                    <option value={45}>45 دقيقة</option>
                    <option value={60}>60 دقيقة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-foreground text-xs font-semibold mb-1.5">أقصى عدد متبرعين بالفترة</label>
                  <input
                    type="number"
                    min={1}
                    value={formState.maxDonorsPerSlot}
                    onChange={(e) => setFormState({ ...formState, maxDonorsPerSlot: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-foreground text-sm font-bold mb-3">أنواع التبرع المدعومة</h3>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-foreground font-medium select-none">
                  <input
                    type="checkbox"
                    checked={formState.supportedDonationTypes.includes('WholeBlood')}
                    onChange={(e) => handleDonationTypeChange('WholeBlood', e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-border text-green-600 focus:ring-green-500 bg-muted/40"
                  />
                  كامل الدم (Whole Blood)
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-foreground font-medium select-none">
                  <input
                    type="checkbox"
                    checked={formState.supportedDonationTypes.includes('Platelets')}
                    onChange={(e) => handleDonationTypeChange('Platelets', e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-border text-green-600 focus:ring-green-500 bg-muted/40"
                  />
                  صفائح دموية (Platelets)
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-foreground font-medium select-none">
                  <input
                    type="checkbox"
                    checked={formState.supportedDonationTypes.includes('Plasma')}
                    onChange={(e) => handleDonationTypeChange('Plasma', e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-border text-green-600 focus:ring-green-500 bg-muted/40"
                  />
                  بلازما (Plasma)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: Weekly Hours */}
        {activeSubTab === 'weekly' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs font-bold">
                  <th className="pb-3 text-right">اليوم</th>
                  <th className="pb-3 text-right">الحالة</th>
                  <th className="pb-3 text-right">وقت الفتح</th>
                  <th className="pb-3 text-right">وقت الإغلاق</th>
                  <th className="pb-3 text-right">أقصى عدد متبرعين بالفترة (اختياري)</th>
                </tr>
              </thead>
              <tbody>
                {formState.weeklyHours.map((wh, idx) => (
                  <tr key={wh.dayOfWeek} className="border-b border-border last:border-0 hover:bg-muted/10">
                    <td className="py-4 text-sm font-bold text-foreground">
                      {DAYS_OF_WEEK_NAMES[wh.dayOfWeek]}
                    </td>
                    <td className="py-4">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
                        <input
                          type="checkbox"
                          checked={!wh.isClosed}
                          onChange={(e) => {
                            const open = e.target.checked;
                            const updated = [...formState.weeklyHours];
                            updated[idx] = {
                              ...wh,
                              isClosed: !open,
                              // If closing, set times to 00:00 to match backend
                              openingTime: open ? (wh.openingTime === '00:00' ? '08:00' : wh.openingTime) : '00:00',
                              closingTime: open ? (wh.closingTime === '00:00' ? '16:00' : wh.closingTime) : '00:00',
                            };
                            setFormState({ ...formState, weeklyHours: updated });
                          }}
                          className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500 bg-muted/40"
                        />
                        {wh.isClosed ? (
                          <span className="text-red-600 font-semibold">مغلق</span>
                        ) : (
                          <span className="text-green-600 font-semibold">مفتوح</span>
                        )}
                      </label>
                    </td>
                    <td className="py-4">
                      <input
                        type="time"
                        value={wh.isClosed ? '00:00' : wh.openingTime}
                        disabled={wh.isClosed}
                        onChange={(e) => {
                          const updated = [...formState.weeklyHours];
                          updated[idx] = { ...wh, openingTime: e.target.value };
                          setFormState({ ...formState, weeklyHours: updated });
                        }}
                        className="px-3 py-1.5 border border-border rounded-xl bg-muted/40 text-foreground text-sm focus:border-green-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="py-4">
                      <input
                        type="time"
                        value={wh.isClosed ? '00:00' : wh.closingTime}
                        disabled={wh.isClosed}
                        onChange={(e) => {
                          const updated = [...formState.weeklyHours];
                          updated[idx] = { ...wh, closingTime: e.target.value };
                          setFormState({ ...formState, weeklyHours: updated });
                        }}
                        className="px-3 py-1.5 border border-border rounded-xl bg-muted/40 text-foreground text-sm focus:border-green-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="py-4">
                      <input
                        type="number"
                        min={1}
                        placeholder="الافتراضي"
                        value={wh.maxDonorsPerSlot === null ? '' : wh.maxDonorsPerSlot}
                        disabled={wh.isClosed}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value);
                          const updated = [...formState.weeklyHours];
                          updated[idx] = { ...wh, maxDonorsPerSlot: val };
                          setFormState({ ...formState, weeklyHours: updated });
                        }}
                        className="w-28 px-3 py-1.5 border border-border rounded-xl bg-muted/40 text-foreground text-sm focus:border-green-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUBTAB 3: Holidays & Exceptions */}
        {activeSubTab === 'exclusions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-foreground text-sm font-bold">أيام العطلات والاستثناءات الطارئة</h3>
              <button
                type="button"
                onClick={() => openModal()}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة استثناء جديد
              </button>
            </div>

            {formState.exclusions.length === 0 ? (
              <div className="border border-dashed border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
                لا توجد استثناءات مضافة حالياً. اضغط على الزر أعلاه لإضافة استثناء جديد.
              </div>
            ) : (
              <div className="overflow-x-auto border border-border rounded-2xl">
                <table className="w-full text-right border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs font-bold bg-muted/20">
                      <th className="py-3 px-4">التاريخ</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4">وقت الفتح</th>
                      <th className="py-3 px-4">وقت الإغلاق</th>
                      <th className="py-3 px-4">السبب</th>
                      <th className="py-3 px-4 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formState.exclusions.map((ex, idx) => (
                      <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/10 text-sm">
                        <td className="py-3.5 px-4 text-foreground font-semibold">{ex.date}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              ex.isClosed
                                ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                            }`}
                          >
                            {ex.isClosed ? 'مغلق بالكامل' : 'ساعات عمل خاصة'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-foreground font-medium">
                          {ex.isClosed ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            ex.specialOpeningTime
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-foreground font-medium">
                          {ex.isClosed ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            ex.specialClosingTime
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">{ex.reason}</td>
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => openModal(idx)}
                              className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-all"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExclusion(idx)}
                              className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EXCLUSION MODAL DIALOG */}
      {modalState.isOpen && (
        <div 
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/10">
              <h3 className="text-foreground font-bold text-base">
                {modalState.exclusionIndex !== null ? 'تعديل استثناء ساعات عمل' : 'إضافة استثناء ساعات عمل جديد'}
              </h3>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-foreground text-xs font-semibold mb-1.5">التاريخ</label>
                <input
                  type="date"
                  value={modalState.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setModalState({ ...modalState, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground text-sm focus:border-green-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-foreground text-xs font-semibold mb-1.5">نوع الاستثناء</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
                    <input
                      type="radio"
                      name="statusType"
                      checked={modalState.isClosed}
                      onChange={() => setModalState({ ...modalState, isClosed: true })}
                      className="w-4.5 h-4.5 border-border text-green-600 focus:ring-green-500 bg-muted/40"
                    />
                    مغلق بالكامل
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
                    <input
                      type="radio"
                      name="statusType"
                      checked={!modalState.isClosed}
                      onChange={() => setModalState({ ...modalState, isClosed: false })}
                      className="w-4.5 h-4.5 border-border text-green-600 focus:ring-green-500 bg-muted/40"
                    />
                    ساعات عمل خاصة
                  </label>
                </div>
              </div>

              {!modalState.isClosed && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground text-xs font-semibold mb-1.5">وقت الفتح الخاص</label>
                    <input
                      type="time"
                      value={modalState.specialOpeningTime}
                      onChange={(e) => setModalState({ ...modalState, specialOpeningTime: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground text-sm focus:border-green-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground text-xs font-semibold mb-1.5">وقت الإغلاق الخاص</label>
                    <input
                      type="time"
                      value={modalState.specialClosingTime}
                      onChange={(e) => setModalState({ ...modalState, specialClosingTime: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground text-sm focus:border-green-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-foreground text-xs font-semibold mb-1.5">السبب</label>
                <input
                  type="text"
                  placeholder="مثال: إجازة عيد الأضحى، صيانة دورية..."
                  value={modalState.reason}
                  onChange={(e) => setModalState({ ...modalState, reason: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground text-sm focus:border-green-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-border bg-muted/10">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 border border-border rounded-xl hover:bg-muted text-foreground text-sm font-semibold transition-all active:scale-95"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveExclusion}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
