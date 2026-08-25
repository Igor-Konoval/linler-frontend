import type {
  CreateProjectRequest,
  GetProjectsResponse,
  ProjectResponse,
} from '@/src/types/projects.types';
import { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { GET_PROJECTS_QUERY_KEY } from './use-get-projects';
import { createProjectAction } from '@/src/actions/project/create-project.action';

const CREATE_PROJECT_MUTATION_KEY = 'create-project';

export const useCreateProject = (): UseMutationResult<
  ProjectResponse,
  RequestFailure,
  { workspaceId: string; request: CreateProjectRequest },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [CREATE_PROJECT_MUTATION_KEY],
    mutationFn: async ({
      workspaceId,
      request,
    }: {
      workspaceId: string;
      request: CreateProjectRequest;
    }) => {
      const result = await createProjectAction(workspaceId, request);

      if (!result.success) {
        throw new RequestFailure(result.error);
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<GetProjectsResponse>(
        [GET_PROJECTS_QUERY_KEY, data.workspaceId],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            projects: [...oldData.projects, data],
          };
        },
      );
    },
  });
};
