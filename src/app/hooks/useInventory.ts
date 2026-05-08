// ═══════════════════════════════════════════════════════════
// React Query hooks — Inventory (bags, transactions, outflow, stats)
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBloodBags,
  exportBags,
  disposeBag,
  fetchBloodInventory,
  fetchTransactions,
  fetchOutflowRecords,
  fetchMonthlyStats,
} from '../api/inventory';

// ── Blood Bags ─────────────────────────────────────────────
export function useBloodBags() {
  return useQuery({
    queryKey: ['bags'],
    queryFn: fetchBloodBags,
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
    mutationFn: ({ bagId, reason }: { bagId: string; reason: string }) => disposeBag(bagId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bags'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['outflow'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// ── Blood Inventory Summary ────────────────────────────────
export function useBloodInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: fetchBloodInventory,
  });
}

// ── Transactions ───────────────────────────────────────────
export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });
}

// ── Outflow Records ────────────────────────────────────────
export function useOutflowRecords() {
  return useQuery({
    queryKey: ['outflow'],
    queryFn: fetchOutflowRecords,
  });
}

// ── Monthly Stats ──────────────────────────────────────────
export function useMonthlyStats() {
  return useQuery({
    queryKey: ['monthly-stats'],
    queryFn: fetchMonthlyStats,
  });
}
