import { type RequestFailure } from '@/src/utils/request-failure.utils';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import type { GetProjectMembersResponse } from '@/src/types/projects.types';
import { ProjectsService } from '@/src/api/services/client/projects.service';

export const GET_PROJECT_MEMBERS_QUERY_KEY = 'get-project-members';

export const useGetProjectMembers = ({
  projectId,
}: {
  projectId?: string;
}): UseQueryResult<GetProjectMembersResponse, RequestFailure> =>
  useQuery({
    queryKey: [GET_PROJECT_MEMBERS_QUERY_KEY, projectId],
    queryFn: async () => {
      if (!projectId) {
        throw new Error('Project id is required');
      }

      return await ProjectsService.getProjectMembers(projectId);
    },
    enabled: Boolean(projectId),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
