import { Clock } from 'lucide-react';
import { SIDEBAR_NAV_SECTIONS } from '../../../constants/sidebar-nav.constants';
import { ProjectsItem } from './projects-item';
import { ProjectVisibility } from '@/src/constants/projects.constants';

export function WorkspaceProjectsSkeleton() {
  return (
    <ProjectsItem
      value={SIDEBAR_NAV_SECTIONS.PROJECTS}
      title={SIDEBAR_NAV_SECTIONS.PROJECTS}
      icon={<Clock className="mr-1.5" />}
      isPending
      visibility={ProjectVisibility.WORKSPACE}
      workspaceId={''}
    />
  );
}
