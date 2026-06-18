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
  createdAt?: string;
  updatedAt?: string;
  issuedAt?: string;
  issuedById?: string;
  issuedByName?: string;
  disposedAt?: string;
  disposedById?: string;
  disposedByName?: string;
  disposeReason?: string;
  disposeNotes?: string;
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
  recordCode: string;
  bagCode: string;
  bloodType: BloodType;
  donationType: DonationType;
  actionType: OutflowActionType;
  recipientName?: string;
  performedByName: string;
  performedAt: string;
}

export interface OutflowRecordDetail {
  id: string;
  recordCode: string;
  bagCode: string;
  bloodType: BloodType;
  donationType: DonationType;
  actionType: OutflowActionType;
  recipientName?: string;
  nationalId?: string;
  phone?: string;
  reason: string;
  performedById: string;
  performedByName: string;
  performedAt: string;
}

export interface MonthlyStats {
  month: string;
  donations: number;
  newDonors: number;
  campaigns: number;
  issued?: number;
  wasted?: number;
}

export interface InventoryAnalyticsSummary {
  availableCount: number;
  issuedCount: number;
  expiringSoonCount: number;
  disposedCount: number;
}

export interface BloodTypeAlert {
  bloodType: BloodType;
  availableUnits: number;
  minimumThreshold: number;
  alertStatus: 'normal' | 'critical' | 'out_of_stock';
}

export interface MonthlyTrendItem {
  month: string; // YYYY-MM
  issued: number;
  wasted: number;
}

export interface InventoryByBloodTypeItem {
  bloodType: BloodType;
  availableUnits: number;
  issuedUnits: number;
  minimumThreshold: number;
}

export interface ExpiringSoonBagItem {
  bagId: string;
  bagCode: string;
  bloodType: BloodType;
  expiryDate: string;
  daysRemaining: number;
}

export interface ConsumptionByBloodTypeItem {
  bloodType: BloodType;
  issuedUnits: number;
  consumptionStatus: 'normal' | 'high';
}

export interface InventoryAnalyticsResponse {
  summary: InventoryAnalyticsSummary;
  bloodTypeAlerts: BloodTypeAlert[];
  monthlyTrends: MonthlyTrendItem[];
  inventoryByBloodType: InventoryByBloodTypeItem[];
  expiringSoonBags: ExpiringSoonBagItem[];
  consumptionByBloodType: ConsumptionByBloodTypeItem[];
}

export interface InventoryDashboardSummary {
  availableCount: number;
  issuedCount: number;
  disposedCount: number;
  expiringSoonCount: number;
  testingCount: number;
}

export interface NearExpiryPreviewItem {
  bagCode: string;
  bloodType: BloodType;
}

export interface InventoryDashboardAlerts {
  expiredCount: number;
  nearExpiryCount: number;
  nearExpiryPreview: NearExpiryPreviewItem[];
}

export interface InventoryDashboardBloodTypeItem {
  bloodType: BloodType;
  availableUnits: number;
  minimumThreshold: number;
  status: 'normal' | 'critical' | 'out_of_stock';
}

export interface InventoryDashboardIndicators {
  totalBags: number;
  wastePercentage: number;
  testingCount: number;
}

export interface InventoryDashboardActivityItem {
  id: string;
  recordCode: string;
  bagCode: string;
  bloodType: BloodType;
  actionType: 'issued' | 'disposed';
  recipientName: string | null;
  performedByName: string;
  performedAt: string;
}

export interface InventoryDashboardResponse {
  summary: InventoryDashboardSummary;
  alerts: InventoryDashboardAlerts;
  inventoryByBloodType: InventoryDashboardBloodTypeItem[];
  indicators: InventoryDashboardIndicators;
  recentActivities: InventoryDashboardActivityItem[];
}

export interface AdminInventoryDashboardData {
  generatedAt: string;
  summary: {
    totalUnits: number;
    normalCount: number;
    lowCount: number;
    criticalCount: number;
    outOfStockCount: number;
  };
  inventory: {
    bloodType: BloodType;
    availableUnits: number;
    minimumThreshold: number;
    status: 'normal' | 'low' | 'critical' | 'out_of_stock';
    lastUpdated: string;
  }[];
  alerts: {
    bloodType: BloodType;
    availableUnits: number;
    minimumThreshold: number;
    status: 'low' | 'critical' | 'out_of_stock';
  }[];
}



