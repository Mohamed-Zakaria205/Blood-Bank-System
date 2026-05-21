import { useNavigate } from 'react-router';
import {
  CheckCircle2,
  User,
  Droplets,
  Activity,
  Building2,
  Megaphone,
  FlaskConical,
  AlertTriangle,
  CalendarDays,
  Clock,
  Smartphone,
  UserX,
} from 'lucide-react';
import type { SimpleForm } from './donationFormSchema';
import { DONATION_TYPE_LABELS } from './donationFormSchema';
import type { Campaign } from '../../../types';
import { formatLocalizedDate } from '../../../utils/date';

interface SuccessScreenProps {
  form: SimpleForm;
  donorCode: string;
  bagVolume: string;
  activeCampaigns: Campaign[];
  onReset: () => void;
}

export default function SuccessScreen({
  form,
  donorCode,
  bagVolume,
  activeCampaigns,
  onReset,
}: SuccessScreenProps) {
  const navigate = useNavigate();

  const today = formatLocalizedDate(new Date(), {
    weekday: 'long',
  });

  const isEligible = form.status === 'eligible';
  const selectedCampaign = activeCampaigns.find((c) => c.id === form.campaignId);

  /* ══════════════════════════════════════════════════════
     BRANCH A — Ineligible / Deferred
  ══════════════════════════════════════════════════════ */
  if (!isEligible) {
    const isDeferred = form.status === 'deferred';
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-6">
        <div className="w-full max-w-md mx-auto">
          {/* Status Icon */}
          <div className="text-center mb-6">
            <div
              className={`rounded-full flex items-center justify-center mx-auto mb-4 ${isDeferred ? 'bg-orange-100' : 'bg-red-100'}`}
              style={{ width: 72, height: 72 }}
            >
              {isDeferred ? (
                <Clock className="w-9 h-9 text-orange-500" />
              ) : (
                <UserX className="w-9 h-9 text-red-500" />
              )}
            </div>
            <h2 className="text-gray-900 mb-1" style={{ fontSize: '20px', fontWeight: 800 }}>
              {isDeferred ? 'تم تأجيل المتبرع' : 'تم رفض المتبرع'}
            </h2>
            <p className="text-gray-400" style={{ fontSize: '13px' }}>
              {isDeferred
                ? 'التبرع موجل مؤقتاً — تم حفظ البيانات في سجلات الطبيب'
                : 'المتبرع غير مؤهل — تم حفظ البيانات في سجلات الطبيب'}
            </p>
          </div>

          {/* Donor summary card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500" style={{ fontSize: '12px', fontWeight: 600 }}>
                اسم المتبرع
              </span>
              <span className="text-gray-900" style={{ fontSize: '13px', fontWeight: 700 }}>
                {form.name}
              </span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-between">
              <span className="text-gray-500" style={{ fontSize: '12px', fontWeight: 600 }}>
                فصيلة الدم
              </span>
              <span
                className="text-red-700 font-mono"
                style={{ fontSize: '14px', fontWeight: 800 }}
              >
                {form.bloodType || '—'}
              </span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-between">
              <span className="text-gray-500" style={{ fontSize: '12px', fontWeight: 600 }}>
                الحالة
              </span>
              <span
                className={`px-2.5 py-1 rounded-full ${isDeferred ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                {isDeferred ? '⏳ موجل' : '❌ غير مؤهل'}
              </span>
            </div>
            {form.rejectionReason && (
              <>
                <div className="h-px bg-gray-100" />
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="text-gray-500 flex-shrink-0"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  >
                    السبب
                  </span>
                  <span className="text-gray-700 text-right" style={{ fontSize: '12px' }}>
                    {form.rejectionReason}
                  </span>
                </div>
              </>
            )}
            {isDeferred && form.deferredUntil && (
              <>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-500" style={{ fontSize: '12px', fontWeight: 600 }}>
                    موجل حتى
                  </span>
                  <span
                    className="text-orange-700 font-mono"
                    style={{ fontSize: '13px', fontWeight: 700 }}
                  >
                    {form.deferredUntil}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onReset}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              تسجيل متبرع آخر
            </button>
            <button
              onClick={() => navigate('/doctor/donors')}
              className="flex-1 py-3.5 text-white rounded-xl transition-all flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #374151, #1f2937)',
                fontSize: '14px',
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
     BRANCH B — Eligible (Review + Confirm)
  ══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-6">
      <div className="w-full max-w-lg mx-auto">
        {/* ── Header ── */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-gray-900 mb-1" style={{ fontSize: '20px', fontWeight: 800 }}>
            مراجعة وتأكيد بيانات التبرع
          </h2>
          <p className="text-gray-400" style={{ fontSize: '13px' }}>
            يرجى مراجعة البيانات أدناه قبل الإرسال للمختبر
          </p>
        </div>

        {/* ── Sample Code — prominent ── */}
        <div className="p-4 bg-gradient-to-l from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl mb-4 flex items-center justify-between">
          <div>
            <p className="text-gray-500 mb-0.5" style={{ fontSize: '11px', fontWeight: 600 }}>
              رمز العينة (مولّد تلقائياً)
            </p>
            <p
              className="text-green-700 font-mono"
              style={{
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '0.5px',
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
            style={{ fontSize: '12px', fontWeight: 700 }}
          >
            <Activity className="w-3.5 h-3.5 text-green-600" /> البيانات الطبية (مُعبَّأة تلقائياً
            — للقراءة فقط)
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
              <p className="text-gray-400 mb-1" style={{ fontSize: '10px', fontWeight: 600 }}>
                فصيلة الدم
              </p>
              <p className="text-red-700 font-mono" style={{ fontSize: '20px', fontWeight: 900 }}>
                {form.bloodType || '—'}
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
              <p className="text-gray-400 mb-1" style={{ fontSize: '10px', fontWeight: 600 }}>
                نوع التبرع
              </p>
              <p className="text-blue-700" style={{ fontSize: '13px', fontWeight: 700 }}>
                {DONATION_TYPE_LABELS[form.donationType] || '—'}
              </p>
            </div>
            <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-center">
              <p className="text-gray-400 mb-1" style={{ fontSize: '10px', fontWeight: 600 }}>
                حالة التأهل
              </p>
              <p className="text-green-700" style={{ fontSize: '13px', fontWeight: 700 }}>
                ✅ مؤهل
              </p>
            </div>
          </div>
        </div>

        {/* ── Blood Bag Volume ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
          <p
            className="text-gray-500 mb-3 flex items-center gap-1.5"
            style={{ fontSize: '12px', fontWeight: 700 }}
          >
            <Droplets className="w-3.5 h-3.5 text-red-500" /> حجم حقيبة الدم
          </p>
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
            <p className="text-red-700 font-mono" style={{ fontSize: '22px', fontWeight: 800 }}>
              {bagVolume} مل
            </p>
          </div>
        </div>

        {/* ── Date & Time ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
          <p
            className="text-gray-500 mb-3 flex items-center gap-1.5"
            style={{ fontSize: '12px', fontWeight: 700 }}
          >
            <CalendarDays className="w-3.5 h-3.5 text-purple-500" /> تاريخ ووقت التبرع
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
              <p className="text-gray-400 mb-0.5" style={{ fontSize: '10px' }}>
                التاريخ
              </p>
              <p className="text-purple-700" style={{ fontSize: '12px', fontWeight: 700 }}>
                {today}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
              <p className="text-gray-400 mb-0.5" style={{ fontSize: '10px' }}>
                وقت التبرع
              </p>
              <p
                className="text-indigo-700 font-mono"
                style={{ fontSize: '18px', fontWeight: 800 }}
              >
                {form.donationTime || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Source ── */}
        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl mb-4 flex items-center justify-center gap-2">
          {form.source === 'walkin' ? (
            <>
              <Building2 className="w-4 h-4 text-green-600" />
              <span className="text-green-700" style={{ fontSize: '13px', fontWeight: 600 }}>
                تبرع داخل البنك
              </span>
            </>
          ) : form.source === 'campaign' ? (
            <>
              <Megaphone className="w-4 h-4 text-purple-600" />
              <span className="text-purple-700" style={{ fontSize: '13px', fontWeight: 600 }}>
                تبرع من حملة
                {selectedCampaign ? ` — ${selectedCampaign.title}` : ''}
              </span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700" style={{ fontSize: '13px', fontWeight: 600 }}>
                حجز من التطبيق
              </span>
            </>
          )}
        </div>

        {/* ── Lab Notice ── */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-700" style={{ fontSize: '12px', lineHeight: '1.6' }}>
            بعد الضغط على <strong>«تأكيد وإرسال للمختبر»</strong>، ستُقفَل البيانات وتُرسَل
            تلقائياً إلى دكتور التحاليل لاستكمال الفحوصات المخبرية.
          </p>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            تسجيل متبرع آخر
          </button>
          <button
            onClick={() => navigate('/doctor/donors')}
            className="flex-1 py-3.5 text-white rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #15803d, #16a34a)',
              fontSize: '14px',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(22,163,74,0.30)',
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

