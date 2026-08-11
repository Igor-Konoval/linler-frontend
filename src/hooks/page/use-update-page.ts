import type { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

import { PagesService } from '@/src/api/services/client/pages.service';
import type {
  GetSidebarPagesResponse,
  PageResponse,
  UpdatePageRequest,
} from '@/src/types/pages.types';
import { GET_SIDEBAR_PAGES_QUERY_KEY } from './use-get-sidebar-pages';

const UPDATE_PAGE_MUTATION_KEY = 'update-page';

export const useUpdatePage = (
  projectId: string,
): UseMutationResult<
  PageResponse,
  RequestFailure,
  { pageId: string; request: UpdatePageRequest },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [UPDATE_PAGE_MUTATION_KEY],
    mutationFn: async ({
      pageId,
      request,
    }: {
      pageId: string;
      request: UpdatePageRequest;
    }) => await PagesService.updatePage(pageId, request),
    onSuccess: (data) => {
      queryClient.setQueriesData<GetSidebarPagesResponse>(
        { queryKey: [GET_SIDEBAR_PAGES_QUERY_KEY, projectId] },
        (oldData) => {
          if (!oldData) return oldData;

          if (!oldData.pages.some((page) => page.id === data.id)) {
            return oldData;
          }

          return {
            pages: oldData.pages.map((page) =>
              page.id === data.id
                ? {
                    ...page,
                    title: data.title,
                    icon: data.icon,
                    orderIndex: data.orderIndex,
                    isArchived: data.isArchived,
                  }
                : page,
            ),
          };
        },
      );
    },
  });
};
