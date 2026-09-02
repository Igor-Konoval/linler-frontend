import { UserService } from '@/src/api/services/client/user.service';
import type {
  EditUserAccountRequest,
  GetUserAccountResponse,
} from '@/src/types/user.types';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useSyncUserAccountCache } from './use-sync-user-account-cache';

const EDIT_USER_ACCOUNT_MUTATION_KEY = 'edit-user-account';

export const useEditUserAccount = (): UseMutationResult<
  GetUserAccountResponse,
  RequestFailure,
  EditUserAccountRequest,
  unknown
> => {
  const syncUserAccountCache = useSyncUserAccountCache();

  return useMutation({
    mutationKey: [EDIT_USER_ACCOUNT_MUTATION_KEY],
    mutationFn: async (request: EditUserAccountRequest) =>
      await UserService.editUserAccount(request),
    onSuccess: syncUserAccountCache,
  });
};
