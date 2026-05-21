// ═══════════════════════════════════════════════════════════
// Donors & Donations API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import { ApiError } from './errors';
import type { Donor, Donation, BasicDonationRequest, MedicalRecordRequest, UpdateDonorRequest } from '../types/donor';
import type { PaginatedResponse, ApiResponse, DonorFilters } from '../types/common';
import { validateContract, createPaginatedSchema, DonorContractSchema } from './contract';
import { donors as MOCK_DONORS } from '../data/donors.mock';
import { donations as MOCK_DONATIONS } from '../data/donations.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** In-memory store — donors (profiles) */
let mockDonorStore: Donor[] = [...MOCK_DONORS];

/** In-memory store — donations (events) */
let mockDonationStore: Donation[] = [...MOCK_DONATIONS];

// ═══════════════════════════════════════════════════════════
//  DONORS  — profile-level endpoints
// ═══════════════════════════════════════════════════════════

/** Fetch all donors (unpaginated — used by components that need the full list) */
export async function fetchDonors(): Promise<PaginatedResponse<Donor>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { data: mockDonorStore, total: mockDonorStore.length, page: 1, limit: mockDonorStore.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<Donor>>('/donors');
  validateContract('Donors List', createPaginatedSchema(DonorContractSchema), data);
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
  filters: DonorFilters = {}, options?: { signal?: AbortSignal }
): Promise<PaginatedResponse<Donor>> {
  const { page = 1, limit = 10, search = '', bloodType = '', status = '', city = '' } = filters;

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));

    // ── Client-side filtering ──────────────────────────────
    let result = mockDonorStore;

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
    if (status) result = result.filter((d) => d.status === status);
    if (city) result = result.filter((d) => d.city === city);

    // ── Client-side pagination ─────────────────────────────
    const total = result.length;
    const start = (page - 1) * limit;
    const data = result.slice(start, start + limit);

    return { data, total, page, limit };
  }

  // ── Real API: forward all params as query-string ─────────
  const { data } = await apiClient.get<PaginatedResponse<Donor>>('/donors', {
    params: { page, limit, search, bloodType, status, city }, signal: options?.signal,
  });
  validateContract('Paginated Donors', createPaginatedSchema(DonorContractSchema), data);
  return data;
}

export async function fetchDonorById(id: string): Promise<ApiResponse<Donor>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    const donor = mockDonorStore.find((d) => d.id === id);
    if (!donor) throw new ApiError('المتبرع غير موجود', 404);
    return { data: donor };
  }
  const { data } = await apiClient.get<ApiResponse<Donor>>(`/donors/${id}`);
  return data;
}

export async function searchDonorByNationalId(nationalId: string): Promise<ApiResponse<Donor | null>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const donor = mockDonorStore.find((d) => d.nationalId === nationalId);
    return { data: donor || null };
  }
  const { data } = await apiClient.get<ApiResponse<Donor | null>>('/donors/search', {
    params: { nationalId },
  });
  return data;
}

/** PATCH /donors/:id — partial update */
export async function updateDonor(
  id: string,
  payload: UpdateDonorRequest,
): Promise<ApiResponse<Donor>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const idx = mockDonorStore.findIndex((d) => d.id === id);
    if (idx === -1) throw new ApiError('المتبرع غير موجود', 404);
    const updated = { ...mockDonorStore[idx], ...payload };
    mockDonorStore = mockDonorStore.map((d) => (d.id === id ? updated : d));
    return { data: updated, message: 'تم تحديث بيانات المتبرع بنجاح' };
  }
  const { data } = await apiClient.patch<ApiResponse<Donor>>(`/donors/${id}`, payload);
  return data;
}

// ═══════════════════════════════════════════════════════════
//  DONATIONS  — donation-event endpoints
// ═══════════════════════════════════════════════════════════

/** Fetch ALL donations (unpaginated — used by dashboards for statistics) */
export async function fetchAllDonations(): Promise<PaginatedResponse<Donation>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { data: mockDonationStore, total: mockDonationStore.length, page: 1, limit: mockDonationStore.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<Donation>>('/donations', { params: { limit: 9999 } });
  return data;
}

/**
 * Fetch donations with pagination, search and filtering.
 */
export async function fetchPaginatedDonations(
  filters: DonorFilters = {}, options?: { signal?: AbortSignal }
): Promise<PaginatedResponse<Donation>> {
  const { page = 1, limit = 10, search = '', bloodType = '', city = '' } = filters;

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));

    let result: Donation[] = mockDonationStore;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.nationalId.includes(q) ||
          (d.donorCode?.toLowerCase().includes(q) ?? false) ||
          d.donationCode.toLowerCase().includes(q) ||
          d.phone.includes(q),
      );
    }
    if (bloodType) result = result.filter((d) => d.bloodType === bloodType);
    if (city) result = result.filter((d) => d.city === city);

    const total = result.length;
    const start = (page - 1) * limit;
    const data = result.slice(start, start + limit);

    return { data, total, page, limit };
  }

  const { data } = await apiClient.get<PaginatedResponse<Donation>>('/donations', {
    params: { page, limit, search, bloodType, city }, signal: options?.signal,
  });
  return data;
}

/** POST /donations — Step 1: create donation with basic info */
export async function addDonation(payload: BasicDonationRequest): Promise<ApiResponse<{ donationId: string }>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const donationId = 'DONATION-' + Date.now();
    const existing = mockDonorStore.find(d => d.nationalId === payload.nationalId);
    if (!existing) {
      const newDonor = {
        id: 'DON-' + Date.now(),
        donorCode: 'DNR-2025-' + String(Math.floor(Math.random() * 9000) + 1000),
        name: payload.name,
        gender: payload.gender,
        age: payload.age,
        nationalId: payload.nationalId,
        phone: payload.phone,
        address: payload.address,
        city: payload.city,
        bloodType: payload.bloodType,
        status: 'eligible' as const,
      } satisfies Donor;
      mockDonorStore = [newDonor, ...mockDonorStore];
    }
    // Also add to donations store
    const newDonation: Donation = {
      id: donationId,
      donationCode: 'DTN-2025-' + String(Math.floor(Math.random() * 9000) + 1000),
      donorId: existing?.id || 'DON-' + Date.now(),
      donorCode: existing?.donorCode,
      name: payload.name,
      gender: payload.gender,
      age: payload.age,
      nationalId: payload.nationalId,
      phone: payload.phone,
      address: payload.address,
      city: payload.city,
      bloodType: payload.bloodType,
      donationType: payload.donationType,
      source: payload.source,
      campaignId: payload.campaignId,
      donationDate: new Date().toISOString().split('T')[0],
      diseases: [],
      sentToLab: false,
      status: "",
    };
    mockDonationStore = [newDonation, ...mockDonationStore];
    return { data: { donationId }, message: 'تم تسجيل التبرع المبدئي بنجاح' };
  }
  const { data } = await apiClient.post<ApiResponse<{ donationId: string }>>('/donations', payload);
  return data;
}

/** POST /donations/:id/medical-record — Step 2: add medical data */
export async function addMedicalRecord(donationId: string, payload: MedicalRecordRequest): Promise<ApiResponse<{ donationCode: string }>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    // Update the donation in mock store with medical data
    const idx = mockDonationStore.findIndex(d => d.id === donationId);
    let donationCode = '';
    if (idx !== -1) {
      mockDonationStore[idx] = {
        ...mockDonationStore[idx],
        diseases: payload.diseases,
        additionalData: payload.additionalData,
        isAllergic: payload.isAllergic,
      };
      donationCode = mockDonationStore[idx].donationCode;
    }
    return { data: { donationCode }, message: 'تم إضافة السجل الطبي بنجاح' };
  }
  const { data } = await apiClient.post<ApiResponse<{ donationCode: string }>>('/donations/' + donationId + '/medical-record', payload);
  return data;
}

/** DELETE /donations/:id — remove a donation */
export async function deleteDonation(donationId: string): Promise<ApiResponse<void>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const idx = mockDonationStore.findIndex(d => d.id === donationId);
    if (idx === -1) throw new ApiError('التبرع غير موجود', 404);
    mockDonationStore = mockDonationStore.filter(d => d.id !== donationId);
    return { data: undefined as any, message: 'تم حذف التبرع بنجاح' };
  }
  const { data } = await apiClient.delete<ApiResponse<void>>(`/donations/${donationId}`);
  return data;
}

/** POST /donations/:id/confirm — mark donation as sent to lab */
export async function confirmDonation(donationId: string): Promise<ApiResponse<void>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const idx = mockDonationStore.findIndex(d => d.id === donationId);
    if (idx === -1) throw new ApiError('التبرع غير موجود', 404);
    mockDonationStore[idx] = { ...mockDonationStore[idx], sentToLab: true };
    return { data: undefined as any, message: 'تم إرسال التبرع للمختبر بنجاح' };
  }
  const { data } = await apiClient.post<ApiResponse<void>>(`/donations/${donationId}/confirm`);
  return data;
}
