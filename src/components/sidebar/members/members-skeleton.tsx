import { Users } from 'lucide-react';
import { SIDEBAR_NAV_SECTIONS } from '../../../constants/sidebar-nav.constants';
import { WorkspaceMembersItem } from './workspace-members-item';

export function MembersSkeleton() {
  return (
    <WorkspaceMembersItem
      value={SIDEBAR_NAV_SECTIONS.MEMBERS}
      title={SIDEBAR_NAV_SECTIONS.MEMBERS}
      icon={<Users className="mr-1.5" />}
      isPending
    />
  );
}
