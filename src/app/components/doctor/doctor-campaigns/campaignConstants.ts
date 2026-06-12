// ── Shared types and constants for DoctorCampaigns module ──

export const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  notactive: 'bg-amber-100 text-amber-700',
  completed: 'bg-muted text-muted-foreground',
};

export const statusLabels: Record<string, string> = {
  active: 'نشطة',
  notactive: 'غير نشطة',
  completed: 'منتهية',
};

export const DURATION_OPTIONS = [
  { value: '15', label: '١٥ دقيقة' },
  { value: '30', label: '٣٠ دقيقة' },
  { value: '45', label: '٤٥ دقيقة' },
  { value: '60', label: 'ساعة كاملة' },
  { value: '90', label: 'ساعة ونصف' },
  { value: '120', label: 'ساعتان' },
];

export const FORM_DEFAULTS = {
  title: '',
  city: 'مركز وبندر بني سويف',
  latitude: '',
  longitude: '',
  targetDonors: '30',
  description: '',
  startTime: '08:00',
  endTime: '16:00',
  slotDuration: '15',
  slotCapacity: '5',
  recurrenceType: 'none' as 'none' | 'daily' | 'weekly' | 'monthly' | 'custom',
  recurrenceDays: [] as number[],
  recurrenceEndDate: '',
  availableDonationTypes: ['wholeblood'] as string[],
};

export type CampaignFormState = typeof FORM_DEFAULTS;

export const DONATION_TYPE_LABELS: Record<string, string> = {
  wholeblood: 'دم كامل',
  plasma: 'بلازما',
  platelets: 'صفائح دموية',
};

// ── Helper: compute generated slots ──

export interface GeneratedSlot {
  time: string;
  endTime: string;
  capacity: number;
  booked: number;
}

export function buildSlots(
  startTime: string,
  endTime: string,
  duration: string,
  capacity: string,
): GeneratedSlot[] {
  if (!startTime || !endTime || !duration) return [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  const dur = parseInt(duration) || 30;
  const cap = Math.max(1, parseInt(capacity) || 1);
  
  // Support campaigns crossing midnight
  if (endMin <= startMin) {
    endMin += 24 * 60;
  }
  
  if (dur <= 0) return [];
  
  const result: GeneratedSlot[] = [];
  for (let t = startMin; t + dur <= endMin; t += dur) {
    const fmt = (min: number) => {
      const normalizedMin = min % (24 * 60);
      return `${String(Math.floor(normalizedMin / 60)).padStart(2, '0')}:${String(normalizedMin % 60).padStart(2, '0')}`;
    };
    result.push({
      time: fmt(t),
      endTime: fmt(t + dur),
      capacity: cap,
      booked: 0,
    });
  }
  return result;
}
