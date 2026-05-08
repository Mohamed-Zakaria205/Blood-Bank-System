// ═══════════════════════════════════════════════════════════
// React Query hooks — Appointments
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAppointmentSlots, fetchSlot15Data, cancelAppointment } from '../api/appointments';

/** Fetch appointment slots (with bookings) */
export function useAppointmentSlots() {
  return useQuery({
    queryKey: ['appointment-slots'],
    queryFn: fetchAppointmentSlots,
    select: (res) => res.data,
  });
}

/** Fetch 15-min slot data (doctor view) */
export function useSlot15Data() {
  return useQuery({
    queryKey: ['slot15'],
    queryFn: fetchSlot15Data,
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
      qc.invalidateQueries({ queryKey: ['slot15'] });
    },
  });
}
