import type { RequestFailure } from '@/src/utils/request-failure.utils';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { UserService } from '@/src/api/services/client/user.service';
import type { GetUserAccountResponse } from '@/src/types/user.types';

const EDIT_USER_AVATAR_MUTATION_KEY = 'edit-user-avatar';

export const useEditUserAvatar = (): UseMutationResult<
  GetUserAccountResponse,
  RequestFailure,
  FormData,
  unknown
> => {
  return useMutation({
    mutationKey: [EDIT_USER_AVATAR_MUTATION_KEY],
    mutationFn: async (request: FormData) =>
      await UserService.editUserAvatar(request),
  });
};
