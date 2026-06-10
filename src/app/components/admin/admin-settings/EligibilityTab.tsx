import { useState, useEffect } from 'react';
import { Save, Check, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useEligibilitySettings, useUpdateEligibilitySettings } from '../../../hooks/useDonors';

export default function EligibilityTab() {
  const { data: settings, isLoading, isError, refetch } = useEligibilitySettings();
  const updateMutation = useUpdateEligibilitySettings();

  const [maleWait, setMaleWait] = useState(90);
  const [femaleWait, setFemaleWait] = useState(120);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setMaleWait(settings.donorMaleWaitDays);
      setFemaleWait(settings.donorFemaleWaitDays);
    }
  }, [settings]);

  const handleSave = () => {
    if (maleWait < 30 || maleWait > 365 || femaleWait < 30 || femaleWait > 365) {
      toast.error('يجب أن تكون فترة الانتظار بين 30 و 365 يوماً');
      return;
    }

    updateMutation.mutate(
      {
        donorMaleWaitDays: maleWait,
        donorFemaleWaitDays: femaleWait,
      },
      {
        onSuccess: (res) => {
          toast.success(res.message || 'تم تحديث إعدادات مؤهلية التبرع بنجاح');
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
        onError: () => {
          toast.error('تعذر تحديث الإعدادات. يرجى المحاولة لاحقاً');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-2" />
        <span className="text-muted-foreground" style={{ fontSize: '14px' }}>
          جاري تحميل الإعدادات...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
        <p className="text-destructive mb-4" style={{ fontSize: '14px' }}>
          تعذر تحميل إعدادات مؤهلية التبرع
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl bg-card hover:bg-muted/40 text-foreground transition-all"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <RefreshCw className="w-4 h-4" /> إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      <h2 className="text-foreground mb-1" style={{ fontSize: '18px', fontWeight: 700 }}>
        إعدادات فترات مؤهلية التبرع
      </h2>
      <p className="text-muted-foreground mb-6" style={{ fontSize: '13px' }}>
        تحديد فترات الانتظار الآمنة (بالأيام) بين عمليات التبرع لكل من الذكور والإناث.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="block text-foreground mb-1.5"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            فترة انتظار الذكور (أيام)
          </label>
          <input
            type="number"
            min={30}
            max={365}
            value={maleWait}
            onChange={(e) => setMaleWait(Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
            style={{ fontSize: '13px' }}
          />
        </div>
        <div>
          <label
            className="block text-foreground mb-1.5"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            فترة انتظار الإناث (أيام)
          </label>
          <input
            type="number"
            min={30}
            max={365}
            value={femaleWait}
            onChange={(e) => setFemaleWait(Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-border rounded-xl bg-muted/40 text-foreground outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
            style={{ fontSize: '13px' }}
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white transition-all ${
            saved ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'
          } ${updateMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
          style={{ fontSize: '14px', fontWeight: 600 }}
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
    </div>
  );
}
