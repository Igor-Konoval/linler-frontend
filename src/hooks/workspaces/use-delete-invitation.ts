import type {
  DeleteInvitationRequest,
  GetWorkspaceInvitationsResponse,
  WorkspaceInvitationResponse,
} from '@/src/types/workspaces.types';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  InfiniteData,
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { WorkspaceService } from '@/src/api/services/client/workspace.service';
import { GET_WORKSPACE_INVITATIONS_QUERY_KEY } from './use-get-workspace-invitations';

const DELETE_INVITATION_MUTATION_KEY = 'delete-invitation';

export const useDeleteInvitation = (): UseMutationResult<
  void,
  RequestFailure,
  DeleteInvitationRequest,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [DELETE_INVITATION_MUTATION_KEY],
    mutationFn: async (request: DeleteInvitationRequest) => {
      const result = await WorkspaceService.deleteInvitation(request);

      return result;
    },
    onSuccess: (_, request) => {
      queryClient.setQueriesData<InfiniteData<GetWorkspaceInvitationsResponse>>(
        { queryKey: [GET_WORKSPACE_INVITATIONS_QUERY_KEY] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              invitations: page.invitations.filter(
                (invitation: WorkspaceInvitationResponse) =>
                  invitation.id !== request.invitationId,
              ),
            })),
          };
        },
      );
    },
  });
};
