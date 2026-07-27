'use client';

import type { GetMineInvitationsResponse } from '@/src/types/workspaces.types';
import { useGetMineInvitations } from '@/src/hooks/workspaces/use-get-mine-invitations';
import { Mails } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { PaginationQueryParamsValues } from '@/src/constants/routes.constants';
import { useMemo, useRef } from 'react';
import { useInfiniteScroll } from '@/src/hooks/use-infinite-scroll';
import { useCurrentWorkspaceId } from '@/src/hooks/workspaces/use-current-workspace-id';
import { useGetWorkspaceInvitations } from '@/src/hooks/workspaces/use-get-workspace-invitations';
import { MineInvitations } from './mine-invitations';
import { WorkspaceInvitations } from './workspace-invitations';
import { isWorkspaceAdmin } from '@/src/utils/workspaces.utils';
import { useGetWorkspaceRole } from '@/src/hooks/use-get-workspace-role';

export function Invitations({
  initialData,
  workspaceId: initialWorkspaceId,
}: {
  initialData?: GetMineInvitationsResponse;
  workspaceId?: string;
}) {
  const workspaceId = useCurrentWorkspaceId() ?? initialWorkspaceId;

  const workspaceRole = useGetWorkspaceRole(workspaceId);
  const isAdmin = isWorkspaceAdmin(workspaceRole);

  const {
    data: invitations,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useGetMineInvitations({
    initialData,
    params: { limit: PaginationQueryParamsValues.LIMIT },
  });

  const {
    data: workspaceInvitations,
    fetchNextPage: fetchNextWorkspacePage,
    hasNextPage: hasNextWorkspacePage,
    isError: isWorkspaceError,
    isFetchingNextPage: isFetchingNextWorkspacePage,
    isPending: isPendingWorkspace,
  } = useGetWorkspaceInvitations({
    id: workspaceId,
    params: { limit: PaginationQueryParamsValues.LIMIT },
    enabled: isAdmin,
  });

  const workspaceInvitationsScrollRef = useRef<HTMLDivElement>(null);
  const { loadMoreRef: workspaceLoadMoreRef } = useInfiniteScroll({
    rootRef: workspaceInvitationsScrollRef,
    hasNextPage: hasNextWorkspacePage,
    isFetchingNextPage: isFetchingNextWorkspacePage,
    onLoadMore: fetchNextWorkspacePage,
    enabled: !isWorkspaceError,
  });

  const workspaceInvitationsFlatData = useMemo(
    () => workspaceInvitations?.pages.flatMap((page) => page.invitations) ?? [],
    [workspaceInvitations],
  );

  const invitationsScrollRef = useRef<HTMLDivElement>(null);
  const { loadMoreRef } = useInfiniteScroll({
    rootRef: invitationsScrollRef,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
    enabled: !isError,
  });

  const flatData = useMemo(
    () => invitations?.pages.flatMap((page) => page.invitations) ?? [],
    [invitations],
  );

  return (
    <div className="flex items-center gap-2 pr-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-(--sidebar-item-hover)! ml-2 w-full justify-start"
          >
            <Mails size={16} /> Invitations
            {invitations?.pages[0]?.unreadCount &&
            invitations?.pages[0]?.unreadCount > 0
              ? ` (${invitations?.pages[0]?.unreadCount})`
              : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto" align="start">
          <Tabs
            defaultValue="personal"
            className="flex w-[320px] flex-col gap-1"
          >
            <TabsList className="border-border/80 flex w-full gap-1 border-b px-1 pb-1">
              <TabsTrigger
                value="personal"
                className="data-[state=active]:bg-sidebar-secondary data-[state=active]:text-foreground! data-[state=active]:border-primary data-[state=inactive]:text-muted-foreground flex-1 px-3 py-1 text-sm transition-colors hover:cursor-pointer"
              >
                Personal
              </TabsTrigger>
              <TabsTrigger
                disabled={!isAdmin}
                value="workspace"
                className="data-[state=active]:bg-sidebar-secondary data-[state=active]:text-foreground! data-[state=active]:border-primary data-[state=inactive]:text-muted-foreground flex-1 px-3 py-1 text-sm transition-colors hover:cursor-pointer"
              >
                Workspace
              </TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="pt-2">
              <MineInvitations
                invitations={flatData}
                hasNextPage={hasNextPage}
                isError={isError}
                isFetchingNextPage={isFetchingNextPage}
                loadMoreRef={loadMoreRef}
                invitationsScrollRef={invitationsScrollRef}
                isPending={isPending}
              />
            </TabsContent>
            <TabsContent value="workspace" className="pt-2" hidden={!isAdmin}>
              <WorkspaceInvitations
                invitations={workspaceInvitationsFlatData}
                hasNextPage={hasNextWorkspacePage}
                isError={isWorkspaceError}
                isFetchingNextPage={isFetchingNextWorkspacePage}
                loadMoreRef={workspaceLoadMoreRef}
                invitationsScrollRef={workspaceInvitationsScrollRef}
                isPending={isPendingWorkspace}
              />
            </TabsContent>
          </Tabs>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
