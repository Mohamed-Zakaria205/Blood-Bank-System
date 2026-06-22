// ═══════════════════════════════════════════════════════════
// Donors & Donations API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type {
  Donor,
  Donation,
  BasicDonationRequest,
  MedicalRecordRequest,
  UpdateDonorRequest,
  EligibilityStats,
  SendNotificationRequest,
  SendNotificationResponse,
  EligibilitySettings,
} from '../types/donor';
import type { PaginatedResponse, ApiResponse, DonorFilters, DonationFilters } from '../types/common';
import type { DonationCenter, MainBranchSettings, UpdateMainBranchSettingsRequest } from '../types/donationCenter';
import type { ApiResponseWrapper } from '../types/auth';
import {
  validateContract,
  createPaginatedSchema,
  DonorContractSchema,
  EligibilityStatsContractSchema,
  EligibilitySettingsContractSchema,
  MainBranchSettingsContractSchema,
} from './contract';
import axios from 'axios';

// ═══════════════════════════════════════════════════════════
//  DONORS  — profile-level endpoints
// ═══════════════════════════════════════════════════════════

// ── Raw backend donor shape ──────────────────────────────────
interface RawDonorFromBackend {
  id?: string;
  name?: string;
  gender?: string;
  eligibility?: {
    status?: string;
    daysLeft?: number;
    daysAgo?: number;
    eligibleDate?: string;
  };
  eligibilityStatus?: string;
  status?: string;
  donationsNumber?: number;
  donations?: number;
  [key: string]: unknown;
}

export function mapRawDonor(item: RawDonorFromBackend): Donor {
  if (!item) return item as unknown as Donor;
  const normalizeStatus = (s: string) => (s || '').toLowerCase();

  const normalizedEligibility = item.eligibility ? {
    status: normalizeStatus(item.eligibility.status ?? '') as import('../types/donor').EligibilityStatus,
    daysLeft: Number(item.eligibility.daysLeft ?? 0),
    daysAgo: Number(item.eligibility.daysAgo ?? 0),
    eligibleDate: item.eligibility.eligibleDate ? item.eligibility.eligibleDate.split('T')[0] : '',
  } : undefined;

  const rawStatus = normalizeStatus((item.eligibilityStatus || item.status || '') as string);
  const status = rawStatus === 'ineligible' ? 'rejected' : rawStatus;

  return {
    ...item,
    status: status as import('../types/common').DonorStatus,
    donations: item.donationsNumber !== undefined ? item.donationsNumber : (item.donations as number | undefined),
    eligibility: normalizedEligibility,
  } as Donor;
}


/** Fetch all donors (unpaginated — used by components that need the full list) */
export async function fetchDonors(): Promise<PaginatedResponse<Donor>> {
  const { data: wrapper } = await apiClient.get<
    ApiResponseWrapper<{
      items?: Donor[];
      data?: Donor[];
      total: number;
      page: number;
      limit: number;
    }>
  >('/donors');
  const rawItems = wrapper.data?.items || wrapper.data?.data || [];
  const mappedItems: Donor[] = (rawItems as unknown as RawDonorFromBackend[]).map(mapRawDonor);
  const total = wrapper.data?.total || mappedItems.length;
  const result = {
    data: mappedItems,
    total,
    page: wrapper.data?.page || 1,
    limit: wrapper.data?.limit || mappedItems.length,
  };
  validateContract('Donors List', createPaginatedSchema(DonorContractSchema), result);
  return result;
}

/**
 * Fetch donors with pagination, search and filtering.
 * Real API: all params are forwarded as query-string parameters.
 */
export async function fetchPaginatedDonors(
  filters: DonorFilters = {},
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<Donor>> {
  const { page = 1, limit = 10, search = '', bloodType = '', status = '', district = '' } = filters;


  // ── Real API: forward all params as query-string ─────────
  const params: Record<string, string | number | undefined> = { page, limit };
  if (search) params.search = search;
  if (bloodType) params.bloodType = bloodType;
  if (status) params.status = status === 'rejected' ? 'ineligible' : status;
  if (district) params.district = district;

  try {
    const { data: wrapper } = await apiClient.get<
      ApiResponseWrapper<{
        items?: Donor[];
        data?: Donor[];
        total: number;
        page: number;
        limit: number;
      }>
    >('/Donors', {
      params,
      signal: options?.signal,
    });

    const rawItems = wrapper.data?.items || wrapper.data?.data || [];
    const mappedItems: Donor[] = (rawItems as unknown as RawDonorFromBackend[]).map(mapRawDonor);

    return {
      data: mappedItems,
      total: wrapper.data?.total || 0,
      page: wrapper.data?.page || 1,
      limit: wrapper.data?.limit || 10,
    };
  } catch (error: unknown) {
    if (!axios.isCancel(error) && !(error instanceof Error && error.message === 'canceled')) {
      console.error('Error in fetchPaginatedDonors:', error);
    }
    throw error;
  }
}

/**
 * Fetch donors with calculated eligibility, pagination, search and filtering.
 * Uses the new backend endpoint designed specifically for the Donor Eligibility feature.
 */
export async function fetchPaginatedEligibleDonors(
  filters: DonorFilters = {},
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<Donor>> {
  const { page = 1, limit = 10, search = '', bloodType = '', status = '', district = '', gender = '' } = filters;

  const params: Record<string, string | number | undefined> = { page, limit };
  if (search) params.search = search;
  if (bloodType) params.bloodType = bloodType;
  if (status && status !== 'all') params.status = status;
  if (district && district !== 'all') params.district = district;
  if (gender && gender !== 'all') params.gender = gender;

  try {
    const { data: wrapper } = await apiClient.get<ApiResponseWrapper<{
      items?: Donor[];
      data?: Donor[];
      total: number;
      page: number;
      limit: number;
      totalPages?: number;
    }>>('/donors/eligibility', {
      params,
      signal: options?.signal,
    });

    const rawItems = wrapper.data?.items || wrapper.data?.data || [];
    const mappedItems: Donor[] = (rawItems as unknown as RawDonorFromBackend[]).map(mapRawDonor);

    const result = {
      data: mappedItems,
      total: wrapper.data?.total || 0,
      page: wrapper.data?.page || 1,
      limit: wrapper.data?.limit || 10,
      totalPages: wrapper.data?.totalPages || 0,
    };
    validateContract('Eligible Donors List', createPaginatedSchema(DonorContractSchema), result);
    return result;
  } catch (error: unknown) {
    if (!axios.isCancel(error) && !(error instanceof Error && error.message === 'canceled')) {
      console.error('Error in fetchPaginatedEligibleDonors:', error);
    }
    throw error;
  }
}

export async function fetchDonorById(id: string): Promise<ApiResponse<Donor>> {
  try {
    const { data: wrapper } = await apiClient.get<ApiResponseWrapper<Donor>>(`/Donors/${id}`);
    // Handle both wrapped { success, data: {...} } and bare donor responses
    const rawDonor = wrapper?.data ?? (wrapper as unknown as RawDonorFromBackend);
    const donor: Donor = mapRawDonor(rawDonor as unknown as RawDonorFromBackend);
    return { data: donor };
  } catch (error) {
    console.error('[API] fetchDonorById error:', error);
    throw error;
  }
}

export async function searchDonorByNationalId(
  nationalId: string,
): Promise<ApiResponse<Donor | null>> {
  try {
    const { data } = await apiClient.get<ApiResponse<Donor | null>>('/Donors/search', {
      params: { nationalId },
    });
    if (data && data.data) {
      data.data = mapRawDonor(data.data as unknown as RawDonorFromBackend);
    }
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } }).response?.status === 404) {
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
  type PatchableDonorFields = Pick<
    UpdateDonorRequest,
    'name' | 'phone' | 'bloodType' | 'district' | 'governorate' | 'area' | 'nationalId' | 'dateOfBirth'
  >;
  const patchPayload: Partial<PatchableDonorFields> = {};
  if (payload.name !== undefined) patchPayload.name = payload.name;
  if (payload.phone !== undefined) patchPayload.phone = payload.phone;
  if (payload.bloodType !== undefined) patchPayload.bloodType = payload.bloodType;
  if (payload.district !== undefined) patchPayload.district = payload.district;
  if (payload.governorate !== undefined) patchPayload.governorate = payload.governorate;
  if (payload.area !== undefined) patchPayload.area = payload.area;
  if (payload.nationalId !== undefined) patchPayload.nationalId = payload.nationalId;
  if (payload.dateOfBirth !== undefined) patchPayload.dateOfBirth = payload.dateOfBirth;

  try {
    const { data } = await apiClient.patch<ApiResponseWrapper<Donor>>(
      `/Donors/${id}`,
      patchPayload,
    );
    return data;
  } catch (error) {
    console.error('Error in updateDonor:', error);
    throw error;
  }
}

/** Fetch eligibility statistics for status cards and blood type bar */
export async function fetchDonorEligibilityStats(): Promise<ApiResponse<EligibilityStats>> {
  try {
    interface RawEligibilityStats {
      statusCounts?: {
        all?: number;
        eligible?: number;
        soon?: number;
        not_yet?: number;
        notYet?: number;
        deferred?: number;
        ineligible?: number;
      };
      bloodTypeCounts?: Record<import('../types/common').BloodType, { eligible: number; total: number }>;
    }
    const { data } = await apiClient.get<ApiResponseWrapper<RawEligibilityStats>>('/donors/eligibility/stats');
    const rawCounts = data.data?.statusCounts || {};
    const normalizedStats: EligibilityStats = {
      statusCounts: {
        all: Number(rawCounts.all ?? 0),
        eligible: Number(rawCounts.eligible ?? 0),
        soon: Number(rawCounts.soon ?? 0),
        not_yet: Number(rawCounts.not_yet ?? rawCounts.notYet ?? 0),
        deferred: Number(rawCounts.deferred ?? 0),
        ineligible: Number(rawCounts.ineligible ?? 0),
      },
      bloodTypeCounts: data.data?.bloodTypeCounts || {
        'A+': { eligible: 0, total: 0 },
        'A-': { eligible: 0, total: 0 },
        'B+': { eligible: 0, total: 0 },
        'B-': { eligible: 0, total: 0 },
        'AB+': { eligible: 0, total: 0 },
        'AB-': { eligible: 0, total: 0 },
        'O+': { eligible: 0, total: 0 },
        'O-': { eligible: 0, total: 0 },
      },
    };
    validateContract('Eligibility Stats', EligibilityStatsContractSchema, normalizedStats);
    return { data: normalizedStats };
  } catch (error) {
    console.error('[API] fetchDonorEligibilityStats error:', error);
    throw error;
  }
}

/** Fetch eligibility settings (wait periods) for admin */
export async function fetchEligibilitySettings(): Promise<ApiResponse<EligibilitySettings>> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<any>>('/doctor/settings/cooldown');
  const raw = wrapper.data || {};
  const mappedData: EligibilitySettings = {
    wholeBloodMaleDays: raw.wholeBloodMaleDays !== undefined ? raw.wholeBloodMaleDays : (raw.donorMaleWaitDays !== undefined ? raw.donorMaleWaitDays : 90),
    wholeBloodFemaleDays: raw.wholeBloodFemaleDays !== undefined ? raw.wholeBloodFemaleDays : (raw.donorFemaleWaitDays !== undefined ? raw.donorFemaleWaitDays : 120),
    plasmaDays: raw.plasmaDays !== undefined ? raw.plasmaDays : 28,
    plateletsDays: raw.plateletsDays !== undefined ? raw.plateletsDays : 7,
    defaultScreeningLockoutDays: raw.defaultScreeningLockoutDays !== undefined ? raw.defaultScreeningLockoutDays : 7,
  };
  validateContract('Eligibility Settings', EligibilitySettingsContractSchema, mappedData);
  return { data: mappedData };
}

/** Update eligibility settings (wait periods) for admin */
export async function updateEligibilitySettings(
  settings: EligibilitySettings,
): Promise<ApiResponse<void>> {
  const { data: wrapper } = await apiClient.put<ApiResponseWrapper<any>>('/doctor/settings/cooldown', settings);
  return { data: undefined, message: wrapper.message };
}

/** Send SMS / App notification to one or more donors */
export async function sendDonorNotifications(
  payload: SendNotificationRequest,
): Promise<ApiResponse<SendNotificationResponse>> {
  try {
    const { data } = await apiClient.post<ApiResponseWrapper<SendNotificationResponse>>(`/donors/eligibility/notifications`, payload);
    return { data: data.data, message: data.message };
  } catch (error) {
    console.error('[API] sendDonorNotifications error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
//  DONATIONS  — donation-event endpoints
// ═══════════════════════════════════════════════════════════

/**
 * Fetch donations with pagination, search and filtering.
 */
export async function fetchPaginatedDonations(
  filters: DonationFilters = {},
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<Donation>> {
  const {
    page = 1,
    limit = 10,
    search = '',
    bloodType = '',
    donationSource = '',
    donationStatus = '',
    datePreset = '',
    fromDate = '',
    toDate = '',
  } = filters;

  const params: Record<string, string | number | undefined> = { page, limit };
  if (search) params.search = search;
  if (bloodType) params.bloodType = bloodType;
  if (donationSource) params.donationSource = donationSource;
  if (donationStatus) params.donationStatus = donationStatus;

  if (fromDate && toDate) {
    params.fromDate = fromDate;
    params.toDate = toDate;
  } else if (datePreset) {
    params.datePreset = datePreset;
  }

  try {
    const { data: wrapper } = await apiClient.get<
      ApiResponseWrapper<{
        items?: Donation[];
        data?: Donation[];
        total: number;
        page: number;
        limit: number;
      }>
    >('/Donations', {
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
  } catch (error: unknown) {
    if (!axios.isCancel(error) && !(error instanceof Error && error.message === 'canceled')) {
      console.error('Error in fetchPaginatedDonations:', error);
    }
    throw error;
  }
}

/** POST /donations — Step 1: create donation with basic info */
export async function addDonation(
  payload: BasicDonationRequest,
): Promise<ApiResponse<{ id: string } | string>> {
  const { data } = await apiClient.post<ApiResponse<{ id: string } | string>>(
    '/Donations',
    payload,
  );
  return data;
}

/** POST /donations/:id/medical-record — Step 2: add medical data */
export async function addMedicalRecord(
  donationId: string,
  payload: MedicalRecordRequest,
): Promise<ApiResponse<string>> {
  const { data } = await apiClient.post<ApiResponse<string>>(
    '/Donations/' + donationId + '/medical-record',
    payload,
  );
  return data;
}

/** DELETE /donations/:id — remove a donation */
export async function deleteDonation(donationId: string): Promise<ApiResponse<null>> {
  try {
    const { data } = await apiClient.delete<ApiResponseWrapper<null>>(`/Donations/${donationId}`);
    return {
      data: null,
      message: data.message || 'تم حذف التبرع بنجاح',
    };
  } catch (error) {
    console.error('Error in deleteDonation:', error);
    throw error;
  }
}

/** POST /donations/:id/confirm — mark donation as sent to lab */
export async function confirmDonation(donationId: string): Promise<ApiResponse<null>> {
  try {
    const { data } = await apiClient.post<ApiResponseWrapper<null>>(
      `/Donations/${donationId}/confirm`,
    );
    return {
      data: null,
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

export interface SettingsApiResponseWrapper<T> {
  success?: boolean;
  isSuccess?: boolean;
  message: string;
  data: T;
}

/** Fetch main branch settings */
export async function fetchMainBranchSettings(): Promise<MainBranchSettings> {
  const { data: wrapper } = await apiClient.get<SettingsApiResponseWrapper<any>>(
    '/donation-centers/main-branch',
  );
  const rawData = wrapper.data || {};

  // Handle mapping enums from whole_blood, platelets, plasma to WholeBlood, Platelets, Plasma
  const rawDonationTypes: string[] = rawData.supportedDonationTypes || rawData.availableDonationTypes || ['whole_blood', 'platelets', 'plasma'];
  const mappedDonationTypes = rawDonationTypes.map((t: string) => {
    const norm = t.toLowerCase().replace('_', '');
    if (norm === 'wholeblood') return 'WholeBlood';
    if (norm === 'platelets') return 'Platelets';
    if (norm === 'plasma') return 'Plasma';
    return t;
  });

  const mappedData: MainBranchSettings = {
    id: rawData.id || 'b5b4d5b7-eaf8-4a92-8b0a-2fc73f6cc3d1',
    name: rawData.name || 'مستشفى بني سويف العام',
    location: rawData.location || 'بني سويف',
    addressDetails: rawData.addressDetails || 'شارع الرياض، بجوار مركز البريد',
    phoneNumber: rawData.phoneNumber || rawData.phone || '082-2320000',
    email: rawData.email || 'info@bsgh.gov.eg',
    supportedDonationTypes: mappedDonationTypes,
    slotDurationMinutes: rawData.slotDurationMinutes !== undefined ? rawData.slotDurationMinutes : 15,
    maxDonorsPerSlot: rawData.maxDonorsPerSlot !== undefined ? rawData.maxDonorsPerSlot : 10,
    weeklyHours: rawData.weeklyHours || [
      { dayOfWeek: 0, isClosed: false, openingTime: '08:00', closingTime: '16:00', maxDonorsPerSlot: null },
      { dayOfWeek: 1, isClosed: false, openingTime: '08:00', closingTime: '16:00', maxDonorsPerSlot: null },
      { dayOfWeek: 2, isClosed: false, openingTime: '08:00', closingTime: '16:00', maxDonorsPerSlot: null },
      { dayOfWeek: 3, isClosed: false, openingTime: '08:00', closingTime: '16:00', maxDonorsPerSlot: null },
      { dayOfWeek: 4, isClosed: false, openingTime: '08:00', closingTime: '16:00', maxDonorsPerSlot: null },
      { dayOfWeek: 5, isClosed: true, openingTime: '00:00', closingTime: '00:00', maxDonorsPerSlot: null },
      { dayOfWeek: 6, isClosed: true, openingTime: '00:00', closingTime: '00:00', maxDonorsPerSlot: null },
    ],
    exclusions: rawData.exclusions || [],
    updatedAt: rawData.updatedAt || new Date().toISOString(),
    version: rawData.version !== undefined ? rawData.version : 1,
  };

  validateContract('Main Branch Settings', MainBranchSettingsContractSchema, mappedData);
  return mappedData;
}

/** Update main branch settings */
export async function updateMainBranchSettings(
  payload: UpdateMainBranchSettingsRequest,
): Promise<void> {
  // Transform UI types (WholeBlood, Platelets, Plasma) to backend enums format (whole_blood, platelets, plasma)
  const transformedPayload = {
    ...payload,
    supportedDonationTypes: payload.supportedDonationTypes.map((t) => {
      if (t === 'WholeBlood') return 'whole_blood';
      if (t === 'Platelets') return 'platelets';
      if (t === 'Plasma') return 'plasma';
      return t;
    }),
  };

  const { data: wrapper } = await apiClient.put<SettingsApiResponseWrapper<unknown>>(
    '/donation-centers/main-branch',
    transformedPayload,
  );
  const success = wrapper.success ?? wrapper.isSuccess;
  if (success === false) {
    throw new Error(wrapper.message || 'فشل تحديث الإعدادات');
  }
}

