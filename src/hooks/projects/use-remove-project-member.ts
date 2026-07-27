import { ProjectsService } from '@/src/api/services/client/projects.service';
import type {
  GetProjectMembersResponse,
  RemoveProjectMemberRequest,
} from '@/src/types/projects.types';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { GET_PROJECT_MEMBERS_QUERY_KEY } from './use-get-project-members';

const REMOVE_PROJECT_MEMBER_MUTATION_KEY = 'remove-project-member';

export const useRemoveProjectMember = (): UseMutationResult<
  void,
  RequestFailure,
  RemoveProjectMemberRequest,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [REMOVE_PROJECT_MEMBER_MUTATION_KEY],
    mutationFn: async (request: RemoveProjectMemberRequest) => {
      return await ProjectsService.removeProjectMember(request);
    },
    onSuccess: (_, request) => {
      queryClient.setQueryData<GetProjectMembersResponse>(
        [GET_PROJECT_MEMBERS_QUERY_KEY, request.projectId],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            members: oldData.members.filter(
              (member) => member.userId !== request.userId,
            ),
          };
        },
      );
    },
  });
};
