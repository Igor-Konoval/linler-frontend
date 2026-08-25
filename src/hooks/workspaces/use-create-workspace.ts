import { createWorkspaceAction } from '@/src/actions/workspace/create-workspace.action';
import type {
  CreateWorkspaceRequest,
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

const CREATE_WORKSPACE_MUTATION_KEY = 'create-workspace';

export const useCreateWorkspace = (): UseMutationResult<
  GetWorkspaceResponse,
  RequestFailure,
  CreateWorkspaceRequest,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [CREATE_WORKSPACE_MUTATION_KEY],
    mutationFn: async (request: CreateWorkspaceRequest) => {
      const result = await createWorkspaceAction(request);

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
            workspaces: [...oldData.workspaces, data],
          };
        },
      );
    },
  });
};
