import type {
  EditWorkspaceRequest,
  GetWorkspaceResponse,
  GetWorkspacesResponse,
} from '@/src/types/workspaces.types';
import { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { GET_WORKSPACES_QUERY_KEY } from './use-get-workspaces';
import { editWorkspaceAction } from '@/src/actions/workspace/edit-workspace.action';

const EDIT_WORKSPACE_MUTATION_KEY = 'edit-workspace';

export const useEditWorkspace = (): UseMutationResult<
  GetWorkspaceResponse,
  RequestFailure,
  { id: string; request: EditWorkspaceRequest },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [EDIT_WORKSPACE_MUTATION_KEY],
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: EditWorkspaceRequest;
    }) => {
      const result = await editWorkspaceAction(id, request);

      if (!result.success) {
        throw new RequestFailure(result.error);
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<GetWorkspacesResponse>(
        [GET_WORKSPACES_QUERY_KEY],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            workspaces: oldData.workspaces.map((workspace) =>
              workspace.id === data.id ? data : workspace,
            ),
          };
        },
      );
    },
  });
};
