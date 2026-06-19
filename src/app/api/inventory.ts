// ═══════════════════════════════════════════════════════════
// Inventory API service — bags, transactions, outflow, stats
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type {
  BloodBag,
  Transaction,
  OutflowRecord,
  OutflowRecordDetail,
  InventoryAnalyticsResponse,
  InventoryDashboardResponse,
  AdminInventoryDashboardData,
  AdminDashboardResponse,
} from '../types/inventory';
import type { PaginatedResponse, BagFilters, TransactionFilters, OutflowFilters } from '../types/common';
import type { ApiResponseWrapper } from '../types/auth';


export interface BulkOperationResult {
  bagId: string;
  success: boolean;
  errorCode?: string;
  error?: string;
}

export interface BulkOperationResponse {
  processed: number;
  failed: number;
  results: BulkOperationResult[];
  updatedBags: BloodBag[];
}

// ── Blood Bags ─────────────────────────────────────────────

/**
 * Fetch blood bags with pagination, search and filtering.
 * Real API: all params are forwarded as query-string parameters.
 */
export async function fetchPaginatedBloodBags(
  filters: BagFilters = {},
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<BloodBag>> {
  const { page = 1, limit = 10, search = '', bloodType = '', bloodTypes = '', donationType = '', status = '', sortBy = 'createdAt', sortOrder = 'desc' } = filters;

  // ── Real API: forward all params as query-string ─────────
  const params: Record<string, string | number | boolean | undefined> = {
    page,
    limit,
    sortBy,
    sortOrder,
  };
  if (search) params.search = search;
  if (bloodType) params.bloodType = bloodType;
  if (bloodTypes) params.bloodTypes = bloodTypes;
  if (donationType && donationType !== 'all') params.donationType = donationType;
  if (status && status !== 'active') params.status = status;

  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<{
    items?: BloodBag[];
    data?: BloodBag[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  }>>('/inventory/blood-bags', {
    params,
    signal: options?.signal,
  });
  const items = wrapper.data?.items || wrapper.data?.data || [];
  return {
    data: items,
    total: wrapper.data?.total ?? 0,
    page: wrapper.data?.page ?? page,
    limit: wrapper.data?.limit ?? limit,
    totalPages: wrapper.data?.totalPages,
    hasNextPage: wrapper.data?.hasNextPage,
    hasPreviousPage: wrapper.data?.hasPreviousPage,
  };
}

export async function exportBags(
  bagIds: string[],
  recipient: {
    recipientName: string;
    nationalId: string;
    phone?: string;
    reason: string;
  },
): Promise<BulkOperationResponse> {
  const { data: wrapper } = await apiClient.post<ApiResponseWrapper<BulkOperationResponse>>('/inventory/blood-bags/issue', { bagIds, ...recipient });
  return wrapper.data;
}

export async function disposeBags(
  bagIds: string[],
  reason: string,
  notes?: string
): Promise<BulkOperationResponse> {
  const { data: wrapper } = await apiClient.post<ApiResponseWrapper<BulkOperationResponse>>('/inventory/blood-bags/dispose', { bagIds, reason, notes });
  return wrapper.data;
}

export interface BloodBagsStats {
  availableCount: number;
  expiredCount: number;
  issuedCount: number;
  disposedCount: number;
  testingCount?: number;
  wastePercentage?: number;
}

export async function fetchBloodBagsStats(): Promise<BloodBagsStats> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<BloodBagsStats>>('/inventory/blood-bags/stats');
  return wrapper.data;
}

// ── Transactions ───────────────────────────────────────────

/**
 * Fetch transactions with filtering and pagination.
 * Real API: forwarded as query-string.
 */
export async function fetchFilteredTransactions(
  filters: TransactionFilters = {},
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<Transaction>> {
  const {
    page = 1,
    limit = 10,
    search = '',
    type = '',
    bloodType = '',
    dateFrom = '',
    dateTo = '',
  } = filters;

  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<{
    items?: Transaction[];
    data?: Transaction[];
    total?: number;
    page?: number;
    limit?: number;
  }>>('/inventory/transactions', {
    params: { page, limit, search, type, bloodType, dateFrom, dateTo }, signal: options?.signal,
  });
  const items = wrapper.data?.items || wrapper.data?.data || [];
  return {
    data: items,
    total: wrapper.data?.total ?? 0,
    page: wrapper.data?.page ?? page,
    limit: wrapper.data?.limit ?? limit,
  };
}

// ── Outflow Records ────────────────────────────────────────
export async function fetchOutflowRecords(
  filters: OutflowFilters = {},
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<OutflowRecord>> {
  const { page = 1, limit = 10, search = '', actionType = '', bloodType = '', performedById = '' } = filters;

  const params: Record<string, string | number | boolean | undefined> = {
    page,
    limit,
  };
  if (search) params.search = search;
  if (actionType && actionType !== 'all') params.actionType = actionType;
  if (bloodType && bloodType !== 'all') params.bloodType = bloodType;
  if (performedById) params.performedById = performedById;

  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<{
    items?: OutflowRecord[];
    data?: OutflowRecord[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  }>>('/inventory/outflow', {
    params,
    signal: options?.signal,
  });
  const items = wrapper.data?.items || wrapper.data?.data || [];
  return {
    data: items,
    total: wrapper.data?.total ?? items.length,
    page: wrapper.data?.page ?? page,
    limit: wrapper.data?.limit ?? limit,
    totalPages: wrapper.data?.totalPages,
    hasNextPage: wrapper.data?.hasNextPage,
    hasPreviousPage: wrapper.data?.hasPreviousPage,
  };
}

export async function fetchOutflowRecordDetail(
  id: string,
  options?: { signal?: AbortSignal },
): Promise<OutflowRecordDetail> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<OutflowRecordDetail>>(`/inventory/outflow/${id}`, {
    signal: options?.signal,
  });
  return wrapper.data;
}

export async function exportOutflowReport(
  filters: OutflowFilters = {}
): Promise<Blob> {
  const { search = '', actionType = '', bloodType = '', performedById = '' } = filters;

  const params: Record<string, string | number | boolean | undefined> = {};
  if (search) params.search = search;
  if (actionType && actionType !== 'all') params.actionType = actionType;
  if (bloodType && bloodType !== 'all') params.bloodType = bloodType;
  if (performedById) params.performedById = performedById;

  const response = await apiClient.get('/inventory/outflow/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
}

// ── Analytics & Thresholds ───────────────────────────────────

export async function fetchInventoryAnalytics(): Promise<InventoryAnalyticsResponse> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<InventoryAnalyticsResponse>>('/inventory/analytics');
  return wrapper.data;
}

export async function fetchInventoryThresholds(): Promise<Record<string, number>> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<Record<string, number>>>('/inventory/thresholds');
  return wrapper.data;
}

export async function updateInventoryThresholds(thresholds: Record<string, number>): Promise<Record<string, number>> {
  const { data: wrapper } = await apiClient.put<ApiResponseWrapper<Record<string, number>>>('/inventory/thresholds', { thresholds });
  return wrapper.data;
}

export async function fetchInventoryDashboard(): Promise<InventoryDashboardResponse> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<InventoryDashboardResponse>>('/inventory/dashboard');
  return wrapper.data;
}

export async function fetchAdminInventoryDashboard(): Promise<AdminInventoryDashboardData> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<AdminInventoryDashboardData>>('/admin/inventory/dashboard');
  return wrapper.data;
}

export async function fetchAdminDashboard(): Promise<AdminDashboardResponse> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<AdminDashboardResponse>>('/admin/dashboard');
  return wrapper.data;
}



