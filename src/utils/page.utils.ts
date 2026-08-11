import { ROUTES } from '../constants/routes.constants';
import type { PageSidebarItem } from '../types/pages.types';
import type { ProjectResponse } from '../types/projects.types';

export function getPagePath(
  page: PageSidebarItem,
  project: ProjectResponse,
): string {
  return `${ROUTES.WORKSPACE}/${project.workspaceId}/${project.id}/${page.id}`;
}
