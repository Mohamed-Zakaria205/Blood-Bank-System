// ═══════════════════════════════════════════════════════════
// React Query hooks — Donors
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDonors, fetchDonorById, createDonor } from '../api/donors';
import type { CreateDonorRequest } from '../types/donor';

/** Fetch all donors */
export function useDonors() {
  return useQuery({
    queryKey: ['donors'],
    queryFn: fetchDonors,
  });
}

/** Fetch a single donor by ID */
export function useDonor(id: string) {
  return useQuery({
    queryKey: ['donors', id],
    queryFn: () => fetchDonorById(id),
    enabled: !!id,
  });
}

/** Create a new donor — auto-invalidates the donors list */
export function useCreateDonor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDonorRequest) => createDonor(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['donors'] });
    },
  });
}
