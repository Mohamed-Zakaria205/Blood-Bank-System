import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMainBranchSettings, updateMainBranchSettings } from '../api/donors';
import type { MainBranchSettings, UpdateMainBranchSettingsRequest } from '../types/donationCenter';

export function useMainBranchSettings() {
  return useQuery<MainBranchSettings>({
    queryKey: ['settings', 'main-branch'],
    queryFn: fetchMainBranchSettings,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });
}

export function useUpdateMainBranchSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMainBranchSettingsRequest) => updateMainBranchSettings(payload),
    onSuccess: () => {
      // Invalidate settings query to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['settings', 'main-branch'] });
      // Also invalidate donation-centers because it might be affected
      queryClient.invalidateQueries({ queryKey: ['donation-centers'] });
    },
  });
}
