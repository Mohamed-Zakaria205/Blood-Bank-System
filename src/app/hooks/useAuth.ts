// ═══════════════════════════════════════════════════════════
// React Query hooks — Auth
// ═══════════════════════════════════════════════════════════
import { useMutation } from '@tanstack/react-query';
import { changePasswordApi } from '../api/auth';
import type { ChangePasswordRequest } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';

/**
 * Mutation hook for changing the current user's password.
 *
 * POSTs { currentPassword, newPassword } to
 * POST /auth/change-password. The backend validates against the
 * stored hash and returns 422 on mismatch.
 *
 * Usage:
 *   const { mutateAsync, isPending, isError } = useChangePassword();
 *   await mutateAsync({ currentPassword: '...', newPassword: '...' });
 */
export function useChangePassword() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => {
      // Guard: never fire the API call if the user is not authenticated
      if (!user?.id) return Promise.reject(new Error('User not authenticated'));
      return changePasswordApi(user.id, payload);
    },
  });
}
