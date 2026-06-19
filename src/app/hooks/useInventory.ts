// ═══════════════════════════════════════════════════════════
// React Query hooks — Inventory (bags, transactions, outflow, stats)
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPaginatedBloodBags,
  fetchBloodBagsStats,
  exportBags,
  disposeBags,
  fetchFilteredTransactions,
  fetchOutflowRecords,
  fetchOutflowRecordDetail,
  fetchInventoryAnalytics,
  fetchInventoryThresholds,
  updateInventoryThresholds,
  fetchInventoryDashboard,
  fetchAdminInventoryDashboard,
  fetchAdminDashboard,
} from '../api/inventory';
import type { BagFilters, TransactionFilters, OutflowFilters } from '../types/common';

// ── Blood Bags ─────────────────────────────────────────────


/**
 * Fetch blood bags with server-ready pagination, search and filtering.
 * Each unique set of filters is cached separately via structured query keys.
 * `placeholderData: keepPreviousData` prevents flicker between page transitions.
 */
export function usePaginatedBloodBags(filters: BagFilters = {}) {
  return useQuery({
    queryKey: ['bags', 'paginated', filters],
    queryFn: ({ signal }) => fetchPaginatedBloodBags(filters, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

export function useBloodBagsStats() {
  return useQuery({
    queryKey: ['bags', 'stats'],
    queryFn: fetchBloodBagsStats,
  });
}

export function useExportBags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bagIds,
      recipient,
    }: {
      bagIds: string[];
      recipient: {
        recipientName: string;
        nationalId: string;
        phone?: string;
        reason: string;
      };
    }) => exportBags(bagIds, recipient),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bags'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['outflow'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useDisposeBag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bagIds,
      reason,
      notes,
    }: {
      bagIds: string[];
      reason: string;
      notes?: string;
    }) => disposeBags(bagIds, reason, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bags'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['outflow'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}



/**
 * Fetch transactions with server-ready filtering and pagination.
 */
export function useFilteredTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', 'filtered', filters],
    queryFn: ({ signal }) => fetchFilteredTransactions(filters, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

// ── Outflow Records ────────────────────────────────────────
export function useOutflowRecords(filters: OutflowFilters = {}) {
  return useQuery({
    queryKey: ['outflow', 'filtered', filters],
    queryFn: ({ signal }) => fetchOutflowRecords(filters, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

export function useOutflowRecordDetail(id: string | null) {
  return useQuery({
    queryKey: ['outflow', 'detail', id],
    queryFn: ({ signal }) => fetchOutflowRecordDetail(id!, { signal }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Cache details for 5 minutes
  });
}


// ── Analytics & Thresholds ───────────────────────────────────

export function useInventoryAnalytics() {
  return useQuery({
    queryKey: ['inventory-analytics'],
    queryFn: fetchInventoryAnalytics,
  });
}

export function useInventoryThresholds() {
  return useQuery({
    queryKey: ['inventory-thresholds'],
    queryFn: fetchInventoryThresholds,
  });
}

export function useUpdateInventoryThresholds() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (thresholds: Record<string, number>) => updateInventoryThresholds(thresholds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-analytics'] });
      qc.invalidateQueries({ queryKey: ['inventory-thresholds'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useInventoryDashboard() {
  return useQuery({
    queryKey: ['inventory-dashboard'],
    queryFn: fetchInventoryDashboard,
  });
}

export function useAdminInventoryDashboard() {
  return useQuery({
    queryKey: ['admin-inventory-dashboard'],
    queryFn: fetchAdminInventoryDashboard,
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
  });
}



