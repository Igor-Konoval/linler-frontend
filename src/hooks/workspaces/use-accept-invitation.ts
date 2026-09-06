import type {
  GetWorkspaceResponse,
  GetWorkspacesResponse,
} from '@/src/types/workspaces.types';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { GET_PROJECTS_QUERY_KEY } from '@/src/hooks/projects/use-get-projects';
import { GET_WORKSPACE_MEMBERS_QUERY_KEY } from './use-get-workspace-members';
import { GET_WORKSPACES_QUERY_KEY } from './use-get-workspaces';
import { WorkspaceService } from '@/src/api/services/client/workspace.service';

const ACCEPT_INVITATION_MUTATION_KEY = 'accept-invitation';

export const useAcceptInvitation = (): UseMutationResult<
  GetWorkspaceResponse,
  RequestFailure,
  string,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [ACCEPT_INVITATION_MUTATION_KEY],
    mutationFn: async (id: string) => {
      const result = await WorkspaceService.acceptInvitation(id);

      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<GetWorkspacesResponse>(
        [GET_WORKSPACES_QUERY_KEY],
        (oldData) => {
          if (!oldData) return oldData;

          const alreadyInList = oldData.workspaces.some(
            (workspace) => workspace.id === data.id,
          );

          return {
            workspaces: alreadyInList
              ? oldData.workspaces
              : [...oldData.workspaces, data],
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: [GET_WORKSPACE_MEMBERS_QUERY_KEY, data.id],
      });
      void queryClient.invalidateQueries({
        queryKey: [GET_PROJECTS_QUERY_KEY, data.id],
      });
    },
  });
};
