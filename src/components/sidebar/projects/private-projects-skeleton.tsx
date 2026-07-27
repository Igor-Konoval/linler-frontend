import { EyeOff } from 'lucide-react';
import { SIDEBAR_NAV_SECTIONS } from '../../../constants/sidebar-nav.constants';
import { ProjectsItem } from './projects-item';
import { ProjectVisibility } from '@/src/constants/projects.constants';

export function PrivateProjectsSkeleton() {
  return (
    <ProjectsItem
      value={SIDEBAR_NAV_SECTIONS.PRIVATE}
      title={SIDEBAR_NAV_SECTIONS.PRIVATE}
      icon={<EyeOff className="mr-1.5" />}
      isPending
      visibility={ProjectVisibility.PRIVATE}
      workspaceId={''}
    />
  );
}
