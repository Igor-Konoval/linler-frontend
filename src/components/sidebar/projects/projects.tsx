'use client';

import { ProjectVisibility } from '@/src/constants/projects.constants';
import { useGetProjects } from '@/src/hooks/projects/use-get-projects';
import { useCurrentWorkspaceId } from '@/src/hooks/workspaces/use-current-workspace-id';
import type { GetProjectsResponse } from '@/src/types/projects.types';
import { Clock, EyeOff } from 'lucide-react';
import { useMemo } from 'react';
import { SIDEBAR_NAV_SECTIONS } from '../../../constants/sidebar-nav.constants';
import { ProjectsItem } from './projects-item';

export function Projects({
  initialData,
  workspaceId: initialWorkspaceId,
}: {
  initialData?: GetProjectsResponse;
  workspaceId?: string;
}) {
  const workspaceId = useCurrentWorkspaceId() ?? initialWorkspaceId;
  const { data, isLoading } = useGetProjects({
    workspaceId,
    initialData: workspaceId === initialWorkspaceId ? initialData : undefined,
  });

  const { workspaceProjects, privateProjects } = useMemo(() => {
    const projects = data?.projects ?? [];

    return {
      workspaceProjects: projects.filter(
        (project) => project.visibility === ProjectVisibility.WORKSPACE,
      ),
      privateProjects: projects.filter(
        (project) => project.visibility === ProjectVisibility.PRIVATE,
      ),
    };
  }, [data]);

  return (
    <>
      <ProjectsItem
        value={SIDEBAR_NAV_SECTIONS.PROJECTS}
        title={SIDEBAR_NAV_SECTIONS.PROJECTS}
        icon={<Clock className="mr-1.5" />}
        visibility={ProjectVisibility.WORKSPACE}
        isPending={isLoading}
        emptyLabel="No projects yet"
        workspaceId={workspaceId ?? ''}
        items={workspaceProjects}
      />
      <ProjectsItem
        value={SIDEBAR_NAV_SECTIONS.PRIVATE}
        title={SIDEBAR_NAV_SECTIONS.PRIVATE}
        visibility={ProjectVisibility.PRIVATE}
        icon={<EyeOff className="mr-1.5" />}
        isPending={isLoading}
        emptyLabel="No private projects"
        workspaceId={workspaceId ?? ''}
        items={privateProjects}
      />
    </>
  );
}
