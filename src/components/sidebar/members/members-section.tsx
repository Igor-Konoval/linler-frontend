import { type JSX } from 'react';
import { WorkspaceService } from '@/src/api/services/server/workspace.service';
import { Members } from './members';
import type { GetWorkspaceMembersResponse } from '@/src/types/workspaces.types';

export async function MembersSection({
  workspaceId,
}: {
  workspaceId?: string;
}): Promise<JSX.Element> {
  let members: GetWorkspaceMembersResponse | undefined;

  if (workspaceId) {
    try {
      members = await WorkspaceService.getWorkspaceMembers(workspaceId);
    } catch {
      members = undefined;
    }
  }

  return (
    <Members initialData={members ?? undefined} workspaceId={workspaceId} />
  );
}
