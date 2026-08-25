import type { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { GET_PROJECT_PAGE_QUERY_KEY } from './use-get-project-page';
import type { GetSidebarPagesResponse } from '@/src/types/pages.types';
import { GET_SIDEBAR_PAGES_QUERY_KEY } from './use-get-sidebar-pages';
import { PagesService } from '@/src/api/services/client/pages.service';

const DELETE_PAGE_MUTATION_KEY = 'delete-page';

export const useDeletePage = (
  projectId: string,
): UseMutationResult<void, RequestFailure, string, unknown> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [DELETE_PAGE_MUTATION_KEY],
    mutationFn: async (pageId: string) => {
      return await PagesService.deletePage(pageId);
    },
    onSuccess: (_, pageId) => {
      queryClient.removeQueries({
        queryKey: [GET_PROJECT_PAGE_QUERY_KEY, pageId],
      });
      queryClient.setQueriesData<GetSidebarPagesResponse>(
        { queryKey: [GET_SIDEBAR_PAGES_QUERY_KEY, projectId] },
        (oldData) => {
          if (!oldData) return oldData;

          if (!oldData.pages.some((project) => project.id === pageId)) {
            return oldData;
          }

          return {
            pages: oldData.pages.filter((project) => project.id !== pageId),
          };
        },
      );
    },
  });
};
