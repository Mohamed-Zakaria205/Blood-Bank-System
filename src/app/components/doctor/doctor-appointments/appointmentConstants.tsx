// ── Shared types, constants and helpers for DoctorAppointments module ──
import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { Slot15 } from '../../../types';

// ── Constants ──
export const TODAY = '2025-05-02';
export const MOCK_CURRENT_HOUR = 10;
export const MOCK_CURRENT_MIN = 30;

export const DONATION_LABELS: Record<string, string> = {
  whole: 'دم كامل',
  plasma: 'بلازما',
  platelets: 'صفائح',
};
export const DONATION_COLORS: Record<string, string> = {
  whole: 'bg-red-50 text-red-600 border-red-100',
  plasma: 'bg-blue-50 text-blue-600 border-blue-100',
  platelets: 'bg-purple-50 text-purple-600 border-purple-100',
};

export const WEEK_DATES = [
  '2025-04-27',
  '2025-04-28',
  '2025-04-29',
  '2025-04-30',
  '2025-05-01',
  '2025-05-02',
  '2025-05-03',
];
export const WEEK_DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const ALL_SLOTS: string[] = [];
for (let h = 8; h < 17; h++) {
  for (const m of [0, 15, 30, 45]) {
    ALL_SLOTS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

// ── Helpers ──
export function isSlotPast(date: string, time: string): boolean {
  if (date < TODAY) return true;
  if (date > TODAY) return false;
  const [h, m] = time.split(':').map(Number);
  return h < MOCK_CURRENT_HOUR || (h === MOCK_CURRENT_HOUR && m <= MOCK_CURRENT_MIN);
}

export type EffectiveStatus = 'booked' | 'completed' | 'no_show' | 'cancelled' | 'available';

export function getEffectiveStatus(slot: Slot15): EffectiveStatus {
  if (slot.status === 'completed') return 'completed';
  if (slot.status === 'missed') return 'no_show';
  if (slot.status === 'cancelled') return 'cancelled';
  if (slot.status === 'disabled') return 'cancelled';
  if (slot.status === 'booked') {
    if (isSlotPast(slot.date, slot.time)) return 'cancelled';
    return 'booked';
  }
  return 'available';
}

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
  no_show: {
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
