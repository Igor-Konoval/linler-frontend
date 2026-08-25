'use client';

import { useCurrentWorkspaceId } from '@/src/hooks/workspaces/use-current-workspace-id';
import { useGetWorkspaceMembers } from '@/src/hooks/workspaces/use-get-workspace-members';
import type { GetWorkspaceMembersResponse } from '@/src/types/workspaces.types';
import { Users } from 'lucide-react';
import { SIDEBAR_NAV_SECTIONS } from '../../../constants/sidebar-nav.constants';
import { WorkspaceMembersItem } from './workspace-members-item';

export function Members({
  initialData,
  workspaceId: initialWorkspaceId,
}: {
  initialData?: GetWorkspaceMembersResponse;
  workspaceId?: string;
}) {
  const workspaceId = useCurrentWorkspaceId() ?? initialWorkspaceId;
  const { data, isLoading } = useGetWorkspaceMembers({
    workspaceId,
    initialData: workspaceId === initialWorkspaceId ? initialData : undefined,
  });

  return (
    <WorkspaceMembersItem
      workspaceId={workspaceId}
      value={SIDEBAR_NAV_SECTIONS.MEMBERS}
      title={SIDEBAR_NAV_SECTIONS.MEMBERS}
      icon={<Users className="mr-1.5" />}
      isPending={isLoading}
      emptyLabel="No members yet"
      items={data}
    />
  );
}
