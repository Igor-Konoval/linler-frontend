'use client';

import { useGetSidebarPages } from '@/src/hooks/page/use-get-sidebar-pages';
import type { ProjectResponse } from '@/src/types/projects.types';
import { PagesItem } from './pages-item';

export function PagesSection({ project }: { project: ProjectResponse }) {
  const { data, isLoading } = useGetSidebarPages({
    projectId: project?.id,
  });

  return (
    <PagesItem
      isPending={isLoading}
      emptyLabel="No pages yet"
      items={data?.pages ?? []}
      project={project}
    />
  );
}
