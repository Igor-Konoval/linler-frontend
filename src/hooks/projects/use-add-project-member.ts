import type {
  AddProjectMemberRequest,
  GetProjectMemberResponse,
  GetProjectMembersResponse,
} from '@/src/types/projects.types';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { ProjectsService } from '@/src/api/services/client/projects.service';
import { GET_PROJECT_MEMBERS_QUERY_KEY } from './use-get-project-members';

const ADD_PROJECT_MEMBER_MUTATION_KEY = 'add-project-member';

export const useAddProjectMember = (): UseMutationResult<
  GetProjectMemberResponse,
  RequestFailure,
  { projectId: string; request: AddProjectMemberRequest },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [ADD_PROJECT_MEMBER_MUTATION_KEY],
    mutationFn: async ({
      projectId,
      request,
    }: {
      projectId: string;
      request: AddProjectMemberRequest;
    }) => {
      return await ProjectsService.addProjectMember(request, projectId);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData<GetProjectMembersResponse>(
        [GET_PROJECT_MEMBERS_QUERY_KEY, variables.projectId],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            members: [...oldData.members, data],
          };
        },
      );
    },
  });
};
