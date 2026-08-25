import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { PagesService } from '@/src/api/services/client/pages.service';
import { type RequestFailure } from '@/src/utils/request-failure.utils';
import type { GetSidebarPagesResponse } from '@/src/types/pages.types';

export const GET_SIDEBAR_PAGES_QUERY_KEY = 'get-sidebar-pages';

export const useGetSidebarPages = ({
  projectId,
}: {
  projectId?: string;
}): UseQueryResult<GetSidebarPagesResponse, RequestFailure> =>
  useQuery({
    queryKey: [GET_SIDEBAR_PAGES_QUERY_KEY, projectId],
    queryFn: async () => {
      if (!projectId) {
        throw new Error('Project id is required');
      }

      return await PagesService.getSidebarPages(projectId);
    },
    enabled: Boolean(projectId),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
