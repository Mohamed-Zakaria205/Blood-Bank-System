import apiClient from './client';
import type { ApiResponseWrapper } from '../types/auth';
import type { DoctorDashboardResponse } from '../types/doctorDashboard';
import { validateContract, DoctorDashboardContractSchema } from './contract';

// Import mock data for dynamic aggregation when VITE_USE_MOCK is true
import { donors as MOCK_DONORS } from '../data/donors.mock';
import { donations as MOCK_DONATIONS } from '../data/donations.mock';
import { campaigns as MOCK_CAMPAIGNS } from '../data/campaigns.mock';
import { appointmentSlotsData as MOCK_SLOTS } from '../data/appointments.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * Helper to calculate dates relative to current date (like in appointments.mock)
 */
const getRelativeDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

/**
 * Fetch aggregated doctor dashboard data.
 * Under mock mode, aggregates statistics, weekly chart, active campaigns,
 * upcoming appointments, and recent donations dynamically in memory.
 */
export async function fetchDoctorDashboardData(): Promise<DoctorDashboardResponse> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Resolve current doctor user ID from localStorage
    let userId = 'USR-002'; // fallback to mock doctor "د. أحمد حسن علي"
    try {
      const stored = localStorage.getItem('bloodlink_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        userId = parsed.id || parsed.userId || 'USR-002';
      }
    } catch (e) {
      console.warn('Error parsing user session in mock dashboard aggregator', e);
    }

    const todayStr = getRelativeDateStr(0);

    // 1. Map mock donations dates dynamically so the chart and "today" stats are always populated in dev
    const dynamicDonations = MOCK_DONATIONS.map((d, index) => {
      let relativeDate = d.donationDate;
      // Distribute first 10 donations across the current week
      if (index === 0 || index === 1) relativeDate = getRelativeDateStr(0);
      else if (index === 2) relativeDate = getRelativeDateStr(-1);
      else if (index === 3 || index === 4) relativeDate = getRelativeDateStr(-2);
      else if (index === 5) relativeDate = getRelativeDateStr(-3);
      else if (index === 6 || index === 7) relativeDate = getRelativeDateStr(-4);
      else if (index === 8) relativeDate = getRelativeDateStr(-5);
      else if (index === 9) relativeDate = getRelativeDateStr(-6);

      return {
        ...d,
        donationDate: relativeDate,
      };
    });

    // 2. Statistics Calculations
    const todayDonationsCount = dynamicDonations.filter(
      (d) => d.donationDate === todayStr
    ).length;
    const totalDonationsCount = dynamicDonations.length;
    const totalDonorsCount = MOCK_DONORS.length;
    const eligibleDonorsCount = MOCK_DONORS.filter(
      (d) => d.status === 'eligible'
    ).length;

    const myCampaigns = MOCK_CAMPAIGNS.filter(
      (c) => c.createdBy === userId || (c as any).createdById === userId
    );
    const myActiveCampaignsCount = myCampaigns.filter(
      (c) => c.status === 'active'
    ).length;
    const myTotalCampaignsCount = myCampaigns.length;

    const myDonors = MOCK_DONORS.filter((d) => d.registeredBy === userId);
    const myDonorsCount = myDonors.length;
    const myEligibleDonorsCount = myDonors.filter(
      (d) => d.status === 'eligible'
    ).length;

    // 3. Source Breakdown Calculations
    const walkinTotal = dynamicDonations.filter((d) => d.source === 'walkin').length;
    const walkinToday = dynamicDonations.filter(
      (d) => d.source === 'walkin' && d.donationDate === todayStr
    ).length;

    const campaignTotal = dynamicDonations.filter((d) => d.source === 'campaign').length;
    const campaignToday = dynamicDonations.filter(
      (d) => d.source === 'campaign' && d.donationDate === todayStr
    ).length;

    const appTotal = dynamicDonations.filter((d) => d.source === 'mobileapp').length;
    const appToday = dynamicDonations.filter(
      (d) => d.source === 'mobileapp' && d.donationDate === todayStr
    ).length;

    // 4. Egyptian Week Weekly Chart (Saturday -> Friday)
    const now = new Date();
    const daysFromSat = (now.getDay() + 1) % 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysFromSat);
    startOfWeek.setHours(0, 0, 0, 0);

    const dayNames = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    const weeklyChart = dayNames.map((day, i) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      const dateStr = dayDate.toISOString().split('T')[0];
      const count = dynamicDonations.filter((d) => d.donationDate === dateStr).length;

      return {
        dayName: day,
        date: dateStr,
        donationsCount: count,
      };
    });

    // 5. Active/Upcoming Campaigns (Top 4)
    const activeCampaigns = MOCK_CAMPAIGNS.filter(
      (c) => c.status === 'active' || c.status === 'notactive'
    )
      .slice(0, 4)
      .map((c) => ({
        id: c.id,
        title: c.title,
        status: (c.status === 'notactive' ? 'upcoming' : c.status) as any,
        registeredDonors: c.registeredDonors,
        targetDonors: c.targetDonors,
      }));

    // 6. Today's Booked Appointments
    const upcomingAppointments = MOCK_SLOTS.filter(
      (s) => s.date === todayStr && s.status === 'booked'
    ).map((s) => ({
      id: s.id,
      time: s.time,
      donorName: s.donorName || '',
      donorNationalId: s.donorNationalId || '',
      donorBloodType: s.donorBloodType || 'O+',
      status: 'booked',
    }));

    // 7. Recent Donations (Top 6)
    const recentDonations = dynamicDonations
      .slice()
      .sort((a, b) => b.donationDate.localeCompare(a.donationDate))
      .slice(0, 6)
      .map((d) => ({
        id: d.id,
        bloodType: d.bloodType,
        name: d.name,
        source: d.source,
        donationDate: d.donationDate,
      }));

    const mockResponse: DoctorDashboardResponse = {
      statistics: {
        todayDonationsCount,
        totalDonationsCount,
        totalDonorsCount,
        eligibleDonorsCount,
        myActiveCampaignsCount,
        myTotalCampaignsCount,
        myDonorsCount,
        myEligibleDonorsCount,
      },
      sources: {
        walkinTotal,
        walkinToday,
        campaignTotal,
        campaignToday,
        appTotal,
        appToday,
      },
      weeklyChart,
      activeCampaigns,
      upcomingAppointments,
      recentDonations,
    };

    validateContract('Doctor Dashboard Mock', DoctorDashboardContractSchema, mockResponse);
    return mockResponse;
  }

  // Real backend implementation
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<DoctorDashboardResponse>>(
    '/Doctor/dashboard'
  );
  validateContract('Doctor Dashboard Live', DoctorDashboardContractSchema, wrapper.data);
  return wrapper.data;
}
