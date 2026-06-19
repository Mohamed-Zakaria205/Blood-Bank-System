import apiClient from './client';
import type { ApiResponseWrapper } from '../types/auth';
import type { DoctorDashboardResponse } from '../types/doctorDashboard';
import { validateContract, DoctorDashboardContractSchema } from './contract';

/**
 * Raw backend response shape for the Doctor Dashboard endpoint.
 * Uses partial/optional fields to accommodate backend flexibility.
 */
interface RawDoctorDashboard {
  statistics?: {
    todayDonationsCount?: number;
    totalDonationsCount?: number;
    totalDonorsCount?: number;
    eligibleDonorsCount?: number;
    myActiveCampaignsCount?: number;
    myTotalCampaignsCount?: number;
    myDonorsCount?: number;
    myEligibleDonorsCount?: number;
  };
  sources?: {
    walkinTotal?: number;
    walkinToday?: number;
    campaignTotal?: number;
    campaignToday?: number;
    appTotal?: number;
    appToday?: number;
  };
  weeklyChart?: Array<{ dayName?: string; date?: string; donationsCount?: number }>;
  activeCampaigns?: Array<{
    id?: string;
    campaignCode?: string;
    title?: string;
    status?: string;
    registeredDonors?: number;
    targetDonors?: number;
  }>;
  upcomingAppointments?: Array<{
    id?: string;
    time?: string;
    donorName?: string;
    donorNationalId?: string;
    donorBloodType?: string;
    status?: string;
  }>;
  recentDonations?: Array<{
    id?: string;
    bloodType?: string;
    name?: string;
    source?: string;
    donationDate?: string;
  }>;
}

/**
 * Helper to map and normalize the raw backend response to the expected frontend contract.
 * Normalizes source types (e.g. 'app' -> 'mobileapp'), parses numbers, and formats dates.
 */
function mapDoctorDashboardResponse(raw: RawDoctorDashboard): DoctorDashboardResponse {
  if (!raw) return raw as unknown as DoctorDashboardResponse;

  return {
    statistics: {
      todayDonationsCount: Number(raw.statistics?.todayDonationsCount ?? 0),
      totalDonationsCount: Number(raw.statistics?.totalDonationsCount ?? 0),
      totalDonorsCount: Number(raw.statistics?.totalDonorsCount ?? 0),
      eligibleDonorsCount: Number(raw.statistics?.eligibleDonorsCount ?? 0),
      myActiveCampaignsCount: Number(raw.statistics?.myActiveCampaignsCount ?? 0),
      myTotalCampaignsCount: Number(raw.statistics?.myTotalCampaignsCount ?? 0),
      myDonorsCount: Number(raw.statistics?.myDonorsCount ?? 0),
      myEligibleDonorsCount: Number(raw.statistics?.myEligibleDonorsCount ?? 0),
    },
    sources: {
      walkinTotal: Number(raw.sources?.walkinTotal ?? 0),
      walkinToday: Number(raw.sources?.walkinToday ?? 0),
      campaignTotal: Number(raw.sources?.campaignTotal ?? 0),
      campaignToday: Number(raw.sources?.campaignToday ?? 0),
      appTotal: Number(raw.sources?.appTotal ?? 0),
      appToday: Number(raw.sources?.appToday ?? 0),
    },
    weeklyChart: (raw.weeklyChart || []).map((day) => ({
      dayName: day.dayName || '',
      date: day.date ? day.date.split('T')[0] : '',
      donationsCount: Number(day.donationsCount ?? 0),
    })),
    activeCampaigns: (raw.activeCampaigns || []).map((camp) => ({
      id: camp.id || '',
      campaignCode: camp.campaignCode || '',
      title: camp.title || '',
      status: (camp.status || 'active') as 'active' | 'notactive' | 'completed',
      registeredDonors: Number(camp.registeredDonors ?? 0),
      targetDonors: Number(camp.targetDonors ?? 0),
    })),
    upcomingAppointments: (raw.upcomingAppointments || []).map((apt) => {
      let normalizedStatus = (apt.status || 'booked').toLowerCase();
      if (normalizedStatus === 'noshow') {
        normalizedStatus = 'missed';
      }
      return {
        id: apt.id || '',
        time: apt.time ? apt.time.substring(0, 5) : '', // format "10:30:00" -> "10:30"
        donorName: apt.donorName || '',
        donorNationalId: apt.donorNationalId || '',
        donorBloodType: (apt.donorBloodType || 'O+') as import('../types/common').BloodType,
        status: normalizedStatus as 'booked' | 'completed' | 'missed' | 'cancelled',
      };
    }),
    recentDonations: (raw.recentDonations || []).map((don) => {
      const rawSource = (don.source || '').toLowerCase();
      let normalizedSource: 'walkin' | 'campaign' | 'mobileapp' = 'walkin';
      if (rawSource === 'campaign') {
        normalizedSource = 'campaign';
      } else if (rawSource === 'mobileapp' || rawSource === 'app') {
        normalizedSource = 'mobileapp';
      }
      return {
        id: don.id || '',
        bloodType: (don.bloodType || 'O+') as import('../types/common').BloodType,
        name: don.name || '',
        source: normalizedSource,
        donationDate: don.donationDate ? don.donationDate.split('T')[0] : '',
      };
    }),
  };
}

/**
 * Fetch aggregated doctor dashboard data.
 * Calls the live backend /Doctor/dashboard endpoint, maps the response,
 * and validates it against the Zod contract.
 */
export async function fetchDoctorDashboardData(): Promise<DoctorDashboardResponse> {
  // Real backend implementation
  const { data: wrapper } =
    await apiClient.get<ApiResponseWrapper<DoctorDashboardResponse>>('/Doctor/dashboard');

  const mappedData = mapDoctorDashboardResponse(wrapper.data);

  validateContract('Doctor Dashboard Live', DoctorDashboardContractSchema, mappedData);
  return mappedData;
}
