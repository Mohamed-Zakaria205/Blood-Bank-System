// ═══════════════════════════════════════════════════════════
// React Query hooks — Appointments
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAppointmentSlots,
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
    },
  });
}

// ── Legacy aliases — kept for backward compatibility during migration ──
// @deprecated Use useAppointmentSlots instead
export const useSlot15Data = useAppointmentSlots;
