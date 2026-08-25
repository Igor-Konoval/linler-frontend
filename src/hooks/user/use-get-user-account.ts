import { UserService } from '@/src/api/services/client/user.service';
import type { GetUserAccountResponse } from '@/src/types/user.types';
import { type RequestFailure } from '@/src/utils/request-failure.utils';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export const GET_USER_ACCOUNT_QUERY_KEY = 'get-user-account';

export const useGetUserAccount = (): UseQueryResult<
  GetUserAccountResponse,
  RequestFailure
> =>
  useQuery({
    queryKey: [GET_USER_ACCOUNT_QUERY_KEY],
    queryFn: async () => await UserService.getUserAccount(),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
  });
