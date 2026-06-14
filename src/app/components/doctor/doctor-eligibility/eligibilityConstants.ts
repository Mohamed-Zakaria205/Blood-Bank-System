import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import type { Donor, EligibilityResult } from '../../../types/donor';

// ──────────────────────────────────────────
// Eligibility engine
// ──────────────────────────────────────────
export const MALE_WAIT = 90; // days
export const FEMALE_WAIT = 120; // days

/** Always returns the current date so eligibility is never stale. */
export const getToday = () => new Date();

export type EnrichedDonor = Donor & { eligibility: EligibilityResult };

export function calcEligibility(donor: Donor): EligibilityResult {
  const today = getToday();
  if (donor.status === 'rejected')
    return { status: 'ineligible', daysLeft: 0, daysAgo: 0, eligibleDate: '—' };
  if (donor.status === 'deferred' && donor.deferredUntil) {
    const def = new Date(donor.deferredUntil);
    const daysLeft = Math.ceil((def.getTime() - today.getTime()) / 86400000);
    if (daysLeft > 0)
      return {
        status: 'deferred',
        daysLeft,
        daysAgo: 0,
        eligibleDate: donor.deferredUntil,
      };
  }
  if (!donor.lastDonationDate)
    return {
      status: 'eligible',
      daysLeft: 0,
      daysAgo: 999,
      eligibleDate: 'الآن',
    };

  const last = new Date(donor.lastDonationDate);
  const daysAgo = Math.floor((today.getTime() - last.getTime()) / 86400000);
  const wait = donor.gender === 'male' ? MALE_WAIT : FEMALE_WAIT;
  const daysLeft = wait - daysAgo;
  const eligibleDate = new Date(last.getTime() + wait * 86400000).toISOString().split('T')[0];

  if (daysLeft <= 0) return { status: 'eligible', daysLeft: 0, daysAgo, eligibleDate };
  if (daysLeft <= 14) return { status: 'soon', daysLeft, daysAgo, eligibleDate };
  return { status: 'not_yet', daysLeft, daysAgo, eligibleDate };
}

// ──────────────────────────────────────────
// Status configuration (badges, icons, colors)
// ──────────────────────────────────────────
export const statusCfg = {
  eligible: {
    label: 'مؤهل الآن',
    badge: 'bg-green-100 text-green-700',
    icon: CheckCircle2,
    dot: 'bg-green-500',
    row: 'border-green-100',
  },
  soon: {
    label: 'قريباً',
    badge: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
    dot: 'bg-yellow-400',
    row: 'border-yellow-100',
  },
  not_yet: {
    label: 'لم يحن وقته',
    badge: 'bg-muted text-muted-foreground',
    icon: XCircle,
    dot: 'bg-gray-400',
    row: 'border-border',
  },
  deferred: {
    label: 'موجّل',
    badge: 'bg-orange-100 text-orange-600',
    icon: AlertTriangle,
    dot: 'bg-orange-400',
    row: 'border-orange-100',
  },
  ineligible: {
    label: 'غير مؤهل',
    badge: 'bg-red-100 text-red-600',
    icon: XCircle,
    dot: 'bg-red-500',
    row: 'border-red-100',
  },
} as const;

export interface NotifModal {
  donors: Donor[];
  type: 'emergency' | 'ready';
}
