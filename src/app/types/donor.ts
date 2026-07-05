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

export type EligibilityStatus = 'eligible' | 'soon' | 'not_yet' | 'deferred' | 'ineligible';

export interface EligibilityResult {
  status: EligibilityStatus;
  daysLeft: number;
  daysAgo: number;
  eligibleDate: string;
}

export interface EligibilityStats {
  statusCounts: {
    all: number;
    eligible: number;
    soon: number;
    not_yet: number;
    deferred: number;
    ineligible: number;
  };
  bloodTypeCounts: Record<BloodType, { eligible: number; total: number }>;
}

export interface DonorEligibilityFilters {
  search?: string;
  bloodType?: string;
  status?: string;
  district?: string;
  gender?: string;
  hasMobileApp?: boolean;
}

export type SendNotificationRequest = SelectedNotificationRequest | FilteredNotificationRequest;

export interface SelectedNotificationRequest {
  selectionMode?: 'selected';
  donorIds: string[];
}

export interface FilteredNotificationRequest {
  selectionMode: 'filtered';
  filters: DonorEligibilityFilters;
  excludedDonorIds: string[];
}

export type NotificationPreviewRequest = SendNotificationRequest;

export interface NotificationPreviewResponse {
  title: string;
  message: string;
  recipientCount: number;
  failedCount: number;
  failedDonors: FailedDonorDetail[];
}

export interface FailedDonorDetail {
  donorId: string;
  fullName: string;
  phoneNumber: string;
  bloodType: string;
  failureReason: string;
}

export interface SendNotificationResponse {
  appealId?: string | null;
  requested: number;
  sent: number;
  failed: number;
  failedDonors: FailedDonorDetail[];
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
  governorate?: string;
  area?: string;
  dateOfBirth?: string;
  bloodType?: BloodType;
  status: DonorStatus;
  rejectionReason?: string;
  deferredUntil?: string;

  // ── Backend-generated / meta fields ─────────────────────
  registeredAt?: string;
  registeredBy?: string;
  lastDonationDate?: string;
  donations?: number;
  points?: number;
  campaignId?: string;
  campaignName?: string;
  hasAppAccount?: boolean;

  // ── Calculated Eligibility fields ────────────────────────
  eligibility?: EligibilityResult;
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
  source: 'walkin' | 'mobileapp' | 'campaign';
  campaignId?: string;
  campaignName?: string;
  donationDate: string;
  // ── Medical screening data ──────────────────────────────
  diseases: string[];
  additionalData?: AdditionalData;
  isAllergic?: boolean;
  donorCode?: string;
  sentToLab?: boolean;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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
  source: 'walkin' | 'app' | 'campaign';
  /**
   * UUID of the entity this donation is linked to (semantics differ by source):
   * - walkin:   the donation center's GUID (main branch)
   * - campaign: the campaign's own GUID (backend links the donation to the campaign)
   */
  donationCenterId?: string;
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
  bloodType?: BloodType;
  donationType?: DonationType;
}

/**
 * PATCH /donors/:id — request body.
 * Partial update: only the fields that changed need to be sent.
 */
export type UpdateDonorRequest = Partial<
  BasicDonationRequest & MedicalRecordRequest & { address?: string }
>;

export interface EligibilitySettings {
  wholeBloodMaleDays: number;
  wholeBloodFemaleDays: number;
  plasmaDays: number;
  plateletsDays: number;
  defaultScreeningLockoutDays: number;
}
