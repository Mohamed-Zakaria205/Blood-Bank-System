// ═══════════════════════════════════════════════════════════
// Appointments API service
// Base URL: /api/v1/system (via apiClient)
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { AppointmentSlot, AppointmentStats } from '../types/appointment';
import type { PaginatedResponse } from '../types/common';
import {
  appointmentSlotsData as MOCK_SLOTS,
} from '../data/appointments.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ── In-memory store so mutations persist across refetches ──
let mockSlots: AppointmentSlot[] = [...MOCK_SLOTS];

export interface AppointmentFilters {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  campaignId?: string;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────
// GET /appointments/slots
// Replaces the old /appointments/slot15 endpoint.
// ─────────────────────────────────────────────────────────────
export async function fetchAppointmentSlots(
  filters?: AppointmentFilters,
): Promise<PaginatedResponse<AppointmentSlot>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));

    let filtered = [...mockSlots];

    // Apply client-side filtering on mock data to simulate server behaviour
    if (filters?.date) {
      filtered = filtered.filter((s) => s.date === filters.date);
    } else {
      if (filters?.dateFrom) {
        filtered = filtered.filter((s) => s.date >= filters.dateFrom!);
      }
      if (filters?.dateTo) {
        filtered = filtered.filter((s) => s.date <= filters.dateTo!);
      }
    }
    if (filters?.status) {
      filtered = filtered.filter((s) => s.status === filters.status);
    }
    if (filters?.campaignId) {
      filtered = filtered.filter((s) => s.campaignId === filters.campaignId);
    }

    return {
      data: filtered,
      total: filtered.length,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? filtered.length,
    };
  }

  const { data } = await apiClient.get<PaginatedResponse<AppointmentSlot>>(
    '/appointments/slots',
    { params: filters },
  );
  return data;
}

// ─────────────────────────────────────────────────────────────
// GET /appointments/stats
// Returns aggregated stats for a date (defaults to today on server).
// ─────────────────────────────────────────────────────────────
export interface AppointmentStatsParams {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function fetchAppointmentStats(
  params?: AppointmentStatsParams,
): Promise<{ data: AppointmentStats }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    // Calculate live stats from mock data for the requested date
    const today = new Date().toISOString().split('T')[0];
    const targetDate = params?.date ?? today;
    const daySlots = mockSlots.filter((s) => s.date === targetDate);
    const stats: AppointmentStats = {
      booked: daySlots.filter((s) => s.status === 'booked').length,
      completed: daySlots.filter((s) => s.status === 'completed').length,
      missed: daySlots.filter((s) => s.status === 'missed').length,
      cancelled: daySlots.filter((s) => s.status === 'cancelled').length,
      available: 0, // not tracked in mock — server computes from capacity
      total: daySlots.length,
    };
    return { data: stats };
  }

  const { data } = await apiClient.get<{ data: AppointmentStats }>(
    '/appointments/stats',
    { params },
  );
  return data;
}

// ─────────────────────────────────────────────────────────────
// POST /appointments/slots/{slotId}/cancel
// ─────────────────────────────────────────────────────────────
export async function cancelAppointment(slotId: string, reason: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    mockSlots = mockSlots.map((s) =>
      s.id === slotId
        ? {
            ...s,
            status: 'cancelled' as const,
            cancelledAt: new Date().toISOString(),
            cancellationReason: reason,
          }
        : s,
    );
    return;
  }
  await apiClient.post(`/appointments/slots/${slotId}/cancel`, { reason });
}

// ─────────────────────────────────────────────────────────────
// POST /appointments/slots/{slotId}/no-show
// Marks the appointment as missed (donor didn't show up).
// ─────────────────────────────────────────────────────────────
export async function markNoShow(slotId: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    mockSlots = mockSlots.map((s) =>
      s.id === slotId
        ? {
            ...s,
            status: 'missed' as const,
            notes: s.notes ?? 'لم يحضر',
          }
        : s,
    );
    return;
  }
  await apiClient.post(`/appointments/slots/${slotId}/no-show`);
}
