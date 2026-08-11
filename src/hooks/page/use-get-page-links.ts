import { useQueries } from '@tanstack/react-query';
import { PagesService } from '@/src/api/services/client/pages.service';

export const GET_PAGE_LINKS_QUERY_KEY = 'get-page-links';

export const useGetPageLinks = (projectIds: string[], enabled: boolean) =>
  useQueries({
    queries: projectIds.map((id) => ({
      queryKey: [GET_PAGE_LINKS_QUERY_KEY, id],
      queryFn: async () => PagesService.getSidebarPages(id),
      staleTime: 60_000,
      gcTime: 30 * 60_000,
      retry: false,
      enabled,
    })),
  });
