// ═══════════════════════════════════════════════════════════
// React Query hooks — Donors & Donations
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDonors, fetchDonorById, updateDonor, fetchPaginatedDonors, fetchPaginatedEligibleDonors, fetchPaginatedDonations, searchDonorByNationalId, addDonation, addMedicalRecord, deleteDonation, confirmDonation, fetchDonationCenters, fetchDonorEligibilityStats, fetchEligibilitySettings, updateEligibilitySettings, sendDonorNotifications, previewDonorNotifications } from '../api/donors';
import type { BasicDonationRequest, MedicalRecordRequest, UpdateDonorRequest, SendNotificationRequest, EligibilitySettings, NotificationPreviewRequest } from '../types/donor';
import type { DonationFilters, DonorFilters } from '../types/common';

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
    staleTime: 0, // Enforce fresh list & counts from the server
  });
}

/**
 * Fetch eligible donors with server-side pagination, search, and filtering.
 */
export function usePaginatedEligibleDonors(filters: DonorFilters = {}) {
  return useQuery({
    queryKey: ['donors', 'eligibility', 'paginated', filters],
    queryFn: ({ signal }) => fetchPaginatedEligibleDonors(filters, { signal }),
    placeholderData: (previousData) => previousData,
    staleTime: 0, // Enforce fresh eligibility counts
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

/** Fetch eligibility statistics (for donor eligibility dashboards) */
export function useDonorEligibilityStats() {
  return useQuery({
    queryKey: ['donors', 'eligibility-stats'],
    queryFn: fetchDonorEligibilityStats,
    select: (res) => res.data,
    staleTime: 30000,
  });
}

/** Preview bulk or selected notification content and recipient counts */
export function useDonorNotificationPreview(payload: NotificationPreviewRequest | null) {
  return useQuery({
    queryKey: ['donorNotificationPreview', payload],
    queryFn: () => previewDonorNotifications(payload!),
    enabled: !!payload,
    staleTime: 0,
  });
}

/** Send standard readiness or emergency notification to one or more donors */
export function useSendDonorNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendNotificationRequest) =>
      sendDonorNotifications(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['donors', 'eligibility'] });
      qc.invalidateQueries({ queryKey: ['donors', 'eligibility-stats'] });
      if (variables.selectionMode !== 'filtered' && 'donorIds' in variables && variables.donorIds) {
        variables.donorIds.forEach((id) => qc.invalidateQueries({ queryKey: ['donors', id] }));
      }
    },
  });
}

/** Fetch eligibility settings (wait periods) for admin */
export function useEligibilitySettings() {
  return useQuery({
    queryKey: ['settings', 'eligibility'],
    queryFn: fetchEligibilitySettings,
    select: (res) => res.data,
  });
}

/** Update eligibility settings (wait periods) for admin */
export function useUpdateEligibilitySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EligibilitySettings) => updateEligibilitySettings(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings', 'eligibility'] });
      // Invalidate donor eligibility stats/list because wait days changed
      qc.invalidateQueries({ queryKey: ['donors', 'eligibility'] });
      qc.invalidateQueries({ queryKey: ['donors', 'eligibility-stats'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════
//  DONATIONS  — donation-event hooks
// ═══════════════════════════════════════════════════════════

export function usePaginatedDonations(filters: DonationFilters = {}) {
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
    mutationFn: ({ donationId, payload }: { donationId: string; payload: MedicalRecordRequest }) =>
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

/** Fetch donation centers (for walkin source dropdown) */
export function useDonationCenters() {
  return useQuery({
    queryKey: ['donation-centers'],
    queryFn: fetchDonationCenters,
    staleTime: 1000 * 60 * 10, // cache for 10 minutes — centers rarely change
  });
}
