// ═══════════════════════════════════════════════════════════
// Donor types
// ═══════════════════════════════════════════════════════════
import type { BloodType, DonationType, DonorStatus } from "./common";

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

/** Physical / lab measurements collected during registration */
export interface AdditionalData {
  weight?: number;
  height?: number;
  hemoglobin?: number;
  bloodPressure?: string;
}

/** Full donor entity (returned by the backend) */
export interface Donor {
  id: string;
  donorCode: string;
  name: string;
  gender: "male" | "female";
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
  additionalData?: AdditionalData;
  status: DonorStatus;
  isAllergic?: boolean;
  rejectionReason?: string;
  deferredUntil?: string;
  lockoutUntil?: string;
  // ── Backend-generated / meta fields ─────────────────────
  registeredBy?: string;
  registeredAt?: string;
  source: "walkin" | "app" | "campaign";
  campaignId?: string;
  campaignName?: string;
  donations?: number;
  points?: number;
}

/**
 * POST /donors — request body.
 * Backend auto-generates: id, donorCode, registeredAt, donations, points.
 */
export type CreateDonorRequest = Omit<
  Donor,
  "id" | "donorCode" | "registeredAt" | "donations" | "points"
>;
