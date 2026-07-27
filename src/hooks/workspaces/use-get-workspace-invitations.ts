import { WorkspaceService } from '@/src/api/services/client/workspace.service';
import { PaginationQueryParamsValues } from '@/src/constants/routes.constants';
import type { PaginationParams } from '@/src/types/base.types';
import type { GetWorkspaceInvitationsResponse } from '@/src/types/workspaces.types';
import { type RequestFailure } from '@/src/utils/request-failure.utils';
import {
  type InfiniteData,
  type UseInfiniteQueryResult,
  useInfiniteQuery,
} from '@tanstack/react-query';

export const GET_WORKSPACE_INVITATIONS_QUERY_KEY = 'get-workspace-invitations';

export const useGetWorkspaceInvitations = ({
  initialData,
  id,
  params,
  enabled = true,
}: {
  initialData?: GetWorkspaceInvitationsResponse;
  id?: string;
  params: PaginationParams;
  enabled?: boolean;
}): UseInfiniteQueryResult<
  InfiniteData<GetWorkspaceInvitationsResponse>,
  RequestFailure
> =>
  useInfiniteQuery<
    GetWorkspaceInvitationsResponse,
    RequestFailure,
    InfiniteData<GetWorkspaceInvitationsResponse>,
    [
      typeof GET_WORKSPACE_INVITATIONS_QUERY_KEY,
      string | undefined,
      PaginationParams,
    ],
    number
  >({
    queryKey: [GET_WORKSPACE_INVITATIONS_QUERY_KEY, id, params],
    queryFn: async ({ pageParam }) => {
      if (!id) {
        throw new Error('Workspace id is required');
      }

      return await WorkspaceService.getWorkspaceInvitations(id, {
        ...params,
        page: pageParam,
      });
    },
    enabled: enabled && Boolean(id),
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
