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

          return {
            workspaces: [...oldData.workspaces, data],
          };
        },
      );
    },
  });
};
