'use client';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/src/components/sidebar/sidebar';
import { Skeleton } from '@/src/components/ui/skeleton';
import { PageSidebarItem } from '@/src/types/pages.types';
import { ProjectResponse } from '@/src/types/projects.types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { CreateProjectPageModal } from './create-project-page-modal';
import { Button } from '../../ui/button';
import { Plus, Settings } from 'lucide-react';
import { SettingsPageModal } from './settings-page-modal';
import { getPagePath } from '@/src/utils/page.utils';

type FlatPageItem = {
  page: PageSidebarItem;
  depth: number;
};

function buildFlatPageTree(items: PageSidebarItem[]): FlatPageItem[] {
  const byParent = new Map<string | null, PageSidebarItem[]>();
  const byId = new Map<string, PageSidebarItem>();

  items.forEach((item) => {
    byId.set(item.id, item);
  });

  items.forEach((item) => {
    const parentKey =
      item.parentPageId && byId.has(item.parentPageId)
        ? item.parentPageId
        : null;
    const siblings = byParent.get(parentKey) ?? [];
    siblings.push(item);
    byParent.set(parentKey, siblings);
  });

  const sortItems = (list: PageSidebarItem[]) =>
    list.sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return a.title.localeCompare(b.title);
    });

  byParent.forEach((list) => sortItems(list));

  const result: FlatPageItem[] = [];

  const visit = (parentId: string | null, depth: number) => {
    const children = byParent.get(parentId) ?? [];
    children.forEach((child) => {
      result.push({ page: child, depth });
      visit(child.id, depth + 1);
    });
  };

  visit(null, 0);
  return result;
}

export function PagesItem({
  project,
  items,
  isPending,
  emptyLabel = 'Nothing here yet',
  skeletonCount = 1,
}: {
  project: ProjectResponse;
  items?: PageSidebarItem[];
  isPending?: boolean;
  emptyLabel?: string;
  skeletonCount?: number;
}) {
  const pathname = usePathname();

  const isPageActive = useCallback(
    (page: PageSidebarItem) => pathname === getPagePath(page, project),
    [pathname, project],
  );

  const treeItems = useMemo(() => buildFlatPageTree(items ?? []), [items]);

  return (
    <SidebarMenu className="gap-1 px-1 pt-1">
      {isPending ? (
        Array.from({ length: skeletonCount }).map((_, index) => (
          <SidebarMenuItem key={`skeleton-${index}`}>
            <Skeleton className="bg-(--skeleton-background) h-8 w-full rounded-md" />
          </SidebarMenuItem>
        ))
      ) : treeItems.length > 0 ? (
        treeItems.map(({ page, depth }) => (
          <SidebarMenuItem className="flex items-center gap-0" key={page.id}>
            <SidebarMenuButton
              asChild
              isActive={isPageActive(page)}
              className="pr-2"
              style={{ paddingLeft: `${8 + depth * 16}px` }}
            >
              <Link
                href={getPagePath(page, project)}
                className="flex w-full items-center"
                title={`${page.icon ? page.icon : ''} ${page.title}`}
              >
                <p className="truncate pr-5">{`${depth > 0 ? '└ ' : '• '} ${page.icon ? page.icon : ''} ${page.title}`}</p>
              </Link>
            </SidebarMenuButton>
            {project.id && (
              <CreateProjectPageModal
                trigger={
                  <Button
                    variant="ghostSecondary"
                    className="hover:bg-muted! hover:text-foreground! aria-expanded:bg-muted! aria-expanded:text-foreground! absolute right-0 top-1/2 z-10 -translate-y-1/2 p-1.5"
                    onClick={(e) => e.stopPropagation()}
                    type="button"
                  >
                    <Plus strokeWidth={1} className="h-4 w-4" />
                  </Button>
                }
                projectId={project.id}
                projectRole={project.role}
                parentPageId={page.id}
              />
            )}
            <SettingsPageModal
              trigger={
                <Button
                  variant="ghostSecondary"
                  size="icon"
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="mr-7.5 ml-1 h-auto w-auto shrink-0 px-1 py-2 opacity-0 transition-opacity group-hover/menu-item:opacity-100"
                >
                  <Settings className="h-3! w-3!" />
                </Button>
              }
              project={project}
              page={page}
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
  );
}
