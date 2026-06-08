// ═══════════════════════════════════════════════════════════
// Campaigns API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { Campaign, CreateCampaignRequest, UpdateCampaignRequest } from '../types/campaign';
import type { PaginatedResponse, ApiResponse, CampaignFilters } from '../types/common';
import type { AppointmentSlot } from '../types/appointment';
import { validateContract, createPaginatedSchema, CampaignContractSchema } from './contract';



/** Fetch all campaigns (unpaginated — for dropdowns and small lists) */
export async function fetchCampaigns(): Promise<PaginatedResponse<Campaign>> {

  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Campaign>>>('/Campaigns');
  validateContract('Campaigns List', createPaginatedSchema(CampaignContractSchema), data.data);
  return data.data;
}

/**
 * Fetch campaigns with filtering and pagination.
 * Mock: client-side filter + slice. Real API: forwarded as query-string.
 */
export async function fetchFilteredCampaigns(
  filters: CampaignFilters = {},
  options?: { signal?: AbortSignal }
): Promise<PaginatedResponse<Campaign>> {
  const { page = 1, limit = 10, search = '', status = '', city = '' } = filters;



  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Campaign>>>('/Campaigns', {
    params: {
      Page: page,
      Limit: limit,
      Search: search || undefined,
      Status: status || undefined,
      City: city || undefined
    },
    signal: options?.signal,
  });
  validateContract('Paginated Campaigns', createPaginatedSchema(CampaignContractSchema), data.data);
  return data.data;
}

export async function createCampaign(payload: CreateCampaignRequest): Promise<ApiResponse<Campaign>> {

  const { data } = await apiClient.post<ApiResponse<Campaign>>('/Campaigns', payload);
  return data;
}

/** PATCH /Campaigns/:id — partial update */
export async function updateCampaign(
  id: string,
  payload: UpdateCampaignRequest,
): Promise<ApiResponse<Campaign>> {

  const fullPayload = { ...payload, id };
  const { data } = await apiClient.patch<ApiResponse<Campaign>>(`/Campaigns/${id}`, fullPayload);
  return data;
}

/** DELETE /Campaigns/:id — delete campaign */
export async function deleteCampaign(id: string): Promise<ApiResponse<string>> {

  const { data } = await apiClient.delete<ApiResponse<string>>(`/Campaigns/${id}`);
  return data;
}

/** POST /Campaigns/:id/complete — mark campaign as completed early */
export async function completeCampaign(id: string): Promise<ApiResponse<Campaign>> {

  const { data } = await apiClient.post<ApiResponse<Campaign>>(`/Campaigns/${id}/complete`);
  return data;
}

/** GET /Campaigns/:id/appointments — get appointments for a campaign */
export async function fetchCampaignAppointments(id: string): Promise<ApiResponse<AppointmentSlot[]>> {

  const { data } = await apiClient.get<ApiResponse<AppointmentSlot[]>>(`/Campaigns/${id}/appointments`);

  const mappedData = (data.data || []).map((item: any) => {
    let normalizedStatus = (item.status || '').toLowerCase();
    if (normalizedStatus === 'noshow') normalizedStatus = 'missed';
    return {
      ...item,
      status: normalizedStatus as AppointmentSlot['status'],
      date: item.date ? item.date.split('T')[0] : item.date,
      donorGender: item.donorGender ? (item.donorGender as string).toLowerCase() as 'male' | 'female' : undefined,
    };
  });
  return { ...data, data: mappedData };
}
