import { useMemo } from 'react';
import { useDonors } from '../../../hooks/useDonors';
import { useCampaigns } from '../../../hooks/useCampaigns';
import { useStaff } from '../../../hooks/useStaff';
import { useBloodInventory, useMonthlyStats } from '../../../hooks/useInventory';

export function useAdminDashboardData() {
  const {
    data: donors = [],
    isLoading: loadingDonors,
    isError: errorDonors,
    refetch: refetchDonors,
  } = useDonors();

  const { data: campaignsData = [], isLoading: loadingCampaigns } = useCampaigns();
  const { data: staffData = [], isLoading: loadingStaff } = useStaff();
  const { data: bloodInventory = [], isLoading: loadingInventory } = useBloodInventory();
  const { data: monthlyStatsData = [], isLoading: loadingStats } = useMonthlyStats();

  const isLoading =
    loadingDonors || loadingCampaigns || loadingStaff || loadingInventory || loadingStats;

  // Memoize derived data
  const derivedData = useMemo(() => {
    const doctors = staffData.filter((u) => u.role === 'doctor');
    const labDoctors = staffData.filter((u) => u.role === 'lab');
    const totalUnits = bloodInventory.reduce((s, b) => s + b.units, 0);
    const criticalCount = bloodInventory.filter((b) => b.status === 'critical').length;
    
    const recentDonors = [...donors]
      .sort(
        (a, b) =>
          new Date(b.registeredAt ?? '').getTime() - new Date(a.registeredAt ?? '').getTime(),
      )
      .slice(0, 6);
      
    const campaignDonors = donors.filter((d) => d.source === 'campaign');
    const walkinDonors = donors.filter((d) => d.source === 'walkin');
    const appDonors = donors.filter((d) => d.source === 'app');

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
  }, [donors, campaignsData, staffData, bloodInventory]);

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
