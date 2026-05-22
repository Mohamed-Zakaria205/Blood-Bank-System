// ═══════════════════════════════════════════════════════════
// Donor & Donation types
// ═══════════════════════════════════════════════════════════
import type { BloodType, DonationType, DonorStatus } from './common';

/** Physical / lab measurements collected during registration */
export interface AdditionalData {
  weight: number;
  height?: number;
  hemoglobin: number;
  bloodPressure: string;
}

/**
 * Persistent donor profile (returned by GET /donors).
 * Contains only basic identity and long-term eligibility status.
 */
export interface Donor {
  id: string;
  donorCode: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  nationalId: string;
  phone: string;
  address: string;
  district: string;
  bloodType: BloodType;
  status: DonorStatus;
  rejectionReason?: string;
  deferredUntil?: string;

  // ── Backend-generated / meta fields ─────────────────────
  registeredAt?: string;
  registeredBy?: string;
  lastDonationDate?: string;
  donations?: number;
  points?: number;
  source?: 'walkin' | 'app' | 'campaign';
  campaignId?: string;
  campaignName?: string;
}

/**
 * Single donation event (returned by GET /donations).
 * Represents one donation occurrence linked to a donor.
 */
export interface Donation {
  id: string;
  donationCode: string;
  donorId: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  nationalId: string;
  phone: string;
  address: string;
  district: string;
  bloodType: BloodType;
  donationType: DonationType;
  source: 'walkin' | 'app' | 'campaign';
  campaignId?: string;
  campaignName?: string;
  donationDate: string;
  // ── Medical screening data ──────────────────────────────
  diseases: string[];
  additionalData?: AdditionalData;
  isAllergic?: boolean;
  donorCode?: string;
  sentToLab?: boolean;
  status?: string;
}

/**
 * POST /donations — Step 1: Basic Information
 */
export interface BasicDonationRequest {
  nationalId: string;
  name: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  phone: string;
  governorate: string;
  district: string;
  area: string;
  bloodType: BloodType;
  source: 'walkin' | 'app' | 'campaign';
  donationCenterId?: string;
  donationType: DonationType;
}

/**
 * POST /donations/:id/medical-record — Step 2: Medical Information
 */
export interface MedicalRecordRequest {
  status: DonorStatus;
  diseases: string[];
  additionalData: AdditionalData;
  isAllergic?: boolean;
  rejectionReason?: string;
  deferredUntil?: string;

}

/**
 * PATCH /donors/:id — request body.
 * Partial update: only the fields that changed need to be sent.
 */
export type UpdateDonorRequest = Partial<BasicDonationRequest & MedicalRecordRequest>;
