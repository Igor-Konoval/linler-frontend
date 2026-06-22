import { AuthService } from '@/src/api/services/client/auth.service';
import type { GetUserResponse } from '@/src/types/auth.types';
import { type RequestFailure } from '@/src/utils/request-failure.utils';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export const GET_USER_QUERY_KEY = 'get-user';

export const useGetUser = (): UseQueryResult<
  GetUserResponse | null,
  RequestFailure
> =>
  useQuery({
    queryKey: [GET_USER_QUERY_KEY],
    queryFn: async () => await AuthService.getUser(),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
  });
