import { useMemo } from 'react';
import { useDonors } from '../../../hooks/useDonors';
import { useCampaigns } from '../../../hooks/useCampaigns';
import { useStaff } from '../../../hooks/useStaff';
import { useAdminInventoryDashboard, useMonthlyStats } from '../../../hooks/useInventory';

export function useAdminDashboardData() {
  const {
    data: donors = [],
    isLoading: loadingDonors,
    isError: errorDonors,
    refetch: refetchDonors,
  } = useDonors();

  const { data: campaignsData = [], isLoading: loadingCampaigns } = useCampaigns();
  const { data: staffData = [], isLoading: loadingStaff } = useStaff();
  const { data: dashboardData, isLoading: loadingInventory } = useAdminInventoryDashboard();
  const { data: monthlyStatsData = [], isLoading: loadingStats } = useMonthlyStats();

  const bloodInventory = useMemo(() => {
    return (dashboardData?.inventory ?? []).map((item) => ({
      type: item.bloodType,
      units: item.availableUnits,
      status: item.status,
      minRequired: item.minimumThreshold,
      lastUpdated: item.lastUpdated,
    }));
  }, [dashboardData]);

  const isLoading =
    loadingDonors || loadingCampaigns || loadingStaff || loadingInventory || loadingStats;

  // Memoize derived data
  const derivedData = useMemo(() => {
    const doctors = staffData.filter((u) => u.role === 'doctor');
    const labDoctors = staffData.filter((u) => u.role === 'lab');
    const totalUnits = dashboardData?.summary.totalUnits ?? 0;
    const criticalCount = (dashboardData?.summary.criticalCount ?? 0) + (dashboardData?.summary.outOfStockCount ?? 0);

    const recentDonors = [...donors]
      .sort(
        (a, b) =>
          new Date(b.registeredAt ?? '').getTime() - new Date(a.registeredAt ?? '').getTime(),
      )
      .slice(0, 6);

    const campaignDonors = donors.filter((d) => (d as any).source === 'campaign');
    const walkinDonors = donors.filter((d) => (d as any).source === 'walkin');
    const appDonors = donors.filter((d) => (d as any).source === 'app');

    return {
      doctors,
      labDoctors,
      totalUnits,
      criticalCount,
      recentDonors,
      campaignDonors,
      walkinDonors,
      appDonors,
      totalDonors: donors.length,
      eligibleDonors: donors.filter((d) => d.status === 'eligible').length,
      totalCampaigns: campaignsData.length,
      activeCampaigns: campaignsData.filter((c) => c.status === 'active').length,
    };
  }, [donors, campaignsData, staffData, bloodInventory, dashboardData]);

  return {
    donors,
    campaignsData,
    bloodInventory,
    monthlyStatsData,
    isLoading,
    errorDonors,
    refetchDonors,
    ...derivedData,
  };
}
