import {
  User,
  XCircle,
  AlertTriangle,
  Smartphone,
  Phone,
  Hash,
  Droplets,
  UserPlus,
  Megaphone,
  Ban,
} from 'lucide-react';
import type { Slot15 } from '../../../types';
import { useCampaigns } from '../../../hooks/useCampaigns';
import {
  getEffectiveStatus,
  STATUS_CONFIG,
  DONATION_LABELS,
  DONATION_COLORS,
} from './appointmentConstants';

// ── Campaign badge ──
function CampaignBadge({ campaignId }: { campaignId?: string }) {
  const { data: campaignsData = [] } = useCampaigns();
  if (!campaignId) return null;
  const campaign = campaignsData.find((c) => c.id === campaignId);
  if (!campaign) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-full"
      style={{ fontSize: '10px', fontWeight: 600 }}
    >
      <Megaphone className="w-2.5 h-2.5" /> {campaign.title.slice(0, 18)}...
    </span>
  );
}

// ── Appointment Card (detailed — today view) ──
interface AppointmentCardProps {
  slot: Slot15;
  onRegister: () => void;
  onCancel: () => void;
}

export default function AppointmentCard({ slot, onRegister, onCancel }: AppointmentCardProps) {
  const eff = getEffectiveStatus(slot);
  const cfg = STATUS_CONFIG[eff];

  if (eff === 'available') {
    return (
      <div
        className={`rounded-xl border ${cfg.border} ${cfg.bg} px-4 py-3 flex items-center justify-between`}
      >
        <span className="text-gray-300" style={{ fontSize: '13px' }}>
          لا يوجد حجز
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400"
          style={{ fontWeight: 600 }}
        >
          متاح
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {cfg.icon}
          <span
            className={`px-2 py-0.5 rounded-full text-white ${
              eff === 'booked'
                ? 'bg-green-600'
                : eff === 'completed'
                  ? 'bg-gray-400'
                  : eff === 'no_show'
                    ? 'bg-orange-500'
                    : 'bg-red-500'
            }`}
            style={{ fontSize: '11px', fontWeight: 700 }}
          >
            {cfg.label}
          </span>
          {slot.campaignId && <CampaignBadge campaignId={slot.campaignId} />}
        </div>
        <div className="flex items-center gap-1 text-gray-400" style={{ fontSize: '11px' }}>
          <Smartphone className="w-3 h-3" /> تطبيق
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>
            {slot.donorName}
          </span>
          {slot.donorAge && (
            <span className="text-gray-400" style={{ fontSize: '12px' }}>
              ({slot.donorAge} سنة)
            </span>
          )}
          {slot.donorGender && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-white ${slot.donorGender === 'male' ? 'bg-blue-400' : 'bg-pink-400'}`}
              style={{ fontSize: '10px' }}
            >
              {slot.donorGender === 'male' ? 'ذكر' : 'أنثى'}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-600 font-mono" style={{ fontSize: '12px' }}>
              {slot.donorNationalId?.slice(0, 6)}...
              {slot.donorNationalId?.slice(-4)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-600" style={{ fontSize: '12px' }} dir="ltr">
              {slot.donorPhone}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          {slot.donorBloodType && (
            <span
              className="px-2 py-0.5 bg-red-50 border border-red-100 text-red-600 rounded-full"
              style={{ fontSize: '11px', fontWeight: 700 }}
            >
              <Droplets className="w-3 h-3 inline ml-0.5" />
              {slot.donorBloodType}
            </span>
          )}
          {slot.donationType && (
            <span
              className={`px-2 py-0.5 border rounded-full ${DONATION_COLORS[slot.donationType]}`}
              style={{ fontSize: '11px', fontWeight: 600 }}
            >
              {DONATION_LABELS[slot.donationType]}
            </span>
          )}
        </div>
      </div>

      {/* Cancellation log */}
      {eff === 'cancelled' && slot.cancelledByName && (
        <div className="mt-3 p-3 bg-red-100/60 rounded-xl border border-red-200 space-y-1">
          <div className="flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5 text-red-500" />
            <span className="text-red-700" style={{ fontSize: '11px', fontWeight: 700 }}>
              سجل الإلغاء
            </span>
          </div>
          <p className="text-red-600" style={{ fontSize: '11px' }}>
            بواسطة: <strong>{slot.cancelledByName}</strong>
          </p>
          {slot.cancelledAt && (
            <p className="text-red-500 font-mono" style={{ fontSize: '10px' }}>
              {slot.cancelledAt}
            </p>
          )}
          {slot.cancellationReason && (
            <p className="text-red-600" style={{ fontSize: '11px' }}>
              السبب: {slot.cancellationReason}
            </p>
          )}
          <p className="text-green-600" style={{ fontSize: '10px', fontWeight: 600 }}>
            ✓ الفترة الزمنية متاحة للحجز مجدداً
          </p>
        </div>
      )}

      {eff === 'booked' && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-400 flex items-center justify-center gap-1.5 transition-all"
            style={{ fontSize: '12px', fontWeight: 700 }}
          >
            <XCircle className="w-4 h-4" /> إلغاء الموعد
          </button>
          <button
            onClick={onRegister}
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center gap-1.5 transition-all"
            style={{ fontSize: '12px', fontWeight: 700 }}
          >
            <UserPlus className="w-4 h-4" /> بدء التسجيل
          </button>
        </div>
      )}
      {eff === 'no_show' && (
        <div className="mt-2 px-3 py-2 bg-orange-100 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <span className="text-orange-700" style={{ fontSize: '12px', fontWeight: 600 }}>
            ⚠️ لم يحضر المتبرع — تم إلغاء الموعد تلقائياً
          </span>
        </div>
      )}
    </div>
  );
}
