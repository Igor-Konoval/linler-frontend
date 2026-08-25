import { AuthService } from '@/src/api/services/client/auth.service';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const LOGOUT_MUTATION_KEY = 'logout';

export const useLogout = (): UseMutationResult<
  void,
  RequestFailure,
  void,
  unknown
> => {
  return useMutation({
    mutationKey: [LOGOUT_MUTATION_KEY],
    mutationFn: async () => await AuthService.logout(),
  });
};
