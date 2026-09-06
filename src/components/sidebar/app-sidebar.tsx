import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from '@/src/components/sidebar/sidebar';
import { PATHNAME_HEADER, ROUTES } from '@/src/constants/routes.constants';
import { Lightbulb } from 'lucide-react';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { SIDEBAR_NAV_DEFAULT_OPEN } from '../../constants/sidebar-nav.constants';
import { Accordion } from '../ui/accordion';
import { InvitationSkeleton } from './actions/invitation-skeleton';
import { InvitationsSection } from './actions/invitations-section';
import { NotificationsSection } from './actions/notifications-section';
import { AddWorkspaceButton } from './add-workspace-button';
import { MembersSection } from './members/members-section';
import { MembersSkeleton } from './members/members-skeleton';
import { ProjectsSection } from './projects/projects-section';
import { ProjectsSkeleton } from './projects/projects-skeleton';
import { SpaceSwitcherSection } from './space-switcher/space-switcher-section';
import { AppSidebarSkeleton } from './space-switcher/space-switcher-skeleton';
import { ThemedImage } from '../ui/themed-image';

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
        <ThemedImage
          lightSrc="/linler-logo-light.svg"
          darkSrc="/linler-logo-dark.svg"
          alt="Linler Logo"
          loading="eager"
          className="my-2 ml-2 h-7 w-fit"
          width={100}
          height={100}
        />
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
          <Suspense fallback={<InvitationSkeleton />}>
            <NotificationsSection />
          </Suspense>
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
