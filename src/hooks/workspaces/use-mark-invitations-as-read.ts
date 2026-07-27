import { WorkspaceService } from '@/src/api/services/client/workspace.service';
import type {
  MarkInvitationAsReadRequest,
  MarkInvitationAsReadResponse,
} from '@/src/types/workspaces.types';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const MARK_INVITATIONS_AS_READ_MUTATION_KEY = 'mark-invitations-as-read';

export const useMarkInvitationsAsRead = (): UseMutationResult<
  MarkInvitationAsReadResponse,
  RequestFailure,
  MarkInvitationAsReadRequest,
  unknown
> => {
  return useMutation({
    mutationKey: [MARK_INVITATIONS_AS_READ_MUTATION_KEY],
    mutationFn: async (request: MarkInvitationAsReadRequest) => {
      return await WorkspaceService.markInvitationAsRead(request);
    },
  });
};
