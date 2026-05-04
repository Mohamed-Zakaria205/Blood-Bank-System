// ═══════════════════════════════════════════════════════════
// Common / shared types & generic API wrappers
// ═══════════════════════════════════════════════════════════

/** Standard paginated response from the backend */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** Standard single-item response from the backend */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Standardised API error shape */
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

/** Re-usable literal unions */
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type DonationType = 'whole' | 'plasma' | 'platelets';
export type DonorStatus = 'eligible' | 'ineligible' | 'deferred';
export type CampaignStatus = 'active' | 'completed';
export type InventoryStatus = 'normal' | 'low' | 'critical';
export type BloodBagStatus = 'available' | 'reserved' | 'issued' | 'expired' | 'rejected' | 'disposed';
export type TransactionType = 'issue' | 'return' | 'disposal' | 'receive' | 'reserve';
export type RequestUrgency = 'normal' | 'urgent' | 'emergency';
export type RequestStatus = 'pending' | 'approved' | 'fulfilled' | 'rejected';
export type OutflowActionType = 'exported' | 'disposed';
export type DestinationType = 'hospital' | 'patient';
