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

/** Pagination query params — sent as query-string to the backend */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Donor-specific filter params */
export interface DonorFilters extends PaginationParams {
  search?: string;
  bloodType?: string;
  status?: string;
  district?: string;
}

/** Blood bag filter params */
export interface BagFilters extends PaginationParams {
  search?: string;
  bloodType?: string;
  status?: string;
}

/** Campaign filter params */
export interface CampaignFilters extends PaginationParams {
  search?: string;
  status?: string;
  city?: string;
}

/** Lab test filter params */
export interface LabTestFilters extends PaginationParams {
  search?: string;
  status?: string;
  bloodType?: string;
}

/** Staff filter params */
export interface StaffFilters extends PaginationParams {
  search?: string;
  role?: string;
  status?: string;
}

/** Transaction filter params */
export interface TransactionFilters extends PaginationParams {
  search?: string;
  type?: string;
  bloodType?: string;
  dateFrom?: string;
  dateTo?: string;
}



/** Re-usable literal unions */
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type DonationType = 'wholeblood' | 'plasma' | 'platelets';
export type DonorStatus = 'eligible' | 'ineligible' | 'deferred';
export type CampaignStatus = 'active' | 'completed';
export type InventoryStatus = 'normal' | 'low' | 'critical';
export type BloodBagStatus =
  | 'available'
  | 'reserved'
  | 'issued'
  | 'expired'
  | 'rejected'
  | 'disposed';
export type TransactionType = 'issue' | 'return' | 'disposal' | 'receive' | 'reserve';
export type OutflowActionType = 'exported' | 'disposed';
