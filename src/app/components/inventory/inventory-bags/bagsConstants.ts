// ── Shared types and constants for InventoryBags module ──
import type { BloodBag } from '../../../types';

export const TODAY = new Date('2025-04-29');

export function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
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
  const days = daysUntil(bag.expiryDate);
  if (bag.status === 'available' && days < 0)
    return {
      label: 'منتهية',
      cls: 'bg-red-100 text-red-700',
      isExpired: true,
      isAvailable: false,
    };
  if (bag.status === 'available')
    return {
      label: 'متاح',
      cls: 'bg-green-100 text-green-700',
      isExpired: false,
      isAvailable: true,
    };
  if (bag.status === 'issued')
    return {
      label: 'مُصدَّر',
      cls: 'bg-blue-100 text-blue-700',
      isExpired: false,
      isAvailable: false,
    };
  if (bag.status === 'rejected')
    return {
      label: 'مرفوض',
      cls: 'bg-orange-100 text-orange-700',
      isExpired: false,
      isAvailable: false,
    };
  return {
    label: bag.status,
    cls: 'bg-gray-100 text-gray-500',
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
