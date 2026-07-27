import { WorkspaceService } from '@/src/api/services/server/workspace.service';
import { GetWorkspaceResponse } from '@/src/types/workspaces.types';
import { notFound } from 'next/navigation';
import { ClientPage } from './_components/client-page';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let workspace: GetWorkspaceResponse | undefined = undefined;
  try {
    workspace = await WorkspaceService.getCurrentWorkspace(id);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
    notFound();
  }

  return (
    <div>
      Workspace {workspace.name}
      <ClientPage id={id} initialData={workspace} />
    </div>
  );
}
