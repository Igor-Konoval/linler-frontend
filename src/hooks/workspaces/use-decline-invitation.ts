import type { GetWorkspaceResponse } from '@/src/types/workspaces.types';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { WorkspaceService } from '@/src/api/services/client/workspace.service';

const DECLINE_INVITATION_MUTATION_KEY = 'decline-invitation';

export const useDeclineInvitation = (): UseMutationResult<
  GetWorkspaceResponse,
  RequestFailure,
  string,
  unknown
> => {
  return useMutation({
    mutationKey: [DECLINE_INVITATION_MUTATION_KEY],
    mutationFn: async (id: string) => {
      const result = await WorkspaceService.declineInvitation(id);

      return result;
    },
  });
};
