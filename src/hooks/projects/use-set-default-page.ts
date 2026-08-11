import type {
  GetProjectsResponse,
  ProjectResponse,
  SetDefaultPageRequest,
} from '@/src/types/projects.types';
import { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { GET_PROJECTS_QUERY_KEY } from './use-get-projects';
import { setDefaultPageAction } from '@/src/actions/project/set-default-page.action';

const SET_DEFAULT_PAGE_MUTATION_KEY = 'set-default-page';

export const useSetDefaultPage = (): UseMutationResult<
  ProjectResponse,
  RequestFailure,
  { projectId: string; request: SetDefaultPageRequest },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [SET_DEFAULT_PAGE_MUTATION_KEY],
    mutationFn: async ({
      projectId,
      request,
    }: {
      projectId: string;
      request: SetDefaultPageRequest;
    }) => {
      const result = await setDefaultPageAction(projectId, request);

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
