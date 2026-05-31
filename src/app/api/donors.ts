// ═══════════════════════════════════════════════════════════
// Donors & Donations API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { Donor, Donation, BasicDonationRequest, MedicalRecordRequest, UpdateDonorRequest } from '../types/donor';
import type { PaginatedResponse, ApiResponse, DonorFilters } from '../types/common';
import type { DonationCenter } from '../types/donationCenter';
import type { ApiResponseWrapper } from '../types/auth';
import { validateContract, createPaginatedSchema, DonorContractSchema } from './contract';
// import { donors as MOCK_DONORS } from '../data/donors.mock';
// import { donations as MOCK_DONATIONS } from '../data/donations.mock';
import axios from 'axios';


/** In-memory store — donors (profiles) */
// let mockDonorStore: Donor[] = [...MOCK_DONORS];

/** In-memory store — donations (events) */
// let mockDonationStore: Donation[] = [...MOCK_DONATIONS];

// ═══════════════════════════════════════════════════════════
//  DONORS  — profile-level endpoints
// ═══════════════════════════════════════════════════════════

/** Fetch all donors (unpaginated — used by components that need the full list) */
export async function fetchDonors(): Promise<PaginatedResponse<Donor>> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<{
    items?: Donor[];
    data?: Donor[];
    total: number;
    page: number;
    limit: number;
  }>>('/donors');
  const rawItems = wrapper.data?.items || wrapper.data?.data || [];
  const mappedItems: Donor[] = rawItems.map((item: any) => ({
    ...item,
    status: (() => {
      const rawStatus = item.eligibilityStatus || item.status;
      return rawStatus === 'rejected' ? 'ineligible' : rawStatus;
    })(),
    donations: item.donationsNumber !== undefined ? item.donationsNumber : item.donations,
  }));
  const total = wrapper.data?.total || mappedItems.length;
  const result = {
    data: mappedItems,
    total,
    page: wrapper.data?.page || 1,
    limit: wrapper.data?.limit || mappedItems.length
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

  // if (USE_MOCK) {
  //   await new Promise((r) => setTimeout(r, 300));
  // 
  //   // ── Client-side filtering ──────────────────────────────
  //   let result = mockDonorStore;
  // 
  //   if (search) {
  //     const q = search.toLowerCase();
  //     result = result.filter(
  //       (d) =>
  //         d.name.toLowerCase().includes(q) ||
  //         d.nationalId.includes(q) ||
  //         d.donorCode.toLowerCase().includes(q) ||
  //         d.phone.includes(q),
  //     );
  //   }
  //   if (bloodType) result = result.filter((d) => d.bloodType === bloodType);
  //   if (status) result = result.filter((d) => d.status === status);
  //   if (district) result = result.filter((d) => d.district === district);
  // 
  //   // ── Client-side pagination ─────────────────────────────
  //   const total = result.length;
  //   const start = (page - 1) * limit;
  //   const data = result.slice(start, start + limit);
  // 
  //   return { data, total, page, limit };
  // }

  // ── Real API: forward all params as query-string ─────────
  const params: Record<string, any> = { page, limit };
  if (search) params.search = search;
  if (bloodType) params.bloodType = bloodType;
  if (status) params.status = status;
  if (district) params.district = district;

  try {
    const { data: wrapper } = await apiClient.get<ApiResponseWrapper<{
      items?: Donor[];
      data?: Donor[];
      total: number;
      page: number;
      limit: number;
    }>>('/Donors', {
      params,
      signal: options?.signal,
    });

    const rawItems = wrapper.data?.items || wrapper.data?.data || [];
    const mappedItems: Donor[] = rawItems.map((item: any) => ({
      ...item,
      status: (() => {
        const rawStatus = item.eligibilityStatus || item.status;
        return rawStatus === 'rejected' ? 'ineligible' : rawStatus;
      })(),
      donations: item.donationsNumber !== undefined ? item.donationsNumber : item.donations,
    }));

    return {
      data: mappedItems,
      total: wrapper.data?.total || 0,
      page: wrapper.data?.page || 1,
      limit: wrapper.data?.limit || 10,
    };
  } catch (error) {
    if (!axios.isCancel(error) && (error as any)?.message !== 'canceled') {
      console.error('Error in fetchPaginatedDonors:', error);
    }
    throw error;
  }
}

export async function fetchDonorById(id: string): Promise<ApiResponse<Donor>> {
  try {
    const { data: wrapper } = await apiClient.get<any>(`/Donors/${id}`);
    // Handle both wrapped { success, data: {...} } and bare donor responses
    const rawDonor = wrapper?.data ?? wrapper;
    const donor: Donor = {
      ...rawDonor,
      status: (() => {
        const rawStatus = rawDonor.eligibilityStatus || rawDonor.status;
        return rawStatus === 'rejected' ? 'ineligible' : rawStatus;
      })(),
      donations: rawDonor.donationsNumber !== undefined ? rawDonor.donationsNumber : rawDonor.donations,
    };
    return { data: donor };
  } catch (error) {
    console.error('[API] fetchDonorById error:', error);
    throw error;
  }
}

export async function searchDonorByNationalId(nationalId: string): Promise<ApiResponse<Donor | null>> {
  try {
    const { data } = await apiClient.get<ApiResponse<Donor | null>>('/Donors/search', {
      params: { nationalId },
    });
    if (data && data.data) {
      const rawDonor = data.data as any;
      data.data = {
        ...rawDonor,
        status: (() => {
          const rawStatus = rawDonor.eligibilityStatus || rawDonor.status;
          return rawStatus === 'rejected' ? 'ineligible' : rawStatus;
        })(),
        donations: rawDonor.donationsNumber !== undefined ? rawDonor.donationsNumber : rawDonor.donations,
      } as Donor;
    }
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { data: null };
    }
    throw error;
  }
}

/** PATCH /donors/:id — partial update */
export async function updateDonor(
  id: string,
  payload: UpdateDonorRequest,
): Promise<ApiResponse<Donor>> {
  // Build patch payload — only send the fields the modal allows to change.
  // DO NOT send governorate/area/address: they are not stored on Donor and
  // sending them without a valid governorate causes a 500 on the backend.
  const patchPayload: Record<string, any> = {};
  if (payload.name !== undefined) patchPayload.name = payload.name;
  if (payload.phone !== undefined) patchPayload.phone = payload.phone;
  if (payload.bloodType !== undefined) patchPayload.bloodType = payload.bloodType;
  if (payload.district !== undefined) patchPayload.district = payload.district;
  if (payload.governorate !== undefined) patchPayload.governorate = payload.governorate;
  if (payload.area !== undefined) patchPayload.area = payload.area;
  if (payload.nationalId !== undefined) patchPayload.nationalId = payload.nationalId;
  if (payload.dateOfBirth !== undefined) patchPayload.dateOfBirth = payload.dateOfBirth;

  try {
    const { data } = await apiClient.patch<ApiResponseWrapper<Donor>>(`/Donors/${id}`, patchPayload);
    return data;
  } catch (error) {
    console.error('Error in updateDonor:', error);
    throw error;
  }
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
export async function addDonation(payload: BasicDonationRequest): Promise<ApiResponse<{ id: string } | string>> {

  const { data } = await apiClient.post<ApiResponse<{ id: string } | string>>('/Donations', payload);
  return data;
}

/** POST /donations/:id/medical-record — Step 2: add medical data */
export async function addMedicalRecord(donationId: string, payload: MedicalRecordRequest): Promise<ApiResponse<string>> {

  const { data } = await apiClient.post<ApiResponse<string>>('/Donations/' + donationId + '/medical-record', payload);
  return data;
}

/** DELETE /donations/:id — remove a donation */
export async function deleteDonation(donationId: string): Promise<ApiResponse<void>> {

  try {
    const { data } = await apiClient.delete<ApiResponseWrapper<any>>(`/Donations/${donationId}`);
    return {
      data: undefined as any,
      message: data.message || 'تم حذف التبرع بنجاح',
    };
  } catch (error) {
    console.error('Error in deleteDonation:', error);
    throw error;
  }
}

/** POST /donations/:id/confirm — mark donation as sent to lab */
export async function confirmDonation(donationId: string): Promise<ApiResponse<void>> {

  try {
    const { data } = await apiClient.post<ApiResponseWrapper<any>>(`/Donations/${donationId}/confirm`);
    return {
      data: undefined as any,
      message: data.message || 'تم إرسال التبرع للمختبر بنجاح',
    };
  } catch (error) {
    console.error('Error in confirmDonation:', error);
    throw error;
  }
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
