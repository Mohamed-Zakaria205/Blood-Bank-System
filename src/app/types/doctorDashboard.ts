import type { BloodType, CampaignStatus } from './common';


export interface DashboardStatistics {
  todayDonationsCount: number;
  totalDonationsCount: number;
  totalDonorsCount: number;
  eligibleDonorsCount: number;
  myActiveCampaignsCount: number;
  myTotalCampaignsCount: number;
  myDonorsCount: number;
  myEligibleDonorsCount: number;
}

export interface DonationSourceStats {
  walkinTotal: number;
  walkinToday: number;
  campaignTotal: number;
  campaignToday: number;
  appTotal: number;
  appToday: number;
}

export interface WeeklyDonationChart {
  dayName: string;
  date: string;
  donationsCount: number;
}

export interface ActiveCampaign {
  id: string;
  campaignCode: string;
  title: string;
  status: CampaignStatus;
  registeredDonors: number;
  targetDonors: number;
}

export interface UpcomingAppointment {
  id: string;
  time: string;
  donorName: string;
  donorNationalId: string;
  donorBloodType: BloodType;
  status: string;
}

export interface RecentDonation {
  id: string;
  bloodType: BloodType;
  name: string;
  source: 'walkin' | 'campaign' | 'mobileapp';
  donationDate: string;
}

export interface DoctorDashboardResponse {
  statistics: DashboardStatistics;
  sources: DonationSourceStats;
  weeklyChart: WeeklyDonationChart[];
  activeCampaigns: ActiveCampaign[];
  upcomingAppointments: UpcomingAppointment[];
  recentDonations: RecentDonation[];
}
