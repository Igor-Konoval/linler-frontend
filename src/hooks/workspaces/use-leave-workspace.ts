import type { GetWorkspacesResponse } from '@/src/types/workspaces.types';
import { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { GET_WORKSPACES_QUERY_KEY } from './use-get-workspaces';
import { WorkspaceService } from '@/src/api/services/client/workspace.service';

const LEAVE_WORKSPACE_MUTATION_KEY = 'leave-workspace';

export const useLeaveWorkspace = (): UseMutationResult<
  void,
  RequestFailure,
  string,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [LEAVE_WORKSPACE_MUTATION_KEY],
    mutationFn: async (workspaceId: string) => {
      return await WorkspaceService.leaveWorkspace(workspaceId);
    },
    onSuccess: (_, workspaceId) => {
      queryClient.setQueryData<GetWorkspacesResponse>(
        [GET_WORKSPACES_QUERY_KEY],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            workspaces: oldData.workspaces.filter(
              (workspace) => workspace.id !== workspaceId,
            ),
          };
        },
      );
    },
  });
};
