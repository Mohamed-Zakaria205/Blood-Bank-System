import { z } from 'zod';

/**
 * ── API Contract Validation Layer ──
 * This module defines Zod schemas that represent the EXPECTED shape of data
 * coming from the backend. If the backend changes its contract, these will
 * catch the mismatch and log warnings to the console.
 */

// Basic pagination schema wrapper
export const createPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
    totalPages: z.number().optional(),
  });

export const EligibilityResultSchema = z.object({
  status: z.enum(['eligible', 'soon', 'not_yet', 'deferred', 'ineligible']),
  daysLeft: z.number(),
  daysAgo: z.number(),
  eligibleDate: z.string().optional().nullable(),
});

// 1. Donor Contract
export const DonorContractSchema = z.object({
  id: z.string(),
  donorCode: z.string(),
  name: z.string(),
  gender: z.enum(['male', 'female']).optional(),
  phone: z.string().optional(),
  age: z.number().optional(),
  bloodType: z.string().optional().nullable(),
  status: z.enum(['eligible', 'deferred', 'rejected']).optional(),
  hasAppAccount: z.boolean(),
  // Ensure we don't throw hard errors if dates come differently, just log
  lastDonationDate: z.string().optional().nullable(),
  eligibility: EligibilityResultSchema.optional().nullable(),
});

export const EligibilityStatsContractSchema = z.object({
  statusCounts: z.object({
    all: z.number(),
    eligible: z.number(),
    soon: z.number(),
    not_yet: z.number(),
    deferred: z.number(),
    ineligible: z.number(),
  }),
  bloodTypeCounts: z.record(z.string(), z.object({
    eligible: z.number(),
    total: z.number(),
  })),
});

export const EligibilitySettingsContractSchema = z.object({
  donorMaleWaitDays: z.number(),
  donorFemaleWaitDays: z.number(),
});

// 2. Lab Test Contract
export const LabTestContractSchema = z.object({
  id: z.string(),
  donorCode: z.string(),
  donorName: z.string().optional(),
  bloodType: z.string(),
  status: z.enum(['pending', 'completed', 'rejected']),
  result: z.enum(['safe', 'unsafe']).optional().nullable(),
});

// 3. Campaign Contract
export const CampaignContractSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['active', 'completed', 'cancelled', 'notactive']),
  targetDonors: z.number(),
  registeredDonors: z.number(),
  availableDonationTypes: z.array(z.string()).optional(),
});

// 4. Doctor Dashboard Contract
export const DoctorDashboardContractSchema = z.object({
  statistics: z.object({
    todayDonationsCount: z.number(),
    totalDonationsCount: z.number(),
    totalDonorsCount: z.number(),
    eligibleDonorsCount: z.number(),
    myActiveCampaignsCount: z.number(),
    myTotalCampaignsCount: z.number(),
    myDonorsCount: z.number(),
    myEligibleDonorsCount: z.number(),
  }),
  sources: z.object({
    walkinTotal: z.number(),
    walkinToday: z.number(),
    campaignTotal: z.number(),
    campaignToday: z.number(),
    appTotal: z.number(),
    appToday: z.number(),
  }),
  weeklyChart: z.array(
    z.object({
      dayName: z.string(),
      date: z.string(),
      donationsCount: z.number(),
    })
  ),
  activeCampaigns: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      status: z.string(),
      registeredDonors: z.number(),
      targetDonors: z.number(),
    })
  ),
  upcomingAppointments: z.array(
    z.object({
      id: z.string(),
      time: z.string(),
      donorName: z.string().optional().nullable(),
      donorNationalId: z.string().optional().nullable(),
      donorBloodType: z.string().optional().nullable(),
      status: z.string(),
    })
  ),
  recentDonations: z.array(
    z.object({
      id: z.string(),
      bloodType: z.string(),
      name: z.string(),
      source: z.enum(['walkin', 'campaign', 'mobileapp']),
      donationDate: z.string(),
    })
  ),
});

/**

 * Helper to validate API responses without throwing errors that break the UI.
 * It logs a vivid warning in the console if the contract is violated.
 */
export function validateContract<T>(
  schemaName: string,
  schema: z.ZodType<T>,
  data: unknown,
): void {
  // Only validate in development to avoid performance hits in production
  // or you can enable it globally if contract strictness is critical.
  if (!import.meta.env.DEV) return;

  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn(
      `%c[Contract Violation] ${schemaName} API response does not match the expected schema!`,
      'color: #ef4444; font-weight: bold; font-size: 14px;',
    );
    console.warn('Expected Schema Errors:', result.error.format());
    console.warn('Received Data:', data);
  }
}
