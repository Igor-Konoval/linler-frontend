import { PageEditor } from '@/src/components/editor/page-editor';
import { PagesService } from '@/src/api/services/server/pages.service';
import type { PageResponse } from '@/src/types/pages.types';
import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ project_id: string; page_id: string }>;
}) {
  const { project_id: projectId, page_id: pageId } = await params;

  let page: PageResponse;
  try {
    page = await PagesService.getPage(pageId);
  } catch {
    notFound();
  }

  if (page.projectId !== projectId) notFound();

  return <PageEditor pageId={pageId} initialData={page} />;
}
