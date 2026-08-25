import type { GetWorkspacesResponse } from '@/src/types/workspaces.types';
import { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { GET_WORKSPACES_QUERY_KEY } from './use-get-workspaces';
import { WorkspaceService } from '@/src/api/services/client/workspace.service';

const DELETE_WORKSPACE_MUTATION_KEY = 'delete-workspace';

export const useDeleteWorkspace = (): UseMutationResult<
  void,
  RequestFailure,
  string,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [DELETE_WORKSPACE_MUTATION_KEY],
    mutationFn: async (workspaceId: string) => {
      return await WorkspaceService.deleteWorkspace(workspaceId);
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
