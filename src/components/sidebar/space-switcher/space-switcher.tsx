'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Eye, GalleryVerticalEnd } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/src/components/sidebar/sidebar';
import { GetWorkspacesResponse } from '@/src/types/workspaces.types';
import { useGetWorkspaces } from '@/src/hooks/workspaces/use-get-workspaces';
import { AppSidebarSkeleton } from './space-switcher-skeleton';
import { getWorkspaceRole } from '@/src/utils/workspaces.utils';
import Link from 'next/link';
import { ROUTES } from '@/src/constants/routes.constants';
import { usePathname } from 'next/navigation';
import { WorkspaceSettingsButton } from './workspace-settings-button';
import { useState } from 'react';
import { WorkspaceSettingsModal } from '../../modals/workspace-settings-modal';

export function SpaceSwitcher({
  initialData,
}: {
  initialData?: GetWorkspacesResponse;
}) {
  const { data: workspaces, isPending } = useGetWorkspaces({
    initialData,
  });

  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [settingsWorkspace, setSettingsWorkspace] = useState<
    GetWorkspacesResponse['workspaces'][number] | undefined
  >();

  const pathname = usePathname();

  const selectedWorkspace = React.useMemo(() => {
    const workspacePath = `${ROUTES.WORKSPACE}/`;
    const workspaceId = pathname.startsWith(workspacePath)
      ? pathname.slice(workspacePath.length).split('/')[0]
      : undefined;

    const workspace = workspaces?.workspaces.find(
      (workspace) => workspace.id === workspaceId,
    );

    return workspace ?? workspaces?.workspaces[0];
  }, [pathname, workspaces]);

  if (isPending) {
    return <AppSidebarSkeleton />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-(--sidebar-item-hover) rounded-md transition-colors"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Eye />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="mb-1 font-medium">
                  {selectedWorkspace?.name}
                </span>
                <span>{getWorkspaceRole(selectedWorkspace?.role)}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-sidebar-accent-foreground max-h-[250px] overflow-y-auto"
            align="start"
          >
            {workspaces?.workspaces.map((workspace) => (
              <DropdownMenuItem key={workspace.slug}>
                <Link
                  className="flex h-[32px] w-full items-center gap-2"
                  href={`${ROUTES.WORKSPACE}/${workspace.id}`}
                >
                  <GalleryVerticalEnd size={16} />
                  <span className="truncate">{workspace.name}</span>
                  {workspace.slug === selectedWorkspace?.slug && (
                    <Check className="ml-auto" />
                  )}
                </Link>
                <WorkspaceSettingsButton
                  onClick={() => {
                    setSettingsWorkspace(workspace);
                    setOpenDropdown(false);
                    setOpenSettingsModal(true);
                  }}
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {settingsWorkspace ? (
          <WorkspaceSettingsModal
            key={settingsWorkspace.id}
            open={openSettingsModal}
            setOpen={setOpenSettingsModal}
            workspaceId={settingsWorkspace.id}
            workspaceName={settingsWorkspace.name}
            role={settingsWorkspace.role}
            slug={settingsWorkspace.slug}
          />
        ) : null}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
