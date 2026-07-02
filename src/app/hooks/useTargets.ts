import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWeeklyTargets, updateWeeklyTargets } from '../api/targets';
import type { WeeklyBloodTypeTarget, WeeklyTargetsUpdatePayload } from '../types/targets';

export function useWeeklyTargets() {
  return useQuery<WeeklyBloodTypeTarget[]>({
    queryKey: ['settings', 'weekly-targets'],
    queryFn: fetchWeeklyTargets,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });
}

export function useUpdateWeeklyTargets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WeeklyTargetsUpdatePayload[]) => updateWeeklyTargets(payload),
    onSuccess: () => {
      // Invalidate only the weekly targets query to trigger fresh fetch
      queryClient.invalidateQueries({ queryKey: ['settings', 'weekly-targets'] });
    },
  });
}
