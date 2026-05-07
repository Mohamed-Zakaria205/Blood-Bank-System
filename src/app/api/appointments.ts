// ═══════════════════════════════════════════════════════════
// Appointments API service
// ═══════════════════════════════════════════════════════════
import apiClient from './client';
import type { AppointmentSlot, Slot15 } from '../types/appointment';
import { appointmentSlots as MOCK_SLOTS, slot15Data as MOCK_SLOT15 } from '../data/mockData';

const USE_MOCK = true;

/** In-memory stores so mutations persist across refetches */
let mockSlots: AppointmentSlot[] = [...MOCK_SLOTS];
let mockSlot15: Slot15[] = [...MOCK_SLOT15];

export async function fetchAppointmentSlots(): Promise<AppointmentSlot[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return mockSlots;
  }
  const { data } = await apiClient.get<AppointmentSlot[]>('/appointments/slots');
  return data;
}

export async function fetchSlot15Data(): Promise<Slot15[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return mockSlot15;
  }
  const { data } = await apiClient.get<Slot15[]>('/appointments/slot15');
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
