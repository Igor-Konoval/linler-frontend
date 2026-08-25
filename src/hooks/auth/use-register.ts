import { AuthService } from '@/src/api/services/client/auth.service';
import type { GetUserResponse, RegisterRequest } from '@/src/types/auth.types';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const REGISTER_MUTATION_KEY = 'register';

export const useRegister = (): UseMutationResult<
  GetUserResponse,
  RequestFailure,
  RegisterRequest,
  unknown
> =>
  useMutation({
    mutationKey: [REGISTER_MUTATION_KEY],
    mutationFn: async (request: RegisterRequest) =>
      await AuthService.register(request),
  });
