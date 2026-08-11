import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/src/components/sidebar/sidebar';
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';
import { Separator } from '@/src/components/ui/separator';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Plus, Settings } from 'lucide-react';
import { Button } from '../../ui/button';
import { AddMemberToWorkspaceModal } from './add-member-to-workspace';
import { EditWorkspaceMemberModal } from './edit-workspace-member-modal';
import type { GetWorkspaceMembersResponse } from '@/src/types/workspaces.types';
import Image from 'next/image';

export type WorkspaceMembersItem = {
  key: string;
  title: string;
  url?: string;
  isActive?: boolean;
};

export function WorkspaceMembersItem({
  value,
  title,
  icon,
  items,
  isPending,
  emptyLabel = 'Nothing here yet',
  skeletonCount = 2,
  workspaceId,
}: {
  value: string;
  title: string;
  icon: React.ReactNode;
  items?: GetWorkspaceMembersResponse;
  isPending?: boolean;
  emptyLabel?: string;
  skeletonCount?: number;
  workspaceId?: string;
}) {
  return (
    <SidebarGroup className="py-0">
      <AccordionItem value={value}>
        <AccordionHeader className="relative flex items-center">
          <AccordionTrigger className="py-0">
            <SidebarGroupLabel>
              {icon} {title}
            </SidebarGroupLabel>
          </AccordionTrigger>
          {workspaceId ? (
            <AddMemberToWorkspaceModal
              trigger={
                <Button
                  variant="ghostSecondary"
                  className="hover:bg-muted! hover:text-foreground! aria-expanded:bg-muted! aria-expanded:text-foreground! absolute right-5 top-1/2 z-10 -translate-y-1/2 p-1.5"
                  onClick={(e) => e.stopPropagation()}
                  type="button"
                >
                  <Plus strokeWidth={1} className="h-4 w-4" />
                </Button>
              }
              workspaceId={workspaceId}
            />
          ) : null}
        </AccordionHeader>
        <AccordionContent className="ml-3 h-auto pb-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {isPending ? (
                Array.from({ length: skeletonCount }).map((_, index) => (
                  <SidebarMenuItem key={`skeleton-${index}`}>
                    <Skeleton className="bg-(--skeleton-background) h-8 w-full rounded-md" />
                  </SidebarMenuItem>
                ))
              ) : items && items.members.length > 0 ? (
                items.members.map((item) => (
                  <SidebarMenuItem
                    className="hover:bg-(--sidebar-item-hover) rounded-md transition-colors"
                    key={item.id}
                  >
                    <SidebarMenuButton asChild isActive={false}>
                      <div>
                        {item.avatarUrl ? (
                          <Image
                            src={item.avatarUrl}
                            alt="Avatar"
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gray-200" />
                        )}
                        <span>{item.username}</span>
                      </div>
                    </SidebarMenuButton>
                    {workspaceId ? (
                      <EditWorkspaceMemberModal
                        trigger={
                          <SidebarMenuAction
                            showOnHover
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghostSecondary"
                              size="icon"
                              type="button"
                              className="h-auto w-auto p-2"
                            >
                              <Settings className="h-3! w-3!" />
                            </Button>
                          </SidebarMenuAction>
                        }
                        workspaceId={workspaceId}
                        member={item}
                      />
                    ) : null}
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem>
                  <span className="text-muted-foreground px-2 py-1.5 text-sm">
                    {emptyLabel}
                  </span>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </AccordionContent>
        <Separator className="my-2" />
      </AccordionItem>
    </SidebarGroup>
  );
}
