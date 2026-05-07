// ═══════════════════════════════════════════════════════════
// Campaigns API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { Campaign, CreateCampaignRequest } from '../types/campaign';
import { campaigns as MOCK_CAMPAIGNS } from '../data/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** In-memory store that mirrors the mock array so mutations persist across refetches */
let mockStore: Campaign[] = [...MOCK_CAMPAIGNS];

export async function fetchCampaigns(): Promise<Campaign[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return mockStore;
  }
  const { data } = await apiClient.get<Campaign[]>('/campaigns');
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
