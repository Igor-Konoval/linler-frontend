import { AuthService } from '@/src/api/services/client/auth.service';
import type { GetUserResponse, LoginRequest } from '@/src/types/auth.types';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const LOGIN_MUTATION_KEY = 'login';

export const useLogin = (): UseMutationResult<
  GetUserResponse,
  RequestFailure,
  LoginRequest,
  unknown
> =>
  useMutation({
    mutationKey: [LOGIN_MUTATION_KEY],
    mutationFn: async (request: LoginRequest) =>
      await AuthService.login(request),
  });
