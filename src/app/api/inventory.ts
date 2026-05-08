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
import {
  bloodBags as MOCK_BAGS,
  bloodInventory as MOCK_INVENTORY,
  initialTransactions as MOCK_TRANSACTIONS,
  initialOutflowRecords as MOCK_OUTFLOW,
  monthlyStats as MOCK_MONTHLY_STATS,
} from '../data/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ── Blood Bags ─────────────────────────────────────────────
export async function fetchBloodBags(): Promise<BloodBag[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_BAGS;
  }
  const { data } = await apiClient.get<BloodBag[]>('/inventory/bags');
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
export async function fetchBloodInventory(): Promise<BloodInventoryItem[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_INVENTORY;
  }
  const { data } = await apiClient.get<BloodInventoryItem[]>('/inventory/summary');
  return data;
}

// ── Transactions ───────────────────────────────────────────
export async function fetchTransactions(): Promise<Transaction[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_TRANSACTIONS;
  }
  const { data } = await apiClient.get<Transaction[]>('/inventory/transactions');
  return data;
}

// ── Outflow Records ────────────────────────────────────────
export async function fetchOutflowRecords(): Promise<OutflowRecord[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_OUTFLOW;
  }
  const { data } = await apiClient.get<OutflowRecord[]>('/inventory/outflow');
  return data;
}

// ── Monthly Stats ──────────────────────────────────────────
export async function fetchMonthlyStats(): Promise<MonthlyStats[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_MONTHLY_STATS;
  }
  const { data } = await apiClient.get<MonthlyStats[]>('/stats/monthly');
  return data;
}
