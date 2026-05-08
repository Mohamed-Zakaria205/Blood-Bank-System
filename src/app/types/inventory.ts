// ═══════════════════════════════════════════════════════════
// Inventory types — blood bags, transactions, outflow
// ═══════════════════════════════════════════════════════════
import type {
  BloodType,
  DonationType,
  BloodBagStatus,
  TransactionType,
  InventoryStatus,
  OutflowActionType,
} from './common';

export interface BloodInventoryItem {
  type: BloodType;
  units: number;
  status: InventoryStatus;
  minRequired: number;
  lastUpdated: string;
}

export interface BloodBag {
  id: string;
  bagCode: string;
  bloodType: BloodType;
  donationType: DonationType;
  donorCode?: string;
  collectedDate: string;
  expiryDate: string;
  status: BloodBagStatus;
  volume: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  bagIds: string[];
  bagCodes: string[];
  bloodType: BloodType;
  quantity: number;
  timestamp: string;
  performedBy: string;
  performedByName: string;
  destination?: string;
  notes?: string;
  requestId?: string;
}


export interface OutflowRecord {
  id: string;
  bagId: string;
  bagCode: string;
  bloodType: BloodType;
  donationType: DonationType;
  actionType: OutflowActionType;
  recipientName?: string;
  nationalId?: string;
  phone?: string;
  reason: string;
  disposalCategory?: string;
  notes?: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
}

export interface MonthlyStats {
  month: string;
  donations: number;
  newDonors: number;
  campaigns: number;
  issued?: number;
  wasted?: number;
}
