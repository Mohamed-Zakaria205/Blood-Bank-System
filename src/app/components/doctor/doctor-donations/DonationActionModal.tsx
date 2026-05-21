import { useState } from 'react';
import {
  CheckCircle2,
  Activity,
  Building2,
  Megaphone,
  FlaskConical,
  CalendarDays,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react';
import type { Donation } from '../../../types';
import { donationTypeLabels } from './donorsConstants';
import { formatLocalizedDate } from '../../../utils/date';

interface DonationActionModalProps {
  donation: Donation;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onDelete: (id: string) => void;
  isConfirming: boolean;
  isDeleting: boolean;
}

export default function DonationActionModal({
  donation,
  onClose,
  onConfirm,
  onDelete,
  isConfirming,
  isDeleting,
}: DonationActionModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const today = formatLocalizedDate(new Date(donation.donationDate || Date.now()), {
    weekday: 'long',
  });

  const alreadySent = donation.sentToLab === true;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <div className="flex items-center justify-between p-5 pb-0">
          <div />
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* ── Header ── */}
          <div className="text-center mb-2">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${alreadySent ? 'bg-green-100' : 'bg-amber-100'}`}
            >
              {alreadySent ? (
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              ) : (
                <FlaskConical className="w-8 h-8 text-amber-600" />
              )}
            </div>
            <h2 className="text-gray-900 mb-1" style={{ fontSize: '20px', fontWeight: 800 }}>
              {alreadySent ? 'تم الإرسال للمختبر ✅' : 'مراجعة بيانات التبرع'}
            </h2>
            <p className="text-gray-400" style={{ fontSize: '13px' }}>
              {alreadySent
                ? 'تم إرسال هذا التبرع لدكتور التحاليل'
                : 'يرجى مراجعة البيانات قبل الإرسال'}
            </p>
          </div>

          {/* ── Donation Code ── */}
          <div className="p-4 bg-gradient-to-l from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-gray-500 mb-0.5" style={{ fontSize: '11px', fontWeight: 600 }}>
                رمز التبرع
              </p>
              <p
                className="text-green-700 font-mono"
                style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.5px' }}
              >
                {donation.donationCode}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* ── Medical Info ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p
              className="text-gray-500 mb-3 flex items-center gap-1.5"
              style={{ fontSize: '12px', fontWeight: 700 }}
            >
              <Activity className="w-3.5 h-3.5 text-green-600" /> البيانات الطبية
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                <p className="text-gray-400 mb-1" style={{ fontSize: '10px', fontWeight: 600 }}>
                  فصيلة الدم
                </p>
                <p className="text-red-700 font-mono" style={{ fontSize: '20px', fontWeight: 900 }}>
                  {donation.bloodType || '—'}
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                <p className="text-gray-400 mb-1" style={{ fontSize: '10px', fontWeight: 600 }}>
                  نوع التبرع
                </p>
                <p className="text-blue-700" style={{ fontSize: '13px', fontWeight: 700 }}>
                  {donationTypeLabels[donation.donationType] || '—'}
                </p>
              </div>
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-center">
                <p className="text-gray-400 mb-1" style={{ fontSize: '10px', fontWeight: 600 }}>
                  المتبرع
                </p>
                <p className="text-green-700" style={{ fontSize: '13px', fontWeight: 700 }}>
                  {donation.name}
                </p>
              </div>
            </div>
          </div>

          {/* ── Date & Time ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p
              className="text-gray-500 mb-3 flex items-center gap-1.5"
              style={{ fontSize: '12px', fontWeight: 700 }}
            >
              <CalendarDays className="w-3.5 h-3.5 text-purple-500" /> تاريخ التبرع
            </p>
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-center">
              <p className="text-purple-700" style={{ fontSize: '14px', fontWeight: 700 }}>
                {today}
              </p>
            </div>
          </div>

          {/* ── Source ── */}
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center gap-2">
            {donation.source === 'walkin' ? (
              <>
                <Building2 className="w-4 h-4 text-green-600" />
                <span className="text-green-700" style={{ fontSize: '13px', fontWeight: 600 }}>
                  تبرع داخل البنك
                </span>
              </>
            ) : donation.source === 'campaign' ? (
              <>
                <Megaphone className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700" style={{ fontSize: '13px', fontWeight: 600 }}>
                  تبرع من حملة{donation.campaignName ? ` — ${donation.campaignName}` : ''}
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

          {/* ── Action Buttons ── */}
          {alreadySent ? (
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-2xl text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-700" style={{ fontSize: '14px', fontWeight: 700 }}>
                تم تأكيد وإرسال هذا التبرع للمختبر
              </p>
              <p className="text-green-500 mt-1" style={{ fontSize: '12px' }}>
                البيانات مقفلة وجاري استكمال الفحوصات المخبرية
              </p>
            </div>
          ) : (
            <>
              {!showDeleteConfirm ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف التبرع
                  </button>
                  <button
                    onClick={() => onConfirm(donation.id)}
                    disabled={isConfirming}
                    className="flex-1 py-3.5 text-white rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #15803d, #16a34a)',
                      fontSize: '14px',
                      fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(22,163,74,0.30)',
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isConfirming ? 'جاري الإرسال...' : 'تأكيد وإرسال للمختبر'}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl space-y-3">
                  <p className="text-red-700 text-center" style={{ fontSize: '14px', fontWeight: 700 }}>
                    هل أنت متأكد من حذف هذا التبرع؟
                  </p>
                  <p className="text-red-500 text-center" style={{ fontSize: '12px' }}>
                    لا يمكن التراجع عن هذا الإجراء
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
                      style={{ fontSize: '13px', fontWeight: 600 }}
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => onDelete(donation.id)}
                      disabled={isDeleting}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ fontSize: '13px', fontWeight: 600 }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
