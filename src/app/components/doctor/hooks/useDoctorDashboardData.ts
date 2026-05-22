import { useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDonors, useDonations } from '../../../hooks/useDonors';
import { useCampaigns } from '../../../hooks/useCampaigns';
import { useSlot15Data } from '../../../hooks/useAppointments';
import { toISODate } from '../../../utils/date';

export function useDoctorDashboardData() {
  const { user } = useAuth();

  const { data: donors = [], isLoading: isLoadingDonors, isError: isErrorDonors, refetch } = useDonors();
  const { data: donations = [], isLoading: isLoadingDonations } = useDonations();
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useCampaigns();
  const { data: slot15Data = [], isLoading: isLoadingSlots } = useSlot15Data();

  const isLoading = isLoadingDonors || isLoadingDonations || isLoadingCampaigns || isLoadingSlots;
  const isError = isErrorDonors;

  const derivedData = useMemo(() => {
    // Bug 1 & 4 fix: compute TODAY dynamically, not hardcoded
    const today = toISODate(new Date());

    const myDonors = donors.filter((d) => d.registeredBy === user?.id);
    const activeCampaigns = campaigns.filter((c) => c.status === 'active');
    // Bug 6 fix: also check createdById as a fallback for backend field name variations
    const myCampaigns = campaigns.filter(
      (c) => c.createdBy === user?.id || (c as any).createdById === user?.id,
    );

    // Bug 3 fix: count "today" badges using donations + donationDate, not donors + registeredAt
    const walkinToday = donations.filter(
      (d) => d.donationDate === today && d.source === 'walkin',
    ).length;
    const appToday = donations.filter(
      (d) => d.donationDate === today && d.source === 'app',
    ).length;
    const campaignToday = donations.filter(
      (d) => d.donationDate === today && d.source === 'campaign',
    ).length;
    const campaignDonors = donations.filter((d) => d.source === 'campaign');

    // Bug 4 fix: use dynamic today for appointment filtering
    const upcomingToday = slot15Data.filter((s) => s.date === today && s.status === 'booked');

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
  }, [donors, donations, campaigns, slot15Data, user?.id]);

  return {
    donors,
    donations,
    isLoading,
    isError,
    refetch,
    ...derivedData,
  };
}
