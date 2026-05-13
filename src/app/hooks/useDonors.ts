// ═══════════════════════════════════════════════════════════
// React Query hooks — Donors
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDonors, fetchDonorById, createDonor, updateDonor, fetchPaginatedDonors } from '../api/donors';
import type { CreateDonorRequest, UpdateDonorRequest } from '../types/donor';
import type { DonorFilters } from '../types/common';

/** Fetch all donors (unpaginated — for dropdowns and small lists) */
export function useDonors() {
  return useQuery({
    queryKey: ['donors'],
    queryFn: fetchDonors,
    select: (res) => res.data,
  });
}

/**
 * Fetch donors with server-ready pagination, search and filtering.
 * Each unique set of filters is cached separately via structured query keys.
 * `placeholderData: keepPreviousData` prevents flicker between page transitions.
 */
export function usePaginatedDonors(filters: DonorFilters = {}) {
  return useQuery({
    queryKey: ['donors', 'paginated', filters],
    queryFn: ({ signal }) => fetchPaginatedDonors(filters, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

/** Fetch a single donor by ID */
export function useDonor(id: string) {
  return useQuery({
    queryKey: ['donors', id],
    queryFn: () => fetchDonorById(id),
    select: (res) => res.data,
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

/** Update an existing donor — auto-invalidates donors list + detail cache */
export function useUpdateDonor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDonorRequest }) =>
      updateDonor(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['donors'] });
      qc.invalidateQueries({ queryKey: ['donors', variables.id] });
    },
  });
}
