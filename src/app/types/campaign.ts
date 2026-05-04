// ═══════════════════════════════════════════════════════════
// Campaign types
// ═══════════════════════════════════════════════════════════
import type { CampaignStatus } from './common';

export interface Campaign {
  id: string;
  title: string;
  location: string;
  city: string;
  date: string;
  endDate?: string;
  targetDonors: number;
  registeredDonors: number;
  status: CampaignStatus;
  createdBy: string;
  createdByName: string;
  description: string;
}

export type CreateCampaignRequest = Omit<Campaign, 'id'>;
