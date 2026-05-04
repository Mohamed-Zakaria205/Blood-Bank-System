// ═══════════════════════════════════════════════════════════
// React Query hooks — Staff (users)
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStaff, createStaff, deleteStaff } from '../api/staff';

/** Fetch all staff members (excludes admins) */
export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: fetchStaff,
  });
}

/** Create a new staff member */
export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

/** Delete a staff member */
export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}
