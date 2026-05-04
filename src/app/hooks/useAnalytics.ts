// ═══════════════════════════════════════════════════════════
// React Query hooks — Analytics dashboard
// ═══════════════════════════════════════════════════════════
import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsDashboard } from '../api/analytics';

/**
 * Fetch the full analytics dashboard in a single query.
 *
 * The backend returns all datasets in one payload so the charts
 * load together instead of waterfall-loading each dataset
 * independently. If you need individual datasets, you can
 * destructure from the returned `data` object:
 *
 *   const { data } = useAnalyticsDashboard();
 *   const trends = data?.donationTrends;
 *   const areas  = data?.areaStats;
 */
export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: fetchAnalyticsDashboard,
    // Analytics data doesn't change frequently — cache for 5 min
    staleTime: 5 * 60 * 1000,
  });
}
