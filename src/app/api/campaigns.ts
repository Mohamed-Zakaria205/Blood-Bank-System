// ═══════════════════════════════════════════════════════════
// Campaigns API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import { ApiError } from './errors';
import type { Campaign, CreateCampaignRequest, UpdateCampaignRequest } from '../types/campaign';
import type { PaginatedResponse, ApiResponse, CampaignFilters } from '../types/common';
import { campaigns as MOCK_CAMPAIGNS } from '../data/campaigns.mock';
import { validateContract, createPaginatedSchema, CampaignContractSchema } from './contract';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** In-memory store that mirrors the mock array so mutations persist across refetches */
let mockStore: Campaign[] = [...MOCK_CAMPAIGNS];

/** Fetch all campaigns (unpaginated — for dropdowns and small lists) */
export async function fetchCampaigns(): Promise<PaginatedResponse<Campaign>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { data: mockStore, total: mockStore.length, page: 1, limit: mockStore.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<Campaign>>('/campaigns');
  validateContract('Campaigns List', createPaginatedSchema(CampaignContractSchema), data);
  return data;
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

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));

    let result = mockStore;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.location.toLowerCase().includes(q),
      );
    }
    if (status) result = result.filter((c) => c.status === status);
    if (city)   result = result.filter((c) => c.city === city);

    const total = result.length;
    const data  = result.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  }

  const { data } = await apiClient.get<PaginatedResponse<Campaign>>('/campaigns', {
    params: { page, limit, search, status, city },
    signal: options?.signal,
  });
  validateContract('Paginated Campaigns', createPaginatedSchema(CampaignContractSchema), data);
  return data;
}

export async function createCampaign(payload: CreateCampaignRequest): Promise<ApiResponse<Campaign>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const newCampaign: Campaign = { ...payload, id: `CAM-${Date.now()}` };
    // ✅ Push into the in-memory array so refetch returns the new campaign
    mockStore = [newCampaign, ...mockStore];
    return { data: newCampaign, message: 'تم إنشاء الحملة بنجاح' };
  }
  const { data } = await apiClient.post<ApiResponse<Campaign>>('/campaigns', payload);
  return data;
}

/** PATCH /campaigns/:id — partial update */
export async function updateCampaign(
  id: string,
  payload: UpdateCampaignRequest,
): Promise<ApiResponse<Campaign>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const idx = mockStore.findIndex((c) => c.id === id);
    if (idx === -1) throw new ApiError('الحملة غير موجودة', 404);
    const updated = { ...mockStore[idx], ...payload };
    mockStore = mockStore.map((c) => (c.id === id ? updated : c));
    return { data: updated, message: 'تم تحديث بيانات الحملة بنجاح' };
  }
  const { data } = await apiClient.patch<ApiResponse<Campaign>>(`/campaigns/${id}`, payload);
  return data;
}
