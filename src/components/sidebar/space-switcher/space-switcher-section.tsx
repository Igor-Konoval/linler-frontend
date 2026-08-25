import { WorkspaceService } from '@/src/api/services/server/workspace.service';
import { GetWorkspacesResponse } from '@/src/types/workspaces.types';
import { type JSX } from 'react';
import { SpaceSwitcher } from './space-switcher';

export async function SpaceSwitcherSection(): Promise<JSX.Element> {
  let workspaces: GetWorkspacesResponse | undefined;

  try {
    workspaces = await WorkspaceService.getWorkspaces();
  } catch {
    workspaces = undefined;
  }

  return <SpaceSwitcher initialData={workspaces ?? undefined} />;
}
