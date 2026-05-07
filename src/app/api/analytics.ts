// ═══════════════════════════════════════════════════════════
// Analytics API service — charts, KPIs, and reporting data
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type {
  AnalyticsDashboard,
  DonationTrend,
  AreaStats,
  BloodTypeSlice,
  ShortagePrediction,
  KpiCard,
} from '../types/analytics';

// ── Mock mode flag ─────────────────────────────────────────
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ── Mock data ──────────────────────────────────────────────

const MOCK_DONATION_TRENDS: DonationTrend[] = [
  { month: 'يناير', donations: 320, requests: 280 },
  { month: 'فبراير', donations: 280, requests: 260 },
  { month: 'مارس', donations: 350, requests: 300 },
  { month: 'أبريل', donations: 410, requests: 340 },
  { month: 'مايو', donations: 390, requests: 310 },
  { month: 'يونيو', donations: 280, requests: 295 },
  { month: 'يوليو', donations: 250, requests: 270 },
  { month: 'أغسطس', donations: 310, requests: 290 },
  { month: 'سبتمبر', donations: 370, requests: 320 },
  { month: 'أكتوبر', donations: 420, requests: 360 },
  { month: 'نوفمبر', donations: 400, requests: 340 },
  { month: 'ديسمبر', donations: 360, requests: 310 },
];

const MOCK_AREA_STATS: AreaStats[] = [
  { area: 'بني سويف', donations: 180, demand: 150 },
  { area: 'الواسطى', donations: 85, demand: 95 },
  { area: 'ناصر', donations: 65, demand: 80 },
  { area: 'ببا', donations: 70, demand: 60 },
  { area: 'الفشن', donations: 45, demand: 55 },
  { area: 'سمسطا', donations: 35, demand: 40 },
  { area: 'إهناسيا', donations: 30, demand: 35 },
];

const MOCK_BLOOD_TYPE_DIST: BloodTypeSlice[] = [
  { type: 'O+', value: 34, color: '#C62828' },
  { type: 'A+', value: 28, color: '#E53935' },
  { type: 'B+', value: 18, color: '#EF5350' },
  { type: 'AB+', value: 6, color: '#E57373' },
  { type: 'O-', value: 5, color: '#1976D2' },
  { type: 'A-', value: 4, color: '#42A5F5' },
  { type: 'B-', value: 3, color: '#90CAF9' },
  { type: 'AB-', value: 2, color: '#BBDEFB' },
];

const MOCK_SHORTAGE_PREDICTIONS: ShortagePrediction[] = [
  { month: 'مايو', predicted: 220, current: 198 },
  { month: 'يونيو', predicted: 180, current: 165 },
  { month: 'يوليو', predicted: 150, current: 134 },
  { month: 'أغسطس', predicted: 195, current: null },
  { month: 'سبتمبر', predicted: 255, current: null },
  { month: 'أكتوبر', predicted: 285, current: null },
];

const MOCK_KPIS: KpiCard[] = [
  { label: 'معدل التبرع اليومي', value: '41', unit: 'وحدة/يوم', change: '+8%' },
  { label: 'رضا المتبرعين', value: '94%', unit: 'تقييم ممتاز', change: '+2%' },
  { label: 'كفاءة المخزون', value: '78%', unit: 'نسبة الاستخدام', change: '-3%' },
  { label: 'وقت المعالجة', value: '2.4', unit: 'ساعة متوسطاً', change: '-12%' },
];

// ── Fetch full analytics dashboard ─────────────────────────
export async function fetchAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return {
      donationTrends: MOCK_DONATION_TRENDS,
      areaStats: MOCK_AREA_STATS,
      bloodTypeDistribution: MOCK_BLOOD_TYPE_DIST,
      shortagePredictions: MOCK_SHORTAGE_PREDICTIONS,
      kpis: MOCK_KPIS,
    };
  }
  const { data } = await apiClient.get<AnalyticsDashboard>('/analytics/dashboard');
  return data;
}

// ── Fetch individual datasets (used if the backend splits them) ──

export async function fetchDonationTrends(): Promise<DonationTrend[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_DONATION_TRENDS;
  }
  const { data } = await apiClient.get<DonationTrend[]>('/analytics/donation-trends');
  return data;
}

export async function fetchAreaStats(): Promise<AreaStats[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_AREA_STATS;
  }
  const { data } = await apiClient.get<AreaStats[]>('/analytics/area-stats');
  return data;
}

export async function fetchBloodTypeDistribution(): Promise<BloodTypeSlice[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_BLOOD_TYPE_DIST;
  }
  const { data } = await apiClient.get<BloodTypeSlice[]>('/analytics/blood-type-distribution');
  return data;
}

export async function fetchShortagePredictions(): Promise<ShortagePrediction[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_SHORTAGE_PREDICTIONS;
  }
  const { data } = await apiClient.get<ShortagePrediction[]>('/analytics/shortage-predictions');
  return data;
}
