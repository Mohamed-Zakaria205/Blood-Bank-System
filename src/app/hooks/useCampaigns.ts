// ═══════════════════════════════════════════════════════════
// React Query hooks — Campaigns
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCampaigns, createCampaign, updateCampaign, fetchFilteredCampaigns } from '../api/campaigns';
import type { CreateCampaignRequest, UpdateCampaignRequest } from '../types/campaign';
import type { CampaignFilters } from '../types/common';

/** Fetch all campaigns (unpaginated — used by CancelModal and dropdowns) */
export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
    select: (res) => res.data,
  });
}

/**
 * Fetch campaigns with server-ready filtering and pagination.
 * Each unique set of filters is cached separately via structured query keys.
 */
export function useFilteredCampaigns(filters: CampaignFilters = {}) {
  return useQuery({
    queryKey: ['campaigns', 'filtered', filters],
    queryFn: ({ signal }) => fetchFilteredCampaigns(filters, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

/** Create a new campaign */
export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignRequest) => createCampaign(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

/** Update an existing campaign — auto-invalidates campaigns list */
export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCampaignRequest }) =>
      updateCampaign(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
