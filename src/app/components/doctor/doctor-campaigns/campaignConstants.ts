// ── Shared types and constants for DoctorCampaigns module ──

export const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-600',
};

export const statusLabels: Record<string, string> = {
  active: 'نشطة',
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
  location: '',
  city: 'بني سويف',
  date: '',
  targetDonors: '',
  description: '',
  startTime: '08:00',
  endTime: '16:00',
  slotDuration: '30',
  slotCapacity: '2',
};

export type CampaignFormState = typeof FORM_DEFAULTS;

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
  const endMin = eh * 60 + em;
  const dur = parseInt(duration) || 30;
  const cap = Math.max(1, parseInt(capacity) || 1);
  if (endMin <= startMin || dur <= 0) return [];
  const result: GeneratedSlot[] = [];
  for (let t = startMin; t + dur <= endMin; t += dur) {
    const fmt = (min: number) =>
      `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
    result.push({
      time: fmt(t),
      endTime: fmt(t + dur),
      capacity: cap,
      booked: 0,
    });
  }
  return result;
}
