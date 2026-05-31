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

// 1. Donor Contract
export const DonorContractSchema = z.object({
  id: z.string(),
  donorCode: z.string(),
  name: z.string(),
  bloodType: z.string().optional().nullable(),
  status: z.enum(['eligible', 'deferred', 'rejected', 'ineligible']).optional(),
  // Ensure we don't throw hard errors if dates come differently, just log
  lastDonationDate: z.string().optional().nullable(),
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
  status: z.enum(['active', 'completed', 'cancelled']),
  targetDonors: z.number(),
  registeredDonors: z.number(),
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
