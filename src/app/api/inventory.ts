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
import {
  bloodBags as MOCK_BAGS,
  bloodInventory as MOCK_INVENTORY,
  initialTransactions as MOCK_TRANSACTIONS,
  initialOutflowRecords as MOCK_OUTFLOW,
  monthlyStats as MOCK_MONTHLY_STATS,
} from '../data/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ── Blood Bags ─────────────────────────────────────────────

/** Fetch all blood bags (unpaginated — used when the full list is needed) */
export async function fetchBloodBags(): Promise<PaginatedResponse<BloodBag>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { data: MOCK_BAGS, total: MOCK_BAGS.length, page: 1, limit: MOCK_BAGS.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<BloodBag>>('/inventory/bags');
  return data;
}

/**
 * Fetch blood bags with pagination, search and filtering.
 *
 * Mock mode: applies client-side slicing to simulate server behavior.
 * Real API: all params are forwarded as query-string parameters.
 */
export async function fetchPaginatedBloodBags(
  filters: BagFilters = {},
): Promise<PaginatedResponse<BloodBag>> {
  const { page = 1, limit = 10, search = '', bloodType = '', status = '' } = filters;

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
    if (bloodType) result = result.filter((b) => b.bloodType === bloodType);
    if (status)    result = result.filter((b) => b.status === status);

    // ── Client-side pagination ─────────────────────────────
    const total = result.length;
    const start = (page - 1) * limit;
    const data  = result.slice(start, start + limit);

    return { data, total, page, limit };
  }

  // ── Real API: forward all params as query-string ─────────
  const { data } = await apiClient.get<PaginatedResponse<BloodBag>>('/inventory/bags', {
    params: { page, limit, search, bloodType, status },
  });
  return data;
}

export async function exportBags(
  bagIds: string[],
  recipient: {
    recipientName: string;
    nationalId: string;
    phone?: string;
    reason: string;
  },
): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return;
  }
  await apiClient.post('/inventory/bags/export', { bagIds, ...recipient });
}

export async function disposeBag(bagId: string, reason: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return;
  }
  await apiClient.post(`/inventory/bags/${bagId}/dispose`, { reason });
}

// ── Blood Inventory Summary ────────────────────────────────
export async function fetchBloodInventory(): Promise<PaginatedResponse<BloodInventoryItem>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return { data: MOCK_INVENTORY, total: MOCK_INVENTORY.length, page: 1, limit: MOCK_INVENTORY.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<BloodInventoryItem>>('/inventory/summary');
  return data;
}

// ── Transactions ───────────────────────────────────────────

/** Fetch all transactions (unpaginated) */
export async function fetchTransactions(): Promise<PaginatedResponse<Transaction>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { data: MOCK_TRANSACTIONS, total: MOCK_TRANSACTIONS.length, page: 1, limit: MOCK_TRANSACTIONS.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<Transaction>>('/inventory/transactions');
  return data;
}

/**
 * Fetch transactions with filtering and pagination.
 * Mock: client-side filter + slice. Real API: forwarded as query-string.
 */
export async function fetchFilteredTransactions(
  filters: TransactionFilters = {},
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

  const { data } = await apiClient.get<PaginatedResponse<Transaction>>('/inventory/transactions', {
    params: { page, limit, search, type, bloodType, dateFrom, dateTo },
  });
  return data;
}

// ── Outflow Records ────────────────────────────────────────
export async function fetchOutflowRecords(): Promise<PaginatedResponse<OutflowRecord>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { data: MOCK_OUTFLOW, total: MOCK_OUTFLOW.length, page: 1, limit: MOCK_OUTFLOW.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<OutflowRecord>>('/inventory/outflow');
  return data;
}

// ── Monthly Stats ──────────────────────────────────────────
export async function fetchMonthlyStats(): Promise<PaginatedResponse<MonthlyStats>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return { data: MOCK_MONTHLY_STATS, total: MOCK_MONTHLY_STATS.length, page: 1, limit: MOCK_MONTHLY_STATS.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<MonthlyStats>>('/stats/monthly');
  return data;
}
