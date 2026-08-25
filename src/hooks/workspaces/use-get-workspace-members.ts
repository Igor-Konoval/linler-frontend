import { WorkspaceService } from '@/src/api/services/client/workspace.service';
import type { GetWorkspaceMembersResponse } from '@/src/types/workspaces.types';
import { type RequestFailure } from '@/src/utils/request-failure.utils';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export const GET_WORKSPACE_MEMBERS_QUERY_KEY = 'get-workspace-members';

export const useGetWorkspaceMembers = ({
  initialData,
  workspaceId,
}: {
  initialData?: GetWorkspaceMembersResponse;
  workspaceId?: string;
}): UseQueryResult<GetWorkspaceMembersResponse, RequestFailure> =>
  useQuery({
    queryKey: [GET_WORKSPACE_MEMBERS_QUERY_KEY, workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        throw new Error('Workspace id is required');
      }

      return await WorkspaceService.getWorkspaceMembers(workspaceId);
    },
    initialData,
    enabled: Boolean(workspaceId),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
