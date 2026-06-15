// ── Shared types and constants for InventoryDisposal module ──
import type { BloodBag } from '../../../types';

export const TODAY = new Date();

export function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

export const donTypeLabels: Record<string, string> = {
  wholeblood: 'دم كامل',
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
    value: 'failed_screening',
    label: 'فشل في التحاليل المخبرية',
    icon: '🧪',
    suggested: 'disposed' as const,
  },
  {
    value: 'damaged_storage',
    label: 'تلف أثناء التخزين',
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
    value: 'preparation_error',
    label: 'خطأ في التحضير',
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
  if (bag.status === 'expired')
    return (
      <span
        className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap"
        style={{ fontSize: '10px', fontWeight: 700 }}
      >
        منتهية الصلاحية
      </span>
    );
  if (bag.status === 'disposed')
    return (
      <span
        className="px-2 py-0.5 rounded-full bg-red-100/80 text-red-800 whitespace-nowrap"
        style={{ fontSize: '10px', fontWeight: 700 }}
      >
        مُتلَف
      </span>
    );
  if (bag.status === 'issued')
    return (
      <span
        className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap"
        style={{ fontSize: '10px', fontWeight: 700 }}
      >
        مُصدَّر
      </span>
    );

  const days = daysUntil(bag.expiryDate);
  if (days >= 0 && days <= 3)
    return (
      <span
        className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 whitespace-nowrap"
        style={{ fontSize: '10px', fontWeight: 700 }}
      >
        تنتهي خلال {days} أيام
      </span>
    );
  if (days >= 0 && days <= 5)
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
