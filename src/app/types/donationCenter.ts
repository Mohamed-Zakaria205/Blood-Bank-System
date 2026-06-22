// ═══════════════════════════════════════════════════════════
// DonationCenter types
// ═══════════════════════════════════════════════════════════

export interface DonationCenter {
  id: string;
  name: string;
  location: string;
  addressDetails: string;
  latitude: number;
  longitude: number;
  centerType: string;
  status: string;
  operatingHours: string;
  availableDonationTypes: string[];
}

export interface WeeklyHours {
  dayOfWeek: number;
  isClosed: boolean;
  openingTime: string;
  closingTime: string;
  maxDonorsPerSlot: number | null;
}

export interface Exclusion {
  id?: string;
  date: string;
  isClosed: boolean;
  specialOpeningTime: string | null;
  specialClosingTime: string | null;
  reason: string;
}

export interface MainBranchSettings {
  id: string;
  name: string;
  location: string;
  addressDetails: string;
  phoneNumber: string;
  email: string;
  supportedDonationTypes: string[];
  slotDurationMinutes: number;
  maxDonorsPerSlot: number;
  weeklyHours: WeeklyHours[];
  exclusions: Exclusion[];
  updatedAt?: string | null;
  version?: number | null;
}

export interface UpdateMainBranchSettingsRequest {
  name: string;
  location: string;
  addressDetails: string;
  supportedDonationTypes: string[];
  slotDurationMinutes: number;
  maxDonorsPerSlot: number;
  weeklyHours: WeeklyHours[];
  exclusions: Exclusion[];
  version?: number | null;
}

