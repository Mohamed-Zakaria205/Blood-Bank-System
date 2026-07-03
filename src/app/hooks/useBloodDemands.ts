import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBloodDemands,
  fetchBloodDemandDetail,
  createBloodDemand,
  fetchBloodDemandDashboard,
  cancelBloodDemand,
} from '../api/bloodDemands';
import type { BloodDemandFilters, CreateBloodDemandRequest } from '../types/bloodDemands';

export function usePaginatedBloodDemands(filters: BloodDemandFilters = {}) {
  return useQuery({
    queryKey: ['blood-demands', 'paginated', filters],
    queryFn: ({ signal }) => fetchBloodDemands(filters, { signal }),
    placeholderData: (previousData) => previousData,
  });
}

export function useBloodDemandDetail(id: string | null) {
  return useQuery({
    queryKey: ['blood-demand-detail', id],
    queryFn: ({ signal }) => fetchBloodDemandDetail(id!, { signal }),
    enabled: !!id,
  });
}

export function useCreateBloodDemand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBloodDemandRequest) => createBloodDemand(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blood-demands'] });
      qc.invalidateQueries({ queryKey: ['blood-demands-dashboard'] });
    },
  });
}

export function useBloodDemandDashboard() {
  return useQuery({
    queryKey: ['blood-demands-dashboard'],
    queryFn: fetchBloodDemandDashboard,
  });
}

export function useCancelBloodDemand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelBloodDemand(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['blood-demands'] });
      qc.invalidateQueries({ queryKey: ['blood-demands-dashboard'] });
      qc.invalidateQueries({ queryKey: ['blood-demand-detail', id] });
    },
  });
}

