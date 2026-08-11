import { PagesService } from '@/src/api/services/client/pages.service';
import type { PageResponse } from '@/src/types/pages.types';
import { type RequestFailure } from '@/src/utils/request-failure.utils';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export const GET_PROJECT_PAGE_QUERY_KEY = 'get-project-page';

export const useGetProjectPage = ({
  initialData,
  pageId,
}: {
  initialData?: PageResponse;
  pageId?: string;
}): UseQueryResult<PageResponse, RequestFailure> =>
  useQuery({
    queryKey: [GET_PROJECT_PAGE_QUERY_KEY, pageId],
    queryFn: async () => {
      if (!pageId) {
        throw new Error('Page id is required');
      }

      return await PagesService.getPage(pageId);
    },
    initialData,
    enabled: Boolean(pageId),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
