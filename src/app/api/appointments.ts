// ═══════════════════════════════════════════════════════════
// Appointments API service
// Base URL: /api/v1/system (via apiClient)
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { ApiResponseWrapper } from '../types/auth';
import type { AppointmentSlot, AppointmentStats } from '../types/appointment';
import type { PaginatedResponse } from '../types/common';

export interface AppointmentFilters {
  centerId?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  campaignId?: string;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────
// GET /Appointments/slots
// Replaces the old /appointments/slot15 endpoint.
// When no status filter is provided, fetches booked/completed/
// missed/cancelled in parallel to avoid the backend flooding
// the response with empty "available" slots.
// ─────────────────────────────────────────────────────────────

/** Internal helper — single request to /Appointments/slots */
async function _fetchSlots(
  filters?: AppointmentFilters,
): Promise<PaginatedResponse<AppointmentSlot>> {
  // If we are filtering by "missed", the backend expects "NoShow"
  const apiFilters = { ...filters };
  if (apiFilters.status === 'missed') {
    apiFilters.status = 'NoShow';
  }

  const { data: wrapper } = await apiClient.get<
    ApiResponseWrapper<{
      items?: AppointmentSlot[];
      data?: AppointmentSlot[];
      total: number;
      page: number;
      limit: number;
    }>
  >('/Appointments/slots', { params: apiFilters });

  const rawItems = wrapper.data?.items || wrapper.data?.data || [];
  const mappedItems: AppointmentSlot[] = rawItems.map((item: any) => {
    let normalizedStatus = (item.status || '').toLowerCase();
    // Map backend's 'noshow' to our internal 'missed' state
    if (normalizedStatus === 'noshow') {
      normalizedStatus = 'missed';
    }

    return {
      ...item,
      status: normalizedStatus as AppointmentSlot['status'],
      date: item.date ? item.date.split('T')[0] : item.date,
      donorGender: item.donorGender
        ? ((item.donorGender as string).toLowerCase() as 'male' | 'female')
        : undefined,
      centerId: item.centerId,
    };
  });

  return {
    data: mappedItems,
    total: wrapper.data?.total || 0,
    page: wrapper.data?.page || 1,
    limit: wrapper.data?.limit || 100,
  };
}

/** Fetch appointment slots, forwarding filters to the backend as query params. */
export async function fetchAppointmentSlots(
  filters?: AppointmentFilters,
): Promise<PaginatedResponse<AppointmentSlot>> {
  // Single request — backend returns all non-available slots when no status is given,
  // and filters server-side when a status param is provided.
  return _fetchSlots(filters);
}

// ─────────────────────────────────────────────────────────────
// GET /Appointments/slots/{slotId}
// Fetches a single appointment slot by ID.
// ─────────────────────────────────────────────────────────────
export async function fetchAppointmentSlotById(slotId: string): Promise<AppointmentSlot | null> {
  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<AppointmentSlot>>(
    `/Appointments/slots/${slotId}`,
  );
  if (!wrapper.data) return null;
  const item: any = wrapper.data;
  return {
    ...item,
    status: (item.status || '').toLowerCase() as AppointmentSlot['status'],
    date: item.date ? item.date.split('T')[0] : item.date,
    donorGender: item.donorGender
      ? ((item.donorGender as string).toLowerCase() as 'male' | 'female')
      : undefined,
    centerId: item.centerId,
  };
}

// ─────────────────────────────────────────────────────────────
// GET /Appointments/stats
// Returns aggregated stats for a date (defaults to today on server).
// ─────────────────────────────────────────────────────────────
export interface AppointmentStatsParams {
  centerId?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function fetchAppointmentStats(
  params?: AppointmentStatsParams,
): Promise<{ data: AppointmentStats }> {


  const { data: wrapper } = await apiClient.get<ApiResponseWrapper<AppointmentStats>>(
    '/Appointments/stats',
    { params },
  );
  return { data: wrapper.data };
}

// ─────────────────────────────────────────────────────────────
// POST /Appointments/slots/{slotId}/cancel
// ─────────────────────────────────────────────────────────────
export async function cancelAppointment(slotId: string, reason: string): Promise<void> {
  await apiClient.post(`/Appointments/slots/${slotId}/cancel`, { reason });
}

// ─────────────────────────────────────────────────────────────
// POST /Appointments/slots/{slotId}/no-show
// Marks the appointment as missed (donor didn't show up).
// ─────────────────────────────────────────────────────────────
export async function markNoShow(slotId: string): Promise<void> {
  await apiClient.post(`/Appointments/slots/${slotId}/no-show`);
}
