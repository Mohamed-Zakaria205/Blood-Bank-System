// ═══════════════════════════════════════════════════════════
// Campaign types
// ═══════════════════════════════════════════════════════════
import type { CampaignStatus } from './common';

export interface RecurrenceSettings {
  enabled: boolean;
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  weekDays?: number[]; // [0 = Sunday, 1 = Monday, etc.]
  endDate?: string | null;
}

export interface Campaign {
  id: string;
  title: string;
  city: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  targetDonors: number;
  registeredDonors: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  slotCapacity: number;
  /** Number of app-booked appointments for this campaign — returned by the backend. */
  appointmentsCount?: number;
  status: CampaignStatus;
  createdBy: string;
  createdByName: string;
  description: string;
  recurrence?: RecurrenceSettings;
  availableDonationTypes?: string[];
}

export interface CreateCampaignRequest {
  title: string;
  city: string;
  latitude?: number;
  longitude?: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  slotCapacity: number;
  targetDonors: number;
  description: string;
  recurrence?: RecurrenceSettings;
  availableDonationTypes?: string[];
}

/**
 * PATCH /campaigns/:id — request body.
 * Partial update: only the fields that changed need to be sent.
 */
export type UpdateCampaignRequest = Partial<CreateCampaignRequest>;
