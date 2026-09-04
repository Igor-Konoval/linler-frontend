import { AuthService } from '@/src/api/services/client/auth.service';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

const LOGOUT_MUTATION_KEY = 'logout';

export const useLogout = (): UseMutationResult<
  void,
  RequestFailure,
  void,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [LOGOUT_MUTATION_KEY],
    mutationFn: async () => await AuthService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
