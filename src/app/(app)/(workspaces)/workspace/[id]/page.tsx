import { WorkspaceService } from '@/src/api/services/server/workspace.service';
import { notFound } from 'next/navigation';
import { PageContent } from '../_components/page-content';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    await WorkspaceService.getCurrentWorkspace(id);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
    notFound();
  }

  return <PageContent />;
}
