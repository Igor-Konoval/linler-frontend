import { ROUTES } from '../constants/routes.constants';
import type { ProjectResponse } from '../types/projects.types';

export function getProjectPath(project: ProjectResponse): string {
  if (!project.defaultPageId) {
    return `${ROUTES.WORKSPACE}/${project.workspaceId}/${project.id}`;
  }
  return `${ROUTES.WORKSPACE}/${project.workspaceId}/${project.id}/${project.defaultPageId}`;
}
