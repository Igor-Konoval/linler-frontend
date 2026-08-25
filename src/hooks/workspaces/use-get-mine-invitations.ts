import { WorkspaceService } from '@/src/api/services/client/workspace.service';
import { PaginationQueryParamsValues } from '@/src/constants/routes.constants';
import type { PaginationParams } from '@/src/types/base.types';
import type { GetMineInvitationsResponse } from '@/src/types/workspaces.types';
import { type RequestFailure } from '@/src/utils/request-failure.utils';
import {
  type InfiniteData,
  type UseInfiniteQueryResult,
  useInfiniteQuery,
} from '@tanstack/react-query';

export const GET_MINE_INVITATIONS_QUERY_KEY = 'get-mine-invitations';

export const useGetMineInvitations = ({
  initialData,
  params,
}: {
  initialData?: GetMineInvitationsResponse;
  params: PaginationParams;
}): UseInfiniteQueryResult<
  InfiniteData<GetMineInvitationsResponse>,
  RequestFailure
> =>
  useInfiniteQuery<
    GetMineInvitationsResponse,
    RequestFailure,
    InfiniteData<GetMineInvitationsResponse>,
    [typeof GET_MINE_INVITATIONS_QUERY_KEY, PaginationParams],
    number
  >({
    queryKey: [GET_MINE_INVITATIONS_QUERY_KEY, params],
    queryFn: async ({ pageParam }) =>
      await WorkspaceService.getMineInvitations({
        ...params,
        page: pageParam,
      }),
    initialPageParam: params.page ?? PaginationQueryParamsValues.PAGE,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
    ...(initialData
      ? {
          initialData: {
            pages: [initialData],
            pageParams: [initialData.meta.page],
          },
        }
      : {}),
  });
