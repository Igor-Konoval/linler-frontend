import { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { createProjectPageAction } from '@/src/actions/page/create-project-page.action';
import type {
  CreateProjectPageRequest,
  GetSidebarPagesResponse,
  PageResponse,
} from '@/src/types/pages.types';
import { GET_SIDEBAR_PAGES_QUERY_KEY } from './use-get-sidebar-pages';

const CREATE_PROJECT_PAGE_MUTATION_KEY = 'create-project-page';

export const useCreateProjectPage = (): UseMutationResult<
  PageResponse,
  RequestFailure,
  { projectId: string; request: CreateProjectPageRequest },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [CREATE_PROJECT_PAGE_MUTATION_KEY],
    mutationFn: async ({
      projectId,
      request,
    }: {
      projectId: string;
      request: CreateProjectPageRequest;
    }) => {
      const result = await createProjectPageAction(projectId, request);

      if (!result.success) {
        throw new RequestFailure(result.error);
      }

      return result.data;
    },
    onSuccess: (data, { projectId }) => {
      queryClient.setQueryData<GetSidebarPagesResponse>(
        [GET_SIDEBAR_PAGES_QUERY_KEY, projectId],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pages: [...oldData.pages, data],
          };
        },
      );
    },
  });
};
