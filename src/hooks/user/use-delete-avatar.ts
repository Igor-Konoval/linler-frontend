import { UserService } from '@/src/api/services/client/user.service';
import type { GetUserAccountResponse } from '@/src/types/user.types';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useSyncUserAccountCache } from './use-sync-user-account-cache';

const DELETE_AVATAR_MUTATION_KEY = 'delete-avatar';

export const useDeleteAvatar = (): UseMutationResult<
  GetUserAccountResponse,
  RequestFailure,
  void,
  unknown
> => {
  const syncUserAccountCache = useSyncUserAccountCache();

  return useMutation({
    mutationKey: [DELETE_AVATAR_MUTATION_KEY],
    mutationFn: async () => await UserService.deleteUserAvatar(),
    onSuccess: syncUserAccountCache,
  });
};
