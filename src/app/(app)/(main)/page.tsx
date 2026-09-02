import { PageContent } from '@/src/app/(app)/(workspaces)/workspace/_components/page-content';
import { WorkspaceService } from '@/src/api/services/server/workspace.service';
import { ROUTES } from '@/src/constants/routes.constants';
import { redirect } from 'next/navigation';

export default async function Page() {
  let workspaceId: string | undefined;

  try {
    const response = await WorkspaceService.getWorkspaces();
    workspaceId = response.workspaces[0]?.id;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
  }

  if (workspaceId) {
    redirect(`${ROUTES.WORKSPACE}/${workspaceId}`);
  }

  return <PageContent />;
}
