// ═══════════════════════════════════════════════════════════
// Campaigns API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { Campaign, CreateCampaignRequest } from '../types/campaign';
import { campaigns as MOCK_CAMPAIGNS } from '../data/mockData';

const USE_MOCK = true;

export async function fetchCampaigns(): Promise<Campaign[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_CAMPAIGNS;
  }
  const { data } = await apiClient.get<Campaign[]>('/campaigns');
  return data;
}

export async function createCampaign(payload: CreateCampaignRequest): Promise<Campaign> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    return { ...payload, id: `CAM-${Date.now()}` };
  }
  const { data } = await apiClient.post<Campaign>('/campaigns', payload);
  return data;
}
