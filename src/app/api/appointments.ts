// ═══════════════════════════════════════════════════════════
// Appointments API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { AppointmentSlot, Slot15 } from '../types/appointment';
import type { PaginatedResponse } from '../types/common';
import { appointmentSlots as MOCK_SLOTS, slot15Data as MOCK_SLOT15 } from '../data/appointments.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** In-memory stores so mutations persist across refetches */
let mockSlots: AppointmentSlot[] = [...MOCK_SLOTS];
let mockSlot15: Slot15[] = [...MOCK_SLOT15];

export async function fetchAppointmentSlots(): Promise<PaginatedResponse<AppointmentSlot>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { data: mockSlots, total: mockSlots.length, page: 1, limit: mockSlots.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<AppointmentSlot>>('/appointments/slots');
  return data;
}

export async function fetchSlot15Data(): Promise<PaginatedResponse<Slot15>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { data: mockSlot15, total: mockSlot15.length, page: 1, limit: mockSlot15.length };
  }
  const { data } = await apiClient.get<PaginatedResponse<Slot15>>('/appointments/slot15');
  return data;
}

export async function cancelAppointment(slotId: string, reason: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    // ✅ Mutate the in-memory array so refetch returns the cancelled status
    mockSlot15 = mockSlot15.map((s) =>
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
