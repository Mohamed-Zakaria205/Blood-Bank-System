import { XCircle, UserPlus, AlertTriangle } from 'lucide-react';
import type { AppointmentSlot } from '../../../types';
import {
  STATUS_CONFIG,
  DONATION_LABELS,
  DONATION_COLORS,
} from './appointmentConstants';

interface AppointmentRowProps {
  slot: AppointmentSlot;
  onRegister: () => void;
  onCancel: () => void;
  onNoShow: () => void;
}

export default function AppointmentRow({
  slot,
  onRegister,
  onCancel,
  onNoShow,
}: AppointmentRowProps) {
  const status = slot.status;
  const cfg = STATUS_CONFIG[status] || {
    label: status || 'غير معروف',
    bg: 'bg-muted',
    border: 'border-border',
    text: 'text-muted-foreground',
    icon: <></>,
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${cfg.border} ${cfg.bg} transition-all`}
    >
      {/* Time */}
      <div className="flex-shrink-0 w-16 text-center">
        <span
          className="text-foreground font-mono"
          style={{ fontSize: '14px', fontWeight: 700 }}
          dir="ltr"
        >
          {slot.time}
        </span>
      </div>
      {/* Donor */}
      <div className="flex-1 min-w-0">
        <p className="text-foreground truncate" style={{ fontSize: '13px', fontWeight: 600 }}>
          {slot.donorName || '—'}
        </p>
        <p className="text-muted-foreground font-mono" style={{ fontSize: '11px' }}>
          {slot.donorNationalId?.slice(0, 8)}...
        </p>
      </div>
      {/* Type + Blood */}
      <div className="hidden sm:flex items-center gap-1.5">
        {slot.donorBloodType && (
          <span
            className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100"
            style={{ fontSize: '11px', fontWeight: 700 }}
          >
            {slot.donorBloodType}
          </span>
        )}
        {slot.donationType && (
          <span
            className={`px-2 py-0.5 border rounded-full ${DONATION_COLORS[slot.donationType]}`}
            style={{ fontSize: '11px' }}
          >
            {DONATION_LABELS[slot.donationType]}
          </span>
        )}
      </div>
      {/* Status + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={`px-2.5 py-1 rounded-full ${cfg.text} ${cfg.bg} border ${cfg.border}`}
          style={{ fontSize: '11px', fontWeight: 700 }}
        >
          {cfg.label}
        </span>
        {status === 'booked' && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNoShow();
              }}
              title="تسجيل غياب"
              className="p-1.5 border border-orange-200 text-orange-500 rounded-lg hover:bg-orange-50 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              title="إلغاء الموعد"
              className="p-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRegister();
              }}
              title="بدء التسجيل"
              className="p-1.5 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
