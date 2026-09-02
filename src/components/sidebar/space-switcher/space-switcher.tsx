'use client';

import { Check, ChevronsUpDown, Eye, GalleryVerticalEnd } from 'lucide-react';
import * as React from 'react';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/src/components/sidebar/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { ROUTES } from '@/src/constants/routes.constants';
import { SelectedWorkspaceState } from '@/src/constants/workspaces.constants';
import { useGetWorkspaces } from '@/src/hooks/workspaces/use-get-workspaces';
import { GetWorkspacesResponse } from '@/src/types/workspaces.types';
import { getWorkspaceRole } from '@/src/utils/workspaces.utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { WorkspaceSettingsModal } from '../../modals/workspace-settings-modal';
import { AppSidebarSkeleton } from './space-switcher-skeleton';
import { WorkspaceSettingsButton } from './workspace-settings-button';

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

    if (workspaceId === undefined) {
      return SelectedWorkspaceState.NOT_SELECTED;
    }

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
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-4 items-center justify-center rounded-lg">
                <Eye />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-none">
                {selectedWorkspace === SelectedWorkspaceState.NOT_SELECTED ? (
                  <span className="text-sm font-medium">
                    Select a workspace
                  </span>
                ) : (
                  <>
                    <span className="mb-1 truncate font-medium">
                      {selectedWorkspace?.name}
                    </span>
                    <span>{getWorkspaceRole(selectedWorkspace?.role)}</span>
                  </>
                )}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {openDropdown && (
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-sidebar-accent-foreground max-h-[250px] overflow-y-auto"
              align="start"
            >
              {workspaces?.workspaces && workspaces?.workspaces.length > 0 ? (
                workspaces?.workspaces.map((workspace) => (
                  <DropdownMenuItem className="py-0" key={workspace.slug}>
                    <div className="h-9.5 flex w-full items-center gap-2">
                      <Link
                        className="flex h-full min-w-0 flex-1 items-center gap-2"
                        href={`${ROUTES.WORKSPACE}/${workspace.id}`}
                        onClick={() => {
                          setOpenDropdown(false);
                        }}
                      >
                        <GalleryVerticalEnd size={16} />
                        <span
                          className="block max-w-[calc(100%-52px)] truncate"
                          style={{ minWidth: 0 }}
                        >
                          {workspace.name}
                        </span>
                        {selectedWorkspace !==
                          SelectedWorkspaceState.NOT_SELECTED &&
                          workspace.slug === selectedWorkspace?.slug && (
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
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-2 text-sm font-medium">
                  No workspaces found
                </div>
              )}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
        {settingsWorkspace ? (
          <WorkspaceSettingsModal
            key={settingsWorkspace.id}
            open={openSettingsModal}
            setOpen={setOpenSettingsModal}
            workspaceId={settingsWorkspace.id}
            workspaceName={settingsWorkspace.name}
            role={settingsWorkspace.role}
          />
        ) : null}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
