// ── Shared constants and helpers for DoctorAppointments module ──
import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Activity, FileText } from 'lucide-react';
import type { AppointmentSlotStatus } from '../../../types/appointment';

// ── Date helpers ──
const _now = new Date();

// Helper to format date as YYYY-MM-DD using local time (avoids UTC shift at night)
const formatLocalDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TODAY = formatLocalDate(_now);

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

// Compute Sat–Fri of the current week dynamically (Middle Eastern week starts on Saturday)
const _startOfWeek = new Date(_now);
const dayOfWeek = _now.getDay(); // 0: Sun, 1: Mon, ... 5: Fri, 6: Sat
const offsetToSaturday = (dayOfWeek + 1) % 7; // Sat:0, Sun:1, Mon:2, ..., Fri:6
_startOfWeek.setDate(_now.getDate() - offsetToSaturday);

export const WEEK_DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(_startOfWeek);
  d.setDate(_startOfWeek.getDate() + i);
  return formatLocalDate(d);
});
export const WEEK_DAY_NAMES = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

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
    bg: 'bg-muted/40',
    border: 'border-border',
    text: 'text-muted-foreground',
    icon: <CheckCircle2 className="w-4 h-4 text-muted-foreground" />,
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
    bg: 'bg-card',
    border: 'border-dashed border-border',
    text: 'text-muted-foreground',
    icon: <></>,
  },
  inprogress: {
    label: 'قيد التنفيذ',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: <Activity className="w-4 h-4 text-amber-500" />,
  },
  approved: {
    label: 'قيد المراجعة',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: <FileText className="w-4 h-4 text-blue-500" />,
  },
};
