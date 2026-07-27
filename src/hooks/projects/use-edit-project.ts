import { editProjectAction } from '@/src/actions/project/edit-project.action';
import type {
  EditProjectRequest,
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

const EDIT_PROJECT_MUTATION_KEY = 'edit-project';

export const useEditProject = (): UseMutationResult<
  ProjectResponse,
  RequestFailure,
  { projectId: string; request: Partial<EditProjectRequest> },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [EDIT_PROJECT_MUTATION_KEY],
    mutationFn: async ({
      projectId,
      request,
    }: {
      projectId: string;
      request: Partial<EditProjectRequest>;
    }) => {
      const result = await editProjectAction(projectId, request);

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
            projects: oldData.projects.map((project) =>
              project.id === data.id ? data : project,
            ),
          };
        },
      );
    },
  });
};
