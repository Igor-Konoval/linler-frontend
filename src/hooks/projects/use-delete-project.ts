import { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { GetProjectsResponse } from '@/src/types/projects.types';
import { ProjectsService } from '@/src/api/services/client/projects.service';
import { GET_PROJECTS_QUERY_KEY } from './use-get-projects';

const DELETE_PROJECT_MUTATION_KEY = 'delete-project';

export const useDeleteProject = (): UseMutationResult<
  void,
  RequestFailure,
  string,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [DELETE_PROJECT_MUTATION_KEY],
    mutationFn: async (projectId: string) => {
      return await ProjectsService.deleteProject(projectId);
    },
    onSuccess: (_, projectId) => {
      queryClient.setQueriesData<GetProjectsResponse>(
        { queryKey: [GET_PROJECTS_QUERY_KEY] },
        (oldData) => {
          if (!oldData) return oldData;

          if (!oldData.projects.some((project) => project.id === projectId)) {
            return oldData;
          }

          return {
            projects: oldData.projects.filter(
              (project) => project.id !== projectId,
            ),
          };
        },
      );
    },
  });
};
