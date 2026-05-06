// ═══════════════════════════════════════════════════════════
// Donor types
// ═══════════════════════════════════════════════════════════
import type { BloodType, DonationType, DonorStatus } from './common';

export interface MedicalQuestions {
  feelingWell: boolean;
  recentMedications: boolean;
  chronicDiseases: boolean;
  hadSurgery: boolean;
  anemia: boolean;
  infectiousDiseases: boolean;
  receivedBlood: boolean;
  pregnant: boolean;
}

/** Full donor entity (returned by the backend) */
export interface Donor {
  id: string;
  donorCode: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  nationalId: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  address: string;
  city: string;
  bloodType: BloodType;
  lastDonationDate?: string;
  donationType: DonationType;
  medicalQuestions?: MedicalQuestions;
  diseases: string[];
  additionalData?: { weight?: number; height?: number; hemoglobin?: number; bloodPressure?: string };
  status: DonorStatus;
  registeredBy?: string;
  registeredAt?: string;
  source: 'walkin' | 'app' | 'campaign';
  campaignId?: string;
  campaignName?: string;
  deferredUntil?: string;
  donations?: number;
  points?: number;
  // ── Registration-time fields ──────────────────────────
  weight?: number;
  bloodPressure?: string;
  hemoglobin?: number;
  isAllergic?: boolean;
  rejectionReason?: string;
  lockoutUntil?: string;
}

/** POST /donors — request body (backend generates id & donorCode) */
export type CreateDonorRequest = Omit<Donor, 'id' | 'donorCode'>;
