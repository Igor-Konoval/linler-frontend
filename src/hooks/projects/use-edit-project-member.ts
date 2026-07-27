import { ProjectsService } from '@/src/api/services/client/projects.service';
import type {
  EditProjectMemberRequest,
  GetProjectMemberResponse,
} from '@/src/types/projects.types';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { GET_PROJECT_MEMBERS_QUERY_KEY } from './use-get-project-members';

const EDIT_PROJECT_MEMBER_MUTATION_KEY = 'edit-project-member';

export const useEditProjectMember = (): UseMutationResult<
  GetProjectMemberResponse,
  RequestFailure,
  { projectId: string; userId: string; request: EditProjectMemberRequest },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [EDIT_PROJECT_MEMBER_MUTATION_KEY],
    mutationFn: async ({
      projectId,
      userId,
      request,
    }: {
      projectId: string;
      userId: string;
      request: EditProjectMemberRequest;
    }) => {
      return await ProjectsService.editProjectMember(
        request,
        projectId,
        userId,
      );
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: [GET_PROJECT_MEMBERS_QUERY_KEY, projectId],
      });
    },
  });
};
