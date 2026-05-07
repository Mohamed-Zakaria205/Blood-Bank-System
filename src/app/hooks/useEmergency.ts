// ═══════════════════════════════════════════════════════════
// React Query hooks — Emergency requests
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEmergencyRequests,
  fulfillEmergencyRequest,
  rejectEmergencyRequest,
} from '../api/emergency';
import type { FulfillEmergencyPayload } from '../types/emergency';

/** Fetch all emergency requests */
export function useEmergencyRequests() {
  return useQuery({
    queryKey: ['emergency-requests'],
    queryFn: fetchEmergencyRequests,
  });
}

/** Fulfill an emergency request */
export function useFulfillEmergency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FulfillEmergencyPayload) => fulfillEmergencyRequest(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emergency-requests'] });
      // Fulfilling an emergency likely affects inventory
      qc.invalidateQueries({ queryKey: ['bags'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/** Reject an emergency request */
export function useRejectEmergency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => rejectEmergencyRequest(requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emergency-requests'] });
    },
  });
}
