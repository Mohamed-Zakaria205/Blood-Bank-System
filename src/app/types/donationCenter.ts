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
