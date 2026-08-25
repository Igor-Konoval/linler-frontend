import { type JSX } from 'react';
import { ProjectsService } from '@/src/api/services/server/projects.service';
import type { GetProjectsResponse } from '@/src/types/projects.types';
import { Projects } from './projects';

export async function ProjectsSection({
  workspaceId,
}: {
  workspaceId?: string;
}): Promise<JSX.Element> {
  let projects: GetProjectsResponse | undefined;

  if (workspaceId) {
    try {
      projects = await ProjectsService.getProjects(workspaceId);
    } catch {
      projects = undefined;
    }
  }

  return (
    <Projects initialData={projects ?? undefined} workspaceId={workspaceId} />
  );
}
