import { useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDonors, useDonations } from '../../../hooks/useDonors';
import { useCampaigns } from '../../../hooks/useCampaigns';
import { useAppointmentSlots } from '../../../hooks/useAppointments';
import { toISODate } from '../../../utils/date';

export function useDoctorDashboardData() {
  const { user } = useAuth();

  const { data: donors = [], isLoading: isLoadingDonors, isError: isErrorDonors, refetch } = useDonors();
  const { data: donations = [], isLoading: isLoadingDonations } = useDonations();
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useCampaigns();
  const today = toISODate(new Date());
  const { data: slot15Data = [], isLoading: isLoadingSlots } = useAppointmentSlots({ date: today });

  const isLoading = isLoadingDonors || isLoadingDonations || isLoadingCampaigns || isLoadingSlots;
  const isError = isErrorDonors;

  const derivedData = useMemo(() => {

    const myDonors = donors.filter((d) => d.registeredBy === user?.id);
    const activeCampaigns = campaigns.filter((c) => c.status === 'active');
    // Bug 6 fix: also check createdById as a fallback for backend field name variations
    const myCampaigns = campaigns.filter(
      (c) => c.createdBy === user?.id || (c as any).createdById === user?.id,
    );

    // Helper to safely parse donationDate and match with today (handles ISO UTC strings from backend)
    const isTodayDonation = (dDate: string | undefined) => {
      if (!dDate) return false;
      if (dDate.includes('T')) {
        const dObj = new Date(dDate);
        if (isNaN(dObj.getTime())) return false;
        const localStr = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
        return localStr === today;
      }
      return dDate === today;
    };

    // Bug 3 fix: count "today" badges using donations + donationDate, not donors + registeredAt
    const walkinToday = donations.filter(
      (d) => isTodayDonation(d.donationDate) && d.source === 'walkin',
    ).length;
    const appToday = donations.filter(
      (d) => isTodayDonation(d.donationDate) && d.source === 'app',
    ).length;
    const campaignToday = donations.filter(
      (d) => isTodayDonation(d.donationDate) && d.source === 'campaign',
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
  }, [donors, donations, campaigns, slot15Data, user?.id, today]);

  return {
    donors,
    donations,
    isLoading,
    isError,
    refetch,
    ...derivedData,
  };
}
