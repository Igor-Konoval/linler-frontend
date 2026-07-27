'use client';

import Image from 'next/image';
import { formatDateTime } from '@/src/utils/date.utils';
import { GetProjectMemberResponse } from '@/src/types/projects.types';
import { useGetWorkspaceRole } from '@/src/hooks/use-get-workspace-role';
import {
  getProjectMemberRole,
  isWorkspaceAdmin,
} from '@/src/utils/workspaces.utils';
import { useEditProjectMember } from '@/src/hooks/projects/use-edit-project-member';
import { useState } from 'react';
import { ProjectMemberRole } from '@/src/constants/workspaces.constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { isRequestFailure } from '@/src/utils/request-failure.utils';
import { useRemoveProjectMember } from '@/src/hooks/projects/use-remove-project-member';
import { ArrowRightToLine, CheckIcon } from 'lucide-react';
import { ConfirmationDialog } from '../../ui/confirmation-dialog';

export function SettingsProjectMembersItem({
  projectId,
  workspaceId,
  member,
}: {
  projectId: string;
  workspaceId: string;
  member: GetProjectMemberResponse;
}) {
  const [selectedRole, setSelectedRole] = useState<ProjectMemberRole | null>(
    null,
  );

  const { mutateAsync: editProjectMember, isPending: isEditingProjectMember } =
    useEditProjectMember();
  const {
    mutateAsync: removeProjectMember,
    isPending: isRemovingProjectMember,
  } = useRemoveProjectMember();

  const workspaceRole = useGetWorkspaceRole(workspaceId);
  const isAdmin = isWorkspaceAdmin(workspaceRole);

  const handleRemoveProjectMember = async () => {
    try {
      await removeProjectMember({ projectId, userId: member.userId });
      toast.success('Member removed');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      if (isRequestFailure(error)) {
        toast.error(error.message);
      } else {
        toast.error('Failed to remove member');
      }
    }
  };

  const handleEditProjectMember = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }
    try {
      await editProjectMember({
        projectId,
        userId: member.userId,
        request: { role: selectedRole },
      });
      toast.success('Project member edited successfully');
      setSelectedRole(null);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      if (isRequestFailure(error)) {
        toast.error(error.message);
      } else {
        toast.error('Failed to edit project member');
      }
    }
  };

  return (
    <>
      <div key={member.id} className="flex items-center gap-2">
        {member.avatarUrl ? (
          <Image
            src={member.avatarUrl}
            alt={member.username}
            width={56}
            height={56}
            className="max-[456px]:min-h-8! max-[456px]:min-w-8! min-[456px]:min-h-14! min-[456px]:min-w-14! rounded-full object-cover"
          />
        ) : (
          <div className="max-[456px]:min-h-8! max-[456px]:min-w-8! min-[456px]:min-h-14! min-[456px]:min-w-14! rounded-full bg-gray-200 object-cover" />
        )}
        <div className="overflow-auto truncate">
          <p className="text-sm font-medium">{member.username}</p>
          <p className="text-sm text-gray-500">{member.email}</p>
          <p className="text-sm text-gray-500">
            {getProjectMemberRole(member.role)}
          </p>
          <p className="text-sm text-gray-500">
            {formatDateTime(member.createdAt)}
          </p>
        </div>
        <div className="mb-auto ml-auto mr-1 flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            {isAdmin &&
              selectedRole !== null &&
              selectedRole !== member.role && (
                <Button
                  variant="outline"
                  isLoading={isEditingProjectMember}
                  onClick={() => handleEditProjectMember()}
                  size="icon-xs"
                  title="Apply changes"
                >
                  <CheckIcon className="size-3" />
                </Button>
              )}
            {isAdmin && member.role !== ProjectMemberRole.OWNER && (
              <ConfirmationDialog
                title="Remove member"
                description="Are you sure you want to remove this member from the project? This action cannot be undone."
                onConfirm={() => handleRemoveProjectMember()}
                trigger={
                  <Button
                    variant="destructive"
                    isLoading={isRemovingProjectMember}
                    size="icon-xs"
                    title="Remove member"
                  >
                    <ArrowRightToLine className="size-3" />
                  </Button>
                }
              />
            )}
          </div>
          {member.role !== ProjectMemberRole.OWNER && isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {selectedRole
                    ? getProjectMemberRole(selectedRole)
                    : 'Change role'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => setSelectedRole(ProjectMemberRole.VIEWER)}
                >
                  {getProjectMemberRole(ProjectMemberRole.VIEWER)}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedRole(ProjectMemberRole.EDITOR)}
                >
                  {getProjectMemberRole(ProjectMemberRole.EDITOR)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </>
  );
}
