import { WorkspaceService } from '@/src/api/services/client/workspace.service';
import type { GetWorkspacesResponse } from '@/src/types/workspaces.types';
import { type RequestFailure } from '@/src/utils/request-failure.utils';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export const GET_WORKSPACES_QUERY_KEY = 'get-workspaces';

export const useGetWorkspaces = ({
  initialData,
}: {
  initialData?: GetWorkspacesResponse;
}): UseQueryResult<GetWorkspacesResponse, RequestFailure> =>
  useQuery({
    queryKey: [GET_WORKSPACES_QUERY_KEY],
    queryFn: async () => await WorkspaceService.getWorkspaces(),
    initialData,
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
