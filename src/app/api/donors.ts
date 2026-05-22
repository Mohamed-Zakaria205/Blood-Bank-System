// ═══════════════════════════════════════════════════════════
// Donors & Donations API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import { ApiError } from './errors';
import type { Donor, Donation, BasicDonationRequest, MedicalRecordRequest, UpdateDonorRequest } from '../types/donor';
import type { PaginatedResponse, ApiResponse, DonorFilters } from '../types/common';
import type { DonationCenter } from '../types/donationCenter';
import type { ApiResponseWrapper } from '../types/auth';
import { validateContract, createPaginatedSchema, DonorContractSchema } from './contract';
import { donors as MOCK_DONORS } from '../data/donors.mock';
import { donations as MOCK_DONATIONS } from '../data/donations.mock';
import axios from 'axios';

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
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<{
    items?: Donor[];
    data?: Donor[];
    total: number;
    page: number;
    limit: number;
  }>>('/donors');
  const rawItems = wrapper.data?.items || wrapper.data?.data || [];
  const total = wrapper.data?.total || rawItems.length;
  const result = {
    data: rawItems,
    total,
    page: wrapper.data?.page || 1,
    limit: wrapper.data?.limit || rawItems.length
  };
  validateContract('Donors List', createPaginatedSchema(DonorContractSchema), result);
  return result;
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
  const { page = 1, limit = 10, search = '', bloodType = '', status = '', district = '' } = filters;

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
    if (district) result = result.filter((d) => d.district === district);

    // ── Client-side pagination ─────────────────────────────
    const total = result.length;
    const start = (page - 1) * limit;
    const data = result.slice(start, start + limit);

    return { data, total, page, limit };
  }

  // ── Real API: forward all params as query-string ─────────
  const params: Record<string, any> = { page, limit };
  if (search) params.search = search;
  if (bloodType) params.bloodType = bloodType;
  if (status) params.status = status;
  if (district) params.district = district;

  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<{
    items?: Donor[];
    data?: Donor[];
    total: number;
    page: number;
    limit: number;
  }>>('/donors', {
    params,
    signal: options?.signal,
  });

  const rawItems = wrapper.data?.items || wrapper.data?.data || [];
  return {
    data: rawItems,
    total: wrapper.data?.total || 0,
    page: wrapper.data?.page || 1,
    limit: wrapper.data?.limit || 10,
  };
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

  try {
    const { data: wrapper } = await apiClient.get<ApiResponseWrapper<{
      items?: Donation[];
      data?: Donation[];
      total: number;
      page: number;
      limit: number;
    }>>('/Donations', { params: { limit: 9999 } });

    const rawItems = wrapper.data?.items || wrapper.data?.data || [];
    return {
      data: rawItems,
      total: wrapper.data?.total || 0,
      page: wrapper.data?.page || 1,
      limit: wrapper.data?.limit || 10,
    };
  } catch (error) {
    console.error('Error in fetchAllDonations:', error);
    throw error;
  }
}

/**
 * Fetch donations with pagination, search and filtering.
 */
export async function fetchPaginatedDonations(
  filters: DonorFilters = {}, options?: { signal?: AbortSignal }
): Promise<PaginatedResponse<Donation>> {
  const { page = 1, limit = 10, search = '', bloodType = '', district = '' } = filters;


  const params: Record<string, any> = { page, limit };
  if (search) params.search = search;
  if (bloodType) params.bloodType = bloodType;
  if (district) params.district = district;

  try {
    const { data: wrapper } = await apiClient.get<ApiResponseWrapper<{
      items?: Donation[];
      data?: Donation[];
      total: number;
      page: number;
      limit: number;
    }>>('/Donations', {
      params,
      signal: options?.signal,
    });

    const rawItems = wrapper.data?.items || wrapper.data?.data || [];
    return {
      data: rawItems,
      total: wrapper.data?.total || 0,
      page: wrapper.data?.page || 1,
      limit: wrapper.data?.limit || 10,
    };
  } catch (error) {
    if (!axios.isCancel(error) && (error as any)?.message !== 'canceled') {
      console.error('Error in fetchPaginatedDonations:', error);
    }
    throw error;
  }
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
        address: `${payload.area} - ${payload.district}`,
        district: payload.governorate,
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
      address: `${payload.area} - ${payload.district}`,
      district: payload.governorate,
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
  const { data } = await apiClient.post<ApiResponse<{ donationId: string }>>('/Donations', payload);
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
  const { data } = await apiClient.post<ApiResponse<{ donationCode: string }>>('/Donations/' + donationId + '/medical-record', payload);
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
  const { data } = await apiClient.delete<ApiResponse<void>>(`/Donations/${donationId}`);
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
  const { data } = await apiClient.post<ApiResponse<void>>(`/Donations/${donationId}/confirm`);
  return data;
}

// ═══════════════════════════════════════════════════════════
//  DONATION CENTERS  — fetch centers for walkin dropdown
// ═══════════════════════════════════════════════════════════

/**
 * Fetch donation centers list.
 * The backend currently returns a single main-branch center.
 * We wrap it in an array so the UI can treat it as a list.
 */
export async function fetchDonationCenters(): Promise<DonationCenter[]> {
  try {
    const { data: wrapper } = await apiClient.get<ApiResponseWrapper<DonationCenter>>(
      '/donation-centers/main-branch',
    );
    return wrapper.data ? [wrapper.data] : [];
  } catch (error) {
    console.error('Error in fetchDonationCenters:', error);
    return [];
  }
}
