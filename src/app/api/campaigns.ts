// ═══════════════════════════════════════════════════════════
// Campaigns API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { Campaign, CreateCampaignRequest } from '../types/campaign';
import type { PaginatedResponse, CampaignFilters } from '../types/common';
import { campaigns as MOCK_CAMPAIGNS } from '../data/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** In-memory store that mirrors the mock array so mutations persist across refetches */
let mockStore: Campaign[] = [...MOCK_CAMPAIGNS];

/** Fetch all campaigns (unpaginated — for dropdowns and small lists) */
export async function fetchCampaigns(): Promise<Campaign[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return mockStore;
  }
  const { data } = await apiClient.get<Campaign[]>('/campaigns');
  return data;
}

/**
 * Fetch campaigns with filtering and pagination.
 * Mock: client-side filter + slice. Real API: forwarded as query-string.
 */
export async function fetchFilteredCampaigns(
  filters: CampaignFilters = {},
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
  });
  return data;
}

export async function createCampaign(payload: CreateCampaignRequest): Promise<Campaign> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const newCampaign: Campaign = { ...payload, id: `CAM-${Date.now()}` };
    // ✅ Push into the in-memory array so refetch returns the new campaign
    mockStore = [newCampaign, ...mockStore];
    return newCampaign;
  }
  const { data } = await apiClient.post<Campaign>('/campaigns', payload);
  return data;
}
