// ═══════════════════════════════════════════════════════════
// React Query hooks — Donors & Donations
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDonors, fetchDonorById, updateDonor, fetchPaginatedDonors, fetchPaginatedDonations, fetchAllDonations, searchDonorByNationalId, addDonation, addMedicalRecord, deleteDonation, confirmDonation } from '../api/donors';
import type { BasicDonationRequest, MedicalRecordRequest, UpdateDonorRequest } from '../types/donor';
import type { DonorFilters } from '../types/common';

// ═══════════════════════════════════════════════════════════
//  DONORS  — profile-level hooks
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
//  DONATIONS  — donation-event hooks
// ═══════════════════════════════════════════════════════════

/** Fetch ALL donations (unpaginated — for dashboard statistics) */
export function useDonations() {
  return useQuery({
    queryKey: ['donations', 'all'],
    queryFn: fetchAllDonations,
    select: (res) => res.data,
  });
}

export function usePaginatedDonations(filters: DonorFilters = {}) {
  return useQuery({
    queryKey: ['donations', 'paginated', filters],
    queryFn: ({ signal }) => fetchPaginatedDonations(filters, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

export function useSearchDonor() {
  return useMutation({
    mutationFn: (nationalId: string) => searchDonorByNationalId(nationalId),
  });
}

export function useAddDonation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BasicDonationRequest) => addDonation(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['donors'] });
      qc.invalidateQueries({ queryKey: ['donations'] });
    },
  });
}

export function useAddMedicalRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ donationId, payload }: { donationId: string, payload: MedicalRecordRequest }) =>
      addMedicalRecord(donationId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['donors'] });
      qc.invalidateQueries({ queryKey: ['donations'] });
    },
  });
}

/** Delete a donation */
export function useDeleteDonation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (donationId: string) => deleteDonation(donationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['donations'] });
    },
  });
}

/** Confirm donation — send to lab */
export function useConfirmDonation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (donationId: string) => confirmDonation(donationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['donations'] });
    },
  });
}
