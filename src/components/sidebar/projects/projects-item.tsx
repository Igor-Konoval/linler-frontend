'use client';

import Link from 'next/link';
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
import { ROUTES } from '@/src/constants/routes.constants';
import { ProjectResponse } from '@/src/types/projects.types';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Plus, Settings } from 'lucide-react';
import { Button } from '../../ui/button';
import { SettingsProjectModal } from './edit-project-modal';
import { ProjectVisibility } from '@/src/constants/projects.constants';
import { CreateProjectModal } from './create-project/create-project-modal';

export type NavAccordionItem = {
  key: string;
  title: string;
  url?: string;
  isActive?: boolean;
};

function getProjectPath(project: ProjectResponse): string {
  return `${ROUTES.WORKSPACE}/${project.workspaceId}/${project.id}`;
}

export function ProjectsItem({
  value,
  title,
  icon,
  visibility,
  workspaceId,
  items,
  isPending,
  emptyLabel = 'Nothing here yet',
  skeletonCount = 2,
}: {
  value: string;
  title: string;
  icon: React.ReactNode;
  visibility: ProjectVisibility;
  workspaceId: string;
  items?: ProjectResponse[];
  isPending?: boolean;
  emptyLabel?: string;
  skeletonCount?: number;
}) {
  const pathname = usePathname();

  const isProjectActive = useCallback(
    (project: ProjectResponse) => pathname === getProjectPath(project),
    [pathname],
  );
  return (
    <SidebarGroup className="py-0">
      <AccordionItem value={value}>
        <AccordionHeader className="relative flex items-center">
          <AccordionTrigger className="py-0">
            <SidebarGroupLabel>
              {icon} {title}
            </SidebarGroupLabel>
          </AccordionTrigger>
          <CreateProjectModal
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
            visibility={visibility}
          />
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
              ) : items && items.length > 0 ? (
                items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isProjectActive(item)}>
                      <Link
                        href={getProjectPath(item)}
                        className="flex w-full items-center"
                      >
                        {`${item.icon} ${item.name}`}
                      </Link>
                    </SidebarMenuButton>
                    <SettingsProjectModal
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
                      project={item}
                    />
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
