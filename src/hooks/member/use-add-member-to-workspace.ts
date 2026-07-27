import { addMemberToWorkspaceAction } from '@/src/actions/member/add-member-to-workspace.action';
import type {
  AddMemberToWorkspaceRequest,
  GetWorkspaceInvitationsResponse,
  WorkspaceInvitationResponse,
} from '@/src/types/workspaces.types';
import { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  InfiniteData,
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { GET_WORKSPACE_INVITATIONS_QUERY_KEY } from '../workspaces/use-get-workspace-invitations';

const ADD_MEMBER_TO_WORKSPACE_MUTATION_KEY = 'add-member-to-workspace';

export const useAddMemberToWorkspace = (): UseMutationResult<
  WorkspaceInvitationResponse,
  RequestFailure,
  { workspaceId: string; request: AddMemberToWorkspaceRequest },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [ADD_MEMBER_TO_WORKSPACE_MUTATION_KEY],
    mutationFn: async ({
      workspaceId,
      request,
    }: {
      workspaceId: string;
      request: AddMemberToWorkspaceRequest;
    }) => {
      const result = await addMemberToWorkspaceAction(workspaceId, request);

      if (!result.success) {
        throw new RequestFailure(result.error);
      }

      return result.data;
    },
    onSuccess: (data, { workspaceId }) => {
      queryClient.setQueriesData<InfiniteData<GetWorkspaceInvitationsResponse>>(
        { queryKey: [GET_WORKSPACE_INVITATIONS_QUERY_KEY, workspaceId] },
        (oldData) => {
          if (!oldData?.pages.length) return oldData;

          const [firstPage, ...restPages] = oldData.pages;

          return {
            ...oldData,
            pages: [
              {
                ...firstPage,
                invitations: [data, ...firstPage.invitations],
              },
              ...restPages,
            ],
          };
        },
      );
    },
  });
};
