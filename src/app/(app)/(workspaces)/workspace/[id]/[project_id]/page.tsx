import { ProjectsService } from '@/src/api/services/server/projects.service';
import { redirect } from 'next/navigation';
import { PageWelcome } from './_components/page-welcome';
import { ROUTES } from '@/src/constants/routes.constants';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; project_id: string }>;
}) {
  const { id, project_id } = await params;
  const project = await ProjectsService.getProject(project_id);

  if (project.defaultPageId) {
    redirect(
      `${ROUTES.WORKSPACE}/${id}/${project_id}/${project.defaultPageId}`,
    );
  }

  return <PageWelcome />;
}
