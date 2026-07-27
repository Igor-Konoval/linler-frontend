import { WorkspaceService } from '@/src/api/services/client/workspace.service';
import type { GetWorkspaceResponse } from '@/src/types/workspaces.types';
import { type RequestFailure } from '@/src/utils/request-failure.utils';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export const GET_CURRENT_WORKSPACE_QUERY_KEY = 'get-current-workspace';

export const useGetCurrentWorkspace = ({
  initialData,
  id,
}: {
  id: string;
  initialData?: GetWorkspaceResponse;
}): UseQueryResult<GetWorkspaceResponse, RequestFailure> =>
  useQuery({
    queryKey: [GET_CURRENT_WORKSPACE_QUERY_KEY, id],
    queryFn: async () => await WorkspaceService.getCurrentWorkspace(id),
    initialData,
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
