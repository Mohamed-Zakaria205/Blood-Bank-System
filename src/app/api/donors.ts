// ═══════════════════════════════════════════════════════════
// Donors API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { Donor, CreateDonorRequest } from '../types/donor';
import type { PaginatedResponse, DonorFilters } from '../types/common';
import { donors as MOCK_DONORS } from '../data/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** In-memory store that mirrors the mock array so mutations persist across refetches */
let mockStore: Donor[] = [...MOCK_DONORS];

/** Fetch all donors (unpaginated — used by components that need the full list) */
export async function fetchDonors(): Promise<Donor[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return mockStore;
  }
  const { data } = await apiClient.get<Donor[]>('/donors');
  return data;
}

/**
 * Fetch donors with pagination, search and filtering.
 *
 * Mock mode: applies client-side slicing so the UI behaves
 * identically to a real paginated API during development.
 *
 * Real API: all params are forwarded as query-string parameters.
 */
export async function fetchPaginatedDonors(
  filters: DonorFilters = {},
): Promise<PaginatedResponse<Donor>> {
  const { page = 1, limit = 10, search = '', bloodType = '', status = '', city = '' } = filters;

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));

    // ── Client-side filtering ──────────────────────────────
    let result = mockStore;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.nationalId.includes(q) ||
          d.donorCode.toLowerCase().includes(q) ||
          d.phone.includes(q),
      );
    }
    if (bloodType) result = result.filter((d) => d.bloodType === bloodType);
    if (status)    result = result.filter((d) => d.status === status);
    if (city)      result = result.filter((d) => d.city === city);

    // ── Client-side pagination ─────────────────────────────
    const total = result.length;
    const start = (page - 1) * limit;
    const data  = result.slice(start, start + limit);

    return { data, total, page, limit };
  }

  // ── Real API: forward all params as query-string ─────────
  const { data } = await apiClient.get<PaginatedResponse<Donor>>('/donors', {
    params: { page, limit, search, bloodType, status, city },
  });
  return data;
}

export async function fetchDonorById(id: string): Promise<Donor> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    const donor = mockStore.find((d) => d.id === id);
    if (!donor) throw { response: { status: 404, data: { message: 'المتبرع غير موجود' } } };
    return donor;
  }
  const { data } = await apiClient.get<Donor>(`/donors/${id}`);
  return data;
}

export async function createDonor(payload: CreateDonorRequest): Promise<Donor> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
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

