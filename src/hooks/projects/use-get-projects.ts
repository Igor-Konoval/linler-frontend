import { type RequestFailure } from '@/src/utils/request-failure.utils';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import type { GetProjectsResponse } from '@/src/types/projects.types';
import { ProjectsService } from '@/src/api/services/client/projects.service';

export const GET_PROJECTS_QUERY_KEY = 'get-projects';

export const useGetProjects = ({
  initialData,
  workspaceId,
}: {
  initialData?: GetProjectsResponse;
  workspaceId?: string;
}): UseQueryResult<GetProjectsResponse, RequestFailure> =>
  useQuery({
    queryKey: [GET_PROJECTS_QUERY_KEY, workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        throw new Error('Workspace id is required');
      }

      return await ProjectsService.getProjects(workspaceId);
    },
    initialData,
    enabled: Boolean(workspaceId),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
