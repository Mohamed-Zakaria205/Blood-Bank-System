// ═══════════════════════════════════════════════════════════
// React Query hooks — Campaigns
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCampaigns, createCampaign, fetchFilteredCampaigns } from '../api/campaigns';
import type { CreateCampaignRequest } from '../types/campaign';
import type { CampaignFilters } from '../types/common';

/** Fetch all campaigns (unpaginated — used by CancelModal and dropdowns) */
export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  });
}

/**
 * Fetch campaigns with server-ready filtering and pagination.
 * Each unique set of filters is cached separately via structured query keys.
 */
export function useFilteredCampaigns(filters: CampaignFilters = {}) {
  return useQuery({
    queryKey: ['campaigns', 'filtered', filters],
    queryFn: () => fetchFilteredCampaigns(filters),
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
