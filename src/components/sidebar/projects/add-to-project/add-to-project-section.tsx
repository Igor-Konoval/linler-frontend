'use client';

import { useGetWorkspaceMembers } from '@/src/hooks/workspaces/use-get-workspace-members';
import { Button } from '../../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';
import { AddToProjectItem } from './add-to-project-item';
import type { GetProjectMemberResponse } from '@/src/types/projects.types';
import { useMemo } from 'react';
import { Skeleton } from '@/src/components/ui/skeleton';

interface AddToProjectSectionProps {
  projectId: string;
  workspaceId: string;
  currentMembers: GetProjectMemberResponse[];
  isAdmin: boolean;
}

export function AddToProjectSection({
  projectId,
  workspaceId,
  currentMembers,
  isAdmin,
}: AddToProjectSectionProps) {
  const { data: workspaceMembers, isLoading: isWorkspaceMembersLoading } =
    useGetWorkspaceMembers({
      workspaceId,
    });

  const filteredWorkspaceMembers = useMemo(() => {
    return workspaceMembers?.members.filter(
      (member) => !currentMembers.some((m) => m.userId === member.userId),
    );
  }, [workspaceMembers, currentMembers]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={!isAdmin} asChild>
        <Button variant="outline">Add members from workspace</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[50vh] min-w-0">
        <DropdownMenuGroup className="min-w-0 space-y-1">
          <DropdownMenuLabel>Add members to project</DropdownMenuLabel>
          {isWorkspaceMembersLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="bg-(--skeleton-background) h-11 w-full rounded-md"
              />
            ))
          ) : (
            <>
              {filteredWorkspaceMembers &&
              filteredWorkspaceMembers.length > 0 ? (
                filteredWorkspaceMembers?.map((member) => (
                  <AddToProjectItem
                    key={member.userId}
                    member={member}
                    projectId={projectId}
                  />
                ))
              ) : (
                <DropdownMenuLabel>Empty list</DropdownMenuLabel>
              )}
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
