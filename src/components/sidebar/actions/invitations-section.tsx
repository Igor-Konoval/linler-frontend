import { WorkspaceService } from '@/src/api/services/server/workspace.service';
import { PaginationQueryParamsValues } from '@/src/constants/routes.constants';
import type { GetMineInvitationsResponse } from '@/src/types/workspaces.types';
import { type JSX } from 'react';
import { Invitations } from './invitations';

export async function InvitationsSection({
  workspaceId,
}: {
  workspaceId?: string;
}): Promise<JSX.Element> {
  let invitations: GetMineInvitationsResponse | undefined;

  try {
    invitations = await WorkspaceService.getMineInvitations({
      limit: PaginationQueryParamsValues.LIMIT,
    });
  } catch {
    invitations = undefined;
  }

  return (
    <Invitations
      initialData={invitations ?? undefined}
      workspaceId={workspaceId}
    />
  );
}
