import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from '@/src/components/sidebar/sidebar';
import { PATHNAME_HEADER, ROUTES } from '@/src/constants/routes.constants';
import { Bell, Lightbulb } from 'lucide-react';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { SIDEBAR_NAV_DEFAULT_OPEN } from '../../constants/sidebar-nav.constants';
import { Accordion } from '../ui/accordion';
import { InvitationSkeleton } from './actions/invitation-skeleton';
import { InvitationsSection } from './actions/invitations-section';
import { AddWorkspaceButton } from './add-workspace-button';
import { MembersSection } from './members/members-section';
import { MembersSkeleton } from './members/members-skeleton';
import { ProjectsSection } from './projects/projects-section';
import { ProjectsSkeleton } from './projects/projects-skeleton';
import { SpaceSwitcherSection } from './space-switcher/space-switcher-section';
import { AppSidebarSkeleton } from './space-switcher/space-switcher-skeleton';
import { Button } from '../ui/button';

async function getCurrentWorkspaceId(): Promise<string | undefined> {
  const headersList = await headers();
  const pathname = headersList.get(PATHNAME_HEADER);
  const workspacePath = `${ROUTES.WORKSPACE}/`;

  if (!pathname?.startsWith(workspacePath)) {
    return undefined;
  }

  return pathname.slice(workspacePath.length).split('/')[0] || undefined;
}

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const currentWorkspaceId = await getCurrentWorkspaceId();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="gap-0.5">
        <Suspense fallback={<AppSidebarSkeleton />}>
          <SpaceSwitcherSection />
        </Suspense>
        <AddWorkspaceButton />
        <SidebarGroup className="p-0">
          <SidebarGroupLabel>
            <Lightbulb className="mr-1.5" /> Actions
          </SidebarGroupLabel>
          <Suspense fallback={<InvitationSkeleton />}>
            <InvitationsSection workspaceId={currentWorkspaceId} />
          </Suspense>
          <div className="flex items-center gap-2 pr-2">
            <Button
              variant="ghost"
              className="hover:bg-(--sidebar-item-hover)! ml-2 w-full justify-start"
            >
              <Bell /> Notifications
            </Button>
          </div>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <Accordion type="multiple" defaultValue={SIDEBAR_NAV_DEFAULT_OPEN}>
          <Suspense fallback={<ProjectsSkeleton />}>
            <ProjectsSection workspaceId={currentWorkspaceId} />
          </Suspense>
          <Suspense fallback={<MembersSkeleton />}>
            <MembersSection workspaceId={currentWorkspaceId} />
          </Suspense>
        </Accordion>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
