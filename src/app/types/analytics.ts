// ═══════════════════════════════════════════════════════════
// Analytics types — charts, KPIs, and reporting data
// ═══════════════════════════════════════════════════════════

/** Monthly donation vs. request trend point */
export interface DonationTrend {
  month: string;
  donations: number;
  requests: number;
}

/** Supply vs. demand per geographical area */
export interface AreaStats {
  area: string;
  donations: number;
  demand: number;
}

/** Blood type distribution slice (pie chart) */
export interface BloodTypeSlice {
  type: string;
  value: number;
  color: string;
}

/** Shortage prediction data point */
export interface ShortagePrediction {
  month: string;
  predicted: number;
  current: number | null;
}

/** KPI summary card */
export interface KpiCard {
  label: string;
  value: string;
  unit: string;
  change: string;
}

/** Full analytics dashboard payload (returned by the backend) */
export interface AnalyticsDashboard {
  donationTrends: DonationTrend[];
  areaStats: AreaStats[];
  bloodTypeDistribution: BloodTypeSlice[];
  shortagePredictions: ShortagePrediction[];
  kpis: KpiCard[];
}
