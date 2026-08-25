import { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type {
  EditWorkspaceMemberRequest,
  GetWorkspaceMembersResponse,
  WorkspaceMemberResponse,
} from '@/src/types/workspaces.types';
import { editWorkspaceMemberAction } from '@/src/actions/member/edit-workspace-member.action';
import { GET_WORKSPACE_MEMBERS_QUERY_KEY } from '../workspaces/use-get-workspace-members';

const EDIT_WORKSPACE_MEMBER_MUTATION_KEY = 'edit-workspace-member';

export const useEditWorkspaceMember = (): UseMutationResult<
  WorkspaceMemberResponse,
  RequestFailure,
  { id: string; userId: string; request: Partial<EditWorkspaceMemberRequest> },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [EDIT_WORKSPACE_MEMBER_MUTATION_KEY],
    mutationFn: async ({
      id,
      userId,
      request,
    }: {
      id: string;
      userId: string;
      request: Partial<EditWorkspaceMemberRequest>;
    }) => {
      const result = await editWorkspaceMemberAction(id, userId, request);

      if (!result.success) {
        throw new RequestFailure(result.error);
      }

      return result.data;
    },
    onSuccess: (data, { id }) => {
      queryClient.setQueryData<GetWorkspaceMembersResponse>(
        [GET_WORKSPACE_MEMBERS_QUERY_KEY, id],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            members: oldData.members.map((member) =>
              member.id === data.id ? data : member,
            ),
          };
        },
      );
    },
  });
};
