'use client';

import { useGetProjectMembers } from '@/src/hooks/projects/use-get-project-members';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { Skeleton } from '../../ui/skeleton';
import { AddToProjectSection } from './add-to-project/add-to-project-section';
import { SettingsProjectMembersItem } from './settings-project-members-item';

export function SettingsProjectMembersSection({
  projectId,
  workspaceId,
  isAdmin,
}: {
  projectId: string;
  workspaceId: string;
  isAdmin: boolean;
}) {
  const { data: projectMembers, isPending } = useGetProjectMembers({
    projectId,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          Project Members
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[700px]!">
        <DialogHeader>
          <DialogTitle>Project Members</DialogTitle>
          <DialogDescription>
            You can change the project members.
          </DialogDescription>
        </DialogHeader>

        <AddToProjectSection
          currentMembers={projectMembers?.members ?? []}
          projectId={projectId}
          workspaceId={workspaceId}
          isAdmin={isAdmin}
        />

        <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
          {isPending ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="bg-(--skeleton-background) h-11 w-full rounded-md"
              />
            ))
          ) : projectMembers?.members && projectMembers?.members.length > 0 ? (
            projectMembers?.members.map((member) => (
              <SettingsProjectMembersItem
                key={member.id}
                projectId={projectId}
                workspaceId={workspaceId}
                member={member}
              />
            ))
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-500">No members found</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
