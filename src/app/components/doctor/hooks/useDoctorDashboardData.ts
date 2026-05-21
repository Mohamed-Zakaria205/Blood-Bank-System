import { useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDonors, useDonations } from '../../../hooks/useDonors';
import { useCampaigns } from '../../../hooks/useCampaigns';
import { useSlot15Data } from '../../../hooks/useAppointments';

const TODAY = '2025-04-26'; // Match the hardcoded value in the original file

export function useDoctorDashboardData() {
  const { user } = useAuth();
  
  const { data: donors = [], isLoading: isLoadingDonors, isError: isErrorDonors, refetch } = useDonors();
  const { data: donations = [], isLoading: isLoadingDonations } = useDonations();
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useCampaigns();
  const { data: slot15Data = [], isLoading: isLoadingSlots } = useSlot15Data();

  const isLoading = isLoadingDonors || isLoadingDonations || isLoadingCampaigns || isLoadingSlots;
  const isError = isErrorDonors;

  const derivedData = useMemo(() => {
    const myDonors = donors.filter((d) => d.registeredBy === user?.id);
    const activeCampaigns = campaigns.filter((c) => c.status === 'active');
    const myCampaigns = campaigns.filter((c) => c.createdBy === user?.id);

    const walkinToday = donors.filter((d) => d.registeredAt === TODAY && d.source === 'walkin').length;
    const appToday = donors.filter((d) => d.registeredAt === TODAY && d.source === 'app').length;
    const campaignToday = donors.filter((d) => d.registeredAt === TODAY && d.source === 'campaign').length;
    const campaignDonors = donors.filter((d) => d.source === 'campaign');

    const upcomingToday = slot15Data.filter((s) => s.date === TODAY && s.status === 'booked');

    return {
      myDonors,
      activeCampaigns,
      myCampaigns,
      walkinToday,
      appToday,
      campaignToday,
      campaignDonors,
      upcomingToday,
    };
  }, [donors, campaigns, slot15Data, user?.id]);

  return {
    donors,
    donations,
    isLoading,
    isError,
    refetch,
    ...derivedData,
  };
}
