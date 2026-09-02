import { GET_PROJECT_MEMBERS_QUERY_KEY } from '@/src/hooks/projects/use-get-project-members';
import { GET_USER_QUERY_KEY } from '@/src/hooks/user/use-get-user';
import { GET_USER_ACCOUNT_QUERY_KEY } from '@/src/hooks/user/use-get-user-account';
import { GET_WORKSPACE_MEMBERS_QUERY_KEY } from '@/src/hooks/workspaces/use-get-workspace-members';
import type { GetUserResponse } from '@/src/types/auth.types';
import type { GetProjectMembersResponse } from '@/src/types/projects.types';
import type { GetUserAccountResponse } from '@/src/types/user.types';
import type { GetWorkspaceMembersResponse } from '@/src/types/workspaces.types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useSyncUserAccountCache() {
  const queryClient = useQueryClient();

  return useCallback(
    (user: GetUserAccountResponse) => {
      queryClient.setQueryData<GetUserAccountResponse>(
        [GET_USER_ACCOUNT_QUERY_KEY],
        user,
      );
      queryClient.setQueryData<GetUserResponse>([GET_USER_QUERY_KEY], {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      });

      queryClient.setQueriesData<GetWorkspaceMembersResponse>(
        { queryKey: [GET_WORKSPACE_MEMBERS_QUERY_KEY] },
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            members: current.members.map((member) =>
              member.userId === user.id
                ? {
                    ...member,
                    username: user.username,
                    avatarUrl: user.avatarUrl ?? '',
                  }
                : member,
            ),
          };
        },
      );

      queryClient.setQueriesData<GetProjectMembersResponse>(
        { queryKey: [GET_PROJECT_MEMBERS_QUERY_KEY] },
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            members: current.members.map((member) =>
              member.userId === user.id
                ? {
                    ...member,
                    username: user.username,
                    avatarUrl: user.avatarUrl,
                  }
                : member,
            ),
          };
        },
      );
    },
    [queryClient],
  );
}
