// ═══════════════════════════════════════════════════════════
// Donors API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { Donor, CreateDonorRequest } from '../types/donor';
import { donors as MOCK_DONORS } from '../data/mockData';

const USE_MOCK = true;

/** In-memory store that mirrors the mock array so mutations persist across refetches */
let mockStore: Donor[] = [...MOCK_DONORS];

export async function fetchDonors(): Promise<Donor[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return mockStore;
  }
  const { data } = await apiClient.get<Donor[]>('/donors');
  return data;
}

export async function fetchDonorById(id: string): Promise<Donor> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    const donor = mockStore.find(d => d.id === id);
    if (!donor) throw { response: { status: 404, data: { message: 'المتبرع غير موجود' } } };
    return donor;
  }
  const { data } = await apiClient.get<Donor>(`/donors/${id}`);
  return data;
}

export async function createDonor(payload: CreateDonorRequest): Promise<Donor> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    const newDonor: Donor = {
      ...payload,
      id: `DON-${Date.now()}`,
      donorCode: `DNR-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    };
    // ✅ Push into the in-memory array so refetch returns the new donor
    mockStore = [newDonor, ...mockStore];
    return newDonor;
  }
  const { data } = await apiClient.post<Donor>('/donors', payload);
  return data;
}
