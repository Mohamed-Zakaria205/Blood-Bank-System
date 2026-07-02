import apiClient from './client';
import type { ApiResponseWrapper } from '../types/auth';
import type { WeeklyBloodTypeTarget, WeeklyTargetsUpdatePayload } from '../types/targets';
import { validateContract, WeeklyTargetsSchema } from './contract';

/**
 * Fetch weekly blood type targets and current progress for the main branch.
 */
export async function fetchWeeklyTargets(): Promise<WeeklyBloodTypeTarget[]> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<WeeklyBloodTypeTarget[]>>(
    '/donation-centers/main-branch/weekly-targets',
  );

  const rawData = wrapper.data || [];
  validateContract('Weekly Targets', WeeklyTargetsSchema, rawData);
  return rawData;
}

/**
 * Update weekly targets for all 8 blood types.
 */
export async function updateWeeklyTargets(
  payload: WeeklyTargetsUpdatePayload[],
): Promise<WeeklyBloodTypeTarget[]> {
  const { data: wrapper } = await apiClient.put<ApiResponseWrapper<WeeklyBloodTypeTarget[]>>(
    '/donation-centers/main-branch/weekly-targets',
    payload,
  );

  const rawData = wrapper.data || [];
  validateContract('Weekly Targets Update', WeeklyTargetsSchema, rawData);
  return rawData;
}
