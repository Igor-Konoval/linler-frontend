import { WorkspaceService } from '@/src/api/services/client/workspace.service';
import type { WorkspaceRole } from '@/src/constants/workspaces.constants';
import { useQuery } from '@tanstack/react-query';
import { GET_CURRENT_WORKSPACE_QUERY_KEY } from './workspaces/use-get-current-workspace';

export const useGetWorkspaceRole = (id?: string): WorkspaceRole | undefined => {
  const { data: role } = useQuery({
    queryKey: [GET_CURRENT_WORKSPACE_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Workspace id is required');
      }

      return await WorkspaceService.getCurrentWorkspace(id);
    },
    select: (workspace) => workspace.role,
    enabled: Boolean(id),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });

  return role;
};
