'use client';

import Link from 'next/link';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/src/components/sidebar/sidebar';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';
import { Separator } from '@/src/components/ui/separator';
import { Skeleton } from '@/src/components/ui/skeleton';
import { ProjectResponse } from '@/src/types/projects.types';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Plus, Settings } from 'lucide-react';
import { Button } from '../../ui/button';
import { SettingsProjectModal } from './edit-project-modal';
import { ProjectVisibility } from '@/src/constants/projects.constants';
import { CreateProjectModal } from './create-project/create-project-modal';
import { PagesSection } from '../project-pages/pages-section';
import { getProjectPath } from '@/src/utils/project.utils';

export type NavAccordionItem = {
  key: string;
  title: string;
  url?: string;
  isActive?: boolean;
};

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
          {workspaceId && (
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
          )}
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
                  <Accordion key={item.id} type="single" collapsible>
                    <AccordionItem value={item.id} className="border-none">
                      <SidebarMenuItem>
                        <AccordionHeader className="flex items-center gap-0">
                          <SidebarMenuButton
                            asChild
                            isActive={isProjectActive(item)}
                            className="flex-1"
                          >
                            <Link
                              href={getProjectPath(item)}
                              className="flex items-center truncate"
                            >
                              <div
                                title={`${item.icon ? item.icon : ''} ${item.name}`}
                                className="truncate"
                              >{`${item.icon ? item.icon : ''} ${item.name}`}</div>
                            </Link>
                          </SidebarMenuButton>
                          <SettingsProjectModal
                            trigger={
                              <Button
                                variant="ghostSecondary"
                                size="icon"
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="h-auto w-auto shrink-0 px-2 py-1.5 opacity-0 transition-opacity group-hover/menu-item:opacity-100"
                              >
                                <Settings className="h-3! w-3!" />
                              </Button>
                            }
                            project={item}
                          />
                          <AccordionTrigger className="w-auto! flex-none! basis-auto! justify-center! p-0.5! py-1! shrink-0 [&>svg]:static [&>svg]:ml-0" />
                        </AccordionHeader>
                      </SidebarMenuItem>
                      <AccordionContent className="ml-3 h-auto pb-0 pt-0">
                        <PagesSection project={item} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
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
