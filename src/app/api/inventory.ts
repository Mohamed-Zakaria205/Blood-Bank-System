// ═══════════════════════════════════════════════════════════
// Inventory API service — bags, transactions, outflow, stats
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type {
  BloodBag,
  BloodInventoryItem,
  Transaction,
  OutflowRecord,
  MonthlyStats,
} from '../types/inventory';
import type { PaginatedResponse, BagFilters, TransactionFilters } from '../types/common';
import type { ApiResponseWrapper } from '../types/auth';
import {
  bloodBags as MOCK_BAGS,
  bloodInventory as MOCK_INVENTORY,
  initialTransactions as MOCK_TRANSACTIONS,
  monthlyStats as MOCK_MONTHLY_STATS,
} from '../data/inventory.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function deriveOutflowRecordsFromTransactions(): OutflowRecord[] {
  return MOCK_TRANSACTIONS.filter((t) => t.type === 'issue' || t.type === 'disposal').map((t, index) => {
    const bag = MOCK_BAGS.find(b => b.id === t.bagIds[0]);
    return {
      id: `OUT-MOCK-${String(index + 1).padStart(3, '0')}`,
      bagId: t.bagIds[0] ?? '',
      bagCode: t.bagCodes[0] ?? '',
      bloodType: t.bloodType,
      donationType: bag?.donationType || 'wholeblood',
      actionType: t.type === 'issue' ? 'exported' : 'disposed',
      recipientName: t.type === 'issue' ? t.destination : undefined,
      reason: t.notes ?? (t.type === 'issue' ? 'صرف من المخزون' : 'إتلاف من المخزون'),
      performedBy: t.performedBy,
      performedByName: t.performedByName,
      timestamp: t.timestamp,
    };
  });
}

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
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { data: MOCK_BAGS, total: MOCK_BAGS.length, page: 1, limit: MOCK_BAGS.length };
  }
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
 *
 * Mock mode: applies client-side slicing to simulate server behavior.
 * Real API: all params are forwarded as query-string parameters.
 */
export async function fetchPaginatedBloodBags(
  filters: BagFilters = {}, options?: { signal?: AbortSignal }
): Promise<PaginatedResponse<BloodBag>> {
  const { page = 1, limit = 10, search = '', bloodType = '', bloodTypes = '', donationType = '', status = '', sortBy = 'createdAt', sortOrder = 'desc' } = filters;

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));

    // ── Client-side filtering ──────────────────────────────
    let result = MOCK_BAGS;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.bagCode.toLowerCase().includes(q) ||
          (b.donorCode?.toLowerCase().includes(q) ?? false),
      );
    }
    if (bloodType) {
      result = result.filter((b) => b.bloodType === bloodType);
    }
    if (bloodTypes) {
      const typesList = bloodTypes.split(',').map((t) => t.trim());
      result = result.filter((b) => typesList.includes(b.bloodType));
    }
    if (donationType) {
      result = result.filter((b) => b.donationType === donationType);
    }
    
    if (status) {
      result = result.filter((b) => b.status === status);
    } else {
      // Default behavior: return active inventory (available and expired)
      result = result.filter((b) => b.status === 'available' || b.status === 'expired');
    }

    // ── Client-side sorting ────────────────────────────────
    const allowedSortFields = ['bagCode', 'collectedDate', 'expiryDate', 'createdAt'];
    const activeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const activeSortOrder = sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc';

    if (activeSortBy) {
      const order = activeSortOrder === 'desc' ? -1 : 1;
      result = [...result].sort((a, b) => {
        const valA: any = a[activeSortBy as keyof BloodBag] ?? '';
        const valB: any = b[activeSortBy as keyof BloodBag] ?? '';

        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * order;
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * order;
        }
        return 0;
      });
    }

    // ── Client-side pagination ─────────────────────────────
    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data  = result.slice(start, start + limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return { data, total, page, limit, totalPages, hasNextPage, hasPreviousPage };
  }

  // ── Real API: forward all params as query-string ─────────
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<any>>('/inventory/blood-bags', {
    params: { page, limit, search, bloodType, bloodTypes, donationType, status, sortBy, sortOrder }, signal: options?.signal,
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
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const results: BulkOperationResult[] = [];
    const updatedBags: BloodBag[] = [];
    let processed = 0;
    let failed = 0;

    const currentTimestamp = new Date().toISOString();

    for (const id of bagIds) {
      const bag = MOCK_BAGS.find((b) => b.id === id);
      if (!bag) {
        failed++;
        results.push({
          bagId: id,
          success: false,
          errorCode: 'NOT_FOUND',
          error: 'حقيبة الدم غير موجودة',
        });
        continue;
      }

      // Validations
      if (bag.status === 'expired') {
        failed++;
        results.push({
          bagId: id,
          success: false,
          errorCode: 'EXPIRED_BAG',
          error: 'الحقيبة منتهية الصلاحية ولا يمكن صرفها',
        });
      } else if (bag.status === 'disposed') {
        failed++;
        results.push({
          bagId: id,
          success: false,
          errorCode: 'INVALID_STATUS',
          error: 'الحقيبة تالفة ولا يمكن صرفها',
        });
      } else if (bag.status === 'issued') {
        failed++;
        results.push({
          bagId: id,
          success: false,
          errorCode: 'ALREADY_ISSUED',
          error: 'الحقيبة منصرفة بالفعل',
        });
      } else {
        // Success
        processed++;
        bag.status = 'issued';
        bag.issuedAt = currentTimestamp;
        bag.issuedById = 'USR-008';
        bag.issuedByName = 'أ. نادية فتحي حسين';
        bag.updatedAt = currentTimestamp;

        results.push({
          bagId: id,
          success: true,
        });
        updatedBags.push(bag);
      }
    }

    return { processed, failed, results, updatedBags };
  }

  const { data: wrapper } = await apiClient.post<ApiResponseWrapper<BulkOperationResponse>>('/inventory/blood-bags/issue', { bagIds, ...recipient });
  return wrapper.data;
}

export async function disposeBags(
  bagIds: string[],
  reason: string,
  notes?: string
): Promise<BulkOperationResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const results: BulkOperationResult[] = [];
    const updatedBags: BloodBag[] = [];
    let processed = 0;
    let failed = 0;

    const currentTimestamp = new Date().toISOString();

    for (const id of bagIds) {
      const bag = MOCK_BAGS.find((b) => b.id === id);
      if (!bag) {
        failed++;
        results.push({
          bagId: id,
          success: false,
          errorCode: 'NOT_FOUND',
          error: 'حقيبة الدم غير موجودة',
        });
        continue;
      }

      // Validations
      if (bag.status === 'disposed') {
        failed++;
        results.push({
          bagId: id,
          success: false,
          errorCode: 'ALREADY_DISPOSED',
          error: 'الحقيبة تالفة بالفعل',
        });
      } else if (bag.status === 'issued') {
        failed++;
        results.push({
          bagId: id,
          success: false,
          errorCode: 'INVALID_STATUS',
          error: 'الحقيبة منصرفة بالفعل ولا يمكن إتلافها',
        });
      } else {
        // Success
        processed++;
        // Disposal reasons should be immutable after disposal
        bag.status = 'disposed';
        bag.disposedAt = currentTimestamp;
        bag.disposedById = 'USR-008';
        bag.disposedByName = 'أ. نادية فتحي حسين';
        bag.disposeReason = reason;
        bag.disposeNotes = notes || '';
        bag.updatedAt = currentTimestamp;

        results.push({
          bagId: id,
          success: true,
        });
        updatedBags.push(bag);
      }
    }

    return { processed, failed, results, updatedBags };
  }

  const { data: wrapper } = await apiClient.post<ApiResponseWrapper<BulkOperationResponse>>('/inventory/blood-bags/dispose', { bagIds, reason, notes });
  return wrapper.data;
}

// ── Blood Inventory Summary ────────────────────────────────
export async function fetchBloodInventory(): Promise<PaginatedResponse<BloodInventoryItem>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return { data: MOCK_INVENTORY, total: MOCK_INVENTORY.length, page: 1, limit: MOCK_INVENTORY.length };
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
    return { data: MOCK_TRANSACTIONS, total: MOCK_TRANSACTIONS.length, page: 1, limit: MOCK_TRANSACTIONS.length };
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
  options?: { signal?: AbortSignal }
): Promise<PaginatedResponse<Transaction>> {
  const { page = 1, limit = 10, search = '', type = '', bloodType = '', dateFrom = '', dateTo = '' } = filters;

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));

    let result = MOCK_TRANSACTIONS;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.bagCodes.some((c) => c.toLowerCase().includes(q)));
    }
    if (type)      result = result.filter((t) => t.type === type);
    if (bloodType) result = result.filter((t) => t.bloodType === bloodType);
    if (dateFrom)  result = result.filter((t) => t.timestamp >= dateFrom);
    if (dateTo)    result = result.filter((t) => t.timestamp <= dateTo);

    const total = result.length;
    const data  = result.slice((page - 1) * limit, page * limit);
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
export async function fetchOutflowRecords(): Promise<PaginatedResponse<OutflowRecord>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const mockOutflow = deriveOutflowRecordsFromTransactions();
    return { data: mockOutflow, total: mockOutflow.length, page: 1, limit: mockOutflow.length };
  }
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<any>>('/inventory/outflow');
  const items = wrapper.data?.items || wrapper.data?.data || [];
  return {
    data: items,
    total: wrapper.data?.total ?? items.length,
    page: wrapper.data?.page ?? 1,
    limit: wrapper.data?.limit ?? items.length,
  };
}

// ── Monthly Stats ──────────────────────────────────────────
export async function fetchMonthlyStats(): Promise<PaginatedResponse<MonthlyStats>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return { data: MOCK_MONTHLY_STATS, total: MOCK_MONTHLY_STATS.length, page: 1, limit: MOCK_MONTHLY_STATS.length };
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
