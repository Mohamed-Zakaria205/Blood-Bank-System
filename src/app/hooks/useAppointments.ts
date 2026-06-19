// ═══════════════════════════════════════════════════════════
// React Query hooks — Appointments
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAppointmentSlots,
  fetchAppointmentSlotById,
  fetchAppointmentStats,
  cancelAppointment,
  markNoShow,
  type AppointmentFilters,
  type AppointmentStatsParams,
} from '../api/appointments';

/**
 * Fetch appointment slots (doctor view).
 * Replaces the old useSlot15Data hook.
 * Filters are forwarded to the backend as query params.
 */
export function useAppointmentSlots(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: ['appointment-slots', filters],
    queryFn: () => fetchAppointmentSlots(filters),
    select: (res) => res.data,
    staleTime: 0, // Force refetch on mount
  });
}

/**
 * Fetch appointment statistics (booked / completed / missed / cancelled / available / total).
 * Defaults to today's stats when no params are passed.
 */
export function useAppointmentStats(params?: AppointmentStatsParams) {
  return useQuery({
    queryKey: ['appointment-stats', params],
    queryFn: () => fetchAppointmentStats(params),
    select: (res) => res.data,
    staleTime: 0, // Force refetch on mount
  });
}

/**
 * Fetch a single appointment slot by ID.
 * Used by DonationRegistrationForm to pre-fill donor data.
 * Only runs when slotId is provided (enabled guard).
 */
export function useAppointmentSlotById(slotId: string | null) {
  return useQuery({
    queryKey: ['appointment-slot', slotId],
    queryFn: () => fetchAppointmentSlotById(slotId!),
    enabled: !!slotId,
  });
}

/** Cancel an appointment slot */
export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, reason }: { slotId: string; reason: string }) =>
      cancelAppointment(slotId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointment-slots'] });
      qc.invalidateQueries({ queryKey: ['appointment-stats'] });
      qc.invalidateQueries({ queryKey: ['campaign-appointments'] });
      qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

/**
 * Mark an appointment as missed (no-show).
 * Triggers POST /appointments/slots/{slotId}/no-show on the backend.
 */
export function useMarkNoShow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slotId: string) => markNoShow(slotId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointment-slots'] });
      qc.invalidateQueries({ queryKey: ['appointment-stats'] });
      qc.invalidateQueries({ queryKey: ['campaign-appointments'] });
      qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

