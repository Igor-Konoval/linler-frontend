'use client';

import { useGetCurrentWorkspace } from '@/src/hooks/workspaces/use-get-current-workspace';
import type { GetWorkspaceResponse } from '@/src/types/workspaces.types';

interface ClientPageProps {
  initialData?: GetWorkspaceResponse;
  id: string;
}

export function ClientPage({ id, initialData }: ClientPageProps) {
  const { data: workspace } = useGetCurrentWorkspace({ id, initialData });

  return <div>Workspace {workspace?.name}</div>;
}
