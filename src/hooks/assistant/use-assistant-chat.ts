import { AssistantService } from '@/src/api/services/client/assistant.service';
import { GET_PROJECT_PAGE_QUERY_KEY } from '@/src/hooks/page/use-get-project-page';
import { GET_SIDEBAR_PAGES_QUERY_KEY } from '@/src/hooks/page/use-get-sidebar-pages';
import { GET_PROJECTS_QUERY_KEY } from '@/src/hooks/projects/use-get-projects';
import { GET_CURRENT_WORKSPACE_QUERY_KEY } from '@/src/hooks/workspaces/use-get-current-workspace';
import { GET_WORKSPACES_QUERY_KEY } from '@/src/hooks/workspaces/use-get-workspaces';
import {
  type AssistantChatRequest,
  type AssistantChatResponse,
} from '@/src/types/assistant.types';
import { type RequestFailure } from '@/src/utils/request-failure.utils';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useAssistantChat() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    AssistantChatResponse,
    RequestFailure,
    AssistantChatRequest
  >({
    mutationFn: (request: AssistantChatRequest) =>
      AssistantService.chat(request),
    onSuccess: (result) => {
      if (!result.changed) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: [GET_PROJECTS_QUERY_KEY],
      });
      void queryClient.invalidateQueries({
        queryKey: [GET_SIDEBAR_PAGES_QUERY_KEY],
      });
      void queryClient.invalidateQueries({
        queryKey: [GET_PROJECT_PAGE_QUERY_KEY],
      });
      void queryClient.invalidateQueries({
        queryKey: [GET_WORKSPACES_QUERY_KEY],
      });
      void queryClient.invalidateQueries({
        queryKey: [GET_CURRENT_WORKSPACE_QUERY_KEY],
      });
      router.refresh();
    },
  });
}
