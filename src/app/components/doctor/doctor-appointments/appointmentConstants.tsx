// ── Shared constants and helpers for DoctorAppointments module ──
import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { AppointmentSlotStatus } from '../../../types/appointment';

// ── Date helpers ──
const _now = new Date();
export const TODAY = _now.toISOString().split('T')[0];

export const DONATION_LABELS: Record<string, string> = {
  wholeblood: 'دم كامل',
  plasma: 'بلازما',
  platelets: 'صفائح',
};
export const DONATION_COLORS: Record<string, string> = {
  wholeblood: 'bg-red-50 text-red-600 border-red-100',
  plasma: 'bg-blue-50 text-blue-600 border-blue-100',
  platelets: 'bg-purple-50 text-purple-600 border-purple-100',
};

// Compute Sun–Sat of the current week dynamically
const _startOfWeek = new Date(_now);
_startOfWeek.setDate(_now.getDate() - _now.getDay()); // rewind to Sunday
export const WEEK_DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(_startOfWeek);
  d.setDate(_startOfWeek.getDate() + i);
  return d.toISOString().split('T')[0];
});
export const WEEK_DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// ── Status ──
// The backend is the source of truth for all statuses.
// No more client-side derivation (removed getEffectiveStatus + isSlotPast).
export type EffectiveStatus = AppointmentSlotStatus;

export const STATUS_CONFIG: Record<
  EffectiveStatus,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
    icon: React.ReactElement;
  }
> = {
  booked: {
    label: 'محجوز',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: <Clock className="w-4 h-4 text-green-500" />,
  },
  completed: {
    label: 'مكتمل',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-600',
    icon: <CheckCircle2 className="w-4 h-4 text-gray-400" />,
  },
  missed: {
    label: 'لم يحضر',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  },
  cancelled: {
    label: 'ملغى',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: <XCircle className="w-4 h-4 text-red-500" />,
  },
  available: {
    label: 'متاح',
    bg: 'bg-white',
    border: 'border-dashed border-gray-200',
    text: 'text-gray-400',
    icon: <></>,
  },
};
