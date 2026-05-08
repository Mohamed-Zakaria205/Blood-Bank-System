// ── Shared types and constants for InventoryDisposal module ──
import type { BloodBag } from '../../../types';

export const TODAY = new Date('2025-04-29');

export function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

export const donTypeLabels: Record<string, string> = {
  whole: 'دم كامل',
  plasma: 'بلازما',
  platelets: 'صفائح',
};

export const DISPOSAL_REASONS = [
  {
    value: 'expired',
    label: 'انتهاء الصلاحية',
    icon: '⏰',
    suggested: 'disposed' as const,
  },
  {
    value: 'damaged',
    label: 'تلف الحقيبة',
    icon: '💔',
    suggested: 'disposed' as const,
  },
  {
    value: 'contaminated',
    label: 'تلوث العينة',
    icon: '⚗️',
    suggested: 'disposed' as const,
  },
  {
    value: 'lab_failed',
    label: 'فشل في التحاليل المخبرية',
    icon: '🧪',
    suggested: 'rejected' as const,
  },
  {
    value: 'storage',
    label: 'مشكلة في التخزين',
    icon: '❄️',
    suggested: 'disposed' as const,
  },
  { value: 'other', label: 'أخرى', icon: '📋', suggested: 'disposed' as const },
];

export function getCategoryLabel(cat?: string) {
  return DISPOSAL_REASONS.find((r) => r.value === cat)?.label ?? cat ?? '—';
}

export function getCurrentUserName() {
  try {
    const u = JSON.parse(localStorage.getItem('bloodlink_user') || '{}');
    return u.name ?? 'أمين المخزن';
  } catch {
    return 'أمين المخزن';
  }
}

// ── BagStatusChip sub-component ──

export function BagStatusChip({ bag }: { bag: BloodBag }) {
  const days = daysUntil(bag.expiryDate);
  if (bag.status === 'rejected')
    return (
      <span
        className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 whitespace-nowrap"
        style={{ fontSize: '10px', fontWeight: 700 }}
      >
        مرفوضة مخبرياً
      </span>
    );
  if (days < 0)
    return (
      <span
        className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap"
        style={{ fontSize: '10px', fontWeight: 700 }}
      >
        منتهية الصلاحية
      </span>
    );
  if (days <= 3)
    return (
      <span
        className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 whitespace-nowrap"
        style={{ fontSize: '10px', fontWeight: 700 }}
      >
        تنتهي خلال {days} أيام
      </span>
    );
  if (days <= 5)
    return (
      <span
        className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 whitespace-nowrap"
        style={{ fontSize: '10px', fontWeight: 700 }}
      >
        تنتهي خلال {days} أيام
      </span>
    );
  return (
    <span
      className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 whitespace-nowrap"
      style={{ fontSize: '10px', fontWeight: 700 }}
    >
      متاحة
    </span>
  );
}
