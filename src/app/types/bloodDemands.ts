import type { BloodType, PaginationParams } from './common';

export type BloodDemandStatus = 'Pending' | 'Approved' | 'PartiallyFulfilled' | 'Fulfilled' | 'Cancelled';

export type BloodDemandPriority = 'Low' | 'Medium' | 'High';

export interface IssuanceHistoryItem {
  issuanceId: string;
  issuedAt: string;
  issuedByName: string;
  serialNumber: string;
  recipientName: string;
  nationalId?: string | null;
  phone?: string | null;
  reason?: string | null;
}

export interface BloodDemand {
  id: string;
  requestDate: string;
  bloodType: BloodType;
  requesterName: string;
  requestedUnits: number;
  issuedUnits: number;
  remainingUnits: number;
  priority: BloodDemandPriority;
  status: BloodDemandStatus;
  notes?: string | null;
  createdAt?: string;
}

export interface BloodDemandDetail extends BloodDemand {
  issuanceHistory: IssuanceHistoryItem[];
}

export interface CreateBloodDemandRequest {
  bloodTypeId: number;
  requesterName: string;
  requestedUnits: number;
  priority: BloodDemandPriority;
  notes?: string;
}

export interface BloodDemandFilters extends PaginationParams {
  search?: string;
  status?: BloodDemandStatus | '';
  bloodType?: BloodType | '';
  priority?: BloodDemandPriority | '';
}

export interface BloodDemandDashboardStats {
  total: number;
  pending: number;
  partiallyFulfilled: number;
  fulfilled: number;
}
