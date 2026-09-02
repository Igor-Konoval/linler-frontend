'use client';

import { Button } from '@/src/components/ui/button';
import { DropdownMenuItem } from '@/src/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { ProjectMemberRole } from '@/src/constants/workspaces.constants';
import { useAddProjectMember } from '@/src/hooks/projects/use-add-project-member';
import { WorkspaceMemberResponse } from '@/src/types/workspaces.types';
import { UserAvatar } from '@/src/components/user-avatar';
import { isRequestFailure } from '@/src/utils/request-failure.utils';
import { useState } from 'react';
import { toast } from 'sonner';

export function AddToProjectItem({
  member,
  projectId,
}: {
  member: WorkspaceMemberResponse;
  projectId: string;
}) {
  const [selectedRole, setSelectedRole] = useState<ProjectMemberRole | null>(
    null,
  );

  const { mutateAsync: addProjectMember, isPending } = useAddProjectMember();

  const handleAddProjectMember = async () => {
    try {
      if (!selectedRole) {
        throw new Error('Role is required');
      }
      await addProjectMember({
        projectId: projectId,
        request: {
          userId: member.userId,
          role: selectedRole,
        },
      });
      toast.success('Member added to project');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      if (isRequestFailure(error)) {
        toast.error(error.message);
      } else {
        toast.error('Failed to add member to project');
      }
    }
  };
  return (
    <DropdownMenuItem
      onClick={(e) => e.preventDefault()}
      className="hover:bg-transparent! hover:cursor-default! flex w-full min-w-0 items-center gap-2"
      key={member.id}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <UserAvatar
          username={member.username}
          avatarUrl={member.avatarUrl}
          size={32}
          className="size-8 shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className="truncate text-sm font-medium"
            title={member.username}
          >
            {member.username}
          </span>
          <span className="truncate text-xs text-gray-500" title={member.email}>
            {member.email}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Select
          value={selectedRole ?? undefined}
          onValueChange={(value) => setSelectedRole(value as ProjectMemberRole)}
        >
          <SelectTrigger disabled={isPending} className="w-fit border-none">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Roles</SelectLabel>
              <SelectItem value={ProjectMemberRole.EDITOR}>Editor</SelectItem>
              <SelectItem value={ProjectMemberRole.VIEWER}>Viewer</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          isLoading={isPending}
          disabled={!selectedRole}
          variant="outline"
          onClick={handleAddProjectMember}
        >
          Add
        </Button>
      </div>
    </DropdownMenuItem>
  );
}
