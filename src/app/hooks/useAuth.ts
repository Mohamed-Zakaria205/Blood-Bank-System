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
 * - In mock mode: validates currentPassword against the in-memory
 *   MOCK_USERS store (server-side simulation, never touches User object).
 * - In real mode: POSTs { currentPassword, newPassword } to
 *   POST /auth/change-password. The backend validates against the
 *   stored hash and returns 422 on mismatch.
 *
 * Usage:
 *   const { mutateAsync, isPending, isError } = useChangePassword();
 *   await mutateAsync({ currentPassword: '...', newPassword: '...' });
 */
export function useChangePassword() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => changePasswordApi(user?.id ?? '', payload),
  });
}
