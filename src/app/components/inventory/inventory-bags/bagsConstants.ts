// ── Shared types and constants for InventoryBags module ──
import type { BloodBag } from '../../../types';

export const TODAY = new Date();

export function daysUntil(d: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export const donTypeLabels: Record<string, string> = {
  wholeblood: 'دم كامل',
  plasma: 'بلازما',
  platelets: 'صفائح',
};

export function getCurrentUserName() {
  try {
    const u = JSON.parse(localStorage.getItem('bloodlink_user') || '{}');
    return u.name ?? 'أمين المخزن';
  } catch {
    return 'أمين المخزن';
  }
}

export function getBagStatus(bag: BloodBag) {
  if (bag.status === 'expired') {
    return {
      label: 'منتهي الصلاحية',
      cls: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
      isExpired: true,
      isAvailable: false,
    };
  }
  if (bag.status === 'available') {
    return {
      label: 'متاح',
      cls: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
      isExpired: false,
      isAvailable: true,
    };
  }
  if (bag.status === 'issued') {
    return {
      label: 'مُصدَّر',
      cls: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
      isExpired: false,
      isAvailable: false,
    };
  }
  if (bag.status === 'testing') {
    return {
      label: 'يتم اختبارها',
      cls: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
      isExpired: false,
      isAvailable: false,
    };
  }
  if (bag.status === 'disposed') {
    return {
      label: 'مُتلَف',
      cls: 'bg-red-100/80 dark:bg-red-500/15 text-red-800 dark:text-red-400',
      isExpired: false,
      isAvailable: false,
    };
  }
  return {
    label: bag.status || '—',
    cls: 'bg-muted dark:bg-muted/30 text-muted-foreground',
    isExpired: false,
    isAvailable: false,
  };
}

export interface ExportFormState {
  recipientName: string;
  nationalId: string;
  phone: string;
  reason: string;
}

export const EXPORT_FORM_DEFAULTS: ExportFormState = {
  recipientName: '',
  nationalId: '',
  phone: '',
  reason: '',
};
