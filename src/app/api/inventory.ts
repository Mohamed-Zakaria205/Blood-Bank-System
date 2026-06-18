// ═══════════════════════════════════════════════════════════
// Inventory API service — bags, transactions, outflow, stats
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type {
  BloodBag,
  BloodInventoryItem,
  Transaction,
  OutflowRecord,
  OutflowRecordDetail,
  MonthlyStats,
  InventoryAnalyticsResponse,
} from '../types/inventory';
import type { PaginatedResponse, BagFilters, TransactionFilters, OutflowFilters } from '../types/common';
import type { ApiResponseWrapper } from '../types/auth';
import {
  bloodInventory as MOCK_INVENTORY,
  initialTransactions as MOCK_TRANSACTIONS,
  monthlyStats as MOCK_MONTHLY_STATS,
} from '../data/inventory.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';


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

/** Fetch all blood bags (unpaginated — used when the full list is needed) */
export async function fetchBloodBags(): Promise<PaginatedResponse<BloodBag>> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<any>>('/inventory/blood-bags');
  const items = wrapper.data?.items || wrapper.data?.data || [];
  return {
    data: items,
    total: wrapper.data?.total ?? items.length,
    page: wrapper.data?.page ?? 1,
    limit: wrapper.data?.limit ?? items.length,
  };
}

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
  const params: Record<string, any> = {
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

  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<any>>('/inventory/blood-bags', {
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

// ── Blood Inventory Summary ────────────────────────────────
export async function fetchBloodInventory(): Promise<PaginatedResponse<BloodInventoryItem>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return {
      data: MOCK_INVENTORY,
      total: MOCK_INVENTORY.length,
      page: 1,
      limit: MOCK_INVENTORY.length,
    };
  }
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<any>>('/inventory/summary');
  const items = wrapper.data?.items || wrapper.data?.data || [];
  return {
    data: items,
    total: wrapper.data?.total ?? items.length,
    page: wrapper.data?.page ?? 1,
    limit: wrapper.data?.limit ?? items.length,
  };
}

// ── Transactions ───────────────────────────────────────────

/** Fetch all transactions (unpaginated) */
export async function fetchTransactions(): Promise<PaginatedResponse<Transaction>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      data: MOCK_TRANSACTIONS,
      total: MOCK_TRANSACTIONS.length,
      page: 1,
      limit: MOCK_TRANSACTIONS.length,
    };
  }
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<any>>('/inventory/transactions');
  const items = wrapper.data?.items || wrapper.data?.data || [];
  return {
    data: items,
    total: wrapper.data?.total ?? items.length,
    page: wrapper.data?.page ?? 1,
    limit: wrapper.data?.limit ?? items.length,
  };
}

/**
 * Fetch transactions with filtering and pagination.
 * Mock: client-side filter + slice. Real API: forwarded as query-string.
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

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));

    let result = MOCK_TRANSACTIONS;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.bagCodes.some((c) => c.toLowerCase().includes(q)));
    }
    if (type) result = result.filter((t) => t.type === type);
    if (bloodType) result = result.filter((t) => t.bloodType === bloodType);
    if (dateFrom) result = result.filter((t) => t.timestamp >= dateFrom);
    if (dateTo) result = result.filter((t) => t.timestamp <= dateTo);

    const total = result.length;
    const data = result.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  }

  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<any>>('/inventory/transactions', {
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

  const params: Record<string, any> = {
    page,
    limit,
  };
  if (search) params.search = search;
  if (actionType && actionType !== 'all') params.actionType = actionType;
  if (bloodType && bloodType !== 'all') params.bloodType = bloodType;
  if (performedById) params.performedById = performedById;

  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<any>>('/inventory/outflow', {
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

  const params: Record<string, any> = {};
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

// ── Monthly Stats ──────────────────────────────────────────
export async function fetchMonthlyStats(): Promise<PaginatedResponse<MonthlyStats>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return {
      data: MOCK_MONTHLY_STATS,
      total: MOCK_MONTHLY_STATS.length,
      page: 1,
      limit: MOCK_MONTHLY_STATS.length,
    };
  }
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<any>>('/stats/monthly');
  const items = wrapper.data?.items || wrapper.data?.data || [];
  return {
    data: items,
    total: wrapper.data?.total ?? items.length,
    page: wrapper.data?.page ?? 1,
    limit: wrapper.data?.limit ?? items.length,
  };
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

