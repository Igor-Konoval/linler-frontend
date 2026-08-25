import { WorkspaceService } from '@/src/api/services/client/workspace.service';
import type { GetWorkspaceMembersResponse } from '@/src/types/workspaces.types';
import { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { GET_WORKSPACE_MEMBERS_QUERY_KEY } from '../workspaces/use-get-workspace-members';

const DELETE_WORKSPACE_MEMBER_MUTATION_KEY = 'delete-workspace-member';

export const useDeleteWorkspaceMember = (): UseMutationResult<
  void,
  RequestFailure,
  { id: string; userId: string },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [DELETE_WORKSPACE_MEMBER_MUTATION_KEY],
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      return await WorkspaceService.deleteWorkspaceMember(id, userId);
    },
    onSuccess: (_, { id, userId }) => {
      queryClient.setQueryData<GetWorkspaceMembersResponse>(
        [GET_WORKSPACE_MEMBERS_QUERY_KEY, id],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            members: oldData.members.filter(
              (member) => member.userId !== userId,
            ),
          };
        },
      );
    },
  });
};
